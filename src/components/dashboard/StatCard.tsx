'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { StatTrend } from './types'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: StatTrend
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
  children,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500 tracking-tight">
            {title}
          </span>
          <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
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
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono tracking-tight ${
              trend.positive !== false
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                : 'bg-rose-50 text-rose-700 border border-rose-200/70'
            }`}
          >
            {trend.positive !== false ? (
              <ArrowUp className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3 text-rose-600 shrink-0" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-500 font-normal ml-0.5">{trend.label}</span>
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
