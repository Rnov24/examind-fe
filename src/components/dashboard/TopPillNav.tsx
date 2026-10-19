'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { NavTabItem } from './types'

interface TopPillNavProps {
  tabs: NavTabItem[]
  activeTab: string
  onChange?: (id: string) => void
  className?: string
}

export function TopPillNav({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TopPillNavProps) {
  return (
    <nav
      aria-label="Navigasi Tab Pill"
      className={cn(
        tokens.surface.card,
        tokens.radius.full,
        'p-1.5',
        tokens.border.default,
        tokens.shadow.subtle,
        'flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none select-none touch-pan-x',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        const baseClasses = cn(
          'shrink-0 px-4 sm:px-5 py-2 min-h-[40px] sm:min-h-[44px] text-xs font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23]',
          tokens.radius.full,
          tokens.transition.fast,
          isActive
            ? cn(tokens.semantic.midnight.solid, tokens.shadow.subtle, 'font-bold')
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
        )

        const content = (
          <>
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 font-bold',
                  tokens.radius.full,
                  isActive
                    ? tokens.semantic.lime.badge
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </>
        )

        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => {
                tab.onClick?.()
                onChange?.(tab.id)
              }}
              aria-current={isActive ? 'page' : undefined}
              className={baseClasses}
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              tab.onClick?.()
              onChange?.(tab.id)
            }}
            aria-current={isActive ? 'page' : undefined}
            className={baseClasses}
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}

export default TopPillNav
