export default function ProgressBar({ pct, state = 'ok', label }) {
  const width = Math.max(0, Math.min(pct, 100))
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div className={`progress-fill progress-${state}`} style={{ width: `${width}%` }} />
    </div>
  )
}
