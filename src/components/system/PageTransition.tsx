'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig, motion, type Variants } from 'motion/react'

/**
 * Shared motion system (T7) — Emil Kowalski principles:
 * - UI motion stays in the 150–400ms band and always eases OUT
 *   (cubic-bezier(0.22, 1, 0.36, 1)) so interfaces feel responsive,
 *   never cinematic.
 * - Only `transform` and `opacity` are animated — never layout
 *   properties (width/height/top/left), which drop frames.
 * - `MotionConfig reducedMotion="user"` (mounted by PageTransition)
 *   makes every motion component honor `prefers-reduced-motion`:
 *   transform-based movement is disabled for users who ask for it.
 */
export const EMIL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const PAGE_TRANSITION_DURATION = 0.25

/**
 * Enter-only route transition for App Router route groups. Mounted via
 * `template.tsx`, which remounts on every navigation — the wrapper is
 * keyed by pathname so each new route fades/rises in exactly once.
 * Exit animations are intentionally NOT attempted: App Router templates
 * unmount the old page immediately, so an exit would never be seen.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: PAGE_TRANSITION_DURATION, ease: EMIL_EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

const staggerParentVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EMIL_EASE },
  },
}

/**
 * First-mount stagger container for dashboard cards/sections. Children
 * wrapped in <StaggerItem> rise in with a 50ms cascade. Variants
 * propagate through fragments and conditional wrappers, and items that
 * mount later (e.g. after data loads) still animate from hidden→show.
 * Animates on mount only — it never re-runs on re-renders.
 */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParentVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={staggerChildVariants}>
      {children}
    </motion.div>
  )
}
