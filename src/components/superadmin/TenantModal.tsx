'use client'

import React from 'react'
import { Building2, X } from 'lucide-react'

interface TenantForm {
  name: string
  code: string
  subscription_plan: string
  admin_identifier: string
  admin_full_name: string
  admin_email: string
  admin_password: string
}

interface TenantModalProps {
  isOpen: boolean
  form: TenantForm
  isSubmitting: boolean
  onClose: () => void
  onChange: (form: TenantForm) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function TenantModal({
  isOpen,
  form,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: TenantModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Onboard Sekolah Baru (Multi-Tenant)</h3>
              <p className="text-xs text-slate-500">Daftarkan institusi sekolah dan buat akun administrator pertamanya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="font-bold text-slate-700">Nama Resmi Sekolah</label>
              <input
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
                type="text"
                placeholder="Contoh: SMAN 2 Kota Bandung"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kode Unik Institusi</label>
              <input
                value={form.code}
                onChange={(e) => onChange({ ...form, code: e.target.value })}
                required
                type="text"
                placeholder="sman2bdg"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-slate-400 uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Paket Langganan</label>
              <select
                value={form.subscription_plan}
                onChange={(e) => onChange({ ...form, subscription_plan: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              >
                <option value="starter">Starter (150 Siswa)</option>
                <option value="pro">Pro (500 Siswa)</option>
                <option value="enterprise">Enterprise (2000 Siswa)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-900 text-xs mb-2">Akun Administrator Sekolah Pertama:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Username / NIP Admin</label>
                <input
                  value={form.admin_identifier}
                  onChange={(e) => onChange({ ...form, admin_identifier: e.target.value })}
                  required
                  type="text"
                  placeholder="admin_sman2bdg"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap Admin</label>
                <input
                  value={form.admin_full_name}
                  onChange={(e) => onChange({ ...form, admin_full_name: e.target.value })}
                  required
                  type="text"
                  placeholder="Drs. Mulyadi (Kepala TU)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Admin</label>
                <input
                  value={form.admin_email}
                  onChange={(e) => onChange({ ...form, admin_email: e.target.value })}
                  required
                  type="email"
                  placeholder="admin@sman2bdg.sch.id"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Password Awal</label>
                <input
                  value={form.admin_password}
                  onChange={(e) => onChange({ ...form, admin_password: e.target.value })}
                  required
                  type="password"
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Konfirmasi Onboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
