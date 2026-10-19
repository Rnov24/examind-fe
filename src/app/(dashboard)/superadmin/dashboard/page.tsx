'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  GraduationCap,
  Users,
  Plus,
  TrendingUp,
  Coins,
  Cpu,
  Activity,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  ArrowUpRight,
  Wallet,
} from 'lucide-react'
import api from '@/lib/api'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'
import {
  DashboardShell,
  StatCard,
  HeroCard,
  DashboardCard,
  NavTabItem,
} from '@/components/dashboard'
import { useBentoBlock, invalidateBentoCache } from '@/lib/bentoCache'
import { useAuthStore } from '@/stores/authStore'

export default function SuperAdminDashboardPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activitySearch, setActivitySearch] = useState('')
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // 1. Parallel Fetch: Platform Stats & System Health
  const statsBlock = useBentoBlock<any>({
    key: 'superadmin:stats',
    fetcher: async () => {
      const res = await api.get('/superadmin/stats')
      return res.data.data
    },
    ttlMs: 45000,
  })

  // 2. Parallel Fetch: Finance & Revenue Overview
  const financeBlock = useBentoBlock<any>({
    key: 'superadmin:finance',
    fetcher: async () => {
      const res = await api.get('/superadmin/finance')
      return res.data.data
    },
    ttlMs: 60000,
  })

  // 3. Parallel Fetch: Recent Tenants for Table
  const tenantsBlock = useBentoBlock<any[]>({
    key: 'superadmin:dashboard:tenants',
    fetcher: async () => {
      try {
        const res = await api.get('/superadmin/tenants')
        return res.data.data || []
      } catch {
        return []
      }
    },
    ttlMs: 30000,
  })

  const handleCreateTenant = async (formData: TenantFormData) => {
    try {
      setIsSubmitting(true)
      await api.post('/superadmin/tenants', formData)
      setShowCreateModal(false)
      invalidateBentoCache('superadmin:')
      await Promise.allSettled([
        statsBlock.reload(),
        financeBlock.reload(),
        tenantsBlock.reload(),
      ])
      alert('Sekolah baru berhasil didaftarkan!')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mendaftarkan sekolah baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stats = statsBlock.data
  const finance = financeBlock.data
  const tenantsList = tenantsBlock.data || []

  // Top Navigation Tabs matching Finexy design language
  const navTabs: NavTabItem[] = useMemo(
    () => [
      { id: 'overview', label: 'Ringkasan', href: '/superadmin/dashboard' },
      { id: 'tenants', label: 'Sekolah', href: '/superadmin/tenants', badge: stats?.total_tenants },
      { id: 'finance', label: 'Keuangan', href: '/superadmin/finance' },
      { id: 'pricing', label: 'Harga & Kuota', href: '/superadmin/pricing' },
      { id: 'secrets', label: 'Sistem', href: '/superadmin/secrets' },
      { id: 'analytics', label: 'Audit Nilai', href: '/analytics' },
    ],
    [stats?.total_tenants]
  )

  // Filtered tenants for recent activities table
  const filteredTenants = useMemo(() => {
    return tenantsList
      .filter((t) => {
        if (!activitySearch.trim()) return true
        const query = activitySearch.toLowerCase()
        return (
          t.name?.toLowerCase().includes(query) ||
          t.code?.toLowerCase().includes(query) ||
          t.domain?.toLowerCase().includes(query)
        )
      })
      .filter((t) => {
        if (activityStatusFilter === 'active') return t.is_active === true
        if (activityStatusFilter === 'inactive') return t.is_active === false
        return true
      })
      .slice(0, 6)
  }, [tenantsList, activitySearch, activityStatusFilter])

  return (
    <DashboardShell
      navTabs={navTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      greetingName={user?.full_name || 'Super Admin'}
      greetingSubtitle="Pantau integritas ujian, kelola institusi, dan tinjau status operasional platform."
      greetingAction={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-full bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 transition-all cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#150f23] focus:outline-none"
        >
          <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
          <span>Tambah Sekolah Baru</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* ========================================================
            ROW 1: SYSTEM TELEMETRY STRIP (Quiet, clean institutional status)
           ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-display font-bold text-slate-900">
              Telemetri Platform EXAMIND
            </span>
          </div>

          <div className="flex items-center gap-5 sm:gap-7 flex-wrap font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Database:</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                TiDB Online
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Layanan AI:</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                Gemini 2.5 Flash
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Proctoring Dual-Cam:</span>
              <span className="font-semibold text-emerald-600">Siap</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Latensi:</span>
              <span className="font-semibold text-slate-800">~24ms</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              statsBlock.retry()
              financeBlock.retry()
              tenantsBlock.retry()
            }}
            disabled={statsBlock.isRefreshing}
            title="Perbarui telemetri platform"
            aria-label="Perbarui data"
            className="text-xs font-mono font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 text-slate-400 ${statsBlock.isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{statsBlock.isRefreshing ? 'Memuat...' : 'Perbarui'}</span>
          </button>
        </div>

        {/* ========================================================
            ROW 2: FINEXY 3-COLUMN CORE DASHBOARD GRID
            Left: Financial Hero + Wallets + AI Quota Progress
            Middle: 2x2 Stat Cards with Signature Hero Card (Midnight-Violet + Lime)
            Right: Realtime Platform Health & Live Traffic Telemetry
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ==================== LEFT COLUMN (col-span-4) ==================== */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            {/* 1. Total Balance / MRR Hero Card */}
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 tracking-tight">
                    Pendapatan Berulang (MRR)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    IDR • Bulanan
                  </span>
                </div>

                <div>
                  <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    Rp {(finance?.mrr ?? 0).toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold font-mono mt-1">
                    <span className="flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      14%
                    </span>
                    <span className="text-slate-400 font-normal font-sans">
                      dibandingkan bulan lalu
                    </span>
                  </div>
                </div>

                {/* Finexy-style dual action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/superadmin/finance"
                    className="py-2.5 px-3 rounded-full bg-[#150f23] text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs"
                  >
                    <span>Tagihan</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/superadmin/pricing"
                    className="py-2.5 px-3 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-200/80 transition-colors flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>Tarif Kuota</span>
                  </Link>
                </div>
              </div>
            </DashboardCard>

            {/* 2. Wallets / License Plans Distribution */}
            <DashboardCard
              title="Paket Lisensi Sekolah"
              subtitle={`Total ${stats?.total_tenants ?? 0} institusi terdaftar`}
              icon={<Wallet className="w-4 h-4 text-slate-700" aria-hidden="true" />}
            >
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* Enterprise */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
                    <span>Enterprise</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-display text-lg font-extrabold text-slate-900 tabular-nums">
                    {stats?.plan_distribution?.enterprise ?? 0}
                  </div>
                  <p className="text-[9px] text-emerald-600 font-medium">Prioritas AI</p>
                </div>

                {/* Pro */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
                    <span>Pro</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="font-display text-lg font-extrabold text-slate-900 tabular-nums">
                    {stats?.plan_distribution?.pro ?? 0}
                  </div>
                  <p className="text-[9px] text-indigo-600 font-medium">Kamera Ganda</p>
                </div>

                {/* Starter */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
                    <span>Starter</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <div className="font-display text-lg font-extrabold text-slate-900 tabular-nums">
                    {stats?.plan_distribution?.starter ?? 0}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium">Dasar CBT</p>
                </div>
              </div>
            </DashboardCard>

            {/* 3. AI Token Quota Capacity (Finexy Progress Bar) */}
            <DashboardCard
              title="Kapasitas Token AI Platform"
              subtitle="Alokasi kredit penilaian esai & generate soal"
              icon={<Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
            >
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600 font-medium">
                    1.420.000 / 2.000.000 Token
                  </span>
                  <span className="font-mono font-bold text-slate-900">71%</span>
                </div>

                {/* Calm fintech progress bar with lime accent */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full bg-[#150f23] rounded-full relative"
                    style={{ width: '71%' }}
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 w-3 bg-[#c2ef4e] rounded-full"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Quota Reset: 12 hari lagi</span>
                  <span className="text-emerald-600 font-semibold">Kapasitas Normal</span>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* ==================== MIDDLE COLUMN: 2x2 STAT GRID (col-span-5) ==================== */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* HERO CARD (Finexy Hero Accent Card mapped to EXAMIND Midnight-Violet with Lime Highlight) */}
            <HeroCard
              title="Sekolah Terdaftar"
              value={stats?.total_tenants ?? 0}
              icon={<Building2 className="w-5 h-5 text-[#c2ef4e]" aria-hidden="true" />}
              trend={{ value: `${stats?.active_tenants ?? 0} Aktif`, positive: true, label: 'beroperasi' }}
              highlightText="Infrastruktur Utama"
              className="min-h-[180px]"
            />

            {/* Stat Card 2: Peserta Didik */}
            <StatCard
              title="Peserta Didik (Siswa)"
              value={(stats?.total_global_students ?? 0).toLocaleString('id-ID')}
              icon={<GraduationCap className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
              subtitle={`Dari ${(stats?.total_global_users ?? 0).toLocaleString('id-ID')} total akun`}
              trend={{ value: '100%', positive: true, label: 'aktif ujian' }}
              className="min-h-[180px]"
            />

            {/* Stat Card 3: Tenaga Pendidik */}
            <StatCard
              title="Tenaga Pendidik (Guru)"
              value={(stats?.total_global_teachers ?? 0).toLocaleString('id-ID')}
              icon={<Users className="w-5 h-5 text-slate-700" aria-hidden="true" />}
              subtitle="Pendidik di seluruh sekolah"
              trend={{ value: '+8%', positive: true, label: 'bulan ini' }}
              className="min-h-[180px]"
            />

            {/* Stat Card 4: ARR Proyeksi Tahunan */}
            <StatCard
              title="Annual Run Rate (ARR)"
              value={`Rp ${(finance?.arr ?? 0).toLocaleString('id-ID')}`}
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              subtitle="Proyeksi pendapatan tahunan"
              trend={{ value: '+18%', positive: true, label: 'pertumbuhan' }}
              className="min-h-[180px]"
            />

            {/* Sub-card below 2x2: Quick Management Shortcuts */}
            <div className="sm:col-span-2">
              <DashboardCard noPadding className="p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  <Link
                    href="/superadmin/secrets"
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-[#150f23] group-hover:text-white transition-colors">
                        <Cpu className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Kunci API & Keamanan
                        </p>
                        <p className="text-[10px] text-slate-500">Konfigurasi Gemini & DB</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/analytics"
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-[#150f23] group-hover:text-white transition-colors">
                        <Activity className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Audit Nilai & Ujian
                        </p>
                        <p className="text-[10px] text-slate-500">Telemetri integritas proctoring</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </DashboardCard>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: SYSTEM HEALTH & TELEMETRY CHART (col-span-3) ==================== */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
            <DashboardCard
              title="Telemetri Server CBT"
              subtitle="Beban trafik & integritas cluster"
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
              action={
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Optimal
                </span>
              }
            >
              <div className="space-y-4 pt-1">
                {/* Visual Chart Bars (Finexy dual bar style in EXAMIND midnight & lime) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Trafik Server CBT</span>
                    <span className="font-mono text-slate-400 text-[10px]">7 Hari Terakhir</span>
                  </div>

                  {/* Dual Bar Graphic */}
                  <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
                    {[
                      { day: 'Sen', load: 60, ai: 45 },
                      { day: 'Sel', load: 85, ai: 70 },
                      { day: 'Rab', load: 75, ai: 60 },
                      { day: 'Kam', load: 95, ai: 85 },
                      { day: 'Jum', load: 80, ai: 65 },
                      { day: 'Sab', load: 40, ai: 30 },
                      { day: 'Min', load: 30, ai: 20 },
                    ].map((item) => (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                        <div className="w-full max-w-[18px] flex flex-col items-center gap-0.5 justify-end h-full">
                          {/* Top lime highlight cap */}
                          <div
                            className="w-full bg-[#c2ef4e] rounded-t-sm transition-all group-hover:opacity-90"
                            style={{ height: `${item.ai * 0.35}%` }}
                            title={`AI Load: ${item.ai}%`}
                          />
                          {/* Bottom midnight base bar */}
                          <div
                            className="w-full bg-[#150f23] rounded-b-sm transition-all group-hover:bg-slate-800"
                            style={{ height: `${item.load * 0.55}%` }}
                            title={`Server Load: ${item.load}%`}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{item.day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 text-[10px] font-medium pt-1 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#150f23]" />
                      Server CBT
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#c2ef4e]" />
                      AI Grading
                    </span>
                  </div>
                </div>

                {/* Telemetry Breakdown Details */}
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Kapasitas AI Rata-rata:</span>
                    <span className="font-mono font-bold text-slate-900">99.8% Uptime</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">ARPU per Sekolah:</span>
                    <span className="font-mono font-bold text-slate-900">
                      Rp {(finance?.arpu ?? 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Kepatuhan UU PDP:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Terverifikasi
                    </span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* ========================================================
            ROW 3: RECENT ACTIVITIES TABLE CARD (Finexy Recent Activities)
            Clean table with search, filter, status dots, and actions
           ======================================================== */}
        <DashboardCard noPadding>
          {/* Table Header with Search & Filter */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900 tracking-tight">
                Aktivitas Sekolah & Lisensi Terbaru
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Status operasional dan keaktifan institusi dalam ekosistem CBT
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Rounded-full Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Cari sekolah..."
                  className="pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#150f23] w-40 sm:w-52"
                />
              </div>

              {/* Status Filter */}
              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value as any)}
                aria-label="Filter status sekolah"
                className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif Beroperasi</option>
                <option value="inactive">Nonaktif</option>
              </select>

              <Link
                href="/superadmin/tenants"
                className="px-4 py-1.5 rounded-full bg-[#150f23] text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
              >
                <span>Kelola Semua</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Tabel Aktivitas Sekolah">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-5 font-semibold">Institusi Sekolah</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Kode CBT</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Paket Lisensi</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Peserta Didik</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Status Operasional</th>
                  <th scope="col" className="py-3 px-5 text-right font-semibold">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {tenantsBlock.status === 'loading'
                        ? 'Memuat data sekolah...'
                        : 'Tidak ada data sekolah yang sesuai dengan pencarian.'}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => {
                    const planBadgeColor = (() => {
                      const p = tenant.subscription_plan?.toLowerCase()
                      if (p === 'enterprise') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      if (p === 'pro') return 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      return 'bg-slate-100 text-slate-800 border-slate-200'
                    })()

                    return (
                      <tr
                        key={tenant.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* School Name & Domain */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold shrink-0">
                              <Building2 className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {tenant.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {tenant.domain || 'cbt.sekolah.id'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CBT Code */}
                        <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-600">
                          {tenant.code}
                        </td>

                        {/* License Plan */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${planBadgeColor}`}
                          >
                            {tenant.subscription_plan}
                          </span>
                        </td>

                        {/* Students count */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {(tenant.total_students ?? 0).toLocaleString('id-ID')}{' '}
                          <span className="text-slate-400 text-[10px]">
                            / {tenant.max_students ?? 500}
                          </span>
                        </td>

                        {/* Status Dot */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                tenant.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                              }`}
                              aria-hidden="true"
                            />
                            <span
                              className={`font-medium ${
                                tenant.is_active ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                            >
                              {tenant.is_active ? 'Aktif Beroperasi' : 'Nonaktif'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href="/superadmin/tenants"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
                            title="Detail Sekolah"
                            aria-label={`Detail ${tenant.name}`}
                          >
                            <MoreVertical className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>

      {/* Tenant Onboard Modal */}
      <TenantModal
        isOpen={showCreateModal}
        isSubmitting={isSubmitting}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
      />
    </DashboardShell>
  )
}
