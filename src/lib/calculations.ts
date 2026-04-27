import type { Asset, IncomeSource, FireAssumptions, FireResult, ProjectionPoint, Scenario } from '@/types'

function realReturnRate(nominalReturn: number, inflation: number): number {
  return (1 + nominalReturn) / (1 + inflation) - 1
}

function yearsToTarget(P: number, PMT: number, r: number, FV: number): number {
  if (P >= FV) return 0
  if (r === 0) {
    if (PMT <= 0) return Infinity
    return Math.max(0, (FV - P) / PMT)
  }
  let lo = 0
  let hi = 80
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const fvMid = P * Math.pow(1 + r, mid) + PMT * ((Math.pow(1 + r, mid) - 1) / r)
    if (fvMid < FV) lo = mid
    else hi = mid
  }
  return Math.round(hi * 10) / 10
}

function futureValue(P: number, PMT: number, r: number, n: number): number {
  if (r === 0) return P + PMT * n
  return P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r)
}

export function annualizeIncome(source: IncomeSource): number {
  return source.frequency === 'monthly' ? source.amount * 12 : source.amount
}

export function computeTotalAnnualIncome(income: IncomeSource[]): number {
  return income.filter((i) => i.isActive).reduce((sum, i) => sum + annualizeIncome(i), 0)
}

export function computeInvestableNetWorth(assets: Asset[], assumptions: FireAssumptions): number {
  return assets
    .filter((a) => a.isLiquid || (assumptions.includeRealEstateInFire && a.category === 'real_estate'))
    .reduce((sum, a) => sum + a.value, 0)
}

export function computeEffectiveAnnualExpenses(assumptions: FireAssumptions): number {
  return assumptions.annualExpenses + assumptions.plannedChildren * assumptions.childAnnualCost
}

export function computeEffectiveSavings(
  income: IncomeSource[],
  assumptions: FireAssumptions,
  effectiveExpenses: number,
): { savings: number; savingsRate: number } {
  const totalIncome = computeTotalAnnualIncome(income)
  if (assumptions.useIncomeDerivedSavings && totalIncome > 0) {
    const savings = Math.max(totalIncome - effectiveExpenses, 0)
    return { savings, savingsRate: totalIncome > 0 ? savings / totalIncome : 0 }
  }
  const savingsRate = totalIncome > 0 ? assumptions.annualSavings / totalIncome : 0
  return { savings: assumptions.annualSavings, savingsRate }
}

export function computeScenarioFireResult(
  assets: Asset[],
  income: IncomeSource[],
  assumptions: FireAssumptions,
  scenario: Scenario,
): FireResult {
  const scenarioIncome = income.map((src) => {
    const adj = scenario.incomeAdjustments.find((a) => a.sourceId === src.id)
    return { ...src, isActive: adj !== undefined ? adj.active : src.isActive }
  })
  const scenarioAssumptions: FireAssumptions = {
    ...assumptions,
    annualExpenses: assumptions.annualExpenses + scenario.additionalAnnualExpense,
  }
  return computeFireResult(assets, scenarioIncome, scenarioAssumptions)
}

export function computeFireResult(
  assets: Asset[],
  income: IncomeSource[],
  assumptions: FireAssumptions,
): FireResult {
  const r = realReturnRate(assumptions.expectedReturnRate, assumptions.inflationRate)
  const P = computeInvestableNetWorth(assets, assumptions)
  const effectiveExpenses = computeEffectiveAnnualExpenses(assumptions)
  const { savings: PMT, savingsRate } = computeEffectiveSavings(income, assumptions, effectiveExpenses)

  const leanTarget = effectiveExpenses * assumptions.leanFireMultiplier * 25
  const regularTarget = effectiveExpenses * 25
  const fatTarget = effectiveExpenses * assumptions.fatFireMultiplier * 25

  const yearsToRetirement = assumptions.targetRetirementAge - assumptions.currentAge
  const coastNumber = regularTarget / Math.pow(1 + r, Math.max(yearsToRetirement, 1))
  const isCoasting = P >= coastNumber
  const yearsToCoastFire = isCoasting ? 0 : yearsToTarget(P, PMT, r, coastNumber)

  const leanYears = yearsToTarget(P, PMT, r, leanTarget)
  const regularYears = yearsToTarget(P, PMT, r, regularTarget)
  const fatYears = yearsToTarget(P, PMT, r, fatTarget)

  const projectionLen = Math.max(Math.ceil(fatYears) + 5, yearsToRetirement + 5, 30)
  const projectionData: ProjectionPoint[] = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i <= projectionLen; i++) {
    projectionData.push({
      year: currentYear + i,
      age: assumptions.currentAge + i,
      portfolio: Math.round(futureValue(P, PMT, r, i)),
      leanTarget: Math.round(leanTarget),
      regularTarget: Math.round(regularTarget),
      fatTarget: Math.round(fatTarget),
    })
  }

  return {
    investableNetWorth: P,
    effectiveAnnualExpenses: effectiveExpenses,
    effectiveAnnualSavings: PMT,
    savingsRate,
    leanFire: {
      target: leanTarget,
      yearsToFire: leanYears,
      progress: Math.min(P / leanTarget, 1),
      gap: Math.max(leanTarget - P, 0),
    },
    regularFire: {
      target: regularTarget,
      yearsToFire: regularYears,
      progress: Math.min(P / regularTarget, 1),
      gap: Math.max(regularTarget - P, 0),
    },
    fatFire: {
      target: fatTarget,
      yearsToFire: fatYears,
      progress: Math.min(P / fatTarget, 1),
      gap: Math.max(fatTarget - P, 0),
    },
    coastFire: {
      coastNumber,
      isCoasting,
      yearsToCoast: yearsToCoastFire,
    },
    projectionData,
  }
}
