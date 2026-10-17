'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Building2, X, Loader2, RefreshCw, Copy, Check, ShieldCheck, KeyRound } from 'lucide-react'

export interface TenantFormData {
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
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (formData: TenantFormData) => void | Promise<void>
}

function generateSecurePassword(length = 12): string {
  // Exclude ambiguous characters (0, O, 1, l, I) for readability
  const charset = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ!@#$%&*'
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, (x) => charset[x % charset.length]).join('')
  }
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('')
}

function createInitialForm(): TenantFormData {
  return {
    name: '',
    code: '',
    subscription_plan: 'pro',
    admin_identifier: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: generateSecurePassword(12),
  }
}

export default function TenantModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: TenantModalProps) {
  const schoolNameInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<TenantFormData>(createInitialForm)
  const [copiedPassword, setCopiedPassword] = useState(false)

  // Hold the latest onClose in a ref so the effect below only re-runs when
  // isOpen changes -- never on parent re-renders or inline prop recreation.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const prevIsOpenRef = useRef(false)

  // When modal transitions from closed to open: fresh state + new secure password
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setForm(createInitialForm())
      setCopiedPassword(false)

      const timer = setTimeout(() => {
        schoolNameInputRef.current?.focus()
      }, 50)

      return () => clearTimeout(timer)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen])

  // Keydown listener depends strictly on isOpen
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleRegeneratePassword = useCallback(() => {
    const nextPassword = generateSecurePassword(12)
    setForm((prev) => ({ ...prev, admin_password: nextPassword }))
    setCopiedPassword(false)
  }, [])

  const handleCopyPassword = useCallback(async () => {
    if (!form.admin_password) return
    try {
      await navigator.clipboard.writeText(form.admin_password)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    } catch (err) {
      console.error('Failed to copy password to clipboard:', err)
    }
  }, [form.admin_password])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#150f23] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[#150f23]/10">
              <Building2 className="w-5 h-5 text-[#c2ef4e]" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Multi-Tenant
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Isolasi Data
                </span>
              </div>
              <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg tracking-tight mt-0.5">
                Onboard Sekolah Baru
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body - internal state eliminates parent re-renders */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Nama Resmi Sekolah</span>
                <span className="text-[11px] text-slate-400 font-normal">Wajib diisi</span>
              </label>
              <input
                ref={schoolNameInputRef}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                type="text"
                autoComplete="off"
                placeholder="Contoh: SMAN 2 Kota Bandung"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Kode Unik Institusi</label>
              <input
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                required
                type="text"
                autoComplete="off"
                placeholder="SMAN2BDG"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Paket Langganan</label>
              <select
                value={form.subscription_plan}
                onChange={(e) => setForm((prev) => ({ ...prev, subscription_plan: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none cursor-pointer transition-all"
              >
                <option value="starter">Starter (150 Siswa)</option>
                <option value="pro">Pro (500 Siswa)</option>
                <option value="enterprise">Enterprise (2000 Siswa)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                <span>Akun Administrator Pertama</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Kredensial Superuser</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Username / NIP Admin</label>
                <input
                  value={form.admin_identifier}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_identifier: e.target.value }))}
                  required
                  type="text"
                  autoComplete="off"
                  placeholder="admin_sman2bdg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none font-mono transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap Admin</label>
                <input
                  value={form.admin_full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_full_name: e.target.value }))}
                  required
                  type="text"
                  autoComplete="off"
                  placeholder="Drs. Mulyadi (Kepala TU)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Resmi Admin</label>
                <input
                  value={form.admin_email}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_email: e.target.value }))}
                  required
                  type="email"
                  autoComplete="off"
                  placeholder="admin@sman2bdg.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none transition-all"
                />
              </div>

              {/* Secure Random Password Field with Regenerate & Copy */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Kata Sandi Awal</label>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold">Acak Aman</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    value={form.admin_password}
                    onChange={(e) => setForm((prev) => ({ ...prev, admin_password: e.target.value }))}
                    required
                    type="text"
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono tracking-wider text-xs focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/25 focus:border-[#150f23] outline-none transition-all"
                  />
                  <div className="absolute right-1.5 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      title="Buat ulang kata sandi acak baru"
                      aria-label="Buat ulang kata sandi acak baru"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      title={copiedPassword ? 'Tersalin ke clipboard!' : 'Salin kata sandi'}
                      aria-label={copiedPassword ? 'Tersalin ke clipboard!' : 'Salin kata sandi'}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
                    >
                      {copiedPassword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Kata sandi di atas digenerate otomatis secara kriptografis (12 karakter). Pastikan untuk menyalin kredensial ini dan menyampaikannya kepada administrator sekolah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2 focus:ring-2 focus:ring-[#6a5fc1]/30 focus:outline-none font-display tracking-wide transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
              )}
              <span>{isSubmitting ? 'Mendaftarkan...' : 'Konfirmasi Onboard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
