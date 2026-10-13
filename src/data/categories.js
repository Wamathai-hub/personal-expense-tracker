export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Allowance', 'Business', 'Other Income']

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Education',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Other Expenses',
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export const categoriesFor = (type) => (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)

export const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Transport: '#06b6d4',
  Rent: '#1d4ed8',
  Education: '#818cf8',
  Shopping: '#a855f7',
  Entertainment: '#f59e0b',
  Bills: '#14b8a6',
  Healthcare: '#f43f5e',
  'Other Expenses': '#94a3b8',
  Salary: '#0f9d6b',
  Freelance: '#10b981',
  Allowance: '#34d399',
  Business: '#059669',
  'Other Income': '#6ee7b7',
}

export const colorFor = (category) => CATEGORY_COLORS[category] || '#94a3b8'

export const CURRENCIES = [
  { code: 'KES', label: 'Kenyan Shilling (KES)', locale: 'en-KE' },
  { code: 'USD', label: 'US Dollar (USD)', locale: 'en-US' },
  { code: 'GBP', label: 'British Pound (GBP)', locale: 'en-GB' },
  { code: 'EUR', label: 'Euro (EUR)', locale: 'en-IE' },
]

export const THEMES = ['light', 'dark']

export const DEFAULT_SETTINGS = { currency: 'KES', theme: 'light' }

export const EMPTY_BUDGETS = { overall: 0, categories: {} }
