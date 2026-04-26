import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'gradient'
  size?: 'sm' | 'md'
}

const colorClasses = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  gradient: 'bg-gradient-to-r from-indigo-500 to-emerald-500',
}

export function ProgressBar({ value, className, color = 'gradient', size = 'md' }: ProgressBarProps) {
  const pct = Math.min(Math.max(value * 100, 0), 100)
  return (
    <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
