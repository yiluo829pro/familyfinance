import type { Asset, Liability, FireAssumptions, NetWorthSnapshot } from '@/types'

export const STORAGE_KEYS = {
  ASSETS: 'ff_assets',
  LIABILITIES: 'ff_liabilities',
  ASSUMPTIONS: 'ff_assumptions',
  SNAPSHOTS: 'ff_snapshots',
  SCHEMA_VERSION: 'ff_schema_version',
} as const

export const SCHEMA_VERSION = '1'

export const CATEGORY_COLORS: Record<string, string> = {
  real_estate: '#6366f1',
  investments: '#10b981',
  retirement: '#f59e0b',
  cash_alternatives: '#3b82f6',
}

export const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  investments: 'Investments',
  retirement: 'Retirement',
  cash_alternatives: 'Cash & Alternatives',
}

export const LIABILITY_LABELS: Record<string, string> = {
  mortgage: 'Mortgage',
  car_loan: 'Car Loan',
  student_loan: 'Student Loan',
  credit_card: 'Credit Card',
  other: 'Other',
}

export const FIRE_DEFAULTS: FireAssumptions = {
  currentAge: 35,
  partnerAge: 33,
  targetRetirementAge: 55,
  annualExpenses: 80000,
  fatFireMultiplier: 1.5,
  leanFireMultiplier: 0.7,
  expectedReturnRate: 0.07,
  inflationRate: 0.03,
  annualSavings: 36000,
  includeRealEstateInFire: false,
  plannedChildren: 1,
  childAnnualCost: 15000,
  yearsUntilFirstChild: 2,
}

export const DEMO_ASSETS: Asset[] = [
  {
    id: 'demo-1',
    name: 'Primary Home',
    category: 'real_estate',
    value: 650000,
    isLiquid: false,
    lastUpdated: new Date().toISOString().slice(0, 10),
    notes: 'Purchased 2020',
  },
  {
    id: 'demo-2',
    name: '401(k) — Vanguard',
    category: 'retirement',
    value: 180000,
    isLiquid: false,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'demo-3',
    name: 'Roth IRA',
    category: 'retirement',
    value: 55000,
    isLiquid: false,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'demo-4',
    name: 'Fidelity Brokerage',
    category: 'investments',
    value: 95000,
    isLiquid: true,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'demo-5',
    name: 'Emergency Fund (HYSA)',
    category: 'cash_alternatives',
    value: 30000,
    isLiquid: true,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'demo-6',
    name: 'Checking & Savings',
    category: 'cash_alternatives',
    value: 15000,
    isLiquid: true,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
]

export const DEMO_LIABILITIES: Liability[] = [
  {
    id: 'demo-l1',
    name: 'Mortgage — Primary Home',
    category: 'mortgage',
    balance: 420000,
    interestRate: 3.75,
    monthlyPayment: 2100,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'demo-l2',
    name: 'Car Loan',
    category: 'car_loan',
    balance: 18000,
    interestRate: 5.9,
    monthlyPayment: 420,
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
]

function buildDemoSnapshots(): NetWorthSnapshot[] {
  const snapshots: NetWorthSnapshot[] = []
  const today = new Date()
  const baseNetWorth = 487000
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const growth = (11 - i) * 2800 + Math.round(Math.random() * 1000 - 500)
    const nw = baseNetWorth + growth
    snapshots.push({
      date: d.toISOString().slice(0, 10),
      totalAssets: nw + 438000,
      totalLiabilities: 438000,
      netWorth: nw,
    })
  }
  return snapshots
}

export const DEMO_SNAPSHOTS: NetWorthSnapshot[] = buildDemoSnapshots()
