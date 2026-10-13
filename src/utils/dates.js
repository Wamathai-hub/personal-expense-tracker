const pad = (n) => String(n).padStart(2, '0')

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayISO = () => toISODate(new Date())

export const currentMonth = () => todayISO().slice(0, 7)

export const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const isValidISODate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = parseISODate(value)
  return toISODate(d) === value
}

export const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export const daysInMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export const monthStart = (ym) => `${ym}-01`
export const monthEnd = (ym) => `${ym}-${pad(daysInMonth(ym))}`

export const monthLabel = (ym, style = 'long') => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', {
    month: style,
    year: style === 'long' ? 'numeric' : '2-digit',
  })
}

export const formatDate = (iso) =>
  parseISODate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatShortDate = (iso) =>
  parseISODate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export const monthsBetween = (fromYm, toYm) => {
  const out = []
  let cursor = fromYm
  while (cursor <= toYm && out.length < 600) {
    out.push(cursor)
    cursor = shiftMonth(cursor, 1)
  }
  return out
}

export const daysBetween = (fromISO, toISO) =>
  Math.round((parseISODate(toISO) - parseISODate(fromISO)) / 86400000)

export const addDays = (iso, n) => {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}
