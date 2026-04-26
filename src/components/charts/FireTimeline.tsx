import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ProjectionPoint } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface FireTimelineProps {
  data: ProjectionPoint[]
  retirementAge: number
  height?: number
}

export function FireTimeline({ data, retirementAge, height = 320 }: FireTimelineProps) {
  const retirementPoint = data.find((d) => d.age >= retirementAge)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, true)}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={65}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const point = payload[0]?.payload as ProjectionPoint
            return (
              <div className="bg-white border border-slate-100 rounded-lg shadow-lg p-3 text-xs space-y-1">
                <p className="font-semibold text-slate-700">{label} (Age {point.age})</p>
                <p className="text-indigo-600">Portfolio: {formatCurrency(point.portfolio)}</p>
                <p className="text-emerald-600">Lean FIRE: {formatCurrency(point.leanTarget)}</p>
                <p className="text-indigo-600">Regular FIRE: {formatCurrency(point.regularTarget)}</p>
                <p className="text-amber-600">Fat FIRE: {formatCurrency(point.fatTarget)}</p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="portfolio"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#portfolioGradient)"
          name="Portfolio"
        />
        <ReferenceLine
          y={data[0]?.leanTarget}
          stroke="#10b981"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: 'Lean', position: 'right', fontSize: 10, fill: '#10b981' }}
        />
        <ReferenceLine
          y={data[0]?.regularTarget}
          stroke="#6366f1"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: 'Regular', position: 'right', fontSize: 10, fill: '#6366f1' }}
        />
        <ReferenceLine
          y={data[0]?.fatTarget}
          stroke="#f59e0b"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: 'Fat', position: 'right', fontSize: 10, fill: '#f59e0b' }}
        />
        {retirementPoint && (
          <ReferenceLine
            x={retirementPoint.year}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: `Retire ${retirementAge}`, position: 'top', fontSize: 10, fill: '#94a3b8' }}
          />
        )}
        <Legend
          formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
