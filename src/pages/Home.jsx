import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { MANAGER, typeById } from '../lib/constants';
import { balanceOf, coverageAlerts, dayStatus, minOnDuty, onLeaveToday, personName, teamSize } from '../lib/calc';
import { DAYS_LONG, TODAY, addDays, fmtDM, fmtDatesLong, rangeDates, startOfWeek } from '../lib/dates';
import { Of, PageTitle, StatCard } from '../components/ui';
import Assistant from '../components/Assistant';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
}

export default function Home() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [weekStart, setWeekStart] = useState(startOfWeek(TODAY));

  const annual = balanceOf(state, MANAGER.id, 'annual');
  const sick = balanceOf(state, MANAGER.id, 'sick');
  const mine = state.requests.filter((r) => r.employeeId === MANAGER.id);
  const upcoming = mine.filter((r) => (r.status === 'approved' || r.status === 'pending') && r.end >= TODAY).sort((a, b) => a.start.localeCompare(b.start))[0];
  const myPending = mine.filter((r) => r.status === 'pending').length;

  const pending = useMemo(() => state.requests.filter((r) => r.status === 'pending' && r.employeeId !== MANAGER.id).sort((a, b) => a.start.localeCompare(b.start)), [state.requests]);
  const today = onLeaveToday(state);
  const alerts = coverageAlerts(state);
  const week = rangeDates(weekStart, addDays(weekStart, 4)).map((d) => dayStatus(state, d));

  return (
    <div className="page home">
      <PageTitle>Home</PageTitle>

      <div className="grid-4">
        <StatCard label="Remaining annual leave">
          <Of left={annual.left} total={annual.entitlement} />
        </StatCard>
        <StatCard label="Remaining sick leave">
          <Of left={sick.left} total={sick.entitlement} />
        </StatCard>
        <StatCard label="Upcoming leave(s)" onClick={upcoming ? () => nav(`/request/${upcoming.id}`) : () => nav('/apply')}>
          {upcoming ? fmtDatesLong(upcoming.dates) : 'None booked'}
        </StatCard>
        <StatCard label="My leave pending approval" onClick={() => nav('/history')}>
          {myPending}
        </StatCard>
      </div>

      <h2 className="greeting">
        {greeting()}, {MANAGER.first}
      </h2>
      <Assistant />

      <div className="grid-3">
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

      <div className="home-cols">
        <section className="glass card">
          <div className="card-head">
            <h3>Requests awaiting approval</h3>
            <button className="btn" onClick={() => nav('/approvals')}>
              Review Approval
            </button>
          </div>
          {pending.length === 0 ? (
            <div className="empty">All caught up. No requests are waiting.</div>
          ) : (
            <div className="table-wrap">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id}>
                      <td>{personName(state, r.employeeId)}</td>
                      <td>{typeById(r.typeId).short}</td>
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
                  ))}
                </tbody>
              </table>
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
