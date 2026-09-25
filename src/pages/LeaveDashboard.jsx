import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import {
  leaveDashboardSummary,
  leaveTakenByEmployee,
  leaveTypeDistribution,
  monthlyLeaveTrend,
  upcomingLeaveOverview,
  lowBalanceHighUsage,
} from '../data/mockData'

export default function LeaveDashboard() {
  const maxTrend = Math.max(...monthlyLeaveTrend.map((m) => m.days))

  return (
    <Layout
      breadcrumb="Manager / Team / Leave Analytics"
      title="Employee Leave Taken Dashboard"
      subtitle="Track leave usage, balance and trends for employees within your assigned organizational groups."
      actions={
        <>
          <button className="btn-secondary">Export</button>
          <button className="btn-primary">Open Calendar</button>
        </>
      }
    >
      <div className="grid grid-cols-6 gap-3 mb-6">
        <StatCard label="Total Leave Taken" value={`${leaveDashboardSummary.totalLeaveTaken} days`} />
        <StatCard label="Avg Leave / Employee" value={`${leaveDashboardSummary.averageLeavePerEmployee} days`} />
        <StatCard label="Employees on Leave" value={leaveDashboardSummary.employeesOnLeave} />
        <StatCard label="Pending Leave" value={leaveDashboardSummary.pendingLeave} />
        <StatCard
          label="Highest Utilisation"
          value={`${leaveDashboardSummary.highestUtilisation.percent}%`}
          hint={leaveDashboardSummary.highestUtilisation.employee}
        />
        <StatCard label="Low Balance Employees" value={leaveDashboardSummary.lowBalanceEmployees} />
      </div>

      <div className="card mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Leave Taken by Employee</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Employee</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Annual</th>
              <th className="py-2 font-medium">Sick</th>
              <th className="py-2 font-medium">Other</th>
              <th className="py-2 font-medium">Total Taken</th>
              <th className="py-2 font-medium">Pending</th>
              <th className="py-2 font-medium">Available</th>
              <th className="py-2 font-medium">Utilisation</th>
            </tr>
          </thead>
          <tbody>
            {leaveTakenByEmployee.map((row) => (
              <tr key={row.employee} className="border-b border-gray-100 last:border-0">
                <td className="py-2 font-medium">{row.employee}</td>
                <td className="py-2 text-gray-600">{row.role}</td>
                <td className="py-2">{row.annual}</td>
                <td className="py-2">{row.sick}</td>
                <td className="py-2">{row.other}</td>
                <td className="py-2 font-medium">{row.totalTaken}</td>
                <td className="py-2">{row.pending}</td>
                <td className="py-2">{row.available}</td>
                <td className="py-2">{row.utilisation}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Leave Type Distribution</h2>
          <div className="flex flex-col gap-3">
            {leaveTypeDistribution.map((t) => (
              <div key={t.type}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{t.type}</span>
                  <span>{t.percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500" style={{ width: `${t.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Monthly Leave Trend</h2>
          <div className="flex items-end gap-3 h-32">
            {monthlyLeaveTrend.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gray-300 rounded-t"
                  style={{ height: `${(m.days / maxTrend) * 100}%` }}
                />
                <span className="text-[10px] text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Upcoming Leave Overview</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium">Dates</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingLeaveOverview.map((row) => (
                <tr key={row.employee + row.dates} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium">{row.employee}</td>
                  <td className="py-2 text-gray-600">{row.dates}</td>
                  <td className="py-2"><StatusBadge label={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Low Balance / High Usage Alert</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Employee</th>
              <th className="py-2 font-medium">Available</th>
              <th className="py-2 font-medium">Utilisation</th>
              <th className="py-2 font-medium">Alert</th>
            </tr>
          </thead>
          <tbody>
            {lowBalanceHighUsage.map((row) => (
              <tr key={row.employee} className="border-b border-gray-100 last:border-0">
                <td className="py-2 font-medium">{row.employee}</td>
                <td className="py-2">{row.available} days</td>
                <td className="py-2">{row.utilisation}%</td>
                <td className="py-2 text-amber-700">{row.alert}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
