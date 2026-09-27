import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { calendarWeek } from '../data/mockData'

const TYPE = { 'Annual leave':'leave annual','MC leave':'leave mc',Pending:'leave pending',Unpaid:'leave unpaid',Maternity:'leave maternity' }
const pad=n=>String(n).padStart(2,'0')
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`

function getMonthCells(month){
  const first=new Date(month.getFullYear(),month.getMonth(),1)
  const last=new Date(month.getFullYear(),month.getMonth()+1,0)
  const start=new Date(first);start.setDate(first.getDate()-first.getDay())
  const end=new Date(last);end.setDate(last.getDate()+(6-last.getDay()))
  const out=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))out.push(new Date(d))
  return out
}

export default function TeamCalendar(){
  const navigate=useNavigate()
  const [holidays,setHolidays]=useState(true)
  const [view,setView]=useState('week')
  const [month,setMonth]=useState(new Date(2026,9,1))
  const [selectedDate,setSelectedDate]=useState(null)
  const monthCells=useMemo(()=>getMonthCells(month),[month])
  const leaveCounts={12:1,13:2,14:1,15:4,16:2,17:0,18:0,20:1,22:1,23:1}

  return <Layout breadcrumb="Manager / Leave Calendar" title="Team Leave Calendar" subtitle="See who is away before approving leave or planning coverage." actions={<button className="btn-primary" onClick={()=>navigate('/my-leave/apply')}><Icon name="plus" size={16}/>Apply Leave</button>}>
    <div className="toolbar calendar-toolbar">
      <div className="segmented"><button className={view==='week'?'active':''} onClick={()=>setView('week')}>Week</button><button className={view==='month'?'active':''} onClick={()=>setView('month')}>Month</button></div>
      {view==='week'?<strong>{calendarWeek.weekLabel}</strong>:<div className="calendar-month-nav"><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>‹</button><strong>{month.toLocaleDateString('en-MY',{month:'long',year:'numeric'})}</strong><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>›</button></div>}
      <label className="toggle-label">Public holidays <button className={`switch ${holidays?'on':''}`} onClick={()=>setHolidays(v=>!v)}><i/></button></label>
    </div>

    {view==='week'?<section className="panel calendar-panel"><div className="calendar-table"><div className="cal-head employee-col">Employee</div>{calendarWeek.days.map(d=><div className="cal-head" key={d}>{d}</div>)}{calendarWeek.rows.map(row=><div className="calendar-row" key={row.employee}><div className="employee-col"><strong>{row.employee}</strong><span>{row.team}</span></div>{calendarWeek.days.map(day=><div className={`calendar-cell ${day.includes('Sat')||day.includes('Sun')?'weekend':''}`} key={day}>{row.entries[day]&&<button className={`${TYPE[row.entries[day]]||'leave'} leave-chip-button`} onClick={()=>row.entries[day]==='Pending'?navigate('/approvals'):navigate(`/employee-details?employee=${encodeURIComponent(row.employee)}`)}>{row.entries[day]}</button>}</div>)}</div>)}</div></section>:
    <section className="panel month-view-panel">
      <div className="month-grid weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=><div key={x}>{x}</div>)}</div>
      <div className="month-calendar-grid">{monthCells.map(d=>{const outside=d.getMonth()!==month.getMonth();const count=outside||d.getFullYear()!==2026||d.getMonth()!==9?0:(leaveCounts[d.getDate()]||0);const weekend=[0,6].includes(d.getDay());return <button key={iso(d)} className={`month-calendar-cell ${outside?'outside':''} ${weekend?'weekend':''}`} onClick={()=>setSelectedDate({date:d,count})}><span>{d.getDate()}</span>{count>0&&<strong>{count} on leave</strong>}{holidays&&d.getDate()===31&&d.getMonth()===7&&<small>Holiday</small>}</button>})}</div>
    </section>}
    {view==='month'&&selectedDate&&<div className="calendar-selection-bar"><div><strong>{selectedDate.date.toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric'})}</strong><span>{selectedDate.count?`${selectedDate.count} employee${selectedDate.count>1?'s':''} on leave or pending.`:'No leave recorded for this date.'}</span></div>{selectedDate.count>0&&<button className="btn-secondary btn-sm" onClick={()=>navigate('/employee-details')}>View Employees</button>}</div>}

    <div className="calendar-legend"><span><i className="dot annual"/>Annual</span><span><i className="dot mc"/>MC</span><span><i className="dot unpaid"/>Unpaid</span><span><i className="dot maternity"/>Maternity</span><span><i className="dot pending"/>Pending approval</span></div>
  </Layout>
}
