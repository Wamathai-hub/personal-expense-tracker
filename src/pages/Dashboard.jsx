import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Info, Percent, Plus, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import MonthPicker from '../components/MonthPicker'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import MonthlyBarChart from '../components/MonthlyBarChart'
import CategoryDonut from '../components/CategoryDonut'
import {
  byDateDesc,
  evaluateBudgets,
  expensesByCategory,
  filterByMonth,
  lastMonths,
  monthlySeries,
  summarize,
} from '../utils/calculations'
import { currentMonth, daysInMonth, formatDate, monthLabel, todayISO } from '../utils/dates'
import { formatPercent } from '../utils/format'

export default function Dashboard() {
  const { transactions, budgets, month, setMonth, format, hasSample, removeSampleData } = useApp()
  const toast = useToast()

  const monthTx = useMemo(() => filterByMonth(transactions, month), [transactions, month])
  const summary = useMemo(() => summarize(monthTx), [monthTx])
  const allTime = useMemo(() => summarize(transactions), [transactions])
  const series = useMemo(() => monthlySeries(transactions, lastMonths(month, 6)), [transactions, month])
  const breakdown = useMemo(() => expensesByCategory(monthTx), [monthTx])
  const recent = useMemo(() => [...monthTx].sort(byDateDesc).slice(0, 6), [monthTx])
  const overallBudget = useMemo(
    () => evaluateBudgets(transactions, budgets, month).find((item) => item.key === 'overall'),
    [transactions, budgets, month],
  )

  const expenses = monthTx.filter((t) => t.type === 'expense')
  const largest = expenses.reduce((best, t) => (!best || t.amount > best.amount ? t : best), null)
  const daysCounted = month === currentMonth() ? Number(todayISO().slice(8, 10)) : daysInMonth(month)
  const averageDaily = daysCounted > 0 ? summary.expenses / daysCounted : 0
  const hasChartData = series.some((m) => m.income > 0 || m.expenses > 0)

  let savingsHint = 'Share of income you kept'
  if (summary.savingsRate === null) savingsHint = 'Add income to see your rate'
  else if (summary.savingsRate < 0) savingsHint = 'You spent more than you earned'

  if (transactions.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Dashboard" subtitle="Your income, spending and savings at a glance." />
        <EmptyState
          icon={Wallet}
          title="Add your first transaction"
          text="Record some income or an expense and your dashboard will fill in with totals, charts and a monthly summary."
          action={
            <Link to="/transactions" state={{ openForm: true }} className="btn btn-primary">
              <Plus size={18} aria-hidden="true" /> Add transaction
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Dashboard" subtitle={`Overview for ${monthLabel(month)}`}>
        <MonthPicker value={month} onChange={setMonth} transactions={transactions} />
      </PageHeader>

      {hasSample && (
        <div className="banner banner-info" role="status">
          <Info size={18} aria-hidden="true" />
          <p>
            You&apos;re viewing sample transactions so you can explore the app. They&apos;re labelled
            &ldquo;Sample&rdquo; and never replace anything you add yourself.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              removeSampleData()
              toast.success('Sample data removed.')
            }}
          >
            Remove sample data
          </button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          label="Total income"
          value={format(summary.income)}
          hint={`Received in ${monthLabel(month)}`}
          icon={TrendingUp}
          tone="income"
        />
        <StatCard
          label="Total expenses"
          value={format(summary.expenses)}
          hint={`Spent in ${monthLabel(month)}`}
          icon={TrendingDown}
          tone="expense"
        />
        <StatCard
          label="Balance"
          value={format(summary.balance)}
          hint={`All-time balance ${format(allTime.balance)}`}
          icon={Scale}
          tone="navy"
        />
        <StatCard
          label="Savings rate"
          value={formatPercent(summary.savingsRate)}
          hint={savingsHint}
          icon={Percent}
        />
      </div>

      <div className="grid-main">
        <Card title="Income vs expenses" subtitle={`Last 6 months up to ${monthLabel(month)}`}>
          {hasChartData ? (
            <MonthlyBarChart series={series} />
          ) : (
            <EmptyState compact title="No activity in these months" text="Pick another month or add transactions." />
          )}
        </Card>
        <Card title="Expense breakdown" subtitle={monthLabel(month)}>
          {breakdown.length > 0 ? (
            <CategoryDonut data={breakdown} />
          ) : (
            <EmptyState compact title="No expenses this month" text="Expenses you add will be grouped by category here." />
          )}
        </Card>
      </div>

      <div className="grid-even">
        <Card
          title="Recent transactions"
          subtitle={monthLabel(month)}
          action={
            <Link to="/transactions" className="link">
              View all
            </Link>
          }
        >
          {recent.length > 0 ? (
            <ul className="recent-list">
              {recent.map((t) => (
                <li key={t.id} className="recent-item">
                  <span className={`recent-icon recent-${t.type}`}>
                    {t.type === 'income' ? (
                      <ArrowDownLeft size={16} aria-hidden="true" />
                    ) : (
                      <ArrowUpRight size={16} aria-hidden="true" />
                    )}
                  </span>
                  <div className="recent-main">
                    <span className="recent-title">
                      {t.title}
                      {t.sample && <span className="chip chip-sample">Sample</span>}
                    </span>
                    <span className="recent-meta muted small">
                      <span>{t.category}</span>
                      <span>{formatDate(t.date)}</span>
                    </span>
                  </div>
                  <span className={`amount amount-${t.type}`}>
                    {t.type === 'income' ? '+' : '−'}
                    {format(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact title="No transactions this month" text="Transactions dated in this month show up here." />
          )}
        </Card>

        <Card title="Monthly summary" subtitle={monthLabel(month)}>
          <dl className="summary-list">
            <div>
              <dt>Transactions</dt>
              <dd>{monthTx.length}</dd>
            </div>
            <div>
              <dt>Average daily spending</dt>
              <dd>{format(averageDaily)}</dd>
            </div>
            <div>
              <dt>Largest expense</dt>
              <dd>{largest ? `${largest.title}, ${format(largest.amount)}` : '—'}</dd>
            </div>
            <div>
              <dt>Top category</dt>
              <dd>
                {breakdown[0]
                  ? `${breakdown[0].name}, ${Math.round((breakdown[0].value / summary.expenses) * 100)}% of spending`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Overall budget</dt>
              <dd>
                {overallBudget ? (
                  <>
                    {Math.round(overallBudget.pct)}% of {format(overallBudget.budget)} used
                  </>
                ) : (
                  <Link to="/budgets" className="link">
                    Set a monthly budget
                  </Link>
                )}
              </dd>
            </div>
            <div>
              <dt>All-time balance</dt>
              <dd>{format(allTime.balance)}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  )
}
