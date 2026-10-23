import React from 'react'
import { PageTransition } from '@/components/system/PageTransition'

/**
 * Route-group template: login/register/forgot-password arrive with the
 * shared enter transition, and the post-login redirect lands on a
 * dashboard that enters through the same system.
 */
export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <PageTransition>{children}</PageTransition>
}
