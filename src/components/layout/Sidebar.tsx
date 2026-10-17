'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  FileText,
  ShieldCheck,
  Key,
  Sparkles,
  Video,
  Smartphone,
  Database,
  PlusCircle,
  Activity,
  Cpu,
  TrendingUp,
  Coins,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, initSidebar } = useUiStore()

  // Initialize sidebar on first mount (guard for SSR: defaults to true on server, adapts on client)
  useEffect(() => {
    initSidebar()

    const mql = window.matchMedia('(min-width: 768px)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSidebarOpen(e.matches)
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [initSidebar, setSidebarOpen])

  // Close drawer on Escape key (mobile only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setSidebarOpen(false)
          document.getElementById('sidebar-toggle-btn')?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, setSidebarOpen])

  const isSuperAdmin = user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student' || (!isSuperAdmin && !isAdmin && !isTeacher)

  // Strict, non-overlapping active detection to avoid multiple items being lit up
  const isActive = (path: string): boolean => {
    // Exact match
    if (pathname === path) return true

    // Sub-route matching (e.g. /classes/1 matches /classes, /questions/2 matches /questions)
    // Avoid marking parent active if current route has its own dedicated link
    if (
      path !== '/' &&
      path !== '/dashboard' &&
      path !== '/superadmin/dashboard' &&
      path !== '/admin/dashboard' &&
      path !== '/teacher/dashboard' &&
      path !== '/student/dashboard'
    ) {
      if (path === '/exams' && (pathname === '/exams/create' || pathname.includes('/monitor'))) {
        return false
      }
      if (path === '/student/exam/1' && pathname.includes('/result')) {
        return false
      }
      if (path === '/grading' && pathname.startsWith('/grading/')) {
        return true
      }
      return pathname.startsWith(path + '/')
    }
    return false
  }

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const renderLink = (
    href: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => {
    const active = isActive(href)
    const isCollapsed = !sidebarOpen

    return (
      <Link
        key={href}
        href={href}
        onClick={handleNavClick}
        title={label}
        aria-label={label}
        className={`group flex items-center ${
          isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
        } py-2.5 rounded-xl text-xs transition-all relative ${
          active
            ? 'bg-slate-900 text-white font-semibold shadow-card ring-1 ring-slate-800'
            : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-medium'
        }`}
      >
        {isCollapsed ? (
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              active ? 'text-[#c2ef4e]' : 'text-slate-500 group-hover:text-slate-800'
            }`}
            aria-hidden="true"
          />
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon
              className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                active ? 'text-[#c2ef4e]' : 'text-slate-500 group-hover:text-slate-800'
              }`}
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
          </div>
        )}
      </Link>
    )
  }

  const renderSectionHeader = (title: string) => {
    if (!sidebarOpen) return null

    return (
      <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
        <span>{title}</span>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden motion-reduce:transition-none ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Main Sidebar Navigation / Overlay Drawer */}
      <aside
        id="sidebar-nav"
        aria-label="Menu Navigasi Utama"
        className={`fixed md:sticky top-0 md:top-16 inset-y-0 md:inset-y-auto left-0 md:left-auto z-40 md:z-20 shrink-0 border-r border-slate-200/80 bg-white md:bg-white/85 backdrop-blur-md flex flex-col justify-between h-full md:h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden text-slate-800 select-none shadow-2xl md:shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none max-w-[calc(100vw-3rem)] md:max-w-none ${
          sidebarOpen
            ? 'w-72 md:w-72 translate-x-0 p-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-3.5'
            : '-translate-x-full md:translate-x-0 w-72 md:w-[76px] pointer-events-none md:pointer-events-auto p-3.5 md:px-2.5 md:py-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-3.5'
        }`}
      >
        <div className="space-y-4">
          {/* Role Specific Navigation */}
          <nav className="space-y-1">
            {/* ==================== SUPERADMIN NAVIGATION ==================== */}
            {isSuperAdmin && (
              <>
                {renderSectionHeader('Menu Utama')}
                {renderLink('/superadmin/dashboard', 'Dashboard', LayoutDashboard)}
                {renderLink('/superadmin/tenants', 'Sekolah', Building2)}
                {renderLink('/admin/dashboard', 'Portal Admin', ShieldCheck)}

                {renderSectionHeader('Keuangan')}
                {renderLink('/superadmin/finance', 'Keuangan', TrendingUp)}
                {renderLink('/superadmin/pricing', 'Harga Layanan', Coins)}

                {renderSectionHeader('Sistem')}
                {renderLink('/superadmin/secrets', 'Kunci API', Cpu)}
                {renderLink('/analytics', 'Audit Nilai', BarChart3)}
                {renderLink('/exams/1/monitor', 'Monitor Live', Activity)}

                {/* SuperAdmin Infrastructure Health Card */}
                {sidebarOpen && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white text-[11px] space-y-2 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">Cluster Engine</span>
                      <span className="text-[10px] font-mono text-[#c2ef4e] font-bold flex items-center gap-1">
                        <Database className="w-3 h-3 text-[#c2ef4e]" />
                        TiDB Serverless
                      </span>
                    </div>
                    <div className="space-y-1 text-[10px] font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span>Region:</span>
                        <span className="text-white">ap-southeast-1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latency:</span>
                        <span className="text-emerald-400 font-bold">~28 ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Provider:</span>
                        <span className="text-indigo-300">Gemini 2.5 Flash</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ==================== ADMIN SEKOLAH NAVIGATION ==================== */}
            {isAdmin && (
              <>
                {renderSectionHeader('Menu Utama')}
                {renderLink('/admin/dashboard', 'Dashboard', LayoutDashboard)}
                {renderLink('/classes', 'Kelas', Users)}

                {renderSectionHeader('Ujian')}
                {renderLink('/questions', 'Bank Soal', BookOpen)}
                {renderLink('/exams', 'Jadwal Ujian', FileSpreadsheet)}
                {renderLink('/exams/1/monitor', 'Proctoring Live', Video)}

                {renderSectionHeader('Lainnya')}
                {renderLink('/analytics', 'Rekap Nilai', BarChart3)}
                {renderLink('/superadmin/secrets', 'Pengaturan', Key)}

                {/* Admin Capacity Meter */}
                {sidebarOpen && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[10px] uppercase font-mono">Kapasitas Sekolah</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        Pro Plan
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-600 font-mono">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Siswa Terdaftar:</span>
                          <strong className="text-slate-900">3 / 1,000</strong>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div className="bg-indigo-600 h-1 rounded-full" style={{ width: '0.3%' }} />
                        </div>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100">
                        <span>Guru Aktif:</span>
                        <strong className="text-slate-900">2 / 100</strong>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ==================== TEACHER NAVIGATION ==================== */}
            {isTeacher && (
              <>
                {renderSectionHeader('Menu Utama')}
                {renderLink('/teacher/dashboard', 'Dashboard', LayoutDashboard)}
                {renderLink('/classes', 'Kelas Saya', Users)}
                {renderLink('/questions', 'Bank Soal', BookOpen)}

                {renderSectionHeader('Ujian')}
                {renderLink('/exams', 'Jadwal Ujian', FileSpreadsheet)}
                {renderLink('/exams/create', 'Buat Ujian', PlusCircle)}
                {renderLink('/exams/1/monitor', 'Proctoring Live', Video)}

                {renderSectionHeader('Penilaian')}
                {renderLink('/grading', 'Koreksi Esai', CheckCircle2)}
                {renderLink('/analytics', 'Analisis Soal', BarChart3)}

                {/* Teacher AI Monthly Credits Widget */}
                {sidebarOpen && (
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 to-indigo-50/40 border border-indigo-200/80 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Kredit AI Bulanan
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-2xs border border-indigo-200">
                        97% Sisa
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-[#c2ef4e] h-1.5 rounded-full" style={{ width: '97%' }} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">4,880 dari 5,000 prompt tersisa</p>
                  </div>
                )}
              </>
            )}

            {/* ==================== STUDENT NAVIGATION ==================== */}
            {isStudent && (
              <>
                {renderSectionHeader('Menu Utama')}
                {renderLink('/student/dashboard', 'Dashboard', LayoutDashboard)}
                {renderLink('/student/exam/1', 'Mulai Ujian', FileText)}

                {renderSectionHeader('Hasil')}
                {renderLink('/student/exam/1/result', 'Pembahasan', Sparkles)}

                {renderSectionHeader('Perangkat')}
                {renderLink('/companion', 'Kamera HP', Smartphone)}

                {/* Student Proctoring Status Card */}
                {sidebarOpen && (
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Integritas CBT
                      </span>
                      <span className="font-mono font-bold text-emerald-800 text-[10px] bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200">
                        100% Bersih
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-800/80 leading-relaxed">
                      Webcam depan aktif & status browser terkunci. Bebas dari catatan pelanggaran.
                    </p>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Global Sidebar System Footer */}
        {sidebarOpen && (
          <div className="pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-0 border-t border-slate-200/80 space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] font-mono text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-900">TiDB Cloud & WS</span>
              </div>
              <span className="text-slate-500 font-bold">Ready</span>
            </div>

            <div className="px-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>EXAMIND v1.0 • Next.js 15</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-500" aria-hidden="true" />
                Edge AI
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
