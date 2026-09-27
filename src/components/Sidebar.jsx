import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Modal from './Modal'

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: 'home' },
  { label: 'Approvals', to: '/approvals', icon: 'approvals' },
  { label: 'Team', to: '/team', icon: 'team' },
  { label: 'Leave Calendar', to: '/calendar', icon: 'calendar' },
  { label: 'Employee Details', to: '/employee-details', icon: 'employee' },
  { label: 'Leave Taken Dashboard', to: '/leave-dashboard', icon: 'chart' },
  { label: 'My Leave', to: '/my-leave', icon: 'leave' },
  { label: 'Profile', to: '/profile', icon: 'profile' },
]

export default function Sidebar() {
  const navigate=useNavigate()
  const [logoutOpen,setLogoutOpen]=useState(false)
  const logout=()=>{
    localStorage.setItem('lm-auth','false')
    setLogoutOpen(false)
    navigate('/login',{replace:true})
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">LM</div>
        <div><strong>Leave Management</strong><span>Manager Portal</span></div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer-stack">
        <div className="sidebar-footer"><div className="tiny-dot online"/><span>System connected</span></div>
        <button className="logout-btn" onClick={()=>setLogoutOpen(true)}><Icon name="logout" size={18}/><span>Log out</span></button>
      </div>
      <Modal open={logoutOpen} title="Log out?" onClose={()=>setLogoutOpen(false)} size="sm" actions={<><button className="btn-secondary" onClick={()=>setLogoutOpen(false)}>Stay signed in</button><button className="btn-danger" onClick={logout}>Log out</button></>}>
        <p className="muted">You will return to the sign-in page. Unsaved changes on the current page will be lost.</p>
      </Modal>
    </aside>
  )
}
