'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BentoBlockStatus } from '@/lib/bentoCache'
import { BentoMetricSkeleton } from '@/components/ui/Skeleton'
import { tokens } from '@/components/system/tokens'

export interface BentoBlockProps {
  /** Title of the bento card */
  title?: React.ReactNode
  /** Optional secondary subtitle */
  subtitle?: React.ReactNode
  /** Leading icon for the title */
  icon?: React.ReactNode
  /** Right-aligned header action (e.g. badge, refresh, link) */
  headerAction?: React.ReactNode
  /** Block lifecycle status: 'idle' | 'loading' | 'ready' | 'error' */
  status?: BentoBlockStatus
  /** Fallback boolean for loading state */
  isLoading?: boolean
  /** Error message when status is 'error' */
  error?: string | null
  /** Callback to re-attempt data fetching */
  onRetry?: () => void
  /** Label for retry button (default: "Coba Lagi") */
  retryLabel?: string
  /** Custom skeleton component matching this block's shape */
  skeleton?: React.ReactNode
  /** Index used to calculate staggered shimmer sweep delay (e.g. 0, 1, 2) */
  staggerIndex?: number
  /** Main content to display when ready */
  children?: React.ReactNode
  /** Optional footer content */
  footer?: React.ReactNode
  /** Outer container className */
  className?: string
  /** Content wrapper className */
  contentClassName?: string
  /** Header wrapper className */
  headerClassName?: string
  /** If true, removes padding from the content container */
  noPadding?: boolean
}

/**
 * BentoBlock is an authoritative, independently-loading Bento tile wrapper.
 * Each block manages its own: idle → loading (skeleton) → ready | error (inline retry).
 */
export function BentoBlock({
  title,
  subtitle,
  icon,
  headerAction,
  status,
  isLoading,
  error,
  onRetry,
  retryLabel = 'Coba Lagi',
  skeleton,
  staggerIndex = 0,
  children,
  footer,
  className,
  contentClassName,
  headerClassName,
  noPadding = false,
}: BentoBlockProps) {
  // Resolve current active state
  const isBlockLoading = status === 'loading' || (isLoading && status !== 'error')
  const isBlockError = status === 'error' || (Boolean(error) && !isBlockLoading)

  const hasHeader = Boolean(title || icon || headerAction)

  return (
    <div
      className={cn(
        tokens.surface.card,
        tokens.radius.xl,
        tokens.border.default,
        tokens.shadow.card,
        'flex flex-col justify-between overflow-hidden',
        tokens.transition.normal,
        className
      )}
    >
      {/* Optional Card Header */}
      {hasHeader && (
        <div
          className={cn(
            'px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3',
            headerClassName
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="text-slate-500 shrink-0 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-display text-sm font-bold text-slate-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Main Body */}
      <div className={cn(!noPadding && tokens.spacing.cardPaddingMd, 'flex-1', contentClassName)}>
        {/* State 1: Loading Skeleton */}
        {isBlockLoading && (
          <div className="w-full">
            {skeleton ? (
              skeleton
            ) : (
              <BentoMetricSkeleton staggerIndex={staggerIndex} className="p-0" />
            )}
          </div>
        )}

        {/* State 2: Error with Inline Retry */}
        {!isBlockLoading && isBlockError && (
          <div className={cn('w-full py-6 px-4 bg-rose-50/70 border border-rose-200/80 text-center space-y-3', tokens.radius.lg)}>
            <div className={cn('w-10 h-10 bg-rose-100/80 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto', tokens.radius.lg, tokens.shadow.subtle)}>
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Gagal Memuat Data Blok
              </h4>
              <p className="text-[11px] text-slate-600 max-w-xs mx-auto line-clamp-2">
                {error || 'Terjadi gangguan saat mengambil data. Silakan coba kembali.'}
              </p>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none',
                  tokens.radius.md,
                  tokens.shadow.subtle
                )}
              >
                <RefreshCw className="w-3 h-3 text-[#c2ef4e]" aria-hidden="true" />
                <span>{retryLabel}</span>
              </button>
            )}
          </div>
        )}

        {/* State 3: Ready / Content */}
        {!isBlockLoading && !isBlockError && children}
      </div>

      {/* Optional Footer */}
      {footer && !isBlockLoading && !isBlockError && (
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  )
}

export default BentoBlock

