'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  ShieldAlert,
  UserPlus,
  Search,
  X,
  Database,
  Activity,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()

  const [stats, setStats] = useState({
    total_users: 0,
    total_admins: 0,
    total_teachers: 0,
    total_students: 0,
    total_classes: 0,
    total_question_banks: 0,
    total_exams: 0,
    total_sessions: 0,
    active_sessions: 0,
    completed_sessions: 0,
    disqualified_sessions: 0,
    database_status: 'Connected (MySQL 3306)',
    edge_cv_status: 'Online',
  })

  const [userList, setUserList] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersErrorMessage, setUsersErrorMessage] = useState<string | null>(null)
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)

  const fullNameInputRef = useRef<HTMLInputElement | null>(null)

  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    identifier: '',
    role: 'student',
    email: '',
    password: '',
  })

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats')
      if (res.data.data) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    }
  }, [])

  const fetchUsers = useCallback(async (role = selectedRole, keyword = searchKeyword) => {
    setIsLoadingUsers(true)
    setUsersErrorMessage(null)
    try {
      const params: any = {}
      if (role !== 'all') params.role = role
      if (keyword.trim()) params.search = keyword.trim()

      const res = await api.get('/admin/users', { params })
      setUserList(res.data.data || [])
    } catch (err: any) {
      console.error('Failed to load users:', err)
      setUsersErrorMessage(
        err.response?.data?.message || 'Gagal memuat daftar pengguna sekolah. Silakan coba lagi.'
      )
    } finally {
      setIsLoadingUsers(false)
    }
  }, [selectedRole, searchKeyword])

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [fetchStats, fetchUsers])

  // Focus first input and handle Escape key for modal
  useEffect(() => {
    if (!showAddUserModal) return

    const timer = setTimeout(() => {
      fullNameInputRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddUserModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showAddUserModal])

  const toggleUserStatus = async (targetUser: any) => {
    if (togglingUserId) return
    setTogglingUserId(targetUser.id)
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/toggle-status`)
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: res.data.data.is_active } : u))
      )
      await fetchStats()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun pengguna.')
    } finally {
      setTogglingUserId(null)
    }
  }

  const submitAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormErrorMessage('')
    try {
      await api.post('/admin/users', newUserForm)
      setShowAddUserModal(false)
      setNewUserForm({
        full_name: '',
        identifier: '',
        role: 'student',
        email: '',
        password: '',
      })
      await Promise.all([fetchStats(), fetchUsers(selectedRole, searchKeyword)])
    } catch (err: any) {
      setFormErrorMessage(err.response?.data?.message || 'Gagal mendaftarkan akun baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFilterActive = selectedRole !== 'all' || searchKeyword.trim().length > 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Institutional Daylight Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-indigo-50/70 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-emerald-50/50 rounded-full blur-2xl"></div>

        <div className="relative space-y-2 max-w-xl min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2.5 py-0.5 rounded font-mono shadow-xs">
              Administrator Institusi
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 truncate">
              {user?.identifier || 'Admin'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 truncate">
            Panel Administrasi: {user?.full_name || 'Admin Sekolah'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pusat tata kelola akun pengguna, pengawasan infrastruktur CBT sekolah, dan integritas sesi ujian.
          </p>
        </div>

        {/* ONE Primary Action ("Tambah Pengguna") + Secondary Action ("Kelola Kelas") */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
          <Link
            href="/classes"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer flex items-center justify-center w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            Kelola Kelas
          </Link>
          <button
            type="button"
            onClick={() => {
              setFormErrorMessage('')
              setShowAddUserModal(true)
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* PRIMARY GOAL ELEVATION: System Health & Infrastructure Overview First */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Status Kesehatan Sistem & Infrastruktur Institusi
              </h2>
              <p className="text-xs text-slate-500">
                Pemantauan konektivitas basis data MySQL, Edge AI Proctoring, dan integritas sesi aktif
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchStats}
            title="Perbarui status sistem"
            className="text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span>Sinkronkan Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Database Health Pill */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Koneksi Database
              </span>
              <Database className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-900 font-mono">
                {stats.database_status || 'MySQL XAMPP (3306)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">SQLAlchemy 2.0 • Standalone Engine</p>
          </div>

          {/* Edge CV Proctoring Health */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Edge AI Proctoring
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-900 font-mono">
                {stats.edge_cv_status || 'Online (Ready)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Face Detection & Dual-Cam Active</p>
          </div>

          {/* Active Sessions */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Sesi Ujian Berjalan
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Live
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 font-display tabular-nums">
              {stats.active_sessions || 0}{' '}
              <span className="text-xs font-normal text-slate-500">Siswa Aktif</span>
            </div>
            <p className="text-[11px] text-slate-500">Dari {stats.total_sessions || 0} total submission</p>
          </div>

          {/* Disqualified / Flagged Incidents */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Catatan Pelanggaran
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-600" aria-hidden="true" />
            </div>
            <div className="text-xl font-black text-slate-900 font-display tabular-nums">
              {stats.disqualified_sessions || 0}{' '}
              <span className="text-xs font-normal text-slate-500">Insiden Ditinjau</span>
            </div>
            <p className="text-[11px] text-slate-500">Human-in-the-Loop Override</p>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Total Akun Pengguna
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-display tabular-nums truncate">
              {stats.total_users}
            </h3>
            <span className="text-[11px] text-slate-500 block truncate">
              {stats.total_teachers} Guru &bull; {stats.total_students} Siswa
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Kelas & Rombel Belajar
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-display tabular-nums truncate">
              {stats.total_classes} Rombel
            </h3>
            <span className="text-[11px] text-slate-500 block truncate">Struktur akademik sekolah</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0">
            <FileSpreadsheet className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Paket Ujian Sekolah
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-display tabular-nums truncate">
              {stats.total_exams} Paket
            </h3>
            <span className="text-[11px] text-slate-500 block truncate">
              {stats.total_question_banks} Master Bank Soal
            </span>
          </div>
        </div>
      </div>

      {/* User Management Section (Secondary) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Manajemen Akun Pengguna
            </h3>
            <p className="text-xs text-slate-500">
              Kelola status aktivasi akun Administrator, Guru, dan Siswa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                fetchUsers(e.target.value, searchKeyword)
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-sans shadow-xs w-full sm:w-auto cursor-pointer"
            >
              <option value="all">Semua Peran (All)</option>
              <option value="admin">Administrator</option>
              <option value="teacher">Guru / Pengawas</option>
              <option value="student">Siswa / Peserta</option>
            </select>

            <div className="relative w-full sm:w-auto flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value)
                  fetchUsers(selectedRole, e.target.value)
                }}
                type="text"
                placeholder="Cari nama, NIP, NISN..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white w-full sm:w-60 shadow-xs transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Loading Users State */}
        {isLoadingUsers && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-900">Memuat data pengguna sekolah...</p>
          </div>
        )}

        {/* Users Error State */}
        {!isLoadingUsers && usersErrorMessage && (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <p className="text-xs text-rose-700 font-semibold">{usersErrorMessage}</p>
            <button
              type="button"
              onClick={() => fetchUsers(selectedRole, searchKeyword)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Users Table */}
        {!isLoadingUsers && !usersErrorMessage && (
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Identifier (NIP / NISN)</th>
                  <th className="px-6 py-4">Peran</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status Akun</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {userList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0">
                          {usr.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-display font-bold text-slate-900 leading-snug truncate">
                            {usr.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">ID: #{usr.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {usr.identifier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono inline-block shadow-xs ${
                          usr.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : usr.role === 'teacher'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {usr.role === 'teacher' ? 'Guru' : usr.role === 'student' ? 'Siswa' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-mono truncate max-w-[160px]">
                      {usr.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono border shadow-xs ${
                          usr.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            usr.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        {usr.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {usr.id !== user?.id ? (
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(usr)}
                          disabled={togglingUserId === usr.id}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none disabled:opacity-50 ${
                            usr.is_active
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {togglingUserId === usr.id
                            ? 'Memproses...'
                            : usr.is_active
                            ? 'Nonaktifkan'
                            : 'Aktifkan'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Akun Anda</span>
                      )}
                    </td>
                  </tr>
                ))}

                {userList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                          <Users className="w-5 h-5" aria-hidden="true" />
                        </div>
                        {isFilterActive ? (
                          <>
                            <p className="font-bold text-slate-900 text-sm">
                              Pengguna Tidak Ditemukan
                            </p>
                            <p className="text-xs text-slate-500 mt-1 mb-3">
                              Tidak ada akun yang sesuai dengan filter atau kata kunci pencarian.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRole('all')
                                setSearchKeyword('')
                                fetchUsers('all', '')
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              Reset Filter & Pencarian
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-slate-900 text-sm">
                              Belum Ada Akun Pengguna Terdaftar
                            </p>
                            <p className="text-xs text-slate-500 mt-1 mb-3">
                              Daftarkan akun guru atau siswa pertama untuk memulai pengoperasian sistem sekolah.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowAddUserModal(true)}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                              <span>Tambah Pengguna Baru</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal with Escape & Backdrop Dismiss */}
      {showAddUserModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddUserModal(false)
          }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Tambah Akun Pengguna
                </h3>
                <p className="text-xs text-slate-500">
                  Daftarkan akun baru ke dalam sistem institusi sekolah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                title="Tutup modal"
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submitAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  ref={fullNameInputRef}
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  required
                  type="text"
                  placeholder="Contoh: Budi Prasetyo, M.Pd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Identifier (NIP / NISN / Username)
                  </label>
                  <input
                    value={newUserForm.identifier}
                    onChange={(e) => setNewUserForm({ ...newUserForm, identifier: e.target.value })}
                    required
                    type="text"
                    placeholder="19820310..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
                  >
                    <option value="student">Siswa (Student)</option>
                    <option value="teacher">Guru (Teacher)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <input
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
                <input
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                  type="password"
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              {formErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{formErrorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 focus:ring-2 focus:ring-slate-900/10 focus:outline-none font-display tracking-wide"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Akun Pengguna'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

