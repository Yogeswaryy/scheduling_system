import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, Minus, Plus, Star, UserRound, UsersRound } from 'lucide-react';
import { MANAGER, DEPT_SHORT, typeById } from '../lib/constants';
import { firstName, personName, personOf } from '../lib/calc';
import { DAYS_SHORT, TODAY, addDays, addMonths, dayNum, diffDays, dow, fmtDM, fmtDMY, fmtDatesLong, fmtMonthYear, monthIdx, rangeDates, startOfWeek, year } from '../lib/dates';
import { useStore } from '../store/StoreContext';
import { MonthGrid, MonthNav } from '../components/Calendars';
import { Confirm, Modal, PageTitle, StatusPill, useTabScrub } from '../components/ui';
import { LEAVE_TYPES } from '../lib/constants';

const clampZoom = (value) => Math.max(70, Math.min(130, value));

export default function Calendar() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [view, setView] = useState('month');
  const [anchor, setAnchor] = useState(TODAY);
  const [sel, setSel] = useState(null); // request modal
  const [dayList, setDayList] = useState(null); // "+N more" modal
  const [zoom, setZoom] = useState(100);
  const [calendarMode, setCalendarMode] = useState('work');
  const [peopleView, setPeopleView] = useState('direct');
  const [pendingMove, setPendingMove] = useState(null);
  const calendarModeScrub = useTabScrub(setCalendarMode);
  const peopleViewScrub = useTabScrub(setPeopleView);
  const calendarViewScrub = useTabScrub(setView);

  const favoriteIds = state.settings.calendarFavorites || ['e1', 'e2', 'e3'];
  const privacy = state.settings.leavePrivacy || 'namesAndType';
  const showNames = privacy === 'names' || privacy === 'namesAndType';
  const showTypes = privacy === 'namesAndType';
  const directIds = state.employees.map((e) => e.id);

  const leaveLabel = (request, includeName = true) => {
    if (request.employeeId === MANAGER.id || calendarMode === 'personal') return typeById(request.typeId).short;
    if (privacy === 'hidden') return 'Unavailable';
    if (privacy === 'countOnly') return '1 person off';
    if (privacy === 'names') return includeName ? firstName(state, request.employeeId) : 'Leave';
    return includeName ? `${firstName(state, request.employeeId)} - ${typeById(request.typeId).short}` : typeById(request.typeId).short;
  };

  const scopeIds = useMemo(() => {
    if (calendarMode === 'personal') return [MANAGER.id];
    if (peopleView === 'favorites') return Array.from(new Set([...favoriteIds, MANAGER.id]));
    return Array.from(new Set([...directIds, MANAGER.id]));
  }, [calendarMode, peopleView, favoriteIds, directIds]);

  const live = useMemo(
    () => state.requests.filter((r) => (r.status === 'approved' || r.status === 'pending') && scopeIds.includes(r.employeeId)),
    [state.requests, scopeIds]
  );
  const byDate = useMemo(() => {
    const m = {};
    live.forEach((r) => r.dates.forEach((d) => (m[d] = m[d] || []).push(r)));
    return m;
  }, [live]);
  const holidays = useMemo(() => Object.fromEntries(state.holidays.map((h) => [h.date, h])), [state.holidays]);

  const weekStart = startOfWeek(anchor);
  const weekDays = rangeDates(weekStart, addDays(weekStart, 6));
  const y = year(anchor);
  const m = monthIdx(anchor);

  const step = (n) => setAnchor(view === 'day' ? addDays(anchor, 7 * n) : addMonths(anchor, n));
  const allPeople = [...state.employees.map((e) => ({ id: e.id, name: e.name, dept: DEPT_SHORT[e.dept] })), { id: MANAGER.id, name: MANAGER.name, dept: 'Manager' }];
  const people = allPeople.filter((p) => scopeIds.includes(p.id));

  const toggleFavorite = (employeeId) => {
    const next = favoriteIds.includes(employeeId) ? favoriteIds.filter((id) => id !== employeeId) : [...favoriteIds, employeeId];
    actions.saveSettings({ calendarFavorites: next });
  };

  const beginDrag = (e, requestId, originDate) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ requestId, originDate }));
  };

  const prepareDrop = (e, targetDate) => {
    e.preventDefault();
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      return;
    }
    if (!payload?.requestId || !payload?.originDate || payload.originDate === targetDate) return;
    const req = state.requests.find((r) => r.id === payload.requestId);
    if (!req) return;
    const shift = diffDays(payload.originDate, targetDate);
    const nextStart = addDays(req.start, shift);
    const nextEnd = addDays(req.end, shift);
    setPendingMove({ req, nextStart, nextEnd, shift });
  };

  const chip = (r, label, originDate) => {
    const t = typeById(r.typeId);
    return (
      <button
        key={r.id + label + originDate}
        className={`lchip ${r.status}`}
        style={{ '--c': t.color, '--bg': t.bg }}
        onClick={() => setSel(r)}
        title={r.employeeId === MANAGER.id || showNames ? `${showNames ? personName(state, r.employeeId) : 'Your leave'}${showTypes || r.employeeId === MANAGER.id ? ` · ${t.name}` : ''} (${r.status})` : `Leave (${r.status})`}
        draggable
        onDragStart={(e) => beginDrag(e, r.id, originDate)}
      >
        <i />
        {label}
      </button>
    );
  };

  const filterControls = (
    <div className="calendar-extra-controls">
      <div
        className="calendar-toggle glass scrub-tabs"
        role="tablist"
        aria-label="Calendar mode"
        {...calendarModeScrub}
      >
        <button role="tab" aria-selected={calendarMode === 'work'} data-scrub-value="work" className={calendarMode === 'work' ? 'on' : ''} onClick={() => setCalendarMode('work')}>
          <BriefcaseBusiness size={15} /> Work
        </button>
        <button role="tab" aria-selected={calendarMode === 'personal'} data-scrub-value="personal" className={calendarMode === 'personal' ? 'on' : ''} onClick={() => setCalendarMode('personal')}>
          <UserRound size={15} /> Personal
        </button>
      </div>

      <div
        className={`calendar-scope glass scrub-tabs ${calendarMode === 'personal' ? 'disabled' : ''}`}
        role="tablist"
        aria-label="People view"
        {...peopleViewScrub}
      >
        <button role="tab" aria-selected={peopleView === 'favorites'} data-scrub-value="favorites" className={peopleView === 'favorites' ? 'on' : ''} onClick={() => setPeopleView('favorites')} disabled={calendarMode === 'personal'}>
          <Star size={15} /> Favorites
        </button>
        <button role="tab" aria-selected={peopleView === 'direct'} data-scrub-value="direct" className={peopleView === 'direct' ? 'on' : ''} onClick={() => setPeopleView('direct')} disabled={calendarMode === 'personal'}>
          <UsersRound size={15} /> Direct Team
        </button>
      </div>

      <div className="calendar-zoom glass" aria-label="Calendar zoom controls">
        <button aria-label="Zoom out" onClick={() => setZoom((z) => clampZoom(z - 10))} disabled={zoom <= 70}>
          <Minus size={16} />
        </button>
        <span>{zoom}%</span>
        <button aria-label="Zoom in" onClick={() => setZoom((z) => clampZoom(z + 10))} disabled={zoom >= 130}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="page calendar">
      <PageTitle searchPlaceholder="Ask who is off, check a date, or find leave conflicts…">Team Leave Calendar</PageTitle>

      <div className="cal-toolbar">
        <div>
          <div className="seg scrub-tabs" role="tablist" aria-label="Calendar view" {...calendarViewScrub}>
            <button role="tab" aria-selected={view === 'day'} data-scrub-value="day" className={view === 'day' ? 'on' : ''} onClick={() => setView('day')}>
              Day
            </button>
            <button role="tab" aria-selected={view === 'month'} data-scrub-value="month" className={view === 'month' ? 'on' : ''} onClick={() => setView('month')}>
              Month
            </button>
          </div>
          <MonthNav
            label={view === 'month' ? fmtMonthYear(anchor) : `${fmtDM(weekDays[0])} – ${fmtDMY(weekDays[6])}`}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onToday={() => setAnchor(TODAY)}
          />
        </div>
        <div className="cal-actions">
          <button className="btn" onClick={() => nav('/history')}>
            View My Leave History
          </button>
          <button className="btn" onClick={() => nav('/apply')}>
            + Apply Leave
          </button>
        </div>
      </div>

      {filterControls}

      <div className="legend">
        {LEAVE_TYPES.map((t) => (
          <span key={t.id}>
            <i style={{ background: t.color }} />
            {t.chip}
          </span>
        ))}
        <span>
          <i className="dash" />
          Pending
        </span>
        <span>
          <i style={{ background: '#f472b6' }} />
          Public holiday
        </span>
      </div>

      <div className="calendar-zoom-wrap">
        <div className="calendar-zoom-surface" style={{ zoom: zoom / 100 }}>
          {view === 'day' ? (
            <div className="glass week-table" role="table" aria-label="Week view">
              <div className="wk-row wk-head" role="row">
                <div className="wk-name">Employee</div>
                {weekDays.map((d) => (
                  <div key={d} className={`wk-day ${d === TODAY ? 'today' : ''}`}>
                    {DAYS_SHORT[dow(d)]} <span className="wk-day-num">{dayNum(d)}</span>
                  </div>
                ))}
              </div>
              {people.map((p) => (
                <div className="wk-row" role="row" key={p.id}>
                  <div className="wk-name">
                    <div className="wk-person-line">
                      <strong>{p.name}</strong>
                      {p.id !== MANAGER.id && (
                        <button
                          className={`favorite-btn ${favoriteIds.includes(p.id) ? 'on' : ''}`}
                          onClick={() => toggleFavorite(p.id)}
                          aria-label={favoriteIds.includes(p.id) ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
                          title={favoriteIds.includes(p.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star size={14} fill={favoriteIds.includes(p.id) ? 'currentColor' : 'none'} />
                        </button>
                      )}
                    </div>
                    <span>{p.dept}</span>
                  </div>
                  {weekDays.map((d) => {
                    const rs = (byDate[d] || []).filter((r) => r.employeeId === p.id);
                    const h = holidays[d];
                    return (
                      <div
                        key={d}
                        className={`wk-cell ${d === TODAY ? 'today' : ''} ${h ? 'holiday' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => prepareDrop(e, d)}
                      >
                        {h && p.id === people[0]?.id ? <span className="hol-tag">{h.name}</span> : null}
                        {rs.map((r) => {
                          const t = typeById(r.typeId);
                          return (
                            <button
                              key={r.id}
                              className={`pillchip ${r.status}`}
                              style={{ '--c': t.color, '--bg': t.bg }}
                              onClick={() => setSel(r)}
                              draggable
                              onDragStart={(e) => beginDrag(e, r.id, d)}
                              title="Drag to move this leave request"
                            >
                              {r.status === 'pending' ? 'Pending' : leaveLabel(r, false)}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
              {!people.length && <div className="calendar-empty">No favorite employees yet. Open Direct Team and use the star beside an employee name.</div>}
            </div>
          ) : (
            <div className="glass month-card">
              <MonthGrid
                y={y}
                m={m}
                className="big"
                cellProps={(d) => ({
                  onDragOver: (e) => e.preventDefault(),
                  onDrop: (e) => prepareDrop(e, d),
                })}
                renderCell={(d, inMonth) => {
                  const rs = (byDate[d] || []).slice().sort((a, b) => a.employeeId.localeCompare(b.employeeId));
                  const h = holidays[d];
                  const shown = rs.slice(0, h ? 2 : 3);
                  const more = rs.length - shown.length;
                  return (
                    <>
                      <span className="mg-num">{dayNum(d)}</span>
                      {h && (
                        <div className="hol-block">
                          <strong>{h.name}</strong>
                          <span>({h.note})</span>
                        </div>
                      )}
                      {inMonth && shown.map((r) => chip(r, leaveLabel(r), d))}
                      {inMonth && more > 0 && (
                        <button className="more-btn" onClick={() => setDayList(d)}>
                          +{more} more
                        </button>
                      )}
                    </>
                  );
                }}
              />
              {!live.length && calendarMode === 'work' && peopleView === 'favorites' && (
                <div className="calendar-empty month-empty">No favorite employees yet. Switch to Day view, open Direct Team, and use the star beside an employee name.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {sel && (
        <Modal
          title="Leave details"
          onClose={() => setSel(null)}
          width={460}
          actions={
            <>
              {sel.status === 'pending' && sel.employeeId !== MANAGER.id && (
                <button className="btn" onClick={() => nav(`/approvals?id=${sel.id}`)}>
                  Review
                </button>
              )}
              <button className="btn" onClick={() => nav(`/request/${sel.id}`)}>
                View details
              </button>
            </>
          }
        >
          <dl className="detail-list compact">
            <dt>Employee</dt>
            <dd>
              {sel.employeeId === MANAGER.id || showNames ? `${personName(state, sel.employeeId)} · ${personOf(state, sel.employeeId)?.dept}` : privacy === 'countOnly' ? '1 employee' : 'Hidden by organisation policy'}
            </dd>
            <dt>Type</dt>
            <dd>{sel.employeeId === MANAGER.id || showTypes ? typeById(sel.typeId).name : 'Hidden by organisation policy'}</dd>
            <dt>Dates</dt>
            <dd>{fmtDatesLong(sel.dates)}</dd>
            <dt>Status</dt>
            <dd>
              <StatusPill request={sel} />
            </dd>
          </dl>
        </Modal>
      )}

      {dayList && (
        <Modal title={fmtDMY(dayList)} onClose={() => setDayList(null)} width={420}>
          <ul className="plain-list">
            {(byDate[dayList] || []).map((r) => (
              <li key={r.id}>
                <button
                  className="link-btn"
                  onClick={() => {
                    setDayList(null);
                    setSel(r);
                  }}
                >
                  {leaveLabel(r)}
                  {r.status === 'pending' ? ' (pending)' : ''}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {pendingMove && (
        <Confirm
          title="Move leave request?"
          confirmLabel="Move request"
          cancelLabel="Keep current dates"
          onClose={() => setPendingMove(null)}
          onConfirm={() => actions.reschedule(pendingMove.req.id, pendingMove.nextStart, pendingMove.nextEnd)}
        >
          <p className="modal-note">Confirm the new calendar dates before saving this drag-and-drop change.</p>
          <dl className="detail-list compact drag-confirm-list">
            <dt>Employee</dt>
            <dd>{personName(state, pendingMove.req.employeeId)}</dd>
            <dt>Current</dt>
            <dd>{fmtDatesLong(pendingMove.req.dates)}</dd>
            <dt>New</dt>
            <dd>{pendingMove.nextStart === pendingMove.nextEnd ? fmtDMY(pendingMove.nextStart) : `${fmtDMY(pendingMove.nextStart)} – ${fmtDMY(pendingMove.nextEnd)}`}</dd>
          </dl>
        </Confirm>
      )}
    </div>
  );
}
