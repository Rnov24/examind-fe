import React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'lime'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'midnight'
  | 'neutral'
  | 'outline'
  | 'stamp'

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  dotPulse?: boolean
  icon?: React.ReactNode
  interactive?: boolean
}

/**
 * EXAMIND Academic Status & Telemetry Badge Styles
 * Adheres to DESIGN.md tokens & WCAG AA contrast floor
 */
const variantStyles: Record<BadgeVariant, string> = {
  lime:
    'bg-[#c2ef4e] text-[#150f23] border border-[#a8dc2c] font-black uppercase tracking-wider shadow-2xs',
  violet:
    'bg-indigo-50/90 text-[#4f46e5] border border-indigo-200/90 font-bold tracking-tight',
  emerald:
    'bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold tracking-tight',
  amber:
    'bg-amber-50 text-amber-900 border border-amber-300/80 font-bold tracking-tight',
  rose:
    'bg-rose-50 text-rose-800 border border-rose-200/90 font-bold tracking-tight',
  midnight:
    'bg-[#150f23] text-white border border-[#2a1e47] font-bold tracking-wider shadow-2xs',
  neutral:
    'bg-slate-100 text-slate-700 border border-slate-200/90 font-medium tracking-tight',
  outline:
    'bg-white text-slate-700 border border-slate-200/90 shadow-2xs font-semibold tracking-tight',
  stamp:
    'bg-white text-[#150f23] border-2 border-[#150f23] font-black uppercase tracking-widest text-[9px] shadow-xs',
}

const dotColors: Record<BadgeVariant, string> = {
  lime: 'bg-[#150f23]',
  violet: 'bg-[#4f46e5]',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  midnight: 'bg-[#c2ef4e]',
  neutral: 'bg-slate-500',
  outline: 'bg-slate-400',
  stamp: 'bg-[#150f23]',
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'text-[9px] px-1.5 py-0.5 rounded gap-1',
  sm: 'text-[10px] px-2 py-0.5 rounded-md gap-1.5',
  md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
  lg: 'text-xs px-3 py-1.5 rounded-xl gap-2 font-bold',
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotPulse = false,
  icon,
  interactive = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono select-none whitespace-nowrap transition-colors duration-150',
        variantStyles[variant],
        sizeStyles[size],
        interactive &&
          'cursor-pointer hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5fc1]/50',
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          {dotPulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[variant])}
          />
        </span>
      )}
      {icon && <span className="shrink-0 -ml-0.5" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export interface ChipProps extends BadgeProps {
  keyword?: boolean
}

/**
 * Chip Component:
 * When keyword is true, implements the canonical Electric Lime Keyword Chip from DESIGN.md
 */
export function Chip({ keyword = false, variant = 'lime', ...props }: ChipProps) {
  return (
    <Badge
      variant={keyword ? 'lime' : variant}
      className={cn(
        keyword && 'px-2 py-0.5 font-black uppercase tracking-wider text-[10px] rounded shadow-2xs',
        props.className
      )}
      {...props}
    />
  )
}

export interface StampProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'midnight' | 'emerald' | 'violet' | 'lime'
}

/**
 * Institutional Integrity Stamp:
 * Verifiable credential stamp with crisp dual borders and tracking-widest typography
 * Based on DESIGN.md: "Institutional Integrity Seals & Certification Stamps"
 */
export function Stamp({
  variant = 'midnight',
  className,
  children,
  ...props
}: StampProps) {
  const stampVariants = {
    midnight: 'border-2 border-[#150f23] text-[#150f23] bg-white',
    emerald: 'border-2 border-emerald-700 text-emerald-800 bg-emerald-50/60',
    violet: 'border-2 border-[#584dae] text-[#584dae] bg-indigo-50/60',
    lime: 'border-2 border-[#150f23] text-[#150f23] bg-[#c2ef4e]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-black uppercase text-[10px] tracking-widest px-2.5 py-0.5 rounded shadow-2xs select-none',
        stampVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
