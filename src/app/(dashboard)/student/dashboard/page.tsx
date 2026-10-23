'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Eye,
  FileText,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
  RefreshCw,
  Loader2,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Stagger, StaggerItem } from '@/components/system/PageTransition'
import { Badge, Button, EmptyState } from '@/components/ui'

interface ActiveExam {
  id: number
  title: string
  class_name: string
  duration_minutes: number
  teacher_name?: string
  proctoring_level: string
  start_time?: string
}

export default function StudentDashboardPage() {
  const { user } = useAuthStore()
  const [activeExams, setActiveExams] = useState<ActiveExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadActiveExams = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.get('/student/exams/active')
      setActiveExams(res.data.data || [])
    } catch (err: any) {
      console.error('Failed to load active exams:', err)
      setErrorMessage(
        err.response?.data?.message ||
          'Gagal memuat jadwal ujian. Pastikan koneksi internet aktif dan silakan coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActiveExams()
  }, [loadActiveExams])

  const heroExam = activeExams.length > 0 ? activeExams[0] : null
  const otherExams = activeExams.length > 1 ? activeExams.slice(1) : []

  return (
    <Stagger className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Institutional Daylight Header */}
      <StaggerItem>
      <div className="relative overflow-hidden bg-[#150f23] bg-grid-dots-dark rounded-2xl border border-[#362d59] p-5 sm:p-6 shadow-midnight-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-[#6a5fc1]/20 rounded-full blur-3xl"></div>

        <div className="relative space-y-2 max-w-xl min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 border border-white/15 px-2 py-0.5 rounded-md font-mono">
              Portal Asesmen Siswa
            </span>
            <span className="text-xs font-semibold text-[#bdb8c0] font-mono bg-white/10 px-2 py-0.5 rounded-md border border-white/15 truncate">
              NISN: {user?.identifier || '-'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
            Selamat Datang, {user?.full_name || 'Siswa'}
          </h1>
          <p className="text-xs sm:text-sm text-[#bdb8c0] leading-relaxed">
            Periksa paket ujian terjadwal Anda dan pastikan perangkat kamera telah siap sebelum memulai.
          </p>
        </div>

        <div className="relative flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#bdb8c0] tracking-wider font-mono">
            Status Perangkat
          </span>
          <Badge variant="emerald" size="lg" dot dotPulse>
            Siap Ujian (Ready)
          </Badge>
        </div>
      </div>
      </StaggerItem>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-[#ddd9ef] p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat jadwal paket ujian...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Menghubungkan ke server CBT sekolah untuk mengambil paket ujian aktif Anda.
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Gagal Mengambil Jadwal Ujian</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={loadActiveExams}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Main Content: Distilled to "What exam do I take next" */}
      {!isLoading && !errorMessage && heroExam && (
        <>
          {/* PRIMARY HERO: The Next Exam to Take (Focal Moment: authored rise + subtle lime edge glow pulse on mount) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#150f23] via-[#1f1633] to-[#2a1e47] text-white rounded-2xl p-6 sm:p-8 shadow-midnight-elevated border border-[#362d59] hero-exam-card">
            {/* Subtle Lime Edge Glow Pulse on Mount (Transform + Opacity only) */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#c2ef4e]/60 hero-lime-glow" aria-hidden="true" />
            <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>
            <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 bg-[#c2ef4e]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#c2ef4e] text-slate-950 font-mono shadow-xs">
                    Ujian Aktif Berikutnya
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/10 text-white border border-white/10 font-mono">
                    {heroExam.class_name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-violet-400/15 text-violet-200 border border-violet-400/20 font-mono">
                  <Eye className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                  {heroExam.proctoring_level === 'dual_camera'
                    ? 'Dual-Camera Proctoring'
                    : heroExam.proctoring_level === 'single_camera'
                    ? 'Kamera Utama'
                    : 'Pengawasan Standar'}
                </span>
              </div>

              <div className="space-y-2 max-w-2xl min-w-0">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {heroExam.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-1">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                    <strong>{heroExam.duration_minutes} Menit</strong>
                  </span>
                  {heroExam.teacher_name && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span>Pengampu: {heroExam.teacher_name}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* ONE Clear Primary Action with Secondary Link */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href={`/student/exam/${heroExam.id}`}
                  className="px-6 py-3.5 rounded-xl bg-[#c2ef4e] hover:bg-[#b0df3f] text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer font-display tracking-wide group focus:ring-2 focus:ring-white/40 focus:outline-none"
                >
                  <span>Mulai Ujian Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <Link
                  href={`/student/exam/${heroExam.id}/result`}
                  className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center cursor-pointer focus:ring-2 focus:ring-white/20 focus:outline-none"
                >
                  Lihat Riwayat & Pembahasan
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Scheduled Exams (if more than 1) */}
          {otherExams.length > 0 && (
            <StaggerItem className="bg-white rounded-2xl border border-[#ddd9ef] shadow-card overflow-hidden">
              <div className="p-4 sm:px-6 border-b border-[#e9e5f6] flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
                    Paket Ujian Terjadwal Lainnya
                  </h3>
                  <p className="text-xs text-slate-500">Daftar ujian yang juga ditugaskan untuk kelas Anda</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#584dae] bg-[#f1effa] px-2.5 py-1 rounded-lg border border-[#ddd9ef] tabular-nums">
                  {otherExams.length} Paket
                </span>
              </div>

              <div className="divide-y divide-[#e9e5f6]">
                {otherExams.map((exam, idx) => {
                  const staggerClass = idx === 0 ? 'reveal-stagger-1' : idx === 1 ? 'reveal-stagger-2' : 'reveal-stagger-3'
                  return (
                    <div
                      key={exam.id}
                      className={`p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#f1effa] transition-colors ${staggerClass}`}
                    >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1effa] text-[#584dae] font-mono">
                          {exam.class_name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Durasi: {exam.duration_minutes} Menit
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-900 truncate">
                        {exam.title}
                      </h4>
                      {exam.teacher_name && (
                        <p className="text-xs text-slate-500">Guru: {exam.teacher_name}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <Link
                        href={`/student/exam/${exam.id}`}
                        className="px-4 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                      >
                        <span>Mulai Ujian</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )
              })}
              </div>
            </StaggerItem>
          )}
        </>
      )}

      {/* Empty State: No Scheduled Exams */}
      {!isLoading && !errorMessage && activeExams.length === 0 && (
        <StaggerItem className="bg-white rounded-2xl border border-[#ddd9ef] p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#f1effa] border border-[#ddd9ef] text-[#6a5fc1] flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Belum Ada Paket Ujian Aktif</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Saat ini belum ada paket ujian terjadwal yang ditugaskan untuk kelas Anda. Silakan hubungi guru pengampu atau periksa jadwal terbaru.
          </p>
          <button
            type="button"
            onClick={loadActiveExams}
            className="px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Periksa Jadwal Terbaru</span>
          </button>
        </StaggerItem>
      )}

      {/* Progressive Disclosure: CBT Security & Integrity Accordion */}
      <StaggerItem>
      <details className="group bg-white rounded-2xl border border-[#ddd9ef] shadow-card overflow-hidden">
        <summary className="p-4 sm:px-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#f1effa] transition-colors list-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 font-display">
                Ketentuan Integritas & Pengawasan Ujian
              </p>
              <p className="text-[11px] text-slate-500">
                Panduan mode layar penuh, toleransi browser, dan pengawasan kamera AI
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform shrink-0" aria-hidden="true" />
        </summary>
        <div className="px-5 pb-5 pt-2 border-t border-[#e9e5f6] text-xs text-slate-600 leading-relaxed space-y-2">
          <p>
            Selama ujian berlangsung, aplikasi mewajibkan peserta berada dalam mode <strong>Layar Penuh (Full Screen)</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600">
            <li>Berpindah tab atau membuka aplikasi lain akan dicatat sebagai event peringatan.</li>
            <li>AI proctoring memantau keberadaan wajah dan lingkungan pengerjaan tanpa mendiskualifikasi otomatis.</li>
            <li>Guru pengawas berwenang penuh meninjau rekaman snapshot sebelum menentukan status kelulusan sesi Anda.</li>
          </ul>
        </div>
      </details>
      </StaggerItem>
    </Stagger>
  )
}

