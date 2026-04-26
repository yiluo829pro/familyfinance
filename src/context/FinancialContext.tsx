import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { Asset, Liability, FireAssumptions, NetWorthSnapshot, FireResult } from '@/types'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useFireCalculations } from '@/hooks/useFireCalculations'
import { checkAndMigrateSchema } from '@/lib/storage'

interface FinancialContextValue {
  assets: Asset[]
  liabilities: Liability[]
  assumptions: FireAssumptions
  snapshots: NetWorthSnapshot[]
  fireResult: FireResult
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  addAsset: (data: Omit<Asset, 'id' | 'lastUpdated'>) => void
  updateAsset: (id: string, data: Partial<Omit<Asset, 'id'>>) => void
  deleteAsset: (id: string) => void
  addLiability: (data: Omit<Liability, 'id' | 'lastUpdated'>) => void
  updateLiability: (id: string, data: Partial<Omit<Liability, 'id'>>) => void
  deleteLiability: (id: string) => void
  updateAssumptions: (data: Partial<FireAssumptions>) => void
  loadDemoData: (assets: Asset[], liabilities: Liability[], snapshots: NetWorthSnapshot[]) => void
  clearAllData: () => void
}

const FinancialContext = createContext<FinancialContextValue | null>(null)

export function FinancialProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    checkAndMigrateSchema()
  }, [])

  const data = useFinancialData()
  const fireResult = useFireCalculations(data.assets, data.assumptions)

  const totalAssets = data.assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = data.liabilities.reduce((s, l) => s + l.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <FinancialContext.Provider
      value={{ ...data, fireResult, totalAssets, totalLiabilities, netWorth }}
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
