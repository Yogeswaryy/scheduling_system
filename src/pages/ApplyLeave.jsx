import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import { myLeaveSummary } from '../data/mockData'

export default function ApplyLeave() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    leaveType: 'Annual',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real integration: POST to the leave-request API, then route to the
    // request detail / tracking page using the returned request ID.
    navigate('/my-leave/LR-2026-01042')
  }

  return (
    <Layout title="Apply for Leave" subtitle="Choose dates and leave type. Duration and projected balance are calculated automatically.">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Annual Leave" value={`${myLeaveSummary.annualLeave.available} days`} hint={`Available of ${myLeaveSummary.annualLeave.total} days`} />
        <StatCard label="Sick Leave" value={`${myLeaveSummary.sickLeave.available} days`} hint={`Available of ${myLeaveSummary.sickLeave.total} days`} />
        <StatCard label="Pending Requests" value={myLeaveSummary.pendingRequests} hint="Waiting for manager review" />
        <StatCard label="Upcoming Leave" value={`${myLeaveSummary.upcomingLeave.days} days`} hint={myLeaveSummary.upcomingLeave.dates} />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <h2 className="text-lg font-semibold mb-3">Leave Request Calendar View</h2>
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
            Calendar picker placeholder — wire up to your date-picker component
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type *</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            >
              <option>Annual</option>
              <option>Sick</option>
              <option>Emergency</option>
              <option>Unpaid</option>
              <option>Maternity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Attachment (if required)</label>
            <input type="file" className="w-full text-sm" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => navigate('/my-leave')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Request
            </button>
          </div>
        </div>
      </form>

      <div className="card mt-6 text-sm text-gray-600">
        <span className="font-semibold text-gray-900">Before you submit — </span>
        The system checks working days, balance, policy rules and coverage, then routes the request through the configured approval chain.
      </div>
    </Layout>
  )
}
