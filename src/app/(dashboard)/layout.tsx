'use client'

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import AIAssistantWidget from '@/components/AIAssistantWidget'
import AuthGuard from '@/components/auth/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-row min-w-0">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
        <AIAssistantWidget />
      </div>
    </AuthGuard>
  )
}
