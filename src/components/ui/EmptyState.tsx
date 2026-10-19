import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

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
  lime: cn(tokens.accentBarBase, tokens.semantic.lime.accentBar),
  violet: cn(tokens.accentBarBase, tokens.semantic.violet.accentBar),
  midnight: cn(tokens.accentBarBase, tokens.semantic.midnight.accentBar),
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
              tokens.surface.card,
              tokens.border.default,
              tokens.radius.xl,
              'p-8 sm:p-12',
              tokens.shadow.subtle,
              'max-w-lg',
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
          <div
            className={cn(
              'w-14 h-14 bg-slate-50 text-slate-600 flex items-center justify-center',
              tokens.radius.xl,
              tokens.border.default,
              tokens.shadow.micro
            )}
          >
            {icon}
          </div>
          <div
            className={cn(
              'absolute inset-0 border border-slate-100 scale-125 -z-10 pointer-events-none opacity-60',
              tokens.radius.xl
            )}
          />
        </div>
      )}

      <h3 className={cn(tokens.typography.title, 'text-base sm:text-lg')}>
        {title}
      </h3>

      {description && (
        <p className={cn(tokens.typography.bodyMuted, 'mt-1 mb-5 max-w-sm mx-auto')}>
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
