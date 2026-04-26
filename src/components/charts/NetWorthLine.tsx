import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { NetWorthSnapshot } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface NetWorthLineProps {
  snapshots: NetWorthSnapshot[]
  height?: number
}

export function NetWorthLine({ snapshots, height = 200 }: NetWorthLineProps) {
  if (snapshots.length < 2) return (
    <div className="flex items-center justify-center h-32 text-sm text-slate-400">
      Add more data points to see the trend
    </div>
  )

  const data = snapshots.map((s) => ({
    date: s.date.slice(0, 7),
    netWorth: s.netWorth,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, true)}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [formatCurrency(Number(v)), 'Net Worth']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
