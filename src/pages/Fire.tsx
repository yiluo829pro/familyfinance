import { useState } from 'react'
import { useFinancial } from '@/context/FinancialContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FireTimeline } from '@/components/charts/FireTimeline'
import { ScenarioForm } from '@/components/fire/ScenarioForm'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { annualizeIncome, computeScenarioFireResult } from '@/lib/calculations'
import { INCOME_LABELS, INCOME_COLORS } from '@/constants'
import type { FireVariantResult, CoastFireResult, Scenario, FireResult } from '@/types'

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

interface ScenarioCardProps {
  scenario: Scenario
  result: FireResult
  baseResult: FireResult
  onEdit: () => void
  onDelete: () => void
}

function ScenarioCard({ scenario, result, baseResult, onEdit, onDelete }: ScenarioCardProps) {
  const yearsDelta = result.regularFire.yearsToFire - baseResult.regularFire.yearsToFire
  const savingsDelta = result.effectiveAnnualSavings - baseResult.effectiveAnnualSavings
  const expenseDelta = result.effectiveAnnualExpenses - baseResult.effectiveAnnualExpenses

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: scenario.color }} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{scenario.name}</p>
            {scenario.description && (
              <p className="text-xs text-slate-400 truncate">{scenario.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="text-xs text-slate-400 hover:text-indigo-600 px-1.5 py-0.5 rounded transition-colors">Edit</button>
          <button onClick={onDelete} className="text-xs text-slate-400 hover:text-rose-600 px-1.5 py-0.5 rounded transition-colors">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-500 mb-0.5">Regular FIRE</p>
          <p className="text-base font-bold text-indigo-700">{formatCurrency(result.regularFire.target, true)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-500 mb-0.5">Years Away</p>
          <p className={`text-base font-bold ${yearsDelta > 2 ? 'text-rose-700' : yearsDelta < -2 ? 'text-emerald-700' : 'text-slate-700'}`}>
            {result.regularFire.yearsToFire === Infinity ? '∞' : result.regularFire.yearsToFire.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-0.5">yr</span>
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-500 mb-0.5">vs Baseline</p>
          <p className={`text-base font-bold ${yearsDelta > 0 ? 'text-rose-600' : yearsDelta < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
            {yearsDelta === 0 ? '—' : `${yearsDelta > 0 ? '+' : ''}${yearsDelta.toFixed(1)}yr`}
          </p>
        </div>
      </div>

      <ProgressBar value={result.regularFire.progress} color="indigo" size="sm" />

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div>
          <span>Savings: </span>
          <span className={`font-semibold ${savingsDelta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(result.effectiveAnnualSavings, true)}
            {savingsDelta !== 0 && ` (${savingsDelta > 0 ? '+' : ''}${formatCurrency(savingsDelta, true)})`}
          </span>
        </div>
        <div>
          <span>Expenses: </span>
          <span className={`font-semibold ${expenseDelta > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {formatCurrency(result.effectiveAnnualExpenses, true)}
            {expenseDelta !== 0 && ` (+${formatCurrency(expenseDelta, true)})`}
          </span>
        </div>
      </div>
    </Card>
  )
}

export function Fire() {
  const { assumptions, updateAssumptions, fireResult, assets, income, totalAnnualIncome, scenarios, addScenario, updateScenario, deleteScenario } = useFinancial()
  const [scenarioModal, setScenarioModal] = useState<{ open: boolean; existing?: Scenario }>({ open: false })

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

      {/* What-If Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-700">What-If Scenarios</h2>
            <p className="text-xs text-slate-400 mt-0.5">Simulate income changes or extra expenses to compare FIRE timelines</p>
          </div>
          <Button variant="secondary" onClick={() => setScenarioModal({ open: true, existing: undefined })}>
            + Add Scenario
          </Button>
        </div>

        {scenarios.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-slate-400 text-sm mb-3">No scenarios yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a scenario to model situations like a partner layoff, career break, or major life expense — and instantly see how it shifts your FIRE timeline.
            </p>
            <button
              onClick={() => setScenarioModal({ open: true, existing: undefined })}
              className="mt-4 text-sm text-indigo-600 font-medium hover:underline"
            >
              Create your first scenario →
            </button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const result = computeScenarioFireResult(assets, income, assumptions, scenario)
                return (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    result={result}
                    baseResult={fireResult}
                    onEdit={() => setScenarioModal({ open: true, existing: scenario })}
                    onDelete={() => deleteScenario(scenario.id)}
                  />
                )
              })}
            </div>

            {/* Comparison table */}
            <Card className="mt-4 overflow-x-auto">
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-medium text-slate-500 py-2 pr-3 w-32">FIRE Target</th>
                    <th className="text-right text-xs font-medium text-slate-700 py-2 px-3 whitespace-nowrap">Baseline</th>
                    {scenarios.map((s) => (
                      <th key={s.id} className="text-right text-xs font-medium py-2 px-3 whitespace-nowrap" style={{ color: s.color }}>
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(['leanFire', 'regularFire', 'fatFire'] as const).map((key) => {
                    const labels = { leanFire: 'Lean FIRE', regularFire: 'Regular FIRE', fatFire: 'Fat FIRE' }
                    const baseYears = fireResult[key].yearsToFire
                    return (
                      <tr key={key} className="border-b border-slate-50">
                        <td className="py-2.5 pr-3 text-xs font-medium text-slate-600">{labels[key]}</td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {baseYears === Infinity ? '∞' : `${baseYears.toFixed(1)} yr`}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">{formatCurrency(fireResult[key].target, true)}</span>
                        </td>
                        {scenarios.map((s) => {
                          const result = computeScenarioFireResult(assets, income, assumptions, s)
                          const yrs = result[key].yearsToFire
                          const delta = yrs - baseYears
                          return (
                            <td key={s.id} className="py-2.5 px-3 text-right whitespace-nowrap">
                              <span className={`font-semibold ${delta > 2 ? 'text-rose-600' : delta < -2 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                {yrs === Infinity ? '∞' : `${yrs.toFixed(1)} yr`}
                              </span>
                              {delta !== 0 && baseYears !== Infinity && (
                                <span className={`text-xs ml-1.5 ${delta > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  ({delta > 0 ? '+' : ''}{delta.toFixed(1)})
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                  <tr className="border-b border-slate-50">
                    <td className="py-2.5 pr-3 text-xs font-medium text-slate-600">Annual Savings</td>
                    <td className="py-2.5 px-3 text-right text-sm font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(fireResult.effectiveAnnualSavings, true)}
                    </td>
                    {scenarios.map((s) => {
                      const result = computeScenarioFireResult(assets, income, assumptions, s)
                      return (
                        <td key={s.id} className={`py-2.5 px-3 text-right text-sm font-semibold whitespace-nowrap ${result.effectiveAnnualSavings < fireResult.effectiveAnnualSavings ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(result.effectiveAnnualSavings, true)}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>

      <ScenarioForm
        key={scenarioModal.existing?.id ?? 'new-scenario'}
        open={scenarioModal.open}
        onClose={() => setScenarioModal({ open: false, existing: undefined })}
        onSave={(data) => {
          if (scenarioModal.existing) {
            updateScenario(scenarioModal.existing.id, data)
          } else {
            addScenario(data)
          }
        }}
        income={income}
        existing={scenarioModal.existing}
      />
    </div>
  )
}
