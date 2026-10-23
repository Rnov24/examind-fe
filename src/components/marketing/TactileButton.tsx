'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface TactileButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'lime' | 'inverted'
  className?: string
  showArrow?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function TactileButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  showArrow = false,
  type = 'button',
}: TactileButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 font-bold text-sm rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 select-none'

  const variantClasses = {
    primary:
      'bg-slate-900 text-white shadow-md hover:shadow-lg focus:ring-slate-900',
    secondary:
      'bg-white text-slate-800 border border-slate-300 shadow-xs hover:border-slate-400 hover:bg-slate-50 focus:ring-violet-500',
    lime:
      'bg-[#c2ef4e] text-slate-950 shadow-md hover:bg-[#b2e23b] focus:ring-lime-400 font-extrabold',
    inverted:
      'bg-white text-slate-950 shadow-md hover:bg-slate-100 focus:ring-white font-extrabold',
  }[variant]

  const sweepOverlay =
    variant === 'primary' ? (
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-700 to-slate-800 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"
        aria-hidden="true"
      />
    ) : variant === 'lime' ? (
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#d4f968] to-[#addc3b] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"
        aria-hidden="true"
      />
    ) : null

  const content = (
    <>
      {sweepOverlay}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {showArrow && (
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${variantClasses} ${className}`}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {content}
    </button>
  )
}
