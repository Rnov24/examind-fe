'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user, isHydrated, hydrate, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
      return
    }

    if (!isAuthenticated() || !user) {
      router.replace('/login')
      return
    }

    if (user.role === 'superadmin') {
      router.replace('/superadmin/dashboard')
    } else if (user.role === 'admin') {
      router.replace('/admin/dashboard')
    } else if (user.role === 'student') {
      router.replace('/student/dashboard')
    } else {
      router.replace('/teacher/dashboard')
    }
  }, [isHydrated, user, router, hydrate, isAuthenticated])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping"></span>
        Mengarahkan ke dashboard...
      </div>
    </div>
  )
}
