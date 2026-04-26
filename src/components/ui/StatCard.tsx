import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  icon?: ReactNode
  className?: string
  valueClassName?: string
}

export function StatCard({ label, value, delta, deltaPositive, icon, className, valueClassName }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <span className={cn('text-2xl font-bold text-slate-800 tracking-tight', valueClassName)}>{value}</span>
      {delta && (
        <span className={cn('text-xs font-medium', deltaPositive ? 'text-emerald-600' : 'text-rose-600')}>
          {deltaPositive ? '▲' : '▼'} {delta}
        </span>
      )}
    </Card>
  )
}
