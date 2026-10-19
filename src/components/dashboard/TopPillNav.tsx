'use client'

import React from 'react'
import Link from 'next/link'
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
      className={`bg-white rounded-full p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        const baseClasses = `px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23] ${
          isActive
            ? 'bg-[#150f23] text-white shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
        }`

        const content = (
          <>
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-[#c2ef4e] text-slate-950'
                    : 'bg-slate-100 text-slate-600'
                }`}
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
