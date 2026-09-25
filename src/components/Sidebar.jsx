import { NavLink } from 'react-router-dom'
import { currentManager } from '../data/mockData'

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Approvals', to: '/approvals' },
  { label: 'Team', to: '/team' },
  { label: 'Leave Calendar', to: '/calendar' },
  { label: 'Leave Taken Dashboard', to: '/leave-dashboard' },
  { label: 'My Leave', to: '/my-leave' },
  { label: 'Profile', to: '/profile' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white min-h-screen px-3 py-4">
      <div className="card mb-4 text-center py-4 text-sm font-semibold text-gray-500">
        LOGO / PRODUCT
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-gray-200 border-gray-300 text-gray-900'
                  : 'border-transparent text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 px-3 text-xs text-gray-400">
        Signed in as
        <div className="text-gray-600 font-medium">{currentManager.name}</div>
        <div>{currentManager.role}</div>
      </div>
    </aside>
  )
}
