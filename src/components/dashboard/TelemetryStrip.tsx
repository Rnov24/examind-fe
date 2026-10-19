'use client'

import React from 'react'
import { Database, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

interface TelemetryStripProps {
  onRefresh?: () => void
  isRefreshing?: boolean
  dbStatus?: string
  aiModel?: string
  proctoringStatus?: string
  latency?: string
  className?: string
}

export function TelemetryStrip({
  onRefresh,
  isRefreshing = false,
  dbStatus = 'TiDB Online',
  aiModel = 'Gemini 2.5 Flash',
  proctoringStatus = 'Siap',
  latency = '~24ms',
  className = '',
}: TelemetryStripProps) {
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
          className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"
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
              tokens.semantic.emerald.badge,
              tokens.shadow.micro
            )}
          >
            <Database className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            {dbStatus}
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
            {aiModel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Proctoring Dual-Cam:</span>
          <span
            className={cn(
              'font-bold px-2 py-0.5',
              tokens.radius.sm,
              tokens.semantic.emerald.badge,
              tokens.shadow.micro
            )}
          >
            {proctoringStatus}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Latensi:</span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200',
              tokens.radius.sm,
              tokens.shadow.micro
            )}
          >
            {latency}
          </span>
        </div>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Perbarui telemetri platform"
          aria-label="Perbarui data"
          className={cn(
            'text-xs font-mono font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50',
            tokens.radius.full
          )}
        >
          <RefreshCw
            className={`w-3 h-3 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{isRefreshing ? 'Memuat...' : 'Perbarui'}</span>
        </button>
      )}
    </div>
  )
}

export default TelemetryStrip
