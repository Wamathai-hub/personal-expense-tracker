import { useEffect, useRef, useState } from 'react'
import Field from './Field'
import { categoriesFor } from '../data/categories'
import { todayISO } from '../utils/dates'
import { validateTransaction } from '../utils/validation'

const blank = () => ({
  type: 'expense',
  title: '',
  amount: '',
  category: categoriesFor('expense')[0],
  date: todayISO(),
  notes: '',
})

const fromTransaction = (t) => ({
  type: t.type,
  title: t.title,
  amount: String(t.amount),
  category: t.category,
  date: t.date,
  notes: t.notes || '',
})

export default function TransactionForm({ id, initial, currency, onSubmit }) {
  const [values, setValues] = useState(() => (initial ? fromTransaction(initial) : blank()))
  const [errors, setErrors] = useState({})
  const [focusTick, setFocusTick] = useState(0)
  const formRef = useRef(null)

  useEffect(() => {
    if (focusTick > 0) formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [focusTick])

  const change = (field) => (event) => {
    const { value } = event.target
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const changeType = (type) => {
    setValues((prev) => ({
      ...prev,
      type,
      category: categoriesFor(type).includes(prev.category) ? prev.category : categoriesFor(type)[0],
    }))
    setErrors((prev) => ({ ...prev, type: undefined, category: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const result = validateTransaction(values)
    const found = Object.fromEntries(Object.entries(result.errors).filter(([, v]) => v))
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setFocusTick((n) => n + 1)
      return
    }
    onSubmit(result.cleaned)
  }

  const describe = (field) => (errors[field] ? `${id}-${field}-error` : undefined)

  return (
    <form id={id} ref={formRef} onSubmit={submit} noValidate className="form-grid">
      <fieldset className="field span-2">
        <legend>Type</legend>
        <div className="segmented">
          {[
            ['expense', 'Expense'],
            ['income', 'Income'],
          ].map(([value, label]) => (
            <label key={value} className={`segmented-option ${values.type === value ? 'is-active' : ''}`}>
              <input
                type="radio"
                name={`${id}-type`}
                value={value}
                checked={values.type === value}
                onChange={() => changeType(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="span-2">
        <Field id={`${id}-title`} label="Title" error={errors.title}>
          <input
            id={`${id}-title`}
            className="input"
            type="text"
            value={values.title}
            onChange={change('title')}
            maxLength={80}
            placeholder={values.type === 'income' ? 'e.g. Monthly salary' : 'e.g. Weekly groceries'}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describe('title')}
            data-autofocus
          />
        </Field>
      </div>

      <Field id={`${id}-amount`} label="Amount" error={errors.amount}>
        <div className="input-group">
          <span className="input-prefix" aria-hidden="true">
            {currency}
          </span>
          <input
            id={`${id}-amount`}
            className="input"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={values.amount}
            onChange={change('amount')}
            placeholder="0.00"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={describe('amount')}
          />
        </div>
      </Field>

      <Field id={`${id}-date`} label="Date" error={errors.date}>
        <input
          id={`${id}-date`}
          className="input"
          type="date"
          value={values.date}
          onChange={change('date')}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={describe('date')}
        />
      </Field>

      <div className="span-2">
        <Field id={`${id}-category`} label="Category" error={errors.category}>
          <select
            id={`${id}-category`}
            className="select"
            value={values.category}
            onChange={change('category')}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={describe('category')}
          >
            {categoriesFor(values.type).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="span-2">
        <Field id={`${id}-notes`} label="Notes" optional error={errors.notes}>
          <textarea
            id={`${id}-notes`}
            className="textarea"
            rows={3}
            value={values.notes}
            onChange={change('notes')}
            maxLength={250}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={describe('notes')}
          />
        </Field>
      </div>
    </form>
  )
}
