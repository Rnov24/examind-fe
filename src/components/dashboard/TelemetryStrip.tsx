'use client'

import React from 'react'
import { Database, Sparkles, RefreshCw } from 'lucide-react'

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
      className={`bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"
          aria-hidden="true"
        />
        <span className="font-display font-bold text-slate-900">
          Telemetri Platform EXAMIND
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Database:</span>
          <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/80 flex items-center gap-1 shadow-2xs">
            <Database className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            {dbStatus}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Layanan AI:</span>
          <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200/80 flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-indigo-600" aria-hidden="true" />
            {aiModel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Proctoring Dual-Cam:</span>
          <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            {proctoringStatus}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans">Latensi:</span>
          <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
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
          className="text-xs font-mono font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
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
