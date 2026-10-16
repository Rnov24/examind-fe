'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, FileText, ShieldCheck, Camera, AlertTriangle, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function StudentDashboardPage() {
  const { user } = useAuthStore()
  const [activeExams, setActiveExams] = useState<any[]>([])

  useEffect(() => {
    async function loadActiveExams() {
      try {
        const res = await api.get('/student/exams/active')
        setActiveExams(res.data.data || [])
      } catch (err) {
        console.error('Failed to load active exams:', err)
      }
    }
    loadActiveExams()
  }, [])

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Institutional Daylight Header Card */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-emerald-50/70 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-50/50 rounded-full blur-2xl"></div>

        <div className="relative space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2.5 py-0.5 rounded font-mono shadow-xs">
              Portal Asesmen Siswa
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              NISN: {user?.identifier || '-'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Selamat Datang, {user?.full_name || 'Siswa'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Daftar paket ujian, evaluasi formatif/sumatif, dan status kesiapan perangkat pengawasan ujian Anda.
          </p>
        </div>

        <div className="relative flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
            Status Sistem
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Siap Ujian (Ready)
          </span>
        </div>
      </div>

      {/* Student Stats & Environment Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Ujian Terjadwal
            </span>
            <span className="text-lg font-bold text-slate-900 font-display tabular-nums">
              {activeExams.length} Paket Aktif
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Tersedia untuk dikerjakan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-emerald-50/70">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Pengawasan CBT
            </span>
            <span className="text-sm font-bold text-slate-900 block font-display">AI Proctoring Guard</span>
            <span className="text-[11px] text-slate-500">Human-in-the-Loop Review</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-purple-50/70">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
              Dual-Camera
            </span>
            <span className="text-sm font-bold text-slate-900 block font-display">Webcam & Smartphone</span>
            <span className="text-[11px] text-slate-500">Sinkronisasi QR Otomatis</span>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Security Notice */}
      <div className="p-5 bg-gradient-to-r from-amber-50/80 to-amber-50/30 border border-amber-200 text-amber-900 rounded-2xl shadow-card flex items-start gap-4 text-xs">
        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-amber-950 font-display text-sm">
            Ketentuan Integritas & Keamanan Ujian EXAMIND:
          </p>
          <p className="text-amber-900 text-xs leading-relaxed">
            Selama ujian berlangsung, peserta wajib berada dalam mode <strong>Layar Penuh (Full Screen)</strong>. Berpindah tab, meminimalkan jendela browser, atau pergerakan mencurigakan akan dicatat secara otomatis oleh sistem proctoring untuk ditinjau secara langsung oleh guru pengawas sebelum keputusan diambil.
          </p>
        </div>
      </div>

      {/* Active Exams List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">Daftar Paket Ujian Terjadwal</h2>
            <p className="text-xs text-slate-500">Pilih paket ujian aktif di bawah ini untuk memulai pengerjaan</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 tabular-nums">
            Total: {activeExams.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeExams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-slate-50/80 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                    {exam.class_name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5 font-mono">
                    <Eye className="w-3.5 h-3.5" />
                    {exam.proctoring_level === 'dual_camera'
                      ? 'Dual-Camera'
                      : exam.proctoring_level === 'single_camera'
                      ? 'Kamera Utama'
                      : 'Standar'}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span>⏱️ Durasi:</span>
                    <strong className="text-slate-800 font-mono font-bold">
                      {exam.duration_minutes} Menit
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>👨‍🏫 Pengampu:</span>
                    <strong className="text-slate-800 font-semibold">{exam.teacher_name}</strong>
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <Link
                  href={`/student/exam/${exam.id}/result`}
                  className="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Lihat Hasil / Nilai
                </Link>
                <Link
                  href={`/student/exam/${exam.id}`}
                  className="flex-1 sm:flex-initial text-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs hover:shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Mulai Ujian</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}

          {activeExams.length === 0 && (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Tidak Ada Ujian Aktif</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Saat ini tidak ada paket ujian terjadwal yang ditugaskan untuk kelas Anda. Silakan hubungi guru pengampu atau wali kelas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
