'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Eye,
  Radio,
  Plus,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function TeacherDashboardPage() {
  const { user } = useAuthStore()

  const [banksCount, setBanksCount] = useState(0)
  const [examsCount, setExamsCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [recentExams, setRecentExams] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, eRes, cRes] = await Promise.allSettled([
          api.get('/questions/banks'),
          api.get('/exams'),
          api.get('/academic/classes'),
        ])

        if (bRes.status === 'fulfilled') {
          setBanksCount((bRes.value.data.data || []).length)
        }
        if (eRes.status === 'fulfilled') {
          const exams = eRes.value.data.data || []
          setExamsCount(exams.length)
          setRecentExams(exams.slice(0, 5))
        }
        if (cRes.status === 'fulfilled') {
          setClassesCount((cRes.value.data.data || []).length)
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Institutional Light Header with Ambient Glow */}
      <div className="bg-gradient-to-r from-white via-white to-indigo-50/30 rounded-2xl border border-slate-200/90 p-4 sm:p-7 shadow-card relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
              Portal Guru & Pengawas
            </span>
            <span className="text-xs text-slate-400 font-mono">NIP: {user?.identifier || '-'}</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900">
            Selamat Datang, {user?.full_name || 'Bapak/Ibu Guru'}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Kelola bank butir soal, jadwalkan ujian CBT aman, pantau pengawasan dual-camera secara realtime, dan tinjau evaluasi esai berbasis AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <Link
            href="/questions"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300/90 hover:border-slate-400 transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <BookOpen className="w-4 h-4 text-slate-900" />
            <span>Bank Soal & AI</span>
          </Link>
          <Link
            href="/exams/create"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" />
            <span>Buat Ujian Baru</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50/80 text-indigo-700 ring-1 ring-indigo-200/60 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Bank Soal</span>
            <span className="text-2xl font-black text-slate-900 font-display tabular-nums">{banksCount} Paket</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-200/60 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Paket Ujian</span>
            <span className="text-2xl font-black text-slate-900 font-display tabular-nums">{examsCount} Jadwal</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50/80 text-purple-700 ring-1 ring-purple-200/60 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Rombel Belajar</span>
            <span className="text-2xl font-black text-slate-900 font-display tabular-nums">{classesCount} Kelas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50/80 text-amber-700 ring-1 ring-amber-200/60 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Proctoring AI</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Dual-Cam Siap
            </span>
          </div>
        </div>
      </div>

      {/* Active Exams Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-display font-bold text-slate-900">Daftar Paket Ujian Terkini</h2>
            <p className="text-xs text-slate-500">Status ujian, mode proctoring, dan akses pemantauan pengawas</p>
          </div>
          <Link
            href="/exams"
            className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1.5 font-mono transition-colors shrink-0"
          >
            <span>Semua Ujian</span>
            <span>→</span>
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
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">{exam.title}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{exam.class_name || '-'}</td>
                  <td className="px-6 py-4 tabular-nums font-mono text-slate-700">{exam.duration_minutes} Menit</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
                      <Eye className="w-3 h-3" />
                      {exam.proctoring_level === 'dual_camera'
                        ? 'Dual-Camera'
                        : exam.proctoring_level === 'single_camera'
                        ? 'Kamera Utama'
                        : 'Standar'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border font-mono ${
                        exam.status === 'published' || exam.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : exam.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/exams/${exam.id}/monitor`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Live Monitor</span>
                    </Link>
                    <Link
                      href={`/grading/${exam.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Koreksi Esai</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {recentExams.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada paket ujian yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
