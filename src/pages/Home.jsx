import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import { kpis, leaveRequests, weekAtAGlance, coverageSettings } from '../data/mockData'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Layout
      breadcrumb="Manager / Home"
      title="Manager Home"
      subtitle="Review approvals, team availability and coverage risks at a glance."
      actions={
        <>
          <button className="btn-secondary" onClick={() => navigate('/calendar')}>
            Open Calendar
          </button>
          <button className="btn-primary" onClick={() => navigate('/approvals')}>
            Review Approvals
          </button>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="People Scheduled Today" value={kpis.peopleScheduledToday} hint="Across all active teams" />
        <StatCard
          label="On Leave Today"
          value={kpis.onLeaveToday.total}
          hint={`${kpis.onLeaveToday.annual} annual • ${kpis.onLeaveToday.sick} sick`}
        />
        <StatCard label="Pending Approvals" value={kpis.pendingApprovals} hint="Manager action required" />
        <StatCard label="Coverage Alerts" value={kpis.coverageAlerts} hint="Potential staffing gaps" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <h2 className="text-lg font-semibold mb-3">Requests awaiting approval</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium">Dates</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Impact</th>
                <th className="py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3">{req.employee}</td>
                  <td className="py-3 text-gray-600">{req.dates.join(', ')}</td>
                  <td className="py-3 text-gray-600">{req.type}</td>
                  <td className="py-3 text-gray-600">{req.impact}</td>
                  <td className="py-3">
                    <button
                      className="text-xs font-medium text-gray-900 underline underline-offset-2"
                      onClick={() => navigate(`/approvals/${req.id}`)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">This week at a glance</h2>
            <div className="flex flex-col gap-2">
              {weekAtAGlance.map((d) => (
                <div key={d.day} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <span className="font-semibold">{d.day}</span> — {d.offCount} people off • {d.status}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Schedule & Coverage</h2>
            <label className="block text-xs font-medium text-gray-600 mb-1">Minimum staffing per team</label>
            <input
              readOnly
              value={`${coverageSettings.minStaffingPerTeam} employees`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 bg-gray-50"
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Maximum people off at once</label>
            <input
              readOnly
              value={`${coverageSettings.maxPeopleOffAtOnce} employees`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 bg-gray-50"
            />
            <div className="flex items-center justify-between text-sm py-1">
              <span>Warn when coverage is low</span>
              <input type="checkbox" defaultChecked={coverageSettings.warnWhenCoverageLow} readOnly />
            </div>
            <div className="flex items-center justify-between text-sm py-1">
              <span>Block leave when limit exceeded</span>
              <input type="checkbox" defaultChecked={coverageSettings.blockLeaveWhenLimitExceeded} readOnly />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
