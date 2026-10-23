import React from 'react'
import { PageTransition } from '@/components/system/PageTransition'

/**
 * Route-group template: remounts on every navigation inside the
 * dashboard group, giving each page the shared enter transition.
 * The exam-taking surface lives in the separate (exam) group on
 * purpose — it is deliberately NOT animated.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <PageTransition>{children}</PageTransition>
}
