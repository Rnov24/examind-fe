'use client'

import React from 'react'

interface WatermarkTypographyProps {
  text: string
  position?: 'left' | 'right' | 'center'
  className?: string
}

export function WatermarkTypography({
  text,
  position = 'right',
  className = '',
}: WatermarkTypographyProps) {
  const positionClasses = {
    left: '-left-8 sm:-left-16 text-left',
    right: '-right-8 sm:-right-16 text-right',
    center: 'left-1/2 -translate-x-1/2 text-center',
  }[position]

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none overflow-hidden uppercase font-black tracking-tighter leading-none text-slate-900/[0.03] text-7xl sm:text-8xl md:text-9xl lg:text-[14rem] z-0 ${positionClasses} ${className}`}
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {text}
    </div>
  )
}
