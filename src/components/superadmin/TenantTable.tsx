'use client'

import React, { useState } from 'react'
import { Search, Plus, Building2 } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  code: string
  domain?: string
  subscription_plan: string
  total_students: number
  max_students: number
  total_teachers: number
  total_exams: number
  ai_credits_used: number
  is_active: boolean
}

interface TenantTableProps {
  tenants: Tenant[]
  search: string
  plan: string
  onSearchUpdate: (val: string) => void
  onPlanUpdate: (val: string) => void
  onCreateTenant: () => void
  onChangePlan: (tenant: Tenant) => void
  onToggleStatus: (tenantId: number) => void
}

export default function TenantTable({
  tenants,
  search,
  plan,
  onSearchUpdate,
  onPlanUpdate,
  onCreateTenant,
  onChangePlan,
  onToggleStatus,
}: TenantTableProps) {
  const [localSearch, setLocalSearch] = useState(search)
  const [localPlan, setLocalPlan] = useState(plan)

  const isFilterActive = Boolean(localSearch.trim() || localPlan)

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchUpdate(e.target.value)
            }}
            type="text"
            placeholder="Cari nama sekolah, kode, atau domain..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={localPlan}
            onChange={(e) => {
              setLocalPlan(e.target.value)
              onPlanUpdate(e.target.value)
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-slate-50 cursor-pointer"
          >
            <option value="">Semua Paket Langganan</option>
            <option value="starter">Starter (150 Siswa)</option>
            <option value="pro">Pro (500 Siswa)</option>
            <option value="enterprise">Enterprise (2000 Siswa)</option>
          </select>

          <button
            onClick={onCreateTenant}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
            <span>Tambah Sekolah</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider font-mono text-[11px]">
                <th className="p-4 pl-6">Institusi Sekolah</th>
                <th className="p-4">Kode & Domain</th>
                <th className="p-4">Paket Langganan</th>
                <th className="p-4">Kapasitas Siswa</th>
                <th className="p-4">Kredit AI Digunakan</th>
                <th className="p-4">Status Tenant</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-900 text-sm max-w-xs truncate min-w-0">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {t.total_teachers} Guru &bull; {t.total_exams} Paket Ujian
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold text-[11px]">
                      {t.code}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono truncate max-w-[140px]">
                      {t.domain || `${t.code}.examind.edu`}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono border inline-block ${
                        t.subscription_plan === 'enterprise'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : t.subscription_plan === 'pro'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.subscription_plan}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-slate-900">{t.total_students}</span>
                      <span className="text-slate-500">/ {t.max_students}</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mt-1">
                      <div
                        className="h-full bg-slate-900 rounded-full"
                        style={{
                          width: `${Math.min(100, (t.total_students / (t.max_students || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {t.ai_credits_used}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border ${
                        t.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {t.is_active ? 'Aktif' : 'Ditangguhkan'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onChangePlan(t)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                      >
                        Ubah Paket
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border focus:ring-2 focus:ring-slate-900/10 focus:outline-none ${
                          t.is_active
                            ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {t.is_active ? 'Suspend' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                        <Building2 className="w-5 h-5" aria-hidden="true" />
                      </div>
                      {isFilterActive ? (
                        <>
                          <p className="font-bold text-slate-900 text-sm">Tenant Tidak Ditemukan</p>
                          <p className="text-xs text-slate-500 mt-1 mb-3">
                            Tidak ada data sekolah yang sesuai dengan filter paket atau kata kunci pencarian.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalSearch('')
                              setLocalPlan('')
                              onSearchUpdate('')
                              onPlanUpdate('')
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Reset Filter & Pencarian
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-900 text-sm">Belum Ada Sekolah Terdaftar</p>
                          <p className="text-xs text-slate-500 mt-1 mb-3">
                            Mulai dengan mendaftarkan institusi sekolah pertama ke dalam platform multi-tenant.
                          </p>
                          <button
                            type="button"
                            onClick={onCreateTenant}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                            <span>Onboard Sekolah Baru</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

