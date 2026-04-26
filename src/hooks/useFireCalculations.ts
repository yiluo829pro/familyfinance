import { useMemo } from 'react'
import type { Asset, FireAssumptions, FireResult } from '@/types'
import { computeFireResult } from '@/lib/calculations'

export function useFireCalculations(assets: Asset[], assumptions: FireAssumptions): FireResult {
  return useMemo(() => computeFireResult(assets, assumptions), [assets, assumptions])
}
