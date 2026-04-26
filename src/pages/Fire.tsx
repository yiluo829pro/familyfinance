import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { FireTimeline } from '@/components/charts/FireTimeline'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { annualizeIncome } from '@/lib/calculations'
import { INCOME_LABELS, INCOME_COLORS } from '@/constants'
import type { FireVariantResult, CoastFireResult } from '@/types'

interface FireCardProps {
  label: string
  variant: 'lean' | 'regular' | 'fat' | 'coast'
  result: FireVariantResult | null
  coastResult?: CoastFireResult
  description: string
}

const VARIANT_STYLES = {
  lean: { color: 'text-emerald-700', barColor: 'emerald' as const, badge: 'green' as const },
  regular: { color: 'text-indigo-700', barColor: 'indigo' as const, badge: 'indigo' as const },
  fat: { color: 'text-amber-700', barColor: 'amber' as const, badge: 'amber' as const },
  coast: { color: 'text-blue-700', barColor: 'indigo' as const, badge: 'blue' as const },
}

function FireCard({ label, variant, result, coastResult, description }: FireCardProps) {
  const styles = VARIANT_STYLES[variant]

  if (variant === 'coast' && coastResult) {
    return (
      <Card className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
          {coastResult.isCoasting ? (
            <Badge color="green">Coasting!</Badge>
          ) : (
            <Badge color="blue">Not Yet</Badge>
          )}
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Coast Number</p>
          <p className={`text-2xl font-bold ${styles.color}`}>{formatCurrency(coastResult.coastNumber)}</p>
        </div>
        <ProgressBar value={coastResult.isCoasting ? 1 : 0} color={styles.barColor} />
        <p className="text-xs text-slate-500">
          {coastResult.isCoasting
            ? 'You can stop saving — growth will carry you to FIRE.'
            : `${coastResult.yearsToCoast.toFixed(1)} yrs to reach Coast number`}
        </p>
      </Card>
    )
  }

  if (!result) return null

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        <Badge color={styles.badge}>{formatPercent(result.progress, 0)}</Badge>
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-1">Target Portfolio</p>
        <p className={`text-2xl font-bold ${styles.color}`}>{formatCurrency(result.target)}</p>
      </div>
      <ProgressBar value={result.progress} color={styles.barColor} />
      <div className="flex justify-between text-xs text-slate-500">
        <span>Gap: <strong className="text-slate-700">{formatCurrency(result.gap, true)}</strong></span>
        <span>{result.yearsToFire === Infinity ? '∞' : `${result.yearsToFire.toFixed(1)} yrs`}</span>
      </div>
    </Card>
  )
}

export function Fire() {
  const { assumptions, updateAssumptions, fireResult, assets, income, totalAnnualIncome } = useFinancial()

  const handleNum = (field: keyof typeof assumptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) updateAssumptions({ [field]: val })
  }

  const handleBool = (field: keyof typeof assumptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAssumptions({ [field]: e.target.checked })
  }

  const noAssets = assets.length === 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Life Goals / Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle>Life Goals & Assumptions</CardTitle>
        </CardHeader>

        <div className="space-y-5">
          {/* Ages */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ages</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Your Current Age"
                type="number"
                min={18}
                max={80}
                value={assumptions.currentAge}
                onChange={handleNum('currentAge')}
                suffix="yrs"
              />
              <Input
                label="Partner's Age (optional)"
                type="number"
                min={18}
                max={80}
                value={assumptions.partnerAge ?? ''}
                onChange={handleNum('partnerAge')}
                suffix="yrs"
              />
              <Input
                label="Target Retirement Age"
                type="number"
                min={30}
                max={80}
                value={assumptions.targetRetirementAge}
                onChange={handleNum('targetRetirementAge')}
                suffix="yrs"
              />
            </div>
          </div>

          {/* Finances */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Annual Finances</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Annual Living Expenses"
                type="number"
                min={0}
                value={assumptions.annualExpenses}
                onChange={handleNum('annualExpenses')}
                prefix="$"
              />
              <Input
                label="Annual Savings"
                type="number"
                min={0}
                value={assumptions.annualSavings}
                onChange={handleNum('annualSavings')}
                prefix="$"
              />
            </div>
          </div>

          {/* Children Planning */}
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-3">Family Planning</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Planned Children"
                type="number"
                min={0}
                max={10}
                value={assumptions.plannedChildren}
                onChange={handleNum('plannedChildren')}
              />
              <Input
                label="Annual Cost per Child"
                type="number"
                min={0}
                value={assumptions.childAnnualCost}
                onChange={handleNum('childAnnualCost')}
                prefix="$"
              />
              <Input
                label="Years Until First Child"
                type="number"
                min={0}
                max={20}
                value={assumptions.yearsUntilFirstChild}
                onChange={handleNum('yearsUntilFirstChild')}
                suffix="yrs"
              />
            </div>
            <p className="text-xs text-rose-600 mt-3">
              Children add{' '}
              <strong>{formatCurrency(assumptions.plannedChildren * assumptions.childAnnualCost)}/yr</strong> to spending.
              Effective annual expenses:{' '}
              <strong>{formatCurrency(fireResult.effectiveAnnualExpenses)}</strong>
            </p>
          </div>

          {/* Returns */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Investment Assumptions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Expected Return (nominal)"
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={(assumptions.expectedReturnRate * 100).toFixed(1)}
                onChange={(e) => updateAssumptions({ expectedReturnRate: parseFloat(e.target.value) / 100 })}
                suffix="%"
              />
              <Input
                label="Inflation Rate"
                type="number"
                min={0}
                max={15}
                step={0.1}
                value={(assumptions.inflationRate * 100).toFixed(1)}
                onChange={(e) => updateAssumptions({ inflationRate: parseFloat(e.target.value) / 100 })}
                suffix="%"
              />
              <Input
                label="Lean FIRE Multiplier"
                type="number"
                min={0.1}
                max={1}
                step={0.05}
                value={assumptions.leanFireMultiplier}
                onChange={handleNum('leanFireMultiplier')}
                suffix="×"
              />
              <Input
                label="Fat FIRE Multiplier"
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={assumptions.fatFireMultiplier}
                onChange={handleNum('fatFireMultiplier')}
                suffix="×"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={assumptions.includeRealEstateInFire}
                onChange={handleBool('includeRealEstateInFire')}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Include real estate equity in FIRE investable net worth</span>
            </label>
          </div>
        </div>
      </Card>

      {noAssets && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
          Add your assets on the Balance Sheet page to see your FIRE progress.
        </div>
      )}

      {/* Income summary */}
      {income.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
            <span className="text-sm text-slate-500">
              Total: <strong className="text-indigo-700">{formatCurrency(totalAnnualIncome)}/yr</strong>
            </span>
          </CardHeader>
          <div className="space-y-2 mb-4">
            {income.filter((i) => i.isActive).map((src) => {
              const annual = annualizeIncome(src)
              const pct = totalAnnualIncome > 0 ? annual / totalAnnualIncome : 0
              return (
                <div key={src.id} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: INCOME_COLORS[src.category] }} />
                  <span className="text-sm text-slate-700 flex-1">{src.name}</span>
                  <span className="text-xs text-slate-400">{INCOME_LABELS[src.category]}</span>
                  <span className="text-sm font-semibold text-slate-800 w-28 text-right">{formatCurrency(annual)}/yr</span>
                  <span className="text-xs text-slate-400 w-12 text-right">{formatPercent(pct, 0)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Income</p>
              <p className="text-lg font-bold text-indigo-700">{formatCurrency(totalAnnualIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Annual Savings</p>
              <p className={`text-lg font-bold ${fireResult.effectiveAnnualSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(fireResult.effectiveAnnualSavings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Savings Rate</p>
              <p className={`text-lg font-bold ${fireResult.savingsRate >= 0.3 ? 'text-emerald-700' : fireResult.savingsRate >= 0.15 ? 'text-amber-700' : 'text-rose-700'}`}>
                {formatPercent(fireResult.savingsRate)}
              </p>
              <p className="text-xs text-slate-400">{fireResult.savingsRate >= 0.3 ? 'Excellent' : fireResult.savingsRate >= 0.15 ? 'Good' : 'Low'}</p>
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assumptions.useIncomeDerivedSavings}
                onChange={(e) => updateAssumptions({ useIncomeDerivedSavings: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">
                Auto-compute savings from income − expenses (recommended)
              </span>
            </label>
            {!assumptions.useIncomeDerivedSavings && (
              <div className="mt-3 max-w-xs">
                <Input
                  label="Manual Annual Savings Override"
                  type="number"
                  min={0}
                  value={assumptions.annualSavings}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val)) updateAssumptions({ annualSavings: val })
                  }}
                  prefix="$"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {income.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          Add income sources on the <a href="/balance-sheet" className="font-semibold underline">Balance Sheet</a> page to auto-calculate your savings rate.
        </div>
      )}

      {/* Investable net worth summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Investable Net Worth</p>
          <p className="text-3xl font-bold text-indigo-700">{formatCurrency(fireResult.investableNetWorth)}</p>
          <p className="text-xs text-slate-400 mt-1">Effective expenses: {formatCurrency(fireResult.effectiveAnnualExpenses)}/yr</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Real Return Rate</p>
          <p className="text-3xl font-bold text-slate-700">
            {formatPercent(
              (1 + assumptions.expectedReturnRate) / (1 + assumptions.inflationRate) - 1,
            )}
          </p>
          <p className="text-xs text-slate-400 mt-1">After inflation</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Years to Retire</p>
          <p className="text-3xl font-bold text-slate-700">
            {assumptions.targetRetirementAge - assumptions.currentAge}
          </p>
          <p className="text-xs text-slate-400 mt-1">At age {assumptions.targetRetirementAge}</p>
        </Card>
      </div>

      {/* FIRE Comparison */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">FIRE Comparison</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FireCard
            label="Lean FIRE"
            variant="lean"
            result={fireResult.leanFire}
            description={`${Math.round(assumptions.leanFireMultiplier * 100)}% of current spending`}
          />
          <FireCard
            label="Regular FIRE"
            variant="regular"
            result={fireResult.regularFire}
            description="4% safe withdrawal rate"
          />
          <FireCard
            label="Fat FIRE"
            variant="fat"
            result={fireResult.fatFire}
            description={`${Math.round(assumptions.fatFireMultiplier * 100)}% of current spending`}
          />
          <FireCard
            label="Coast FIRE"
            variant="coast"
            result={null}
            coastResult={fireResult.coastFire}
            description="Stop saving, let it grow"
          />
        </div>
      </div>

      {/* Timeline chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Growth Timeline</CardTitle>
          <span className="text-xs text-slate-400">Projected in today's dollars (real return)</span>
        </CardHeader>
        <FireTimeline
          data={fireResult.projectionData}
          retirementAge={assumptions.targetRetirementAge}
          height={340}
        />
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Lean FIRE ({formatCurrency(fireResult.leanFire.target, true)})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block" /> Regular FIRE ({formatCurrency(fireResult.regularFire.target, true)})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> Fat FIRE ({formatCurrency(fireResult.fatFire.target, true)})</span>
        </div>
      </Card>
    </div>
  )
}
