'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

export interface TelemetryBarPoint {
  day: string
  load: number
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

const DEFAULT_DATA: TelemetryBarPoint[] = [
  { day: 'Sen', load: 60, ai: 45 },
  { day: 'Sel', load: 85, ai: 70 },
  { day: 'Rab', load: 75, ai: 60 },
  { day: 'Kam', load: 95, ai: 85 },
  { day: 'Jum', load: 80, ai: 65 },
  { day: 'Sab', load: 40, ai: 30 },
  { day: 'Min', load: 30, ai: 20 },
]

export function TelemetryBarChart({
  data = DEFAULT_DATA,
  title = 'Trafik Server CBT',
  subtitle = '7 Hari Terakhir',
  serverLabel = 'Server CBT',
  aiLabel = 'AI Grading',
  className = '',
}: TelemetryBarChartProps) {
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

      {/* Dual Bar Graphic - High contrast daylight styling */}
      <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
          >
            <div className="w-full max-w-[18px] flex flex-col items-center gap-0.5 justify-end h-full">
              {/* Top lime AI highlight cap */}
              <div
                className={cn('w-full rounded-t-sm transition-all group-hover:scale-y-105', tokens.semantic.lime.badge, tokens.shadow.micro)}
                style={{ height: `${item.ai * 0.35}%` }}
                title={`${aiLabel}: ${item.ai}%`}
              />
              {/* Bottom midnight violet server bar */}
              <div
                className="w-full bg-[#150f23] rounded-b-sm transition-all group-hover:bg-slate-800"
                style={{ height: `${item.load * 0.55}%` }}
                title={`${serverLabel}: ${item.load}%`}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-500 font-medium group-hover:text-slate-900 group-hover:font-bold transition-colors">
              {item.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-semibold pt-1 text-slate-700 font-mono">
        <span className="flex items-center gap-1.5">
          <span className={cn('w-2.5 h-2.5 bg-[#150f23]', tokens.radius.xs, tokens.shadow.micro)} />
          {serverLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('w-2.5 h-2.5 bg-[#c2ef4e] border border-lime-400', tokens.radius.xs, tokens.shadow.micro)} />
          {aiLabel}
        </span>
      </div>
    </div>
  )
}

export default TelemetryBarChart
