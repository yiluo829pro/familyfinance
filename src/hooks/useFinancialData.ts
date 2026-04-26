import { useState, useCallback } from 'react'
import type { Asset, Liability, FireAssumptions, NetWorthSnapshot } from '@/types'
import { getFromStorage, setToStorage } from '@/lib/storage'
import { generateId, today } from '@/lib/utils'
import { STORAGE_KEYS, FIRE_DEFAULTS } from '@/constants'

function saveSnapshot(assets: Asset[], liabilities: Liability[], snapshots: NetWorthSnapshot[]): NetWorthSnapshot[] {
  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0)
  const netWorth = totalAssets - totalLiabilities
  const date = today()
  const updated = snapshots.filter((s) => s.date !== date)
  const newSnapshot: NetWorthSnapshot = { date, totalAssets, totalLiabilities, netWorth }
  const sorted = [...updated, newSnapshot].sort((a, b) => a.date.localeCompare(b.date))
  setToStorage(STORAGE_KEYS.SNAPSHOTS, sorted)
  return sorted
}

export function useFinancialData() {
  const [assets, setAssets] = useState<Asset[]>(() =>
    getFromStorage<Asset[]>(STORAGE_KEYS.ASSETS, []),
  )
  const [liabilities, setLiabilities] = useState<Liability[]>(() =>
    getFromStorage<Liability[]>(STORAGE_KEYS.LIABILITIES, []),
  )
  const [assumptions, setAssumptions] = useState<FireAssumptions>(() =>
    getFromStorage<FireAssumptions>(STORAGE_KEYS.ASSUMPTIONS, FIRE_DEFAULTS),
  )
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>(() =>
    getFromStorage<NetWorthSnapshot[]>(STORAGE_KEYS.SNAPSHOTS, []),
  )

  const addAsset = useCallback((data: Omit<Asset, 'id' | 'lastUpdated'>) => {
    setAssets((prev) => {
      const next = [...prev, { ...data, id: generateId(), lastUpdated: today() }]
      setToStorage(STORAGE_KEYS.ASSETS, next)
      setSnapshots(saveSnapshot(next, liabilities, snapshots))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liabilities, snapshots])

  const updateAsset = useCallback((id: string, data: Partial<Omit<Asset, 'id'>>) => {
    setAssets((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...data, lastUpdated: today() } : a))
      setToStorage(STORAGE_KEYS.ASSETS, next)
      setSnapshots(saveSnapshot(next, liabilities, snapshots))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liabilities, snapshots])

  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => {
      const next = prev.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.ASSETS, next)
      setSnapshots(saveSnapshot(next, liabilities, snapshots))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liabilities, snapshots])

  const addLiability = useCallback((data: Omit<Liability, 'id' | 'lastUpdated'>) => {
    setLiabilities((prev) => {
      const next = [...prev, { ...data, id: generateId(), lastUpdated: today() }]
      setToStorage(STORAGE_KEYS.LIABILITIES, next)
      setSnapshots(saveSnapshot(assets, next, snapshots))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, snapshots])

  const updateLiability = useCallback((id: string, data: Partial<Omit<Liability, 'id'>>) => {
    setLiabilities((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...data, lastUpdated: today() } : l))
      setToStorage(STORAGE_KEYS.LIABILITIES, next)
      setSnapshots(saveSnapshot(assets, next, snapshots))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, snapshots])

  const deleteLiability = useCallback((id: string) => {
    setLiabilities((prev) => {
      const next = prev.filter((l) => l.id !== id)
      setToStorage(STORAGE_KEYS.LIABILITIES, next)
      setSnapshots(saveSnapshot(assets, next, snapshots))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, snapshots])

  const updateAssumptions = useCallback((data: Partial<FireAssumptions>) => {
    setAssumptions((prev) => {
      const next = { ...prev, ...data }
      setToStorage(STORAGE_KEYS.ASSUMPTIONS, next)
      return next
    })
  }, [])

  const loadDemoData = useCallback(
    (demoAssets: Asset[], demoLiabilities: Liability[], demoSnapshots: NetWorthSnapshot[]) => {
      setAssets(demoAssets)
      setLiabilities(demoLiabilities)
      setSnapshots(demoSnapshots)
      setToStorage(STORAGE_KEYS.ASSETS, demoAssets)
      setToStorage(STORAGE_KEYS.LIABILITIES, demoLiabilities)
      setToStorage(STORAGE_KEYS.SNAPSHOTS, demoSnapshots)
    },
    [],
  )

  const clearAllData = useCallback(() => {
    setAssets([])
    setLiabilities([])
    setSnapshots([])
    setAssumptions(FIRE_DEFAULTS)
    setToStorage(STORAGE_KEYS.ASSETS, [])
    setToStorage(STORAGE_KEYS.LIABILITIES, [])
    setToStorage(STORAGE_KEYS.SNAPSHOTS, [])
    setToStorage(STORAGE_KEYS.ASSUMPTIONS, FIRE_DEFAULTS)
  }, [])

  return {
    assets,
    liabilities,
    assumptions,
    snapshots,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
    updateAssumptions,
    loadDemoData,
    clearAllData,
  }
}
