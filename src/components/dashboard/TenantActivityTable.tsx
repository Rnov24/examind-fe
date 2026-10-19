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
  subtitle = 'Status operasional dan keaktifan institusi dalam ekosistem CBT',
  className = '',
}: TenantActivityTableProps) {
  return (
    <DashboardCard noPadding className={className}>
      {/* Table Header with Search & Filter */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
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
              className="pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 w-40 sm:w-52 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')
            }
            aria-label="Filter status sekolah"
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Beroperasi</option>
            <option value="inactive">Nonaktif</option>
          </select>

          {/* Light softened Manage All button */}
          {manageAllHref && (
            <Link
              href={manageAllHref}
              className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>Kelola Semua</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" aria-label="Tabel Aktivitas Sekolah">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3 px-5 font-semibold">
                Institusi Sekolah
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
                    title="Memuat data institusi..."
                    description="Menyinkronkan data status operasional sekolah."
                  />
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8">
                  <DashboardEmptyState
                    icon={<Inbox className="w-6 h-6" aria-hidden="true" />}
                    title="Tidak ada data sekolah"
                    description="Tidak ada sekolah yang cocok dengan kriteria pencarian atau filter saat ini."
                  />
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => {
                const planBadgeColor = (() => {
                  const p = tenant.subscription_plan?.toLowerCase()
                  if (p === 'enterprise')
                    return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                  if (p === 'pro')
                    return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-black'
                  return 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                })()

                return (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* School Name & Domain */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#6a5fc1] border border-violet-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs group-hover:bg-[#150f23] group-hover:text-[#c2ef4e] transition-colors">
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-[#6a5fc1] transition-colors truncate">
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
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase border shadow-2xs ${planBadgeColor}`}
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" aria-hidden="true" />
                          Aktif Beroperasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={manageAllHref}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
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
