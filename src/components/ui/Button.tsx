import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'inverted'
  | 'ghost'
  | 'destructive'
  | 'lime'
  | 'violet'
  | 'outline'

export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-md'
  | 'icon-lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

/**
 * EXAMIND Institutional Button Variant Matrix
 * Strict adherence to DESIGN.md Two-Polarity Canvas:
 * - primary: Midnight-Violet (#150f23) with precision hairline border
 * - secondary: Daylight-White with slate hairline and crisp hover state
 * - lime: Electric Highlighter (#c2ef4e) with high-contrast text and signature glow
 * - violet: Pedagogical AI Accent (#6a5fc1)
 * - destructive: Incident Red (#e11d48 / rose)
 * - inverted: Daylight-White on Midnight canvas with Lime focus ring
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#150f23] text-white border border-[#2a1e47] shadow-xs hover:bg-[#1f1633] hover:border-[#3d2c63] hover:shadow-card active:bg-[#150f23] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  secondary:
    'bg-white text-slate-800 border border-slate-200/90 shadow-xs hover:bg-slate-50/90 hover:text-slate-950 hover:border-slate-300 hover:shadow-xs active:bg-slate-100 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  lime:
    'bg-[#c2ef4e] text-[#150f23] border border-[#a8dc2c] font-black hover:bg-[#b5e640] hover:shadow-glow-lime active:bg-[#a0d426] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#150f23] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  violet:
    'bg-[#6a5fc1] text-white border border-[#584dae] shadow-xs hover:bg-[#5b50b3] hover:shadow-glow-indigo active:bg-[#4f44a4] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  destructive:
    'bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs hover:bg-rose-100 hover:text-rose-900 hover:border-rose-300 active:bg-rose-200/80 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  inverted:
    'bg-white text-[#150f23] border border-white/90 shadow-xs hover:bg-slate-100 hover:text-slate-950 hover:shadow-card active:bg-slate-200 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#c2ef4e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150f23]',
  ghost:
    'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-200/70 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#6a5fc1]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  outline:
    'bg-transparent text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:bg-slate-100 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
}

/**
 * Height & Padding Scale:
 * xs: 28px height, 10px px, 11px font
 * sm: 34px height, 14px px, 12px font
 * md: 40px height, 16px px, 13/14px font
 * lg: 48px height, 20px px, 14/15px font
 */
const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] font-bold rounded-lg gap-1.5',
  sm: 'h-8.5 px-3.5 text-xs font-bold rounded-xl gap-2',
  md: 'h-10 px-4 text-xs sm:text-sm font-bold rounded-xl gap-2',
  lg: 'h-12 px-5 text-sm sm:text-base font-extrabold rounded-xl gap-2.5',
  'icon-xs': 'h-7 w-7 p-0 rounded-lg justify-center',
  'icon-sm': 'h-8.5 w-8.5 p-0 rounded-xl justify-center',
  'icon-md': 'h-10 w-10 p-0 rounded-xl justify-center',
  'icon-lg': 'h-12 w-12 p-0 rounded-xl justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isIconButton = size.startsWith('icon-')

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 ease-out select-none cursor-pointer',
          'focus-visible:outline-none',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
            {!isIconButton && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
