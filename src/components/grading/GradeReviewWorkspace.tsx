'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Printer,
  Loader2,
  Sparkles,
  AlertCircle,
  RotateCcw,
  X,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Keyboard,
  Info,
  ChevronDown,
  ChevronUp,
  Save,
  HelpCircle,
  Radio,
  FileSpreadsheet,
} from 'lucide-react'
import api from '@/lib/api'

interface SessionListItem {
  session_id: number
  student_name: string
  student_identifier: string
  status: string
  total_score: number
  integrity_score: number
  lowest_confidence_level?: string
}

interface AnswerItem {
  id: number
  question_type: string
  allocated_points: number
  final_score: number
  auto_score: number
  teacher_override_score?: number
  teacher_notes?: string
  prompt: string
  is_correct?: boolean
  student_response?: string
  correct_answer?: string
  ai_confidence_level?: string
  ai_grading_rationale?: string
}

interface SessionDetail {
  student_name: string
  student_identifier: string
  total_score: number
  max_score: number
  answers: AnswerItem[]
}

interface GradeReviewWorkspaceProps {
  initialExamId?: number
  initialSessionId?: number
}

export default function GradeReviewWorkspace({
  initialExamId,
  initialSessionId,
}: GradeReviewWorkspaceProps) {
  const [examId, setExamId] = useState<number>(initialExamId || 1)
  const [allExams, setAllExams] = useState<any[]>([])
  const [sessionsList, setSessionsList] = useState<SessionListItem[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    initialSessionId || null
  )
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null)
  const [overrideForm, setOverrideForm] = useState<Record<number, number>>({})
  const [notesForm, setNotesForm] = useState<Record<number, string>>({})
  const [savingOverrideMap, setSavingOverrideMap] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Mode 1: Search & Filter
  const [searchStudent, setSearchStudent] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'graded' | 'pending'>('all')

  // Mode 2: Fast Keyboard Navigation & Active Question Focus
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  function showNotification(type: 'success' | 'error', text: string) {
    setNotification({ type, text })
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr))
    }, 4000)
  }

  function handlePrint() {
    window.print()
  }

  async function loadExams() {
    try {
      const res = await api.get('/exams')
      const exams = res.data.data || []
      setAllExams(exams)
      if (!initialExamId && exams.length > 0) {
        setExamId(exams[0].id)
      }
    } catch (err) {
      console.warn('Failed to load exams list:', err)
    }
  }

  const loadSessions = useCallback(async (targetExamId: number) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.get(`/grading/exam/${targetExamId}/sessions`)
      setSessionsList(res.data.data || [])
    } catch (err: any) {
      console.error('Failed to load grading sessions:', err)
      setErrorMessage(
        err.response?.data?.message ||
          'Gagal memuat daftar hasil submission siswa. Periksa koneksi ke server ujian CBT.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openSessionReview = useCallback(async (sessionId: number) => {
    setSelectedSessionId(sessionId)
    setIsLoading(true)
    setActiveQuestionIdx(0)
    try {
      const res = await api.get(`/grading/session/${sessionId}`)
      const data: SessionDetail = res.data.data
      setSessionDetail(data)
      const newOverride: Record<number, number> = {}
      const newNotes: Record<number, string> = {}
      for (const ans of data.answers || []) {
        newOverride[ans.id] =
          ans.teacher_override_score !== null && ans.teacher_override_score !== undefined
            ? ans.teacher_override_score
            : ans.final_score
        newNotes[ans.id] = ans.teacher_notes || ''
      }
      setOverrideForm(newOverride)
      setNotesForm(newNotes)
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Gagal memuat detail sesi jawaban siswa.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  function acceptAiScore(ans: AnswerItem) {
    setOverrideForm((prev) => ({
      ...prev,
      [ans.id]: ans.auto_score,
    }))
    showNotification('success', `Skor rekomendasi AI (${ans.auto_score}) diterapkan untuk soal ini. Klik Simpan untuk konfirmasi.`)
  }

  async function saveOverride(ansId: number) {
    if (savingOverrideMap[ansId]) return
    setSavingOverrideMap((prev) => ({ ...prev, [ansId]: true }))
    try {
      const newScore = overrideForm[ansId]
      const notes = notesForm[ansId]
      await api.put(`/grading/answer/${ansId}/override`, {
        teacher_override_score: newScore,
        teacher_notes: notes,
      })
      if (sessionDetail) {
        const updatedAnswers = sessionDetail.answers.map((a) =>
          a.id === ansId ? { ...a, final_score: newScore, teacher_override_score: newScore } : a
        )
        setSessionDetail({ ...sessionDetail, answers: updatedAnswers })
      }
      showNotification('success', 'Nilai guru berhasil disimpan ke lembar penilaian siswa!')
      await loadSessions(examId)
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Gagal menyimpan nilai guru. Coba lagi.')
    } finally {
      setSavingOverrideMap((prev) => ({ ...prev, [ansId]: false }))
    }
  }

  useEffect(() => {
    loadExams()
    if (initialSessionId) {
      openSessionReview(initialSessionId)
    } else {
      loadSessions(examId)
    }
  }, [examId, initialSessionId, loadSessions, openSessionReview])

  // Filtered Sessions List
  const filteredSessions = useMemo(() => {
    return sessionsList.filter((s) => {
      const matchesSearch =
        s.student_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.student_identifier.toLowerCase().includes(searchStudent.toLowerCase())

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'graded'
          ? s.status === 'graded'
          : s.status !== 'graded'

      return matchesSearch && matchesStatus
    })
  }, [sessionsList, searchStudent, statusFilter])

  // Mode 2: Keyboard shortcuts listener
  useEffect(() => {
    if (!selectedSessionId || !sessionDetail) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when teacher is actively typing inside an input or textarea
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (isInput) {
        // Allow Cmd+Enter or Ctrl+Enter inside input to trigger save
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault()
          const currentAns = sessionDetail.answers[activeQuestionIdx]
          if (currentAns) {
            saveOverride(currentAns.id)
          }
        }
        return
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveQuestionIdx((prev) => {
          const next = Math.min(sessionDetail.answers.length - 1, prev + 1)
          questionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return next
        })
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveQuestionIdx((prev) => {
          const next = Math.max(0, prev - 1)
          questionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return next
        })
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault()
        const currentAns = sessionDetail.answers[activeQuestionIdx]
        if (currentAns && currentAns.question_type !== 'multiple_choice') {
          acceptAiScore(currentAns)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const currentAns = sessionDetail.answers[activeQuestionIdx]
        if (currentAns) {
          saveOverride(currentAns.id)
        }
      } else if (e.key === '?') {
        setShowKeyboardHelp((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSessionId, sessionDetail, activeQuestionIdx, overrideForm, notesForm])

  // Count essays verified
  const essayStats = useMemo(() => {
    if (!sessionDetail) return { total: 0, verified: 0 }
    const essays = sessionDetail.answers.filter((a) => a.question_type !== 'multiple_choice')
    const verified = essays.filter(
      (a) => a.teacher_override_score !== null && a.teacher_override_score !== undefined
    )
    return { total: essays.length, verified: verified.length }
  }, [sessionDetail])

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/exams"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none shrink-0"
            title="Kembali ke Daftar Ujian"
            aria-label="Kembali ke Daftar Ujian"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-[#c2ef4e] px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
                Koreksi Human-in-the-Loop
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Evaluasi Esai AI & Otoritas Guru
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              Koreksi Esai & Validasi Nilai AI
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Tinjau draf penilaian kecerdasan buatan, terapkan saran skor, atau sesuaikan nilai sesuai rubrik pedagogis Anda.
            </p>
          </div>
        </div>

        {allExams.length > 1 && !selectedSessionId && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 font-mono">Pilih Ujian:</span>
            <select
              value={examId}
              onChange={(e) => {
                const val = Number(e.target.value)
                setExamId(val)
                loadSessions(val)
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              {allExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs transition-all animate-in fade-in duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            )}
            <span className="font-semibold">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* MODE 1: Submissions List View */}
      {!selectedSessionId ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden text-slate-900 space-y-4">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Daftar Hasil Lembar Submission Siswa
              </h2>
              <p className="text-xs text-slate-500">
                Pilih siswa untuk memeriksa rubrik esai AI dan memvalidasi skor akhir
              </p>
            </div>

            <div className="flex items-center gap-2.5 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              >
                <Printer className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Cetak Rekap Nilai</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="px-5 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Cari nama siswa atau NISN..."
                className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
              />
              {searchStudent && (
                <button
                  onClick={() => setSearchStudent('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Hapus pencarian siswa"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="all">Semua Status Siswa</option>
                <option value="graded">Selesai Dinilai</option>
                <option value="pending">Menunggu Verifikasi</option>
              </select>
            </div>
          </div>

          {/* Printable Official Header */}
          <div className="hidden print:block p-6 border-b-2 border-slate-900 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  REKAPITULASI RESMI PENILAIAN SISWA
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Sistem Evaluasi Asesmen CBT & Koreksi Esai — EXAMIND Platform
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-bold">
                  Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
                <p className="text-[10px] font-mono text-slate-500">EXAM-ID: {examId}</p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-xs flex justify-between">
              <p>
                <span className="font-bold text-slate-500">Total Submission:</span> {sessionsList.length} Siswa
              </p>
              <p>
                <span className="font-bold text-slate-500">Status Otoritas:</span> Human-in-the-Loop Verified
              </p>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="m-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                <span className="font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => loadSessions(examId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden="true" />
              <p className="text-xs font-semibold text-slate-500 font-mono">
                Memuat daftar submission & hasil koreksi esai AI...
              </p>
            </div>
          ) : (
            <div>
              {/* Mobile Card List View (<md) */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredSessions.map((s) => (
                  <div key={s.session_id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-slate-900 text-sm truncate" title={s.student_name}>
                          {s.student_name}
                        </h4>
                        <p className="font-mono text-xs text-slate-500 truncate" title={s.student_identifier}>
                          {s.student_identifier}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono shadow-2xs ${
                          s.status === 'graded'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {s.status === 'graded' ? 'Terverifikasi' : 'Draf AI'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Nilai</span>
                        <span className="font-extrabold text-slate-900 font-mono text-xs tabular-nums">
                          {s.total_score}
                          <span className="text-[10px] text-slate-400 font-normal">/100</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Integritas</span>
                        <span
                          className={`font-bold font-mono text-xs tabular-nums ${
                            s.integrity_score >= 90 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {s.integrity_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Saran AI</span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold capitalize font-mono ${
                            s.lowest_confidence_level === 'high'
                              ? 'bg-emerald-100/70 text-emerald-800'
                              : s.lowest_confidence_level === 'medium'
                              ? 'bg-amber-100/70 text-amber-800'
                              : 'bg-rose-100/70 text-rose-800'
                          }`}
                        >
                          {s.lowest_confidence_level === 'high'
                            ? 'High'
                            : s.lowest_confidence_level === 'medium'
                            ? 'Medium'
                            : s.lowest_confidence_level === 'low'
                            ? 'Low'
                            : 'Tinjau'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openSessionReview(s.session_id)}
                      className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover cursor-pointer transition-all font-display tracking-wide flex items-center justify-center gap-2"
                    >
                      <span>Review & Beri Nilai</span>
                    </button>
                  </div>
                ))}

                {/* Empty Filter State (<md) */}
                {filteredSessions.length === 0 && sessionsList.length > 0 && (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <Search className="w-6 h-6 text-slate-400 mx-auto" aria-hidden="true" />
                    <p className="font-bold text-slate-800 text-sm">Tidak Ditemukan Siswa yang Cocok</p>
                    <p className="text-xs text-slate-500">
                      Coba sesuaikan kata kunci nama siswa atau status filter pencarian Anda.
                    </p>
                    <button
                      onClick={() => {
                        setSearchStudent('')
                        setStatusFilter('all')
                      }}
                      className="min-h-[44px] mt-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                )}

                {/* Total Empty State (<md) */}
                {sessionsList.length === 0 && !errorMessage && (
                  <div className="p-8 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-sm font-display">
                        Belum Ada Lembar Jawaban Siswa
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Siswa yang telah menyelesaikan pengerjaan ujian CBT akan otomatis muncul di sini.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/exams/${examId}/monitor`}
                        className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                        <span>Buka Live Monitoring Sesi</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Table View (>=md) */}
              <div className="hidden md:block overflow-x-auto touch-pan-x">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200 font-mono">
                    <tr>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">NISN / Identitas</th>
                      <th className="px-6 py-4">Status Sesi</th>
                      <th className="px-6 py-4">Nilai Total</th>
                      <th className="px-6 py-4">Integritas</th>
                      <th className="px-6 py-4">Saran AI</th>
                      <th className="px-6 py-4 text-right print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSessions.map((s) => (
                      <tr key={s.session_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-display font-bold text-slate-900 max-w-[200px] truncate" title={s.student_name}>
                          {s.student_name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600 max-w-[140px] truncate" title={s.student_identifier}>
                          {s.student_identifier}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono shadow-2xs ${
                              s.status === 'graded'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {s.status === 'graded' ? 'Terverifikasi' : 'Draf AI'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-900 font-mono tabular-nums text-sm">
                          {s.total_score} / 100
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold font-mono tabular-nums ${
                              s.integrity_score >= 90 ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {s.integrity_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize font-mono shadow-2xs ${
                              s.lowest_confidence_level === 'high'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : s.lowest_confidence_level === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {s.lowest_confidence_level === 'high'
                              ? 'High'
                              : s.lowest_confidence_level === 'medium'
                              ? 'Medium'
                              : s.lowest_confidence_level === 'low'
                              ? 'Low'
                              : 'Tinjau'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right print:hidden">
                          <button
                            onClick={() => openSessionReview(s.session_id)}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover cursor-pointer transition-all font-display tracking-wide focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                          >
                            Review & Beri Nilai
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Empty Filter State */}
                    {filteredSessions.length === 0 && sessionsList.length > 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="w-6 h-6 text-slate-400" aria-hidden="true" />
                            <p className="font-bold text-slate-800 text-sm">Tidak Ditemukan Siswa yang Cocok</p>
                            <p className="text-xs text-slate-500">
                              Coba sesuaikan kata kunci nama siswa atau status filter pencarian Anda.
                            </p>
                            <button
                              onClick={() => {
                                setSearchStudent('')
                                setStatusFilter('all')
                              }}
                              className="mt-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Reset Pencarian
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Total Empty State with Guidance */}
                    {sessionsList.length === 0 && !errorMessage && (
                      <tr>
                        <td colSpan={7} className="p-16 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                              <FileSpreadsheet className="w-7 h-7" aria-hidden="true" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 text-base font-display">
                                Belum Ada Lembar Jawaban Siswa
                              </p>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Siswa yang telah menyelesaikan pengerjaan ujian CBT akan otomatis muncul di tabel ini lengkap dengan pra-penilaian AI.
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5 pt-2">
                              <Link
                                href={`/exams/${examId}/monitor`}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                <Radio className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                                <span>Buka Live Monitoring Sesi</span>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Printable Signature Block */}
          <div className="hidden print:block p-6 mt-6 border-t border-slate-300">
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-medium text-slate-700">
                  Mengetahui,
                  <br />
                  Kepala Sekolah / Kurikulum
                </p>
                <div className="h-16" />
                <p className="font-bold underline text-slate-900">Kepala Sekolah</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. ........................................</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Guru Pengampu / Penilai,</p>
                <div className="h-16" />
                <p className="font-bold underline text-slate-900">Guru Pengampu Mata Pelajaran</p>
                <p className="text-[10px] text-slate-500 font-mono">EXAMIND Certified Gradebook</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Side-by-Side Question Review Workspace with Fast Navigation */
        <div className="space-y-6">
          {/* Active Student Top Bar with Fast Keyboard Helper */}
          <div className="bg-white p-5 px-6 rounded-2xl border border-slate-200/80 shadow-card text-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => setSelectedSessionId(null)}
                  title="Kembali ke daftar submission siswa"
                  aria-label="Kembali ke daftar submission siswa"
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-xs shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Sesi Jawaban Siswa
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      NISN: {sessionDetail?.student_identifier}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-slate-900 text-lg truncate">
                    {sessionDetail?.student_name}
                  </h2>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Keyboard Shortcut Info Pill */}
                <button
                  type="button"
                  onClick={() => setShowKeyboardHelp((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Tekan '?' untuk melihat pintasan keyboard"
                >
                  <Keyboard className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                  <span>Shortcut [J/K/A]</span>
                </button>

                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  Skor: {sessionDetail?.total_score} / {sessionDetail?.max_score}
                </div>

                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer font-display"
                >
                  Selesai Meninjau
                </button>
              </div>
            </div>

            {/* Keyboard Shortcut Drawer */}
            {showKeyboardHelp && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-display flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                    Pintasan Keyboard Review Berkecepatan Tinggi:
                  </span>
                  <button
                    onClick={() => setShowKeyboardHelp(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-bold border border-slate-300 mr-1.5">J</kbd>
                    <span>Soal Berikutnya</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-bold border border-slate-300 mr-1.5">K</kbd>
                    <span>Soal Sebelumnya</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-bold border border-slate-300 mr-1.5">A</kbd>
                    <span>Terima Nilai AI</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-bold border border-slate-300 mr-1.5">Enter</kbd>
                    <span>Simpan Nilai</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Question Navigation Strip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 overflow-x-auto touch-pan-x">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-slate-500 font-bold mr-1">Lompat Soal:</span>
                {(sessionDetail?.answers || []).map((ans, qIdx) => {
                  const isActive = activeQuestionIdx === qIdx
                  const isEssay = ans.question_type !== 'multiple_choice'
                  const isVerified = isEssay && ans.teacher_override_score !== null && ans.teacher_override_score !== undefined

                  return (
                    <button
                      key={ans.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionIdx(qIdx)
                        questionRefs.current[qIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-[#c2ef4e]/40'
                          : isVerified
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isEssay
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={`Nomor ${qIdx + 1} (${isEssay ? 'Esai' : 'PG'})`}
                    >
                      <span>No.{qIdx + 1}</span>
                    </button>
                  )
                })}
              </div>

              <div className="text-[11px] font-mono text-slate-500 shrink-0">
                Esai Terverifikasi: <strong className="text-slate-800 tabular-nums">{essayStats.verified} / {essayStats.total}</strong>
              </div>
            </div>
          </div>

          {/* Answers List */}
          <div className="space-y-6">
            {(sessionDetail?.answers || []).map((ans, idx) => {
              const isActive = activeQuestionIdx === idx

              return (
                <div
                  key={ans.id}
                  ref={(el) => {
                    questionRefs.current[idx] = el
                  }}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`bg-white rounded-2xl border p-6 sm:p-7 shadow-card space-y-5 text-slate-900 transition-all ${
                    isActive
                      ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-lg'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Question Header Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 font-black text-xs text-white font-mono shadow-xs">
                        Nomor {idx + 1}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase font-mono shadow-2xs ${
                          ans.question_type === 'multiple_choice'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {ans.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#c2ef4e] text-slate-950 shadow-2xs">
                          Fokus Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      <span className="text-slate-500 font-mono">Bobot: {ans.allocated_points} Poin</span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold font-mono border border-emerald-200 shadow-2xs tabular-nums">
                        Skor Akhir: {ans.final_score} Poin
                      </span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="font-display text-base font-semibold text-slate-900 leading-relaxed">
                    {ans.prompt}
                  </div>

                  {/* Multiple Choice Review */}
                  {ans.question_type === 'multiple_choice' ? (
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 font-medium">Jawaban Siswa:</span>
                        <div className="flex items-center gap-2">
                          {ans.is_correct ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                          )}
                          <p
                            className={`text-sm font-bold font-mono ${
                              ans.is_correct ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            Pilihan {ans.student_response || '(Kosong)'} —{' '}
                            {ans.is_correct
                              ? `BENAR (Kunci: ${ans.correct_answer})`
                              : `SALAH (Kunci: ${ans.correct_answer})`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Otomatis Dikoreksi Sistem
                      </span>
                    </div>
                  ) : (
                    /* Essay Side-by-Side Review */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                      {/* Left Column: Student Response */}
                      <div className="space-y-3 p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
                          Lembar Jawaban Siswa
                        </span>
                        <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                          {ans.student_response || '(Siswa tidak menjawab pertanyaan ini)'}
                        </p>
                      </div>

                      {/* Right Column: AI Suggestion & Teacher Decision */}
                      <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200">
                        {/* AI Suggestion Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 font-mono">
                              Saran Evaluasi AI (Rekomendasi)
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold capitalize font-mono shadow-2xs ${
                              ans.ai_confidence_level === 'high'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            Tingkat Keyakinan: {ans.ai_confidence_level || 'N/A'}
                          </span>
                        </div>

                        {/* Rationale & Decision Criteria Matrix */}
                        {(() => {
                          let parsed: any = null
                          try {
                            if (ans.ai_grading_rationale && ans.ai_grading_rationale.startsWith('{')) {
                              parsed = JSON.parse(ans.ai_grading_rationale)
                            }
                          } catch {}

                          if (parsed && parsed.evaluations && parsed.evaluations.length > 0) {
                            return (
                              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span className="font-bold text-slate-900 font-display">
                                    Matriks Kriteria Evaluasi Atomik:
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Rekomendasi Skor: <strong className="text-indigo-700 font-bold">{ans.auto_score} Poin</strong>
                                  </span>
                                </div>

                                <div className="space-y-2 pt-1">
                                  {parsed.evaluations.map((ev: any, evIdx: number) => {
                                    const isPass = ev.status === 'passed'
                                    const pct = Math.round((ev.noul || 0) * 100)
                                    return (
                                      <div
                                        key={evIdx}
                                        className="p-2.5 rounded-lg border bg-slate-50/70 border-slate-200 space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between text-[11px] gap-2">
                                          <span className="font-medium text-slate-800 flex-1">
                                            {evIdx + 1}. {ev.statement}
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 flex items-center gap-1 ${
                                              isPass
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                                            }`}
                                          >
                                            {isPass ? (
                                              <>
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                                                <span>Terpenuhi ({pct}%)</span>
                                              </>
                                            ) : (
                                              <>
                                                <XCircle className="w-3 h-3 text-rose-500" aria-hidden="true" />
                                                <span>Kurang ({pct}%)</span>
                                              </>
                                            )}
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${
                                              isPass ? 'bg-emerald-500' : 'bg-rose-400'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Misconception Indicator with Lucide only */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-slate-500">Pemeriksaan Miskonsepsi:</span>
                                  {parsed.misconception_detected ? (
                                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                                      <span>Terdeteksi Miskonsepsi ({Math.round((parsed.misconception_score || 0) * 100)}%)</span>
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                                      <span>Bebas Miskonsepsi ({Math.round((1 - (parsed.misconception_score || 0)) * 100)}%)</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div className="text-xs text-slate-700 space-y-1.5 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed shadow-xs">
                              <p className="font-bold text-indigo-950 font-display flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                                <span>Pertimbangan AI:</span>
                              </p>
                              <p>
                                {ans.ai_grading_rationale ||
                                  'Penilaian otomatis dihitung berdasarkan rubrik konsep dan kata kunci silabus.'}
                              </p>
                              <p className="text-[11px] font-mono font-bold text-indigo-700 pt-1">
                                Rekomendasi Skor AI: {ans.auto_score} Poin
                              </p>
                            </div>
                          )
                        })()}

                        {/* Teacher Decision & Override Form */}
                        <div className="space-y-3.5 pt-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-800 mb-1 font-mono">
                                Skor Final Guru (Maks: {ans.allocated_points})
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                max={ans.allocated_points}
                                min="0"
                                value={overrideForm[ans.id] ?? ''}
                                onChange={(e) =>
                                  setOverrideForm({
                                    ...overrideForm,
                                    [ans.id]: Number(e.target.value),
                                  })
                                }
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-mono shadow-xs"
                              />
                            </div>

                            <div className="pt-5">
                              <button
                                type="button"
                                onClick={() => acceptAiScore(ans)}
                                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer font-mono shadow-xs flex items-center gap-1.5"
                                title="Terapkan nilai yang disarankan AI (Tekan 'A')"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                                <span>Gunakan Saran AI ({ans.auto_score})</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1 font-mono">
                              Catatan Koreksi / Feedback Guru (Opsional)
                            </label>
                            <input
                              type="text"
                              value={notesForm[ans.id] || ''}
                              onChange={(e) =>
                                setNotesForm({
                                  ...notesForm,
                                  [ans.id]: e.target.value,
                                })
                              }
                              placeholder="Ketik feedback pedagogis untuk siswa..."
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Tekan <kbd className="px-1 py-0.5 bg-slate-200 rounded font-bold">Enter</kbd> untuk simpan
                            </span>
                            <button
                              onClick={() => saveOverride(ans.id)}
                              disabled={savingOverrideMap[ans.id]}
                              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-1.5 cursor-pointer font-display tracking-wide"
                            >
                              {savingOverrideMap[ans.id] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                              )}
                              <span>{savingOverrideMap[ans.id] ? 'Menyimpan...' : 'Simpan Nilai Guru'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
