'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface TopRightClusterProps {
  className?: string
}

export function TopRightCluster({ className = '' }: TopRightClusterProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userInitials = (() => {
    const name = user?.full_name || user?.identifier || 'SA'
    return name.substring(0, 2).toUpperCase()
  })()

  const roleLabel = (() => {
    const role = user?.role
    if (role === 'superadmin') return 'Super Admin'
    if (role === 'admin') return 'Admin Sekolah'
    if (role === 'teacher') return 'Guru Pengajar'
    if (role === 'student') return 'Peserta Didik'
    return role || 'Pengguna'
  })()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* Quick Search Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          title="Cari institusi, soal, atau ujian"
          aria-label="Buka pencarian global"
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23]"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Global Search Dialog Modal */}
        {searchOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik nama sekolah, kode CBT, atau menu..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  aria-label="Tutup pencarian"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="text-[11px] text-slate-500 px-2 py-1 flex items-center justify-between">
                <span>Pencarian Cepat Navigasi Platform</span>
                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  ESC untuk keluar
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Button */}
      <div className="relative" ref={notificationRef}>
        <button
          type="button"
          onClick={() => setNotificationOpen((prev) => !prev)}
          title="Notifikasi Sistem"
          aria-label="Notifikasi Sistem"
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23]"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {/* Active notification indicator dot (lime) */}
          <span
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#c2ef4e] ring-2 ring-white"
            aria-hidden="true"
          />
        </button>

        {notificationOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xl p-3 z-50 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
              <span className="font-display font-bold text-xs text-slate-900">
                Pemberitahuan Sistem
              </span>
              <span className="text-[10px] font-mono text-[#150f23] font-bold bg-[#c2ef4e]/40 px-1.5 py-0.5 rounded">
                2 Baru
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <p className="font-semibold text-slate-900 text-[11px]">
                  Sinkronisasi TiDB Serverless
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Cluster terhubung stabil di region ap-southeast-1.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <p className="font-semibold text-slate-900 text-[11px]">
                  Audit Integritas AI Ujian
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Model Gemini 2.5 Flash aktif untuk asistensi rubrik penilaian.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info / Help Button */}
      <button
        type="button"
        onClick={() => alert('EXAMIND CBT v1.0 — Platform Ujian AI Sekolah Berintegritas Tinggi')}
        title="Tentang Platform EXAMIND"
        aria-label="Informasi Platform"
        className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23]"
      >
        <HelpCircle className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* User Profile Chip */}
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          aria-label="Menu Profil Pengguna"
          className="bg-white rounded-full p-1.5 pr-3 sm:pr-4 border border-slate-200/80 shadow-xs flex items-center gap-2.5 sm:gap-3 hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23]"
        >
          {/* Avatar circle */}
          <div className="w-8 h-8 rounded-full bg-[#150f23] text-[#c2ef4e] flex items-center justify-center text-xs font-bold font-display shadow-2xs shrink-0">
            {userInitials}
          </div>

          {/* User Name & Role */}
          <div className="text-left hidden md:block min-w-0 max-w-[120px] lg:max-w-[160px]">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate">
              {user?.full_name || 'Super Admin'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium leading-tight truncate mt-0.5">
              {roleLabel}
            </p>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              profileOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Profile Dropdown Menu */}
        {profileOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/80 shadow-xl p-3 z-50 space-y-2 select-none animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#150f23] text-[#c2ef4e] flex items-center justify-center text-[10px] font-bold">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.full_name || 'Super Admin'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    {user?.identifier || 'superadmin@examind.id'}
                  </p>
                </div>
              </div>
              <div className="pt-1.5 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-500">Peran Akun:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 space-y-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopRightCluster
