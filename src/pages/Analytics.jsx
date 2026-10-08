import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { analytics } from '../lib/calc';
import { MONTHS, TODAY, year } from '../lib/dates';
import { PageTitle, Select, StatCard } from '../components/ui';
import { Donut, GroupedBars, LineChart } from '../components/Charts';

const ACT = [
  { key: 'submitted', label: 'Submitted', color: '#7c4dff' },
  { key: 'approved', label: 'Approved', color: '#3b82f6' },
  { key: 'rejected', label: 'Rejected', color: '#ec4899' },
  { key: 'cancelled', label: 'Cancelled', color: '#fb923c' },
];

const Toggle = ({ value, onChange }) => (
  <div className="toggle2" role="group">
    <button className={value === 'pct' ? 'on' : ''} onClick={() => onChange('pct')}>
      %
    </button>
    <button className={value === 'no' ? 'on' : ''} onClick={() => onChange('no')}>
      No.
    </button>
  </div>
);

export default function Analytics() {
  const { state } = useStore();
  const nav = useNavigate();
  const yr = year(TODAY);
  const [month, setMonth] = useState('all');
  const [tab, setTab] = useState('annual');
  const [distMode, setDistMode] = useState('pct');
  const [actMode, setActMode] = useState('no');

  const A = useMemo(() => analytics(state, yr, month === 'all' ? 'all' : +month), [state, yr, month]);
  const top = A.perEmp(tab).slice(0, 5);
  const topMax = Math.max(1, ...top.map((t) => t.days));
  const distTotal = A.dist.reduce((n, d) => n + d.count, 0);
  const months = A.monthly.map((x) => x.m);

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
        <StatCard label="Total Leave Requests">{A.total}</StatCard>
        <StatCard label="Employee on Leave">{A.onLeave}</StatCard>
        <StatCard label="Pending Approvals" onClick={() => nav('/approvals')}>
          {A.pending}
        </StatCard>
        <StatCard label="Highest MC Leave">{A.highestMc}</StatCard>
        <StatCard label="Total Unpaid Leave">{A.unpaid} days</StatCard>
      </div>

      <div className="an-row">
        <section className="glass card">
          <div className="card-head wrap">
            <h3>Top 5 Employees by Leave Taken</h3>
            <div className="tabs-mini" role="tablist">
              {state.leaveTypes.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
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
    </div>
  );
}
