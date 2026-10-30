'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { StatTrend } from './types'

interface HeroCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: StatTrend
  highlightText?: string
  className?: string
  children?: React.ReactNode
}

export function HeroCard({
  title,
  value,
  icon,
  trend,
  highlightText,
  className = '',
  children,
}: HeroCardProps) {
  return (
    <div
      className={cn(
        tokens.radius.xl,
        'bg-white border border-[#ddd9ef] p-5',
        tokens.shadow.cardHover,
        'transition-colors relative overflow-hidden flex flex-col justify-between',
        className
      )}
    >
      {/* Ambient violet atmosphere tint (brand hue, not decoration color) */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#6a5fc1]/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 tracking-tight font-sans">
            {title}
          </span>
          <div
            className={cn(
              'w-10 h-10 bg-[#150f23] text-white border border-[#362d59] shadow-sm flex items-center justify-center shrink-0',
              tokens.radius.lg
            )}
          >
            {icon}
          </div>
        </div>

        {/* Value in crisp midnight violet */}
        <div className={cn(tokens.typography.hero, 'text-[#150f23] tabular-nums mt-3')}>
          {value}
        </div>
      </div>

      {/* Bottom: Trend Badge & Highlight */}
      <div className="relative z-10 mt-4 pt-2.5 border-t border-[#e9e5f6] flex items-center justify-between text-xs">
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

        {highlightText && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-700 font-mono font-semibold">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse"
              aria-hidden="true"
            />
            {highlightText}
          </span>
        )}

        {children}
      </div>
    </div>
  )
}

export default HeroCard
