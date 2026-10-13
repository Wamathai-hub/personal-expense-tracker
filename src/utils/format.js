import { CURRENCIES, DEFAULT_SETTINGS } from '../data/categories'

const formatters = new Map()

const getFormatter = (currency) => {
  if (!formatters.has(currency)) {
    const match = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]
    formatters.set(
      currency,
      new Intl.NumberFormat(match.locale, { style: 'currency', currency: match.code }),
    )
  }
  return formatters.get(currency)
}

export const formatMoney = (amount, currency = DEFAULT_SETTINGS.currency) => {
  const value = Number.isFinite(amount) ? amount : 0
  return getFormatter(currency).format(value)
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export const formatCompact = (amount) => compact.format(Number.isFinite(amount) ? amount : 0)

export const formatPercent = (value, digits = 1) =>
  value === null || !Number.isFinite(value) ? '—' : `${value.toFixed(digits)}%`

export const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
