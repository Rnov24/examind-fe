'use client'

import React from 'react'

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
      className={`p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-700">{title}</span>
        <span className="font-mono text-slate-400 text-[10px]">{subtitle}</span>
      </div>

      {/* Dual Bar Graphic - Calm daylight styling */}
      <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
          >
            <div className="w-full max-w-[18px] flex flex-col items-center gap-0.5 justify-end h-full">
              {/* Top lime highlight cap */}
              <div
                className="w-full bg-[#c2ef4e] rounded-t-sm transition-all group-hover:opacity-90 shadow-2xs"
                style={{ height: `${item.ai * 0.35}%` }}
                title={`${aiLabel}: ${item.ai}%`}
              />
              {/* Soft daylight base bar */}
              <div
                className="w-full bg-slate-300 rounded-b-sm transition-all group-hover:bg-slate-400"
                style={{ height: `${item.load * 0.55}%` }}
                title={`${serverLabel}: ${item.load}%`}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400">{item.day}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-medium pt-1 text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
          {serverLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#c2ef4e]" />
          {aiLabel}
        </span>
      </div>
    </div>
  )
}

export default TelemetryBarChart
