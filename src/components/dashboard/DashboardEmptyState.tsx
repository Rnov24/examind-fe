'use client'

import React from 'react'

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
      className={`py-12 px-4 flex flex-col items-center justify-center text-center ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="font-display text-sm font-bold text-slate-800">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-400 font-medium max-w-sm mt-1">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default DashboardEmptyState
