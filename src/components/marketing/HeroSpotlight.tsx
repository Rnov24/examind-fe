'use client'

import React, { useRef, useEffect, useState } from 'react'

interface HeroSpotlightProps {
  children: React.ReactNode
  className?: string
}

export function HeroSpotlight({ children, className = '' }: HeroSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const container = containerRef.current
    if (!container) return

    let rafId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top
      if (!coords.active) {
        setCoords((prev) => ({ ...prev, active: true }))
      }
    }

    const handlePointerLeave = () => {
      setCoords((prev) => ({ ...prev, active: false }))
    }

    const animate = () => {
      // Smooth lerp interpolation for silky motion
      currentX += (targetX - currentX) * 0.15
      currentY += (targetY - currentY) * 0.15

      container.style.setProperty('--spotlight-x', `${currentX.toFixed(1)}px`)
      container.style.setProperty('--spotlight-y', `${currentY.toFixed(1)}px`)

      rafId = requestAnimationFrame(animate)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', handlePointerLeave)
    rafId = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
      cancelAnimationFrame(rafId)
    }
  }, [coords.active])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          '--spotlight-x': '50%',
          '--spotlight-y': '30%',
        } as React.CSSProperties
      }
    >
      {/* Ambient cursor-following spotlight wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ease-out"
        style={{
          opacity: coords.active ? 1 : 0.6,
          background: `
            radial-gradient(
              650px circle at var(--spotlight-x, 50%) var(--spotlight-y, 30%),
              rgba(194, 239, 78, 0.08) 0%,
              rgba(106, 95, 193, 0.07) 35%,
              transparent 70%
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Subtle institutional contour watermark circles */}
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] w-[580px] h-[580px] rounded-full border border-indigo-200/40 opacity-30 blur-[0.5px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 right-[-18%] w-[820px] h-[820px] rounded-full border border-indigo-100/30 opacity-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-[-15%] w-[640px] h-[640px] rounded-full border border-lime-200/30 opacity-25"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
