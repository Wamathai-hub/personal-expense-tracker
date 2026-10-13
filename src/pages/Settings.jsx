import { useMemo, useState } from 'react'
import { Database, FlaskConical, RotateCcw, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Field from '../components/Field'
import ConfirmDialog from '../components/ConfirmDialog'
import { CURRENCIES, DEFAULT_SETTINGS } from '../data/categories'
import { createSampleTransactions } from '../data/sampleData'

export default function Settings() {
  const {
    transactions,
    budgets,
    settings,
    setCurrency,
    setTheme,
    resetSettings,
    clearAllData,
    removeSampleData,
    loadSampleData,
    hasSample,
  } = useApp()
  const toast = useToast()
  const [confirm, setConfirm] = useState(null) // 'clear' | 'reset' | null

  const sampleCount = transactions.filter((t) => t.sample).length
  const budgetCount = Object.keys(budgets.categories).length + (budgets.overall > 0 ? 1 : 0)
  const missingSamples = useMemo(() => {
    const existing = new Set(transactions.map((t) => t.id))
    return createSampleTransactions().filter((t) => !existing.has(t.id)).length
  }, [transactions])

  return (
    <div className="page page-narrow">
      <PageHeader title="Settings" subtitle="Preferences are saved in this browser." />

      <Card title="Appearance" subtitle="Choose how the app looks.">
        <fieldset className="field">
          <legend className="visually-hidden">Theme</legend>
          <div className="segmented">
            {[
              ['light', 'Light'],
              ['dark', 'Dark'],
            ].map(([value, label]) => (
              <label key={value} className={`segmented-option ${settings.theme === value ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={settings.theme === value}
                  onChange={() => {
                    setTheme(value)
                    toast.success(`${label} theme on.`)
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card title="Currency" subtitle="Used to display every amount in the app.">
        <Field
          id="currency"
          label="Currency"
          hint="Amounts keep their numeric value. Changing currency doesn't convert them."
        >
          <select
            id="currency"
            className="select"
            value={settings.currency}
            aria-describedby="currency-hint"
            onChange={(e) => {
              setCurrency(e.target.value)
              toast.success(`Currency set to ${e.target.value}.`)
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card title="Your data" subtitle={`${transactions.length} ${transactions.length === 1 ? 'transaction' : 'transactions'} and ${budgetCount} ${budgetCount === 1 ? 'budget' : 'budgets'} stored in this browser.`}>
        <div className="settings-rows">
          <div className="settings-row">
            <div>
              <h3>
                <FlaskConical size={16} aria-hidden="true" /> Sample data
              </h3>
              <p className="muted small">
                {hasSample
                  ? `${sampleCount} sample ${sampleCount === 1 ? 'transaction is' : 'transactions are'} mixed in with your data and labelled "Sample".`
                  : 'No sample transactions are in your data.'}
              </p>
            </div>
            <div className="settings-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={missingSamples === 0}
                onClick={() => {
                  loadSampleData()
                  toast.success('Sample data added next to your existing data.')
                }}
              >
                Add sample data
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!hasSample}
                onClick={() => {
                  removeSampleData()
                  toast.success('Sample data removed.')
                }}
              >
                Remove sample data
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <h3>
                <Database size={16} aria-hidden="true" /> Clear all financial data
              </h3>
              <p className="muted small">Deletes every transaction and budget. Your theme and currency stay.</p>
            </div>
            <div className="settings-actions">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setConfirm('clear')}
                disabled={transactions.length === 0 && budgetCount === 0}
              >
                <Trash2 size={15} aria-hidden="true" /> Clear data
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Reset settings" subtitle={`Puts currency back to ${DEFAULT_SETTINGS.currency} and the theme back to ${DEFAULT_SETTINGS.theme}. Your transactions and budgets aren't touched.`}>
        <button type="button" className="btn btn-secondary" onClick={() => setConfirm('reset')}>
          <RotateCcw size={16} aria-hidden="true" /> Reset settings
        </button>
      </Card>

      {confirm === 'clear' && (
        <ConfirmDialog
          title="Clear all financial data?"
          message={`This permanently deletes ${transactions.length} ${transactions.length === 1 ? 'transaction' : 'transactions'} and ${budgetCount} ${budgetCount === 1 ? 'budget' : 'budgets'} from this browser. This can't be undone.`}
          confirmLabel="Clear all data"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            clearAllData()
            setConfirm(null)
            toast.success('All financial data cleared.')
          }}
        />
      )}

      {confirm === 'reset' && (
        <ConfirmDialog
          title="Reset settings?"
          message={`Currency returns to ${DEFAULT_SETTINGS.currency} and the theme to ${DEFAULT_SETTINGS.theme}.`}
          confirmLabel="Reset settings"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            resetSettings()
            setConfirm(null)
            toast.success('Settings reset to defaults.')
          }}
        />
      )}
    </div>
  )
}
