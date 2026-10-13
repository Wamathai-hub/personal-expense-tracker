import { useMemo } from 'react'
import { CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import MonthPicker from '../components/MonthPicker'
import BudgetCard from '../components/BudgetCard'
import { EXPENSE_CATEGORIES, colorFor } from '../data/categories'
import { evaluateBudgets, expensesByCategory, filterByMonth, summarize, sumAmounts } from '../utils/calculations'
import { monthLabel } from '../utils/dates'

export default function Budgets() {
  const { transactions, budgets, month, setMonth, format, setBudget, clearBudget } = useApp()
  const toast = useToast()

  const monthTx = useMemo(() => filterByMonth(transactions, month), [transactions, month])
  const totalSpent = useMemo(() => summarize(monthTx).expenses, [monthTx])
  const spentByCategory = useMemo(
    () => Object.fromEntries(expensesByCategory(monthTx).map((c) => [c.name, c.value])),
    [monthTx],
  )
  const items = useMemo(() => evaluateBudgets(transactions, budgets, month), [transactions, budgets, month])
  const alerts = items.filter((i) => i.state === 'warning' || i.state === 'exceeded')
  const categoryTotal = sumAmounts(Object.values(budgets.categories).map((amount) => ({ amount })))

  const save = (scope, label) => (amount) => {
    setBudget(scope, amount)
    toast.success(`${label} budget set to ${format(amount)}.`)
  }
  const remove = (scope, label) => () => {
    clearBudget(scope)
    toast.info(`${label} budget removed.`)
  }

  return (
    <div className="page">
      <PageHeader
        title="Budgets"
        subtitle="Monthly limits repeat every month. Progress uses your actual expenses."
      >
        <MonthPicker value={month} onChange={setMonth} transactions={transactions} />
      </PageHeader>

      {alerts.length > 0 ? (
        <div className="alert-stack" role="status">
          {alerts.map((a) => (
            <div key={a.key} className={`banner ${a.state === 'exceeded' ? 'banner-danger' : 'banner-warning'}`}>
              <TriangleAlert size={18} aria-hidden="true" />
              <p>
                <strong>{a.key === 'overall' ? 'Overall budget' : a.label}</strong>{' '}
                {a.state === 'exceeded'
                  ? `is over budget by ${format(a.over)} in ${monthLabel(month)}.`
                  : `has used ${Math.round(a.pct)}% of its budget in ${monthLabel(month)}. ${
                      a.remaining > 0 ? `${format(a.remaining)} left.` : 'Nothing left.'
                    }`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        items.length > 0 && (
          <div className="banner banner-success" role="status">
            <CircleCheck size={18} aria-hidden="true" />
            <p>All your budgets are on track for {monthLabel(month)}.</p>
          </div>
        )
      )}

      <BudgetCard
        hero
        title="Overall monthly budget"
        spent={totalSpent}
        budget={budgets.overall}
        onSave={save('overall', 'Overall')}
        onClear={remove('overall', 'Overall')}
      />

      {budgets.overall > 0 && categoryTotal > budgets.overall && (
        <div className="banner banner-info">
          <Info size={18} aria-hidden="true" />
          <p>
            Your category budgets add up to {format(categoryTotal)}, which is more than your overall budget of{' '}
            {format(budgets.overall)}.
          </p>
        </div>
      )}

      <h2 className="section-title">Category budgets</h2>
      <div className="budget-grid">
        {EXPENSE_CATEGORIES.map((category) => (
          <BudgetCard
            key={category}
            title={category}
            color={colorFor(category)}
            spent={spentByCategory[category] || 0}
            budget={budgets.categories[category] || 0}
            onSave={save(category, category)}
            onClear={remove(category, category)}
          />
        ))}
      </div>
    </div>
  )
}
