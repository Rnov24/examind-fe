import React from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

export type CardVariant = 'default' | 'subtle' | 'midnight' | 'paper' | 'elevated'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardAccent = 'none' | 'lime' | 'violet' | 'midnight' | 'emerald' | 'rose'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  accent?: CardAccent
  interactive?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: cn(tokens.surface.card, tokens.border.default, tokens.shadow.subtle, 'text-slate-900'),
  subtle: cn(tokens.surface.subtle, 'border border-[#ddd9ef] text-slate-900'),
  midnight: cn(tokens.surface.midnight, tokens.border.midnight, tokens.shadow.midnight, 'text-white'),
  paper: cn(tokens.surface.card, 'border border-[#ddd9ef]', tokens.shadow.card, 'text-slate-900'),
  elevated: cn(tokens.surface.card, tokens.border.default, tokens.shadow.elevated, 'text-slate-900'),
}

const accentBarStyles: Record<CardAccent, string> = {
  none: '',
  lime: cn(tokens.accentBarBase, tokens.semantic.lime.accentBar),
  violet: cn(tokens.accentBarBase, tokens.semantic.violet.accentBar),
  midnight: cn(tokens.accentBarBase, tokens.semantic.midnight.accentBar),
  emerald: cn(tokens.accentBarBase, tokens.semantic.emerald.accentBar),
  rose: cn(tokens.accentBarBase, tokens.semantic.rose.accentBar),
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: tokens.spacing.cardPaddingSm,
  md: tokens.spacing.cardPaddingMd,
  lg: tokens.spacing.cardPaddingLg,
}

export function Card({
  className,
  variant = 'default',
  padding = 'none',
  accent = 'none',
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        tokens.radius.xl,
        'relative overflow-hidden',
        tokens.transition.fast,
        variantStyles[variant],
        accentBarStyles[accent],
        paddingStyles[padding],
        interactive &&
          'hover:border-[#c9c2ec] hover:shadow-card hover:-translate-y-0.5 active:translate-y-0 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  borderless?: boolean
  eyebrow?: React.ReactNode
  badge?: React.ReactNode
  action?: React.ReactNode
}

export function CardHeader({
  className,
  borderless = false,
  eyebrow,
  badge,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 pb-4 flex items-start justify-between gap-4',
        !borderless && 'border-b border-[#e9e5f6]',
        className
      )}
      {...props}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {eyebrow && (
          <div className={cn(tokens.typography.eyebrow, 'mb-1')}>
            {eyebrow}
          </div>
        )}
        <div className="flex items-center gap-2">
          {children}
          {badge}
        </div>
      </div>
      {action && <div className="shrink-0 pt-0.5">{action}</div>}
    </div>
  )
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function CardTitle({
  className,
  as: Component = 'h3',
  children,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        tokens.typography.title,
        'leading-snug',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(tokens.typography.bodyMuted, 'mt-0.5', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(tokens.spacing.cardPaddingMd, className)} {...props}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  borderless?: boolean
}

export function CardFooter({
  className,
  borderless = false,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 pt-4 flex items-center justify-between gap-3 bg-[#faf9fd]',
        !borderless && 'border-t border-[#e9e5f6]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  accent?: CardAccent
  trend?: {
    value: string | number
    label?: string
    isPositive?: boolean
  }
}

export function StatCard({
  title,
  value,
  description,
  icon,
  badge,
  accent = 'none',
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white p-5 flex items-center gap-4 relative overflow-hidden',
        tokens.radius.xl,
        tokens.border.default,
        tokens.shadow.subtle,
        tokens.transition.fast,
        accentBarStyles[accent],
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn('w-11 h-11 bg-[#f1effa] text-[#6a5fc1] border border-[#ddd9ef] flex items-center justify-center font-bold shrink-0', tokens.radius.lg, tokens.shadow.micro)}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(tokens.typography.eyebrow, 'block')}>
            {title}
          </span>
          {badge}
        </div>
        <div className={cn(tokens.typography.hero, 'tabular-nums truncate block mt-0.5')}>
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span
                className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0.2',
                  tokens.radius.xs,
                  trend.isPositive !== false
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                )}
              >
                {trend.isPositive !== false ? '+' : ''}
                {trend.value}
              </span>
            )}
            {description && (
              <span className={cn(tokens.typography.caption, 'truncate')}>
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Card
