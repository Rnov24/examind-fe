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
      badgeColor: 'bg-emerald-500',
      tagText: 'Prioritas AI',
      tagColor: 'text-emerald-700',
    },
    {
      name: 'Pro',
      count: distribution?.pro ?? 0,
      badgeColor: 'bg-indigo-500',
      tagText: 'Kamera Ganda',
      tagColor: 'text-indigo-700',
    },
    {
      name: 'Starter',
      count: distribution?.starter ?? 0,
      badgeColor: 'bg-slate-400',
      tagText: 'Dasar CBT',
      tagColor: 'text-slate-500',
    },
  ]

  return (
    <div className={`grid grid-cols-3 gap-2.5 pt-1 ${className}`}>
      {items.map((item) => (
        <div
          key={item.name}
          className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
            <span>{item.name}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${item.badgeColor}`} aria-hidden="true" />
          </div>
          <div className="font-display text-lg font-extrabold text-slate-900 tabular-nums">
            {item.count}
          </div>
          <p className={`text-[9px] font-medium ${item.tagColor}`}>{item.tagText}</p>
        </div>
      ))}
    </div>
  )
}

export default PlanDistributionGrid
