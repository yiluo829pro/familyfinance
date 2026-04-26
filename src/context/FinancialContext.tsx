import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { Asset, Liability, IncomeSource, FireAssumptions, NetWorthSnapshot, FireResult } from '@/types'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useFireCalculations } from '@/hooks/useFireCalculations'
import { computeTotalAnnualIncome } from '@/lib/calculations'
import { checkAndMigrateSchema } from '@/lib/storage'

interface FinancialContextValue {
  assets: Asset[]
  liabilities: Liability[]
  income: IncomeSource[]
  assumptions: FireAssumptions
  snapshots: NetWorthSnapshot[]
  fireResult: FireResult
  totalAssets: number
  totalLiabilities: number
  totalAnnualIncome: number
  netWorth: number
  addAsset: (data: Omit<Asset, 'id' | 'lastUpdated'>) => void
  updateAsset: (id: string, data: Partial<Omit<Asset, 'id'>>) => void
  deleteAsset: (id: string) => void
  addLiability: (data: Omit<Liability, 'id' | 'lastUpdated'>) => void
  updateLiability: (id: string, data: Partial<Omit<Liability, 'id'>>) => void
  deleteLiability: (id: string) => void
  addIncome: (data: Omit<IncomeSource, 'id' | 'lastUpdated'>) => void
  updateIncome: (id: string, data: Partial<Omit<IncomeSource, 'id'>>) => void
  deleteIncome: (id: string) => void
  updateAssumptions: (data: Partial<FireAssumptions>) => void
  loadDemoData: (assets: Asset[], liabilities: Liability[], snapshots: NetWorthSnapshot[], income: IncomeSource[]) => void
  clearAllData: () => void
}

const FinancialContext = createContext<FinancialContextValue | null>(null)

export function FinancialProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    checkAndMigrateSchema()
  }, [])

  const data = useFinancialData()
  const fireResult = useFireCalculations(data.assets, data.income, data.assumptions)

  const totalAssets = data.assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = data.liabilities.reduce((s, l) => s + l.balance, 0)
  const totalAnnualIncome = computeTotalAnnualIncome(data.income)
  const netWorth = totalAssets - totalLiabilities

  return (
    <FinancialContext.Provider
      value={{ ...data, fireResult, totalAssets, totalLiabilities, totalAnnualIncome, netWorth }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial(): FinancialContextValue {
  const ctx = useContext(FinancialContext)
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider')
  return ctx
}
