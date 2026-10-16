'use client'

import React, { useState } from 'react'
import { Search, Plus } from 'lucide-react'

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

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchUpdate(e.target.value)
            }}
            type="text"
            placeholder="Cari sekolah, kode, atau domain..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={localPlan}
            onChange={(e) => {
              setLocalPlan(e.target.value)
              onPlanUpdate(e.target.value)
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
          >
            <option value="">Semua Paket</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <button
            onClick={onCreateTenant}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sekolah</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider font-mono">
                <th className="p-4 pl-6">Institusi Sekolah</th>
                <th className="p-4">Kode & Domain</th>
                <th className="p-4">Paket Langganan</th>
                <th className="p-4">Kuota Siswa</th>
                <th className="p-4">Kredit AI Digunakan</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {t.total_teachers} Guru &bull; {t.total_exams} Ujian Dibuat
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold text-[11px]">
                      {t.code}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {t.domain || `${t.code}.examind.edu`}
                    </div>
                  </td>
                  <td className="p-4">
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
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-mono">
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
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {t.ai_credits_used}
                  </td>
                  <td className="p-4">
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
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onChangePlan(t)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Ubah Paket
                      </button>
                      <button
                        onClick={() => onToggleStatus(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border ${
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
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data sekolah / tenant yang sesuai dengan filter.
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
