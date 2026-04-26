import { useMemo } from 'react'
import type { Asset, IncomeSource, FireAssumptions, FireResult } from '@/types'
import { computeFireResult } from '@/lib/calculations'

export function useFireCalculations(assets: Asset[], income: IncomeSource[], assumptions: FireAssumptions): FireResult {
  return useMemo(() => computeFireResult(assets, income, assumptions), [assets, income, assumptions])
}
