'use client'

import React, { useMemo } from 'react'
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
  GraduationCap,
  Award,
  Database,
  PlusCircle,
  Activity,
  ChevronLeft,
  Cpu,
  TrendingUp,
  Coins,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUiStore()

  const isSuperAdmin = user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

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
      if (path === '/grading' && pathname.startsWith('/grading/')) {
        return true
      }
      return pathname.startsWith(path + '/')
    }
    return false
  }

  const roleMeta = useMemo(() => {
    if (isSuperAdmin) {
      return {
        label: 'Super Administrator',
        subtext: 'EXAMIND Multi-Tenant Core',
        badgeClass: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
        monogramBg: 'bg-indigo-600',
      }
    }
    if (isAdmin) {
      return {
        label: 'Administrator Sekolah',
        subtext: user?.tenant_name || 'SMA Negeri 1 Indonesia Unggul',
        badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        monogramBg: 'bg-blue-600',
      }
    }
    if (isTeacher) {
      return {
        label: 'Guru Pengampu',
        subtext: user?.identifier ? `NIP: ${user.identifier}` : 'Fisika & Matematika',
        badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
        monogramBg: 'bg-purple-600',
      }
    }
    return {
      label: 'Siswa Peserta CBT',
      subtext: user?.identifier ? `NISN: ${user.identifier} • 12 MIPA 1` : '12 MIPA 1',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      monogramBg: 'bg-emerald-600',
    }
  }, [isSuperAdmin, isAdmin, isTeacher, user])

  const renderLink = (
    href: string,
    label: string,
    Icon: any,
    badge?: { text: string; variant?: 'default' | 'lime' | 'amber' | 'rose' | 'pulse' }
  ) => {
    const active = isActive(href)

    return (
      <Link
        href={href}
        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all relative ${
          active
            ? 'bg-slate-900 text-white font-semibold shadow-card ring-1 ring-slate-800'
            : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
              active ? 'text-[#c2ef4e]' : 'text-slate-500 group-hover:text-slate-800'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>

        {badge && (
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
              badge.variant === 'lime'
                ? active
                  ? 'bg-[#c2ef4e] text-slate-950 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : badge.variant === 'rose'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : badge.variant === 'amber'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : badge.variant === 'pulse'
                ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                : active
                ? 'bg-slate-800 text-slate-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {badge.variant === 'pulse' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            {badge.text}
          </span>
        )}
      </Link>
    )
  }

  const renderSectionHeader = (title: string) => (
    <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
      <span>{title}</span>
    </div>
  )

  if (!sidebarOpen) {
    return null
  }

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200/80 bg-white/85 backdrop-blur-md flex flex-col justify-between p-3.5 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto text-slate-800 select-none shadow-2xs transition-all">
      <div className="space-y-4">
        {/* Dynamic User & Role Identity Header Card with Collapse Button */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100/70 border border-slate-200/80 shadow-xs relative group">
          <button
            onClick={toggleSidebar}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Tutup Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 pr-6">
            <div
              className={`w-9 h-9 rounded-xl ${roleMeta.monogramBg} text-white flex items-center justify-center font-bold text-xs shadow-xs font-display shrink-0`}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user?.full_name || 'Pengguna EXAMIND'}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono truncate">{roleMeta.subtext}</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${roleMeta.badgeClass}`}>
              {roleMeta.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Role Specific Navigation */}
        <nav className="space-y-1">
          {/* ==================== SUPERADMIN NAVIGATION ==================== */}
          {isSuperAdmin && (
            <>
              {renderSectionHeader('Multi-Tenant SaaS Core')}
              {renderLink('/superadmin/dashboard', 'Institusi & Tenant', Building2, { text: '1 Tenant', variant: 'lime' })}
              {renderLink('/admin/dashboard', 'Pratinjau Admin Portal', ShieldCheck)}

              {renderSectionHeader('Finansial & Monetisasi')}
              {renderLink('/superadmin/finance', 'Finansial & MRR', TrendingUp, { text: 'Revenue', variant: 'lime' })}
              {renderLink('/superadmin/pricing', 'Pricing & Skema AI', Coins, { text: 'Promo', variant: 'amber' })}

              {renderSectionHeader('Keamanan & Engine AI')}
              {renderLink('/superadmin/secrets', 'Task AI & Vault Secrets', Cpu, { text: 'Multi-Model' })}
              {renderLink('/analytics', 'Global Audit & Nilai', BarChart3)}
              {renderLink('/exams/1/monitor', 'Live Engine Monitor', Activity, { text: 'Active' })}

              {/* SuperAdmin Infrastructure Health Card */}
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
            </>
          )}

          {/* ==================== ADMIN SEKOLAH NAVIGATION ==================== */}
          {isAdmin && (
            <>
              {renderSectionHeader('Tata Kelola Sekolah')}
              {renderLink('/admin/dashboard', 'Ringkasan Sekolah', LayoutDashboard)}
              {renderLink('/classes', 'Daftar Kelas & Siswa', Users, { text: '3 Siswa' })}

              {renderSectionHeader('Operasional Ujian')}
              {renderLink('/questions', 'Master Bank Soal', BookOpen, { text: 'Pedagogis' })}
              {renderLink('/exams', 'Jadwal & Paket Ujian', FileSpreadsheet, { text: '2 Paket' })}
              {renderLink('/exams/1/monitor', 'Pantau Live Proctoring', Video, { text: 'Dual-Cam', variant: 'rose' })}

              {renderSectionHeader('Audit & Kunci')}
              {renderLink('/analytics', 'Audit Integritas & Nilai', BarChart3)}
              {renderLink('/superadmin/secrets', 'KMS & Konfigurasi API', Key, { text: 'Aktif' })}

              {/* Admin Capacity Meter */}
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
            </>
          )}

          {/* ==================== TEACHER NAVIGATION ==================== */}
          {isTeacher && (
            <>
              {renderSectionHeader('Ruang Kerja Akademik')}
              {renderLink('/teacher/dashboard', 'Dashboard Guru', LayoutDashboard)}
              {renderLink('/classes', 'Rombel & Kelas Siswa', Users, { text: '2 Kelas' })}
              {renderLink('/questions', 'Bank Soal Pedagogis', BookOpen, { text: 'AI Ready', variant: 'lime' })}

              {renderSectionHeader('Pelaksanaan Ujian')}
              {renderLink('/exams', 'Paket & Jadwal Ujian', FileSpreadsheet, { text: '2 Ujian' })}
              {renderLink('/exams/create', 'Buat Ujian Baru', PlusCircle, { text: 'Baru' })}
              {renderLink('/exams/1/monitor', 'Live Proctoring Grid', Video, { text: 'LIVE', variant: 'pulse' })}

              {renderSectionHeader('Penilaian & Analisis')}
              {renderLink('/grading', 'Koreksi Esai & Review', CheckCircle2, { text: '2 Siap', variant: 'amber' })}
              {renderLink('/analytics', 'Analisis Butir & IRT', BarChart3, { text: 'Daya Beda' })}

              {/* Teacher AI Monthly Credits Widget */}
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-200/80 text-[11px] space-y-2">
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
            </>
          )}

          {/* ==================== STUDENT NAVIGATION ==================== */}
          {isStudent && (
            <>
              {renderSectionHeader('Ruang Ujian & Asesmen')}
              {renderLink('/student/dashboard', 'Dashboard & Jadwal Ujian', LayoutDashboard, { text: '1 Aktif', variant: 'lime' })}
              {renderLink('/student/exam/1', 'Masuk Lembar CBT', FileText, { text: 'Fisika' })}

              {renderSectionHeader('Hasil & Evaluasi')}
              {renderLink('/student/exam/1/result', 'Tinjau Pembahasan AI', Sparkles, { text: 'AI Tutor', variant: 'lime' })}

              {renderSectionHeader('Perangkat CBT')}
              {renderLink('/companion', 'Scan Kamera HP (Cam 2)', Smartphone, { text: 'Pairing' })}

              {/* Student Proctoring Status Card */}
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
            </>
          )}
        </nav>
      </div>

      {/* Global Sidebar System Footer */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] font-mono text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">TiDB Cloud & WS</span>
          </div>
          <span className="text-slate-400 font-bold">Ready</span>
        </div>

        <div className="px-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>EXAMIND v1.0 • Next.js 15</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            Edge AI
          </span>
        </div>
      </div>
    </aside>
  )
}
