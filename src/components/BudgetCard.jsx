import { useId, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProgressBar from './ProgressBar'
import Field from './Field'
import { budgetStatus } from '../utils/calculations'
import { validateBudgetAmount } from '../utils/validation'

const STATUS_TEXT = { ok: 'On track', warning: 'Nearly used', exceeded: 'Over budget' }

export default function BudgetCard({ title, spent, budget, color, hero = false, onSave, onClear }) {
  const { format, settings } = useApp()
  const id = useId()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const status = budgetStatus(spent, budget)
  const hasBudget = budget > 0

  const startEditing = () => {
    setDraft(hasBudget ? String(budget) : '')
    setError('')
    setEditing(true)
  }

  const submit = (event) => {
    event.preventDefault()
    const result = validateBudgetAmount(draft)
    if (result.error) {
      setError(result.error)
      return
    }
    onSave(result.amount)
    setEditing(false)
  }

  let remainingText = ''
  if (hasBudget) {
    if (status.state === 'exceeded') remainingText = `Over by ${format(status.over)}`
    else if (status.remaining === 0) remainingText = 'Budget fully used'
    else remainingText = `${format(status.remaining)} left`
  }

  return (
    <article className={`card budget-card ${hero ? 'budget-hero' : ''} budget-${status.state}`}>
      <div className="budget-top">
        <h3>
          {color && <span className="dot" style={{ background: color }} />}
          {title}
        </h3>
        {hasBudget && !editing && <span className={`chip chip-${status.state}`}>{STATUS_TEXT[status.state]}</span>}
      </div>

      {editing ? (
        <form onSubmit={submit} noValidate className="budget-form">
          <Field id={`${id}-amount`} label="Monthly budget" error={error}>
            <div className="input-group">
              <span className="input-prefix" aria-hidden="true">
                {settings.currency}
              </span>
              <input
                id={`${id}-amount`}
                className="input"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  setError('')
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-amount-error` : undefined}
                autoFocus
              />
            </div>
          </Field>
          <div className="budget-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              Save budget
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : hasBudget ? (
        <>
          <p className="budget-figures">
            <strong>{format(spent)}</strong> <span className="muted">of {format(budget)}</span>
          </p>
          <ProgressBar pct={status.pct} state={status.state} label={`${title} budget used`} />
          <p className="budget-meta small">
            <span>{remainingText}</span>
            <span className="muted">{Math.round(status.pct)}% used</span>
          </p>
          <div className="budget-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={startEditing}>
              <Pencil size={15} aria-hidden="true" /> Edit
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
              <Trash2 size={15} aria-hidden="true" /> Remove
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="budget-figures">
            <strong>{format(spent)}</strong> <span className="muted">spent, no budget set</span>
          </p>
          <div className="budget-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={startEditing}>
              Set budget
            </button>
          </div>
        </>
      )}
    </article>
  )
}
