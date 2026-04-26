import { STORAGE_KEYS, SCHEMA_VERSION } from '@/constants'

export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage quota exceeded — silently fail
  }
}

export function checkAndMigrateSchema(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)
  if (stored !== SCHEMA_VERSION) {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION)
    return true
  }
  return false
}
