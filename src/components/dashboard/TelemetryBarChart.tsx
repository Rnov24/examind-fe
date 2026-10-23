'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import api from '@/lib/api'

export interface TelemetryBarPoint {
  day: string
  /** Sessions started that day (real count from /superadmin/telemetry). */
  load: number
  /** Sessions submitted that day (real count from /superadmin/telemetry). */
  ai: number
}

interface TelemetryBarChartProps {
  data?: TelemetryBarPoint[]
  title?: string
  subtitle?: string
  serverLabel?: string
  aiLabel?: string
  className?: string
}

type FetchState = 'loading' | 'ready' | 'error'

function toDayLabel(isoDate: string): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  // Short Indonesian weekday, e.g. "Sen", "Sel", "Rab"
  return d.toLocaleDateString('id-ID', { weekday: 'short' }).replace('.', '')
}

export function TelemetryBarChart({
  data: dataProp,
  title = 'Aktivitas Sesi Ujian',
  subtitle = '7 Hari Terakhir',
  serverLabel = 'Sesi Dimulai',
  aiLabel = 'Sesi Selesai',
  className = '',
}: TelemetryBarChartProps) {
  const [fetched, setFetched] = useState<TelemetryBarPoint[] | null>(null)
  const [state, setState] = useState<FetchState>(dataProp ? 'ready' : 'loading')

  useEffect(() => {
    if (dataProp) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/superadmin/telemetry')
        const series = res.data?.data?.series
        if (!Array.isArray(series)) throw new Error('bad shape')
        if (cancelled) return
        setFetched(
          series.map((p: any) => ({
            day: toDayLabel(p.date),
            load: Number(p.sessions_started) || 0,
            ai: Number(p.sessions_submitted) || 0,
          }))
        )
        setState('ready')
      } catch {
        if (!cancelled) setState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dataProp])

  const data = dataProp || fetched || []
  const maxValue = Math.max(1, ...data.map((d) => Math.max(d.load, d.ai)))
  const totalSessions = data.reduce((sum, d) => sum + d.load + d.ai, 0)

  return (
    <div
      className={cn(
        'p-3.5 bg-slate-50/70 border border-slate-100 space-y-2.5',
        tokens.radius.lg,
        className
      )}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-900 font-sans">{title}</span>
        <span className="font-mono text-slate-500 text-[10px] font-medium">{subtitle}</span>
      </div>

      {state === 'loading' ? (
        <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1" aria-label="Memuat data telemetri">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full max-w-[18px] bg-slate-200 animate-pulse rounded-sm"
                style={{ height: `${30 + ((i * 13) % 50)}%` }}
              />
              <span className="w-4 h-2 bg-slate-200 animate-pulse rounded-sm" />
            </div>
          ))}
        </div>
      ) : state === 'error' ? (
        <div className="h-32 flex items-center justify-center px-2">
          <p className="text-[11px] text-slate-500 font-medium text-center">
            Data belum bisa dimuat
          </p>
        </div>
      ) : totalSessions === 0 ? (
        <div className="h-32 flex items-center justify-center px-2">
          <p className="text-[11px] text-slate-500 font-medium text-center">
            Belum ada sesi ujian dalam 7 hari terakhir
          </p>
        </div>
      ) : (
        <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
          {data.map((item, idx) => (
            <div
              key={`${item.day}-${idx}`}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
            >
              <div className="w-full max-w-[18px] flex flex-col items-center gap-0.5 justify-end h-full">
                {/* Sessions submitted segment (violet = platform activity) */}
                <div
                  className="w-full rounded-t-sm transition-all group-hover:scale-y-105 bg-[#6a5fc1]"
                  style={{ height: `${(item.ai / maxValue) * 45}%` }}
                  title={`${aiLabel}: ${item.ai} sesi`}
                />
                {/* Sessions started bar (midnight violet) */}
                <div
                  className="w-full bg-[#150f23] rounded-b-sm transition-all group-hover:bg-slate-800"
                  style={{ height: `${(item.load / maxValue) * 55}%` }}
                  title={`${serverLabel}: ${item.load} sesi`}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-500 font-medium group-hover:text-slate-900 group-hover:font-bold transition-colors">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-semibold pt-1 text-slate-700 font-mono">
        <span className="flex items-center gap-1.5">
          <span className={cn('w-2.5 h-2.5 bg-[#150f23]', tokens.radius.xs, tokens.shadow.micro)} />
          {serverLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('w-2.5 h-2.5 bg-[#6a5fc1]', tokens.radius.xs, tokens.shadow.micro)} />
          {aiLabel}
        </span>
      </div>
    </div>
  )
}

export default TelemetryBarChart
