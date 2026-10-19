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

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Institusi Sekolah</TableHead>
              <TableHead>Kode & Domain</TableHead>
              <TableHead>Paket Langganan</TableHead>
              <TableHead>Kapasitas Siswa</TableHead>
              <TableHead>Kredit AI Digunakan</TableHead>
              <TableHead>Status Tenant</TableHead>
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
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold text-[11px]">
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
                  <div className="w-24 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mt-1 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-[#6a5fc1] rounded-full transition-all duration-300"
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
                      Ubah Paket
                    </Button>
                    <Button
                      size="xs"
                      variant={t.is_active ? 'destructive' : 'secondary'}
                      onClick={() => onToggleStatus(t.id)}
                    >
                      {t.is_active ? 'Suspend' : 'Aktifkan'}
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
                    title={isFilterActive ? 'Tenant Tidak Ditemukan' : 'Belum Ada Sekolah Terdaftar'}
                    description={
                      isFilterActive
                        ? 'Tidak ada data sekolah yang sesuai dengan filter paket atau kata kunci pencarian.'
                        : 'Mulai dengan mendaftarkan institusi sekolah pertama ke dalam platform multi-tenant.'
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
                          Reset Filter & Pencarian
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={onCreateTenant}
                          leftIcon={<Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
                        >
                          Onboard Sekolah Baru
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
  )
}
