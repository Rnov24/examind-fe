'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HelpCircle,
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  FileText,
  ShieldCheck,
  TrendingUp,
  Coins,
  Cpu,
  Activity,
  Video,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { RibbonNavItem } from './types'
import api from '@/lib/api'
import { fetchCachedExamsList } from '@/lib/bentoCache'
import { HelpModal } from './HelpModal'

interface RibbonProps {
  items?: RibbonNavItem[]
  className?: string
}

export function Ribbon({ items, className = '' }: RibbonProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const isSuperAdmin = user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student' || (!isSuperAdmin && !isAdmin && !isTeacher)

  const [helpOpen, setHelpOpen] = useState(false)
  // Exam links resolve to a REAL exam from the API; until (or unless) one is
  // found they point at the list/overview pages — never a fabricated id.
  const [monitorHref, setMonitorHref] = useState('/exams')
  const [studentExamHref, setStudentExamHref] = useState('/student/dashboard')
  const [studentResultHref, setStudentResultHref] = useState('/student/dashboard')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (isSuperAdmin || isAdmin) {
          const exams = await fetchCachedExamsList<any>()
          if (cancelled) return
          const pick =
            exams.find((e: any) => e.status === 'in_progress') ||
            exams.find((e: any) => e.status === 'published') ||
            exams[0]
          if (pick?.id) setMonitorHref(`/exams/${pick.id}/monitor`)
        } else if (isStudent) {
          const [activeRes, examsRes] = await Promise.allSettled([
            api.get('/student/exams/active'),
            fetchCachedExamsList<any>(),
          ])
          if (cancelled) return
          if (activeRes.status === 'fulfilled') {
            const active = activeRes.value.data?.data || []
            if (active[0]?.id) setStudentExamHref(`/student/exam/${active[0].id}`)
          }
          if (examsRes.status === 'fulfilled') {
            const completed = examsRes.value.find((e: any) => e.status === 'completed')
            if (completed?.id) setStudentResultHref(`/student/exam/${completed.id}/result`)
          }
        }
      } catch {
        // Keep the list-page fallbacks.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isSuperAdmin, isAdmin, isStudent])

  // Default items based on current role if not explicitly provided
  const navItems: RibbonNavItem[] =
    items ||
    (() => {
      if (isSuperAdmin) {
        return [
          { id: 'dashboard', label: 'Dashboard Utama', href: '/superadmin/dashboard', icon: LayoutDashboard },
          { id: 'tenants', label: 'Sekolah & Institusi', href: '/superadmin/tenants', icon: Building2 },
          { id: 'admin-portal', label: 'Portal Admin', href: '/admin/dashboard', icon: ShieldCheck },
          { id: 'finance', label: 'Keuangan & Tagihan', href: '/superadmin/finance', icon: TrendingUp },
          { id: 'pricing', label: 'Harga Layanan & Kuota', href: '/superadmin/pricing', icon: Coins },
          { id: 'secrets', label: 'Kunci API & Keamanan', href: '/superadmin/secrets', icon: Cpu },
          { id: 'analytics', label: 'Audit & Telemetri Nilai', href: '/analytics', icon: BarChart3 },
          { id: 'monitor', label: 'Monitor Proctoring Live', href: monitorHref, icon: Activity },
        ]
      }
      if (isAdmin) {
        return [
          { id: 'dashboard', label: 'Dashboard Admin', href: '/admin/dashboard', icon: LayoutDashboard },
          { id: 'classes', label: 'Manajemen Kelas', href: '/classes', icon: Users },
          { id: 'questions', label: 'Bank Soal CBT', href: '/questions', icon: BookOpen },
          { id: 'exams', label: 'Jadwal Ujian', href: '/exams', icon: FileSpreadsheet },
          { id: 'monitor', label: 'Proctoring Live', href: monitorHref, icon: Video },
          { id: 'analytics', label: 'Rekap Nilai', href: '/analytics', icon: BarChart3 },
        ]
      }
      if (isTeacher) {
        return [
          { id: 'dashboard', label: 'Dashboard Guru', href: '/teacher/dashboard', icon: LayoutDashboard },
          { id: 'classes', label: 'Kelas Saya', href: '/classes', icon: Users },
          { id: 'questions', label: 'Bank Soal', href: '/questions', icon: BookOpen },
          { id: 'exams', label: 'Jadwal Ujian', href: '/exams', icon: FileSpreadsheet },
          { id: 'grading', label: 'Koreksi Esai AI', href: '/grading', icon: CheckCircle2 },
          { id: 'analytics', label: 'Analisis Soal', href: '/analytics', icon: BarChart3 },
        ]
      }
      return [
        { id: 'dashboard', label: 'Dashboard Siswa', href: '/student/dashboard', icon: LayoutDashboard },
        { id: 'exam', label: 'Ujian Aktif', href: studentExamHref, icon: FileText },
        { id: 'result', label: 'Pembahasan Soal', href: studentResultHref, icon: Sparkles },
        { id: 'companion', label: 'Kamera HP Pengawas', href: '/companion', icon: Smartphone },
      ]
    })()

  const isActive = (href: string): boolean => {
    if (pathname === href) return true
    if (
      href !== '/' &&
      href !== '/dashboard' &&
      href !== '/superadmin/dashboard' &&
      href !== '/admin/dashboard' &&
      href !== '/teacher/dashboard' &&
      href !== '/student/dashboard'
    ) {
      return pathname.startsWith(href)
    }
    return false
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside
      aria-label="Navigasi Ribbon Utama"
      className={cn(
        tokens.surface.card,
        tokens.radius.full,
        tokens.border.default,
        tokens.shadow.card,
        'py-4 px-2 w-16 md:w-[68px] flex flex-col items-center justify-between select-none shrink-0',
        className
      )}
    >
      {/* Top: Logo Mark */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Logo Mark Link */}
        <Link
          href="/dashboard"
          className={cn(
            'relative group p-1.5 hover:bg-slate-100 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]',
            tokens.radius.full
          )}
          aria-label="Kembali ke Dashboard Utama EXAMIND"
        >
          <ExamindLogo variant="symbol" theme="color" className="w-8 h-8 object-contain shrink-0" priority />
          {/* Tooltip */}
          <div className={cn('absolute left-full ml-3 px-2.5 py-1 bg-[#150f23] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans', tokens.radius.md)}>
            EXAMIND CBT
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#150f23]" />
          </div>
        </Link>


        {/* Subtle separator */}
        <div className="w-8 h-px bg-[#e3dff5] my-1" aria-hidden="true" />
      </div>

      {/* Center: Navigation Icon Buttons */}
      <nav className="flex flex-col items-center gap-1.5 w-full my-auto py-2" aria-label="Menu Ikon Utama">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <div key={item.id} className="relative group flex items-center justify-center">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  active
                    ? 'bg-[#150f23] text-[#c2ef4e] shadow-sm ring-1 ring-slate-800'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-[#f1effa]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${
                    active ? 'text-[#c2ef4e]' : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                  aria-hidden="true"
                />
              </Link>

              {/* Floating Tooltip */}
              <div
                role="tooltip"
                className="absolute left-full ml-3 px-2.5 py-1 bg-[#150f23] text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans tracking-tight"
              >
                {item.label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#150f23]" />
              </div>
            </div>
          )
        })}
      </nav>

      {/* Bottom: Help & Logout pinned */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-1">
        {/* Subtle separator */}
        <div className="w-8 h-px bg-[#e3dff5] my-1" aria-hidden="true" />

        {/* Help Button */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            title="Bantuan & Dokumentasi"
            aria-label="Bantuan & Dokumentasi"
            onClick={() => setHelpOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
          </button>
          <div
            role="tooltip"
            className="absolute left-full ml-3 px-2.5 py-1 bg-[#150f23] text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans"
          >
            Bantuan & Panduan
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#150f23]" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari Akun"
            aria-label="Keluar dari Akun"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
          </button>
          <div
            role="tooltip"
            className="absolute left-full ml-3 px-2.5 py-1 bg-rose-950 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans"
          >
            Keluar dari Akun
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rose-950" />
          </div>
        </div>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </aside>
  )
}

export default Ribbon
