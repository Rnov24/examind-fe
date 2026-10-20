import React from 'react'

/**
 * Seamless wave divider rendered at the bottom edge of a section.
 *
 * The SVG sits absolutely over the bottom of its parent section (which must be
 * `relative`). The area above the wave curve is transparent, so the parent
 * section's own background shows through; the wave path fills down to the
 * bottom edge with `fill`, which MUST exactly equal the background color of
 * the section that follows. That makes the transition a smooth curve with no
 * border line and no color leak.
 *
 * `accentFill` optionally draws a second, slightly higher wave behind the main
 * one, leaving a thin crescent of the accent color visible — used for the
 * white -> white transition (hero -> peran) where a single wave would be
 * invisible.
 *
 * Seam safety: the container is pulled 2px past the parent section's bottom
 * edge (-bottom-[2px]) and made 4px taller to compensate, so the wave's fill
 * band extends 2px into the following section. Without that overlap, a
 * fractional-pixel rounding gap between the section's bottom edge and the
 * SVG's last painted row lets the page background peek through as a 1px
 * hairline — most visible against the dark proctoring section.
 */
export function SectionDivider({
  fill,
  accentFill,
  variant = 'a',
  className = '',
}: {
  /** Background color of the FOLLOWING section. */
  fill: string
  /** Optional subtle crescent color drawn behind the main wave. */
  accentFill?: string
  variant?: 'a' | 'b'
  className?: string
}) {
  const mainPath =
    variant === 'a'
      ? 'M0,64 C240,96 480,16 720,40 C960,64 1200,24 1440,56 L1440,100 L0,100 Z'
      : 'M0,40 C260,8 520,88 780,64 C1040,40 1240,72 1440,36 L1440,100 L0,100 Z'

  const accentPath =
    variant === 'a'
      ? 'M0,50 C240,82 480,6 720,28 C960,50 1200,12 1440,42 L1440,100 L0,100 Z'
      : 'M0,28 C260,0 520,74 780,52 C1040,30 1240,58 1440,24 L1440,100 L0,100 Z'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 -bottom-[2px] z-0 h-[60px] sm:h-[68px] lg:h-[84px] ${className}`}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        shapeRendering="geometricPrecision"
        className="block h-full w-full"
        focusable="false"
      >
        {accentFill ? <path d={accentPath} fill={accentFill} /> : null}
        <path d={mainPath} fill={fill} />
      </svg>
    </div>
  )
}
