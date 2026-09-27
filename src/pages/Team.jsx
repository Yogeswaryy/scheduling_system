import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/Icon'
import { employees } from '../data/mockData'

export default function Team(){
  const navigate=useNavigate(); const scoped=employees.filter(e=>['Operations','Warehouse'].includes(e.department))
  const onLeave=scoped.filter(e=>e.availability==='On Leave').length
  return <Layout breadcrumb="Manager / Team" title="Team Overview" subtitle="A quick view of your assigned employees, reporting groups and current availability." actions={<button className="btn-primary" onClick={()=>navigate('/employee-details')}>Open Employee Details <Icon name="chevron" size={15}/></button>}>
    <div className="stats-grid three"><StatCardLite label="Employees in scope" value={scoped.length}/><StatCardLite label="Currently on leave" value={onLeave}/><StatCardLite label="Organizational groups" value="2"/></div>
    <section className="panel"><div className="panel-head"><div><h2>Assigned team members</h2><p>Select an employee to open their row in Employee Details.</p></div></div><div className="team-cards">{scoped.map(e=><button key={e.id} className="team-person" onClick={()=>navigate(`/employee-details?employee=${encodeURIComponent(e.name)}`)}><div className="avatar avatar-xs">{e.name.split(' ').map(n=>n[0]).join('')}</div><div><strong>{e.name}</strong><span>{e.role}</span><small>{e.department} • Reports to {e.reportsTo}</small></div><StatusBadge label={e.availability}/></button>)}</div></section>
  </Layout>
}
function StatCardLite({label,value}){return <div className="stat-card"><div className="stat-copy"><span>{label}</span><strong>{value}</strong></div></div>}
