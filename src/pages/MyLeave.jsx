import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { myLeaveSummary, myLeaveHistory } from '../data/mockData'

export default function MyLeave() {
  const navigate = useNavigate()

  return (
    <Layout
      title="My Leave"
      subtitle="Manage your own leave without mixing it with employee approvals."
      actions={
        <button className="btn-primary" onClick={() => navigate('/my-leave/apply')}>
          + Apply Leave
        </button>
      }
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Annual Leave"
          value={`${myLeaveSummary.annualLeave.available} days`}
          hint={`Available of ${myLeaveSummary.annualLeave.total} days`}
        />
        <StatCard
          label="Sick Leave"
          value={`${myLeaveSummary.sickLeave.available} days`}
          hint={`Available of ${myLeaveSummary.sickLeave.total} days`}
        />
        <StatCard label="Upcoming Leave" value={`${myLeaveSummary.upcomingLeave.days} days`} hint={myLeaveSummary.upcomingLeave.dates} />
        <StatCard label="Pending Requests" value={myLeaveSummary.pendingRequests} hint="Waiting for approval" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-1">My Personal Leave</h2>
        <p className="text-xs text-gray-500 mb-4">Your own leave requests only — subordinate requests stay under Approvals.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Leave Type</th>
              <th className="py-2 font-medium">Dates</th>
              <th className="py-2 font-medium">Duration</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {myLeaveHistory.map((row) => (
              <tr key={row.requestId} className="border-b border-gray-100 last:border-0">
                <td className="py-3">{row.type}</td>
                <td className="py-3 text-gray-600">{row.dates}</td>
                <td className="py-3 text-gray-600">{row.duration}</td>
                <td className="py-3"><StatusBadge label={row.status} /></td>
                <td className="py-3">
                  {row.status === 'Pending' ? (
                    <button
                      className="text-xs font-medium underline underline-offset-2"
                      onClick={() => navigate(`/my-leave/${row.requestId}`)}
                    >
                      View / Cancel
                    </button>
                  ) : (
                    <button
                      className="text-xs font-medium underline underline-offset-2"
                      onClick={() => navigate(`/my-leave/${row.requestId}`)}
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
