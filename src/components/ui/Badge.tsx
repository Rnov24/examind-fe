import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

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
 * Adheres to canonical design tokens & WCAG AA contrast floor
 */
const variantStyles: Record<BadgeVariant, string> = {
  lime: cn(tokens.semantic.lime.badge, 'font-black uppercase tracking-wider', tokens.shadow.micro),
  violet: cn(tokens.semantic.violet.badge, 'font-bold tracking-tight'),
  emerald: cn(tokens.semantic.emerald.badge, 'font-bold tracking-tight'),
  amber: cn(tokens.semantic.amber.badge, 'font-bold tracking-tight'),
  rose: cn(tokens.semantic.rose.badge, 'font-bold tracking-tight'),
  midnight: cn(tokens.semantic.midnight.badge, 'font-bold tracking-wider', tokens.shadow.micro),
  neutral: cn(tokens.semantic.neutral.badge, 'font-medium tracking-tight'),
  outline: cn('bg-white text-slate-700', tokens.border.default, tokens.shadow.micro, 'font-semibold tracking-tight'),
  stamp: cn('bg-white text-[#150f23] border-2 border-[#150f23] font-black uppercase tracking-widest text-[9px]', tokens.shadow.subtle),
}

const dotColors: Record<BadgeVariant, string> = {
  lime: tokens.semantic.lime.dot,
  violet: tokens.semantic.violet.dot,
  emerald: tokens.semantic.emerald.dot,
  amber: tokens.semantic.amber.dot,
  rose: tokens.semantic.rose.dot,
  midnight: tokens.semantic.midnight.dot,
  neutral: tokens.semantic.neutral.dot,
  outline: 'bg-slate-400',
  stamp: tokens.semantic.lime.dot,
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: cn('text-[9px] px-1.5 py-0.5 gap-1', tokens.radius.xs),
  sm: cn('text-[10px] px-2 py-0.5 gap-1.5', tokens.radius.sm),
  md: cn('text-xs px-2.5 py-1 gap-1.5', tokens.radius.md),
  lg: cn('text-xs px-3 py-1.5 gap-2 font-bold', tokens.radius.lg),
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
        keyword && cn('px-2 py-0.5 font-black uppercase tracking-wider text-[10px]', tokens.radius.xs, tokens.shadow.micro),
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
        'inline-flex items-center font-mono font-black uppercase text-[10px] tracking-widest px-2.5 py-0.5 select-none',
        tokens.radius.xs,
        tokens.shadow.micro,
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

