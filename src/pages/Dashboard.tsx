import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { AllocationDonut } from '@/components/charts/AllocationDonut'
import { NetWorthLine } from '@/components/charts/NetWorthLine'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { CATEGORY_LABELS, DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS, DEMO_INCOME } from '@/constants'
import type { AssetCategory } from '@/types'

export function Dashboard() {
  const { assets, liabilities, income, snapshots, netWorth, totalAssets, totalLiabilities, totalAnnualIncome, fireResult, loadDemoData } =
    useFinancial()

  const isEmpty = assets.length === 0 && liabilities.length === 0 && income.length === 0

  // Build allocation data grouped by category
  const allocationData = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + a.value
      return acc
    }, {}),
  ).map(([category, value]) => ({ category, value }))

  // Net worth delta vs previous snapshot
  const prevSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const delta = prevSnapshot ? netWorth - prevSnapshot.netWorth : null

  const { regularFire } = fireResult

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
            Track your family's net worth, asset allocation, and FIRE progress in one place.
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
              <p className="text-indigo-200 text-xs uppercase tracking-wide">Total Assets</p>
              <p className="text-xl font-semibold text-emerald-300">{formatCurrency(totalAssets)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs uppercase tracking-wide">Total Liabilities</p>
              <p className="text-xl font-semibold text-rose-300">-{formatCurrency(totalLiabilities)}</p>
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
          label="Savings Rate"
          value={fireResult.savingsRate > 0 ? formatPercent(fireResult.savingsRate) : '—'}
          valueClassName={fireResult.savingsRate >= 0.2 ? 'text-emerald-700' : 'text-amber-700'}
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

      {/* FIRE Progress bar */}
      <Card>
        <CardHeader>
          <CardTitle>FIRE Progress (Regular — 4% SWR)</CardTitle>
          <span className="text-sm text-slate-500">
            {formatCurrency(fireResult.investableNetWorth)} / {formatCurrency(regularFire.target)}
          </span>
        </CardHeader>
        <ProgressBar value={regularFire.progress} />
        <p className="mt-2 text-xs text-slate-500">
          Gap to fill: <span className="font-medium text-slate-700">{formatCurrency(regularFire.gap)}</span>
          {' · '}
          Annual expenses (incl. children): <span className="font-medium text-slate-700">{formatCurrency(fireResult.effectiveAnnualExpenses)}</span>
        </p>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          {allocationData.length > 0 ? (
            <AllocationDonut data={allocationData} />
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No assets yet</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Worth History</CardTitle>
          </CardHeader>
          <NetWorthLine snapshots={snapshots} />
        </Card>
      </div>

      {/* Asset category summary */}
      {allocationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {allocationData.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-600 shrink-0">
                  {CATEGORY_LABELS[item.category as AssetCategory]}
                </div>
                <div className="flex-1">
                  <ProgressBar
                    value={totalAssets > 0 ? item.value / totalAssets : 0}
                    color="indigo"
                    size="sm"
                  />
                </div>
                <div className="w-24 text-right text-sm font-medium text-slate-700">
                  {formatCurrency(item.value, true)}
                </div>
                <div className="w-12 text-right text-xs text-slate-400">
                  {formatPercent(totalAssets > 0 ? item.value / totalAssets : 0, 0)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
