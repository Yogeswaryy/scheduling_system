import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { ENTITLEMENT, typeById } from '../lib/constants';
import { balanceOf, displayStatus, nextLeaveOf, onLeaveToday, STATUS_LABEL } from '../lib/calc';
import { TODAY, fmtDatesLong, fmtDMY } from '../lib/dates';
import { Modal, PageTitle, Select, StatCard } from '../components/ui';
import { CalendarDays } from 'lucide-react';

const RANGES = [
  { id: 'h1', label: '01 Jan 2026 - 30 Jun 2026', from: '2026-01-01', to: '2026-06-30' },
  { id: 'h2', label: '01 Jul 2026 - 31 Dec 2026', from: '2026-07-01', to: '2026-12-31' },
  { id: 'fy', label: '01 Jan 2026 - 31 Dec 2026', from: '2026-01-01', to: '2026-12-31' },
];

export default function Team() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [rangeId, setRangeId] = useState('h1');
  const [emp, setEmp] = useState(null);
  const range = RANGES.find((r) => r.id === rangeId);
  const today = onLeaveToday(state);
  const todayIds = new Set(today.map((e) => e.id));

  const rows = useMemo(
    () =>
      state.employees.map((e) => {
        const b = balanceOf(state, e.id, 'annual');
        return { e, b, next: nextLeaveOf(state, e.id) };
      }),
    [state]
  );

  const inRange = (r) => r.start <= range.to && r.end >= range.from;

  const exportReport = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [['Employee', 'Employee ID', 'Department', 'Leave type', 'Start', 'End', 'Days', 'Status', 'Annual leave left'].map(esc).join(',')];
    state.employees.forEach((e) => {
      const left = balanceOf(state, e.id, 'annual').left;
      state.requests
        .filter((r) => r.employeeId === e.id && inRange(r))
        .sort((a, b) => a.start.localeCompare(b.start))
        .forEach((r) => lines.push([e.name, e.code, e.dept, typeById(r.typeId).name, r.start, r.end, r.dates.length, STATUS_LABEL[displayStatus(r)], `${left}/${ENTITLEMENT.annual}`].map(esc).join(',')));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-leave-report_${range.from}_to_${range.to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    actions.toast(`Report exported (${lines.length - 1} records)`);
  };

  const empRequests = emp ? state.requests.filter((r) => r.employeeId === emp.id && inRange(r)).sort((a, b) => b.start.localeCompare(a.start)) : [];

  return (
    <div className="page team">
      <PageTitle searchPlaceholder="Ask about team availability, leave balances or upcoming leave…">Team</PageTitle>
      <div className="team-top">
        <div className="team-stats">
          <StatCard label="Team members">{state.employees.length}</StatCard>
          <StatCard label="On leave today" onClick={() => nav('/calendar')}>
            {today.length}
          </StatCard>
        </div>
        <div className="team-tools">
          <div className="range-select">
            <CalendarDays size={22} />
            <Select
              value={rangeId}
              onChange={setRangeId}
              ariaLabel="Report period"
              className="range-dropdown"
              options={RANGES.map((r) => ({ value: r.id, label: r.label }))}
            />
          </div>
          <div className="row-actions">
            <button className="btn" onClick={() => nav('/team/analytics')}>
              View More
            </button>
            <button className="btn" onClick={exportReport}>
              Export Report
            </button>
          </div>
        </div>
      </div>

      <section className="glass table-card">
        <div className="table-wrap">
          <table className="data-table team-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Today</th>
                <th>Annual Leave Left</th>
                <th>Next Leave</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, b, next }) => (
                <tr key={e.id} className="clickable-row" onClick={() => setEmp(e)} tabIndex={0} onKeyDown={(ev) => ev.key === 'Enter' && setEmp(e)}>
                  <td>{e.name}</td>
                  <td>{e.code}</td>
                  <td>
                    <span className={todayIds.has(e.id) ? 'tag-leave' : ''}>{todayIds.has(e.id) ? 'On Leave' : 'Available'}</span>
                  </td>
                  <td>
                    <div className="bar-cell">
                      <span>
                        {b.left}/{b.entitlement} days
                      </span>
                      <div className="bar">
                        <i style={{ width: `${(b.left / b.entitlement) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>{next ? `${fmtDatesLong(next.dates)} • ${typeById(next.typeId).short}${next.status === 'pending' ? ' (pending)' : ''}` : 'No upcoming leave'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {emp && (
        <Modal title={emp.name} onClose={() => setEmp(null)} width={620}>
          <dl className="detail-list compact">
            <dt>Employee ID</dt>
            <dd>{emp.code}</dd>
            <dt>Role</dt>
            <dd>
              {emp.role} · {emp.dept}
            </dd>
            <dt>Today</dt>
            <dd>{todayIds.has(emp.id) ? 'On Leave' : 'Available'}</dd>
            <dt>Annual leave left</dt>
            <dd>{balanceOf(state, emp.id, 'annual').left}/{ENTITLEMENT.annual} days</dd>
            <dt>Sick leave left</dt>
            <dd>{balanceOf(state, emp.id, 'sick').left}/{ENTITLEMENT.sick} days</dd>
          </dl>
          <h4 className="sub-head">Leave in {range.label}</h4>
          <div className="table-wrap scroll-y">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {empRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No leave in this period.</td>
                  </tr>
                ) : (
                  empRequests.map((r) => (
                    <tr key={r.id}>
                      <td>{typeById(r.typeId).short}</td>
                      <td>{r.start === r.end ? fmtDMY(r.start) : `${fmtDMY(r.start)} – ${fmtDMY(r.end)}`}</td>
                      <td>{r.dates.length}</td>
                      <td>{STATUS_LABEL[displayStatus(r)]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
