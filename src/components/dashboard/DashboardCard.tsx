'use client'

import React from 'react'

interface DashboardCardProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  noPadding?: boolean
  className?: string
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  action,
  children,
  footer,
  noPadding = false,
  className = '',
}: DashboardCardProps) {
  const hasHeader = Boolean(title || action)

  return (
    <section
      className={`rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Optional Card Header */}
      {hasHeader && (
        <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {typeof title === 'string' ? (
                <h2 className="font-display text-sm font-bold text-slate-900 tracking-tight truncate">
                  {title}
                </h2>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && (
            <div className="flex items-center gap-2 shrink-0">{action}</div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={`flex-1 ${noPadding ? '' : 'p-5 sm:p-6'}`}>{children}</div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="px-5 sm:px-6 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </section>
  )
}

export default DashboardCard
