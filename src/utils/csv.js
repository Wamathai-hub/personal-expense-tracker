// Cells that start with these characters can be run as formulas by spreadsheet apps.
const guard = (value) => {
  const text = String(value ?? '')
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

const cell = (value) => {
  const text = guard(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function transactionsToCsv(list, currency) {
  const header = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Currency', 'Notes', 'Sample data']
  const rows = [...list]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [
      t.date,
      t.title,
      t.type === 'income' ? 'Income' : 'Expense',
      t.category,
      t.amount.toFixed(2),
      currency,
      t.notes || '',
      t.sample ? 'Yes' : 'No',
    ])
  return `${[header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`
}

export function downloadCsv(filename, csv) {
  // The byte order mark lets Excel open UTF-8 files correctly.
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
