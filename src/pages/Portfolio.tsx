import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AllocationDonut } from '@/components/charts/AllocationDonut'
import { CategoryBar } from '@/components/charts/CategoryBar'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/constants'
import type { AssetCategory } from '@/types'

const badgeColors: Record<AssetCategory, 'indigo' | 'green' | 'amber' | 'blue'> = {
  real_estate: 'indigo',
  investments: 'green',
  retirement: 'amber',
  cash_alternatives: 'blue',
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

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No assets yet — add them on the Balance Sheet page.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Charts row */}
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

      {/* Category breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {byCategory.map(({ category, value }) => {
          const pct = totalAssets > 0 ? value / totalAssets : 0
          const color = CATEGORY_COLORS[category] ?? '#94a3b8'
          return (
            <Card key={category} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
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

      {/* Full asset table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
          <span className="text-sm text-slate-500">Total: {formatCurrency(totalAssets)}</span>
        </CardHeader>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-500 py-2">Asset</th>
              <th className="text-left text-xs font-medium text-slate-500 py-2">Category</th>
              <th className="text-right text-xs font-medium text-slate-500 py-2">Value</th>
              <th className="text-right text-xs font-medium text-slate-500 py-2">% of Total</th>
              <th className="text-right text-xs font-medium text-slate-500 py-2">Investable</th>
            </tr>
          </thead>
          <tbody>
            {assets
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((asset) => (
                <tr key={asset.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-slate-800">{asset.name}</p>
                    {asset.subcategory && <p className="text-xs text-slate-400">{asset.subcategory}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[asset.category] }} />
                      <span className="text-xs text-slate-600">{CATEGORY_LABELS[asset.category]}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-sm font-semibold text-slate-800">
                    {formatCurrency(asset.value)}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-500">
                    {formatPercent(totalAssets > 0 ? asset.value / totalAssets : 0)}
                  </td>
                  <td className="py-3 text-right">
                    {asset.isLiquid ? (
                      <Badge color="green">Yes</Badge>
                    ) : (
                      <Badge color="slate">No</Badge>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200">
              <td colSpan={2} className="py-3 text-sm font-bold text-slate-700">Total</td>
              <td className="py-3 text-right text-sm font-bold text-emerald-700">{formatCurrency(totalAssets)}</td>
              <td className="py-3 text-right text-xs text-slate-500">100%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  )
}
