'use client'

import React from 'react'

export interface DashboardProgressBarProps {
  value: number
  max?: number
  label?: string
  percentageLabel?: string
  statusLeft?: string
  statusRight?: string
  tone?: 'violet' | 'emerald' | 'amber' | 'rose' | 'lime'
  className?: string
}

export function DashboardProgressBar({
  value,
  max = 100,
  label,
  percentageLabel,
  statusLeft,
  statusRight,
  tone = 'violet',
  className = '',
}: DashboardProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))
  const displayPercentage = percentageLabel || `${percentage}%`

  const barGradient = (() => {
    switch (tone) {
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600'
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-amber-600'
      case 'rose':
        return 'bg-gradient-to-r from-rose-500 to-rose-600'
      case 'lime':
        return 'bg-gradient-to-r from-lime-400 to-[#c2ef4e]'
      default:
        return 'bg-gradient-to-r from-[#6a5fc1] via-indigo-600 to-[#6a5fc1]'
    }
  })()

  return (
    <div className={`space-y-2.5 ${className}`}>
      {(label || displayPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-mono text-slate-700 font-semibold">{label}</span>
          )}
          <span className="font-mono font-bold text-slate-900 ml-auto">
            {displayPercentage}
          </span>
        </div>
      )}

      {/* Daylight progress bar with restrained rich gradient and lime accent cap */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
        <div
          className={`h-full rounded-full relative transition-all duration-500 ease-out ${barGradient}`}
          style={{ width: `${percentage}%` }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-3 bg-[#c2ef4e] rounded-full shadow-[0_0_6px_rgba(194,239,78,0.6)]"
            aria-hidden="true"
          />
        </div>
      </div>

      {(statusLeft || statusRight) && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          {statusLeft && <span>{statusLeft}</span>}
          {statusRight && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {statusRight}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardProgressBar
