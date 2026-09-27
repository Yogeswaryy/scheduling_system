import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import StatusBadge from '../components/StatusBadge'
import { leaveDashboardSummary, leaveTakenByEmployee, leaveTypeDistribution, monthlyLeaveTrend, upcomingLeaveOverview, lowBalanceHighUsage, employees } from '../data/mockData'
import { downloadCsv } from '../utils'

export default function LeaveDashboard(){
  const navigate=useNavigate(); const [mode,setMode]=useState('percentage')
  const [range,setRange]=useState('This Year'); const [group,setGroup]=useState('All Assigned Groups')
  const employeeDept=Object.fromEntries(employees.map(e=>[e.name,e.department]))
  const filteredRows=useMemo(()=>leaveTakenByEmployee.filter(r=>group==='All Assigned Groups'||employeeDept[r.employee]===group),[group])
  const trend=range==='This Month'?monthlyLeaveTrend.slice(-1):range==='Last 3 Months'?monthlyLeaveTrend.slice(-3):monthlyLeaveTrend
  const total=leaveTypeDistribution.reduce((a,b)=>a+b.days,0)
  const distribution=useMemo(()=>leaveTypeDistribution.map(d=>({...d,percent:(d.days/total)*100})),[total])
  const max=Math.max(...trend.map(m=>m.days),1)
  const exportRows=filteredRows.map(r=>({Employee:r.employee,Role:r.role,Annual:r.annual,MC_Leave:r.mc,Other:r.other,Total_Taken:r.totalTaken,Pending:r.pending,Available:r.available,Utilisation_Percent:r.utilisation}))

  return <Layout breadcrumb="Manager / Team / Leave Analytics" title="Employee Leave Taken Dashboard" subtitle="Track leave usage, balances and trends for employees within your assigned organizational groups." wide actions={<><button className="btn-secondary" onClick={()=>downloadCsv('leave-taken-dashboard.csv',exportRows)}><Icon name="download" size={16}/>Export</button><button className="btn-primary" onClick={()=>navigate('/calendar')}><Icon name="calendar" size={16}/>Open Calendar</button></>}>
    <div className="toolbar filters-left"><label><span>Date range</span><select className="control" value={range} onChange={e=>setRange(e.target.value)}><option>This Month</option><option>Last 3 Months</option><option>This Year</option></select></label><label><span>Group / Team</span><select className="control" value={group} onChange={e=>setGroup(e.target.value)}><option>Operations</option><option>Warehouse</option><option>All Assigned Groups</option></select></label></div>
    <div className="stats-grid five"><Mini label="Total Leave Taken" value={`${leaveDashboardSummary.totalLeaveTaken} days`}/><Mini label="Average Leave / Employee" value={`${leaveDashboardSummary.averageLeavePerEmployee} days`}/><Mini label="Employees on Leave" value={leaveDashboardSummary.employeesOnLeave}/><Mini label="Pending Leave" value={leaveDashboardSummary.pendingLeave}/><Mini label="Low Balance Employees" value={leaveDashboardSummary.lowBalanceEmployees}/></div>
    <div className="stats-grid three highlight-row"><Mini label="Highest MC Leave" value={`${leaveDashboardSummary.highestMc.employee} • ${leaveDashboardSummary.highestMc.days.toFixed(1)} days`} tone="info"/><Mini label="Unpaid Leave Total" value={`${leaveDashboardSummary.unpaidTotal.toFixed(1)} days`} tone="warning"/><Mini label="Highest Utilisation" value={`${leaveDashboardSummary.highestUtilisation.employee} • ${leaveDashboardSummary.highestUtilisation.percent}%`} tone="danger"/></div>

    <section className="panel"><div className="panel-head"><div><h2>Leave Taken by Employee</h2><p>Fractional values are supported. Current group filter: {group}.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Employee</th><th>Role</th><th>Annual</th><th>MC Leave</th><th>Other</th><th>Total Taken</th><th>Pending</th><th>Available</th><th>Utilisation</th></tr></thead><tbody>{filteredRows.map(r=><tr key={r.employee}><td><strong>{r.employee}</strong></td><td>{r.role}</td><td>{r.annual.toFixed(1)}</td><td>{r.mc.toFixed(1)}</td><td>{r.other.toFixed(1)}</td><td><strong>{r.totalTaken.toFixed(1)}</strong></td><td>{r.pending.toFixed(1)}</td><td>{r.available.toFixed(1)}</td><td>{r.utilisation}%</td></tr>)}</tbody></table>{filteredRows.length===0&&<div className="empty-state">No employee records match this group.</div>}</div></section>

    <div className="analytics-grid">
      <section className="panel"><div className="panel-head"><div><h2>Leave Type Distribution</h2><p>Switch between percentage and number of days.</p></div><div className="segmented"><button className={mode==='percentage'?'active':''} onClick={()=>setMode('percentage')}>Percentage</button><button className={mode==='number'?'active':''} onClick={()=>setMode('number')}>Number</button></div></div><div className="distribution-list">{distribution.map((d,i)=><div key={d.type} className="distribution-row"><div className="distribution-label"><span>{d.type}</span><strong>{mode==='percentage'?`${d.percent.toFixed(0)}%`:`${d.days.toFixed(1)} days`}</strong></div><div className="bar-track"><i style={{width:`${d.percent}%`}} className={`bar-${i}`}/></div></div>)}</div></section>
      <section className="panel"><div className="panel-head"><div><h2>Monthly Leave Trend</h2><p>{range}.</p></div></div><div className="trend-chart">{trend.map(m=><div key={m.month} className="trend-col"><span>{m.days}</span><i style={{height:`${(m.days/max)*140}px`}}/><small>{m.month}</small></div>)}</div></section>
      <section className="panel"><div className="panel-head"><div><h2>Upcoming Leave Overview</h2><p>Approved and pending absences.</p></div></div><div className="table-wrap"><table className="data-table compact-table"><thead><tr><th>Employee</th><th>Dates</th><th>Duration</th><th>Type</th><th>Status</th></tr></thead><tbody>{upcomingLeaveOverview.filter(r=>group==='All Assigned Groups'||employeeDept[r.employee]===group).map(r=><tr key={r.employee+r.dates}><td><strong>{r.employee}</strong></td><td>{r.dates}</td><td>{r.duration.toFixed(1)}</td><td>{r.type}</td><td><StatusBadge label={r.status}/></td></tr>)}</tbody></table></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Low Balance / High Usage Alert</h2><p>Employees that may need staffing attention.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Employee</th><th>Available</th><th>Utilisation</th><th>Alert</th></tr></thead><tbody>{lowBalanceHighUsage.filter(r=>group==='All Assigned Groups'||employeeDept[r.employee]===group).map(r=><tr key={r.employee}><td><strong>{r.employee}</strong></td><td>{r.available} days</td><td>{r.utilisation}%</td><td><span className="alert-text">{r.alert}</span></td></tr>)}</tbody></table></div></section>
  </Layout>
}
function Mini({label,value,tone='default'}){return <div className={`stat-card tone-${tone}`}><div className="stat-copy"><span>{label}</span><strong className="compact-value">{value}</strong></div></div>}
