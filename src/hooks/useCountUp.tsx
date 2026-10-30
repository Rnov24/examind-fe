'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseCountUpOptions {
  duration?: number
  delay?: number
  decimals?: number
  formatAsIDR?: boolean
  startOnView?: boolean
  threshold?: number
}

export interface UseCountUpReturn {
  value: number
  displayValue: string
  ref: (node: HTMLElement | null) => void
  isAnimating: boolean
  isSettled: boolean
  justTickedThousand: boolean
}

/**
 * Standard IDR formatter: Indonesian currency format without decimals.
 */
export function formatIDR(val: number): string {
  const numeric = typeof val === 'number' && !isNaN(val) ? Math.round(val) : 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numeric)
}

/**
 * easeOutExpo easing function:
 * Rapid acceleration that decelerates asymptotically to a dead stop.
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Custom hook to animate numeric & monetary values from 0 to target.
 * - Uses requestAnimationFrame with easeOutExpo.
 * - Respects prefers-reduced-motion.
 * - Animates when scrolled into view or when data first arrives.
 * - Does not re-animate on routine component re-renders.
 */
export function useCountUp(
  target: number | undefined | null,
  duration = 1200,
  options: UseCountUpOptions = {}
): UseCountUpReturn {
  const {
    delay = 0,
    decimals = 0,
    formatAsIDR = true,
    startOnView = true,
    threshold = 0.15,
  } = options

  const [currentVal, setCurrentVal] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [isSettled, setIsSettled] = useState<boolean>(false)
  const [justTickedThousand, setJustTickedThousand] = useState<boolean>(false)

  const inViewRef = useRef<boolean>(!startOnView)
  const hasAnimatedRef = useRef<boolean>(false)
  const lastTargetRef = useRef<number | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastThousandRef = useRef<number>(0)
  const currentValRef = useRef<number>(0)

  currentValRef.current = currentVal

  const triggerThousandTick = useCallback(() => {
    setJustTickedThousand(true)
    if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current)
    tickTimeoutRef.current = setTimeout(() => {
      setJustTickedThousand(false)
    }, 80)
  }, [])

  const runAnimation = useCallback(
    (fromVal: number, toVal: number) => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current)

      // Respect prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion || duration <= 0) {
        setCurrentVal(toVal)
        setIsAnimating(false)
        setIsSettled(true)
        return
      }

      setIsAnimating(true)
      setIsSettled(false)

      const startRaf = () => {
        let startTime: number | null = null
        lastThousandRef.current = Math.floor(fromVal / 1000)

        const frame = (timestamp: number) => {
          if (!startTime) startTime = timestamp
          const elapsed = timestamp - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeOutExpo(progress)
          const nextVal = fromVal + (toVal - fromVal) * eased

          // Detect crossing thousands boundary
          const currentThousand = Math.floor(nextVal / 1000)
          if (currentThousand !== lastThousandRef.current) {
            lastThousandRef.current = currentThousand
            triggerThousandTick()
          }

          if (progress < 1) {
            setCurrentVal(nextVal)
            rafIdRef.current = requestAnimationFrame(frame)
          } else {
            setCurrentVal(toVal)
            setIsAnimating(false)
            setIsSettled(true)
            setJustTickedThousand(false)
          }
        }

        rafIdRef.current = requestAnimationFrame(frame)
      }

      if (delay > 0) {
        delayTimeoutRef.current = setTimeout(startRaf, delay)
      } else {
        startRaf()
      }
    },
    [delay, duration, triggerThousandTick]
  )

  // Intersection observer callback
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node || !startOnView || inViewRef.current) return

      if (typeof IntersectionObserver === 'undefined') {
        inViewRef.current = true
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry?.isIntersecting) {
            inViewRef.current = true
            observer.disconnect()
            observerRef.current = null

            if (target !== undefined && target !== null && !hasAnimatedRef.current) {
              hasAnimatedRef.current = true
              lastTargetRef.current = target
              runAnimation(0, target)
            }
          }
        },
        { threshold }
      )

      observerRef.current = observer
      observer.observe(node)
    },
    [startOnView, threshold, target, runAnimation]
  )

  useEffect(() => {
    if (target === undefined || target === null) return

    // Animate only if target has changed from what was previously animated
    if (lastTargetRef.current !== target) {
      const from = hasAnimatedRef.current ? currentValRef.current : 0

      if (inViewRef.current || !startOnView) {
        hasAnimatedRef.current = true
        lastTargetRef.current = target
        runAnimation(from, target)
      }
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current)
      if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [target, startOnView, runAnimation])

  const displayValue = formatAsIDR
    ? formatIDR(currentVal)
    : decimals > 0
    ? currentVal.toFixed(decimals)
    : Math.round(currentVal).toLocaleString('id-ID')

  return {
    value: currentVal,
    displayValue,
    ref: setRef,
    isAnimating,
    isSettled,
    justTickedThousand,
  }
}

export interface MoneyCountUpProps {
  value: number | undefined | null
  duration?: number
  delay?: number
  className?: string
  showLimeTick?: boolean
}

export function MoneyCountUp({
  value = 0,
  duration = 1000,
  delay = 0,
  className = '',
  showLimeTick = true,
}: MoneyCountUpProps) {
  const numericTarget = typeof value === 'number' && !isNaN(value) ? value : 0
  const { displayValue, ref, isAnimating, justTickedThousand } = useCountUp(
    numericTarget,
    duration,
    { delay, formatAsIDR: true, startOnView: true }
  )

  return (
    <span
      ref={ref}
      className={`inline-flex items-baseline gap-1.5 tabular-nums ${className}`}
    >
      <span>{displayValue}</span>
      {showLimeTick && (
        <span
          aria-hidden="true"
          className={`inline-block w-1.5 h-1.5 rounded-full transition-[color,background-color,border-color,transform] duration-75 shrink-0 ${
            isAnimating
              ? justTickedThousand
                ? 'bg-[#c2ef4e] scale-125 shadow-[0_0_6px_#c2ef4e]'
                : 'bg-[#c2ef4e]/30 scale-90'
              : 'opacity-0 scale-50'
          }`}
        />
      )}
    </span>
  )
}

