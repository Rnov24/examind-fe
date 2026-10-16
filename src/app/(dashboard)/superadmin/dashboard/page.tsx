'use client'

import React, { useState, useEffect } from 'react'
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
  ShieldCheck,
  Search,
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

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    subscription_plan: 'pro',
    admin_identifier: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: 'Password123!',
  })

  const loadStats = async () => {
    try {
      const res = await api.get('/superadmin/stats')
      setStats(res.data.data)
    } catch (err) {
      console.error('Failed to load superadmin stats:', err)
    }
  }

  const loadTenants = async (query = searchQuery, plan = filterPlan) => {
    try {
      const params: Record<string, string> = {}
      if (query) params.search = query
      if (plan) params.plan = plan
      const res = await api.get('/superadmin/tenants', { params })
      setTenantsList(res.data.data || [])
    } catch (err) {
      console.error('Failed to load tenants list:', err)
    }
  }

  useEffect(() => {
    loadStats()
    loadTenants()
  }, [])

  const toggleStatus = async (tenantId: number) => {
    try {
      await api.patch(`/superadmin/tenants/${tenantId}/toggle-status`)
      await loadTenants()
      await loadStats()
    } catch (err) {
      alert('Gagal mengubah status tenant.')
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
    } catch (err) {
      alert('Gagal memperbarui paket langganan.')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-purple-50/70 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-50/50 rounded-full blur-2xl"></div>

        <div className="relative flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-indigo-50/70">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Institusi & Tenant
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-[#c2ef4e] font-mono shadow-xs">
                Multi-Tenant Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola seluruh institusi sekolah terdaftar, alokasi paket langganan, dan pemantauan kapasitas tenant.
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" />
            <span>Onboard Sekolah Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards to Related Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/superadmin/finance"
          className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 hover:border-emerald-300 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Finansial & MRR Analytics</p>
              <p className="text-[10px] text-slate-500 font-medium">Laporan revenue & invoice tenant</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 font-mono">Lihat &rarr;</span>
        </Link>

        <Link
          href="/superadmin/pricing"
          className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 hover:border-amber-300 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Pricing & Skema Kredit AI</p>
              <p className="text-[10px] text-slate-500 font-medium">Tier paket, kuota token & promo</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 font-mono">Kelola &rarr;</span>
        </Link>

        <Link
          href="/superadmin/secrets"
          className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 hover:border-indigo-300 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Task-based AI Secrets</p>
              <p className="text-[10px] text-slate-500 font-medium">Provider, model & KMS vault keys</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 font-mono">Buka &rarr;</span>
        </Link>
      </div>

      {/* Global SaaS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Total Sekolah / Tenant
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {stats?.total_tenants || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold font-mono">
            {stats?.active_tenants || 0} tenant aktif beroperasi
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Siswa Terdaftar Global
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {stats?.total_global_students || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Dari {stats?.total_global_users || 0} total pengguna platform
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Guru & Tenaga Pendidik
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {stats?.total_global_teachers || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Pengampu dan penyusun ujian</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Kredit AI Digunakan
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {stats?.total_ai_credits_used || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Total konsumsi token LLM global</p>
        </div>
      </div>

      {/* Tenant Table */}
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
