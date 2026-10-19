'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

interface GreetingHeaderProps {
  name?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function GreetingHeader({
  name = 'Pengguna',
  subtitle = 'Pantau integritas ujian, kelola institusi, dan tinjau status operasional platform.',
  action,
  className = '',
}: GreetingHeaderProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Selamat pagi'
    if (hour >= 11 && hour < 15) return 'Selamat siang'
    if (hour >= 15 && hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }, [])

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
