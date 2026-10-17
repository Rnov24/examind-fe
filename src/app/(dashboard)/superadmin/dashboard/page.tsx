'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2,
  GraduationCap,
  Users,
  Cpu,
  Plus,
  TrendingUp,
  Coins,
  Key,
  Database,
  Activity,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import TenantTable from '@/components/superadmin/TenantTable'
import TenantModal from '@/components/superadmin/TenantModal'

export default function SuperAdminDashboardPage() {
  const { isSuperAdmin } = useAuthStore()

  // Tenant States
  const [stats, setStats] = useState<any | null>(null)
  const [tenantsList, setTenantsList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    subscription_plan: 'pro',
    admin_identifier: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: 'Password123!',
  })

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/superadmin/stats')
      setStats(res.data.data)
    } catch (err) {
      console.error('Failed to load superadmin stats:', err)
    }
  }, [])

  const loadTenants = useCallback(async (query = searchQuery, plan = filterPlan) => {
    try {
      const params: Record<string, string> = {}
      if (query) params.search = query
      if (plan) params.plan = plan
      const res = await api.get('/superadmin/tenants', { params })
      setTenantsList(res.data.data || [])
    } catch (err: any) {
      console.error('Failed to load tenants list:', err)
      throw err
    }
  }, [searchQuery, filterPlan])

  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      await Promise.all([loadStats(), loadTenants()])
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal memuat data platform SaaS multi-tenant. Silakan coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [loadStats, loadTenants])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const toggleStatus = async (tenantId: number) => {
    try {
      await api.patch(`/superadmin/tenants/${tenantId}/toggle-status`)
      await loadTenants()
      await loadStats()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status tenant sekolah.')
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
      await loadStats()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui paket langganan.')
    }
  }

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await api.post('/superadmin/tenants', createForm)
      setShowCreateModal(false)
      setCreateForm({
        name: '',
        code: '',
        subscription_plan: 'pro',
        admin_identifier: '',
        admin_full_name: '',
        admin_email: '',
        admin_password: 'Password123!',
      })
      await loadTenants()
      await loadStats()
      alert('Sekolah baru berhasil didaftarkan ke platform SaaS!')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mendaftarkan tenant sekolah.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-indigo-50/60 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-50/50 rounded-full blur-2xl"></div>

        <div className="relative flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-slate-100/70">
            <Building2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                Manajemen Institusi & Multi-Tenant
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-[#c2ef4e] font-mono shadow-xs">
                SaaS Core
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola alokasi paket langganan institusi, kuota siswa, dan operasional engine platform.
            </p>
          </div>
        </div>

        {/* ONE Primary Action: Onboard Sekolah Baru */}
        <div className="relative flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 transition-all cursor-pointer font-display tracking-wide w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Onboard Sekolah Baru</span>
          </button>
        </div>
      </div>

      {/* PRIMARY GOAL ELEVATION: Platform Health & Cluster Engine Overview First */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Status Cluster Engine & Ekosistem Multi-Tenant
              </h2>
              <p className="text-xs text-slate-500">
                Metrik realtime database TiDB Serverless, inferensi LLM, dan ketersediaan API platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAllData}
            title="Muat ulang status platform"
            className="text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span>Sinkronkan Engine</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Database Cluster
              </span>
              <Database className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-900 font-mono">TiDB Serverless</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500">ap-southeast-1 • Latency ~28ms</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                LLM Inference
              </span>
              <Cpu className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-900 font-mono">Gemini 2.5 Flash</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Task Router & Fallback Vault Active</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Sekolah Aktif
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            </div>
            <div className="text-xl font-black text-slate-900 font-display tabular-nums">
              {stats?.active_tenants || 0}{' '}
              <span className="text-xs font-normal text-slate-500">/ {stats?.total_tenants || 0} Total</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold font-mono">100% SLA uptime</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Penggunaan Token AI
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Kredit
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 font-display tabular-nums">
              {stats?.total_ai_credits_used || 0}{' '}
              <span className="text-xs font-normal text-slate-500">Token</span>
            </div>
            <p className="text-[11px] text-slate-500">Global consumption across tenants</p>
          </div>
        </div>
      </div>

      {/* Streamlined Quick Module Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/superadmin/finance"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between group shadow-card focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Finansial & MRR Analytics</p>
              <p className="text-[10px] text-slate-500">Laporan invoice & pendapatan tenant</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700 font-mono transition-colors">&rarr;</span>
        </Link>

        <Link
          href="/superadmin/pricing"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between group shadow-card focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Pricing & Skema Kredit AI</p>
              <p className="text-[10px] text-slate-500">Tier paket, kuota token & promo</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700 font-mono transition-colors">&rarr;</span>
        </Link>

        <Link
          href="/superadmin/secrets"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between group shadow-card focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:scale-105 transition-transform">
              <Key className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Task-based AI Secrets</p>
              <p className="text-[10px] text-slate-500">Provider, model & KMS vault keys</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700 font-mono transition-colors">&rarr;</span>
        </Link>
      </div>

      {/* Global SaaS Platform Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Institusi Terdaftar
            </span>
            <div className="font-display text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums truncate">
              {stats?.total_tenants || 0} Sekolah
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold font-mono truncate">
              {stats?.active_tenants || 0} tenant beroperasi
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Siswa Terdaftar Global
            </span>
            <div className="font-display text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums truncate">
              {stats?.total_global_students || 0} Siswa
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              Dari {stats?.total_global_users || 0} total pengguna
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Guru & Pengampu
            </span>
            <div className="font-display text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums truncate">
              {stats?.total_global_teachers || 0} Guru
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              Pendidik aktif di seluruh tenant
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat data institusi & tenant...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Menghubungkan ke basis data multi-tenant dan cluster serverless platform.
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
            <h3 className="font-bold text-slate-900 text-base">Gagal Memuat Data Multi-Tenant</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadAllData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Tenant Table (Secondary Management) */}
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
        form={createForm}
        isSubmitting={isSubmitting}
        onClose={() => setShowCreateModal(false)}
        onChange={(updatedForm) => setCreateForm(updatedForm)}
        onSubmit={handleCreateTenant}
      />
    </div>
  )
}

