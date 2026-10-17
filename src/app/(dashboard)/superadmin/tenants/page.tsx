'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Plus,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import api from '@/lib/api'
import TenantTable from '@/components/superadmin/TenantTable'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'

export default function SuperAdminTenantsPage() {
  const [tenantsList, setTenantsList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadTenants = useCallback(async (query = searchQuery, plan = filterPlan) => {
    try {
      const params: Record<string, string> = {}
      if (query) params.search = query
      if (plan) params.plan = plan
      const res = await api.get('/superadmin/tenants', { params })
      setTenantsList(res.data.data || [])
      setErrorMessage(null)
    } catch (err: any) {
      console.error('Failed to load tenants list:', err)
      setErrorMessage(
        err?.response?.data?.message || 'Gagal memuat data sekolah. Silakan coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, filterPlan])

  useEffect(() => {
    loadTenants()
  }, [loadTenants])

  const toggleStatus = async (tenantId: number) => {
    try {
      await api.patch(`/superadmin/tenants/${tenantId}/toggle-status`)
      await loadTenants()
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
      await loadTenants()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal memperbarui paket langganan.')
    }
  }

  const handleCreateTenant = async (formData: TenantFormData) => {
    try {
      setIsSubmitting(true)
      await api.post('/superadmin/tenants', formData)
      setShowCreateModal(false)
      await loadTenants()
      alert('Sekolah baru berhasil didaftarkan!')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mendaftarkan sekolah baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
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

        {/* ONE Primary Action: Tambah Sekolah Baru */}
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat data sekolah...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Menghubungkan ke basis data platform untuk mengambil daftar sekolah.
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Gagal Memuat Data Sekolah</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              loadTenants()
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Tenant Table */}
      {!isLoading && !errorMessage && (
        <TenantTable
          tenants={tenantsList}
          search={searchQuery}
          plan={filterPlan}
          onSearchUpdate={(val) => {
            setSearchQuery(val)
            loadTenants(val, filterPlan)
          }}
          onPlanUpdate={(val) => {
            setFilterPlan(val)
            loadTenants(searchQuery, val)
          }}
          onCreateTenant={() => setShowCreateModal(true)}
          onChangePlan={promptChangePlan}
          onToggleStatus={toggleStatus}
        />
      )}

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
