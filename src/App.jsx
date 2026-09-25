import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Approvals from './pages/Approvals'
import RequestReview from './pages/RequestReview'
import TeamCalendar from './pages/TeamCalendar'
import Team from './pages/Team'
import LeaveDashboard from './pages/LeaveDashboard'
import MyLeave from './pages/MyLeave'
import ApplyLeave from './pages/ApplyLeave'
import MyLeaveRequestDetails from './pages/MyLeaveRequestDetails'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/approvals/:requestId" element={<RequestReview />} />
      <Route path="/calendar" element={<TeamCalendar />} />
      <Route path="/team" element={<Team />} />
      <Route path="/leave-dashboard" element={<LeaveDashboard />} />
      <Route path="/my-leave" element={<MyLeave />} />
      <Route path="/my-leave/apply" element={<ApplyLeave />} />
      <Route path="/my-leave/:requestId" element={<MyLeaveRequestDetails />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}
