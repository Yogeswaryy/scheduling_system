import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Approvals from './pages/Approvals'
import RequestReview from './pages/RequestReview'
import TeamCalendar from './pages/TeamCalendar'
import Team from './pages/Team'
import EmployeeDetails from './pages/EmployeeDetails'
import LeaveDashboard from './pages/LeaveDashboard'
import MyLeave from './pages/MyLeave'
import ApplyLeave from './pages/ApplyLeave'
import MyLeaveRequestDetails from './pages/MyLeaveRequestDetails'
import Profile from './pages/Profile'
import Login from './pages/Login'

function RequireAuth({children}){
  const location=useLocation()
  const authed=localStorage.getItem('lm-auth')!=='false'
  return authed ? children : <Navigate to="/login" state={{from:location}} replace />
}

const protect=(element)=><RequireAuth>{element}</RequireAuth>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={protect(<Home />)} />
      <Route path="/approvals" element={protect(<Approvals />)} />
      <Route path="/approvals/:requestId" element={protect(<RequestReview />)} />
      <Route path="/calendar" element={protect(<TeamCalendar />)} />
      <Route path="/team" element={protect(<Team />)} />
      <Route path="/employee-details" element={protect(<EmployeeDetails />)} />
      <Route path="/leave-dashboard" element={protect(<LeaveDashboard />)} />
      <Route path="/my-leave" element={protect(<MyLeave />)} />
      <Route path="/my-leave/apply" element={protect(<ApplyLeave />)} />
      <Route path="/my-leave/:requestId" element={protect(<MyLeaveRequestDetails />)} />
      <Route path="/profile" element={protect(<Profile />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
