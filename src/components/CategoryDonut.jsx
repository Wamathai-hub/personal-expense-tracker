import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../context/AppContext'
import useChartTheme from '../hooks/useChartTheme'
import { colorFor } from '../data/categories'
import { formatCompact } from '../utils/format'

export default function CategoryDonut({ data }) {
  const { format, settings } = useApp()
  const theme = useChartTheme()
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const share = (value) => (total > 0 ? Math.round((value / total) * 1000) / 10 : 0)
  const summary = data.map((d) => `${d.name} ${share(d.value)}%`).join(', ')

  return (
    <div className="donut">
      <div className="donut-chart" role="img" aria-label={`Expenses by category: ${summary}`}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={colorFor(d.name)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [format(value), name]}
              contentStyle={{
                background: theme.tooltipBg,
                border: `1px solid ${theme.tooltipBorder}`,
                borderRadius: 10,
                color: theme.tooltipText,
              }}
              itemStyle={{ color: theme.tooltipText }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center" aria-hidden="true">
          <span>Total spent</span>
          <strong>
            {settings.currency} {formatCompact(total)}
          </strong>
        </div>
      </div>
      <ul className="legend-list">
        {data.map((d) => (
          <li key={d.name}>
            <span className="dot" style={{ background: colorFor(d.name) }} />
            <span className="legend-name">{d.name}</span>
            <span className="legend-value">{format(d.value)}</span>
            <span className="legend-pct">{share(d.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
