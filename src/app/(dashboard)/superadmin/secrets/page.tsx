'use client'

import React, { useRef, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import SecretManagerTab, { SecretManagerTabRef } from '@/components/superadmin/SecretManagerTab'
import {
  DashboardShell,
  getSuperAdminNavTabs,
} from '@/components/dashboard'
import { useAuthStore } from '@/stores/authStore'

export default function SecretsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('secrets')
  const secretManagerRef = useRef<SecretManagerTabRef | null>(null)

  const navTabs = useMemo(() => getSuperAdminNavTabs(), [])

  return (
    <DashboardShell
      navTabs={navTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      greetingName={user?.full_name || 'Super Admin'}
      greetingSubtitle="Konfigurasi model, parameter, dan provider AI per task operasional ujian, serta inventaris kunci enkripsi at-rest TiDB."
      greetingAction={
        <button
          type="button"
          onClick={() => secretManagerRef.current?.openAddSecretModal()}
          className="px-5 py-2.5 rounded-full bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#150f23] focus:outline-none"
        >
          <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
          <span>Tambah Kunci API</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Secret Manager Body */}
        <SecretManagerTab ref={secretManagerRef} />
      </div>
    </DashboardShell>
  )
}
