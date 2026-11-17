'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  FileText,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { formatExamDateTime } from '@/utils/examMode'
import { Stagger, StaggerItem } from '@/components/system/PageTransition'
import { Button, EmptyState } from '@/components/ui'
import {
  DashboardShell,
  DashboardCard,
} from '@/components/dashboard'

// One row of GET /student/sessions (contract from the backend worker —
// field names consumed exactly as specified; adapt here at review time
// if the live endpoint names a field differently).
interface StudentSession {
  session_id: number
  exam_id: number
  exam_title: string
  class_name: string
  status: 'submitted' | 'graded' | 'grading_in_progress' | 'aborted' | 'in_progress' | string
  total_score: number | null
  integrity_score: number | null
  submitted_at: string | null
  begun_at: string | null
}

function statusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'graded':
      return {
        label: 'Dinilai',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    case 'aborted':
      return {
        label: 'Didiskualifikasi',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      }
    case 'in_progress':
      return {
        label: 'Sedang Berlangsung',
        className: 'bg-sky-50 text-sky-700 border-sky-200',
      }
    case 'grading_in_progress':
    case 'submitted':
    default:
      return {
        label: 'Menunggu Penilaian',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      }
  }
}

// The score is only meaningful once grading has finished. While the
// session is still being graded (or still in progress) the backend has
// no final score yet, so render "—" instead of inventing a 0.
function displayScore(session: StudentSession): string {
  if (
    session.status === 'grading_in_progress' ||
    session.status === 'in_progress' ||
    session.total_score == null
  ) {
    return '—'
  }
  return String(session.total_score)
}

export default function StudentResultsPage() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.get('/student/sessions')
      setSessions(res.data.data || [])
    } catch (err: any) {
      console.error('Failed to load student sessions:', err)
      setErrorMessage(
        err.response?.data?.message ||
          'Gagal memuat riwayat hasil ujian. Pastikan koneksi internet aktif dan silakan coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <DashboardShell
      greetingVariant="band"
      greetingName={user?.full_name || 'Siswa'}
      greetingSubtitle="Lihat seluruh riwayat ujian Anda beserta nilai, status penilaian, dan pembahasan soal."
    >
    <Stagger className="space-y-6">

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-[#ddd9ef] p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-[#6a5fc1] animate-spin mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-slate-900 text-sm">Memuat riwayat hasil ujian...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Menghubungkan ke server CBT sekolah untuk mengambil sesi ujian Anda.
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
            <h3 className="font-bold text-slate-900 text-base">Gagal Mengambil Riwayat Hasil Ujian</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="max-sm:h-11"
            onClick={loadSessions}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Session List */}
      {!isLoading && !errorMessage && sessions.length > 0 && (
        <StaggerItem>
          <DashboardCard
            title="Riwayat Hasil Ujian"
            subtitle="Sesi ujian Anda, diurutkan dari yang terbaru"
            icon={<FileText className="w-4 h-4 text-[#6a5fc1]" aria-hidden="true" />}
            noPadding
            action={
              <span className="text-xs font-mono font-bold text-[#6a5fc1] bg-[#f1effa] px-2.5 py-1 rounded-lg border border-[#ddd9ef] tabular-nums">
                {sessions.length} Sesi
              </span>
            }
          >
            <div className="divide-y divide-[#e9e5f6]">
              {sessions.map((session, idx) => {
                const staggerClass = idx === 0 ? 'reveal-stagger-1' : idx === 1 ? 'reveal-stagger-2' : 'reveal-stagger-3'
                const badge = statusBadge(session.status)
                const submittedLabel = session.submitted_at
                  ? `Dikumpulkan ${formatExamDateTime(session.submitted_at)}`
                  : session.begun_at
                    ? `Dimulai ${formatExamDateTime(session.begun_at)}`
                    : 'Belum ada waktu pengumpulan'
                return (
                  <div
                    key={session.session_id}
                    className={`p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#f1effa] transition-colors ${staggerClass}`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1effa] text-[#6a5fc1] font-mono">
                          {session.class_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {submittedLabel}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-900 truncate">
                        {session.exam_title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span className="font-mono tabular-nums">
                          Nilai: <strong className="text-slate-900">{displayScore(session)}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          Integritas: <strong className="text-slate-900">{session.integrity_score != null ? `${session.integrity_score}%` : '—'}</strong>
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <Link
                        href={`/student/exam/${session.exam_id}/result`}
                        className="px-4 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none max-sm:min-h-[44px]"
                      >
                        <span>Lihat Hasil</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </DashboardCard>
        </StaggerItem>
      )}

      {/* Empty State: No Sessions Yet */}
      {!isLoading && !errorMessage && sessions.length === 0 && (
        <StaggerItem>
          <EmptyState
            card
            icon={<FileText className="w-6 h-6 text-[#6a5fc1]" aria-hidden="true" />}
            title="Belum Ada Riwayat Ujian"
            description="Anda belum memiliki sesi ujian yang selesai atau sedang berjalan. Setelah mengikuti ujian, hasil dan pembahasan soal akan muncul di halaman ini."
            action={
              <Link
                href="/student/dashboard"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none max-sm:min-h-[44px]"
              >
                <span>Lihat Jadwal Ujian</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            }
          />
        </StaggerItem>
      )}
    </Stagger>
    </DashboardShell>
  )
}
