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
      className={`rounded-2xl bg-[#150f23] border border-[#362d59] p-5 shadow-midnight-elevated relative overflow-hidden text-white flex flex-col justify-between ${className}`}
    >
      {/* Subtle pedagogical violet decorative glow behind hero card */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#6a5fc1]/20 blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-[#c2ef4e]/10 blur-xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300 tracking-tight">
            {title}
          </span>
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#c2ef4e] shrink-0">
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums mt-3">
          {value}
        </div>
      </div>

      {/* Bottom: Lime Highlight Chip / Trend */}
      <div className="relative z-10 mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        {trend && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#c2ef4e]/15 text-[#c2ef4e] border border-[#c2ef4e]/30">
            {trend.positive !== false ? (
              <ArrowUp className="w-3 h-3 text-[#c2ef4e] shrink-0" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3 text-[#c2ef4e] shrink-0" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-300 font-normal ml-0.5">{trend.label}</span>
            )}
          </div>
        )}

        {highlightText && (
          <span className="text-[11px] text-[#c2ef4e] font-mono font-semibold">
            {highlightText}
          </span>
        )}

        {children}
      </div>
    </div>
  )
}

export default HeroCard
