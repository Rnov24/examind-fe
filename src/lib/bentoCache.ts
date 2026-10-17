'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type BentoBlockStatus = 'idle' | 'loading' | 'ready' | 'error'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// In-memory module-level cache for SWR-lite pattern (zero external deps)
const memoryCache = new Map<string, CacheEntry<any>>()

/**
 * Retrieve cached data by key if present.
 * Returns null if not found.
 */
export function getBentoCache<T>(key: string, ttlMs = 60000): { data: T; isFresh: boolean } | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  const isFresh = Date.now() - entry.timestamp < ttlMs
  return { data: entry.data as T, isFresh }
}

/**
 * Store data in the memory cache.
 */
export function setBentoCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() })
}

/**
 * Invalidate cache entries by key or prefix.
 */
export function invalidateBentoCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear()
    return
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k)
    }
  }
}

export interface UseBentoBlockOptions<T> {
  key: string
  fetcher: () => Promise<T>
  ttlMs?: number // Default 60,000 ms (1 minute)
  enabled?: boolean
  initialData?: T | null
}

export interface UseBentoBlockReturn<T> {
  data: T | null
  setData: React.Dispatch<React.SetStateAction<T | null>>
  status: BentoBlockStatus
  error: string | null
  isRefreshing: boolean
  retry: () => Promise<void>
  reload: (isManual?: boolean) => Promise<void>
}

/**
 * Hook for independent Bento Block data loading with SWR-lite caching.
 * - If cached: renders immediately ('ready') and refreshes in background if stale.
 * - If not cached: starts in 'loading' state, fetches in parallel, transitions to 'ready' or 'error'.
 * - Provides retry() for inline recovery.
 */
export function useBentoBlock<T>({
  key,
  fetcher,
  ttlMs = 60000,
  enabled = true,
  initialData = null,
}: UseBentoBlockOptions<T>): UseBentoBlockReturn<T> {
  // Synchronous cache lookup on initial render for instant display
  const cached = typeof window !== 'undefined' ? getBentoCache<T>(key, ttlMs) : null

  const [data, setData] = useState<T | null>(cached ? cached.data : initialData)
  const [status, setStatus] = useState<BentoBlockStatus>(
    cached ? 'ready' : enabled ? 'loading' : 'idle'
  )
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const execute = useCallback(
    async (isManualRetry = false) => {
      if (!enabled) return

      const currentCached = getBentoCache<T>(key, ttlMs)

      if (!currentCached?.data || isManualRetry) {
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      try {
        const result = await fetcherRef.current()
        setData(result)
        setBentoCache(key, result)
        setStatus('ready')
        setError(null)
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Gagal memuat data blok ini. Silakan coba lagi.'
        if (!currentCached?.data) {
          setStatus('error')
          setError(message)
        } else {
          console.warn(`[useBentoBlock] Background refresh failed for ${key}:`, err)
        }
      } finally {
        setIsRefreshing(false)
      }
    },
    [enabled, key, ttlMs]
  )

  useEffect(() => {
    if (!enabled) return
    const currentCached = getBentoCache<T>(key, ttlMs)
    if (!currentCached || !currentCached.isFresh) {
      execute()
    }
  }, [key, enabled, ttlMs, execute])

  const retry = useCallback(async () => {
    await execute(true)
  }, [execute])

  return {
    data,
    setData,
    status,
    error,
    isRefreshing,
    retry,
    reload: execute,
  }
}
