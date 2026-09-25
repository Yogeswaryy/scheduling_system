import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { leaveRequests } from '../data/mockData'

export default function Approvals() {
  const navigate = useNavigate()

  return (
    <Layout
      breadcrumb="Manager / Approvals"
      title="Approvals"
      subtitle="All leave requests waiting on your decision."
    >
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Employee</th>
              <th className="py-2 font-medium">Team</th>
              <th className="py-2 font-medium">Dates</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Impact</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((req) => (
              <tr key={req.id} className="border-b border-gray-100 last:border-0">
                <td className="py-3 font-medium">{req.employee}</td>
                <td className="py-3 text-gray-600">{req.team}</td>
                <td className="py-3 text-gray-600">{req.dates.join(', ')}</td>
                <td className="py-3 text-gray-600">{req.type}</td>
                <td className="py-3"><StatusBadge label={req.impact} /></td>
                <td className="py-3"><StatusBadge label={req.status} /></td>
                <td className="py-3">
                  <button className="btn-secondary" onClick={() => navigate(`/approvals/${req.id}`)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
