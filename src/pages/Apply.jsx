import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Upload, X } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { MANAGER, typeById } from '../lib/constants';
import { balanceOf, leaveDates, personName } from '../lib/calc';
import { TODAY, addMonths, dayNum, firstOfMonth, fmtDMY, fmtDatesLong, fmtMonthYear, fromInput, monthIdx, toInput, year } from '../lib/dates';
import { MonthGrid, MonthNav, RangePicker } from '../components/Calendars';
import { Confirm, Of, PageTitle, Select, StatCard } from '../components/ui';

export default function Apply() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [typeId, setTypeId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startTxt, setStartTxt] = useState('');
  const [endTxt, setEndTxt] = useState('');
  const [file, setFile] = useState(null);
  const [tried, setTried] = useState(false);
  const [month, setMonth] = useState(firstOfMonth(year(TODAY), monthIdx(TODAY)));
  const [picker, setPicker] = useState(null); // 'start' | 'end' | null
  const [pickMonth, setPickMonth] = useState(month);
  const [leaving, setLeaving] = useState(false);
  const drag = useRef(null);
  const fileRef = useRef(null);

  const type = typeId ? typeById(typeId) : null;
  const dates = useMemo(() => leaveDates(start, end, type || typeById('annual'), state.holidays), [start, end, type, state.holidays]);
  const annual = balanceOf(state, MANAGER.id, 'annual');
  const sick = balanceOf(state, MANAGER.id, 'sick');
  const mine = state.requests.filter((r) => r.employeeId === MANAGER.id);
  const upcoming = mine.filter((r) => (r.status === 'approved' || r.status === 'pending') && r.end >= TODAY).sort((a, b) => a.start.localeCompare(b.start))[0];
  const pendingCount = mine.filter((r) => r.status === 'pending').length;

  const live = state.requests.filter((r) => r.status === 'approved' || r.status === 'pending');
  const byDate = useMemo(() => {
    const m = {};
    live.forEach((r) => r.dates.forEach((d) => (m[d] = m[d] || []).push(r)));
    return m;
  }, [live]);
  const holidays = Object.fromEntries(state.holidays.map((h) => [h.date, h]));

  const setRange = (a, b) => {
    const [s, e] = a <= b ? [a, b] : [b, a];
    setStart(s);
    setEnd(e);
    setStartTxt(toInput(s));
    setEndTxt(toInput(e));
  };

  useEffect(() => {
    const up = () => (drag.current = null);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  /* ---------- validation ---------- */
  const errors = [];
  if (!typeId) errors.push('Choose a leave type.');
  if (!start || !end) errors.push('Pick a start and end date.');
  else {
    if (end < start) errors.push('End date cannot be before the start date.');
    else if (dates.length === 0) errors.push('The selected dates are all weekends or public holidays.');
    if (type && !type.backdate && start < TODAY) errors.push(`${type.name} cannot start in the past.`);
    const clash = mine.find((r) => (r.status === 'approved' || r.status === 'pending') && r.dates.some((d) => dates.includes(d)));
    if (clash) errors.push(`Overlaps your existing leave (${fmtDatesLong(clash.dates)}).`);
    if (type && type.balanceKey) {
      const left = type.balanceKey === 'annual' ? annual.left : sick.left;
      if (dates.length > left) errors.push(`Only ${left} ${type.balanceKey} day(s) left, but ${dates.length} requested.`);
    }
  }
  if (type && type.requiresAttachment && !file) errors.push(`${type.name} needs an attachment (e.g. medical certificate).`);

  const dirty = !!(typeId || start || end || file);
  const submit = () => {
    setTried(true);
    if (errors.length) return;
    const req = actions.submit({ typeId, start, end, attachment: file });
    actions.toast('Leave request submitted');
    nav(`/request/${req.id}`);
  };

  const onText = (which, txt) => {
    if (which === 'start') setStartTxt(txt);
    else setEndTxt(txt);
    const iso = fromInput(txt);
    if (iso) {
      if (which === 'start') {
        setStart(iso);
        if (end && end < iso) {
          setEnd('');
          setEndTxt('');
        }
      } else setEnd(iso);
    } else if (!txt) {
      if (which === 'start') setStart('');
      else setEnd('');
    }
  };

  const pickDate = (d) => {
    if (picker === 'end' && start && d >= start) {
      setRange(start, d);
      setPicker(null);
    } else {
      // choosing a (new) start date; the end date is picked next
      setStart(d);
      setStartTxt(toInput(d));
      setEnd('');
      setEndTxt('');
      setPicker('end');
    }
  };

  const names = (rs) => rs.map((r) => personName(state, r.employeeId));

  return (
    <div className="page apply">
      <PageTitle searchPlaceholder="Ask about leave balance, date conflicts or leave policy…">Apply for Leave</PageTitle>
      <div className="grid-4">
        <StatCard label="Remaining annual leave">
          <Of left={annual.left} total={annual.entitlement} />
        </StatCard>
        <StatCard label="Remaining sick leave">
          <Of left={sick.left} total={sick.entitlement} />
        </StatCard>
        <StatCard label="Upcoming leave(s)">{upcoming ? fmtDatesLong(upcoming.dates) : 'None booked'}</StatCard>
        <StatCard label="Pending approval">{pendingCount}</StatCard>
      </div>

      <div className="apply-grid">
        <section className="glass cal-panel">
          <div className="selected-box">
            <span>Selected Leave</span>
            <strong>
              {dates.length} {dates.length === 1 ? 'Day' : 'Days'}
            </strong>
            <small>{start && end ? (start === end ? fmtDMY(start) : `${fmtDMY(start)} - ${fmtDMY(end)}`) : 'Drag on the calendar'}</small>
          </div>
          <MonthNav label={fmtMonthYear(month)} onPrev={() => setMonth(addMonths(month, -1))} onNext={() => setMonth(addMonths(month, 1))} onToday={() => setMonth(firstOfMonth(year(TODAY), monthIdx(TODAY)))} />
          <MonthGrid
            y={year(month)}
            m={monthIdx(month)}
            className="apply-grid-cal"
            cellProps={(d) => ({
              onMouseDown: (e) => {
                e.preventDefault();
                drag.current = d;
                setRange(d, d);
              },
              onMouseEnter: () => drag.current && setRange(drag.current, d),
            })}
            renderCell={(d, inMonth) => {
              const rs = byDate[d] || [];
              const own = rs.filter((r) => r.employeeId === MANAGER.id);
              const others = rs.filter((r) => r.employeeId !== MANAGER.id);
              const h = holidays[d];
              const selected = start && end && d >= start && d <= end;
              return (
                <div className={`ap-cell ${selected ? 'selected' : ''} ${d < TODAY ? 'past' : ''}`}>
                  <span className={`ap-num ${d === TODAY ? 'tod' : ''}`}>{dayNum(d)}</span>
                  {inMonth && own.map((r) => <em key={r.id} className="own-chip">{typeById(r.typeId).name.replace(' Leave', ' Leave')}</em>)}
                  {inMonth && h && <em className="hol-chip">{h.name}</em>}
                  {inMonth && others.length > 0 && (
                    <span className="off-bar" tabIndex={0}>
                      {others.length}
                      <span className="tip">{state.settings.showNamesOnHover ? names(others).join('\n') : `${others.length} off`}</span>
                    </span>
                  )}
                </div>
              );
            }}
          />
          <p className="fineprint">Click and drag across dates to select a range. Weekends and public holidays are not counted.</p>
        </section>

        <section className="apply-form">
          <div className="form-row">
            <span>
              Leave Type <b className="req">*</b>
            </span>
            <Select
              value={typeId}
              onChange={setTypeId}
              ariaLabel="Leave type"
              className="field-select"
              options={[
                { value: '', label: 'Select Leave Type' },
                ...state.leaveTypes.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>

          {['start', 'end'].map((w) => (
            <div className="form-row" key={w}>
              <span>
                {w === 'start' ? 'Start Date' : 'End Date'} <b className="req">*</b>
              </span>
              <div className="date-field">
                <input className="field" placeholder="dd/mm/yyyy" value={w === 'start' ? startTxt : endTxt} onChange={(e) => onText(w, e.target.value)} />
                <button
                  type="button"
                  data-picker-trigger
                  className="date-btn"
                  aria-label={`Pick ${w} date`}
                  onClick={() => {
                    setPicker(picker === w ? null : w);
                    setPickMonth(firstOfMonth(year(start || TODAY), monthIdx(start || TODAY)));
                  }}
                >
                  <CalendarDays size={18} />
                </button>
                {picker === w && (
                  <RangePicker
                    y={year(pickMonth)}
                    m={monthIdx(pickMonth)}
                    start={start}
                    end={end}
                    onPick={pickDate}
                    onNav={(n) => setPickMonth(addMonths(pickMonth, n))}
                    onClose={() => setPicker(null)}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="form-row">
            <span>Attachment {type?.requiresAttachment ? <b className="req">*</b> : '(if required)'}</span>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={(e) => setFile(e.target.files?.[0]?.name || null)} />
            <div className="upload-row">
              <button type="button" className="btn light" onClick={() => fileRef.current?.click()}>
                <Upload size={16} /> Upload File
              </button>
              {file && (
                <span className="file-tag">
                  {file}
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} aria-label="Remove file">
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          </div>

          {type && type.balanceKey && dates.length > 0 && (
            <p className="fineprint">
              Balance after this request: {(type.balanceKey === 'annual' ? annual.left : sick.left) - dates.length} {type.balanceKey} day(s) (deducted once approved).
            </p>
          )}
          {tried && errors.length > 0 && (
            <ul className="form-errors" role="alert">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          <div className="form-actions">
            <button className="btn" onClick={() => (dirty ? setLeaving(true) : nav('/calendar'))}>
              Cancel
            </button>
            <button className="btn primary-dark" onClick={submit}>
              Submit Request
            </button>
          </div>
        </section>
      </div>

      {leaving && (
        <Confirm title="Discard this request?" confirmLabel="Discard" cancelLabel="Keep editing" danger onClose={() => setLeaving(false)} onConfirm={() => nav('/calendar')}>
          Your selections will be lost.
        </Confirm>
      )}
    </div>
  );
}
