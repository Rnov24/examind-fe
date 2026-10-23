import React from 'react'
import { PageTransition } from '@/components/system/PageTransition'

/**
 * Route-group template: marketing pages enter with the shared
 * transition. In-page motion (scroll reveals, the inquiry modal) keeps
 * its existing authored CSS animations — this only covers navigation.
 */
export default function MarketingTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <PageTransition>{children}</PageTransition>
}
