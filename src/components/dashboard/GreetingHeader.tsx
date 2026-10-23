'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

interface GreetingHeaderProps {
  name?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  /**
   * 'band' renders the greeting inside a midnight-violet region
   * (#150f23 + pinprick dot grid, white text) — the role dashboards'
   * page header. 'plain' keeps the greeting directly on the canvas.
   */
  variant?: 'plain' | 'band'
}

export function GreetingHeader({
  name = 'Pengguna',
  subtitle = 'Pantau integritas ujian, kelola institusi, dan tinjau status operasional platform.',
  action,
  className = '',
  variant = 'plain',
}: GreetingHeaderProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Selamat pagi'
    if (hour >= 11 && hour < 15) return 'Selamat siang'
    if (hour >= 15 && hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }, [])

  if (variant === 'band') {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-[#150f23] bg-grid-dots-dark border border-[#362d59] shadow-midnight-elevated',
          tokens.radius.xl,
          'px-5 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          className
        )}
      >
        <div className="min-w-0 relative">
          <h1 className={cn(tokens.typography.hero, 'text-white')}>
            {greeting}, <span className="text-white">{name}</span>
          </h1>
          {subtitle && (
            <p className="font-sans text-xs sm:text-sm text-[#bdb8c0] leading-relaxed font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto relative">
            {action}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2', className)}
    >
      <div className="min-w-0">
        <h1 className={cn(tokens.typography.hero, 'text-slate-900')}>
          {greeting}, <span className="text-[#150f23]">{name}</span>
        </h1>
        {subtitle && (
          <p className={cn(tokens.typography.bodyMuted, 'font-medium mt-1 leading-relaxed')}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  )
}

export default GreetingHeader
