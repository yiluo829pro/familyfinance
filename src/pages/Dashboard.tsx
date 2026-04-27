import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { NetWorthLine } from '@/components/charts/NetWorthLine'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS, DEMO_INCOME } from '@/constants'

export function Dashboard() {
  const { assets, liabilities, income, snapshots, netWorth, totalAssets, totalLiabilities, totalAnnualIncome, fireResult, loadDemoData } =
    useFinancial()

  const isEmpty = assets.length === 0 && liabilities.length === 0 && income.length === 0

  const prevSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const delta = prevSnapshot ? netWorth - prevSnapshot.netWorth : null

  const { regularFire, leanFire, fatFire } = fireResult

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-20">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to FamilyFi</h2>
          <p className="text-slate-500 text-sm max-w-sm">
            Track your family's net worth, asset allocation, and FIRE progress — no spreadsheet needed.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => loadDemoData(DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS, DEMO_INCOME)}>
            Load Demo Data
          </Button>
          <Button variant="secondary" onClick={() => window.location.assign('/balance-sheet')}>
            Add My Assets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide mb-1">Total Net Worth</p>
            <p className="text-5xl font-bold tracking-tight">{formatCurrency(netWorth)}</p>
            {delta !== null && (
              <p className={`text-sm mt-1 ${delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {delta >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(delta))} since last snapshot
              </p>
            )}
          </div>
          <div className="flex gap-6 sm:text-right">
            <div>
              <p className="text-indigo-200 text-xs uppercase tracking-wide">Assets</p>
              <p className="text-xl font-semibold text-emerald-300">{formatCurrency(totalAssets)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs uppercase tracking-wide">Liabilities</p>
              <p className="text-xl font-semibold text-rose-300">-{formatCurrency(totalLiabilities)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs uppercase tracking-wide">Savings Rate</p>
              <p className="text-xl font-semibold text-amber-300">
                {fireResult.savingsRate > 0 ? formatPercent(fireResult.savingsRate) : '—'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Annual Income"
          value={totalAnnualIncome > 0 ? formatCurrency(totalAnnualIncome, true) : '—'}
          valueClassName="text-indigo-700"
        />
        <StatCard
          label="Annual Savings"
          value={fireResult.effectiveAnnualSavings > 0 ? formatCurrency(fireResult.effectiveAnnualSavings, true) : '—'}
          valueClassName="text-emerald-700"
        />
        <StatCard
          label="FIRE Progress"
          value={formatPercent(regularFire.progress)}
          valueClassName="text-indigo-700"
        />
        <StatCard
          label="Years to FIRE"
          value={regularFire.yearsToFire === Infinity ? '—' : `${regularFire.yearsToFire.toFixed(1)} yrs`}
          valueClassName="text-slate-700"
        />
      </div>

      {/* Net Worth History — full width, this is the dashboard's unique view */}
      <Card>
        <CardHeader>
          <CardTitle>Net Worth History</CardTitle>
          <a href="/balance-sheet" className="text-xs text-indigo-600 hover:underline">Add historical data →</a>
        </CardHeader>
        <NetWorthLine snapshots={snapshots} height={240} />
      </Card>

      {/* FIRE at a glance — unique to Dashboard, detail lives in FIRE tab */}
      <Card>
        <CardHeader>
          <CardTitle>FIRE at a Glance</CardTitle>
          <a href="/fire" className="text-xs text-indigo-600 hover:underline">Full analysis →</a>
        </CardHeader>
        <div className="space-y-4">
          {[
            { label: 'Lean FIRE', target: leanFire.target, progress: leanFire.progress, years: leanFire.yearsToFire, color: 'emerald' as const, barColor: 'emerald' as const },
            { label: 'Regular FIRE', target: regularFire.target, progress: regularFire.progress, years: regularFire.yearsToFire, color: 'indigo' as const, barColor: 'indigo' as const },
            { label: 'Fat FIRE', target: fatFire.target, progress: fatFire.progress, years: fatFire.yearsToFire, color: 'amber' as const, barColor: 'amber' as const },
          ].map((row) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{row.label}</span>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Target: <strong className="text-slate-700">{formatCurrency(row.target, true)}</strong></span>
                  <span>{formatPercent(row.progress, 0)}</span>
                  <span>{row.years === Infinity ? '∞' : `${row.years.toFixed(1)} yrs`}</span>
                </div>
              </div>
              <ProgressBar value={row.progress} color={row.barColor} size="sm" />
            </div>
          ))}
          <p className="text-xs text-slate-400 pt-1">
            Investable: {formatCurrency(fireResult.investableNetWorth, true)} · Saving {formatCurrency(fireResult.effectiveAnnualSavings, true)}/yr
          </p>
        </div>
      </Card>
    </div>
  )
}
