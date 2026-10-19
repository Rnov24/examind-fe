'use client'

import React from 'react'

export interface PlanDistributionData {
  enterprise?: number
  pro?: number
  starter?: number
}

interface PlanDistributionGridProps {
  distribution?: PlanDistributionData
  className?: string
}

export function PlanDistributionGrid({
  distribution,
  className = '',
}: PlanDistributionGridProps) {
  const items = [
    {
      name: 'Enterprise',
      count: distribution?.enterprise ?? 0,
      containerClass: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border-emerald-200/90 hover:border-emerald-300',
      dotClass: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
      countClass: 'text-emerald-950',
      tagText: 'Prioritas AI',
      tagClass: 'text-emerald-800 bg-emerald-100/80 font-bold',
    },
    {
      name: 'Pro',
      count: distribution?.pro ?? 0,
      containerClass: 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 border-indigo-200/90 hover:border-indigo-300',
      dotClass: 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]',
      countClass: 'text-indigo-950',
      tagText: 'Kamera Ganda',
      tagClass: 'text-indigo-800 bg-indigo-100/80 font-bold',
    },
    {
      name: 'Starter',
      count: distribution?.starter ?? 0,
      containerClass: 'bg-gradient-to-br from-slate-50/90 via-white to-slate-50/40 border-slate-200/90 hover:border-slate-300',
      dotClass: 'bg-slate-400',
      countClass: 'text-slate-900',
      tagText: 'Dasar CBT',
      tagClass: 'text-slate-700 bg-slate-100 font-semibold',
    },
  ]

  return (
    <div className={`grid grid-cols-3 gap-2.5 pt-1 ${className}`}>
      {items.map((item) => (
        <div
          key={item.name}
          className={`p-3 rounded-xl border space-y-1.5 transition-all shadow-2xs hover:shadow-xs ${item.containerClass}`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 font-bold">
            <span>{item.name}</span>
            <span className={`w-2 h-2 rounded-full ${item.dotClass}`} aria-hidden="true" />
          </div>
          <div className={`font-display text-xl font-black tabular-nums ${item.countClass}`}>
            {item.count}
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-md inline-block ${item.tagClass}`}>
            {item.tagText}
          </span>
        </div>
      ))}
    </div>
  )
}

export default PlanDistributionGrid
