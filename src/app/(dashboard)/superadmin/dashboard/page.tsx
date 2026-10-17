'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  Plus,
  TrendingUp,
  Coins,
  Key,
  Activity,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import api from '@/lib/api'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<any | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setErrorMessage(null)
      const res = await api.get('/superadmin/stats')
      setStats(res.data.data)
    } catch (err: any) {
      console.error('Failed to load superadmin stats:', err)
      setErrorMessage(
        err?.response?.data?.message || 'Gagal memuat ringkasan statistik. Silakan coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleCreateTenant = async (formData: TenantFormData) => {
    try {
      setIsSubmitting(true)
      await api.post('/superadmin/tenants', formData)
      setShowCreateModal(false)
      await loadStats()
      alert('Sekolah baru berhasil didaftarkan!')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mendaftarkan sekolah baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Slim Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-slate-100/70">
            <LayoutDashboard className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ringkasan institusi, pengguna, dan status operasional sistem.
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

      {/* ONE Compact System-Status Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
          <span className="font-display font-bold text-slate-900">Status Sistem</span>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
          {/* Database */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-slate-500 font-medium">Database:</span>
            <span className="font-semibold text-slate-900">Online</span>
          </div>

          {/* AI */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-slate-500 font-medium">Layanan AI:</span>
            <span className="font-semibold text-slate-900">Aktif</span>
          </div>

          {/* API */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-slate-500 font-medium">API Platform:</span>
            <span className="font-semibold text-slate-900">Normal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true)
            loadStats()
          }}
          title="Perbarui status platform"
          className="text-xs font-mono font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" aria-hidden="true" />
          <span>Perbarui</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat ringkasan platform...</h3>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Gagal Memuat Data</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              loadStats()
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* ONE Hero Metric Row */}
      {!isLoading && !errorMessage && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-6 md:gap-0">
            {/* 1. Sekolah terdaftar */}
            <div className="md:px-6 first:pl-0 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>Sekolah Terdaftar</span>
              </div>
              <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {stats?.total_tenants || 0}
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-600 font-medium">
                  {stats?.active_tenants || 0} aktif beroperasi
                </span>
                <Link
                  href="/superadmin/tenants"
                  className="text-slate-500 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5 transition-colors"
                >
                  <span>Kelola</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* 2. Siswa */}
            <div className="md:px-6 space-y-2 pt-6 md:pt-0">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <GraduationCap className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>Siswa</span>
              </div>
              <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {stats?.total_global_students || 0}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Dari {stats?.total_global_users || 0} total pengguna akun
              </p>
            </div>

            {/* 3. Guru */}
            <div className="md:px-6 last:pr-0 space-y-2 pt-6 md:pt-0">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>Guru</span>
              </div>
              <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {stats?.total_global_teachers || 0}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Pendidik terdaftar di seluruh sekolah
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick links as a simple divided list */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-display">Akses Cepat Pengaturan</h2>
          <span className="text-[11px] text-slate-400 font-mono">Navigasi Langsung</span>
        </div>
        <div className="divide-y divide-slate-100">
          <Link
            href="/superadmin/finance"
            className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Keuangan
                </p>
                <p className="text-[11px] text-slate-500">
                  Laporan tagihan dan ringkasan pendapatan
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <Link
            href="/superadmin/pricing"
            className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Coins className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Harga Layanan
                </p>
                <p className="text-[11px] text-slate-500">
                  Paket langganan dan alokasi kuota AI
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <Link
            href="/superadmin/secrets"
            className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Key className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Kunci API
                </p>
                <p className="text-[11px] text-slate-500">
                  Pengaturan penyedia model AI dan kunci keamanan
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

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
