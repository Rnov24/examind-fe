'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { StatTrend } from './types'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: StatTrend
  subtitle?: string
  tone?: 'emerald' | 'indigo' | 'violet' | 'amber' | 'rose' | 'lime' | 'neutral'
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
        return 'bg-emerald-50 border-emerald-200/80 text-emerald-600'
      case 'indigo':
        return 'bg-indigo-50 border-indigo-200/80 text-indigo-600'
      case 'violet':
        return 'bg-violet-50 border-violet-200/80 text-[#6a5fc1]'
      case 'amber':
        return 'bg-amber-50 border-amber-200/80 text-amber-600'
      case 'rose':
        return 'bg-rose-50 border-rose-200/80 text-rose-600'
      case 'lime':
        return 'bg-[#c2ef4e]/20 border-[#c2ef4e]/60 text-slate-950'
      default:
        return 'bg-slate-50 border-slate-100 text-slate-700'
    }
  })()

  const toneBorderClass = (() => {
    switch (tone) {
      case 'emerald':
        return 'hover:border-emerald-300'
      case 'indigo':
        return 'hover:border-indigo-300'
      case 'violet':
        return 'hover:border-violet-300'
      case 'amber':
        return 'hover:border-amber-300'
      case 'rose':
        return 'hover:border-rose-300'
      case 'lime':
        return 'hover:border-lime-400'
      default:
        return 'hover:border-slate-300'
    }
  })()

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col justify-between ${toneBorderClass} ${className}`}
    >
      <div>
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 tracking-tight">
            {title}
          </span>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-colors ${iconToneClasses}`}
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-3">
          {value}
        </div>
      </div>

      {/* Bottom: Trend Badge or Subtitle */}
      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight shadow-2xs ${
              trend.positive !== false
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                : 'bg-rose-50 text-rose-800 border border-rose-200/80'
            }`}
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
          <span className="text-[11px] text-slate-500 font-medium">
            {subtitle}
          </span>
        )}

        {children}
      </div>
    </div>
  )
}

export default StatCard
