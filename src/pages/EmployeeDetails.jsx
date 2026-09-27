import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { employees, orgTree } from '../data/mockData'
import { downloadCsv } from '../utils'

function TreeItem({node, depth=0, openState, toggle}){
  const has=node.children?.length>0; const open=openState[node.id]!==false
  return <div className="org-node"><div className={`org-node-row ${node.type==='department'?'department':''}`} style={{paddingLeft:12+depth*20}}>{has?<button className="tree-toggle" onClick={()=>toggle(node.id)}><Icon name={open?'minus':'plus'} size={13}/></button>:<span className="tree-toggle spacer"/>}<Icon name={node.type==='department'?'team':'employee'} size={16}/><div><strong>{node.label}</strong>{node.role&&<span>{node.role}</span>}</div></div>{has&&open&&<div className="org-children">{node.children.map(c=><TreeItem key={c.id} node={c} depth={depth+1} openState={openState} toggle={toggle}/>)}</div>}</div>
}

export default function EmployeeDetails(){
  const [params]=useSearchParams()
  const selectedName=params.get('employee')
  const [department,setDepartment]=useState('All Departments'); const [level,setLevel]=useState('All Levels'); const [openState,setOpenState]=useState({})
  const toggle=id=>setOpenState(s=>({...s,[id]:s[id]===false?true:false}))
  const rows=useMemo(()=>employees.filter(e=>(department==='All Departments'||e.department===department)&&(level==='All Levels'||e.level===Number(level.replace('Level ','')))),[department,level])
  const exportRows=rows.map(e=>({Employee_ID:e.id,Name:e.name,Role:e.role,Department:e.department,Reports_To:e.reportsTo,Annual_Taken:e.annual[0],Annual_Entitlement:e.annual[1],MC_Taken:e.mc[0],MC_Entitlement:e.mc[1],Maternity_Taken:e.maternity[0],Maternity_Entitlement:e.maternity[1],Unpaid_Taken:e.unpaid[0],Unpaid_Entitlement:e.unpaid[1],Available_Balance:e.balance}))

  return <Layout breadcrumb="Manager / Employee Details" title="Employee Details & Hierarchy" subtitle="View reporting structure and employee leave balances within your assigned scope." wide actions={<button className="btn-secondary" onClick={()=>downloadCsv('employee-details.csv',exportRows)}><Icon name="download" size={16}/>Export</button>}>
    <div className="toolbar filters-left"><label><span>Department</span><select className="control" value={department} onChange={e=>setDepartment(e.target.value)}><option>All Departments</option><option>Operations</option><option>Warehouse</option></select></label><label><span>Role level</span><select className="control" value={level} onChange={e=>setLevel(e.target.value)}><option>All Levels</option><option>Level 1</option><option>Level 2</option><option>Level 3</option><option>Level 4</option><option>Level 5</option></select></label>{(department!=='All Departments'||level!=='All Levels')&&<button className="btn-secondary btn-sm" onClick={()=>{setDepartment('All Departments');setLevel('All Levels')}}>Reset filters</button>}</div>
    <div className="employee-layout">
      <section className="panel hierarchy-panel"><div className="panel-head"><div><h2>Organizational Hierarchy</h2><p>Expand reporting lines to see who works under whom.</p></div></div><div className="org-tree"><div className="org-root"><Icon name="team" size={16}/><strong>Director</strong></div>{orgTree.map(n=><TreeItem key={n.id} node={n} openState={openState} toggle={toggle}/>)}</div></section>
      <section className="panel employee-table-panel"><div className="panel-head"><div><h2>Employee Details</h2><p>Showing {rows.length} employees{selectedName?` • ${selectedName} highlighted`:''}</p></div></div><div className="table-wrap"><table className="data-table employee-table"><thead><tr><th>#</th><th>Employee ID</th><th>Name</th><th>Role</th><th>Department</th><th>Reports To</th><th>Annual Leave<span>Taken / Entitlement</span></th><th>MC Leave<span>Taken / Entitlement</span></th><th>Maternity<span>Taken / Entitlement</span></th><th>Unpaid<span>Taken / Entitlement</span></th><th>Available</th></tr></thead><tbody>{rows.map((e,i)=><tr key={e.id} className={selectedName===e.name?'selected-row':''}><td>{i+1}</td><td>{e.id}</td><td><strong>{e.name}</strong></td><td>{e.role}</td><td>{e.department}</td><td>{e.reportsTo}</td><td>{e.annual[0]} / {e.annual[1]}</td><td>{e.mc[0]} / {e.mc[1]}</td><td>{e.maternity[0]} / {e.maternity[1]}</td><td>{e.unpaid[0]} / {e.unpaid[1]}</td><td><strong>{e.balance}</strong><span className="cell-sub">days</span></td></tr>)}</tbody></table></div></section>
    </div>
  </Layout>
}
