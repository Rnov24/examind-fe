'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import AIAssistantWidget from '@/components/AIAssistantWidget'
import AuthGuard from '@/components/auth/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboardRoute = pathname === '/superadmin/dashboard'

  return (
    <AuthGuard>
      <div
        className={`min-h-screen text-slate-900 flex flex-col font-sans transition-colors ${
          isDashboardRoute ? 'bg-[#f4f5f8]' : 'bg-slate-50'
        }`}
      >
        {!isDashboardRoute && <Navbar />}
        <div className="flex-1 flex flex-row min-w-0">
          <Sidebar />
          <main
            className={`flex-1 overflow-y-auto min-w-0 ${
              isDashboardRoute
                ? 'p-3 sm:p-5 md:p-6 max-w-[1600px] w-full mx-auto'
                : 'p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto'
            }`}
          >
            {children}
          </main>
        </div>
        <AIAssistantWidget />
      </div>
    </AuthGuard>
  )
}
