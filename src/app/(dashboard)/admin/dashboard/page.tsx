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
import {
  Button,
  Badge,
  Input,
  Select,
  SearchInput,
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui'

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
    database_status: null as string | null,
    edge_cv_status: null as string | null,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const [userList, setUserList] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  // Debounced search (350ms) so typing doesn't trigger a fetch on every keystroke
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchKeyword(searchKeyword), 350)
    return () => clearTimeout(t)
  }, [searchKeyword])
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersErrorMessage, setUsersErrorMessage] = useState<string | null>(null)
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const res = await api.get('/admin/stats')
      if (res.data.data) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  const fetchUsers = useCallback(async (role = selectedRole, keyword = debouncedSearchKeyword) => {
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
  }, [selectedRole, debouncedSearchKeyword])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleUserStatus = async (targetUser: any) => {
    if (togglingUserId) return
    setTogglingUserId(targetUser.id)
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/toggle-status`)
      const newIsActive = res.data.data.is_active
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newIsActive } : u))
      )
      // No stats refetch needed: /admin/stats counts users by role regardless of is_active,
      // so toggling a user's status does not change any stat value.
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun pengguna.')
    } finally {
      setTogglingUserId(null)
    }
  }

  const submitAddUser = async (formData: {
    full_name: string
    identifier: string
    role: string
    email: string
    password: string
  }) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormErrorMessage('')
    try {
      await api.post('/admin/users', formData)
      setShowAddUserModal(false)
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
            <Badge variant="lime" size="xs">
              Administrator Institusi
            </Badge>
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
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer flex items-center justify-center w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:outline-none"
          >
            Kelola Kelas
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setFormErrorMessage('')
              setShowAddUserModal(true)
            }}
            leftIcon={<UserPlus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
          >
            Tambah Pengguna
          </Button>
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
              {isLoadingStats ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-500 font-mono">
                    Memeriksa status...
                  </span>
                </>
              ) : stats.database_status ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {stats.database_status}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                    Online
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-600 font-mono">
                    Tidak Terhubung
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                    Offline
                  </span>
                </>
              )}
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
              {isLoadingStats ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-500 font-mono">
                    Memeriksa...
                  </span>
                </>
              ) : stats.edge_cv_status ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {stats.edge_cv_status}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-600 font-mono">
                    Siaga (Standby)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Face Detection & Dual-Cam Active</p>
          </div>

          {/* Active Sessions */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Sesi Ujian Berjalan
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0">
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
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0">
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
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold shrink-0">
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
            <div className="w-full sm:w-48">
              <Select
                selectSize="sm"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value)
                  fetchUsers(e.target.value, searchKeyword)
                }}
              >
                <option value="all">Semua Peran (All)</option>
                <option value="admin">Administrator</option>
                <option value="teacher">Guru / Pengawas</option>
                <option value="student">Siswa / Peserta</option>
              </Select>
            </div>

            <div className="w-full sm:w-64">
              <SearchInput
                inputSize="sm"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value)
                }}
                onClear={() => {
                  setSearchKeyword('')
                  fetchUsers(selectedRole, '')
                }}
                placeholder="Cari nama, NIP, NISN..."
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
            <Button
              size="sm"
              variant="primary"
              onClick={() => fetchUsers(selectedRole, searchKeyword)}
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Users Table */}
        {!isLoadingUsers && !usersErrorMessage && (
          <TableContainer accent="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">Pengguna</TableHead>
                  <TableHead className="px-6 py-4">Identifier (NIP / NISN)</TableHead>
                  <TableHead className="px-6 py-4">Peran</TableHead>
                  <TableHead className="px-6 py-4">Email</TableHead>
                  <TableHead className="px-6 py-4">Status Akun</TableHead>
                  <TableHead className="px-6 py-4 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((usr) => (
                  <TableRow key={usr.id}>
                    <TableCell className="px-6 py-4">
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
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {usr.identifier}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={usr.role === 'admin' ? 'neutral' : usr.role === 'teacher' ? 'violet' : 'emerald'}
                        size="sm"
                      >
                        {usr.role === 'teacher' ? 'Guru' : usr.role === 'student' ? 'Siswa' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-slate-600 font-mono truncate max-w-[160px]">
                      {usr.email}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={usr.is_active ? 'emerald' : 'rose'}
                        size="sm"
                        dot
                        dotPulse={usr.is_active}
                      >
                        {usr.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                      {usr.id !== user?.id ? (
                        <Button
                          size="xs"
                          variant={usr.is_active ? 'destructive' : 'secondary'}
                          onClick={() => toggleUserStatus(usr)}
                          disabled={togglingUserId === usr.id}
                          isLoading={togglingUserId === usr.id}
                        >
                          {usr.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-mono">Akun Anda</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {userList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState
                        icon={<Users className="w-6 h-6 text-slate-500" aria-hidden="true" />}
                        title={isFilterActive ? 'Pengguna Tidak Ditemukan' : 'Belum Ada Akun Pengguna Terdaftar'}
                        description={
                          isFilterActive
                            ? 'Tidak ada akun yang sesuai dengan filter atau kata kunci pencarian.'
                            : 'Daftarkan akun guru atau siswa pertama untuk memulai pengoperasian sistem sekolah.'
                        }
                        action={
                          isFilterActive ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedRole('all')
                                setSearchKeyword('')
                                fetchUsers('all', '')
                              }}
                            >
                              Reset Filter & Pencarian
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setShowAddUserModal(true)}
                              leftIcon={<UserPlus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
                            >
                              Tambah Pengguna Baru
                            </Button>
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        isSubmitting={isSubmitting}
        errorMessage={formErrorMessage}
        onClose={() => {
          setShowAddUserModal(false)
          setFormErrorMessage('')
        }}
        onSubmit={submitAddUser}
      />
    </div>
  )
}

interface AddUserModalProps {
  isOpen: boolean
  isSubmitting: boolean
  errorMessage: string
  onClose: () => void
  onSubmit: (form: {
    full_name: string
    identifier: string
    role: string
    email: string
    password: string
  }) => void
}

function AddUserModal({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const [form, setForm] = useState({
    full_name: '',
    identifier: '',
    role: 'student',
    email: '',
    password: '',
  })
  const fullNameInputRef = useRef<HTMLInputElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const prevIsOpenRef = useRef(false)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setForm({
        full_name: '',
        identifier: '',
        role: 'student',
        email: '',
        password: '',
      })
      const timer = setTimeout(() => {
        fullNameInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting])

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      size="md"
      accent="midnight"
    >
      <ModalHeader
        title="Tambah Akun Pengguna"
        description="Daftarkan akun baru ke dalam sistem institusi sekolah"
        icon={<UserPlus className="w-5 h-5 text-slate-800" aria-hidden="true" />}
        onClose={isSubmitting ? undefined : onClose}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(form)
        }}
      >
        <ModalBody>
          <Input
            ref={fullNameInputRef}
            label="Nama Lengkap"
            value={form.full_name}
            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
            required
            placeholder="Contoh: Budi Prasetyo, M.Pd"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Identifier (NIP / NISN / Username)"
              value={form.identifier}
              onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))}
              required
              placeholder="19820310..."
              className="font-mono"
            />
            <Select
              label="Peran (Role)"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="student">Siswa (Student)</option>
              <option value="teacher">Guru (Teacher)</option>
              <option value="admin">Administrator</option>
            </Select>
          </div>

          <Input
            label="Alamat Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            placeholder="nama@sekolah.sch.id"
          />

          <Input
            label="Kata Sandi (Password)"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            placeholder="Minimal 6 karakter"
          />

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Simpan Akun Pengguna
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}


