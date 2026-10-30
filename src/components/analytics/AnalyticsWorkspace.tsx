'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Loader2,
  AlertCircle,
  RotateCcw,
  X,
  Activity,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import api from '@/lib/api'
import { fetchCachedExamsList } from '@/lib/bentoCache'
import {
  DashboardShell,
  StatCard,
  DashboardCard,
  getSuperAdminNavTabs,
} from '@/components/dashboard'
import { useAuthStore } from '@/stores/authStore'

interface ItemAnalysis {
  question_id: number
  question_type: string
  prompt: string
  difficulty_index: number
  difficulty_category: string
  discrimination_index: number
  discrimination_category: string
  status: string
}

interface AnalyticsData {
  total_submissions?: number
  total_examinees?: number
  average_score?: number
  pass_rate?: number
  mastery_percentage?: number
  highest_score?: number
  lowest_score?: number
  std_deviation?: number
  standard_deviation?: number
  score_distribution?: Record<string, number>
  item_analysis?: ItemAnalysis[]
}

interface ExamOption {
  id: number
  title: string
  class_name: string
}

interface AnalyticsWorkspaceProps {
  initialExamId?: number
}

export default function AnalyticsWorkspace({ initialExamId }: AnalyticsWorkspaceProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('analytics')
  const [examId, setExamId] = useState<number | null>(initialExamId ?? null)
  const [selectedExamId, setSelectedExamId] = useState<number | null>(initialExamId ?? null)
  const [allExams, setAllExams] = useState<ExamOption[]>([])
  const [examsListLoaded, setExamsListLoaded] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [exportNotice, setExportNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  function showExportNotice(type: 'error' | 'success', text: string) {
    setExportNotice({ type, text })
    setTimeout(() => {
      setExportNotice((curr) => (curr?.text === text ? null : curr))
    }, 4500)
  }

  const distributionBins = useMemo(() => {
    if (analyticsData?.score_distribution) {
      const dist = analyticsData.score_distribution
      return Object.entries(dist).map(([range, count]) => ({
        range,
        count: Number(count) || 0,
      }))
    }
    return [
      { range: '0-49', count: 0 },
      { range: '50-69', count: 0 },
      { range: '70-84', count: 0 },
      { range: '85-100', count: 0 },
    ]
  }, [analyticsData])

  const maxBinCount = useMemo(() => {
    return Math.max(...distributionBins.map((b) => b.count), 1)
  }, [distributionBins])

  function handlePrint() {
    window.print()
  }

  async function downloadExcel() {
    if (examId == null) return
    if (isDownloadingExcel) return
    setIsDownloadingExcel(true)
    try {
      const res = await api.get(`/analytics/exam/${examId}/export/excel`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rekap_nilai_exam_${examId}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showExportNotice('success', 'Rekap nilai format Excel berhasil diunduh.')
    } catch {
      showExportNotice('error', 'Gagal mengunduh berkas Excel. Pastikan paket ujian telah memiliki data nilai siswa.')
    } finally {
      setIsDownloadingExcel(false)
    }
  }

  async function downloadPdf() {
    if (examId == null) return
    if (isDownloadingPdf) return
    setIsDownloadingPdf(true)
    try {
      const res = await api.get(`/analytics/exam/${examId}/export/pdf`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `berita_acara_exam_${examId}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showExportNotice('success', 'Dokumen Berita Acara PDF berhasil diunduh.')
    } catch {
      showExportNotice('error', 'Gagal mengunduh berkas Berita Acara PDF. Pastikan ujian telah selesai.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  async function loadExamsList() {
    try {
      const exams: ExamOption[] = await fetchCachedExamsList<ExamOption>()
      setAllExams(exams)
      if (!initialExamId && exams.length > 0) {
        setExamId(exams[0].id)
        setSelectedExamId(exams[0].id)
      }
    } catch (err) {
      console.warn('Failed to load exams list:', err)
    } finally {
      setExamsListLoaded(true)
    }
  }

  async function loadAnalytics(id: number) {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.get(`/analytics/exam/${id}/items`)
      setAnalyticsData(res.data.data)
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
      setErrorMessage(
        err.response?.data?.message ||
          'Gagal memuat data analisis psikometrik butir soal. Periksa koneksi ke server ujian CBT.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleExamChange(newId: number) {
    setSelectedExamId(newId)
    setExamId(newId)
    setErrorMessage(null)
    router.push(`/exams/${newId}/analytics`)
    loadAnalytics(newId)
  }

  useEffect(() => {
    loadExamsList()
  }, [])

  useEffect(() => {
    if (examId) {
      loadAnalytics(examId)
    }
  }, [examId])

  const navTabs = useMemo(
    () => (user?.role === 'superadmin' ? getSuperAdminNavTabs() : undefined),
    [user?.role]
  )

  return (
    <DashboardShell
      navTabs={navTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      greetingName={user?.full_name || 'Super Admin'}
      greetingSubtitle="Evaluasi statistik psikometrik butir soal, kurva distribusi nilai, dan ekspor Berita Acara ujian."
      greetingAction={
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekapitulasi</span>
          </button>

          <button
            type="button"
            onClick={downloadExcel}
            disabled={isDownloadingExcel}
            className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isDownloadingExcel ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isDownloadingExcel ? 'Mengunduh...' : 'Unduh Rekap Excel'}</span>
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={isDownloadingPdf}
            className="min-h-[40px] sm:min-h-[44px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#150f23] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 transition-colors cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#150f23] focus:outline-none"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
            ) : (
              <FileText className="w-4 h-4 text-[#c2ef4e]" />
            )}
            <span>{isDownloadingPdf ? 'Mengunduh...' : 'Unduh Berita Acara PDF'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Printable Official Header (Shown Only on Print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                LAPORAN REKAPITULASI EVALUASI & STATISTIK UJIAN
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Sistem Evaluasi Akademik Terpadu — EXAMIND Platform
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-bold">
                Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
              <p className="text-[10px] font-mono text-slate-400">EXAM-ID: {examId ?? '—'}</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-xs flex justify-between">
            <p>
              <span className="font-bold text-slate-500">Paket Ujian:</span>{' '}
              {examId != null
                ? allExams.find((e) => e.id === examId)?.title || `Ujian #${examId}`
                : '—'}
            </p>
            <p>
              <span className="font-bold text-slate-500">Total Peserta:</span>{' '}
              {analyticsData?.total_submissions || 0} Siswa
            </p>
            <p>
              <span className="font-bold text-slate-500">Rata-rata Nilai:</span>{' '}
              {analyticsData?.average_score || 0}
            </p>
            <p>
              <span className="font-bold text-slate-500">Ketuntasan KKM:</span>{' '}
              {analyticsData?.mastery_percentage || 0}%
            </p>
          </div>
        </div>

        {/* Export Notification */}
        {exportNotice && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
              exportNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="font-semibold">{exportNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setExportNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Error state with retry */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => examId != null && loadAnalytics(examId)}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* Exam Selector Banner */}
        {allExams.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-3 text-slate-800 print:hidden">
            <span className="text-xs font-bold text-slate-600 uppercase font-mono">Pilih Paket Ujian:</span>
            <select
              value={selectedExamId ?? ''}
              onChange={(e) => handleExamChange(Number(e.target.value))}
              aria-label="Pilih Paket Ujian"
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#150f23] text-slate-900 font-sans shadow-xs cursor-pointer"
            >
              {allExams.map((e) => (
                <option key={e.id} value={e.id} className="bg-white text-slate-900">
                  {e.title} ({e.class_name})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* KPI Metric Cards with rich semantic tones */}
        {examId != null ? (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rata-Rata Kelas */}
          <StatCard
            title="Rata-Rata Kelas"
            value={analyticsData?.average_score ?? 0}
            icon={<Activity className="w-5 h-5 text-violet-600" aria-hidden="true" />}
            tone="violet"
            subtitle={`Dari ${analyticsData?.total_examinees ?? analyticsData?.total_submissions ?? 0} siswa dinilai`}
            className="min-h-[160px]"
          />

          {/* Ketuntasan KKM */}
          <StatCard
            title="Ketuntasan KKM (70.0)"
            value={`${analyticsData?.pass_rate ?? analyticsData?.mastery_percentage ?? 0}%`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
            tone="emerald"
            trend={{ value: 'TUNTAS', positive: true, label: 'standar KKM' }}
            subtitle="Standar Kurikulum Nasional"
            className="min-h-[160px]"
          />

          {/* Nilai Tertinggi / Terendah */}
          <StatCard
            title="Nilai Tertinggi / Terendah"
            value={`${analyticsData?.highest_score ?? 0} / ${analyticsData?.lowest_score ?? 0}`}
            icon={<TrendingUp className="w-5 h-5 text-amber-600" aria-hidden="true" />}
            tone="amber"
            subtitle="Rentang sebaran nilai siswa"
            className="min-h-[160px]"
          />

          {/* Standar Deviasi */}
          <StatCard
            title="Standar Deviasi"
            value={analyticsData?.std_deviation ?? analyticsData?.standard_deviation ?? 0}
            icon={<Sparkles className="w-5 h-5 text-[#6a5fc1]" aria-hidden="true" />}
            tone="violet"
            subtitle="Tingkat homogenitas kelas"
            className="min-h-[160px]"
          />
        </div>

        {/* Score Distribution Histogram Curve */}
        <DashboardCard
          title="Kurva Distribusi Nilai Kelas"
          subtitle="Frekuensi perolehan rentang skor peserta ujian"
        >
          <div className="h-52 flex items-end justify-between gap-3 sm:gap-4 pt-6 px-4 border-b border-slate-100">
            {distributionBins.map((bin, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
              >
                <div className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 font-mono tabular-nums transition-colors">
                  {bin.count} Siswa
                </div>
                <div
                  className={`w-full rounded-t-xl transition-[color,background-color,border-color,transform] duration-200 group-hover:scale-y-105 ${
                    bin.count === maxBinCount && bin.count > 0
                      ? 'bg-[#150f23] ring-2 ring-violet-400 shadow-md'
                      : 'bg-slate-800 group-hover:bg-[#150f23]'
                  }`}
                  style={{ height: `${Math.max(14, (bin.count / maxBinCount) * 130)}px` }}
                />
                <div className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 text-center font-mono pt-1">
                  {bin.range}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Item Analysis Table */}
        <DashboardCard
          title="Tabel Analisis Butir Soal (Item Psychometrics)"
          subtitle="Korelasi tingkat kesukaran dan daya pembeda butir soal"
          noPadding
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
          ) : (
            <div>
              {/* Mobile Card List View (<md) */}
              <div className="md:hidden divide-y divide-slate-100">
                {(analyticsData?.item_analysis || []).map((item, idx) => (
                  <div key={item.question_id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-800 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono shadow-2xs ${
                            item.question_type === 'multiple_choice'
                              ? 'bg-violet-50 text-violet-700 border border-violet-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.question_type === 'multiple_choice' ? 'PG' : 'Esai'}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block shadow-2xs ${
                          item.status === 'good'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.status === 'revise'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status === 'good'
                          ? 'Sangat Baik'
                          : item.status === 'revise'
                          ? 'Perlu Revisi'
                          : 'Gugur'}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.prompt}</p>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/80 text-[11px]">
                      <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">T. Kesukaran</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {item.difficulty_index}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize font-mono">
                            ({item.difficulty_category})
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Daya Pembeda</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {item.discrimination_index}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize font-mono">
                            ({item.discrimination_category})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!analyticsData?.item_analysis || analyticsData.item_analysis.length === 0) && (
                  <div className="py-10 px-4 text-center text-slate-500 text-xs">
                    Data analisis butir soal belum tersedia. Pastikan paket ujian telah diselesaikan oleh siswa untuk memproses evaluasi psikometrik.
                  </div>
                )}
              </div>

              {/* Desktop Table View (>=md) */}
              <div className="hidden md:block overflow-x-auto touch-pan-x">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">No</th>
                      <th className="py-3 px-4">Tipe Soal</th>
                      <th className="py-3 px-4">Butir Soal</th>
                      <th className="py-3 px-4">Tingkat Kesukaran</th>
                      <th className="py-3 px-4">Daya Pembeda</th>
                      <th className="py-3 px-5 font-semibold text-right">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(analyticsData?.item_analysis || []).map((item, idx) => (
                      <tr key={item.question_id} className="hover:bg-[#f1effa] transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono shadow-2xs ${
                              item.question_type === 'multiple_choice'
                                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {item.question_type === 'multiple_choice' ? 'PG' : 'Esai'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-900 font-semibold">{item.prompt}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {item.difficulty_index}
                          </span>
                          <span className="text-[10px] text-slate-500 block capitalize font-mono">
                            ({item.difficulty_category})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {item.discrimination_index}
                          </span>
                          <span className="text-[10px] text-slate-500 block capitalize font-mono">
                            ({item.discrimination_category})
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block shadow-2xs ${
                              item.status === 'good'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : item.status === 'revise'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.status === 'good'
                              ? 'Sangat Baik'
                              : item.status === 'revise'
                              ? 'Perlu Revisi'
                              : 'Gugur'}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {(!analyticsData?.item_analysis || analyticsData.item_analysis.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                          Data analisis butir soal belum tersedia. Pastikan paket ujian telah diselesaikan oleh siswa untuk memproses evaluasi psikometrik.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DashboardCard>
          </>
        ) : examsListLoaded ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Belum Ada Paket Ujian</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Tidak ada paket ujian yang tersedia untuk dianalisis. Buat paket ujian terlebih dahulu, atau
              hubungi admin sekolah jika Anda merasa ini keliru.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-8 text-center">
            <p className="text-xs font-semibold text-slate-500">Memuat daftar paket ujian...</p>
          </div>
        )}

        {/* Printable Official Signature Block */}
        <div className="hidden print:block mt-10 pt-6 border-t border-slate-300">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-medium text-slate-700">
                Mengetahui,
                <br />
                Kepala Sekolah / Wakil Kurikulum
              </p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">Kepala Sekolah / Kurikulum</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. ........................................</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Guru Pengampu / Pengawas Ujian,</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">Guru Pengampu Mata Pelajaran</p>
              <p className="text-[10px] text-slate-500 font-mono">EXAMIND Certified System Report</p>
            </div>
          </div>
          <div className="mt-8 text-center text-[10px] text-slate-500 font-mono">
            Rekapitulasi nilai dan analisis psikometrik ini dicetak secara sah melalui platform evaluasi akademik
            EXAMIND.
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
