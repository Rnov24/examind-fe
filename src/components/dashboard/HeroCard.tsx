'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
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
      className={`rounded-2xl bg-gradient-to-br from-white via-violet-50/20 to-violet-50/50 border border-violet-100/90 p-5 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Calm ambient tint */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#6a5fc1]/5 blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-[#c2ef4e]/15 blur-xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500 tracking-tight">
            {title}
          </span>
          <div className="w-9 h-9 rounded-full bg-violet-50 border border-violet-200/80 flex items-center justify-center text-[#6a5fc1] shrink-0 shadow-2xs">
            {icon}
          </div>
        </div>

        {/* Value in crisp violet */}
        <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#150f23] tracking-tight tabular-nums mt-3">
          {value}
        </div>
      </div>

      {/* Bottom: Lime Highlight Chip & Trend */}
      <div className="relative z-10 mt-4 pt-2 border-t border-violet-100/80 flex items-center justify-between text-xs">
        {trend && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#c2ef4e]/20 text-slate-900 border border-[#c2ef4e]/50">
            {trend.positive !== false ? (
              <ArrowUp className="w-3 h-3 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3 text-rose-700 shrink-0" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-600 font-normal ml-0.5">{trend.label}</span>
            )}
          </div>
        )}

        {highlightText && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-mono font-medium">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] border border-slate-900/10"
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
