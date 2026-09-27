import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { myLeaveHistory, myPendingRequestDetail } from '../data/mockData'

export default function MyLeaveRequestDetails(){
  const navigate=useNavigate()
  const {requestId}=useParams()
  const history=useMemo(()=>myLeaveHistory.find(r=>r.requestId===requestId),[requestId])
  const pending=requestId===myPendingRequestDetail.requestId
  const [open,setOpen]=useState(false)
  const [reason,setReason]=useState('')
  const cancelledIds=JSON.parse(localStorage.getItem('lm-cancelled-my-leave')||'[]')
  const [cancelled,setCancelled]=useState(cancelledIds.includes(requestId))
  const status=cancelled?'Cancelled':(history?.status||myPendingRequestDetail.status)
  const type=history?.type||myPendingRequestDetail.type
  const dates=history?.dates||myPendingRequestDetail.dates
  const duration=history?.duration||myPendingRequestDetail.duration

  return <Layout breadcrumb="Manager / My Leave / Request Details" title="Leave Request Details" subtitle="Track your own leave request and its approval history.">
    <div className="request-detail-grid">
      <section className="panel">
        <div className="request-title"><div><h2>{type}</h2><p>{dates} • Request ID: {requestId}</p></div><StatusBadge label={status}/></div>
        <div className="detail-stats">
          <div><span>Duration</span><strong>{duration}</strong></div>
          <div><span>Submitted</span><strong>{pending?myPendingRequestDetail.submitted:'Historical request'}</strong></div>
          <div><span>Current Balance</span><strong>{pending?`${myPendingRequestDetail.currentBalance} days`:'—'}</strong></div>
          <div><span>Balance if approved</span><strong>{pending?`${myPendingRequestDetail.balanceIfApproved} days`:'—'}</strong></div>
        </div>
        <h3>Approval Progress</h3>
        {pending&&!cancelled?<div className="progress-steps"><div className="progress-step done"><i>1</i><div><strong>Request submitted</strong><span>{myPendingRequestDetail.submittedAt}</span></div></div><div className="progress-line done"/><div className="progress-step current"><i>2</i><div><strong>Pending Approval</strong><span>Current step</span></div></div><div className="progress-line"/><div className="progress-step"><i>3</i><div><strong>Approved / Rejected</strong><span>Waiting for current step</span></div></div></div>:
        <div className={`historical-status ${status.toLowerCase()}`}><strong>{status}</strong><span>{status==='Completed'?'This leave request was completed.':status==='Rejected'?'This request was rejected by the approver.':'This request was cancelled and retained for audit.'}</span></div>}
      </section>
      <div className="stack">
        <section className="panel"><h2>Approval updates</h2><p className="muted">A manager cannot approve their own leave. Requests are routed to the next reporting manager or configured higher-level approver.</p>{pending&&!cancelled&&<button className="btn-danger full" onClick={()=>setOpen(true)}>Cancel Request</button>}{cancelled&&<div className="success-message">Request cancelled and retained in history.</div>}</section>
        <section className="panel"><h2>What happens next?</h2><p className="muted">{pending?'Once the higher-level approver decides, your balance and team calendar are updated automatically.':'This is a historical request. Its outcome remains visible for your records and audit history.'}</p></section>
      </div>
    </div>
    <button className="btn-secondary top-gap" onClick={()=>navigate('/my-leave')}>Back to My Leave</button>
    <Modal open={open} title="Cancel leave request" onClose={()=>setOpen(false)} actions={<><button className="btn-secondary" onClick={()=>setOpen(false)}>Keep Request</button><button className="btn-danger" disabled={!reason.trim()} onClick={()=>{const ids=JSON.parse(localStorage.getItem('lm-cancelled-my-leave')||'[]');if(!ids.includes(requestId))ids.push(requestId);localStorage.setItem('lm-cancelled-my-leave',JSON.stringify(ids));setCancelled(true);setOpen(false)}}>Confirm Cancellation</button></>}><label className="field-label">Cancellation reason *</label><textarea className="textarea" rows="4" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Enter your reason"/><p className="field-help">For a personal reason, detailed justification is not required — you may enter only “Personal”.</p></Modal>
  </Layout>
}
