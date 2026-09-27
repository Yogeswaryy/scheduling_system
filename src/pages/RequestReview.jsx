import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { leaveRequests, coverageHierarchy, coverageReplacementAnalysis, teamStaffingImpact, coverageRecommendation } from '../data/mockData'

function TreeNode({node, depth=0}){
  return <div className="coverage-node" style={{marginLeft: depth*34}}><div className="tree-stem"/><div className="coverage-card"><div className="avatar avatar-xs">{node.name.split(' ').map(n=>n[0]).join('')}</div><div className="grow"><strong>{node.name}</strong><span>{node.role}</span><small>{node.canCover ? `Can cover: ${node.canCover}${node.workload?` • Workload: ${node.workload}`:''}` : node.team}</small></div><StatusBadge label={node.status}/></div>{node.children?.map(c=><TreeNode key={c.name} node={c} depth={depth+1}/>)}</div>
}

export default function RequestReview(){
  const {requestId}=useParams(); const navigate=useNavigate()
  const request=leaveRequests.find(r=>r.id===requestId)||leaveRequests[2]
  const storedDecisions=JSON.parse(localStorage.getItem('lm-approval-decisions')||'{}')
  const [decision,setDecision]=useState(storedDecisions[request.id]||null)
  const [rejectOpen,setRejectOpen]=useState(false)
  const [approveOpen,setApproveOpen]=useState(false)
  const storedReasons=JSON.parse(localStorage.getItem('lm-approval-reasons')||'{}')
  const [reason,setReason]=useState(storedReasons[request.id]||'')
  const saveDecision=(value)=>{const current=JSON.parse(localStorage.getItem('lm-approval-decisions')||'{}');current[request.id]=value;localStorage.setItem('lm-approval-decisions',JSON.stringify(current));setDecision(value)}
  const approve=()=>{saveDecision('Approved');setApproveOpen(false)}
  const reject=()=>{if(!reason.trim())return;const reasons=JSON.parse(localStorage.getItem('lm-approval-reasons')||'{}');reasons[request.id]=reason.trim();localStorage.setItem('lm-approval-reasons',JSON.stringify(reasons));saveDecision('Rejected');setRejectOpen(false)}
  const decided=Boolean(decision)

  return <Layout breadcrumb="Manager / Approvals / Team Impact" title="Request + Team Impact" subtitle="Review reporting lines, replacement options and staffing impact before making a decision." wide>
    <div className="summary-strip six">
      <div><span>Selected employee</span><strong>{request.employee}</strong><small>{request.role} • {request.team}</small></div>
      <div><span>Leave dates</span><strong>{request.dates.length} date{request.dates.length>1?'s':''}</strong><small>{request.dates.join(', ')}</small></div>
      <div><span>Status</span><StatusBadge label={decision||request.status}/></div>
      <div><span>Coverage status</span><strong>{request.currentAvailable??7} available / {request.minStaffingRequired??8} required</strong><StatusBadge label={request.coverageStatus??'Amber'}/></div>
      <div><span>Primary backup</span><strong>{request.primaryBackup??'Amanda Lee'}</strong></div>
      <div><span>Secondary backup</span><strong>{request.secondaryBackup??'Kumar Ravi'}</strong></div>
    </div>

    {decision&&<div className={`decision-banner ${decision==='Approved'?'approved':'rejected'}`}><Icon name={decision==='Approved'?'check':'close'} size={18}/><div><strong>Request {decision.toLowerCase()}</strong><span>{decision==='Approved'?'The approval has been recorded and will continue through the configured workflow.':`Reason: ${reason}`}</span></div></div>}

    <div className="review-grid">
      <section className="panel"><div className="panel-head"><div><h2>Hierarchy / Reporting Structure</h2><p>Role-based indentation shows who works under whom.</p></div></div><div className="coverage-tree"><TreeNode node={coverageHierarchy}/></div></section>
      <div className="stack">
        <section className="panel"><div className="panel-head"><div><h2>Coverage & Replacement Analysis</h2><p>Replacement suitability based on role, workload and availability.</p></div></div><div className="table-wrap"><table className="data-table compact-table"><thead><tr><th>Employee</th><th>Role</th><th>Can cover?</th><th>Coverage</th><th>Availability</th></tr></thead><tbody>{coverageReplacementAnalysis.map(r=><tr key={r.employee}><td><strong>{r.employee}</strong></td><td>{r.role}</td><td>{r.canCover}</td><td>{r.coverageType}</td><td><StatusBadge label={r.availability}/></td></tr>)}</tbody></table></div></section>
        <section className="panel"><div className="panel-head"><div><h2>Team Staffing Impact</h2><p>Projected staffing if this request is approved.</p></div></div><div className="table-wrap"><table className="data-table compact-table"><thead><tr><th>Date</th><th>Required</th><th>Available</th><th>If approved</th><th>Result</th><th>Status</th></tr></thead><tbody>{teamStaffingImpact.map(r=><tr key={r.date}><td>{r.date}</td><td>{r.required}</td><td>{r.available}</td><td>{r.ifApproved}</td><td>{r.result}</td><td><StatusBadge label={r.status}/></td></tr>)}</tbody></table></div></section>
        <section className="recommendation"><Icon name="warning"/><div><strong>Coverage recommendation</strong><p>{coverageRecommendation}</p></div></section>
      </div>
    </div>
    <div className="sticky-actions"><button className="btn-secondary" onClick={()=>navigate('/approvals')}>Back to Approvals</button><div><button className="btn-danger" disabled={decided} onClick={()=>setRejectOpen(true)}>Reject</button><button className="btn-primary" disabled={decided} onClick={()=>setApproveOpen(true)}>Approve</button></div></div>
    <Modal open={approveOpen} title="Approve leave request?" onClose={()=>setApproveOpen(false)} actions={<><button className="btn-secondary" onClick={()=>setApproveOpen(false)}>Cancel</button><button className="btn-primary" onClick={approve}>Confirm Approval</button></>}><p className="muted">Approve {request.employee}'s {request.type.toLowerCase()} leave for {request.dates.join(', ')}? The staffing recommendation will be retained with the decision.</p></Modal>
    <Modal open={rejectOpen} title="Reject leave request" onClose={()=>setRejectOpen(false)} actions={<><button className="btn-secondary" onClick={()=>setRejectOpen(false)}>Cancel</button><button className="btn-danger" disabled={!reason.trim()} onClick={reject}>Confirm rejection</button></>}><label className="field-label">Rejection reason *</label><textarea className="textarea" rows="4" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why this request cannot be approved."/><p className="field-help">A reason is required and will be visible in the request history.</p></Modal>
  </Layout>
}
