import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Icon from './Icon'
import { currentManager } from '../data/mockData'

const initialNotifications=[
  {id:1,title:'Leave request needs review',text:'Nora Smith • 15–18 Oct',read:false,to:'/approvals/LR-2026-01042'},
  {id:2,title:'Coverage alert',text:'Operations / Team A is below minimum staffing on 16 Oct.',read:false,to:'/calendar'},
  {id:3,title:'Upcoming re-verification',text:'WhatsApp verification is due within 30 days.',read:true,to:'/profile'},
]

export default function Layout({ breadcrumb, title, subtitle, actions, children, wide = false }) {
  const navigate=useNavigate()
  const [notifications,setNotifications]=useState(initialNotifications)
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const unread=notifications.filter(n=>!n.read).length
  const quickLogout=()=>{localStorage.setItem('lm-auth','false');navigate('/login',{replace:true})}

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-context">
            <span className="eyebrow">Manager workspace</span>
            <span className="scope-pill">{currentManager.scopeLabel}</span>
          </div>
          <div className="topbar-actions">
            <div className="topbar-popover-wrap">
              <button className="icon-btn notification-btn" aria-label="Notifications" onClick={()=>{setNotificationsOpen(v=>!v);setAccountOpen(false)}}><Icon name="bell" />{unread>0&&<span className="notification-count">{unread}</span>}</button>
              {notificationsOpen&&<div className="popover notifications-popover">
                <div className="popover-head"><strong>Notifications</strong><button onClick={()=>setNotifications(n=>n.map(x=>({...x,read:true})))}>Mark all read</button></div>
                {notifications.map(n=><button key={n.id} className={`notification-item ${n.read?'':'unread'}`} onClick={()=>{setNotifications(all=>all.map(x=>x.id===n.id?{...x,read:true}:x));setNotificationsOpen(false);navigate(n.to)}}><span>{n.title}</span><small>{n.text}</small></button>)}
              </div>}
            </div>
            <div className="topbar-popover-wrap">
              <button className="account-chip account-button" onClick={()=>{setAccountOpen(v=>!v);setNotificationsOpen(false)}}>
                <div className="avatar avatar-sm">{currentManager.initials}</div>
                <div className="account-copy"><strong>{currentManager.name}</strong><span>{currentManager.role}</span></div>
                <Icon name="down" size={15} />
              </button>
              {accountOpen&&<div className="popover account-popover">
                <button onClick={()=>navigate('/profile')}><Icon name="profile" size={16}/>Profile</button>
                <button className="danger-item" onClick={quickLogout}><Icon name="logout" size={16}/>Log out</button>
              </div>}
            </div>
          </div>
        </header>
        <main className={`page ${wide ? 'page-wide' : ''}`}>
          {(breadcrumb || title || subtitle || actions) && (
            <div className="page-heading">
              <div>
                {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
              </div>
              {actions && <div className="page-actions">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
