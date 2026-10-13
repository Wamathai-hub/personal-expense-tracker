import { categoriesFor } from '../data/categories'
import { isValidISODate } from './dates'

export const MAX_AMOUNT = 1_000_000_000_000

export function parseAmount(value) {
  const text = String(value ?? '').trim()
  if (text === '') return NaN
  const n = Number(text)
  if (!Number.isFinite(n)) return NaN
  return Math.round(n * 100) / 100
}

/**
 * Validates raw form values. Returns `errors` (field -> message) and `cleaned`
 * (normalised values that are safe to store).
 */
export function validateTransaction(values) {
  const errors = {}
  const title = String(values.title ?? '').trim()
  const notes = String(values.notes ?? '').trim()
  const type = values.type
  const category = values.category
  const date = values.date
  const amount = parseAmount(values.amount)

  if (!title) errors.title = 'Enter a title.'
  else if (title.length > 80) errors.title = 'Keep the title to 80 characters or fewer.'

  if (String(values.amount ?? '').trim() === '') errors.amount = 'Enter an amount.'
  else if (!Number.isFinite(amount)) errors.amount = 'Enter a valid number.'
  else if (amount <= 0) errors.amount = 'The amount must be greater than zero.'
  else if (amount > MAX_AMOUNT) errors.amount = 'That amount is too large.'

  if (type !== 'income' && type !== 'expense') errors.type = 'Choose income or expense.'

  if (!category) errors.category = 'Choose a category.'
  else if (type && !categoriesFor(type).includes(category)) {
    errors.category = 'Choose a category that matches the type.'
  }

  if (!date) errors.date = 'Choose a date.'
  else if (!isValidISODate(date)) errors.date = 'Enter a valid date.'

  if (notes.length > 250) errors.notes = 'Keep notes to 250 characters or fewer.'

  return { errors, cleaned: { title, amount, type, category, date, notes } }
}

export function validateBudgetAmount(value) {
  const amount = parseAmount(value)
  if (String(value ?? '').trim() === '') return { error: 'Enter an amount.' }
  if (!Number.isFinite(amount)) return { error: 'Enter a valid number.' }
  if (amount <= 0) return { error: 'The budget must be greater than zero.' }
  if (amount > MAX_AMOUNT) return { error: 'That amount is too large.' }
  return { amount }
}
