import { useState } from 'react'
import Layout from '../components/Layout'
import { orgHierarchy, employeeDetailLookup } from '../data/mockData'

function OrgRow({ node, depth = 0, onSelect, selectedName, expanded, toggle }) {
  const isExpanded = expanded[node.name] ?? true
  const hasChildren = node.children && node.children.length > 0

  return (
    <>
      <tr
        className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${
          selectedName === node.name ? 'bg-gray-50' : ''
        }`}
        onClick={() => onSelect(node.name)}
      >
        <td className="py-2" style={{ paddingLeft: `${depth * 24 + 8}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                className="text-xs w-4 text-gray-500"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(node.name)
                }}
              >
                {isExpanded ? '−' : '+'}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <span className="font-medium">{node.name}</span>
          </div>
        </td>
        <td className="py-2 text-gray-600">{node.role}</td>
        <td className="py-2 text-gray-600">{node.reportsTo}</td>
        <td className="py-2 text-gray-600">{node.teamSize}</td>
        <td className="py-2 text-gray-600">{node.availability}</td>
        <td className="py-2 text-gray-600">{node.coverage ?? 'Expand Role'}</td>
      </tr>
      {hasChildren &&
        isExpanded &&
        node.children.map((child) => (
          <OrgRow
            key={child.name}
            node={child}
            depth={depth + 1}
            onSelect={onSelect}
            selectedName={selectedName}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
    </>
  )
}

export default function Team() {
  const [selectedName, setSelectedName] = useState('Nora Smith')
  const [expanded, setExpanded] = useState({})

  const toggle = (name) => setExpanded((prev) => ({ ...prev, [name]: !(prev[name] ?? true) }))
  const detail = employeeDetailLookup[selectedName]

  return (
    <Layout
      breadcrumb="Manager / Team / Employee Details"
      title="Employee & Role Hierarchy"
      subtitle="Expand each role to see reporting lines, employee details, leave impact and available backup."
      actions={<button className="btn-secondary">Search</button>}
    >
      <div className="card mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Hierarchy / Employee</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Reports To</th>
              <th className="py-2 font-medium">Team Size</th>
              <th className="py-2 font-medium">Availability</th>
              <th className="py-2 font-medium">Coverage / Action</th>
            </tr>
          </thead>
          <tbody>
            <OrgRow
              node={orgHierarchy}
              onSelect={setSelectedName}
              selectedName={selectedName}
              expanded={expanded}
              toggle={toggle}
            />
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Selected Employee — {selectedName}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              {detail.id} • {detail.role} • {detail.group} • Reports To: {detail.reportsTo} • Direct Reports: {detail.directReports}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              {detail.schedule} • Upcoming Leave: {detail.upcomingLeave} • Leave Balance: {detail.leaveBalance} days • Backup: {detail.backup} • Staffing: {detail.staffing}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
