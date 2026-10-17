'use client'

import React, { useRef, useState, useEffect } from 'react'

interface InteractiveTiltCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  maxTilt?: number
  onClick?: () => void
}

export function InteractiveTiltCard({
  children,
  className = '',
  glowColor = 'rgba(106, 95, 193, 0.15)',
  maxTilt = 4,
  onClick,
}: InteractiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [isHovered, setIsHovered] = useState(false)
  const [canTilt, setCanTilt] = useState(true)

  useEffect(() => {
    // Check for reduced motion preference or touch device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (prefersReducedMotion || isTouch) {
      setCanTilt(false)
    }
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = ((y - centerY) / centerY) * -maxTilt
    const tiltY = ((x - centerX) / centerX) * maxTilt

    const mouseXPercent = (x / rect.width) * 100
    const mouseYPercent = (y / rect.height) * 100

    setStyle({
      transform: `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(4px)`,
      transition: 'transform 100ms ease-out',
      '--specular-x': `${mouseXPercent.toFixed(1)}%`,
      '--specular-y': `${mouseYPercent.toFixed(1)}%`,
    } as React.CSSProperties)
  }

  const handlePointerEnter = () => {
    if (!canTilt) return
    setIsHovered(true)
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
      '--specular-x': '50%',
      '--specular-y': '50%',
    } as React.CSSProperties)
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={style}
      className={`relative group transform-gpu will-change-transform ${className}`}
    >
      {/* Specular light highlight layer on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at var(--specular-x, 50%) var(--specular-y, 50%), ${glowColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  )
}
