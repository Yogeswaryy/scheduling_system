import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/Icon'
import { kpis, leaveRequests, weekAtAGlance, coverageSettings } from '../data/mockData'

export default function Home() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [warnLow,setWarnLow]=useState(coverageSettings.warnWhenCoverageLow)
  const [blockExceeded,setBlockExceeded]=useState(coverageSettings.blockLeaveWhenLimitExceeded)
  const decisions=JSON.parse(localStorage.getItem('lm-approval-decisions')||'{}')
  const pendingRequests=leaveRequests.filter(r=>!decisions[r.id])
  const filtered = useMemo(() => filter === 'All' ? pendingRequests : pendingRequests.filter(r => r.impact === filter), [filter])

  return (
    <Layout breadcrumb="Manager / Home" title="Manager Home" subtitle="Review approvals, team availability and coverage risks at a glance." actions={<><button className="btn-secondary" onClick={() => navigate('/calendar')}><Icon name="calendar" size={17}/>Open Calendar</button><button className="btn-primary" onClick={() => navigate('/approvals')}><Icon name="approvals" size={17}/>Review Approvals</button></>}>
      <div className="stats-grid four">
        <StatCard label="People scheduled today" value={kpis.peopleScheduledToday} hint="Across assigned teams" icon={<Icon name="users"/>}/>
        <StatCard label="On leave today" value={kpis.onLeaveToday.total} hint={`${kpis.onLeaveToday.annual} annual • ${kpis.onLeaveToday.mc} MC`} icon={<Icon name="calendar"/>}/>
        <StatCard label="Pending approvals" value={kpis.pendingApprovals} hint="Manager action required" tone="warning" icon={<Icon name="approvals"/>}/>
        <StatCard label="Coverage alerts" value={kpis.coverageAlerts} hint="Potential staffing gaps" tone="danger" icon={<Icon name="warning"/>}/>
      </div>

      <div className="dashboard-grid main-split">
        <section className="panel">
          <div className="panel-head"><div><h2>Requests awaiting approval</h2><p>Requests inside your assigned organizational groups.</p></div><select className="control compact" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></div>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Employee</th><th>Dates</th><th>Type</th><th>Impact</th><th>Action</th></tr></thead><tbody>{filtered.map(req=><tr key={req.id}><td><strong>{req.employee}</strong><span className="cell-sub">{req.role}</span></td><td>{req.dates.join(', ')}</td><td>{req.type}</td><td><StatusBadge label={req.impact}/></td><td><button className="table-action" onClick={()=>navigate(`/approvals/${req.id}`)}>Review <Icon name="chevron" size={14}/></button></td></tr>)}</tbody></table></div>
        </section>

        <div className="stack">
          <section className="panel">
            <div className="panel-head"><div><h2>This week at a glance</h2><p>Leave pressure by day.</p></div></div>
            <div className="week-list">{weekAtAGlance.map(d=><button className="week-row week-row-button" key={d.day} onClick={()=>navigate('/calendar')}><div><strong>{d.day}</strong><span>{d.offCount} people off</span></div><span className={`health health-${d.tone}`}>{d.status}</span></button>)}</div>
          </section>
          <section className="panel">
            <div className="panel-head"><div><h2>Schedule & Coverage</h2><p>Configured staffing thresholds.</p></div></div>
            <div className="setting-row"><span>Minimum staffing per team</span><strong>{coverageSettings.minStaffingPerTeam} employees</strong></div>
            <div className="setting-row"><span>Maximum people off at once</span><strong>{coverageSettings.maxPeopleOffAtOnce} employees</strong></div>
            <div className="setting-row"><span>Warn when coverage is low</span><button type="button" aria-pressed={warnLow} className={`mini-switch ${warnLow?'on':''}`} onClick={()=>setWarnLow(v=>!v)}><i/></button></div>
            <div className="setting-row"><span>Block leave when limit exceeded</span><button type="button" aria-pressed={blockExceeded} className={`mini-switch ${blockExceeded?'on':''}`} onClick={()=>setBlockExceeded(v=>!v)}><i/></button></div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
