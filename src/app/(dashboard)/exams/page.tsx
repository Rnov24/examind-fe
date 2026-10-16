'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, Radio, BarChart3, Loader2, FileText } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface ExamItem {
  id: number
  title: string
  class_name: string
  start_time: string
  duration_minutes: number
  proctoring_level: string
  questions_count: number
  total_points: number
  status: string
}

export default function ExamListPage() {
  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)

  async function loadExams() {
    setLoading(true)
    try {
      const res = await api.get('/exams')
      setExams(res.data.data || [])
    } catch (err) {
      console.error('Failed to load exams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-card">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Paket Ujian & Jadwal
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Buat paket ujian, konfigurasikan pengawasan dual-camera, dan publikasikan ke kelas
          </p>
        </div>

        <Link
          href="/exams/create"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
          <span>Buat Paket Ujian Baru</span>
        </Link>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Judul Ujian</th>
                  <th className="px-6 py-4">Kelas Sasaran</th>
                  <th className="px-6 py-4">Jadwal & Durasi</th>
                  <th className="px-6 py-4">Pengawasan</th>
                  <th className="px-6 py-4">Total Soal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {exams.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/exams/${e.id}`}
                        className="font-display font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {e.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{e.class_name}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-800">{formatDate(e.start_time)}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{e.duration_minutes} Menit</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        {(e.proctoring_level || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono tabular-nums">
                      {e.questions_count ?? 0} Butir ({e.total_points ?? 0} Poin)
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono border shadow-xs ${
                          e.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/exams/${e.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs inline-block"
                      >
                        Kelola
                      </Link>
                      {e.status === 'published' && (
                        <Link
                          href={`/exams/${e.id}/monitor`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" aria-hidden="true" />
                          <span>Monitor</span>
                        </Link>
                      )}
                      {e.status === 'completed' && (
                        <Link
                          href={`/exams/${e.id}/analytics`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors cursor-pointer shadow-xs"
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
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Belum Ada Paket Ujian</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Mulai dengan membuat paket ujian pertama untuk menjadwalkan asesmen siswa.
                      </p>
                      <Link
                        href="/exams/create"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                        <span>Buat Ujian Baru</span>
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
