'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  GraduationCap,
  Users,
  Plus,
  TrendingUp,
  Cpu,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Wallet,
  Sparkles,
} from 'lucide-react'
import api from '@/lib/api'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'
import {
  DashboardShell,
  StatCard,
  HeroCard,
  DashboardCard,
  TelemetryStrip,
  DashboardProgressBar,
  PlanDistributionGrid,
  TelemetryBarChart,
  QuickActionGrid,
  TenantActivityTable,
  getSuperAdminNavTabs,
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

  // Top Navigation Tabs matching unified superadmin design
  const navTabs = useMemo(() => getSuperAdminNavTabs(stats?.total_tenants), [stats?.total_tenants])

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
        {/* ROW 1: SYSTEM TELEMETRY STRIP */}
        <TelemetryStrip
          isRefreshing={statsBlock.isRefreshing}
          onRefresh={() => {
            statsBlock.retry()
            financeBlock.retry()
            tenantsBlock.retry()
          }}
        />

        {/* ROW 2: 3-COLUMN CORE DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN (col-span-4) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            {/* 1. Total Balance / MRR Card */}
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 tracking-tight">
                    Pendapatan Berulang (MRR)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                    IDR • Bulanan
                  </span>
                </div>

                <div>
                  <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    Rp {(finance?.mrr ?? 0).toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold font-mono mt-1">
                    <span className="flex items-center gap-0.5 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                      14%
                    </span>
                    <span className="text-slate-500 font-normal font-sans">
                      dibandingkan bulan lalu
                    </span>
                  </div>
                </div>

                {/* Vibrant balanced action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/superadmin/finance"
                    className="py-2.5 px-3 rounded-full bg-[#150f23] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center shadow-xs cursor-pointer"
                  >
                    <span>Tagihan</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/superadmin/pricing"
                    className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
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
              <PlanDistributionGrid distribution={stats?.plan_distribution} />
            </DashboardCard>

            {/* 3. AI Token Quota Capacity */}
            <DashboardCard
              title="Kapasitas Token AI Platform"
              subtitle="Alokasi kredit penilaian esai & generate soal"
              icon={<Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
            >
              <DashboardProgressBar
                value={1420000}
                max={2000000}
                label="1.420.000 / 2.000.000 Token"
                percentageLabel="71%"
                statusLeft="Quota Reset: 12 hari lagi"
                statusRight="Kapasitas Normal"
                tone="violet"
                className="pt-1"
              />
            </DashboardCard>
          </div>

          {/* MIDDLE COLUMN: 2x2 STAT GRID (col-span-5) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* HERO CARD - Vibrant daylight treatment */}
            <HeroCard
              title="Sekolah Terdaftar"
              value={stats?.total_tenants ?? 0}
              icon={<Building2 className="w-5 h-5 text-[#c2ef4e]" aria-hidden="true" />}
              trend={{
                value: `${stats?.active_tenants ?? 0} Aktif`,
                positive: true,
                label: 'beroperasi',
              }}
              highlightText="Infrastruktur Utama"
              className="min-h-[180px]"
            />

            {/* Stat Card 2: Peserta Didik */}
            <StatCard
              title="Peserta Didik (Siswa)"
              value={(stats?.total_global_students ?? 0).toLocaleString('id-ID')}
              icon={<GraduationCap className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
              tone="indigo"
              subtitle={`Dari ${(stats?.total_global_users ?? 0).toLocaleString('id-ID')} total akun`}
              trend={{ value: '100%', positive: true, label: 'aktif ujian' }}
              className="min-h-[180px]"
            />

            {/* Stat Card 3: Tenaga Pendidik */}
            <StatCard
              title="Tenaga Pendidik (Guru)"
              value={(stats?.total_global_teachers ?? 0).toLocaleString('id-ID')}
              icon={<Users className="w-5 h-5 text-amber-600" aria-hidden="true" />}
              tone="amber"
              subtitle="Pendidik di seluruh sekolah"
              trend={{ value: '+8%', positive: true, label: 'bulan ini' }}
              className="min-h-[180px]"
            />

            {/* Stat Card 4: ARR Proyeksi Tahunan */}
            <StatCard
              title="Annual Run Rate (ARR)"
              value={`Rp ${(finance?.arr ?? 0).toLocaleString('id-ID')}`}
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              tone="emerald"
              subtitle="Proyeksi pendapatan tahunan"
              trend={{ value: '+18%', positive: true, label: 'pertumbuhan' }}
              className="min-h-[180px]"
            />

            {/* Sub-card below 2x2: Quick Management Shortcuts */}
            <div className="sm:col-span-2">
              <QuickActionGrid
                items={[
                  {
                    title: 'Kunci API & Keamanan',
                    subtitle: 'Konfigurasi Gemini & DB',
                    href: '/superadmin/secrets',
                    icon: <Cpu className="w-4 h-4 text-indigo-600" aria-hidden="true" />,
                  },
                  {
                    title: 'Audit Nilai & Ujian',
                    subtitle: 'Telemetri integritas proctoring',
                    href: '/analytics',
                    icon: <Activity className="w-4 h-4 text-emerald-600" aria-hidden="true" />,
                  },
                ]}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: SYSTEM HEALTH & TELEMETRY (col-span-3) */}
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
                {/* Visual Chart Bars primitive */}
                <TelemetryBarChart />

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

        {/* ROW 3: RECENT ACTIVITIES TABLE */}
        <TenantActivityTable
          tenants={filteredTenants}
          isLoading={tenantsBlock.status === 'loading'}
          searchQuery={activitySearch}
          onSearchChange={setActivitySearch}
          statusFilter={activityStatusFilter}
          onStatusFilterChange={setActivityStatusFilter}
          manageAllHref="/superadmin/tenants"
        />
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
