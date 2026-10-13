import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pencil, Plus, Receipt, Search, SearchX, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import TransactionForm from '../components/TransactionForm'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, colorFor } from '../data/categories'
import { evaluateBudgets, summarize } from '../utils/calculations'
import { formatDate, monthLabel } from '../utils/dates'

const PAGE_SIZE = 10

const SORT_OPTIONS = [
  ['date-desc', 'Newest first'],
  ['date-asc', 'Oldest first'],
  ['amount-desc', 'Highest amount'],
  ['amount-asc', 'Lowest amount'],
]

const COMPARATORS = {
  'date-desc': (a, b) => b.date.localeCompare(a.date),
  'date-asc': (a, b) => a.date.localeCompare(b.date),
  'amount-desc': (a, b) => b.amount - a.amount || b.date.localeCompare(a.date),
  'amount-asc': (a, b) => a.amount - b.amount || b.date.localeCompare(a.date),
}

const INITIAL_FILTERS = { search: '', type: 'all', category: 'all', from: '', to: '' }

export default function Transactions() {
  const { transactions, budgets, settings, format, addTransaction, updateTransaction, deleteTransaction } = useApp()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sort, setSort] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null | 'new' | transaction
  const [deleting, setDeleting] = useState(null)

  // The empty dashboard links here with state asking for the add form to open.
  useEffect(() => {
    if (location.state?.openForm) {
      setEditing('new')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return transactions
      .filter(
        (t) =>
          (filters.type === 'all' || t.type === filters.type) &&
          (filters.category === 'all' || t.category === filters.category) &&
          (!filters.from || t.date >= filters.from) &&
          (!filters.to || t.date <= filters.to) &&
          (!query ||
            t.title.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            (t.notes || '').toLowerCase().includes(query)),
      )
      .sort(COMPARATORS[sort])
  }, [transactions, filters, sort])

  const totals = useMemo(() => summarize(filtered), [filtered])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  const rangeInvalid = Boolean(filters.from && filters.to && filters.from > filters.to)
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(INITIAL_FILTERS)

  const categoryOptions =
    filters.type === 'income' ? (
      INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)
    ) : filters.type === 'expense' ? (
      EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)
    ) : (
      <>
        <optgroup label="Income">
          {INCOME_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </optgroup>
        <optgroup label="Expenses">
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </optgroup>
      </>
    )

  const warnAboutBudgets = (list, saved) => {
    const ym = saved.date.slice(0, 7)
    evaluateBudgets(list, budgets, ym)
      .filter((i) => (i.key === 'overall' || i.key === saved.category) && (i.state === 'warning' || i.state === 'exceeded'))
      .forEach((i) => {
        const name = i.key === 'overall' ? 'Your overall budget' : `Your ${i.label} budget`
        toast.warning(
          i.state === 'exceeded'
            ? `${name} for ${monthLabel(ym)} is over by ${format(i.over)}.`
            : `${name} for ${monthLabel(ym)} is ${Math.round(i.pct)}% used.`,
        )
      })
  }

  const handleSave = (cleaned) => {
    let next
    if (editing === 'new') {
      const created = addTransaction(cleaned)
      next = [created, ...transactions]
      toast.success('Transaction added.')
    } else {
      updateTransaction(editing.id, cleaned)
      next = transactions.map((t) => (t.id === editing.id ? { ...cleaned, id: editing.id } : t))
      toast.success('Transaction updated.')
    }
    setEditing(null)
    if (cleaned.type === 'expense') warnAboutBudgets(next, cleaned)
  }

  const confirmDelete = () => {
    deleteTransaction(deleting.id)
    toast.success('Transaction deleted.')
    setDeleting(null)
  }

  return (
    <div className="page">
      <PageHeader title="Transactions" subtitle="Add, search and manage your income and expenses.">
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus size={18} aria-hidden="true" /> Add transaction
        </button>
      </PageHeader>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          text="Add your first income or expense to start tracking."
          action={
            <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
              <Plus size={18} aria-hidden="true" /> Add transaction
            </button>
          }
        />
      ) : (
        <>
          <section className="card filters" aria-label="Search and filters">
            <div className="filter-field filter-search">
              <label htmlFor="tx-search">Search</label>
              <div className="input-icon">
                <Search size={16} aria-hidden="true" />
                <input
                  id="tx-search"
                  className="input"
                  type="search"
                  placeholder="Title, category or notes"
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                />
              </div>
            </div>
            <div className="filter-field">
              <label htmlFor="tx-type">Type</label>
              <select
                id="tx-type"
                className="select"
                value={filters.type}
                onChange={(e) => {
                  const type = e.target.value
                  const valid =
                    type === 'all' ||
                    filters.category === 'all' ||
                    (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).includes(filters.category)
                  updateFilters({ type, category: valid ? filters.category : 'all' })
                }}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="tx-category">Category</label>
              <select
                id="tx-category"
                className="select"
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
              >
                <option value="all">All categories</option>
                {categoryOptions}
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="tx-from">From</label>
              <input
                id="tx-from"
                className="input"
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(e) => updateFilters({ from: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label htmlFor="tx-to">To</label>
              <input
                id="tx-to"
                className="input"
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e) => updateFilters({ to: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label htmlFor="tx-sort">Sort by</label>
              <select id="tx-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {filtersActive && (
              <button
                type="button"
                className="btn btn-ghost btn-sm filter-clear"
                onClick={() => {
                  setFilters(INITIAL_FILTERS)
                  setPage(1)
                }}
              >
                Clear filters
              </button>
            )}
            {rangeInvalid && (
              <p className="field-error filter-error" role="alert">
                The start date is after the end date, so nothing can match.
              </p>
            )}
          </section>

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching transactions"
              text="Try a different search or loosen the filters."
              action={
                filtersActive && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setFilters(INITIAL_FILTERS)
                      setPage(1)
                    }}
                  >
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <section className="card table-card" aria-label="Transactions list">
              <div className="table-summary" aria-live="polite">
                <span>
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? 'transaction' : 'transactions'}
                </span>
                <span className="amount-income">Income {format(totals.income)}</span>
                <span className="amount-expense">Expenses {format(totals.expenses)}</span>
                <span>Net {format(totals.balance)}</span>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Title</th>
                      <th scope="col">Category</th>
                      <th scope="col">Type</th>
                      <th scope="col" className="num">
                        Amount
                      </th>
                      <th scope="col">
                        <span className="visually-hidden">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((t) => (
                      <tr key={t.id}>
                        <td data-label="Date">{formatDate(t.date)}</td>
                        <td data-label="Title">
                          <div className="cell-content">
                            <div className="cell-title">
                              <span>{t.title}</span>
                              {t.sample && <span className="chip chip-sample">Sample</span>}
                            </div>
                            {t.notes && <p className="muted small cell-notes">{t.notes}</p>}
                          </div>
                        </td>
                        <td data-label="Category">
                          <span className="cat">
                            <span className="dot" style={{ background: colorFor(t.category) }} />
                            {t.category}
                          </span>
                        </td>
                        <td data-label="Type">
                          <span className={`chip chip-${t.type}`}>{t.type === 'income' ? 'Income' : 'Expense'}</span>
                        </td>
                        <td data-label="Amount" className={`num amount amount-${t.type}`}>
                          {t.type === 'income' ? '+' : '−'}
                          {format(t.amount)}
                        </td>
                        <td className="actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setEditing(t)}
                            aria-label={`Edit ${t.title}`}
                          >
                            <Pencil size={17} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            onClick={() => setDeleting(t)}
                            aria-label={`Delete ${t.title}`}
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <nav className="pagination" aria-label="Pagination">
                <p className="muted small">
                  Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} aria-hidden="true" /> Previous
                    </button>
                    <span className="small">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </nav>
            </section>
          )}
        </>
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add transaction' : 'Edit transaction'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" form="transaction-form" className="btn btn-primary">
                {editing === 'new' ? 'Add transaction' : 'Save changes'}
              </button>
            </>
          }
        >
          <TransactionForm
            id="transaction-form"
            initial={editing === 'new' ? null : editing}
            currency={settings.currency}
            onSubmit={handleSave}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this transaction?"
          message={`“${deleting.title}” (${format(deleting.amount)}) will be removed permanently.`}
          confirmLabel="Delete transaction"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
