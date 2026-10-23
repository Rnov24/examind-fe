'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import AuthGuard from '@/components/auth/AuthGuard'

const AIAssistantWidget = dynamic(() => import('@/components/AIAssistantWidget'), { ssr: false })

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboardRoute =
    pathname.startsWith('/superadmin/') ||
    pathname === '/analytics' ||
    pathname.startsWith('/analytics/') ||
    pathname.includes('/analytics')

  return (
    <AuthGuard>
      <div
        className={`min-h-screen text-[#1f1633] flex flex-col font-sans transition-colors bg-[#faf9fd]`}
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
