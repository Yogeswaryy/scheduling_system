import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { myLeaveSummary, currentManager } from '../data/mockData'

const pad=n=>String(n).padStart(2,'0')
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const fromIso=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)
const publicHolidays=[]
const format=d=>d.toLocaleDateString('en-MY',{day:'2-digit',month:'short',year:'numeric'})

function monthCells(month){
  const first=new Date(month.getFullYear(),month.getMonth(),1); const last=new Date(month.getFullYear(),month.getMonth()+1,0)
  const start=new Date(first); start.setDate(first.getDate()-first.getDay())
  const end=new Date(last); end.setDate(last.getDate()+(6-last.getDay()))
  const days=[]; for(let d=new Date(start);d<=end;d=addDays(d,1)) days.push(new Date(d)); return days
}

export default function ApplyLeave(){
  const navigate=useNavigate()
  const [month,setMonth]=useState(new Date(2026,9,1))
  const [start,setStart]=useState('2026-10-09')
  const [end,setEnd]=useState('2026-10-12')
  const [leaveType,setLeaveType]=useState('Annual Leave')
  const [dayMode,setDayMode]=useState('full')
  const [submitted,setSubmitted]=useState(false)
  const [attachment,setAttachment]=useState(null)
  const workingDays=currentManager.workingDays||[1,2,3,4,5]
  const isWorkingDay=d=>workingDays.includes(d.getDay())
  const days=useMemo(()=>monthCells(month),[month])

  const stats=useMemo(()=>{
    if(!start||!end) return {calendar:0,nonWorking:0,holidays:0,working:0,duration:0,dates:[]}
    let a=fromIso(start),b=fromIso(end); if(a>b)[a,b]=[b,a]
    const dates=[]; for(let d=new Date(a);d<=b;d=addDays(d,1)) dates.push(new Date(d))
    const holidays=dates.filter(d=>publicHolidays.includes(iso(d))).length
    const workingDates=dates.filter(d=>isWorkingDay(d)&&!publicHolidays.includes(iso(d)))
    const nonWorking=dates.length-workingDates.length-holidays
    let duration=workingDates.length
    const firstWorking=workingDates[0],lastWorking=workingDates[workingDates.length-1]
    if(dayMode==='start-half'&&firstWorking) duration-=0.5
    if(dayMode==='end-half'&&lastWorking) duration-=0.5
    return {calendar:dates.length,nonWorking:Math.max(0,nonWorking),holidays,working:workingDates.length,duration:Math.max(0,duration),dates}
  },[start,end,dayMode,workingDays.join(',')])

  const balance=leaveType==='Annual Leave'?myLeaveSummary.annualLeave.available:leaveType==='MC Leave'?myLeaveSummary.mcLeave.available:10
  const chooseDate=(d)=>{const key=iso(d); if(!start||end){setStart(key);setEnd('')}else{const a=fromIso(start); if(d<a){setEnd(start);setStart(key)}else setEnd(key)}}
  const inRange=d=>start&&end&&d>=fromIso(start)&&d<=fromIso(end)
  const submit=e=>{e.preventDefault();if(!start||!end||stats.duration<=0||stats.duration>balance)return;setSubmitted(true);setTimeout(()=>navigate('/my-leave/LR-2026-02001'),650)}

  return <Layout breadcrumb="Manager / My Leave / Apply" title="Apply for Leave" subtitle="Choose a date range. Only dates in your assigned working schedule are deducted from your leave balance." wide>
    <div className="apply-grid">
      <section className="panel calendar-picker-panel">
        <div className="calendar-picker-head"><button className="icon-btn" type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>‹</button><h2>{month.toLocaleDateString('en-MY',{month:'long',year:'numeric'})}</h2><button className="icon-btn" type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>›</button></div>
        <div className="month-grid weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=><div key={x}>{x}</div>)}</div>
        <div className="month-grid">{days.map(d=>{const key=iso(d);const outside=d.getMonth()!==month.getMonth();const selected=key===start||key===end;const range=inRange(d);const nonworking=!isWorkingDay(d);return <button type="button" key={key} onClick={()=>chooseDate(d)} className={`day-cell ${outside?'outside':''} ${selected?'selected':''} ${range?'in-range':''} ${nonworking?'nonworking':''}`}><span>{d.getDate()}</span>{nonworking&&<small>Off</small>}</button>})}</div>
        <div className="calendar-note"><Icon name="calendar" size={17}/><span>Your assigned working pattern is <strong>{currentManager.workingPattern}</strong>. Non-working dates remain visible in the range but are not deducted.</span></div>
      </section>
      <form className="panel request-form" onSubmit={submit}>
        <h2>Leave Request</h2>
        <label className="form-field"><span>Leave Type *</span><select className="control" value={leaveType} onChange={e=>setLeaveType(e.target.value)}><option>Annual Leave</option><option>MC Leave</option><option>Emergency Leave</option><option>Unpaid Leave</option><option>Maternity Leave</option></select></label>
        <div className="form-two"><label className="form-field"><span>Start Date *</span><input className="control" type="date" value={start} onChange={e=>{setStart(e.target.value);setEnd('')}}/></label><label className="form-field"><span>End Date *</span><input className="control" type="date" value={end} min={start} onChange={e=>setEnd(e.target.value)}/></label></div>
        <label className="form-field"><span>Day calculation</span><select className="control" value={dayMode} onChange={e=>setDayMode(e.target.value)}><option value="full">Full working days</option><option value="start-half">Half-day on first working day</option><option value="end-half">Half-day on last working day</option></select></label>
        <label className="form-field"><span>Attachment (if required)</span><div className="upload-field"><Icon name="upload" size={18}/><input type="file" onChange={e=>setAttachment(e.target.files?.[0]||null)}/>{attachment&&<button type="button" className="attachment-remove" onClick={()=>setAttachment(null)}>Remove</button>}</div>{attachment&&<small className="field-help">Selected: {attachment.name}</small>}</label>
        <div className="leave-calc"><div><span>Calendar span</span><strong>{stats.calendar} days</strong></div><div><span>Non-working days</span><strong>{stats.nonWorking}</strong></div><div><span>Public holidays</span><strong>{stats.holidays}</strong></div><div className="primary"><span>Leave deducted</span><strong>{stats.duration.toFixed(1)} days</strong></div><div><span>Current balance</span><strong>{balance.toFixed(1)} days</strong></div><div><span>After request</span><strong>{Math.max(0,balance-stats.duration).toFixed(1)} days</strong></div></div>
        {start&&end&&<div className="logic-example"><strong>{format(fromIso(start))} → {format(fromIso(end))}</strong><span>{stats.nonWorking ? `${stats.nonWorking} non-working day${stats.nonWorking>1?'s':''} excluded automatically from the deduction.` : 'All selected dates are scheduled working days.'}</span></div>}
        {stats.duration>balance&&<div className="form-error">This request exceeds the available {leaveType.toLowerCase()} balance.</div>}
        <div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>navigate('/my-leave')}>Cancel</button><button type="submit" className="btn-primary" disabled={!start||!end||stats.duration<=0||stats.duration>balance||submitted}>{submitted?'Submitting…':'Submit Request'}</button></div>
      </form>
    </div>
    <div className="info-banner"><Icon name="check"/><div><strong>Before you submit</strong><p>The system checks your assigned working pattern, applicable holidays, leave balance, policy rules and team coverage before routing the request to your higher-level approver.</p></div></div>
  </Layout>
}
