import React from 'react'
import AuthGuard from '@/components/auth/AuthGuard'

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['student', 'admin', 'teacher', 'superadmin']}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {children}
      </div>
    </AuthGuard>
  )
}
