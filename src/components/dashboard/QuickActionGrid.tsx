'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

export interface QuickActionItem {
  title: string
  subtitle: string
  href: string
  icon: React.ReactNode
}

interface QuickActionGridProps {
  items: QuickActionItem[]
  className?: string
}

export function QuickActionGrid({ items, className = '' }: QuickActionGridProps) {
  return (
    <div
      className={cn(
        tokens.surface.card,
        tokens.radius.xl,
        tokens.border.default,
        'p-1',
        tokens.shadow.cardHover,
        'transition-all',
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group',
              tokens.radius.lg
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-9 h-9 bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-violet-50 group-hover:text-[#6a5fc1] group-hover:border-violet-200/70 transition-colors',
                  tokens.radius.lg
                )}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#6a5fc1] transition-colors font-sans">
                  {item.title}
                </p>
                <p className={cn(tokens.typography.caption, 'truncate')}>{item.subtitle}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActionGrid
