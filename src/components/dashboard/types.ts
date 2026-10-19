import React from 'react'

export interface NavTabItem {
  id: string
  label: string
  href?: string
  badge?: string | number
  onClick?: () => void
}

export interface RibbonNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface StatTrend {
  value: string
  positive?: boolean
  label?: string
}
