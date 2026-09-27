const COLOR_MAP = {
  Amber: 'badge-warning', Red: 'badge-danger', Green: 'badge-success', Low: 'badge-success',
  Medium: 'badge-warning', High: 'badge-danger', Pending: 'badge-warning', 'Pending Approval': 'badge-warning',
  Approved: 'badge-success', Completed: 'badge-success', Rejected: 'badge-danger', Available: 'badge-success',
  Working: 'badge-success', 'On Leave': 'badge-danger', Cancelled: 'badge-muted', Submitted: 'badge-info',
}

export default function StatusBadge({ label }) {
  return <span className={`badge ${COLOR_MAP[label] || 'badge-muted'}`}>{label}</span>
}
