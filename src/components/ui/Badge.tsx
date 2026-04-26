import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Color = 'green' | 'red' | 'blue' | 'amber' | 'indigo' | 'slate'

interface BadgeProps {
  children: ReactNode
  color?: Color
  className?: string
}

const colorClasses: Record<Color, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-rose-50 text-rose-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  slate: 'bg-slate-100 text-slate-600',
}

export function Badge({ children, color = 'slate', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colorClasses[color], className)}>
      {children}
    </span>
  )
}
