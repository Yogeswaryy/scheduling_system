import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/Icon'
import { leaveRequests } from '../data/mockData'

export default function Approvals() {
  const navigate = useNavigate()
  const [search,setSearch] = useState('')
  const [impact,setImpact] = useState('All')
  const decisions=JSON.parse(localStorage.getItem('lm-approval-decisions')||'{}')
  const rows = useMemo(()=>leaveRequests.filter(r => (impact==='All'||r.impact===impact) && `${r.employee} ${r.team} ${r.type}`.toLowerCase().includes(search.toLowerCase())),[search,impact])
  return <Layout breadcrumb="Manager / Approvals" title="Approvals" subtitle="Review employee leave requests and team impact before deciding.">
    <section className="panel">
      <div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search employee or team" value={search} onChange={e=>setSearch(e.target.value)}/></div><select className="control" value={impact} onChange={e=>setImpact(e.target.value)}><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Employee</th><th>Team</th><th>Dates</th><th>Type</th><th>Impact</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(req=><tr key={req.id}><td><strong>{req.employee}</strong><span className="cell-sub">{req.role}</span></td><td>{req.team}</td><td>{req.dates.join(', ')}</td><td>{req.type}</td><td><StatusBadge label={req.impact}/></td><td><StatusBadge label={decisions[req.id]||req.status}/></td><td><button className="btn-secondary btn-sm" onClick={()=>navigate(`/approvals/${req.id}`)}>Review</button></td></tr>)}</tbody></table></div>
    </section>
  </Layout>
}
