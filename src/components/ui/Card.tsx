import React from 'react'
import { cn } from '@/lib/utils'

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
  default: 'bg-white border border-slate-200/90 shadow-xs text-slate-900',
  subtle: 'bg-slate-50/70 border border-slate-200/70 text-slate-900',
  midnight: 'bg-[#150f23] border border-[#362d59] shadow-midnight-elevated text-white',
  paper: 'bg-white border border-slate-200 shadow-card text-slate-900',
  elevated: 'bg-white border border-slate-200/80 shadow-subtle-elevated text-slate-900',
}

const accentBarStyles: Record<CardAccent, string> = {
  none: '',
  lime: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#c2ef4e] before:z-10',
  violet: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#6a5fc1] before:z-10',
  midnight: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#150f23] before:z-10',
  emerald: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#10b981] before:z-10',
  rose: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#e11d48] before:z-10',
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
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
        'rounded-2xl relative overflow-hidden transition-all duration-150',
        variantStyles[variant],
        accentBarStyles[accent],
        paddingStyles[padding],
        interactive &&
          'hover:border-slate-300 hover:shadow-card hover:-translate-y-0.5 active:translate-y-0 cursor-pointer',
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
        !borderless && 'border-b border-slate-100',
        className
      )}
      {...props}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {eyebrow && (
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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
        'font-display font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-snug',
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
      className={cn('text-xs sm:text-sm text-slate-500 font-sans leading-relaxed mt-0.5', className)}
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
    <div className={cn('p-5 sm:p-6', className)} {...props}>
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
        'p-5 sm:p-6 pt-4 flex items-center justify-between gap-3 bg-slate-50/40',
        !borderless && 'border-t border-slate-100',
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
        'bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4 transition-all duration-150 relative overflow-hidden',
        accentBarStyles[accent],
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">
            {title}
          </span>
          {badge}
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display tabular-nums tracking-tight truncate block mt-0.5">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span
                className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded',
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
              <span className="text-[11px] text-slate-500 truncate">
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
