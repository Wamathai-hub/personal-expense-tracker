import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, text, action, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'empty-compact' : ''}`}>
      <span className="empty-icon">
        <Icon size={compact ? 22 : 28} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  )
}
