'use client'

import React from 'react'

interface DashboardProgressBarProps {
  value: number
  max?: number
  label?: string
  percentageLabel?: string
  statusLeft?: string
  statusRight?: string
  className?: string
}

export function DashboardProgressBar({
  value,
  max = 100,
  label,
  percentageLabel,
  statusLeft,
  statusRight,
  className = '',
}: DashboardProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))
  const displayPercentage = percentageLabel || `${percentage}%`

  return (
    <div className={`space-y-3 ${className}`}>
      {(label || displayPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-mono text-slate-600 font-medium">{label}</span>
          )}
          <span className="font-mono font-bold text-slate-900 ml-auto">
            {displayPercentage}
          </span>
        </div>
      )}

      {/* Calm daylight progress bar with restrained violet and lime accent cap */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
        <div
          className="h-full bg-[#6a5fc1] rounded-full relative transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-3 bg-[#c2ef4e] rounded-full shadow-2xs"
            aria-hidden="true"
          />
        </div>
      </div>

      {(statusLeft || statusRight) && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          {statusLeft && <span>{statusLeft}</span>}
          {statusRight && (
            <span className="text-emerald-700 font-semibold">{statusRight}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardProgressBar
