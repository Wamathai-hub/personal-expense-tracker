import {
  CURRENCIES,
  DEFAULT_SETTINGS,
  EMPTY_BUDGETS,
  EXPENSE_CATEGORIES,
  THEMES,
} from '../data/categories'
import { validateTransaction } from './validation'

const PREFIX = 'expense-tracker:'
export const KEYS = {
  transactions: `${PREFIX}transactions`,
  budgets: `${PREFIX}budgets`,
  settings: `${PREFIX}settings`,
}

function readJSON(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return { found: false, value: null }
    return { found: true, value: JSON.parse(raw) }
  } catch {
    // Blocked storage or corrupt JSON: behave as if there is nothing usable stored.
    return { found: true, value: null }
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function sanitizeTransaction(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !raw.id) return null
  const { errors, cleaned } = validateTransaction({ ...raw, amount: raw.amount })
  if (Object.keys(errors).length > 0) return null
  return { id: raw.id, ...cleaned, sample: raw.sample === true }
}

/**
 * Loads saved transactions. Nothing is added automatically: the tracker starts
 * empty until the user saves their first transaction.
 */
export function loadTransactions() {
  const { found, value } = readJSON(KEYS.transactions)
  if (!found) return []
  return Array.isArray(value) ? value.map(sanitizeTransaction).filter(Boolean) : []
}

export function loadBudgets() {
  const { value } = readJSON(KEYS.budgets)
  if (!value || typeof value !== 'object') return { ...EMPTY_BUDGETS, categories: {} }
  const overall = Number(value.overall)
  const categories = {}
  for (const category of EXPENSE_CATEGORIES) {
    const amount = Number(value.categories?.[category])
    if (Number.isFinite(amount) && amount > 0) categories[category] = amount
  }
  return { overall: Number.isFinite(overall) && overall > 0 ? overall : 0, categories }
}

export function loadSettings() {
  const { value } = readJSON(KEYS.settings)
  const settings = { ...DEFAULT_SETTINGS }
  if (value && typeof value === 'object') {
    if (CURRENCIES.some((c) => c.code === value.currency)) settings.currency = value.currency
    if (THEMES.includes(value.theme)) settings.theme = value.theme
  }
  return settings
}