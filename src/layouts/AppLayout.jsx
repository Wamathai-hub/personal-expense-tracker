import { useEffect, useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  ChartColumn,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Settings,
  Sun,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { evaluateBudgets } from '../utils/calculations'
import { currentMonth } from '../utils/dates'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/reports', label: 'Reports', icon: ChartColumn },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItems({ alertCount }) {
  return NAV.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
      <span className="nav-icon">
        <Icon size={20} aria-hidden="true" />
        {to === '/budgets' && alertCount > 0 && (
          <span className="nav-badge" aria-hidden="true">
            {alertCount}
          </span>
        )}
      </span>
      <span className="nav-label">{label}</span>
      {to === '/budgets' && alertCount > 0 && (
        <span className="visually-hidden">
          , {alertCount} budget {alertCount === 1 ? 'alert' : 'alerts'}
        </span>
      )}
    </NavLink>
  ))
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Wallet size={20} aria-hidden="true" />
      </span>
      <span className="brand-name">Expense Tracker</span>
    </div>
  )
}

export default function AppLayout() {
  const { transactions, budgets, settings, toggleTheme, storageFailed } = useApp()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const alertCount = useMemo(
    () =>
      evaluateBudgets(transactions, budgets, currentMonth()).filter(
        (item) => item.state === 'warning' || item.state === 'exceeded',
      ).length,
    [transactions, budgets],
  )

  const nextTheme = settings.theme === 'dark' ? 'light' : 'dark'
  const ThemeIcon = settings.theme === 'dark' ? Sun : Moon

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <aside className="sidebar">
        <Brand />
        <nav className="sidebar-nav" aria-label="Main">
          <NavItems alertCount={alertCount} />
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-theme" onClick={toggleTheme}>
            <ThemeIcon size={18} aria-hidden="true" />
            <span>Switch to {nextTheme} theme</span>
          </button>
          <p>Your data stays in this browser.</p>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <Brand />
          <button
            type="button"
            className="icon-btn icon-btn-light"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
          >
            <ThemeIcon size={20} aria-hidden="true" />
          </button>
        </header>

        {storageFailed && (
          <div className="banner banner-warning" role="alert">
            <TriangleAlert size={18} aria-hidden="true" />
            <p>
              This browser isn&apos;t saving your changes. Storage may be full or blocked (for example in
              private browsing). Export your data from Reports to keep a copy.
            </p>
          </div>
        )}

        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Main mobile">
        <NavItems alertCount={alertCount} />
      </nav>
    </div>
  )
}
