import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import {
  leaveRequests,
  teamHierarchy,
  coverageReplacementAnalysis,
  teamStaffingImpact,
  coverageRecommendation,
} from '../data/mockData'

function HierarchyNode({ member }) {
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
      <div>
        <div className="font-medium text-sm">{member.name}</div>
        <div className="text-xs text-gray-500">
          {member.role}
          {member.onLeaveDate ? ` • On leave ${member.onLeaveDate}` : ''}
          {member.workload ? ` • Workload: ${member.workload}` : ''}
        </div>
        <div className="text-xs text-gray-500">Can cover: {member.canCover}</div>
      </div>
      <StatusBadge label={member.status} />
    </div>
  )
}

export default function RequestReview() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [decision, setDecision] = useState(null)

  const request = leaveRequests.find((r) => r.id === requestId) || leaveRequests[2]
  const hierarchy = teamHierarchy // demo dataset (keyed to the selected/high-impact request)

  const handleDecision = (value) => {
    setDecision(value)
    // In a real integration this would call the approvals API, then navigate back.
    setTimeout(() => navigate('/approvals'), 600)
  }

  return (
    <Layout
      breadcrumb="Manager / Approvals / Request + Team Impact"
      title="Request + Team Impact"
      subtitle="Review coverage before approving or rejecting this request."
    >
      {/* Request summary bar */}
      <div className="card mb-6 grid grid-cols-5 gap-4">
        <div>
          <div className="text-xs text-gray-500">Selected Employee</div>
          <div className="font-semibold">{request.employee}</div>
          <div className="text-xs text-gray-500">{request.role} • {request.team}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Leave Dates</div>
          <div className="font-semibold">{request.dates.join(', ')}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Status</div>
          <StatusBadge label={decision === 'approve' ? 'Approved' : decision === 'reject' ? 'Rejected' : request.status} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Coverage Status</div>
          <div className="text-sm">
            Min staffing: {request.minStaffingRequired ?? 8} · Available: {request.currentAvailable ?? 7} · Shortage: {request.shortageIfApproved ?? 1}
          </div>
          <StatusBadge label={request.coverageStatus ?? 'Amber'} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Backups</div>
          <div className="text-sm">Primary: {request.primaryBackup ?? 'Amanda Lee'}</div>
          <div className="text-sm">Secondary: {request.secondaryBackup ?? 'Kumar Ravi'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Hierarchy / reporting structure */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-1">Hierarchy / Reporting Structure</h2>
          <p className="text-xs text-gray-500 mb-3">Selected employee, direct reports and supporting team members.</p>
          <div className="mb-2">
            <div className="font-semibold text-sm">{hierarchy.selectedEmployee.name}</div>
            <div className="text-xs text-gray-500 mb-3">
              {hierarchy.selectedEmployee.role} | {hierarchy.selectedEmployee.team}
            </div>
          </div>
          <div className="flex flex-col gap-2 pl-3 border-l-2 border-gray-200">
            {hierarchy.directReports.map((m) => (
              <HierarchyNode key={m.name} member={m} />
            ))}
          </div>
        </div>

        {/* Coverage & replacement analysis */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Coverage & Replacement Analysis</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium">Can Cover?</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Availability</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {coverageReplacementAnalysis.map((row) => (
                <tr key={row.employee} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium">{row.employee}</td>
                  <td className="py-2">{row.canCover}</td>
                  <td className="py-2">{row.coverageType}</td>
                  <td className="py-2">{row.availability}</td>
                  <td className="py-2 text-gray-500">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-sm font-semibold mt-5 mb-2">Team Staffing Impact</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Required</th>
                <th className="py-2 font-medium">Available</th>
                <th className="py-2 font-medium">If Approved</th>
                <th className="py-2 font-medium">Result</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamStaffingImpact.map((row) => (
                <tr key={row.date} className="border-b border-gray-100 last:border-0">
                  <td className="py-2">{row.date}</td>
                  <td className="py-2">{row.required}</td>
                  <td className="py-2">{row.available}</td>
                  <td className="py-2">{row.ifApproved}</td>
                  <td className="py-2">{row.result}</td>
                  <td className="py-2"><StatusBadge label={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-2">Coverage Recommendation</h2>
        <p className="text-sm text-gray-600">💡 {coverageRecommendation}</p>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={() => navigate('/approvals')}>
          Return to Request Review
        </button>
        <button className="btn-secondary border-red-300 text-red-700" onClick={() => handleDecision('reject')}>
          Reject
        </button>
        <button className="btn-primary" onClick={() => handleDecision('approve')}>
          Approve
        </button>
      </div>
    </Layout>
  )
}
