'use client'

import React, { useState, useCallback } from 'react'
import {
  Building2,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import api from '@/lib/api'
import TenantTable from '@/components/superadmin/TenantTable'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'
import { BentoBlock } from '@/components/ui/BentoBlock'
import { BentoMetricSkeleton, BentoTableSkeleton } from '@/components/ui/Skeleton'
import { useBentoBlock, invalidateBentoCache } from '@/lib/bentoCache'

export default function SuperAdminTenantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Parallel Fetch: Platform Stats for Top Bento Metrics
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header - Renders immediately without blocking */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="relative flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-slate-100/70">
            <Building2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              Kelola Sekolah
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Daftar sekolah terdaftar, pengelolaan paket langganan, dan status operasional.
            </p>
          </div>
        </div>

        {/* Primary Action: Tambah Sekolah Baru */}
        <div className="relative flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 transition-all cursor-pointer font-display tracking-wide w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Tambah Sekolah Baru</span>
          </button>
        </div>
      </div>

      {/* Top Bento Metrics: Independent blocks loaded in parallel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Bento 1: Total Sekolah */}
        <BentoBlock
          title="Total Sekolah"
          icon={<Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />}
          status={statsBlock.status}
          error={statsBlock.error}
          onRetry={statsBlock.retry}
          staggerIndex={0}
          skeleton={<BentoMetricSkeleton staggerIndex={0} />}
        >
          <div className="space-y-2">
            <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {stats?.total_tenants ?? 0}
            </div>
            <p className="text-xs text-slate-500">Institusi pendidikan terdaftar di platform</p>
          </div>
        </BentoBlock>

        {/* Bento 2: Sekolah Aktif */}
        <BentoBlock
          title="Sekolah Aktif"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
          status={statsBlock.status}
          error={statsBlock.error}
          onRetry={statsBlock.retry}
          staggerIndex={1}
          skeleton={<BentoMetricSkeleton staggerIndex={1} />}
        >
          <div className="space-y-2">
            <div className="font-display text-3xl font-extrabold text-emerald-600 tracking-tight tabular-nums">
              {stats?.active_tenants ?? 0}
            </div>
            <p className="text-xs text-slate-500">Aktif menyelenggarakan ujian dan kegiatan CBT</p>
          </div>
        </BentoBlock>

        {/* Bento 3: Distribusi Paket */}
        <BentoBlock
          title="Paket Enterprise & Pro"
          icon={<Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
          status={statsBlock.status}
          error={statsBlock.error}
          onRetry={statsBlock.retry}
          staggerIndex={2}
          skeleton={<BentoMetricSkeleton staggerIndex={2} />}
        >
          <div className="space-y-2">
            <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {(stats?.plan_distribution?.enterprise ?? 0) + (stats?.plan_distribution?.pro ?? 0)}
            </div>
            <p className="text-xs text-slate-500">
              {stats?.plan_distribution?.enterprise ?? 0} Enterprise, {stats?.plan_distribution?.pro ?? 0} Pro, {stats?.plan_distribution?.starter ?? 0} Starter
            </p>
          </div>
        </BentoBlock>
      </div>

      {/* Main Bento Block: Tenant Directory & Table */}
      <BentoBlock
        title="Direktori & Manajemen Sekolah"
        subtitle="Daftar institusi, filter paket, dan pembaruan kuota AI"
        icon={<Building2 className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
        status={tenantsBlock.status}
        error={tenantsBlock.error}
        onRetry={tenantsBlock.retry}
        retryLabel="Muat Ulang Sekolah"
        staggerIndex={3}
        noPadding
        skeleton={<BentoTableSkeleton rows={6} staggerIndex={3} />}
      >
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
      </BentoBlock>

      {/* Tenant Onboard Modal */}
      <TenantModal
        isOpen={showCreateModal}
        isSubmitting={isSubmitting}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
      />
    </div>
  )
}
