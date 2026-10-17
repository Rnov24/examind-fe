'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { Key, Plus, Cpu, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import SecretManagerTab, { SecretManagerTabRef } from '@/components/superadmin/SecretManagerTab'

export default function SecretsPage() {
  const secretManagerRef = useRef<SecretManagerTabRef | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-indigo-50/60 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-50/50 rounded-full blur-2xl"></div>

        <div className="relative flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Key className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Task-based AI Secrets & Vault Manager
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-[#c2ef4e] font-mono shadow-xs">
                Multi-Model KMS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Konfigurasi model, parameter, dan provider AI per task operasional ujian, serta inventaris kunci enkripsi at-rest TiDB.
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => secretManagerRef.current?.openAddSecretModal()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" />
            <span>Tambah Secret Global</span>
          </button>
        </div>
      </div>

      {/* Secret Manager Body */}
      <SecretManagerTab ref={secretManagerRef} />
    </div>
  )
}
