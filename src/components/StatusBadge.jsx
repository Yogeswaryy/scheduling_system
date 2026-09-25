const COLOR_MAP = {
  Amber: 'bg-amber-100 text-amber-800',
  Red: 'bg-red-100 text-red-800',
  Green: 'bg-green-100 text-green-800',
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-amber-100 text-amber-800',
  High: 'bg-red-100 text-red-800',
  Pending: 'bg-gray-100 text-gray-700',
  'Pending Approval': 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Available: 'bg-green-100 text-green-800',
  'On Leave': 'bg-red-100 text-red-800',
}

export default function StatusBadge({ label }) {
  const classes = COLOR_MAP[label] || 'bg-gray-100 text-gray-700'
  return <span className={`badge ${classes}`}>{label}</span>
}
