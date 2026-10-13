import { EXPENSE_CATEGORIES } from '../data/categories'
import { addDays, daysBetween, formatShortDate, monthLabel, monthsBetween, shiftMonth } from './dates'

// Amounts are summed as integer cents to avoid floating-point drift.
const cents = (n) => Math.round(n * 100)

export const sumAmounts = (list) => list.reduce((acc, t) => acc + cents(t.amount), 0) / 100

export const byDateDesc = (a, b) => b.date.localeCompare(a.date)

export const filterByMonth = (list, ym) => list.filter((t) => t.date.slice(0, 7) === ym)

export const filterByRange = (list, from, to) =>
  list.filter((t) => (!from || t.date >= from) && (!to || t.date <= to))

/** Income, expenses, balance and savings rate for any list of transactions. */
export function summarize(list) {
  let inc = 0
  let exp = 0
  for (const t of list) {
    if (t.type === 'income') inc += cents(t.amount)
    else if (t.type === 'expense') exp += cents(t.amount)
  }
  return {
    income: inc / 100,
    expenses: exp / 100,
    balance: (inc - exp) / 100,
    // Undefined when there is no income, so the UI shows a dash instead of Infinity or NaN.
    savingsRate: inc > 0 ? ((inc - exp) / inc) * 100 : null,
  }
}

/** Expense-only totals per category, largest first. Income is always excluded. */
export function expensesByCategory(list) {
  const totals = new Map()
  for (const t of list) {
    if (t.type !== 'expense') continue
    totals.set(t.category, (totals.get(t.category) || 0) + cents(t.amount))
  }
  return [...totals.entries()]
    .map(([name, c]) => ({ name, value: c / 100 }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
}

export const lastMonths = (endYm, count) => monthsBetween(shiftMonth(endYm, -(count - 1)), endYm)

/** One row per month with income, expenses, net and savings rate. */
export function monthlySeries(list, months) {
  const buckets = new Map(months.map((ym) => [ym, { inc: 0, exp: 0 }]))
  for (const t of list) {
    const bucket = buckets.get(t.date.slice(0, 7))
    if (!bucket) continue
    if (t.type === 'income') bucket.inc += cents(t.amount)
    else if (t.type === 'expense') bucket.exp += cents(t.amount)
  }
  return months.map((ym) => {
    const { inc, exp } = buckets.get(ym)
    return {
      ym,
      label: monthLabel(ym, 'short'),
      income: inc / 100,
      expenses: exp / 100,
      net: (inc - exp) / 100,
      savingsRate: inc > 0 ? ((inc - exp) / inc) * 100 : null,
    }
  })
}

/** Spending over time: daily for ranges up to ~2 months, monthly beyond that. */
export function trendSeries(list, from, to) {
  if (!from || !to || from > to) return []
  const span = daysBetween(from, to)
  if (span <= 62) {
    const perDay = new Map()
    for (const t of list) {
      if (t.type === 'expense') perDay.set(t.date, (perDay.get(t.date) || 0) + cents(t.amount))
    }
    const points = []
    for (let i = 0; i <= span; i += 1) {
      const day = addDays(from, i)
      points.push({ key: day, label: formatShortDate(day), value: (perDay.get(day) || 0) / 100 })
    }
    return points
  }
  const months = monthsBetween(from.slice(0, 7), to.slice(0, 7))
  return monthlySeries(list, months).map((m) => ({ key: m.ym, label: m.label, value: m.expenses }))
}

/** Budget progress. Warns from 80% used and flags anything strictly over 100%. */
export function budgetStatus(spent, budget) {
  if (!(budget > 0)) return { state: 'none', pct: 0, remaining: 0, over: 0 }
  const s = cents(spent)
  const b = cents(budget)
  const state = s > b ? 'exceeded' : s * 100 >= b * 80 ? 'warning' : 'ok'
  return {
    state,
    pct: (s / b) * 100,
    remaining: Math.max(b - s, 0) / 100,
    over: Math.max(s - b, 0) / 100,
  }
}

/** Evaluates the overall budget and every category budget against the month's real expenses. */
export function evaluateBudgets(list, budgets, ym) {
  let total = 0
  const byCategory = new Map()
  for (const t of filterByMonth(list, ym)) {
    if (t.type !== 'expense') continue
    total += cents(t.amount)
    byCategory.set(t.category, (byCategory.get(t.category) || 0) + cents(t.amount))
  }
  const items = []
  if (budgets.overall > 0) {
    items.push({
      key: 'overall',
      label: 'Overall budget',
      spent: total / 100,
      budget: budgets.overall,
      ...budgetStatus(total / 100, budgets.overall),
    })
  }
  for (const category of EXPENSE_CATEGORIES) {
    const budget = budgets.categories?.[category]
    if (!(budget > 0)) continue
    const spent = (byCategory.get(category) || 0) / 100
    items.push({ key: category, label: category, spent, budget, ...budgetStatus(spent, budget) })
  }
  return items
}
