'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Printer, Loader2, Sparkles, AlertCircle, RotateCcw, X } from 'lucide-react'
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

  async function loadSessions(targetExamId: number) {
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
  }

  async function openSessionReview(sessionId: number) {
    setSelectedSessionId(sessionId)
    setIsLoading(true)
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
  }

  function acceptAiScore(ans: AnswerItem) {
    setOverrideForm((prev) => ({
      ...prev,
      [ans.id]: ans.auto_score,
    }))
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
  }, [examId, initialSessionId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5">
          <Link
            href="/exams"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Koreksi Esai & Human-in-the-Loop Override
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Validasi penilaian otomatis AI, sesuaikan nilai dengan rubrik pedagogis guru
            </p>
          </div>
        </div>

        {allExams.length > 1 && !selectedSessionId && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-mono">Pilih Ujian:</span>
            <select
              value={examId}
              onChange={(e) => {
                const val = Number(e.target.value)
                setExamId(val)
                loadSessions(val)
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900 outline-none"
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

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
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

      {/* Mode 1: Exam Session Selection or List */}
      {!selectedSessionId ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden text-slate-900">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Daftar Hasil Submission Siswa
              </h3>
              <p className="text-xs text-slate-500">Pilih lembar pengerjaan siswa untuk meninjau rubrik esai AI</p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Rekap Nilai</span>
              </button>
            </div>
          </div>

          {/* Printable Official Header (Shown Only on Print) */}
          <div className="hidden print:block p-6 border-b-2 border-slate-900 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  REKAPITULASI NILAI AKHIR SISWA
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Sistem Evaluasi Akademik & Koreksi Esai — EXAMIND Platform
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
                <span className="font-bold text-slate-500">Status Penilaian:</span> Human-in-the-Loop Verified
              </p>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
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
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 font-mono">
                Memuat daftar submission & hasil koreksi esai AI...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200 font-mono">
                  <tr>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">NISN / Identitas</th>
                    <th className="px-6 py-4">Status Sesi</th>
                    <th className="px-6 py-4">Nilai Total</th>
                    <th className="px-6 py-4">Integritas</th>
                    <th className="px-6 py-4">Confidence AI</th>
                    <th className="px-6 py-4 text-right print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sessionsList.map((s) => (
                    <tr key={s.session_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-display font-bold text-slate-900 max-w-[200px] truncate" title={s.student_name}>
                        {s.student_name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 max-w-[140px] truncate" title={s.student_identifier}>
                        {s.student_identifier}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono shadow-xs ${
                            s.status === 'graded'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {s.status}
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
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize font-mono shadow-xs ${
                            s.lowest_confidence_level === 'high'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s.lowest_confidence_level === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.lowest_confidence_level || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <button
                          onClick={() => openSessionReview(s.session_id)}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover cursor-pointer transition-all font-display tracking-wide"
                        >
                          Review & Override
                        </button>
                      </td>
                    </tr>
                  ))}

                  {sessionsList.length === 0 && !errorMessage && (
                    <tr>
                      <td colSpan={7} className="p-16 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <p className="font-bold text-slate-800 text-sm">Belum Ada Submission Siswa</p>
                          <p className="text-xs text-slate-500">
                            Lembar jawaban siswa yang telah selesai mengikuti ujian akan otomatis tampil di sini untuk ditinjau.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
        /* Mode 2: Side-by-Side Review Workspace */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 px-6 rounded-2xl border border-slate-200/80 shadow-card text-slate-900">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSelectedSessionId(null)}
                title="Kembali ke daftar sesi"
                aria-label="Kembali ke daftar sesi"
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">{sessionDetail?.student_name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  NISN: {sessionDetail?.student_identifier} • Nilai Sementara:{' '}
                  <strong className="text-slate-900 font-bold tabular-nums">
                    {sessionDetail?.total_score} / {sessionDetail?.max_score}
                  </strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSessionId(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Selesai Meninjau
            </button>
          </div>

          {/* Answers List */}
          <div className="space-y-6">
            {(sessionDetail?.answers || []).map((ans, idx) => (
              <div
                key={ans.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-5 text-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-slate-900 font-black text-xs text-white font-mono shadow-xs">
                      Nomor {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase font-mono shadow-xs ${
                        ans.question_type === 'multiple_choice'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {ans.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <span className="text-slate-500 font-mono">Bobot: {ans.allocated_points} Poin</span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold font-mono border border-emerald-200 shadow-xs tabular-nums">
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
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 font-medium">Jawaban Siswa:</span>
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
                ) : (
                  /* Essay Side-by-Side Review */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    {/* Left: Student Response */}
                    <div className="space-y-3 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
                        Lembar Jawaban Siswa
                      </span>
                      <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                        {ans.student_response || '(Siswa tidak menjawab)'}
                      </p>
                    </div>

                    {/* Right: AI Evaluation & Teacher Override Form */}
                    <div className="space-y-4 p-6 rounded-2xl bg-indigo-50/40 border border-indigo-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 font-mono">
                          Analisis AI & Rubrik 4D
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold capitalize font-mono shadow-xs ${
                            ans.ai_confidence_level === 'high'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          Confidence: {ans.ai_confidence_level || 'N/A'}
                        </span>
                      </div>

                      {/* Rationale & Respan Probability Matrix */}
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
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-1">
                                <div>
                                  <span className="font-bold text-slate-900 font-display flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    Respan Span-01 Lite Decision Matrix
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Zero-Output-Tokens • Calibrated Probabilities
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] border border-indigo-200">
                                  0 Output Tokens
                                </span>
                              </div>

                              <div className="space-y-2 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                                  Evaluasi Kriteria Acuan Atomik:
                                </span>
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
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                                            isPass
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                                          }`}
                                        >
                                          {isPass ? `✅ Terpenuhi (${pct}%)` : `❌ Kurang (${pct}%)`}
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

                              {/* Misconception indicator */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                                <span className="text-slate-500">Pemeriksaan Miskonsepsi:</span>
                                {parsed.misconception_detected ? (
                                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    ⚠️ Terdeteksi Miskonsepsi Fatal ({Math.round((parsed.misconception_score || 0) * 100)}%)
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    🛡️ Bebas Miskonsepsi ({Math.round((1 - (parsed.misconception_score || 0)) * 100)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div className="text-xs text-slate-700 space-y-1.5 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed shadow-xs">
                            <p className="font-bold text-indigo-950 font-display">Pertimbangan AI:</p>
                            <p>
                              {ans.ai_grading_rationale ||
                                'Penilaian otomatis berhasil dihitung berdasarkan rubrik konsep dan kata kunci.'}
                            </p>
                          </div>
                        )
                      })()}

                      {/* Teacher Override Input */}
                      <div className="space-y-3.5 pt-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                              Skor Guru (Maks: {ans.allocated_points})
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
                              onClick={() => acceptAiScore(ans)}
                              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer font-mono shadow-xs"
                            >
                              Gunakan Nilai AI ({ans.auto_score})
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                            Catatan Koreksi Guru (Opsional)
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
                            placeholder="Feedback pedagogis untuk siswa..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => saveOverride(ans.id)}
                            disabled={savingOverrideMap[ans.id]}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-1.5 cursor-pointer font-display tracking-wide"
                          >
                            {savingOverrideMap[ans.id] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-[#c2ef4e]" />
                            )}
                            <span>{savingOverrideMap[ans.id] ? 'Menyimpan...' : 'Simpan Nilai Guru'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
