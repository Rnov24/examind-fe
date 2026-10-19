'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Building2,
  Plus,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import api from '@/lib/api'
import TenantTable from '@/components/superadmin/TenantTable'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'
import {
  DashboardShell,
  StatCard,
  DashboardCard,
  getSuperAdminNavTabs,
} from '@/components/dashboard'
import { BentoTableSkeleton } from '@/components/ui/Skeleton'
import { useBentoBlock, invalidateBentoCache } from '@/lib/bentoCache'
import { useAuthStore } from '@/stores/authStore'

export default function SuperAdminTenantsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('tenants')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Parallel Fetch: Platform Stats for Top Metrics
  const statsBlock = useBentoBlock<any>({
    key: 'superadmin:stats',
    fetcher: async () => {
      const res = await api.get('/superadmin/stats')
      return res.data.data
    },
    ttlMs: 45000,
  })

  // 2. Parallel Fetch: Tenants Directory List
  const tenantsBlock = useBentoBlock<any[]>({
    key: `superadmin:tenants:${searchQuery}:${filterPlan}`,
    fetcher: async () => {
      const params: Record<string, string> = {}
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (filterPlan) params.plan = filterPlan
      const res = await api.get('/superadmin/tenants', { params })
      return res.data.data || []
    },
    ttlMs: 30000,
  })

  const toggleStatus = async (tenantId: number) => {
    try {
      await api.patch(`/superadmin/tenants/${tenantId}/toggle-status`)
      invalidateBentoCache('superadmin:')
      await Promise.allSettled([tenantsBlock.reload(true), statsBlock.reload(true)])
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mengubah status sekolah.')
    }
  }

  const promptChangePlan = async (tenant: any) => {
    const newPlan = prompt(
      `Ubah paket langganan untuk ${tenant.name} (starter / pro / enterprise):`,
      tenant.subscription_plan
    )
    if (!newPlan || !['starter', 'pro', 'enterprise'].includes(newPlan.toLowerCase())) {
      if (newPlan) alert('Pilihan paket tidak valid (harus starter, pro, atau enterprise).')
      return
    }

    try {
      await api.patch(`/superadmin/tenants/${tenant.id}`, {
        subscription_plan: newPlan.toLowerCase(),
      })
      invalidateBentoCache('superadmin:')
      await Promise.allSettled([tenantsBlock.reload(true), statsBlock.reload(true)])
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal memperbarui paket langganan.')
    }
  }

  const handleCreateTenant = async (formData: TenantFormData) => {
    try {
      setIsSubmitting(true)
      await api.post('/superadmin/tenants', formData)
      setShowCreateModal(false)
      invalidateBentoCache('superadmin:')
      await Promise.allSettled([tenantsBlock.reload(true), statsBlock.reload(true)])
      alert('Sekolah baru berhasil didaftarkan!')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mendaftarkan sekolah baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearchUpdate = useCallback((val: string) => {
    setSearchQuery(val)
  }, [])

  const handlePlanUpdate = useCallback((val: string) => {
    setFilterPlan(val)
  }, [])

  const stats = statsBlock.data
  const tenantsList = tenantsBlock.data || []

  // Top Navigation Tabs matching unified superadmin design
  const navTabs = useMemo(() => getSuperAdminNavTabs(stats?.total_tenants), [stats?.total_tenants])

  return (
    <DashboardShell
      navTabs={navTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      greetingName={user?.full_name || 'Super Admin'}
      greetingSubtitle="Daftar sekolah mitra terdaftar, pengelolaan paket langganan, dan status operasional CBT."
      greetingAction={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              statsBlock.retry()
              tenantsBlock.retry()
            }}
            disabled={statsBlock.isRefreshing || tenantsBlock.isRefreshing}
            title="Muat ulang data sekolah"
            aria-label="Muat ulang data sekolah"
            className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23] disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                statsBlock.isRefreshing || tenantsBlock.isRefreshing
                  ? 'animate-spin text-emerald-600'
                  : ''
              }`}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 transition-all cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#150f23] focus:outline-none"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Tambah Sekolah Baru</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Metric Cards with Rich Semantic Tones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Sekolah */}
          <StatCard
            title="Total Sekolah Terdaftar"
            value={stats?.total_tenants ?? 0}
            icon={<Building2 className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
            tone="indigo"
            subtitle="Sekolah mitra terdaftar di platform CBT"
            className="min-h-[160px]"
          />

          {/* Card 2: Sekolah Aktif */}
          <StatCard
            title="Sekolah Aktif Beroperasi"
            value={stats?.active_tenants ?? 0}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
            tone="emerald"
            subtitle="Menyelenggarakan kegiatan CBT aktif"
            trend={{
              value: `${Math.round(
                ((stats?.active_tenants || 0) / Math.max(stats?.total_tenants || 1, 1)) * 100
              )}%`,
              positive: true,
              label: 'rasio aktif',
            }}
            className="min-h-[160px]"
          />

          {/* Card 3: Distribusi Paket */}
          <StatCard
            title="Paket Enterprise & Pro"
            value={(stats?.plan_distribution?.enterprise ?? 0) + (stats?.plan_distribution?.pro ?? 0)}
            icon={<Sparkles className="w-5 h-5 text-[#6a5fc1]" aria-hidden="true" />}
            tone="violet"
            subtitle={`${stats?.plan_distribution?.enterprise ?? 0} Enterprise • ${
              stats?.plan_distribution?.pro ?? 0
            } Pro • ${stats?.plan_distribution?.starter ?? 0} Starter`}
            trend={{ value: 'Prioritas AI', positive: true }}
            className="min-h-[160px]"
          />
        </div>

        {/* Main Directory & Management Table */}
        <DashboardCard
          title="Direktori & Manajemen Sekolah"
          subtitle="Daftar sekolah mitra, filter paket, dan status operasional CBT"
          icon={<Building2 className="w-4 h-4 text-[#6a5fc1]" aria-hidden="true" />}
          noPadding
        >
          {tenantsBlock.status === 'loading' ? (
            <div className="p-8">
              <BentoTableSkeleton rows={6} staggerIndex={0} />
            </div>
          ) : tenantsBlock.status === 'error' ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-rose-600 font-medium">Gagal memuat data sekolah mitra. Periksa koneksi jaringan lalu coba lagi.</p>
              <button
                type="button"
                onClick={() => tenantsBlock.retry()}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                Muat Ulang Sekolah
              </button>
            </div>
          ) : (
            <TenantTable
              tenants={tenantsList}
              search={searchQuery}
              plan={filterPlan}
              onSearchUpdate={handleSearchUpdate}
              onPlanUpdate={handlePlanUpdate}
              onCreateTenant={() => setShowCreateModal(true)}
              onChangePlan={promptChangePlan}
              onToggleStatus={toggleStatus}
            />
          )}
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
