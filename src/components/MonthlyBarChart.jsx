import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../context/AppContext'
import useChartTheme from '../hooks/useChartTheme'
import { formatCompact } from '../utils/format'

export default function MonthlyBarChart({ series, height = 280 }) {
  const { format } = useApp()
  const theme = useChartTheme()
  const summary = series
    .map((m) => `${m.label}: income ${format(m.income)}, expenses ${format(m.expenses)}`)
    .join('; ')

  return (
    <div className="chart" role="img" aria-label={`Income versus expenses by month. ${summary}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.axis, fontSize: 12 }}
            minTickGap={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: theme.axis, fontSize: 12 }}
            tickFormatter={formatCompact}
          />
          <Tooltip
            cursor={{ fill: theme.cursor }}
            formatter={(value, name) => [format(value), name]}
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 10,
              color: theme.tooltipText,
            }}
            labelStyle={{ color: theme.tooltipText, fontWeight: 600 }}
            itemStyle={{ color: theme.tooltipText }}
          />
          <Legend
            iconType="circle"
            formatter={(value) => <span style={{ color: theme.axis, fontSize: 12 }}>{value}</span>}
          />
          <Bar dataKey="income" name="Income" fill={theme.income} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
          <Bar dataKey="expenses" name="Expenses" fill={theme.expense} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
