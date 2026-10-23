'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Array<'superadmin' | 'admin' | 'teacher' | 'student'>
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, isHydrated, hydrate } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
      return
    }

    if (!token || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard
        if (user.role === 'superadmin') router.replace('/superadmin/dashboard')
        else if (user.role === 'admin') router.replace('/admin/dashboard')
        else if (user.role === 'student') router.replace('/student/dashboard')
        else router.replace('/teacher/dashboard')
        return
      }
    }

    setChecking(false)
  }, [isHydrated, token, user, pathname, allowedRoles, router, hydrate])

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ExamindLogo variant="symbol" theme="color" className="h-10 w-auto" priority />
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping"></span>
            Memverifikasi sesi...
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
