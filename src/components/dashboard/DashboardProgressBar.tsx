'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

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
        return 'bg-gradient-to-r from-[#6a5fc1] via-violet-600 to-[#6a5fc1]'
    }
  })()

  return (
    <div className={cn('space-y-2.5', className)}>
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

      {/* Daylight progress bar with restrained rich gradient */}
      <div
        className={cn(
          'h-3 w-full bg-[#f1effa] overflow-hidden p-0.5 border border-[#ddd9ef] shadow-inner',
          tokens.radius.full
        )}
      >
        <div
          className={cn('h-full relative transition-[width] duration-500 ease-out', tokens.radius.full, barGradient)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {(statusLeft || statusRight) && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          {statusLeft && <span>{statusLeft}</span>}
          {statusRight && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 bg-emerald-500', tokens.radius.full)} />
              {statusRight}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardProgressBar
