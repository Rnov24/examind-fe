'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Key,
  Sparkles,
  Smartphone,
  Database,
  PlusCircle,
  Activity,
  Cpu,
  TrendingUp,
  Coins,
  HelpCircle,
  LogOut,
  X,
  PanelLeftClose,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'
import { usePlatformHealth } from '@/lib/usePlatformHealth'
import { HelpModal } from '@/components/dashboard/HelpModal'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, toggleSidebar, initSidebar } = useUiStore()
  const [showHelp, setShowHelp] = useState(false)
  // Real platform health (GET /health via the /api/health rewrite) — the
  // status card + footer below render ONLY what the server reports.
  const health = usePlatformHealth()

  // Initialize sidebar on first mount
  useEffect(() => {
    initSidebar()
  }, [initSidebar])

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
    if (pathname === path) return true
    if (
      path !== '/' &&
      path !== '/dashboard' &&
      path !== '/superadmin/dashboard' &&
      path !== '/admin/dashboard' &&
      path !== '/teacher/dashboard' &&
      path !== '/student/dashboard'
    ) {
      if (path === '/student/dashboard' && pathname.includes('/student/exam')) {
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

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Define role navigation links for clean iteration in both rail and expanded modes
  const getNavLinks = () => {
    if (isSuperAdmin) {
      return [
        { href: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Menu Utama' },
        { href: '/superadmin/tenants', label: 'Sekolah', icon: Building2, section: 'Menu Utama' },
        { href: '/admin/dashboard', label: 'Portal Admin', icon: ShieldCheck, section: 'Menu Utama' },
        { href: '/superadmin/finance', label: 'Keuangan', icon: TrendingUp, section: 'Keuangan' },
        { href: '/superadmin/pricing', label: 'Harga Layanan', icon: Coins, section: 'Keuangan' },
        { href: '/superadmin/secrets', label: 'Kunci API', icon: Cpu, section: 'Sistem' },
        { href: '/analytics', label: 'Audit Nilai', icon: BarChart3, section: 'Sistem' },
        { href: '/exams', label: 'Jadwal Ujian', icon: Activity, section: 'Sistem' },
      ]
    }
    if (isAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Menu Utama' },
        { href: '/classes', label: 'Kelas', icon: Users, section: 'Menu Utama' },
        { href: '/questions', label: 'Bank Soal', icon: BookOpen, section: 'Ujian' },
        { href: '/exams', label: 'Jadwal Ujian', icon: FileSpreadsheet, section: 'Ujian' },
        { href: '/analytics', label: 'Rekap Nilai', icon: BarChart3, section: 'Lainnya' },
        { href: '/superadmin/secrets', label: 'Pengaturan', icon: Key, section: 'Lainnya' },
      ]
    }
    if (isTeacher) {
      return [
        { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Menu Utama' },
        { href: '/classes', label: 'Kelas Saya', icon: Users, section: 'Menu Utama' },
        { href: '/questions', label: 'Bank Soal', icon: BookOpen, section: 'Menu Utama' },
        { href: '/exams', label: 'Jadwal Ujian', icon: FileSpreadsheet, section: 'Ujian' },
        { href: '/exams/create', label: 'Buat Ujian', icon: PlusCircle, section: 'Ujian' },
        { href: '/grading', label: 'Koreksi Esai', icon: CheckCircle2, section: 'Penilaian' },
        { href: '/analytics', label: 'Analisis Soal', icon: BarChart3, section: 'Penilaian' },
      ]
    }
    return [
      { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Menu Utama' },
      { href: '/companion', label: 'Kamera HP', icon: Smartphone, section: 'Perangkat' },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <>
      {/* ========================================================
          1. DESKTOP FLOATING ICON RIBBON (When !sidebarOpen on desktop)
          Replaces rectangular sidebar with Finexy floating rail aesthetic
         ======================================================== */}
      {!sidebarOpen && (
        <aside
          id="sidebar-ribbon"
          aria-label="Navigasi Ribbon Rail"
          className="hidden md:flex flex-col items-center justify-between sticky top-4 my-4 ml-4 h-[calc(100vh-2rem)] w-16 md:w-[68px] bg-white rounded-full border border-[#ddd9ef] shadow-card py-4 px-2 select-none shrink-0 z-30"
        >
          {/* Top: Logo Mark & Theme Switcher */}
          <div className="flex flex-col items-center gap-3 w-full">
            {/* Logo Link */}
            <Link
              href="/dashboard"
              className="relative group p-1.5 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]"
              aria-label="Kembali ke Dashboard Utama"
            >
              <ExamindLogo variant="symbol" theme="color" className="w-8 h-8 object-contain shrink-0" priority />
              <div
                role="tooltip"
                className="absolute left-full ml-3 px-2.5 py-1 bg-[#150f23] text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans tracking-tight"
              >
                EXAMIND CBT
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#150f23]" />
              </div>
            </Link>

            {/* Hairline Separator */}
            <div className="w-8 h-px bg-[#e3dff5] my-0.5" aria-hidden="true" />
          </div>

          {/* Center: Navigation Icon Buttons with Tooltips */}
          <nav className="flex flex-col items-center gap-1.5 w-full my-auto py-2 overflow-y-auto scrollbar-none" aria-label="Menu Ikon Ribbon">
            {navLinks.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              return (
                <div key={`${item.href}::${item.label}`} className="relative group flex items-center justify-center">
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
            <div className="w-8 h-px bg-[#e3dff5] my-0.5" aria-hidden="true" />

            {/* Help Button */}
            <div className="relative group flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                title="Bantuan & Dokumentasi"
                aria-label="Bantuan & Dokumentasi"
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-5 h-5" aria-hidden="true" />
              </button>
              <div
                role="tooltip"
                className="absolute left-full ml-3 px-2.5 py-1 bg-[#150f23] text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans tracking-tight"
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
              <div
                role="tooltip"
                className="absolute left-full ml-3 px-2.5 py-1 bg-rose-950 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md z-50 flex items-center font-sans tracking-tight"
              >
                Keluar dari Akun
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rose-950" />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================
          2. MOBILE DRAWER & EXPANDED SIDEBAR (When sidebarOpen is true)
          Preserves existing mobile drawer functionality and links
         ======================================================== */}
      {sidebarOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-300 md:hidden motion-reduce:transition-none"
            aria-hidden="true"
          />

          <aside
            id="sidebar-nav"
            aria-label="Menu Navigasi Lengkap"
            className="fixed md:sticky top-0 md:top-4 inset-y-0 md:inset-y-auto left-0 md:left-auto z-50 md:z-20 shrink-0 md:my-4 md:ml-4 w-72 h-full md:h-[calc(100vh-2rem)] bg-white md:rounded-3xl border-r md:border border-[#ddd9ef] shadow-2xl md:shadow-card flex flex-col justify-between p-4 overflow-y-auto text-slate-800 select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <div className="space-y-4">
              {/* Header with Brand & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e9e5f6]">
                <Link href="/dashboard" className="flex items-center gap-2 group" onClick={handleNavClick}>
                  <ExamindLogo variant="lockup" theme="color" className="h-6 w-auto shrink-0" priority />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#f1effa] text-[#584dae] border border-[#c9c2ec] font-mono tracking-wider">
                    CBT
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  title="Sembunyikan Sidebar"
                  aria-label="Sembunyikan Sidebar"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-5 h-5 hidden md:block" aria-hidden="true" />
                  <X className="w-5 h-5 md:hidden" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Links Grouped by Section */}
              <nav className="space-y-1">
                {(() => {
                  let lastSection = ''
                  return navLinks.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    const showSection = item.section !== lastSection
                    if (showSection) lastSection = item.section

                    return (
                      <React.Fragment key={`${item.href}::${item.label}`}>
                        {showSection && (
                          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                            {item.section}
                          </div>
                        )}
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          title={item.label}
                          aria-label={item.label}
                          aria-current={active ? 'page' : undefined}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                            active
                              ? 'bg-[#150f23] text-white font-semibold shadow-card ring-1 ring-slate-800'
                              : 'text-slate-600 hover:bg-[#f1effa] hover:text-slate-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                                active ? 'text-[#c2ef4e]' : 'text-slate-500 group-hover:text-slate-800'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                        </Link>
                      </React.Fragment>
                    )
                  })
                })()}

                {/* Role Specific Status Card */}
                {isSuperAdmin && (
                  <div className="mt-4 p-3 rounded-xl bg-[#150f23] text-white text-[11px] space-y-2 shadow-card border border-[#362d59]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#bdb8c0] font-semibold uppercase tracking-wider">Status Platform</span>
                      <span className="text-[10px] font-mono text-[#c2ef4e] font-bold flex items-center gap-1">
                        <Database className="w-3 h-3 text-[#c2ef4e]" />
                        Database
                      </span>
                    </div>
                    <div className="space-y-1 text-[10px] font-mono text-[#bdb8c0]">
                      <div className="flex justify-between">
                        <span>Status DB:</span>
                        {health.loading ? (
                          <span className="text-white">Memeriksa…</span>
                        ) : health.dbStatus === 'online' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Terhubung
                          </span>
                        ) : health.reachable ? (
                          <span className="text-rose-400 font-semibold">Bermasalah</span>
                        ) : (
                          <span className="text-amber-300 font-semibold">Tidak terjangkau</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span>Latensi DB:</span>
                        <span className="text-white">
                          {health.dbLatencyMs != null ? `${health.dbLatencyMs} ms` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-4 p-3 rounded-xl bg-[#faf9fd] border border-[#ddd9ef] text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Sekolah Anda</span>
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 leading-snug">
                      {user?.tenant_name || '—'}
                    </p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Kelola kelas, bank soal, jadwal ujian, dan akun pengguna sekolah ini.
                    </p>
                  </div>
                )}

                {isTeacher && (
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-violet-50/70 to-violet-50/40 border border-violet-200/80 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-950 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        AI Studio
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Buat draf soal PG &amp; esai beserta rubrik otomatis dari Bank Soal.
                    </p>
                    <Link
                      href="/questions"
                      onClick={handleNavClick}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 hover:text-violet-900"
                    >
                      Buka Bank Soal
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                )}

                {isStudent && (
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Pengawasan &amp; Integritas
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-800/80 leading-relaxed">
                      Ujian diawasi kamera dan layar penuh. Perangkat Anda dicek saat ujian dimulai.
                    </p>
                  </div>
                )}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t border-[#ddd9ef] space-y-2">
              <div className="p-2.5 rounded-xl bg-[#faf9fd] border border-[#ddd9ef] text-[10px] font-mono text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.loading
                        ? 'bg-slate-300'
                        : health.dbStatus === 'online'
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-900">Database</span>
                </div>
                <span className="text-slate-500 font-bold">
                  {health.loading
                    ? 'Memeriksa…'
                    : health.dbStatus === 'online'
                      ? 'Terhubung'
                      : health.reachable
                        ? 'Bermasalah'
                        : 'Tidak terjangkau'}
                </span>
              </div>

              <div className="px-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>EXAMIND v1.0 • Next.js 15</span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  Edge AI
                </span>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Help modal (shared with TopRightCluster) — real guidance, no alert() */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}
