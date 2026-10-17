'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type ModalAccent = 'none' | 'lime' | 'violet' | 'midnight'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  size?: ModalSize
  accent?: ModalAccent
  preventBackdropClose?: boolean
  children: React.ReactNode
  className?: string
}

const modalSizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const modalAccentStyles: Record<ModalAccent, string> = {
  none: '',
  lime: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#c2ef4e] before:z-20',
  violet: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#6a5fc1] before:z-20',
  midnight: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#150f23] before:z-20',
}

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  accent = 'none',
  preventBackdropClose = false,
  children,
  className,
}: ModalProps) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
      }
    }

    // Lock body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (!preventBackdropClose && e.target === e.currentTarget) {
          onClose()
        }
      }}
      className="fixed inset-0 z-50 bg-[#150f23]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'bg-white border border-slate-200/90 rounded-2xl w-full shadow-2xl space-y-0 relative overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900 my-8',
          modalAccentStyles[accent],
          modalSizeStyles[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export interface ModalHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  onClose?: () => void
}

export function ModalHeader({
  title,
  description,
  icon,
  badge,
  onClose,
  className,
  children,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-slate-100 gap-4',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            {icon}
          </div>
        )}
        <div className="space-y-1 min-w-0 flex-1">
          {badge && <div className="mb-1">{badge}</div>}
          <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed font-sans">{description}</p>
          )}
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5fc1] shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export function ModalBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 sm:p-6 py-4 space-y-4 text-xs sm:text-sm font-sans', className)} {...props}>
      {children}
    </div>
  )
}

export function ModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 pt-4 flex items-center justify-end gap-3 bg-slate-50/60 border-t border-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Modal
