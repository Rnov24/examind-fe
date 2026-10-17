'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, PanelLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

export default function Navbar() {
  const router = useRouter()
  const { user, logout, hydrate, isHydrated } = useAuthStore()
  const { sidebarOpen, toggleSidebar, initSidebar } = useUiStore()

  useEffect(() => {
    initSidebar()
  }, [initSidebar])

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [isHydrated, hydrate])

  const institutionName = user?.tenant_name || 'Portal CBT Sekolah'

  const roleLabel = (() => {
    const role = user?.role
    if (role === 'superadmin') return 'Super Admin'
    if (role === 'admin') return 'Admin Sekolah'
    if (role === 'teacher') return 'Guru'
    if (role === 'student') return 'Siswa'
    return role || 'Pengguna'
  })()

  const roleBadgeClass = (() => {
    const role = user?.role
    if (role === 'superadmin') return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    if (role === 'admin') return 'bg-slate-100 text-slate-800 border-slate-200'
    if (role === 'teacher') return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  })()

  const userInitials = (() => {
    const name = user?.full_name || user?.identifier || 'U'
    return name.substring(0, 2).toUpperCase()
  })()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-slate-900 transition-all">
      {/* Brand Mark & Institution Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Alihkan Sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="sidebar-nav"
          className="p-2.5 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title={sidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
        >
          <PanelLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-display font-black text-xs tracking-wider shadow-sm ring-1 ring-slate-800/60 group-hover:ring-[#c2ef4e]/60 transition-all relative overflow-hidden shrink-0">
            <span className="relative z-10">EX</span>
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#c2ef4e] rounded-full blur-[1px]"></span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-extrabold text-slate-900 leading-none text-base tracking-tight group-hover:text-indigo-600 transition-colors">
                EXAMIND
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#c2ef4e] text-slate-950 font-mono tracking-wider shrink-0">
                CBT
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 tracking-tight truncate max-w-[120px] sm:max-w-[240px]">
              <span className="truncate">{institutionName}</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Right Header Actions & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Live Server Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] font-semibold text-slate-700">Server CBT Aktif</span>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2.5 sm:pl-3 border-l border-slate-200/80">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none tracking-tight">
              {user?.full_name || 'Pengguna'}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full uppercase border font-mono tracking-wide ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
              {user?.identifier && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.identifier}
                </span>
              )}
            </div>
          </div>

          {/* Avatar Initials */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/80 flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xs font-display shrink-0">
            {userInitials}
          </div>

          <button
            onClick={handleLogout}
            title="Keluar dari Akun"
            aria-label="Keluar dari Akun"
            className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
