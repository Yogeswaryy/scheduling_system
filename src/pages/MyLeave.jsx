import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/Icon'
import { myLeaveSummary, myLeaveHistory } from '../data/mockData'

export default function MyLeave(){
  const navigate=useNavigate()
  const cancelledIds=JSON.parse(localStorage.getItem('lm-cancelled-my-leave')||'[]')
  const rows=myLeaveHistory.map(r=>cancelledIds.includes(r.requestId)?{...r,status:'Cancelled'}:r)
  const pendingCount=rows.filter(r=>r.status==='Pending').length
  return <Layout breadcrumb="Manager / My Leave" title="My Leave" subtitle="Manage your own leave without mixing it with employee approvals." actions={<button className="btn-primary" onClick={()=>navigate('/my-leave/apply')}><Icon name="plus" size={16}/>Apply Leave</button>}>
    <div className="stats-grid four"><StatCard label="Annual Leave" value={`${myLeaveSummary.annualLeave.available} days`} hint={`Available of ${myLeaveSummary.annualLeave.total} days`}/><StatCard label="MC Leave" value={`${myLeaveSummary.mcLeave.available} days`} hint={`Available of ${myLeaveSummary.mcLeave.total} days`}/><StatCard label="Upcoming Leave" value={`${myLeaveSummary.upcomingLeave.days} days`} hint={myLeaveSummary.upcomingLeave.dates}/><StatCard label="Pending Requests" value={pendingCount} hint="Waiting for higher-level approval" tone="warning"/></div>
    <section className="panel"><div className="panel-head"><div><h2>My Personal Leave</h2><p>Your own leave requests only — subordinate requests stay under Approvals.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Leave Type</th><th>Dates</th><th>Duration</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(r=><tr key={r.requestId}><td><strong>{r.type}</strong></td><td>{r.dates}</td><td>{r.duration}</td><td><StatusBadge label={r.status}/></td><td><button className="table-action" onClick={()=>navigate(`/my-leave/${r.requestId}`)}>{r.status==='Pending'?'View / Cancel':'View'} <Icon name="chevron" size={14}/></button></td></tr>)}</tbody></table></div></section>
  </Layout>
}
