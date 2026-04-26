import { useState } from 'react'
import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AssetForm } from '@/components/balance-sheet/AssetForm'
import { LiabilityForm } from '@/components/balance-sheet/LiabilityForm'
import { formatCurrency } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_COLORS, LIABILITY_LABELS, DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS } from '@/constants'
import type { Asset, Liability, AssetCategory } from '@/types'

const ASSET_CATEGORIES: AssetCategory[] = ['real_estate', 'investments', 'retirement', 'cash_alternatives']

interface AssetTableRowProps {
  asset: Asset
  onEdit: (a: Asset) => void
  onDelete: (id: string) => void
}

function AssetTableRow({ asset, onEdit, onDelete }: AssetTableRowProps) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">{asset.name}</span>
          {!asset.isLiquid && <Badge color="slate">Non-liquid</Badge>}
          {asset.subcategory && <Badge color="indigo">{asset.subcategory}</Badge>}
        </div>
        {asset.notes && <p className="text-xs text-slate-400 mt-0.5">{asset.notes}</p>}
      </td>
      <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-700">
        {formatCurrency(asset.value)}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" onClick={() => onEdit(asset)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(asset.id)}>
            <span className="text-rose-500">Delete</span>
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function BalanceSheet() {
  const { assets, liabilities, totalAssets, totalLiabilities, netWorth, addAsset, updateAsset, deleteAsset, addLiability, updateLiability, deleteLiability, loadDemoData } =
    useFinancial()

  const [assetModal, setAssetModal] = useState<{ open: boolean; existing?: Asset }>({ open: false })
  const [liabilityModal, setLiabilityModal] = useState<{ open: boolean; existing?: Liability }>({ open: false })

  const isEmpty = assets.length === 0 && liabilities.length === 0

  return (
    <div className="space-y-6 max-w-5xl">
      {isEmpty && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-indigo-700">No data yet. Add your assets and liabilities or load demo data.</p>
          <Button size="sm" onClick={() => loadDemoData(DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS)}>
            Load Demo
          </Button>
        </div>
      )}

      {/* ASSETS */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <Button size="sm" onClick={() => setAssetModal({ open: true })}>+ Add Asset</Button>
        </CardHeader>

        {ASSET_CATEGORIES.map((cat) => {
          const catAssets = assets.filter((a) => a.category === cat)
          if (catAssets.length === 0) return null
          const catTotal = catAssets.reduce((s, a) => s + a.value, 0)
          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="ml-auto text-xs text-slate-500">{formatCurrency(catTotal)}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {catAssets.map((a) => (
                    <AssetTableRow
                      key={a.id}
                      asset={a}
                      onEdit={(asset) => setAssetModal({ open: true, existing: asset })}
                      onDelete={deleteAsset}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
          <span className="text-sm font-bold text-slate-700">Total Assets</span>
          <span className="text-lg font-bold text-emerald-700">{formatCurrency(totalAssets)}</span>
        </div>
      </Card>

      {/* LIABILITIES */}
      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
          <Button size="sm" onClick={() => setLiabilityModal({ open: true })}>+ Add Liability</Button>
        </CardHeader>

        {liabilities.length > 0 && (
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 py-2 px-4">Name</th>
                <th className="text-right text-xs font-medium text-slate-500 py-2 px-4">Balance</th>
                <th className="text-right text-xs font-medium text-slate-500 py-2 px-4">Rate</th>
                <th className="text-right text-xs font-medium text-slate-500 py-2 px-4">Monthly</th>
                <th className="py-2 px-4" />
              </tr>
            </thead>
            <tbody>
              {liabilities.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50 group transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-slate-800">{l.name}</p>
                    <Badge color="slate">{LIABILITY_LABELS[l.category]}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-rose-700">
                    -{formatCurrency(l.balance)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-slate-500">
                    {l.interestRate != null ? `${l.interestRate}%` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-slate-500">
                    {l.monthlyPayment != null ? formatCurrency(l.monthlyPayment) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => setLiabilityModal({ open: true, existing: l })}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteLiability(l.id)}>
                        <span className="text-rose-500">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <span className="text-sm font-bold text-slate-700">Total Liabilities</span>
          <span className="text-lg font-bold text-rose-700">-{formatCurrency(totalLiabilities)}</span>
        </div>
      </Card>

      {/* Net Worth Summary */}
      <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl px-6 py-4">
        <span className="font-bold text-lg">Net Worth</span>
        <span className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatCurrency(netWorth)}
        </span>
      </div>

      {/* Modals */}
      <AssetForm
        open={assetModal.open}
        existing={assetModal.existing}
        onClose={() => setAssetModal({ open: false })}
        onSave={assetModal.existing ? (data) => updateAsset(assetModal.existing!.id, data) : addAsset}
      />
      <LiabilityForm
        open={liabilityModal.open}
        existing={liabilityModal.existing}
        onClose={() => setLiabilityModal({ open: false })}
        onSave={liabilityModal.existing ? (data) => updateLiability(liabilityModal.existing!.id, data) : addLiability}
      />
    </div>
  )
}
