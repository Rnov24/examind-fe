'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-react'
import api from '@/lib/api'

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
  const [examId, setExamId] = useState<number>(initialExamId || 1)
  const [selectedExamId, setSelectedExamId] = useState<number>(initialExamId || 1)
  const [allExams, setAllExams] = useState<ExamOption[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    } catch {
      alert('Gagal mengunduh berkas Excel. Pastikan ujian memiliki data nilai.')
    } finally {
      setIsDownloadingExcel(false)
    }
  }

  async function downloadPdf() {
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
    } catch {
      alert('Gagal mengunduh berkas Berita Acara PDF.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  async function loadExamsList() {
    try {
      const res = await api.get('/exams')
      const exams: ExamOption[] = res.data.data || []
      setAllExams(exams)
      if (!initialExamId && exams.length > 0) {
        setExamId(exams[0].id)
        setSelectedExamId(exams[0].id)
      }
    } catch (err) {
      console.warn('Failed to load exams list:', err)
    }
  }

  async function loadAnalytics(id: number) {
    setIsLoading(true)
    try {
      const res = await api.get(`/analytics/exam/${id}/items`)
      setAnalyticsData(res.data.data)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleExamChange(newId: number) {
    setSelectedExamId(newId)
    setExamId(newId)
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

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5">
          <Link
            href="/exams"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Analisis Butir Soal & Laporan Resmi
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Evaluasi statistik psikometrik butir soal dan ekspor Berita Acara ujian
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Nilai</span>
          </button>

          <button
            onClick={downloadExcel}
            disabled={isDownloadingExcel}
            className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isDownloadingExcel ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isDownloadingExcel ? 'Mengunduh...' : 'Unduh Excel'}</span>
          </button>

          <button
            onClick={downloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
            ) : (
              <FileText className="w-4 h-4 text-[#c2ef4e]" />
            )}
            <span>{isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF Berita Acara'}</span>
          </button>
        </div>
      </div>

      {/* Printable Official Header (Shown Only on Print) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              LAPORAN REKAPITULASI EVALUASI & STATISTIK UJIAN
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Sistem Evaluasi Akademik Terpadu — EXAMIND Platform
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold">
              Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
            <p className="text-[10px] font-mono text-slate-400">EXAM-ID: {examId}</p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-200 text-xs flex justify-between">
          <p>
            <span className="font-bold text-slate-500">Paket Ujian:</span>{' '}
            {allExams.find((e) => e.id === examId)?.title || `Ujian #${examId}`}
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

      {/* Exam Selector */}
      {allExams.length > 1 && (
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-3 text-slate-800 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase font-mono">Pilih Paket Ujian:</span>
          <select
            value={selectedExamId}
            onChange={(e) => handleExamChange(Number(e.target.value))}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-slate-400 text-slate-900 font-sans shadow-xs"
          >
            {allExams.map((e) => (
              <option key={e.id} value={e.id} className="bg-white text-slate-900">
                {e.title} ({e.class_name})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Rata-Rata Kelas
          </span>
          <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {analyticsData?.average_score ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Dari total {analyticsData?.total_examinees ?? analyticsData?.total_submissions ?? 0} siswa dinilai
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Ketuntasan KKM (70.0)
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {analyticsData?.pass_rate ?? analyticsData?.mastery_percentage ?? 0}%
            </span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#c2ef4e] text-slate-950 font-mono shadow-xs">
              TUNTAS
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Standar Kurikulum Nasional</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Nilai Tertinggi / Terendah
          </span>
          <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {analyticsData?.highest_score ?? 0}{' '}
            <span className="text-lg text-slate-400 font-normal">/ {analyticsData?.lowest_score ?? 0}</span>
          </div>
          <p className="text-[11px] text-slate-400">Rentang sebaran nilai siswa</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Standar Deviasi
          </span>
          <div className="font-display text-3xl font-extrabold text-indigo-700 tracking-tight tabular-nums">
            {analyticsData?.std_deviation ?? analyticsData?.standard_deviation ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Tingkat homogenitas kelas</p>
        </div>
      </div>

      {/* Score Distribution Histogram Curve */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Kurva Distribusi Nilai Kelas</h3>
            <p className="text-xs text-slate-500">Frekuensi perolehan rentang skor peserta ujian</p>
          </div>
        </div>

        <div className="h-52 flex items-end justify-between gap-3 sm:gap-4 pt-8 px-4 border-b border-slate-100">
          {distributionBins.map((bin, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
            >
              <div className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 font-mono tabular-nums transition-colors">
                {bin.count} Siswa
              </div>
              <div
                className={`w-full rounded-t-xl transition-all duration-200 group-hover:scale-y-105 ${
                  bin.count === maxBinCount && bin.count > 0
                    ? 'bg-[#c2ef4e] border-t-2 border-[#addc3b] shadow-xs'
                    : 'bg-slate-900 group-hover:bg-slate-800'
                }`}
                style={{ height: `${Math.max(14, (bin.count / maxBinCount) * 130)}px` }}
              />
              <div className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-900 text-center font-mono pt-1">
                {bin.range}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Analysis Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Tabel Analisis Butir Soal (Item Psychometrics)
            </h3>
            <p className="text-xs text-slate-500">Korelasi tingkat kesukaran dan daya pembeda butir soal</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Tipe Soal</th>
                  <th className="px-6 py-4">Butir Soal</th>
                  <th className="px-6 py-4">Tingkat Kesukaran</th>
                  <th className="px-6 py-4">Daya Pembeda</th>
                  <th className="px-6 py-4">Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(analyticsData?.item_analysis || []).map((item, idx) => (
                  <tr key={item.question_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase font-mono shadow-xs ${
                          item.question_type === 'multiple_choice'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.question_type === 'multiple_choice' ? 'PG' : 'Esai'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-900 font-medium">{item.prompt}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 font-mono tabular-nums">
                        {item.difficulty_index}
                      </span>
                      <span className="text-xs text-slate-400 block capitalize font-mono">
                        ({item.difficulty_category})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 font-mono tabular-nums">
                        {item.discrimination_index}
                      </span>
                      <span className="text-xs text-slate-400 block capitalize font-mono">
                        ({item.discrimination_category})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold font-mono inline-block shadow-xs ${
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
                    <td colSpan={6} className="p-16 text-center text-slate-400 text-xs">
                      Data analisis butir soal belum tersedia atau siswa belum mengumpulkan ujian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
        <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
          Rekapitulasi nilai dan analisis psikometrik ini dicetak secara sah melalui platform evaluasi akademik
          EXAMIND.
        </div>
      </div>
    </div>
  )
}
