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
      className={`rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-lime-50/40 border border-violet-200/90 p-5 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Ambient glow tints */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#6a5fc1]/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#c2ef4e]/25 blur-xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 tracking-tight">
            {title}
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#150f23] text-[#c2ef4e] border border-slate-900 shadow-sm flex items-center justify-center shrink-0">
            {icon}
          </div>
        </div>

        {/* Value in crisp violet */}
        <div className="font-display text-2xl sm:text-3xl font-black text-[#150f23] tracking-tight tabular-nums mt-3">
          {value}
        </div>
      </div>

      {/* Bottom: Lime Highlight Chip & Trend */}
      <div className="relative z-10 mt-4 pt-2.5 border-t border-violet-100 flex items-center justify-between text-xs">
        {trend && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#c2ef4e] text-slate-950 border border-lime-400 shadow-2xs">
            {trend.positive !== false ? (
              <ArrowUp className="w-3 h-3 text-slate-950 shrink-0 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3 text-rose-950 shrink-0 stroke-[2.5]" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-800 font-medium ml-0.5">{trend.label}</span>
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
