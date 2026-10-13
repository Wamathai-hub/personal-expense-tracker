export default function StatCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className="stat-icon">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="stat-value">{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  )
}
