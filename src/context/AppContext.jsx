import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { DEFAULT_SETTINGS, EMPTY_BUDGETS } from '../data/categories'
import { createSampleTransactions } from '../data/sampleData'
import { KEYS, loadBudgets, loadSettings, loadTransactions } from '../utils/storage'
import { currentMonth } from '../utils/dates'
import { formatMoney, generateId } from '../utils/format'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [transactions, setTransactions, txFailed] = useLocalStorage(KEYS.transactions, loadTransactions)
  const [budgets, setBudgets, budgetFailed] = useLocalStorage(KEYS.budgets, loadBudgets)
  const [settings, setSettings, settingsFailed] = useLocalStorage(KEYS.settings, loadSettings)
  // Selected month is shared by the Dashboard and Budgets pages. It is not persisted.
  const [month, setMonth] = useState(currentMonth)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  const addTransaction = useCallback(
    (data) => {
      const transaction = { ...data, id: generateId() }
      setTransactions((prev) => [transaction, ...prev])
      return transaction
    },
    [setTransactions],
  )

  const updateTransaction = useCallback(
    (id, data) => {
      // An edited sample row becomes the user's own data, so the sample flag is dropped.
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...data, id } : t)))
    },
    [setTransactions],
  )

  const deleteTransaction = useCallback(
    (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
    [setTransactions],
  )

  const setBudget = useCallback(
    (scope, amount) =>
      setBudgets((prev) =>
        scope === 'overall'
          ? { ...prev, overall: amount }
          : { ...prev, categories: { ...prev.categories, [scope]: amount } },
      ),
    [setBudgets],
  )

  const clearBudget = useCallback(
    (scope) =>
      setBudgets((prev) => {
        if (scope === 'overall') return { ...prev, overall: 0 }
        const categories = { ...prev.categories }
        delete categories[scope]
        return { ...prev, categories }
      }),
    [setBudgets],
  )

  const setCurrency = useCallback(
    (currency) => setSettings((prev) => ({ ...prev, currency })),
    [setSettings],
  )
  const setTheme = useCallback((theme) => setSettings((prev) => ({ ...prev, theme })), [setSettings])
  const toggleTheme = useCallback(
    () => setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' })),
    [setSettings],
  )
  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), [setSettings])

  const clearAllData = useCallback(() => {
    setTransactions([])
    setBudgets({ ...EMPTY_BUDGETS, categories: {} })
  }, [setTransactions, setBudgets])

  const removeSampleData = useCallback(
    () => setTransactions((prev) => prev.filter((t) => !t.sample)),
    [setTransactions],
  )

  // Adds samples next to existing data. Existing ids are never replaced.
  const loadSampleData = useCallback(
    () =>
      setTransactions((prev) => {
        const existing = new Set(prev.map((t) => t.id))
        return [...prev, ...createSampleTransactions().filter((t) => !existing.has(t.id))]
      }),
    [setTransactions],
  )

  const format = useCallback((amount) => formatMoney(amount, settings.currency), [settings.currency])

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      settings,
      month,
      setMonth,
      format,
      hasSample: transactions.some((t) => t.sample),
      storageFailed: txFailed || budgetFailed || settingsFailed,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      clearBudget,
      setCurrency,
      setTheme,
      toggleTheme,
      resetSettings,
      clearAllData,
      removeSampleData,
      loadSampleData,
    }),
    [
      transactions,
      budgets,
      settings,
      month,
      format,
      txFailed,
      budgetFailed,
      settingsFailed,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      clearBudget,
      setCurrency,
      setTheme,
      toggleTheme,
      resetSettings,
      clearAllData,
      removeSampleData,
      loadSampleData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside <AppProvider>')
  return context
}
