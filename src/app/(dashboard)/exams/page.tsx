'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Eye, Radio, BarChart3, Loader2, FileText, AlertTriangle, RefreshCw } from 'lucide-react'
import { fetchCachedExamsList } from '@/lib/bentoCache'
import { formatDate } from '@/lib/utils'

interface ExamItem {
  id: number
  title: string
  class_name: string
  start_time: string
  duration_minutes: number
  proctoring_level: string
  exam_mode?: 'live' | 'non_live' | string
  questions_count: number
  total_points: number
  status: string
}

export default function ExamListPage() {
  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadExams = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const exams = await fetchCachedExamsList<ExamItem>()
      setExams(exams)
    } catch (err: any) {
      console.error('Failed to load exams:', err)
      setErrorMessage(
        err.response?.data?.message || 'Gagal memuat daftar paket ujian. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
            Manajemen Paket Ujian & Jadwal
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Buat paket ujian, konfigurasikan pengawasan dual-camera, dan jadwalkan pengerjaan untuk kelas siswa.
          </p>
        </div>

        {/* ONE Primary Action: Buat Paket Ujian */}
        <Link
          href="/exams/create"
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-colors flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide shrink-0 w-full sm:w-auto focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
        >
          <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
          <span>Buat Paket Ujian</span>
        </Link>
      </div>

      {/* Exams Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-900">Memuat daftar paket ujian...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Gagal Mengambil Data Ujian</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={loadExams}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-[#f1effa] text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-[#ddd9ef]">
                <tr>
                  <th className="px-6 py-4">Judul Ujian</th>
                  <th className="px-6 py-4">Kelas Sasaran</th>
                  <th className="px-6 py-4">Jadwal & Durasi</th>
                  <th className="px-6 py-4">Pengawasan</th>
                  <th className="px-6 py-4">Total Butir Soal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {exams.map((e) => (
                  <tr key={e.id} className="hover:bg-[#f1effa] transition-colors">
                    <td className="px-6 py-4 max-w-xs truncate min-w-0">
                      <Link
                        href={`/exams/${e.id}`}
                        className="font-display font-bold text-slate-900 hover:text-violet-600 transition-colors truncate block"
                      >
                        {e.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                      {e.class_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-semibold text-slate-800">{formatDate(e.start_time)}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {e.duration_minutes} Menit • {e.exam_mode === 'non_live' ? 'Mandiri' : 'Live'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize font-mono bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs">
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        {(e.proctoring_level || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono tabular-nums whitespace-nowrap">
                      {e.questions_count ?? 0} Butir ({e.total_points ?? 0} Poin)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono border shadow-xs ${
                          e.status === 'in_progress'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : e.status === 'published'
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {e.status === 'published'
                          ? 'Terjadwal'
                          : e.status === 'in_progress'
                          ? 'Berlangsung'
                          : e.status === 'completed'
                          ? 'Selesai'
                          : e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/exams/${e.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs inline-block focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                      >
                        Kelola
                      </Link>
                      {e.status === 'published' && (
                        <Link
                          href={`/exams/${e.id}/monitor`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" aria-hidden="true" />
                          <span>Monitor</span>
                        </Link>
                      )}
                      {e.status === 'completed' && (
                        <Link
                          href={`/exams/${e.id}/analytics`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-bold text-xs transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                        >
                          <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Hasil</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 px-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-violet-600" aria-hidden="true" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Belum Ada Paket Ujian</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Mulai dengan membuat paket ujian pertama untuk menjadwalkan asesmen siswa.
                      </p>
                      <Link
                        href="/exams/create"
                        className="mt-4 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                      >
                        <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                        <span>Buat Paket Ujian</span>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

