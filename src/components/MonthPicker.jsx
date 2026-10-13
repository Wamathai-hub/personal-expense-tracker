import { useId, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { currentMonth, monthLabel, shiftMonth } from '../utils/dates'

export default function MonthPicker({ value, onChange, transactions = [] }) {
  const id = useId()
  const options = useMemo(() => {
    const months = new Set([value, currentMonth()])
    for (let i = 1; i <= 11; i += 1) months.add(shiftMonth(currentMonth(), -i))
    for (const t of transactions) months.add(t.date.slice(0, 7))
    return [...months].sort().reverse()
  }, [value, transactions])

  return (
    <div className="month-picker" role="group" aria-label="Select month">
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <label className="visually-hidden" htmlFor={id}>
        Month
      </label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((ym) => (
          <option key={ym} value={ym}>
            {monthLabel(ym)}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Next month"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
      {value !== currentMonth() && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(currentMonth())}>
          This month
        </button>
      )}
    </div>
  )
}
