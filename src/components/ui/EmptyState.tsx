import React from 'react'
import { cn } from '@/lib/utils'

export type EmptyStateAccent = 'none' | 'lime' | 'violet' | 'midnight'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  badge?: React.ReactNode
  card?: boolean
  accent?: EmptyStateAccent
}

const emptyStateAccentStyles: Record<EmptyStateAccent, string> = {
  none: '',
  lime: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#c2ef4e] before:z-10',
  violet: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#6a5fc1] before:z-10',
  midnight: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#150f23] before:z-10',
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  badge,
  card = false,
  accent = 'none',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center mx-auto flex flex-col items-center justify-center relative overflow-hidden',
        card
          ? cn(
              'bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-xs max-w-lg',
              emptyStateAccentStyles[accent]
            )
          : 'p-8 sm:p-12 max-w-md',
        className
      )}
      {...props}
    >
      {badge && <div className="mb-3">{badge}</div>}

      {icon && (
        <div className="relative mb-3.5">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-600 flex items-center justify-center shadow-2xs">
            {icon}
          </div>
          <div className="absolute inset-0 rounded-2xl border border-slate-100 scale-125 -z-10 pointer-events-none opacity-60" />
        </div>
      )}

      <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export default EmptyState
