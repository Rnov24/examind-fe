'use client'

import React from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  ChevronRight,
  MoreVertical,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { DashboardCard } from './DashboardCard'
import { DashboardEmptyState } from './DashboardEmptyState'

export interface TenantActivityItem {
  id: string | number
  name: string
  code: string
  domain?: string
  subscription_plan?: string
  total_students?: number
  max_students?: number
  is_active?: boolean
}

interface TenantActivityTableProps {
  tenants: TenantActivityItem[]
  isLoading?: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (filter: 'all' | 'active' | 'inactive') => void
  manageAllHref?: string
  title?: string
  subtitle?: string
  className?: string
}

export function TenantActivityTable({
  tenants,
  isLoading = false,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  manageAllHref = '/superadmin/tenants',
  title = 'Aktivitas Sekolah & Lisensi Terbaru',
  subtitle = 'Status operasional dan keaktifan sekolah mitra dalam ekosistem CBT',
  className = '',
}: TenantActivityTableProps) {
  return (
    <DashboardCard noPadding className={className}>
      {/* Table Header with Search & Filter */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={cn(tokens.typography.title, 'text-base font-extrabold text-slate-900')}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn(tokens.typography.bodyMuted, 'font-medium mt-0.5')}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Rounded-full Search Input */}
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari sekolah..."
              className={cn(
                'pl-8 pr-3 py-1.5 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/30 w-full sm:w-52 transition-all',
                tokens.radius.full,
                tokens.border.default
              )}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')
            }
            aria-label="Filter status sekolah"
            className={cn(
              'px-3 py-1.5 bg-slate-50 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/30 cursor-pointer transition-all',
              tokens.radius.full,
              tokens.border.default
            )}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Beroperasi</option>
            <option value="inactive">Nonaktif</option>
          </select>

          {/* Light softened Manage All button */}
          {manageAllHref && (
            <Link
              href={manageAllHref}
              className={cn(
                'px-4 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-2xs',
                tokens.radius.full
              )}
            >
              <span>Lihat Semua Sekolah</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Card List Strategy (<md) */}
      <div className="md:hidden divide-y divide-slate-100 font-sans p-4 space-y-3">
        {isLoading ? (
          <div className="py-8">
            <DashboardEmptyState
              title="Memuat data sekolah..."
              description="Menyinkronkan status operasional sekolah mitra."
            />
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-6">
            <DashboardEmptyState
              icon={<Inbox className="w-6 h-6" aria-hidden="true" />}
              title="Sekolah Tidak Ditemukan"
              description="Tidak ada sekolah yang cocok dengan filter saat ini."
            />
          </div>
        ) : (
          tenants.map((tenant) => {
            const planBadgeColor = (() => {
              const p = tenant.subscription_plan?.toLowerCase()
              if (p === 'enterprise') return cn(tokens.semantic.emerald.badge, 'font-black')
              if (p === 'pro') return cn(tokens.semantic.violet.badge, 'font-black')
              return cn(tokens.semantic.neutral.badge, 'font-bold')
            })()

            return (
              <div
                key={tenant.id}
                className={cn('pt-3 first:pt-0 pb-1 space-y-2.5')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 bg-violet-50 text-[#6a5fc1] border border-violet-200/80 flex items-center justify-center font-bold shrink-0',
                        tokens.radius.lg
                      )}
                    >
                      <Building2 className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate font-sans">
                        {tenant.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {tenant.domain || 'cbt.sekolah.id'}
                      </p>
                    </div>
                  </div>

                  {tenant.is_active ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold shrink-0',
                        tokens.radius.full,
                        tokens.semantic.emerald.badge
                      )}
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Aktif
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0',
                        tokens.radius.full
                      )}
                    >
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase block font-sans font-bold">Kode CBT</span>
                    <span className="font-bold text-slate-800">{tenant.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase block font-sans font-bold">Paket</span>
                    <span
                      className={cn(
                        'inline-block px-1.5 py-0.2 text-[9px] uppercase border font-bold',
                        tokens.radius.xs,
                        planBadgeColor
                      )}
                    >
                      {tenant.subscription_plan || 'STARTER'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase block font-sans font-bold">Peserta</span>
                    <span className="font-bold text-slate-800">
                      {(tenant.total_students ?? 0).toLocaleString('id-ID')}
                      <span className="text-slate-400 text-[9px] font-normal">/{tenant.max_students ?? 500}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={manageAllHref}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between border border-slate-200/70 transition-colors"
                  >
                    <span>Kelola Data Sekolah</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Table Content (hidden on mobile, visible on md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs" aria-label="Tabel Aktivitas Sekolah">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3 px-5 font-semibold">
                Nama Sekolah
              </th>
              <th scope="col" className="py-3 px-4 font-semibold">
                Kode CBT
              </th>
              <th scope="col" className="py-3 px-4 font-semibold">
                Paket Lisensi
              </th>
              <th scope="col" className="py-3 px-4 font-semibold">
                Peserta Didik
              </th>
              <th scope="col" className="py-3 px-4 font-semibold">
                Status Operasional
              </th>
              <th scope="col" className="py-3 px-5 text-right font-semibold">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10">
                  <DashboardEmptyState
                    title="Memuat data sekolah..."
                    description="Menyinkronkan status operasional sekolah mitra."
                  />
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8">
                  <DashboardEmptyState
                    icon={<Inbox className="w-6 h-6" aria-hidden="true" />}
                    title="Sekolah Tidak Ditemukan"
                    description="Tidak ada sekolah yang cocok dengan kriteria pencarian atau filter saat ini."
                  />
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => {
                const planBadgeColor = (() => {
                  const p = tenant.subscription_plan?.toLowerCase()
                  if (p === 'enterprise')
                    return cn(tokens.semantic.emerald.badge, 'font-black')
                  if (p === 'pro')
                    return cn(tokens.semantic.violet.badge, 'font-black')
                  return cn(tokens.semantic.neutral.badge, 'font-bold')
                })()

                return (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* School Name & Domain */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 bg-violet-50 text-[#6a5fc1] border border-violet-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs group-hover:bg-[#150f23] group-hover:text-[#c2ef4e] transition-colors',
                            tokens.radius.lg
                          )}
                        >
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-[#6a5fc1] transition-colors truncate font-sans">
                            {tenant.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {tenant.domain || 'cbt.sekolah.id'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CBT Code */}
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-700">
                      {tenant.code}
                    </td>

                    {/* License Plan */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'inline-block px-2.5 py-0.5 text-[10px] uppercase border shadow-2xs',
                          tokens.radius.full,
                          planBadgeColor
                        )}
                      >
                        {tenant.subscription_plan || 'STARTER'}
                      </span>
                    </td>

                    {/* Students count */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {(tenant.total_students ?? 0).toLocaleString('id-ID')}{' '}
                      <span className="text-slate-400 text-[10px] font-normal">
                        / {tenant.max_students ?? 500}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      {tenant.is_active ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold shadow-2xs',
                            tokens.radius.full,
                            tokens.semantic.emerald.badge
                          )}
                        >
                          <span
                            className={cn('w-2 h-2 bg-emerald-500 ring-2 ring-emerald-200 animate-pulse', tokens.radius.full)}
                            aria-hidden="true"
                          />
                          Aktif Beroperasi
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200',
                            tokens.radius.full
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 bg-slate-400', tokens.radius.full)} aria-hidden="true" />
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={manageAllHref}
                        className={cn(
                          'p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center justify-center',
                          tokens.radius.md
                        )}
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
  )
}

export default TenantActivityTable
