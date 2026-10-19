'use client'

import React, { useMemo } from 'react'

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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {greeting}, <span className="text-[#150f23]">{name}</span>
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
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
