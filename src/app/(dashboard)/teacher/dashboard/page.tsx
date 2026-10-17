'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

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

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [bRes, eRes, cRes] = await Promise.allSettled([
        api.get('/questions/banks'),
        api.get('/exams'),
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
        setRecentExams(exams.slice(0, 6))
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
  const inProgressExams = recentExams.filter((e) => e.status === 'in_progress')
  const completedExams = recentExams.filter((e) => e.status === 'completed')
  const attentionItemsCount = inProgressExams.length + completedExams.length

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Institutional Light Header with Ambient Glow */}
      <div className="bg-gradient-to-r from-white via-white to-indigo-50/30 rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-1.5 relative z-10 min-w-0 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
              Portal Guru & Pengawas
            </span>
            <span className="text-xs text-slate-500 font-mono truncate">
              NIP: {user?.identifier || '-'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-slate-900 truncate">
            Selamat Datang, {user?.full_name || 'Bapak/Ibu Guru'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pusat pemantauan ujian kelas, koreksi rubrik esai AI, dan penyusunan master bank butir soal.
          </p>
        </div>

        {/* Action Header: ONE Primary CTA ("Buat Paket Ujian") + Secondary Ghost Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto">
          <Link
            href="/questions"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <BookOpen className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span>Buka Bank Soal</span>
          </Link>
          <Link
            href="/exams/create"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none font-display tracking-wide"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Buat Paket Ujian</span>
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat ringkasan aktivitas pengawas...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Menghubungkan data ujian, rombel siswa, dan status koreksi esai Anda.
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          {/* PRIMARY FOCUS: "What needs my attention?" Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
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
                    Sesi ujian yang sedang berlangsung atau lembar jawaban yang menunggu koreksi
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
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-3 hover:bg-rose-50/70 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span className="text-[10px] font-bold uppercase font-mono text-rose-700 tracking-wider">
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
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
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
                    className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-center justify-between gap-3 hover:bg-indigo-50/60 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase font-mono text-indigo-700 tracking-wider">
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
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                    >
                      <span>Koreksi Esai</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  Tidak ada sesi ujian aktif yang membutuhkan pengawasan langsung atau koreksi esai mendesak saat ini.
                </span>
              </div>
            )}
          </div>

          {/* Genuine KPI Overview (Non-redundant 3-col grid, marketing cards removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                  Master Bank Soal
                </span>
                <span className="text-2xl font-black text-slate-900 font-display tabular-nums truncate block">
                  {banksCount} Paket
                </span>
                <span className="text-[11px] text-slate-500 block truncate">Koleksi butir pedagogis</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold shrink-0">
                <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                  Paket Ujian Terjadwal
                </span>
                <span className="text-2xl font-black text-slate-900 font-display tabular-nums truncate block">
                  {examsCount} Jadwal
                </span>
                <span className="text-[11px] text-slate-500 block truncate">Asesmen CBT terdaftar</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/70 flex items-center justify-center font-bold shrink-0">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                  Rombel Belajar
                </span>
                <span className="text-2xl font-black text-slate-900 font-display tabular-nums truncate block">
                  {classesCount} Kelas
                </span>
                <span className="text-[11px] text-slate-500 block truncate">Kelas akademik aktif</span>
              </div>
            </div>
          </div>

          {/* Recent Scheduled Exams Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  Daftar Paket Ujian Terkini
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola paket ujian, akses pemantauan, dan buka lembar koreksi
                </p>
              </div>
              <Link
                href="/exams"
                className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 font-mono transition-colors shrink-0 focus:ring-2 focus:ring-slate-900/10 focus:outline-none rounded-lg px-2 py-1"
              >
                <span>Lihat Semua Ujian</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 font-mono">
                  <tr>
                    <th className="px-6 py-3.5">Judul Ujian</th>
                    <th className="px-6 py-3.5">Kelas</th>
                    <th className="px-6 py-3.5">Durasi</th>
                    <th className="px-6 py-3.5">Pengawasan</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm max-w-xs truncate min-w-0">
                        {exam.title}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                        {exam.class_name || '-'}
                      </td>
                      <td className="px-6 py-4 tabular-nums font-mono text-slate-700 whitespace-nowrap">
                        {exam.duration_minutes} Menit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
                          <Eye className="w-3 h-3" aria-hidden="true" />
                          {exam.proctoring_level === 'dual_camera'
                            ? 'Dual-Camera'
                            : exam.proctoring_level === 'single_camera'
                            ? 'Kamera Utama'
                            : 'Standar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border font-mono ${
                            exam.status === 'published' || exam.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : exam.status === 'in_progress'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {exam.status === 'published'
                            ? 'Terjadwal'
                            : exam.status === 'in_progress'
                            ? 'Berlangsung'
                            : exam.status === 'completed'
                            ? 'Selesai'
                            : exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/exams/${exam.id}/monitor`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                        >
                          <Radio className="w-3 h-3" aria-hidden="true" />
                          <span>Live Monitor</span>
                        </Link>
                        <Link
                          href={`/grading/${exam.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                        >
                          <span>Koreksi Esai</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentExams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                            <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <p className="font-bold text-slate-900 text-sm">Belum Ada Paket Ujian</p>
                          <p className="text-xs text-slate-500 mt-1 mb-3">
                            Mulai dengan membuat paket ujian pertama dan jadwalkan untuk kelas siswa Anda.
                          </p>
                          <Link
                            href="/exams/create"
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                            <span>Buat Paket Ujian</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

