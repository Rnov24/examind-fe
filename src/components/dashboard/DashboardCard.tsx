'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

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
      className={cn(
        tokens.surface.card,
        tokens.radius.xl,
        tokens.border.default,
        tokens.shadow.card,
        'hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden',
        className
      )}
    >
      {/* Optional Card Header */}
      {hasHeader && (
        <div className={cn(tokens.spacing.headerPadding, 'border-b border-[#e9e5f6] flex items-center justify-between gap-3')}>
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className={cn('w-8 h-8 bg-[#f1effa] text-[#6a5fc1] border border-[#ddd9ef] flex items-center justify-center shrink-0', tokens.radius.lg)}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {typeof title === 'string' ? (
                <h2 className={cn(tokens.typography.subheading, 'truncate')}>
                  {title}
                </h2>
              ) : (
                title
              )}
              {subtitle && (
                <p className={cn(tokens.typography.caption, 'truncate mt-0.5')}>
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
      <div className={cn('flex-1', noPadding ? '' : tokens.spacing.cardPaddingMd)}>{children}</div>

      {/* Optional Card Footer */}
      {footer && (
        <div className={cn(tokens.spacing.footerPadding, 'bg-[#faf9fd] border-t border-[#e9e5f6] text-xs text-slate-500')}>
          {footer}
        </div>
      )}
    </section>
  )
}

export default DashboardCard
