'use client'

import React, { useRef } from 'react'
import { Key, Plus } from 'lucide-react'
import SecretManagerTab, { SecretManagerTabRef } from '@/components/superadmin/SecretManagerTab'

export default function SecretsPage() {
  const secretManagerRef = useRef<SecretManagerTabRef | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-[#c2ef4e] flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Key className="w-5 h-5 text-[#c2ef4e]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Task-based AI Secrets & Vault Manager
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-[#c2ef4e] font-mono shadow-xs">
                Multi-Model KMS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Konfigurasi model, parameter, dan provider AI per task operasional ujian, serta inventaris kunci enkripsi at-rest TiDB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          <button
            onClick={() => secretManagerRef.current?.openAddSecretModal()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" />
            <span>Tambah Kunci API</span>
          </button>
        </div>
      </div>

      {/* Secret Manager Body */}
      <SecretManagerTab ref={secretManagerRef} />
    </div>
  )
}
