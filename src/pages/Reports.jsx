import { useMemo, useState } from 'react'
import { Download, Percent, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import MonthlyBarChart from '../components/MonthlyBarChart'
import CategoryDonut from '../components/CategoryDonut'
import TrendChart from '../components/TrendChart'
import { colorFor } from '../data/categories'
import { expensesByCategory, filterByRange, monthlySeries, summarize, trendSeries } from '../utils/calculations'
import { downloadCsv, transactionsToCsv } from '../utils/csv'
import { currentMonth, monthEnd, monthStart, monthsBetween, shiftMonth, todayISO } from '../utils/dates'
import { formatPercent } from '../utils/format'

const buildPresets = () => {
  const thisMonth = currentMonth()
  const year = thisMonth.slice(0, 4)
  return [
    { id: 'month', label: 'This month', from: monthStart(thisMonth), to: monthEnd(thisMonth) },
    { id: '3m', label: 'Last 3 months', from: monthStart(shiftMonth(thisMonth, -2)), to: monthEnd(thisMonth) },
    { id: '6m', label: 'Last 6 months', from: monthStart(shiftMonth(thisMonth, -5)), to: monthEnd(thisMonth) },
    { id: 'year', label: 'This year', from: `${year}-01-01`, to: `${year}-12-31` },
    { id: 'all', label: 'All time', from: '', to: '' },
  ]
}

export default function Reports() {
  const { transactions, settings, format } = useApp()
  const toast = useToast()
  const presets = useMemo(buildPresets, [])
  const [preset, setPreset] = useState('6m')
  const [range, setRange] = useState(() => {
    const initial = presets.find((p) => p.id === '6m')
    return { from: initial.from, to: initial.to }
  })

  // Open-ended ends ("All time" or a cleared date) fall back to the first and last transaction.
  const bounds = useMemo(() => {
    if (transactions.length === 0) return { min: todayISO(), max: todayISO() }
    const dates = transactions.map((t) => t.date).sort()
    return { min: dates[0], max: dates[dates.length - 1] }
  }, [transactions])
  const from = range.from || bounds.min
  const to = range.to || bounds.max
  const invalid = from > to

  const rangeTx = useMemo(() => (invalid ? [] : filterByRange(transactions, from, to)), [transactions, from, to, invalid])
  const summary = useMemo(() => summarize(rangeTx), [rangeTx])
  const series = useMemo(
    () => (invalid ? [] : monthlySeries(rangeTx, monthsBetween(from.slice(0, 7), to.slice(0, 7)))),
    [rangeTx, from, to, invalid],
  )
  const breakdown = useMemo(() => expensesByCategory(rangeTx), [rangeTx])
  const trend = useMemo(() => trendSeries(rangeTx, from, to), [rangeTx, from, to])
  const topCategories = breakdown.slice(0, 5)
  const hasSpending = summary.expenses > 0

  const choosePreset = (p) => {
    setPreset(p.id)
    setRange({ from: p.from, to: p.to })
  }
  const changeDate = (field) => (event) => {
    setPreset('custom')
    setRange((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const exportCsv = () => {
    downloadCsv(`expense-tracker_${from}_to_${to}.csv`, transactionsToCsv(rangeTx, settings.currency))
    toast.success(`Exported ${rangeTx.length} ${rangeTx.length === 1 ? 'transaction' : 'transactions'} to CSV.`)
  }

  return (
    <div className="page">
      <PageHeader title="Reports" subtitle="Compare months, see where money goes and export your data.">
        <button type="button" className="btn btn-primary" onClick={exportCsv} disabled={rangeTx.length === 0}>
          <Download size={18} aria-hidden="true" /> Export CSV
        </button>
      </PageHeader>

      <section className="card filters" aria-label="Date range">
        <div className="chip-row" role="group" aria-label="Quick ranges">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip-btn ${preset === p.id ? 'is-active' : ''}`}
              aria-pressed={preset === p.id}
              onClick={() => choosePreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="filter-field">
          <label htmlFor="report-from">From</label>
          <input id="report-from" className="input" type="date" value={range.from} onChange={changeDate('from')} />
        </div>
        <div className="filter-field">
          <label htmlFor="report-to">To</label>
          <input id="report-to" className="input" type="date" value={range.to} onChange={changeDate('to')} />
        </div>
        {invalid && (
          <p className="field-error filter-error" role="alert">
            The start date is after the end date. Adjust the range to see results.
          </p>
        )}
      </section>

      <div className="stats-grid">
        <StatCard label="Income" value={format(summary.income)} icon={TrendingUp} tone="income" hint="In the selected range" />
        <StatCard label="Expenses" value={format(summary.expenses)} icon={TrendingDown} tone="expense" hint="In the selected range" />
        <StatCard label="Net" value={format(summary.balance)} icon={Scale} tone="navy" hint="Income minus expenses" />
        <StatCard
          label="Savings rate"
          value={formatPercent(summary.savingsRate)}
          icon={Percent}
          hint={summary.savingsRate === null ? 'No income in this range' : 'Share of income you kept'}
        />
      </div>

      {rangeTx.length === 0 ? (
        <EmptyState
          title="No transactions in this range"
          text="Choose a wider range, or add transactions dated within it."
        />
      ) : (
        <>
          <Card title="Monthly income and expenses" subtitle="Comparison for each month in the range">
            <MonthlyBarChart series={series} />
            <div className="table-wrap report-table">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col" className="num">Income</th>
                    <th scope="col" className="num">Expenses</th>
                    <th scope="col" className="num">Net</th>
                    <th scope="col" className="num">Savings rate</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((m) => (
                    <tr key={m.ym}>
                      <td data-label="Month">{m.label}</td>
                      <td data-label="Income" className="num amount-income">{format(m.income)}</td>
                      <td data-label="Expenses" className="num amount-expense">{format(m.expenses)}</td>
                      <td data-label="Net" className="num">{format(m.net)}</td>
                      <td data-label="Savings rate" className="num">{formatPercent(m.savingsRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Spending trend" subtitle={trend.length > 0 && trend[0].key.length === 10 ? 'Daily spending' : 'Monthly spending'}>
            {hasSpending ? <TrendChart points={trend} /> : <EmptyState compact title="No spending in this range" />}
          </Card>

          <div className="grid-even">
            <Card title="Expense distribution" subtitle="Share of spending by category">
              {hasSpending ? <CategoryDonut data={breakdown} /> : <EmptyState compact title="No expenses in this range" />}
            </Card>
            <Card title="Highest spending categories" subtitle="Top five in the selected range">
              {topCategories.length > 0 ? (
                <ol className="rank-list">
                  {topCategories.map((c, index) => (
                    <li key={c.name}>
                      <div className="rank-head">
                        <span className="rank-name">
                          <span className="rank-index">{index + 1}</span>
                          <span className="dot" style={{ background: colorFor(c.name) }} />
                          {c.name}
                        </span>
                        <span className="rank-value">
                          {format(c.value)}
                          <span className="muted small"> {Math.round((c.value / summary.expenses) * 100)}%</span>
                        </span>
                      </div>
                      <div className="rank-bar">
                        <span style={{ width: `${(c.value / topCategories[0].value) * 100}%`, background: colorFor(c.name) }} />
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState compact title="No expenses in this range" />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
