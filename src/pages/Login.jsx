import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { currentManager } from '../data/mockData'

export default function Login(){
  const navigate=useNavigate()
  const [email,setEmail]=useState(currentManager.email)
  const [password,setPassword]=useState('manager123')
  const [error,setError]=useState('')

  const submit=(e)=>{
    e.preventDefault()
    if(!email.trim()||!password.trim()){
      setError('Enter both email and password.')
      return
    }
    localStorage.setItem('lm-auth','true')
    navigate('/',{replace:true})
  }

  return <div className="login-page">
    <div className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand-mark">LM</div>
        <h1>Leave Management</h1>
        <p>Manager workspace for approvals, team coverage, leave planning and employee visibility.</p>
        <div className="login-feature"><Icon name="approvals"/><span>Review leave requests with staffing impact</span></div>
        <div className="login-feature"><Icon name="calendar"/><span>Plan leave around working days and team coverage</span></div>
        <div className="login-feature"><Icon name="team"/><span>View reporting hierarchy and employee details</span></div>
      </section>
      <form className="login-card" onSubmit={submit}>
        <div className="login-kicker">Manager Portal</div>
        <h2>Welcome back</h2>
        <p>Sign in to continue to your workspace.</p>
        <label className="form-field"><span>Email</span><input className="control" value={email} onChange={e=>setEmail(e.target.value)} type="email" /></label>
        <label className="form-field"><span>Password</span><input className="control" value={password} onChange={e=>setPassword(e.target.value)} type="password" /></label>
        {error&&<div className="form-error">{error}</div>}
        <button className="btn-primary login-submit" type="submit">Sign In</button>
        <small className="login-note">Demo build: any non-empty password signs in as {currentManager.name}.</small>
      </form>
    </div>
  </div>
}
