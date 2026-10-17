import React from 'react'
import { cn } from '@/lib/utils'

export type SkeletonVariant = 'text' | 'heading' | 'circular' | 'card' | 'button' | 'badge' | 'input'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-md',
  heading: 'h-6 w-3/4 rounded-lg',
  circular: 'rounded-full shrink-0',
  card: 'h-40 w-full rounded-2xl',
  button: 'h-10 w-28 rounded-xl',
  badge: 'h-5 w-16 rounded-md',
  input: 'h-10 w-full rounded-xl',
}

export function Skeleton({
  className,
  variant = 'text',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200/70',
        variantStyles[variant],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3.5 sm:p-4">
          <Skeleton
            className={cn(
              'h-4',
              i === 0 ? 'w-36' : i === 1 ? 'w-24' : i === columns - 1 ? 'w-16 ml-auto' : 'w-20'
            )}
          />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({
  columns = 5,
  rows = 4,
  className,
}: {
  columns?: number
  rows?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden',
        className
      )}
    >
      <div className="bg-slate-50/80 border-b border-slate-200 p-4 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3.5', i === 0 ? 'w-28' : 'w-16')} />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn('h-4', c === 0 ? 'w-36' : c === 1 ? 'w-24' : 'w-20')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton variant="heading" className="w-1/3" />
        <Skeleton variant="badge" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-4/5" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <Skeleton variant="text" className="w-24" />
        <Skeleton variant="button" className="w-20 h-8" />
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4"
        >
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * BentoMetricSkeleton: Shimmer skeleton tailored to a single KPI/metric bento block.
 * Uses lightweight directional sweep with staggered delay.
 */
export function BentoMetricSkeleton({
  staggerIndex = 0,
  className,
}: {
  staggerIndex?: number
  className?: string
}) {
  const delay = { animationDelay: `${staggerIndex * 150}ms` }
  return (
    <div className={cn('space-y-3.5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bento-shimmer shrink-0" style={delay} />
          <div className="h-3.5 w-28 rounded bento-shimmer" style={delay} />
        </div>
      </div>
      <div className="h-9 w-20 rounded-lg bento-shimmer" style={delay} />
      <div className="flex items-center justify-between pt-1">
        <div className="h-3 w-32 rounded bento-shimmer" style={delay} />
        <div className="h-3 w-12 rounded bento-shimmer" style={delay} />
      </div>
    </div>
  )
}

/**
 * BentoHealthSkeleton: Shimmer skeleton tailored to status strip / health badges.
 */
export function BentoHealthSkeleton({
  count = 3,
  staggerIndex = 0,
}: {
  count?: number
  staggerIndex?: number
}) {
  return (
    <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
      {Array.from({ length: count }).map((_, i) => {
        const delay = { animationDelay: `${(staggerIndex + i) * 120}ms` }
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bento-shimmer shrink-0" style={delay} />
            <div className="h-3 w-20 rounded bento-shimmer" style={delay} />
            <div className="h-3 w-12 rounded bento-shimmer" style={delay} />
          </div>
        )
      })}
    </div>
  )
}

/**
 * BentoTableSkeleton: Shimmer skeleton tailored to data tables with responsive rows.
 */
export function BentoTableSkeleton({
  rows = 5,
  staggerIndex = 0,
}: {
  rows?: number
  staggerIndex?: number
}) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => {
        const rowDelay = { animationDelay: `${staggerIndex * 150 + r * 70}ms` }
        return (
          <div key={r} className="p-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bento-shimmer shrink-0" style={rowDelay} />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <div className="h-3.5 w-3/4 rounded bento-shimmer" style={rowDelay} />
                <div className="h-2.5 w-1/2 rounded bento-shimmer" style={rowDelay} />
              </div>
            </div>
            <div className="hidden sm:block h-3.5 w-24 rounded bento-shimmer" style={rowDelay} />
            <div className="h-5 w-16 rounded-md bento-shimmer" style={rowDelay} />
            <div className="h-7 w-20 rounded-xl bento-shimmer shrink-0" style={rowDelay} />
          </div>
        )
      })}
    </div>
  )
}

/**
 * BentoListSkeleton: Shimmer skeleton tailored to quick links or divided item rows.
 */
export function BentoListSkeleton({
  items = 3,
  staggerIndex = 0,
}: {
  items?: number
  staggerIndex?: number
}) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: items }).map((_, i) => {
        const itemDelay = { animationDelay: `${staggerIndex * 150 + i * 90}ms` }
        return (
          <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 flex-1">
              <div className="w-9 h-9 rounded-xl bento-shimmer shrink-0" style={itemDelay} />
              <div className="space-y-1.5 flex-1 max-w-sm">
                <div className="h-3.5 w-28 rounded bento-shimmer" style={itemDelay} />
                <div className="h-2.5 w-48 rounded bento-shimmer" style={itemDelay} />
              </div>
            </div>
            <div className="w-4 h-4 rounded bento-shimmer shrink-0" style={itemDelay} />
          </div>
        )
      })}
    </div>
  )
}

export default Skeleton

