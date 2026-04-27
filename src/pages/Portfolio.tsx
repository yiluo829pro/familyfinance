import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AllocationDonut } from '@/components/charts/AllocationDonut'
import { CategoryBar } from '@/components/charts/CategoryBar'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_COLORS, INVESTMENT_SUBCATEGORIES, RETIREMENT_SUBCATEGORIES } from '@/constants'
import type { AssetCategory } from '@/types'

const badgeColors: Record<AssetCategory, 'indigo' | 'green' | 'amber' | 'blue'> = {
  real_estate: 'indigo',
  investments: 'green',
  retirement: 'amber',
  cash_alternatives: 'blue',
}

const ALL_SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries([
  ...INVESTMENT_SUBCATEGORIES.map((s) => [s.value, s.label]),
  ...RETIREMENT_SUBCATEGORIES.map((s) => [s.value, s.label]),
])

function SubBreakdown({ category, assets, totalAssets }: {
  category: AssetCategory
  assets: { name: string; value: number; subcategory?: string }[]
  totalAssets: number
}) {
  const catAssets = assets.filter((a) => (a as { category?: string }).category === category)
  if (catAssets.length === 0) return null

  // Group by subcategory
  const groups = catAssets.reduce<Record<string, number>>((acc, a) => {
    const key = a.subcategory || 'other'
    acc[key] = (acc[key] ?? 0) + a.value
    return acc
  }, {})

  const catTotal = catAssets.reduce((s, a) => s + a.value, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
          <CardTitle>{CATEGORY_LABELS[category]} Breakdown</CardTitle>
        </div>
        <span className="text-sm font-semibold text-slate-700">{formatCurrency(catTotal)}</span>
      </CardHeader>
      <div className="space-y-2.5">
        {Object.entries(groups).sort(([, a], [, b]) => b - a).map(([sub, val]) => {
          const pct = catTotal > 0 ? val / catTotal : 0
          const label = ALL_SUBCATEGORY_LABELS[sub] ?? sub
          return (
            <div key={sub} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">{label}</span>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-800">{formatCurrency(val)}</span>
                  <span>{formatPercent(pct, 0)}</span>
                  <span className="text-slate-400">{formatPercent(totalAssets > 0 ? val / totalAssets : 0, 1)} of total</span>
                </div>
              </div>
              <ProgressBar value={pct} color="indigo" size="sm" />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function Portfolio() {
  const { assets, totalAssets } = useFinancial()

  const byCategory = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + a.value
      return acc
    }, {}),
  ).map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)

  const assetsWithCategory = assets.map((a) => ({ ...a }))

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No assets yet — add them on the Balance Sheet page.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocation by Category</CardTitle>
          </CardHeader>
          <AllocationDonut data={byCategory} height={300} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Value by Category</CardTitle>
          </CardHeader>
          <CategoryBar data={byCategory} height={220} />
        </Card>
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {byCategory.map(({ category, value }) => {
          const pct = totalAssets > 0 ? value / totalAssets : 0
          return (
            <Card key={category} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
                  <span className="text-sm font-semibold text-slate-800">{CATEGORY_LABELS[category as AssetCategory]}</span>
                </div>
                <Badge color={badgeColors[category as AssetCategory]}>{formatPercent(pct, 1)}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(value)}</p>
              <ProgressBar value={pct} size="sm" color="indigo" />
            </Card>
          )
        })}
      </div>

      {/* Sub-category breakdowns for investments and retirement */}
      <SubBreakdown category="investments" assets={assetsWithCategory} totalAssets={totalAssets} />
      <SubBreakdown category="retirement" assets={assetsWithCategory} totalAssets={totalAssets} />

      {/* Full asset table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
          <span className="text-sm text-slate-500">Total: {formatCurrency(totalAssets)}</span>
        </CardHeader>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-500 py-2 w-full">Asset</th>
              <th className="text-left text-xs font-medium text-slate-500 py-2 px-3 whitespace-nowrap">Type</th>
              <th className="text-right text-xs font-medium text-slate-500 py-2 px-3 whitespace-nowrap">Value</th>
              <th className="text-right text-xs font-medium text-slate-500 py-2 px-3 whitespace-nowrap">% of Total</th>
              <th className="text-right text-xs font-medium text-slate-500 py-2 whitespace-nowrap">Investable</th>
            </tr>
          </thead>
          <tbody>
            {assets.slice().sort((a, b) => b.value - a.value).map((asset) => (
              <tr key={asset.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-3 w-full">
                  <p className="text-sm font-medium text-slate-800">{asset.name}</p>
                  {asset.subcategory && (
                    <p className="text-xs text-slate-400">{ALL_SUBCATEGORY_LABELS[asset.subcategory] ?? asset.subcategory}</p>
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[asset.category] }} />
                    <span className="text-xs text-slate-600 whitespace-nowrap">{CATEGORY_LABELS[asset.category]}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-sm font-semibold text-slate-800 whitespace-nowrap">
                  {formatCurrency(asset.value)}
                </td>
                <td className="py-3 px-3 text-right text-xs text-slate-500 whitespace-nowrap">
                  {formatPercent(totalAssets > 0 ? asset.value / totalAssets : 0)}
                </td>
                <td className="py-3 text-right">
                  {asset.isLiquid ? <Badge color="green">Yes</Badge> : <Badge color="slate">No</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200">
              <td colSpan={2} className="py-3 text-sm font-bold text-slate-700">Total</td>
              <td className="py-3 px-3 text-right text-sm font-bold text-emerald-700">{formatCurrency(totalAssets)}</td>
              <td className="py-3 px-3 text-right text-xs text-slate-500">100%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  )
}
