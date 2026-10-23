'use client'

import React, { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import {
  Button,
  Badge,
  SearchInput,
  Select,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
} from '@/components/ui'

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
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchUpdate(e.target.value)
            }}
            onClear={() => {
              setLocalSearch('')
              onSearchUpdate('')
            }}
            placeholder="Cari nama sekolah, kode, atau domain..."
            aria-label="Cari nama sekolah, kode, atau domain"
            inputSize="sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <Select
              value={localPlan}
              onChange={(e) => {
                setLocalPlan(e.target.value)
                onPlanUpdate(e.target.value)
              }}
              selectSize="sm"
              fullWidth={false}
              aria-label="Filter berdasarkan paket langganan"
            >
              <option value="">Semua Paket Langganan</option>
              <option value="starter">Starter (150 Siswa)</option>
              <option value="pro">Pro (500 Siswa)</option>
              <option value="enterprise">Enterprise (2000 Siswa)</option>
            </Select>
          </div>

          <Button
            onClick={onCreateTenant}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
            className="shrink-0"
          >
            Tambah Sekolah
          </Button>
        </div>
      </div>

      {/* Mobile Card View Strategy (<md) */}
      <div className="space-y-3 md:hidden">
        {tenants.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
          >
            {/* Header: School name & status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm font-display truncate">
                  {t.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  {t.total_teachers} Guru &bull; {t.total_exams} Paket Ujian
                </p>
              </div>

              <Badge
                variant={t.is_active ? 'emerald' : 'rose'}
                size="sm"
                dot
                dotPulse={t.is_active}
                className="shrink-0"
              >
                {t.is_active ? 'Aktif' : 'Ditangguhkan'}
              </Badge>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Kode & Domain</span>
                <span className="font-bold text-slate-900">{t.code}</span>
                <p className="text-[10px] text-slate-500 truncate">{t.domain || `${t.code}.examind.edu`}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Paket Langganan</span>
                <Badge
                  variant={
                    t.subscription_plan?.toLowerCase() === 'enterprise'
                      ? 'emerald'
                      : t.subscription_plan?.toLowerCase() === 'pro'
                      ? 'violet'
                      : 'neutral'
                  }
                  size="xs"
                  className="uppercase tracking-wider font-bold mt-0.5"
                >
                  {t.subscription_plan}
                </Badge>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">Kapasitas Siswa</span>
                  <span className="font-bold text-slate-900">
                    {t.total_students} <span className="text-slate-400 font-normal">/ {t.max_students}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-[#6a5fc1] rounded-full"
                    style={{
                      width: `${Math.min(100, (t.total_students / (t.max_students || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">Kredit AI Digunakan</span>
                <span className="font-bold text-slate-900">{t.ai_credits_used} Kredit</span>
              </div>
            </div>

            {/* Actions (touch target >= 44px) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onChangePlan(t)}
                className="min-h-[44px] justify-center"
              >
                Ubah Paket
              </Button>
              <Button
                size="sm"
                variant={t.is_active ? 'destructive' : 'secondary'}
                onClick={() => onToggleStatus(t.id)}
                className="min-h-[44px] justify-center"
              >
                {t.is_active ? 'Tangguhkan' : 'Aktifkan'}
              </Button>
            </div>
          </div>
        ))}

        {tenants.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[#ddd9ef] shadow-xs">
            <EmptyState
              icon={<Building2 className="w-6 h-6 text-slate-500" aria-hidden="true" />}
              title={isFilterActive ? 'Sekolah Tidak Ditemukan' : 'Belum Ada Sekolah Terdaftar'}
              description={
                isFilterActive
                  ? 'Tidak ada data sekolah yang sesuai dengan kata kunci pencarian.'
                  : 'Mulai dengan mendaftarkan sekolah pertama ke dalam platform CBT EXAMIND.'
              }
              action={
                isFilterActive ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setLocalSearch('')
                      setLocalPlan('')
                      onSearchUpdate('')
                      onPlanUpdate('')
                    }}
                    className="min-h-[44px]"
                  >
                    Atur Ulang Pencarian
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={onCreateTenant}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
                    className="min-h-[44px]"
                  >
                    Daftarkan Sekolah Baru
                  </Button>
                )
              }
            />
          </div>
        )}
      </div>

      {/* Desktop Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nama Sekolah</TableHead>
                <TableHead>Kode & Domain</TableHead>
                <TableHead>Paket Langganan</TableHead>
                <TableHead>Kapasitas Siswa</TableHead>
                <TableHead>Kredit AI Digunakan</TableHead>
                <TableHead>Status Operasional</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="pl-6">
                    <div className="font-bold text-slate-900 text-sm max-w-xs truncate min-w-0 font-display">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {t.total_teachers} Guru &bull; {t.total_exams} Paket Ujian
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="font-mono px-2 py-0.5 rounded bg-[#f1effa] border border-[#ddd9ef] text-[#1f1633] font-bold text-[11px]">
                      {t.code}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono truncate max-w-[140px]">
                      {t.domain || `${t.code}.examind.edu`}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        t.subscription_plan?.toLowerCase() === 'enterprise'
                          ? 'emerald'
                          : t.subscription_plan?.toLowerCase() === 'pro'
                          ? 'violet'
                          : 'neutral'
                      }
                      size="xs"
                      className="uppercase tracking-wider font-bold"
                    >
                      {t.subscription_plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-slate-900">{t.total_students}</span>
                      <span className="text-slate-500">/ {t.max_students}</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-[#f1effa] border border-[#ddd9ef] overflow-hidden mt-1 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-[#6a5fc1] rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (t.total_students / (t.max_students || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {t.ai_credits_used}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={t.is_active ? 'emerald' : 'rose'}
                      size="sm"
                      dot
                      dotPulse={t.is_active}
                    >
                      {t.is_active ? 'Aktif' : 'Ditangguhkan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => onChangePlan(t)}
                      >
                        Ubah Paket Langganan
                      </Button>
                      <Button
                        size="xs"
                        variant={t.is_active ? 'destructive' : 'secondary'}
                        onClick={() => onToggleStatus(t.id)}
                      >
                        {t.is_active ? 'Tangguhkan' : 'Aktifkan'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={<Building2 className="w-6 h-6 text-slate-500" aria-hidden="true" />}
                      title={isFilterActive ? 'Sekolah Tidak Ditemukan' : 'Belum Ada Sekolah Terdaftar'}
                      description={
                        isFilterActive
                          ? 'Tidak ada data sekolah yang sesuai dengan filter paket atau kata kunci pencarian.'
                          : 'Mulai dengan mendaftarkan sekolah pertama ke dalam platform CBT EXAMIND.'
                      }
                      action={
                        isFilterActive ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setLocalSearch('')
                              setLocalPlan('')
                              onSearchUpdate('')
                              onPlanUpdate('')
                            }}
                          >
                            Atur Ulang Pencarian
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={onCreateTenant}
                            leftIcon={<Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
                          >
                            Daftarkan Sekolah Baru
                          </Button>
                        )
                      }
                    />
                  </TableCell>
                </tr>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
