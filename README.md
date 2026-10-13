# Personal Expense Tracker

A personal finance web app for recording income and expenses, setting monthly budgets and understanding where your money goes. It runs entirely in the browser: there is no backend, no account and no API key, and your data never leaves your device.

Built with React and Vite as a portfolio project.

## Features

**Dashboard**
- Total income, total expenses, balance and savings rate for the selected month
- Income-versus-expenses chart for the last six months
- Expense breakdown by category (income is always excluded)
- Recent transactions and a monthly summary (average daily spending, largest expense, top category, budget use, all-time balance)
- Month selector shared with the Budgets page

**Transactions**
- Add, edit and delete (with confirmation) transactions: title, amount, type, category, date and optional notes
- Search, filter by type, category and date range, sort by date or amount, and paginate (10 per page)
- Validation that rejects empty fields, invalid dates and zero, negative or non-numeric amounts

**Budgets**
- A monthly overall budget plus a budget for each expense category
- Progress bars, remaining amounts, a warning at 80% used and an alert once a budget is exceeded
- Budget alerts also appear as toasts when you add an expense, and as a badge on the Budgets navigation item

**Reports**
- Date-range filtering with quick presets (this month, last 3 or 6 months, this year, all time)
- Monthly income and expense comparison (chart and table), spending trend, expense distribution and top spending categories
- CSV export of the transactions in the selected range

**Settings**
- Currency: KES (default), USD, GBP or EUR (changes how amounts are displayed; it does not convert them)
- Light and dark themes
- Clear all financial data (with confirmation), reset settings to their defaults, and add or remove clearly labelled sample data

**Experience**
- Responsive layout: sidebar on desktop, top bar and bottom tab bar on mobile
- Toast notifications, confirmation dialogs, useful empty states, accessible labels, keyboard focus handling and reduced-motion support
- All preferences and data persist in `localStorage`

## Technology stack

| Area | Choice |
| --- | --- |
| Framework | React 19 with Vite |
| Language | JavaScript (no TypeScript) |
| Routing | React Router DOM |
| Styling | Standard CSS with design tokens (custom properties) |
| Charts | Recharts |
| Icons | Lucide React |
| Persistence | Browser `localStorage` |
| Font | Plus Jakarta Sans, installed locally through npm (no external requests) |
| Package manager | npm |

## Screenshots

Screenshots are not committed yet. Run the app, capture each page, save the images in `docs/screenshots/` using the file names below, then paste the matching lines into this section.

| Page | File name |
| --- | --- |
| Dashboard (light) | `dashboard-light.png` |
| Dashboard (dark) | `dashboard-dark.png` |
| Transactions | `transactions.png` |
| Budgets | `budgets.png` |
| Reports | `reports.png` |
| Mobile view | `mobile.png` |

Markdown for each image: `![Dashboard](docs/screenshots/dashboard-light.png)`

## Installation

You need Node.js 20.19 or newer (or 22.12 or newer) and npm.

```bash
git clone https://github.com/<your-username>/personal-expense-tracker.git
cd personal-expense-tracker
npm install
```

## Running the app

```bash
npm run dev       # start the development server (http://localhost:5173)
npm run build     # create a production build in dist/
npm run preview   # serve the production build locally
```

## First run and sample data

On the very first visit, when nothing is stored yet, the app loads a few sample transactions for the current and previous two months so the dashboard is not empty. Every sample transaction is labelled **Sample**.

- Sample data is only loaded when no data exists. It never replaces or modifies transactions you have saved.
- Remove it from the banner on the Dashboard or from **Settings → Your data**.
- Editing a sample transaction turns it into your own data.
- **Settings → Add sample data** adds the samples next to your data again if you want them back.

## How the numbers are calculated

- Balance = total income − total expenses.
- Savings rate = (income − expenses) ÷ income × 100, shown as a dash when income is zero.
- Amounts are summed as whole cents, so totals do not drift from floating-point rounding.
- Expense charts only include expense transactions.
- Budget progress uses the real expenses dated in the selected month. A budget is flagged at 80% used and as exceeded once spending goes over 100%.
- Money is formatted with `Intl.NumberFormat` for the selected currency.

## Project structure

```
personal-expense-tracker/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── docs/
│   └── screenshots/
└── src/
    ├── main.jsx                  # entry point and providers
    ├── App.jsx                   # routes
    ├── index.css                 # design tokens, layout and components
    ├── context/
    │   └── AppContext.jsx        # transactions, budgets, settings and actions
    ├── layouts/
    │   └── AppLayout.jsx         # sidebar, mobile navigation, theme toggle
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── Transactions.jsx
    │   ├── Budgets.jsx
    │   ├── Reports.jsx
    │   ├── Settings.jsx
    │   └── NotFound.jsx
    ├── components/               # cards, forms, charts, modal, toasts, budget card
    ├── hooks/
    │   ├── useLocalStorage.js    # persisted state with cross-tab sync
    │   └── useChartTheme.js      # chart colours for light and dark
    ├── utils/
    │   ├── calculations.js       # totals, savings rate, series, budget status
    │   ├── validation.js         # transaction and budget validation
    │   ├── storage.js            # safe loading, sanitising and saving
    │   ├── csv.js                # CSV generation and download
    │   ├── format.js             # currency, percent and id helpers
    │   └── dates.js              # local-time date helpers
    └── data/
        ├── categories.js         # categories, colours, currencies, defaults
        └── sampleData.js         # clearly flagged demo transactions
```

## Data and privacy

Everything is stored in your browser's `localStorage` under keys that start with `expense-tracker:`. Clearing site data in the browser, or using **Settings → Clear all financial data**, removes it. Because there is no server, data is not shared between browsers or devices, so use **Reports → Export CSV** if you want a copy.

## Deploying

The app is a static site. Any host that serves `dist/` works. Because it uses client-side routing, configure the host to fall back to `index.html` for unknown paths (Netlify, Vercel and Cloudflare Pages can do this). GitHub Pages needs a `404.html` copy of `index.html` or a switch to `HashRouter`.

## Future improvements

- Automated tests with Vitest and React Testing Library
- Import transactions from CSV and export or restore a full JSON backup
- Recurring transactions (rent, salary, subscriptions)
- Savings goals with progress tracking
- Custom categories and per-category colours
- Optional exchange-rate conversion between currencies
- Installable PWA with offline support
- Optional sync across devices through a backend
