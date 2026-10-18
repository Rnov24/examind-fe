import React from 'react'
import Image, { type ImageProps } from 'next/image'

export type ExamindLogoVariant = 'symbol' | 'lockup' | 'stacked'
export type ExamindLogoTheme = 'color' | 'white' | 'violet'

export interface ExamindLogoProps extends Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> {
  variant?: ExamindLogoVariant
  theme?: ExamindLogoTheme
  className?: string
  alt?: string
  priority?: boolean
}

interface AssetConfig {
  src: string
  width: number
  height: number
}

const ASSET_MAP: Record<ExamindLogoVariant, Record<ExamindLogoTheme, AssetConfig>> = {
  symbol: {
    color: { src: '/brand/examind-symbol-color.svg', width: 176, height: 208 },
    white: { src: '/brand/examind-symbol-white.svg', width: 176, height: 208 },
    violet: { src: '/brand/examind-symbol-violet.svg', width: 176, height: 208 },
  },
  lockup: {
    color: { src: '/brand/examind-lockup-horizontal-color.svg', width: 735, height: 208 },
    white: { src: '/brand/examind-lockup-horizontal-white.svg', width: 735, height: 208 },
    // Horizontal lockup does not have a separate violet SVG; falls back to color
    violet: { src: '/brand/examind-lockup-horizontal-color.svg', width: 735, height: 208 },
  },
  stacked: {
    color: { src: '/brand/examind-lockup-stacked-color.svg', width: 366, height: 316 },
    // Stacked lockup does not have white/violet SVGs; falls back to color
    white: { src: '/brand/examind-lockup-stacked-color.svg', width: 366, height: 316 },
    violet: { src: '/brand/examind-lockup-stacked-color.svg', width: 366, height: 316 },
  },
}

export function ExamindLogo({
  variant = 'lockup',
  theme = 'color',
  className = '',
  alt,
  priority = false,
  ...rest
}: ExamindLogoProps) {
  const asset = ASSET_MAP[variant]?.[theme] ?? ASSET_MAP.lockup.color
  const defaultAlt =
    variant === 'symbol'
      ? 'EXAMIND symbol'
      : variant === 'stacked'
      ? 'EXAMIND stacked logo'
      : 'EXAMIND logo'

  return (
    <Image
      src={asset.src}
      alt={alt ?? defaultAlt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      unoptimized
      className={`select-none ${className}`}
      {...rest}
    />
  )
}

export default ExamindLogo
