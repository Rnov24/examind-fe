'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  X,
  AlertOctagon,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import { HelpModal } from './HelpModal'

interface NotificationItem {
  id: string | number
  kind: string
  title: string
  body: string
  created_at: string
  severity: 'info' | 'warning' | 'critical'
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (diffSec < 60) return 'Baru saja'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const SEVERITY_STYLE: Record<
  NotificationItem['severity'],
  { container: string; Icon: typeof Info; iconClass: string }
> = {
  critical: { container: 'bg-rose-50 hover:bg-rose-100/70', Icon: AlertOctagon, iconClass: 'text-rose-600' },
  warning: { container: 'bg-amber-50 hover:bg-amber-100/70', Icon: AlertTriangle, iconClass: 'text-amber-600' },
  info: { container: 'bg-violet-50 hover:bg-violet-100/70', Icon: Info, iconClass: 'text-[#6a5fc1]' },
}

interface TopRightClusterProps {
  className?: string
}

export function TopRightCluster({ className = '' }: TopRightClusterProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Real notifications from the backend (role-scoped, derived from live
  // events). Poll every 60s. Any failure degrades to the honest empty
  // state — never to invented content.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await api.get('/notifications')
        const items = res.data?.data?.items
        if (!cancelled && Array.isArray(items)) {
          setNotifications(items)
        }
      } catch {
        if (!cancelled) setNotifications([])
      }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const topSeverity: NotificationItem['severity'] | null =
    notifications.length === 0
      ? null
      : notifications.some((n) => n.severity === 'critical')
        ? 'critical'
        : notifications.some((n) => n.severity === 'warning')
          ? 'warning'
          : 'info'

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

  const circularButtonClass = cn(
    'w-10 h-10 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-[#c9c2ec] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]',
    tokens.radius.full,
    tokens.border.default,
    tokens.shadow.subtle
  )

  return (
    <div className={cn('flex items-center gap-2 sm:gap-2.5', className)}>
      {/* Quick Search Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          title="Cari institusi, soal, atau ujian"
          aria-label="Buka pencarian global"
          className={circularButtonClass}
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
              className={cn(
                'bg-white border border-[#ddd9ef] w-full max-w-lg p-4 space-y-3',
                tokens.radius.xl,
                tokens.shadow.modal
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn('flex items-center gap-2 px-3 py-2 bg-slate-50', tokens.radius.lg, tokens.border.default)}>
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
                <span className={cn('font-mono text-[10px] bg-[#f1effa] px-1.5 py-0.5 text-slate-600', tokens.radius.xs)}>
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
          className={circularButtonClass}
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {/* Indicator dot — only when real notifications exist, colored by top severity */}
          {topSeverity && (
            <span
              className={cn(
                'absolute top-2.5 right-2.5 w-2 h-2 rounded-full ring-2 ring-white',
                topSeverity === 'critical'
                  ? 'bg-rose-500'
                  : topSeverity === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-[#6a5fc1]'
              )}
              aria-hidden="true"
            />
          )}
        </button>

        {notificationOpen && (
          <div className={cn('absolute right-0 mt-2 w-72 sm:w-80 bg-white p-3 z-50 space-y-2', tokens.radius.xl, tokens.border.default, tokens.shadow.modal)}>
            <div className="flex items-center justify-between pb-2 border-b border-[#e9e5f6] px-1">
              <span className="font-display font-bold text-xs text-slate-900">
                Pemberitahuan Sistem
              </span>
              {notifications.length > 0 && (
                <span className={cn('text-[10px] font-mono text-[#150f23] font-bold bg-[#f1effa] px-1.5 py-0.5', tokens.radius.xs)}>
                  {notifications.length} Baru
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-[11px] text-slate-500 px-1 py-2">
                Tidak ada notifikasi baru
              </p>
            ) : (
              <div className="space-y-1.5 text-xs max-h-80 overflow-y-auto">
                {notifications.map((item) => {
                  const style = SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.info
                  const SevIcon = style.Icon
                  return (
                    <div
                      key={item.id}
                      className={cn('p-2 transition-colors', tokens.radius.lg, style.container)}
                    >
                      <div className="flex items-start gap-2">
                        <SevIcon className={cn('w-3.5 h-3.5 shrink-0 mt-px', style.iconClass)} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-[11px]">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.body}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            {formatRelativeTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Button (Hidden on <sm to maintain 360px header budget) */}
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        title="Bantuan & Panduan Platform"
        aria-label="Bantuan dan Panduan Platform"
        className={cn(circularButtonClass, 'hidden sm:flex')}
      >
        <HelpCircle className="w-4 h-4" aria-hidden="true" />
      </button>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* User Profile Chip */}
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          aria-label="Menu Profil Pengguna"
          className={cn(
            'bg-white p-1.5 pr-3 sm:pr-4 flex items-center gap-2.5 sm:gap-3 hover:border-[#c9c2ec] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]',
            tokens.radius.full,
            tokens.border.default,
            tokens.shadow.subtle
          )}
        >
          {/* Avatar circle */}
          <div className={cn('w-8 h-8 bg-[#150f23] text-[#c2ef4e] flex items-center justify-center text-xs font-bold font-display shrink-0', tokens.radius.full, tokens.shadow.micro)}>
            {userInitials}
          </div>

          {/* User Name & Role */}
          <div className="text-left hidden md:block min-w-0 max-w-[120px] lg:max-w-[160px]">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate font-sans">
              {user?.full_name || 'Super Admin'}
            </p>
            <p className={cn(tokens.typography.caption, 'leading-tight truncate mt-0.5')}>
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
          <div className={cn('absolute right-0 mt-2 w-64 bg-white p-3 z-50 space-y-2 select-none animate-in fade-in-50 zoom-in-95 duration-150', tokens.radius.xl, tokens.border.default, tokens.shadow.modal)}>
            <div className={cn('p-2.5 bg-[#faf9fd] border border-[#e9e5f6] space-y-1', tokens.radius.lg)}>
              <div className="flex items-center gap-2">
                <div className={cn('w-7 h-7 bg-[#150f23] text-[#c2ef4e] flex items-center justify-center text-[10px] font-bold', tokens.radius.full)}>
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate font-sans">
                    {user?.full_name || 'Super Admin'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    {user?.identifier || '—'}
                  </p>
                </div>
              </div>
              <div className="pt-1.5 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-500">Peran Akun:</span>
                <span className={cn('font-mono font-bold px-2 py-0.5 bg-[#e9e5f6] text-slate-800', tokens.radius.full)}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-[#e9e5f6] space-y-1">
              <button
                type="button"
                onClick={handleLogout}
                className={cn('w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer', tokens.radius.lg)}
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
