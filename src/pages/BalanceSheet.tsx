import { useState } from 'react'
import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AssetForm } from '@/components/balance-sheet/AssetForm'
import { LiabilityForm } from '@/components/balance-sheet/LiabilityForm'
import { IncomeForm } from '@/components/balance-sheet/IncomeForm'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
  CATEGORY_LABELS, CATEGORY_COLORS, LIABILITY_LABELS,
  INCOME_LABELS, INCOME_COLORS,
  DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS, DEMO_INCOME,
} from '@/constants'
import { annualizeIncome } from '@/lib/calculations'
import type { Asset, Liability, IncomeSource, AssetCategory, IncomeCategory } from '@/types'

const ASSET_CATEGORIES: AssetCategory[] = ['real_estate', 'investments', 'retirement', 'cash_alternatives']
const INCOME_CATEGORIES: IncomeCategory[] = ['salary', 'bonus', 'rental', 'side_income', 'investment_income', 'other']

function AssetTableRow({ asset, onEdit, onDelete }: { asset: Asset; onEdit: (a: Asset) => void; onDelete: (id: string) => void }) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800">{asset.name}</span>
          {!asset.isLiquid && <Badge color="slate">Non-liquid</Badge>}
          {asset.subcategory && <Badge color="indigo">{asset.subcategory}</Badge>}
        </div>
        {asset.notes && <p className="text-xs text-slate-400 mt-0.5">{asset.notes}</p>}
      </td>
      <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-700 whitespace-nowrap">{formatCurrency(asset.value)}</td>
      <td className="py-3 px-4 w-32">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" onClick={() => onEdit(asset)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(asset.id)}><span className="text-rose-500">Delete</span></Button>
        </div>
      </td>
    </tr>
  )
}

export function BalanceSheet() {
  const {
    assets, liabilities, income, totalAssets, totalLiabilities, totalAnnualIncome, netWorth,
    addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability,
    addIncome, updateIncome, deleteIncome,
    loadDemoData, fireResult,
  } = useFinancial()

  const [assetModal, setAssetModal] = useState<{ open: boolean; existing?: Asset }>({ open: false })
  const [liabilityModal, setLiabilityModal] = useState<{ open: boolean; existing?: Liability }>({ open: false })
  const [incomeModal, setIncomeModal] = useState<{ open: boolean; existing?: IncomeSource }>({ open: false })

  const isEmpty = assets.length === 0 && liabilities.length === 0 && income.length === 0
  const estimatedSavings = fireResult.effectiveAnnualSavings
  const savingsRate = fireResult.savingsRate

  return (
    <div className="space-y-6 max-w-5xl">
      {isEmpty && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-indigo-700">No data yet. Add your income, assets, and liabilities — or load demo data.</p>
          <Button size="sm" onClick={() => loadDemoData(DEMO_ASSETS, DEMO_LIABILITIES, DEMO_SNAPSHOTS, DEMO_INCOME)}>
            Load Demo
          </Button>
        </div>
      )}

      {/* INCOME */}
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <Button size="sm" onClick={() => setIncomeModal({ open: true })}>+ Add Income</Button>
        </CardHeader>

        {INCOME_CATEGORIES.map((cat) => {
          const catIncome = income.filter((i) => i.category === cat)
          if (catIncome.length === 0) return null
          const catTotal = catIncome.filter((i) => i.isActive).reduce((s, i) => s + annualizeIncome(i), 0)
          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INCOME_COLORS[cat] }} />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{INCOME_LABELS[cat]}</span>
                <span className="ml-auto text-xs text-slate-500">{formatCurrency(catTotal)}/yr</span>
              </div>
              <table className="w-full">
                <tbody>
                  {catIncome.map((src) => (
                    <tr key={src.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{src.name}</span>
                          {!src.isActive && <Badge color="slate">Inactive</Badge>}
                          <Badge color="slate">{src.frequency === 'monthly' ? 'Monthly' : 'Annual'}</Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <p className="text-sm font-semibold text-indigo-700">{formatCurrency(annualizeIncome(src))}/yr</p>
                        {src.frequency === 'monthly' && (
                          <p className="text-xs text-slate-400">{formatCurrency(src.amount)}/mo</p>
                        )}
                      </td>
                      <td className="py-3 px-4 w-32">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={() => setIncomeModal({ open: true, existing: src })}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteIncome(src.id)}><span className="text-rose-500">Delete</span></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        {income.length > 0 && (
          <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Total Annual Income</span>
              <span className="text-lg font-bold text-indigo-700">{formatCurrency(totalAnnualIncome)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Expenses (incl. children)</span>
              <span className="text-rose-600">-{formatCurrency(fireResult.effectiveAnnualExpenses)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold border-t border-slate-100 pt-2">
              <span className="text-slate-700">Estimated Annual Savings</span>
              <span className={estimatedSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {formatCurrency(estimatedSavings)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Savings Rate</span>
              <span className={`font-semibold ${savingsRate >= 0.2 ? 'text-emerald-600' : savingsRate >= 0.1 ? 'text-amber-600' : 'text-rose-600'}`}>
                {formatPercent(savingsRate)}
              </span>
            </div>
          </div>
        )}
      </Card>

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
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{CATEGORY_LABELS[cat]}</span>
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
                <th className="text-left text-xs font-medium text-slate-500 py-2 px-4 w-full">Name</th>
                <th className="text-right text-xs font-medium text-slate-500 py-2 px-4 whitespace-nowrap">Balance</th>
                <th className="text-right text-xs font-medium text-slate-500 py-2 px-4 whitespace-nowrap">Rate</th>
                <th className="text-right text-xs font-medium text-slate-500 py-2 px-4 whitespace-nowrap">Monthly</th>
                <th className="py-2 px-4 w-32" />
              </tr>
            </thead>
            <tbody>
              {liabilities.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50 group transition-colors">
                  <td className="py-3 px-4 w-full">
                    <p className="text-sm font-medium text-slate-800">{l.name}</p>
                    <Badge color="slate">{LIABILITY_LABELS[l.category]}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-rose-700 whitespace-nowrap">-{formatCurrency(l.balance)}</td>
                  <td className="py-3 px-4 text-right text-sm text-slate-500 whitespace-nowrap">{l.interestRate != null ? `${l.interestRate}%` : '—'}</td>
                  <td className="py-3 px-4 text-right text-sm text-slate-500 whitespace-nowrap">{l.monthlyPayment != null ? formatCurrency(l.monthlyPayment) : '—'}</td>
                  <td className="py-3 px-4 w-32">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => setLiabilityModal({ open: true, existing: l })}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteLiability(l.id)}><span className="text-rose-500">Delete</span></Button>
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
      <div className="bg-slate-900 text-white rounded-xl px-6 py-5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">Net Worth</span>
          <span className={`text-3xl font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netWorth)}
          </span>
        </div>
        {totalAnnualIncome > 0 && (
          <div className="flex gap-6 text-sm text-slate-400 border-t border-slate-800 pt-3">
            <span>Annual Income: <strong className="text-indigo-300">{formatCurrency(totalAnnualIncome)}</strong></span>
            <span>Savings Rate: <strong className={savingsRate >= 0.2 ? 'text-emerald-300' : 'text-amber-300'}>{formatPercent(savingsRate)}</strong></span>
          </div>
        )}
      </div>

      {/* Modals — key forces remount so form state resets when switching items */}
      <IncomeForm
        key={incomeModal.existing?.id ?? 'new-income'}
        open={incomeModal.open}
        existing={incomeModal.existing}
        onClose={() => setIncomeModal({ open: false, existing: undefined })}
        onSave={incomeModal.existing ? (data) => updateIncome(incomeModal.existing!.id, data) : addIncome}
      />
      <AssetForm
        key={assetModal.existing?.id ?? 'new-asset'}
        open={assetModal.open}
        existing={assetModal.existing}
        onClose={() => setAssetModal({ open: false, existing: undefined })}
        onSave={assetModal.existing ? (data) => updateAsset(assetModal.existing!.id, data) : addAsset}
      />
      <LiabilityForm
        key={liabilityModal.existing?.id ?? 'new-liability'}
        open={liabilityModal.open}
        existing={liabilityModal.existing}
        onClose={() => setLiabilityModal({ open: false, existing: undefined })}
        onSave={liabilityModal.existing ? (data) => updateLiability(liabilityModal.existing!.id, data) : addLiability}
      />
    </div>
  )
}
