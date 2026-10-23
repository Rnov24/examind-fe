'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Database, Sparkles, RefreshCw, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import api from '@/lib/api'
import { usePlatformHealth } from '@/lib/usePlatformHealth'

interface TelemetryStripProps {
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

interface SessionsToday {
  started: number
  submitted: number
}

export function TelemetryStrip({
  onRefresh,
  isRefreshing = false,
  className = '',
}: TelemetryStripProps) {
  const health = usePlatformHealth()
  const [aiModel, setAiModel] = useState<string | null>(null)
  const [aiState, setAiState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [sessions, setSessions] = useState<SessionsToday | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  const loadDerived = useCallback(async () => {
    // AI model actually configured for the chatbot task (superadmin config).
    try {
      const res = await api.get('/superadmin/secrets/tasks')
      const tasks = res.data?.data
      if (Array.isArray(tasks)) {
        const chatbot =
          tasks.find((t: any) => t.task_id === 'TASK_CHATBOT') ||
          tasks.find((t: any) => t.is_active) ||
          tasks[0]
        setAiModel(chatbot?.model || null)
        setAiState(chatbot?.model ? 'ready' : 'error')
      } else {
        setAiState('error')
      }
    } catch {
      setAiState('error')
    }

    // Real exam-session counts for today (last point of the 7-day series).
    try {
      const res = await api.get('/superadmin/telemetry')
      const series = res.data?.data?.series
      if (Array.isArray(series) && series.length > 0) {
        const today = series[series.length - 1]
        setSessions({
          started: Number(today.sessions_started) || 0,
          submitted: Number(today.sessions_submitted) || 0,
        })
      } else {
        setSessions(null)
      }
    } catch {
      setSessions(null)
    }
  }, [])

  useEffect(() => {
    loadDerived()
  }, [loadDerived, reloadCount])

  const handleRefresh = () => {
    health.reload()
    setReloadCount((c) => c + 1)
    onRefresh?.()
  }

  const dbBadge = (() => {
    if (health.loading) {
      return { text: 'Memeriksa…', classes: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' }
    }
    if (!health.reachable) {
      return { text: 'Tidak terjangkau', classes: tokens.semantic.rose.badge, dot: 'bg-rose-500' }
    }
    if (health.dbStatus === 'online') {
      return { text: 'Online', classes: tokens.semantic.emerald.badge, dot: 'bg-emerald-500' }
    }
    return { text: 'Bermasalah', classes: tokens.semantic.rose.badge, dot: 'bg-rose-500' }
  })()

  return (
    <div
      className={cn(
        tokens.surface.card,
        tokens.radius.xl,
        tokens.border.default,
        'px-5 py-3',
        tokens.shadow.card,
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn('w-2.5 h-2.5 rounded-full ring-4 animate-pulse', dbBadge.dot, health.dbStatus === 'online' ? 'ring-emerald-100' : 'ring-slate-100')}
          aria-hidden="true"
        />
        <span className={cn(tokens.typography.subheading, 'text-slate-900')}>
          Telemetri Platform EXAMIND
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Database:</span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 flex items-center gap-1',
              tokens.radius.sm,
              dbBadge.classes,
              tokens.shadow.micro
            )}
          >
            <Database className="w-3 h-3" aria-hidden="true" />
            {dbBadge.text}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Layanan AI:</span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 flex items-center gap-1',
              tokens.radius.sm,
              tokens.semantic.violet.badge,
              tokens.shadow.micro
            )}
          >
            <Sparkles className="w-3 h-3 text-[#6a5fc1]" aria-hidden="true" />
            {aiState === 'loading' ? 'Memuat…' : aiModel || 'Tidak tersedia'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Sesi Ujian Hari Ini:</span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 flex items-center gap-1',
              tokens.radius.sm,
              tokens.semantic.emerald.badge,
              tokens.shadow.micro
            )}
          >
            <MonitorPlay className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            {sessions ? `${sessions.started} dimulai • ${sessions.submitted} selesai` : '—'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Latensi DB:</span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200',
              tokens.radius.sm,
              tokens.shadow.micro
            )}
          >
            {health.dbLatencyMs != null ? `${health.dbLatencyMs} ms` : '—'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        title="Perbarui telemetri platform"
        aria-label="Perbarui data"
        className={cn(
          'text-xs font-mono font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50',
          tokens.radius.full
        )}
      >
        <RefreshCw
          className={`w-3 h-3 text-slate-400 ${isRefreshing || health.loading ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <span>{isRefreshing ? 'Memuat...' : 'Perbarui'}</span>
      </button>
    </div>
  )
}

export default TelemetryStrip
