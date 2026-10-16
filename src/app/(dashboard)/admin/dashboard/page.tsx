'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  ShieldAlert,
  UserPlus,
  Search,
  X,
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
    database_status: 'Connecting...',
    edge_cv_status: 'Online',
  })

  const [userList, setUserList] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    identifier: '',
    role: 'student',
    email: '',
    password: '',
  })

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      if (res.data.data) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    }
  }

  const fetchUsers = async (role = selectedRole, keyword = searchKeyword) => {
    try {
      const params: any = {}
      if (role !== 'all') params.role = role
      if (keyword.trim()) params.search = keyword.trim()

      const res = await api.get('/admin/users', { params })
      setUserList(res.data.data || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const toggleUserStatus = async (targetUser: any) => {
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/toggle-status`)
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: res.data.data.is_active } : u))
      )
      await fetchStats()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status pengguna')
    }
  }

  const submitAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
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
      await Promise.all([fetchStats(), fetchUsers()])
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Gagal membuat pengguna')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Institutional Daylight Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-indigo-50/70 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-emerald-50/50 rounded-full blur-2xl"></div>

        <div className="relative space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2.5 py-0.5 rounded font-mono shadow-xs">
              Administrator Institusi
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              {user?.identifier || 'Admin'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Panel Administrasi: {user?.full_name || 'Admin Sekolah'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pusat kendali sekolah: kelola akun guru & siswa, pantau status server MySQL XAMPP, dan audit integritas ujian.
          </p>
        </div>

        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
          <Link
            href="/classes"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer flex items-center justify-center w-full sm:w-auto"
          >
            Kelola Kelas
          </Link>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide w-full sm:w-auto"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#c2ef4e]" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Total Pengguna
            </span>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
                {stats.total_users}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                ({stats.total_teachers} Guru, {stats.total_students} Siswa)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Kelas & Rombel
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
              {stats.total_classes} Rombel
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Paket Ujian Sekolah
            </span>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
                {stats.total_exams}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                ({stats.total_question_banks} Bank)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-rose-50/70">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Diskualifikasi CBT
            </span>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-extrabold text-rose-600 font-display tabular-nums">
                {stats.disqualified_sessions}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                / {stats.total_sessions} Sesi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Manajemen Akun Pengguna</h3>
            <p className="text-xs text-slate-500">
              Daftar akun terdaftar di platform sekolah (Administrator, Guru, dan Siswa)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                fetchUsers(e.target.value, searchKeyword)
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 font-sans shadow-xs w-full sm:w-auto"
            >
              <option value="all">Semua Peran (All)</option>
              <option value="admin">Administrator</option>
              <option value="teacher">Guru / Pengawas</option>
              <option value="student">Siswa / Peserta</option>
            </select>

            <div className="relative w-full sm:w-auto flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value)
                  fetchUsers(selectedRole, e.target.value)
                }}
                type="text"
                placeholder="Cari nama, NIP, NISN..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white w-full sm:w-60 shadow-xs transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200 font-mono">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Identifier (NIP / NISN)</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {userList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                        {usr.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-display font-bold text-slate-900 leading-snug">{usr.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">ID: #{usr.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{usr.identifier}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono inline-block shadow-xs ${
                        usr.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : usr.role === 'teacher'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {usr.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-mono">{usr.email}</td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-right">
                    {usr.id !== user?.id ? (
                      <button
                        onClick={() => toggleUserStatus(usr)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                          usr.is_active
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {usr.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Akun Anda</span>
                    )}
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    Tidak ada data pengguna yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-subtle-elevated space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tambah Akun Pengguna</h3>
                <p className="text-xs text-slate-500">Daftarkan akun baru ke dalam sistem institusi</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  required
                  type="text"
                  placeholder="Contoh: Budi Prasetyo, M.Pd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
