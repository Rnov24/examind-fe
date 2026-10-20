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
      greetingSubtitle="Pantau integritas ujian, kelola sekolah mitra, dan tinjau status operasional platform."
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

        {/* ROW 2: PRIMARY FOCAL POINT — ACADEMIC INFRASTRUCTURE HERO & STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Focal Point 1: Hero Card Sekolah Terdaftar */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <HeroCard
              title="Sekolah Terdaftar"
              value={stats?.total_tenants ?? 0}
              icon={<Building2 className="w-5 h-5 text-[#c2ef4e]" aria-hidden="true" />}
              trend={{
                value: `${stats?.active_tenants ?? 0} Sekolah Aktif`,
                positive: true,
                label: 'beroperasi',
              }}
              highlightText="Infrastruktur CBT Utama"
              className="h-full min-h-[170px]"
            />
          </div>

          {/* Focal Point 2: Stat Card Peserta Didik (Siswa) */}
          <div className="col-span-1 lg:col-span-4">
            <StatCard
              title="Peserta Didik (Siswa)"
              value={(stats?.total_global_students ?? 0).toLocaleString('id-ID')}
              icon={<GraduationCap className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
              tone="indigo"
              subtitle={`Dari ${(stats?.total_global_users ?? 0).toLocaleString('id-ID')} akun terdaftar di platform`}
              className="h-full min-h-[170px]"
            />
          </div>

          {/* Focal Point 3: Stat Card Tenaga Pendidik (Guru) */}
          <div className="col-span-1 lg:col-span-4">
            <StatCard
              title="Tenaga Pendidik (Guru)"
              value={(stats?.total_global_teachers ?? 0).toLocaleString('id-ID')}
              icon={<Users className="w-5 h-5 text-amber-600" aria-hidden="true" />}
              tone="amber"
              subtitle="Pendidik aktif penyusun bank soal CBT"
              className="h-full min-h-[170px]"
            />
          </div>
        </div>

        {/* ROW 3: INFRASTRUCTURE & PLATFORM CAPACITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block: License Plans & AI Tokens Allocation (col-span-7) */}
          <div className="lg:col-span-7">
            <DashboardCard
              title="Alokasi Lisensi & Kapasitas Token AI"
              subtitle="Distribusi tingkatan layanan sekolah mitra dan kuota pemrosesan model LLM"
              icon={<Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
            >
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
                    <span>Sebaran Paket Sekolah Mitra</span>
                    <span className="font-mono font-semibold text-slate-700">
                      Total {stats?.total_tenants ?? 0} Sekolah
                    </span>
                  </div>
                  <PlanDistributionGrid distribution={stats?.plan_distribution} />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Pemakaian Kredit AI Platform</span>
                    <span className="font-mono font-semibold text-violet-700">
                      {(stats?.total_ai_credits_used ?? 0).toLocaleString('id-ID')} kredit terpakai
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    Total kredit AI terpakai seluruh sekolah mitra
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Right Block: CBT Server Telemetry & Health (col-span-5) */}
          <div className="lg:col-span-5">
            <DashboardCard
              title="Telemetri Server Ujian CBT"
              subtitle="Beban trafik komputasi dan integritas klaster ujian"
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
              action={
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Optimal
                </span>
              }
            >
              <div className="space-y-4">
                <TelemetryBarChart />

                <div className="space-y-2 text-xs divide-y divide-slate-100 pt-1">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Rata-rata Pendapatan per Sekolah (ARPU):</span>
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

        {/* ROW 4: SECONDARY — FINANCIAL OVERVIEW & QUICK ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block: Financial Summary (col-span-8) */}
          <div className="lg:col-span-8">
            <DashboardCard
              title="Ringkasan Finansial Layanan Sekolah"
              subtitle="Pemantauan pendapatan langganan bulanan, proyeksi tahunan, dan rata-rata per sekolah"
              icon={<Wallet className="w-4 h-4 text-slate-700" aria-hidden="true" />}
            >
              <div className="space-y-4">
                {/* 3 Unified Financial Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Pendapatan Bulanan (MRR)
                    </span>
                    <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">
                      Rp {(finance?.mrr ?? 0).toLocaleString('id-ID')}
                    </div>
                    {finance?.growth_rate_mom != null ? (
                      <div
                        className={`flex items-center gap-1 text-[11px] font-semibold font-mono ${
                          finance.growth_rate_mom >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                        <span>
                          {finance.growth_rate_mom > 0 ? '+' : ''}
                          {finance.growth_rate_mom}% vs bulan lalu
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono">—</div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Proyeksi Tahunan (ARR)
                    </span>
                    <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">
                      Rp {(finance?.arr ?? 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Proyeksi tahunan dari MRR berjalan
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Rata-rata per Sekolah (ARPU)
                    </span>
                    <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">
                      Rp {(finance?.arpu ?? 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Per sekolah aktif
                    </div>
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <Link
                    href="/superadmin/pricing"
                    className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Atur Tarif &amp; Kuota Paket
                  </Link>
                  <Link
                    href="/superadmin/finance"
                    className="px-4 py-2 rounded-full bg-[#150f23] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Buka Buku Besar Tagihan</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Right Block: Quick Action Shortcuts (col-span-4) */}
          <div className="lg:col-span-4">
            <DashboardCard
              title="Akses Cepat Pengaturan"
              subtitle="Pusat konfigurasi keamanan & audit ujian"
              icon={<Cpu className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
            >
              <div className="space-y-3 pt-1">
                <Link
                  href="/superadmin/secrets"
                  className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-violet-50/60 border border-slate-100 hover:border-violet-200/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#150f23] group-hover:text-[#c2ef4e] transition-colors">
                      <Cpu className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#6a5fc1] transition-colors">
                        Kunci API &amp; Keamanan
                      </p>
                      <p className="text-[10px] text-slate-500">Konfigurasi Gemini &amp; DB</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#6a5fc1] transition-colors" />
                </Link>

                <Link
                  href="/analytics"
                  className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#150f23] group-hover:text-[#c2ef4e] transition-colors">
                      <Activity className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Audit Nilai &amp; Ujian
                      </p>
                      <p className="text-[10px] text-slate-500">Telemetri integritas proctoring</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </Link>
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* ROW 5: RECENT ACTIVITIES TABLE */}
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
