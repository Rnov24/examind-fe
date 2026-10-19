import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  selectSize?: SelectSize
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
}

const selectSizeStyles: Record<SelectSize, string> = {
  sm: cn('h-8.5 pl-3 pr-8 text-xs', tokens.radius.lg),
  md: cn('h-10 pl-3.5 pr-9 text-xs sm:text-sm', tokens.radius.lg),
  lg: cn('h-12 pl-4 pr-10 text-sm sm:text-base', tokens.radius.lg),
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      selectSize = 'md',
      label,
      helperText,
      error,
      fullWidth = true,
      disabled,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-slate-700 tracking-tight font-sans"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full bg-slate-50/70 border border-slate-200 text-slate-900 font-sans tracking-tight font-semibold appearance-none cursor-pointer',
              tokens.transition.fast,
              'hover:border-slate-300 hover:bg-slate-50',
              'focus:bg-white focus:outline-none',
              tokens.border.focus,
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed',
              error &&
                'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/25',
              selectSizeStyles[selectSize],
              className
            )}
            {...props}
          >

            {children}
          </select>

          <div
            className="absolute right-3 pointer-events-none text-slate-400 flex items-center shrink-0"
            aria-hidden="true"
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-rose-600 tracking-tight font-sans mt-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 tracking-tight font-sans mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
