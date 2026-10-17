import React, { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  inputSize?: InputSize
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  addonLeft?: React.ReactNode
  addonRight?: React.ReactNode
  fullWidth?: boolean
}

const inputSizeStyles: Record<InputSize, string> = {
  sm: 'h-8.5 px-3 text-xs rounded-xl',
  md: 'h-10 px-3.5 text-xs sm:text-sm rounded-xl',
  lg: 'h-12 px-4 text-sm sm:text-base rounded-xl',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputSize = 'md',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      addonLeft,
      addonRight,
      fullWidth = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-slate-700 tracking-tight font-sans"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {addonLeft && (
            <div className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono text-xs font-semibold select-none self-stretch">
              {addonLeft}
            </div>
          )}

          {leftIcon && (
            <div
              className={cn(
                'absolute flex items-center pointer-events-none text-slate-400 shrink-0',
                addonLeft ? 'left-12' : 'left-3.5'
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 font-sans tracking-tight',
              'transition-all duration-150',
              'hover:border-slate-300 hover:bg-slate-50',
              'focus:bg-white focus:outline-none focus:border-[#150f23] focus:ring-2 focus:ring-[#6a5fc1]/25',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed',
              leftIcon && (addonLeft ? 'pl-16' : 'pl-10'),
              rightIcon && (addonRight ? 'pr-16' : 'pr-10'),
              addonLeft && 'rounded-l-none',
              addonRight && 'rounded-r-none',
              error &&
                'border-rose-300 bg-rose-50/30 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/25',
              inputSizeStyles[inputSize],
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                'absolute flex items-center text-slate-400 shrink-0',
                addonRight ? 'right-12' : 'right-3.5'
              )}
            >
              {rightIcon}
            </div>
          )}

          {addonRight && (
            <div className="inline-flex items-center px-3 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-slate-500 font-mono text-xs font-semibold select-none self-stretch">
              {addonRight}
            </div>
          )}
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

Input.displayName = 'Input'

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, className, ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0)

    return (
      <Input
        ref={ref}
        value={value}
        leftIcon={<Search className="w-4 h-4 text-slate-400" aria-hidden="true" />}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Bersihkan pencarian"
              className="p-1 hover:text-slate-700 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/30"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = true,
      disabled,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-bold text-slate-700 tracking-tight font-sans"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full p-3.5 bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 font-sans tracking-tight rounded-xl',
            'transition-all duration-150 resize-y',
            'hover:border-slate-300 hover:bg-slate-50',
            'focus:bg-white focus:outline-none focus:border-[#150f23] focus:ring-2 focus:ring-[#6a5fc1]/25',
            'disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed',
            error &&
              'border-rose-300 bg-rose-50/30 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/25',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea'

export default Input
