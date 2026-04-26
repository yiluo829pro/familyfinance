import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface AllocationDonutProps {
  data: { category: string; value: number }[]
  height?: number
}

export function AllocationDonut({ data, height = 280 }: AllocationDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  const chartData = data.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    value: d.value,
    color: CATEGORY_COLORS[d.category] ?? '#94a3b8',
    pct: total > 0 ? d.value / total : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [formatCurrency(Number(value)), '']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => {
            const item = chartData.find((d) => d.name === value)
            return (
              <span style={{ color: '#475569', fontSize: '12px' }}>
                {value} — {formatPercent(item?.pct ?? 0, 0)}
              </span>
            )
          }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
