'use client'

import React, { useState } from 'react'
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
  RefreshCw,
  ChevronRight,
  Wallet,
} from 'lucide-react'
import api from '@/lib/api'
import TenantModal, { TenantFormData } from '@/components/superadmin/TenantModal'
import { BentoBlock } from '@/components/ui/BentoBlock'
import { BentoHealthSkeleton, BentoMetricSkeleton } from '@/components/ui/Skeleton'
import { useBentoBlock, invalidateBentoCache } from '@/lib/bentoCache'

export default function SuperAdminDashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleCreateTenant = async (formData: TenantFormData) => {
    try {
      setIsSubmitting(true)
      await api.post('/superadmin/tenants', formData)
      setShowCreateModal(false)
      invalidateBentoCache('superadmin:')
      await Promise.allSettled([statsBlock.reload(), financeBlock.reload()])
      alert('Sekolah baru berhasil didaftarkan!')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mendaftarkan sekolah baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stats = statsBlock.data
  const finance = financeBlock.data

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Slim Header - Always renders instantly */}
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

      {/* Block 1: System-Status Strip - Independent loading state */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
          <span className="font-display font-bold text-slate-900">Status Sistem</span>
        </div>

        {statsBlock.status === 'loading' ? (
          <BentoHealthSkeleton count={3} staggerIndex={0} />
        ) : statsBlock.status === 'error' ? (
          <div className="flex items-center gap-2 text-rose-600 font-medium">
            <span>Status sistem tidak tersedia saat ini.</span>
          </div>
        ) : (
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
        )}

        <button
          type="button"
          onClick={() => statsBlock.retry()}
          disabled={statsBlock.isRefreshing}
          title="Perbarui status platform"
          className="text-xs font-mono font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3 h-3 text-slate-400 ${statsBlock.isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{statsBlock.isRefreshing ? 'Memperbarui...' : 'Perbarui'}</span>
        </button>
      </div>

      {/* Bento Grid: Independent per-block cards (NOT a single merged panel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bento Block A: Sekolah Terdaftar */}
        <BentoBlock
          title="Sekolah Terdaftar"
          icon={<Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />}
          headerAction={
            <Link
              href="/superadmin/tenants"
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5 transition-colors"
            >
              <span>Kelola</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          }
          status={statsBlock.status}
          error={statsBlock.error}
          onRetry={statsBlock.retry}
          staggerIndex={0}
          skeleton={<BentoMetricSkeleton staggerIndex={0} />}
        >
          <div className="space-y-3">
            <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {stats?.total_tenants ?? 0}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-emerald-600 font-semibold">
                {stats?.active_tenants ?? 0} aktif beroperasi
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                {stats?.plan_distribution?.enterprise ?? 0} enterprise
              </span>
            </div>
          </div>
        </BentoBlock>

        {/* Bento Block B: Siswa */}
        <BentoBlock
          title="Peserta Didik (Siswa)"
          icon={<GraduationCap className="w-4 h-4 text-slate-400" aria-hidden="true" />}
          status={statsBlock.status}
          error={statsBlock.error}
          onRetry={statsBlock.retry}
          staggerIndex={1}
          skeleton={<BentoMetricSkeleton staggerIndex={1} />}
        >
          <div className="space-y-3">
            <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {stats?.total_global_students ?? 0}
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
              Dari {stats?.total_global_users ?? 0} total pengguna akun
            </div>
          </div>
        </BentoBlock>

        {/* Bento Block C: Guru */}
        <BentoBlock
          title="Tenaga Pendidik (Guru)"
          icon={<Users className="w-4 h-4 text-slate-400" aria-hidden="true" />}
          status={statsBlock.status}
          error={statsBlock.error}
          onRetry={statsBlock.retry}
          staggerIndex={2}
          skeleton={<BentoMetricSkeleton staggerIndex={2} />}
        >
          <div className="space-y-3">
            <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {stats?.total_global_teachers ?? 0}
            </div>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
              Pendidik terdaftar di seluruh sekolah
            </div>
          </div>
        </BentoBlock>
      </div>

      {/* Lower Bento Grid: Parallel Loaded Finance + Navigation Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bento Block D: Ringkasan Finansial Platform (Loads in parallel) */}
        <BentoBlock
          title="Ringkasan Finansial Platform"
          subtitle="Estimasi pendapatan berulang bulanan dan tahunan"
          icon={<Wallet className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
          headerAction={
            <Link
              href="/superadmin/finance"
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5 transition-colors"
            >
              <span>Laporan Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          }
          status={financeBlock.status}
          error={financeBlock.error}
          onRetry={financeBlock.retry}
          staggerIndex={3}
          skeleton={
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                  <div className="h-3 w-16 rounded bento-shimmer" style={{ animationDelay: '300ms' }} />
                  <div className="h-6 w-28 rounded bento-shimmer" style={{ animationDelay: '300ms' }} />
                </div>
                <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                  <div className="h-3 w-16 rounded bento-shimmer" style={{ animationDelay: '350ms' }} />
                  <div className="h-6 w-28 rounded bento-shimmer" style={{ animationDelay: '350ms' }} />
                </div>
              </div>
              <div className="h-4 w-3/4 rounded bento-shimmer" style={{ animationDelay: '400ms' }} />
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500">
                  MRR (Monthly Recurring)
                </span>
                <div className="font-display text-xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  Rp {(finance?.mrr ?? 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-emerald-600 font-medium">Pendapatan bulanan aktif</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500">
                  ARR (Annual Run Rate)
                </span>
                <div className="font-display text-xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  Rp {(finance?.arr ?? 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-indigo-600 font-medium">Proyeksi tahunan terhitung</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Rata-rata Pendapatan per Sekolah (ARPU):</span>
              <span className="font-bold text-slate-900 font-mono">
                Rp {(finance?.arpu ?? 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </BentoBlock>

        {/* Bento Block E: Akses Cepat Pengaturan (Instant ready) */}
        <BentoBlock
          title="Akses Cepat Pengaturan"
          subtitle="Pintasan ke modul manajemen platform"
          status="ready"
          noPadding
        >
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
                    Keuangan & Tagihan
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Laporan tagihan faktur dan ringkasan pendapatan
                  </p>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
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
                    Harga Layanan & Kuota
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Paket langganan dan alokasi kuota AI sekolah
                  </p>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
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
                    Kunci API & Keamanan
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pengaturan penyedia model AI dan kunci keamanan
                  </p>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </BentoBlock>
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
