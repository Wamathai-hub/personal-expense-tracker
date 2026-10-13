import { useId } from 'react'

export default function Card({ title, subtitle, action, children, className = '' }) {
  const titleId = useId()
  return (
    <section className={`card ${className}`} aria-labelledby={title ? titleId : undefined}>
      {title && (
        <div className="card-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p className="muted small">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
