export default function StatCard({ label, value, hint }) {
  return (
    <div className="card">
      <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  )
}
