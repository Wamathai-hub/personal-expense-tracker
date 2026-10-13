import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../context/AppContext'
import useChartTheme from '../hooks/useChartTheme'
import { formatCompact } from '../utils/format'

export default function TrendChart({ points, height = 260 }) {
  const { format } = useApp()
  const theme = useChartTheme()
  const gradientId = `trend-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const peak = points.reduce((best, p) => (p.value > best.value ? p : best), { value: 0, label: '' })

  return (
    <div
      className="chart"
      role="img"
      aria-label={`Spending trend. Highest point: ${peak.label || 'none'}, ${format(peak.value)}.`}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.trend} stopOpacity={0.28} />
              <stop offset="100%" stopColor={theme.trend} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.axis, fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: theme.axis, fontSize: 12 }}
            tickFormatter={formatCompact}
          />
          <Tooltip
            formatter={(value) => [format(value), 'Spending']}
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 10,
              color: theme.tooltipText,
            }}
            labelStyle={{ color: theme.tooltipText, fontWeight: 600 }}
            itemStyle={{ color: theme.tooltipText }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Spending"
            stroke={theme.trend}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
