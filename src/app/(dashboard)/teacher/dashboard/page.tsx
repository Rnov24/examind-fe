'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  FileSpreadsheet,
  Users,
  Eye,
  Radio,
  Plus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ChevronRight,
  Sparkles,
  CheckSquare,
  Search,
  Filter,
  ArrowRight,
  Layers,
} from 'lucide-react'
import api from '@/lib/api'
import { fetchCachedExamsList } from '@/lib/bentoCache'
import { useAuthStore } from '@/stores/authStore'
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  EmptyState,
  Button,
} from '@/components/ui'

interface ExamItem {
  id: number
  title: string
  class_name?: string
  duration_minutes: number
  proctoring_level: string
  status: string
}

export default function TeacherDashboardPage() {
  const { user } = useAuthStore()

  const [banksCount, setBanksCount] = useState(0)
  const [examsCount, setExamsCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [recentExams, setRecentExams] = useState<ExamItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filters for recent exams table
  const [examSearch, setExamSearch] = useState('')
  const [examStatusFilter, setExamStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'published'>('all')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [bRes, eRes, cRes] = await Promise.allSettled([
        api.get('/questions/banks'),
        // Shared exams:list cache (90s TTL) — same shape as api.get('/exams')
        fetchCachedExamsList().then((exams) => ({ data: { data: exams } })),
        api.get('/academic/classes'),
      ])

      let errorCount = 0

      if (bRes.status === 'fulfilled') {
        setBanksCount((bRes.value.data.data || []).length)
      } else {
        errorCount++
      }

      if (eRes.status === 'fulfilled') {
        const exams = eRes.value.data.data || []
        setExamsCount(exams.length)
        setRecentExams(exams)
      } else {
        errorCount++
      }

      if (cRes.status === 'fulfilled') {
        setClassesCount((cRes.value.data.data || []).length)
      } else {
        errorCount++
      }

      if (errorCount === 3) {
        setErrorMessage('Gagal memuat data dashboard. Periksa koneksi ke server sekolah Anda.')
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setErrorMessage(
        err.response?.data?.message || 'Gagal memuat data dashboard guru. Silakan coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Distill: Identify items that genuinely need teacher's immediate attention
  const inProgressExams = useMemo(
    () => recentExams.filter((e) => e.status === 'in_progress'),
    [recentExams]
  )
  const completedExams = useMemo(
    () => recentExams.filter((e) => e.status === 'completed'),
    [recentExams]
  )
  const attentionItemsCount = inProgressExams.length + completedExams.length

  // Filtered recent exams
  const filteredExams = useMemo(() => {
    return recentExams
      .filter((e) => {
        const matchesSearch =
          e.title.toLowerCase().includes(examSearch.toLowerCase()) ||
          (e.class_name || '').toLowerCase().includes(examSearch.toLowerCase())

        const matchesStatus =
          examStatusFilter === 'all' ? true : e.status === examStatusFilter

        return matchesSearch && matchesStatus
      })
      .slice(0, 8)
  }, [recentExams, examSearch, examStatusFilter])

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Midnight-Violet Header Band */}
      <div className="bg-[#150f23] bg-grid-dots-dark rounded-2xl border border-[#362d59] p-5 sm:p-6 shadow-midnight-elevated relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#6a5fc1]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-1.5 relative z-10 min-w-0 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
              Portal Guru & Pengawas
            </span>
            <span className="text-xs text-[#bdb8c0] font-mono truncate">
              NIP / Identitas: {user?.identifier || '-'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white truncate">
            Selamat Datang, {user?.full_name || 'Bapak/Ibu Guru'}
          </h1>
          <p className="text-xs sm:text-sm text-[#bdb8c0] leading-relaxed">
            Pusat pemantauan ujian kelas real-time, validasi rubrik esai AI, dan penyusunan master bank butir soal.
          </p>
        </div>

        {/* Action Header: One Primary CTA + Secondary Link */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto">
          <Link
            href="/questions"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/15 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto focus:ring-2 focus:ring-[#6a5fc1] focus:outline-none"
          >
            <BookOpen className="w-4 h-4 text-white" aria-hidden="true" />
            <span>Master Bank Soal</span>
          </Link>
          <Link
            href="/exams/create"
            className="px-5 py-2.5 bg-white hover:bg-[#f1effa] text-[#150f23] font-bold text-xs rounded-xl transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto focus:ring-2 focus:ring-[#6a5fc1] focus:outline-none font-display tracking-wide"
          >
            <Plus className="w-4 h-4 text-[#150f23]" aria-hidden="true" />
            <span>Buat Paket Ujian</span>
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-[#ddd9ef] p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat ringkasan aktivitas pengawas...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Menghubungkan data jadwal ujian, rombel siswa, dan status koreksi esai Anda.
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Gagal Memuat Data Guru</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          {/* PRIMARY FOCUS: "Perlu Perhatian & Tindakan Anda" Section */}
          <div className="bg-white rounded-2xl border border-[#ddd9ef] shadow-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#e9e5f6] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    attentionItemsCount > 0
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {attentionItemsCount > 0 ? (
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Perlu Perhatian & Tindakan Anda
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sesi ujian yang sedang berlangsung atau lembar jawaban yang menunggu koreksi guru
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border tabular-nums ${
                  attentionItemsCount > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {attentionItemsCount > 0
                  ? `${attentionItemsCount} Item Perlu Respon`
                  : 'Semua Terkendali'}
              </span>
            </div>

            {attentionItemsCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Active live monitoring attention items */}
                {inProgressExams.map((exam) => (
                  <div
                    key={`in-prog-${exam.id}`}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 hover:bg-emerald-50/70 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold uppercase font-mono text-emerald-700 tracking-wider">
                          Ujian Sedang Berlangsung
                        </span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-slate-900 truncate">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">
                        Kelas: {exam.class_name || 'Semua Siswa'} • Durasi: {exam.duration_minutes} Menit
                      </p>
                    </div>

                    <Link
                      href={`/exams/${exam.id}/monitor`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    >
                      <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pantau Realtime</span>
                    </Link>
                  </div>
                ))}

                {/* Completed exams needing essay grading */}
                {completedExams.map((exam) => (
                  <div
                    key={`comp-${exam.id}`}
                    className="p-4 rounded-xl border border-violet-200 bg-violet-50/30 flex items-center justify-between gap-3 hover:bg-violet-50/60 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase font-mono text-violet-700 tracking-wider">
                        Selesai • Siap Dinilai
                      </span>
                      <h3 className="font-display text-sm font-bold text-slate-900 truncate">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">
                        Kelas: {exam.class_name || 'Semua Siswa'} • Tinjau hasil pengerjaan
                      </p>
                    </div>

                    <Link
                      href={`/grading/${exam.id}`}
                      className="px-3.5 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                    >
                      <span>Koreksi Esai</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#faf9fd] border border-[#ddd9ef] text-xs text-slate-600 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  Tidak ada sesi ujian aktif yang membutuhkan pengawasan langsung atau koreksi esai mendesak saat ini.
                </span>
              </div>
            )}
          </div>

          {/* Genuine KPI Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/questions"
              className="bg-white p-5 rounded-2xl border border-[#ddd9ef] shadow-card hover:shadow-card-hover transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f1effa] group-hover:bg-violet-100 text-[#6a5fc1] group-hover:text-violet-700 border border-[#ddd9ef] flex items-center justify-center font-bold shrink-0 transition-colors">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                  Master Bank Soal
                </span>
                <span className="text-2xl font-black text-slate-900 font-display tabular-nums truncate block">
                  {banksCount} Paket
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-violet-600 transition-colors">
                  <span>Kelola butir soal</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-violet-600 transition-colors" aria-hidden="true" />
                </span>
              </div>
            </Link>

            <Link
              href="/exams"
              className="bg-white p-5 rounded-2xl border border-[#ddd9ef] shadow-card hover:shadow-card-hover transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-azure-50 group-hover:bg-azure-100 text-azure-700 group-hover:text-azure-800 border border-azure-200/80 flex items-center justify-center font-bold shrink-0 transition-colors">
                <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                  Paket Ujian Terjadwal
                </span>
                <span className="text-2xl font-black text-slate-900 font-display tabular-nums truncate block">
                  {examsCount} Jadwal
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-violet-600 transition-colors">
                  <span>Lihat seluruh jadwal</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-violet-600 transition-colors" aria-hidden="true" />
                </span>
              </div>
            </Link>

            <Link
              href="/classes"
              className="bg-white p-5 rounded-2xl border border-[#ddd9ef] shadow-card hover:shadow-card-hover transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 group-hover:text-emerald-800 border border-emerald-200/80 flex items-center justify-center font-bold shrink-0 transition-colors">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                  Rombel Belajar
                </span>
                <span className="text-2xl font-black text-slate-900 font-display tabular-nums truncate block">
                  {classesCount} Kelas
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-violet-600 transition-colors">
                  <span>Daftar rombel akademik</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-violet-600 transition-colors" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>

          {/* Recent Scheduled Exams Table Container */}
          <div className="bg-white rounded-2xl border border-[#ddd9ef] shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  Daftar Paket Ujian Terkini
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola paket ujian, akses pemantauan, dan buka lembar koreksi
                </p>
              </div>

              {/* Status Tab Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-[#f1effa] rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setExamStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      examStatusFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamStatusFilter('in_progress')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      examStatusFilter === 'in_progress'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Berlangsung
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamStatusFilter('completed')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      examStatusFilter === 'completed'
                        ? 'bg-white text-violet-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Selesai
                  </button>
                </div>

                <Link
                  href="/exams"
                  className="text-xs font-bold text-slate-900 hover:text-violet-600 flex items-center gap-1 font-mono transition-colors shrink-0 rounded-lg px-2 py-1"
                >
                  <span>Semua ({recentExams.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <TableContainer accent="none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3.5">Judul Ujian</TableHead>
                    <TableHead className="px-6 py-3.5">Kelas</TableHead>
                    <TableHead className="px-6 py-3.5">Durasi</TableHead>
                    <TableHead className="px-6 py-3.5">Pengawasan</TableHead>
                    <TableHead className="px-6 py-3.5">Status</TableHead>
                    <TableHead className="px-6 py-3.5 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="px-6 py-4 font-bold text-slate-900 text-sm max-w-xs truncate min-w-0">
                        {exam.title}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                        {exam.class_name || '-'}
                      </TableCell>
                      <TableCell className="px-6 py-4 tabular-nums font-mono text-slate-700 whitespace-nowrap">
                        {exam.duration_minutes} Menit
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="violet" size="sm" icon={<Eye className="w-3 h-3" aria-hidden="true" />}>
                          {exam.proctoring_level === 'dual_camera'
                            ? 'Dual-Camera'
                            : exam.proctoring_level === 'single_camera'
                            ? 'Kamera Utama'
                            : 'Standar'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            exam.status === 'in_progress'
                              ? 'emerald'
                              : exam.status === 'published'
                              ? 'violet'
                              : 'neutral'
                          }
                          size="sm"
                          dot={exam.status === 'in_progress'}
                          dotPulse={exam.status === 'in_progress'}
                        >
                          {exam.status === 'published'
                            ? 'Terjadwal'
                            : exam.status === 'in_progress'
                            ? 'Berlangsung'
                            : exam.status === 'completed'
                            ? 'Selesai'
                            : exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/exams/${exam.id}/monitor`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none"
                        >
                          <Radio className="w-3 h-3" aria-hidden="true" />
                          <span>Live Monitor</span>
                        </Link>
                        <Link
                          href={`/grading/${exam.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:outline-none"
                        >
                          <span>Koreksi Esai</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Empty state when no exams match filter or total is 0 */}
                  {filteredExams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState
                          icon={<FileSpreadsheet className="w-6 h-6 text-slate-500" aria-hidden="true" />}
                          title="Belum Ada Paket Ujian pada Filter Ini"
                          description="Mulai dengan membuat paket ujian pertama dan jadwalkan untuk rombel kelas siswa Anda."
                          action={
                            <Link href="/exams/create">
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />}
                              >
                                Buat Paket Ujian
                              </Button>
                            </Link>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}
    </div>
  )
}
