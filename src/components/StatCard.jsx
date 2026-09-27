export default function StatCard({ label, value, hint, icon, tone = 'default' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  )
}
