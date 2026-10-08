import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { MANAGER, typeById } from '../lib/constants';
import { analyseRequest, coverageAlerts, dayStatus, minOnDuty, onLeaveToday, personName, teamSize } from '../lib/calc';
import { DAYS_LONG, TODAY, addDays, fmtDM, fmtDMY, fmtRange, rangeDates, startOfWeek } from '../lib/dates';
import { PageTitle, StatCard } from '../components/ui';
import Assistant from '../components/Assistant';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
}

export default function Home() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [weekStart, setWeekStart] = useState(startOfWeek(TODAY));

  const pending = useMemo(() => state.requests.filter((r) => r.status === 'pending' && r.employeeId !== MANAGER.id).sort((a, b) => a.start.localeCompare(b.start)), [state.requests]);
  const today = onLeaveToday(state);
  const alerts = coverageAlerts(state);
  const week = rangeDates(weekStart, addDays(weekStart, 4)).map((d) => dayStatus(state, d));
  const visiblePending = pending.slice(0, 4);

  return (
    <div className="page home">
      <PageTitle>Home</PageTitle>

      <div className="grid-3 home-operational-stats">
        <StatCard label="Pending approvals" onClick={() => nav('/approvals')}>
          {pending.length}
        </StatCard>
        <StatCard label="On leave today" onClick={() => nav('/calendar')}>
          {today.length}
        </StatCard>
        <StatCard label="Coverage alerts" onClick={() => nav('/calendar')} tone={alerts.length ? 'alert' : ''}>
          {alerts.length}
        </StatCard>
      </div>

      <h2 className="greeting">
        {greeting()}, {MANAGER.first}
      </h2>
      <Assistant />

      <div className="home-cols">
        <section className="glass card">
          <div className="card-head">
            <h3>Requests awaiting approval</h3>
          </div>
          {pending.length === 0 ? (
            <div className="empty">All caught up. No requests are waiting.</div>
          ) : (
            <div className="table-wrap queue-table-wrap">
              <table className="mini-table approval-queue-table">
                <colgroup>
                  <col className="queue-employee" />
                  <col className="queue-type" />
                  <col className="queue-dates" />
                  <col className="queue-impact" />
                  <col className="queue-actions" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Leave dates requested</th>
                    <th>Impact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePending.map((r) => {
                    const impact = analyseRequest(state, r).impact;
                    return (
                      <tr key={r.id}>
                        <td>{personName(state, r.employeeId)}</td>
                        <td>{typeById(r.typeId).short}</td>
                        <td>
                          <span
                            className="requested-dates"
                            tabIndex={0}
                            aria-label={`Requested dates: ${r.dates.map(fmtDMY).join(', ')}`}
                          >
                            {fmtRange(r.start, r.end)}
                            <span className="requested-dates-tooltip" role="tooltip">
                              <strong>All requested dates</strong>
                              <span className="requested-date-list">
                                {r.dates.map((date) => <i key={date}>{fmtDMY(date)}</i>)}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td><span className={`home-impact impact-${impact.toLowerCase()}`}>{impact}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn xs" onClick={() => nav(`/approvals?id=${r.id}`)}>
                              Review
                            </button>
                            <button className="btn xs reject" onClick={() => actions.requestReject(r.id)}>
                              Reject
                            </button>
                            <button className="btn xs approve" onClick={() => actions.requestApprove(r.id)}>
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {pending.length > 4 && (
            <div className="approval-preview-more">
              <button className="btn" onClick={() => nav('/approvals')}>
                View {pending.length - 4} more {pending.length - 4 === 1 ? 'request' : 'requests'}
              </button>
            </div>
          )}
        </section>

        <section className="glass card">
          <div className="card-head">
            <h3>{weekStart === startOfWeek(TODAY) ? 'This week at a glance' : `Week of ${fmtDM(weekStart)}`}</h3>
            <div className="week-nav">
              <button className="icon-btn" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
                <ChevronLeft size={16} />
              </button>
              <button className="icon-btn" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <ul className="glance">
            {week.map((d) => (
              <li key={d.date}>
                <button className={`glance-row tone-${d.tone} ${d.date === TODAY ? 'is-today' : ''}`} onClick={() => nav('/calendar')}>
                  <span>
                    {DAYS_LONG[(new Date(d.date + 'T12:00:00').getDay() + 6) % 7].slice(0, 3)} — {d.count} {d.count === 1 ? 'person' : 'people'} off • {d.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="fineprint">
            Minimum {minOnDuty(state)} of {teamSize(state)} on duty - maximum {state.settings.maxOff} off at once
          </p>
        </section>
      </div>
    </div>
  );
}
