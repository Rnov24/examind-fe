'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface PlatformHealth {
  /** Overall API status string from GET /health (e.g. "healthy"), null until loaded. */
  status: string | null
  /** Real DB roundtrip status reported by the backend: "online" | "error". */
  dbStatus: 'online' | 'error' | null
  /** Real measured DB latency in ms (server-side SELECT 1), null when unknown. */
  dbLatencyMs: number | null
  loading: boolean
  /** True once a /health response (any shape) has been received. */
  reachable: boolean
  reload: () => void
}

/**
 * Fetches the backend health endpoint through the Next rewrite
 * (/api/health -> backend /health). The response carries a real,
 * server-measured database status + latency — no client-side guesses.
 */
export function usePlatformHealth(): PlatformHealth {
  const [status, setStatus] = useState<string | null>(null)
  const [dbStatus, setDbStatus] = useState<'online' | 'error' | null>(null)
  const [dbLatencyMs, setDbLatencyMs] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [reachable, setReachable] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reload = useCallback(() => setReloadCount((c) => c + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/health', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`health ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (cancelled || !mountedRef.current) return
        setReachable(true)
        setStatus(typeof json?.status === 'string' ? json.status : null)
        setDbStatus(json?.db_status === 'online' ? 'online' : 'error')
        setDbLatencyMs(
          typeof json?.db_latency_ms === 'number' ? json.db_latency_ms : null
        )
      })
      .catch(() => {
        if (cancelled || !mountedRef.current) return
        setReachable(false)
        setStatus(null)
        setDbStatus(null)
        setDbLatencyMs(null)
      })
      .finally(() => {
        if (!cancelled && mountedRef.current) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadCount])

  return { status, dbStatus, dbLatencyMs, loading, reachable, reload }
}

export default usePlatformHealth
