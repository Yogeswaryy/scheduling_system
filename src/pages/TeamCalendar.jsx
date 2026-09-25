import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { calendarWeek } from '../data/mockData'

const TYPE_COLORS = {
  'Annual leave': 'bg-blue-50 border-blue-200 text-blue-800',
  'Sick leave': 'bg-rose-50 border-rose-200 text-rose-800',
  Pending: 'bg-gray-100 border-gray-300 text-gray-700',
  Unpaid: 'bg-orange-50 border-orange-200 text-orange-800',
  Parental: 'bg-purple-50 border-purple-200 text-purple-800',
}

export default function TeamCalendar() {
  const navigate = useNavigate()

  return (
    <Layout
      breadcrumb="Manager / Leave Calendar"
      title="Team Leave Calendar"
      subtitle="See who's off before approving or building the schedule."
      actions={
        <button className="btn-primary" onClick={() => navigate('/my-leave/apply')}>
          + Apply Leave
        </button>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <button className="btn-secondary">Week ▾</button>
        <span className="text-sm text-gray-500">Public holidays: On</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 pr-4 font-medium">Employee</th>
              {calendarWeek.days.map((day) => (
                <th key={day} className="text-left py-2 px-3 font-medium whitespace-nowrap">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarWeek.rows.map((row) => (
              <tr key={row.employee} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4">
                  <div className="font-medium">{row.employee}</div>
                  <div className="text-xs text-gray-500">{row.team}</div>
                </td>
                {calendarWeek.days.map((day) => {
                  const entry = row.entries[day]
                  return (
                    <td key={day} className="py-3 px-3 align-top">
                      {entry && (
                        <div className={`text-xs border rounded-full px-2 py-1 inline-block ${TYPE_COLORS[entry] || 'bg-gray-100 border-gray-300'}`}>
                          {entry}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
