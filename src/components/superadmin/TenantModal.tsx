'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Building2, RefreshCw, Copy, Check, ShieldCheck, KeyRound } from 'lucide-react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui'

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

  const prevIsOpenRef = useRef(false)

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader
        icon={<Building2 className="w-5 h-5 text-[#c2ef4e]" aria-hidden="true" />}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="xs">
              Sekolah Mitra
            </Badge>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Isolasi Data
            </span>
          </div>
        }
        title="Daftarkan Sekolah Baru"
        description="Daftarkan sekolah baru ke dalam sistem terisolasi data EXAMIND."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <ModalBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <Input
                ref={schoolNameInputRef}
                label="Nama Resmi Sekolah"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Contoh: SMAN 2 Kota Bandung"
                autoComplete="off"
              />
            </div>

            <div>
              <Input
                label="Kode Unik Sekolah"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                required
                placeholder="SMAN2BDG"
                className="font-mono uppercase"
                autoComplete="off"
              />
            </div>

            <div>
              <Select
                label="Paket Langganan"
                value={form.subscription_plan}
                onChange={(e) => setForm((prev) => ({ ...prev, subscription_plan: e.target.value }))}
              >
                <option value="starter">Starter (150 Siswa)</option>
                <option value="pro">Pro (500 Siswa)</option>
                <option value="enterprise">Enterprise (2000 Siswa)</option>
              </Select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-violet-600" aria-hidden="true" />
                <span>Akun Administrator Pertama</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Kredensial Superuser</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Username / NIP Admin"
                  value={form.admin_identifier}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_identifier: e.target.value }))}
                  required
                  placeholder="admin_sman2bdg"
                  className="font-mono"
                  autoComplete="off"
                />
              </div>

              <div>
                <Input
                  label="Nama Lengkap Admin"
                  value={form.admin_full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_full_name: e.target.value }))}
                  required
                  placeholder="Drs. Mulyadi (Kepala TU)"
                  autoComplete="off"
                />
              </div>

              <div>
                <Input
                  label="Email Resmi Admin"
                  type="email"
                  value={form.admin_email}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_email: e.target.value }))}
                  required
                  placeholder="admin@sman2bdg.sch.id"
                  autoComplete="off"
                />
              </div>

              <div>
                <Input
                  label="Kata Sandi Awal (Acak Aman)"
                  value={form.admin_password}
                  onChange={(e) => setForm((prev) => ({ ...prev, admin_password: e.target.value }))}
                  required
                  placeholder="Minimal 8 karakter"
                  className="font-mono tracking-wider text-xs"
                  autoComplete="new-password"
                  rightIcon={
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        title="Buat ulang kata sandi acak baru"
                        aria-label="Buat ulang kata sandi acak baru"
                        className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title={copiedPassword ? 'Tersalin!' : 'Salin kata sandi'}
                        aria-label={copiedPassword ? 'Tersalin!' : 'Salin kata sandi'}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
                      >
                        {copiedPassword ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  }
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
              Kata sandi di atas digenerate otomatis secara kriptografis (12 karakter). Pastikan untuk menyalin kredensial ini dan menyampaikannya kepada administrator sekolah.
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />}
          >
            Daftarkan Sekolah
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
