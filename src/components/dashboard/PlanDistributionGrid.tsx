'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

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
      containerClass: 'bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50',
      dotClass: tokens.semantic.emerald.dot,
      countClass: 'text-emerald-950',
      tagText: 'Prioritas AI',
      tagClass: 'text-emerald-800 bg-emerald-100/90 font-bold',
    },
    {
      name: 'Pro',
      count: distribution?.pro ?? 0,
      containerClass: 'bg-violet-50/70 border-violet-100 hover:bg-violet-50',
      dotClass: tokens.semantic.violet.dot,
      countClass: 'text-[#150f23]',
      tagText: 'Kamera Ganda',
      tagClass: 'text-[#6a5fc1] bg-violet-100/90 font-bold',
    },
    {
      name: 'Starter',
      count: distribution?.starter ?? 0,
      containerClass: 'bg-azure-50/70 border-azure-100 hover:bg-azure-50',
      dotClass: 'bg-azure-500',
      countClass: 'text-azure-950',
      tagText: 'Dasar CBT',
      tagClass: 'text-azure-800 bg-azure-100/90 font-bold',
    },
  ]

  return (
    <div className={cn('grid grid-cols-3 gap-2.5', className)}>
      {items.map((item) => (
        <div
          key={item.name}
          className={cn(
            'p-3 border transition-colors',
            tokens.radius.lg,
            item.containerClass
          )}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 font-bold">
            <span>{item.name}</span>
            <span className={cn('w-2 h-2', tokens.radius.full, item.dotClass)} aria-hidden="true" />
          </div>
          <div className={cn(tokens.typography.title, 'text-xl font-black tabular-nums my-1', item.countClass)}>
            {item.count}
          </div>
          <span className={cn('text-[9px] px-1.5 py-0.5 inline-block font-sans', tokens.radius.sm, item.tagClass)}>
            {item.tagText}
          </span>
        </div>
      ))}
    </div>
  )
}

export default PlanDistributionGrid
