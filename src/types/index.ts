export type AssetCategory = 'real_estate' | 'investments' | 'retirement' | 'cash_alternatives'
export type LiabilityCategory = 'mortgage' | 'car_loan' | 'student_loan' | 'credit_card' | 'other'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  subcategory?: string
  value: number
  isLiquid: boolean
  lastUpdated: string
  notes?: string
}

export interface Liability {
  id: string
  name: string
  category: LiabilityCategory
  balance: number
  interestRate?: number
  monthlyPayment?: number
  lastUpdated: string
}

export interface FireAssumptions {
  currentAge: number
  partnerAge?: number
  targetRetirementAge: number
  annualExpenses: number
  fatFireMultiplier: number
  leanFireMultiplier: number
  expectedReturnRate: number
  inflationRate: number
  annualSavings: number
  includeRealEstateInFire: boolean
  plannedChildren: number
  childAnnualCost: number
  yearsUntilFirstChild: number
}

export interface NetWorthSnapshot {
  date: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

export interface FireVariantResult {
  target: number
  yearsToFire: number
  progress: number
  gap: number
}

export interface CoastFireResult {
  coastNumber: number
  isCoasting: boolean
  yearsToCoast: number
}

export interface ProjectionPoint {
  year: number
  age: number
  portfolio: number
  leanTarget: number
  regularTarget: number
  fatTarget: number
}

export interface FireResult {
  investableNetWorth: number
  effectiveAnnualExpenses: number
  leanFire: FireVariantResult
  regularFire: FireVariantResult
  fatFire: FireVariantResult
  coastFire: CoastFireResult
  projectionData: ProjectionPoint[]
}
