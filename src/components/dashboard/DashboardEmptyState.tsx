'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

interface DashboardEmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn('py-12 px-4 flex flex-col items-center justify-center text-center', className)}
    >
      {icon && (
        <div
          className={cn(
            'w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3',
            tokens.radius.xl,
            tokens.shadow.micro
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn(tokens.typography.subheading, 'text-slate-800')}>
        {title}
      </h3>
      {description && (
        <p className={cn(tokens.typography.bodyMuted, 'max-w-sm mt-1')}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default DashboardEmptyState
