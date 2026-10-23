'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { StatTrend } from './types'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: StatTrend
  subtitle?: string
  tone?: 'emerald' | 'violet' | 'azure' | 'amber' | 'rose' | 'lime' | 'neutral'
  className?: string
  children?: React.ReactNode
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  tone = 'neutral',
  className = '',
  children,
}: StatCardProps) {
  const iconToneClasses = (() => {
    switch (tone) {
      case 'emerald':
        return tokens.tile.emerald
      case 'violet':
        return tokens.tile.violet
      case 'azure':
        return tokens.tile.azure
      case 'amber':
        return tokens.tile.amber
      case 'rose':
        return tokens.tile.rose
      case 'lime':
        // Lime is reserved for primary CTAs / active nav — a primary
        // metric tile expresses that role with the midnight tile instead.
        return tokens.tile.midnight
      default:
        return tokens.tile.neutral
    }
  })()

  const toneBorderClass = (() => {
    switch (tone) {
      case 'emerald':
        return 'hover:border-emerald-300'
      case 'violet':
        return 'hover:border-violet-300'
      case 'azure':
        return 'hover:border-azure-300'
      case 'amber':
        return 'hover:border-amber-300'
      case 'rose':
        return 'hover:border-rose-300'
      case 'lime':
        return 'hover:border-[#362d59]'
      default:
        return 'hover:border-[#c9c2ec]'
    }
  })()

  return (
    <div
      className={cn(
        tokens.surface.card,
        tokens.radius.xl,
        tokens.border.default,
        'p-5',
        tokens.shadow.cardHover,
        'transition-all flex flex-col justify-between',
        toneBorderClass,
        className
      )}
    >
      <div>
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 tracking-tight font-sans">
            {title}
          </span>
          <div
            className={cn(
              'w-10 h-10 border flex items-center justify-center shrink-0 transition-colors',
              tokens.radius.lg,
              tokens.shadow.micro,
              iconToneClasses
            )}
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className={cn(tokens.typography.hero, 'tabular-nums mt-3')}>
          {value}
        </div>
      </div>

      {/* Bottom: Trend Badge or Subtitle */}
      <div className="mt-4 pt-2 border-t border-[#e9e5f6] flex items-center justify-between text-xs">
        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono tracking-tight',
              tokens.radius.full,
              tokens.shadow.micro,
              trend.positive !== false
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                : 'bg-rose-50 text-rose-800 border border-rose-200/80'
            )}
          >
            {trend.positive !== false ? (
              <ArrowUp className="w-3 h-3 text-emerald-700 shrink-0 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3 text-rose-700 shrink-0 stroke-[2.5]" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-600 font-medium ml-0.5">{trend.label}</span>
            )}
          </div>
        )}

        {subtitle && (
          <span className={cn(tokens.typography.caption, 'truncate')}>
            {subtitle}
          </span>
        )}

        {children}
      </div>
    </div>
  )
}

export default StatCard
