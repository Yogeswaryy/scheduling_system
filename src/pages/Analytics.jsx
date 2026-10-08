import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { analytics, personName } from '../lib/calc';
import { typeById, MANAGER } from '../lib/constants';
import { fmtDatesShort, monthIdx, MONTHS, TODAY, year } from '../lib/dates';
import { Modal, PageTitle, Select, StatCard, StatusPill, useTabScrub } from '../components/ui';
import { Donut, GroupedBars, LineChart } from '../components/Charts';

const ACT = [
  { key: 'submitted', label: 'Submitted', color: '#7c4dff' },
  { key: 'approved', label: 'Approved', color: '#3b82f6' },
  { key: 'rejected', label: 'Rejected', color: '#ec4899' },
  { key: 'cancelled', label: 'Cancelled', color: '#fb923c' },
];

const Toggle = ({ value, onChange }) => {
  const scrub = useTabScrub(onChange);
  return (
    <div className="toggle2 scrub-tabs" role="tablist" aria-label="Chart value display" {...scrub}>
      <button role="tab" aria-selected={value === 'pct'} data-scrub-value="pct" className={value === 'pct' ? 'on' : ''} onClick={() => onChange('pct')}>
        %
      </button>
      <button role="tab" aria-selected={value === 'no'} data-scrub-value="no" className={value === 'no' ? 'on' : ''} onClick={() => onChange('no')}>
        No.
      </button>
    </div>
  );
};

export default function Analytics() {
  const { state } = useStore();
  const nav = useNavigate();
  const yr = year(TODAY);
  const [month, setMonth] = useState('all');
  const [tab, setTab] = useState('annual');
  const [distMode, setDistMode] = useState('pct');
  const [actMode, setActMode] = useState('no');
  const [detail, setDetail] = useState(null);
  const leaveTypeScrub = useTabScrub(setTab);

  const A = useMemo(() => analytics(state, yr, month === 'all' ? 'all' : +month), [state, yr, month]);
  const top = A.perEmp(tab).slice(0, 5);
  const topMax = Math.max(1, ...top.map((t) => t.days));
  const distTotal = A.dist.reduce((n, d) => n + d.count, 0);
  const months = A.monthly.map((x) => x.m);
  const periodRequests = state.requests.filter((request) => request.employeeId !== MANAGER.id && year(request.start) === yr && (month === 'all' || monthIdx(request.start) === +month));
  const detailConfig = {
    total: { title: 'All leave requests', rows: periodRequests },
    approved: { title: 'Employees with approved leave', rows: periodRequests.filter((request) => request.status === 'approved') },
    pending: { title: 'Pending approvals', rows: periodRequests.filter((request) => request.status === 'pending') },
    sick: { title: 'Approved medical leave', rows: periodRequests.filter((request) => request.status === 'approved' && request.typeId === 'sick') },
    unpaid: { title: 'Approved unpaid leave', rows: periodRequests.filter((request) => request.status === 'approved' && request.typeId === 'unpaid') },
  };

  const actSeries = ACT.map((s) => ({
    ...s,
    values: A.monthly.map((x) => (actMode === 'pct' ? (x.submitted ? Math.round((x[s.key] / x.submitted) * 100) : 0) : x[s.key])),
  }));

  const exportReport = () => {
    const periodLabel = month === 'all' ? `Full year ${yr}` : `${MONTHS[+month]} ${yr}`;
    const rows = [
      ['Analytics Report', periodLabel],
      [],
      ['KPI', 'Value'],
      ['Total Leave Requests', A.total],
      ['Employees on Leave', A.onLeave],
      ['Pending Approvals', A.pending],
      ['Highest MC Leave', A.highestMc],
      ['Total Unpaid Leave (days)', A.unpaid],
      [],
      ['Monthly Activity'],
      ['Month', 'Submitted', 'Approved', 'Rejected', 'Cancelled'],
      ...A.monthly.map((x) => [MONTHS[x.m], x.submitted, x.approved, x.rejected, x.cancelled]),
      [],
      ['Top 5 Employees by Selected Leave Type'],
      ['Employee', 'Department', 'Days'],
      ...top.map((x) => [x.emp?.name || '', x.emp?.dept || '', x.days]),
      [],
      ['Leave Type Distribution'],
      ['Leave Type', 'Requests'],
      ...A.dist.map((x) => [x.type.analytics || x.type.name, x.count]),
    ];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = rows.map((row) => row.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manager-analytics-${yr}-${month === 'all' ? 'full-year' : String(+month + 1).padStart(2, '0')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page analytics">
      <PageTitle
        right={
          <>
            <button className="btn" onClick={() => nav('/team')}>
              Back to Team
            </button>
            <button className="btn" onClick={exportReport}>
              Export Report
            </button>
          </>
        }
       searchPlaceholder="Ask about leave trends, approval activity or team usage…"
      >
        Analytics Dashboard
      </PageTitle>

      <div className="an-period">
        <div className="range-select">
          <CalendarDays size={20} />
          <Select
            value={month}
            onChange={setMonth}
            ariaLabel="Period"
            className="range-dropdown"
            options={[
              { value: 'all', label: `Full year ${yr}` },
              ...MONTHS.map((m, i) => ({ value: String(i), label: `${m} ${yr}` })),
            ]}
          />
        </div>
      </div>

      <div className="grid-5">
        <StatCard label="Total Leave Requests" onClick={() => setDetail('total')}>{A.total}</StatCard>
        <StatCard label="Employee on Leave" onClick={() => setDetail('approved')}>{A.onLeave}</StatCard>
        <StatCard label="Pending Approvals" onClick={() => setDetail('pending')}>
          {A.pending}
        </StatCard>
        <StatCard label="Highest MC Leave" onClick={() => setDetail('sick')}>{A.highestMc}</StatCard>
        <StatCard label="Total Unpaid Leave" onClick={() => setDetail('unpaid')}>{A.unpaid} days</StatCard>
      </div>

      <div className="an-row">
        <section className="glass card">
          <div className="card-head wrap">
            <h3>Top 5 Employees by Leave Taken</h3>
            <div className="tabs-mini scrub-tabs" role="tablist" aria-label="Leave type" {...leaveTypeScrub}>
              {state.leaveTypes.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} data-scrub-value={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                  {t.analytics}
                </button>
              ))}
            </div>
          </div>
          {top.length === 0 ? (
            <div className="empty">No approved {state.leaveTypes.find((t) => t.id === tab).analytics} leave in this period.</div>
          ) : (
            <ol className="top5">
              {top.map((t, i) => {
                const color = state.leaveTypes.find((x) => x.id === tab).color;
                return (
                  <li key={t.emp.id}>
                    <span className="rank">{i + 1}</span>
                    <span className="who">
                      {t.emp.name} <small>{t.emp.dept}</small>
                    </span>
                    <span className="meter">
                      <i style={{ width: `${(t.days / topMax) * 100}%`, background: color }} />
                    </span>
                    <span className="days">{t.days} days</span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="glass card">
          <div className="card-head">
            <h3>Leave Type Distribution</h3>
            <Toggle value={distMode} onChange={setDistMode} />
          </div>
          <div className="dist">
            <Donut
              slices={A.dist.map((d) => ({ label: d.type.analytics, value: d.count, color: d.type.color }))}
              centerTop={distTotal}
              centerBottom="Total Requests"
            />
            <ul className="legend-list">
              {A.dist.map((d) => (
                <li key={d.type.id}>
                  <i style={{ background: d.type.color }} />
                  <span>{d.type.name.replace(' Leave', '')}</span>
                  <b>{distMode === 'pct' ? `${distTotal ? Math.round((d.count / distTotal) * 100) : 0}%` : d.count}</b>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="an-row">
        <section className="glass card">
          <div className="card-head">
            <h3>Monthly Leave Trend</h3>
            <div className="key">
              <span>
                <i style={{ background: '#7c4dff' }} />
                Requests
              </span>
              <span>
                <i style={{ background: '#3b82f6' }} />
                Approved
              </span>
            </div>
          </div>
          <LineChart
            months={months}
            series={[
              { label: 'Requests', color: '#7c4dff', values: A.monthly.map((x) => x.submitted) },
              { label: 'Approved', color: '#3b82f6', values: A.monthly.map((x) => x.approved) },
            ]}
          />
        </section>

        <section className="glass card">
          <div className="card-head">
            <h3>Approval &amp; Cancellation Activity</h3>
            <Toggle value={actMode} onChange={setActMode} />
          </div>
          <div className="key wrap-key">
            {ACT.map((s) => (
              <span key={s.key}>
                <i style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
          <GroupedBars months={months} series={actSeries} percent={actMode === 'pct'} />
        </section>
      </div>

      {detail && (
        <Modal title={detailConfig[detail].title} onClose={() => setDetail(null)} width={760}>
          <div className="table-wrap analytics-detail-table">
            <table className="mini-table">
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
              <tbody>
                {detailConfig[detail].rows.length ? detailConfig[detail].rows.map((request) => (
                  <tr key={request.id}>
                    <td>{personName(state, request.employeeId)}</td>
                    <td>{typeById(request.typeId).short}</td>
                    <td>{fmtDatesShort(request.dates)}</td>
                    <td><StatusPill request={request} /></td>
                  </tr>
                )) : <tr><td colSpan={4}>No matching records for this period.</td></tr>}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
