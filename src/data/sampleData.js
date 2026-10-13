import { currentMonth, daysInMonth, shiftMonth, todayISO } from '../utils/dates'

// [day of month, type, category, title, base amount]
const TEMPLATES = [
  [1, 'income', 'Salary', 'Monthly salary', 85000],
  [8, 'income', 'Freelance', 'Freelance web project', 18000],
  [15, 'income', 'Allowance', 'Monthly allowance', 6000],
  [2, 'expense', 'Rent', 'House rent', 25000],
  [3, 'expense', 'Bills', 'Electricity and water', 4200],
  [4, 'expense', 'Bills', 'Internet and airtime', 3000],
  [5, 'expense', 'Food', 'Weekly groceries', 5200],
  [12, 'expense', 'Food', 'Groceries and snacks', 4300],
  [19, 'expense', 'Food', 'Lunch with friends', 2400],
  [6, 'expense', 'Transport', 'Fuel and bus fares', 3800],
  [17, 'expense', 'Transport', 'Ride-hailing', 1900],
  [9, 'expense', 'Education', 'Course materials', 3500],
  [11, 'expense', 'Shopping', 'Clothes', 4500],
  [14, 'expense', 'Entertainment', 'Movies and streaming', 2200],
  [20, 'expense', 'Healthcare', 'Pharmacy', 1800],
]

const MONTH_FACTORS = [0.94, 1.04, 1]

/**
 * Demo transactions for the current and previous two months. Every one is flagged
 * `sample: true` so it can be identified and removed. Ids are stable, so loading the
 * samples twice never creates duplicates.
 */
export function createSampleTransactions() {
  const today = todayISO()
  const thisMonth = currentMonth()
  const out = []
  MONTH_FACTORS.forEach((factor, index) => {
    const ym = shiftMonth(thisMonth, index - 2)
    const lastDay = daysInMonth(ym)
    TEMPLATES.forEach(([day, type, category, title, base], i) => {
      const date = `${ym}-${String(Math.min(day, lastDay)).padStart(2, '0')}`
      if (date > today) return
      const amount = type === 'income' && category === 'Salary' ? base : Math.round((base * factor) / 10) * 10
      out.push({ id: `sample-${index}-${i}`, title, amount, type, category, date, notes: '', sample: true })
    })
  })
  return out
}
