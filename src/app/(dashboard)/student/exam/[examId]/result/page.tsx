'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Printer,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Check,
  X,
} from 'lucide-react'
import api from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import QuestionExplanationChat from '@/components/student/QuestionExplanationChat'

interface ResultAnswer {
  id: number
  question_id: number
  question_type: string
  prompt: string
  // Null while the session is in_progress / grading_in_progress: the
  // backend gates per-question correctness until grading finishes, so a
  // pending answer must render as "menunggu penilaian", never as wrong
  // or as a 0 score. (Finding 3.)
  is_correct?: boolean | null
  final_score: number | null
  allocated_points: number
  student_response?: string
  correct_answer?: string
  ai_explanation?: string
  ai_grading_rationale?: string
  teacher_notes?: string
}

interface ExamResultData {
  exam_id?: number
  session_id: number
  exam_title: string
  subject?: string
  student_name: string
  student_identifier: string
  submit_time: string
  status: string
  total_score: number
  max_score: number
  integrity_score: number
  answers: ResultAnswer[]
}

// AI explanations arrive as markdown from the backend; render them with the
// same react-markdown + remark-gfm stack already used by AIAssistantWidget,
// sized to the explanation boxes on this page. No new dependency.
const explanationMarkdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-slate-800">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-4 space-y-1 my-2 text-slate-800">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 space-y-1 my-2 text-slate-800">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed text-slate-800">{children}</li>,
  h2: ({ children }) => (
    <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 text-[#150f23] px-1 py-0.5 rounded text-[11px] font-mono border border-slate-200">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#6a5fc1] pl-3 py-1 my-2 text-slate-600 italic bg-slate-50/80 rounded-r">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a href={href} className="text-[#6a5fc1] underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
}

export default function ExamResultPage() {
  const params = useParams()
  const examId = Number(params?.examId)

  const [resultData, setResultData] = useState<ExamResultData | null>(null)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  function formatTime(isoStr?: string) {
    if (!isoStr) return '-'
    return new Date(isoStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function handlePrint() {
    window.print()
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
      link.setAttribute('download', `transkrip_ujian_${examId}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Gagal mengunduh transkrip PDF.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  async function loadResult() {
    if (!examId) {
      setIsLoading(false)
      setLoadError('ID ujian tidak valid.')
      return
    }
    setIsLoading(true)
    setLoadError('')
    try {
      // Admin/guru arrive via /results/{sessionId} with ?session_id=, so the
      // backend can resolve which student's result to show. Students ignore
      // the parameter and always see their own result. Read from
      // window.location instead of useSearchParams to avoid the Suspense
      // boundary requirement (this runs client-side in an effect).
      const sid = new URLSearchParams(window.location.search).get('session_id')
      const res = await api.get(
        `/student/exam/${examId}/result${sid ? `?session_id=${encodeURIComponent(sid)}` : ''}`
      )
      setResultData(res.data.data)
    } catch (err: any) {
      console.error('Failed to load exam result:', err)
      setResultData(null)
      setLoadError(
        err.response?.data?.message ||
          'Hasil ujian belum tersedia. Sesi ujian mungkin belum selesai dinilai atau belum dibuat.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResult()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId])

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6 px-4 font-sans text-slate-900">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Siswa</span>
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
          <p className="text-sm font-bold text-slate-700">Memuat hasil ujian...</p>
          <p className="text-xs text-slate-500 mt-1">Mengambil lembar nilai dari server.</p>
        </div>
      </div>
    )
  }

  if (!resultData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6 px-4 font-sans text-slate-900">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Siswa</span>
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900">Hasil Ujian Belum Tersedia</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{loadError}</p>
          <button
            type="button"
            onClick={loadResult}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4 font-sans text-slate-900">
      {/* Header Back & Print Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Siswa</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Cetak Lembar Nilai</span>
          </button>

          <button
            onClick={downloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 rounded-lg bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>{isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF Transkrip'}</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border font-mono ${
              resultData?.status === 'aborted'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : resultData?.status === 'graded'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {resultData?.status === 'aborted'
              ? 'Didiskualifikasi pengawas'
              : resultData?.status === 'graded'
              ? 'Selesai dinilai'
              : 'Dalam evaluasi guru'}
          </span>
        </div>
      </div>

      {/* Printable Official Header (Shown Only on Print) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              LEMBAR HASIL EVALUASI UJIAN SISWA
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Sistem Evaluasi Akademik Online — EXAMIND Platform
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold">
              Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              DOC-REF: EXM-{examId}-{resultData?.session_id || '0'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200 text-xs">
          <div>
            <p>
              <span className="font-bold text-slate-500">Nama Siswa:</span> {resultData?.student_name}
            </p>
            <p>
              <span className="font-bold text-slate-500">NISN / Identitas:</span>{' '}
              {resultData?.student_identifier}
            </p>
            <p>
              <span className="font-bold text-slate-500">Mata Pelajaran:</span> {resultData?.exam_title}
            </p>
          </div>
          <div>
            <p>
              <span className="font-bold text-slate-500">Kelas:</span> {resultData?.subject}
            </p>
            <p>
              <span className="font-bold text-slate-500">Waktu Selesai:</span>{' '}
              {formatTime(resultData?.submit_time)}
            </p>
            <p>
              <span className="font-bold text-slate-500">Skor Integritas:</span>{' '}
              {resultData?.integrity_score}%
            </p>
          </div>
        </div>
      </div>

      {/* Deliberate Disqualification Notice (Human-in-the-Loop) */}
      {resultData?.status === 'aborted' ? (
        <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4 shadow-xs">
          <div className="p-2.5 rounded-lg bg-rose-600 text-white shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-rose-900 font-mono">
                Keputusan Diskualifikasi oleh Pengawas Ujian
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 font-mono">
                Resmi
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              Berdasarkan hasil peninjauan langsung atas catatan log anomali dan konfirmasi manual pengawas
              sekolah, sesi pengerjaan ini telah diputuskan untuk didiskualifikasi secara resmi. Seluruh hasil
              pengerjaan dibatalkan dengan nilai akhir 0.00.
            </p>
          </div>
        </div>
      ) : resultData && resultData.integrity_score < 80 ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5 shadow-xs">
          <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-950 font-mono">Tinjauan Integritas Sedang Berlangsung</h4>
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Sistem mencatat beberapa pergerakan atau anomali kamera selama ujian (Skor Integritas:{' '}
              {resultData.integrity_score}%). Sesuai prinsip Human-in-the-Loop EXAMIND, hasil pengerjaan Anda tetap
              tersimpan utuh dan sedang ditinjau secara adil oleh guru pengampu sebelum finalisasi nilai rapor.
            </p>
          </div>
        </div>
      ) : null}

      {/* Hero Score Summary Card */}
      <div className="bg-white rounded-xl p-6 text-slate-900 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200 font-mono">
                Lembar hasil ujian
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: EXM-{examId}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{resultData?.exam_title}</h2>
            <p className="text-slate-500 text-xs">
              Peserta: <strong className="text-slate-800">{resultData?.student_name}</strong> • Selesai:{' '}
              {formatTime(resultData?.submit_time)}
            </p>
          </div>

          {/* Big Score Pill */}
          <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl shadow-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-bold font-mono">
                Nilai akhir
              </div>
              <div
                className={`text-3xl font-bold tabular-nums font-mono ${
                  resultData?.status === 'aborted' ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {resultData?.total_score}{' '}
                <span className="text-sm text-slate-500 font-normal">/ {resultData?.max_score}</span>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200" />

            <div>
              <div className="text-[10px] text-slate-500 font-bold font-mono">
                Integritas
              </div>
              <div
                className={`text-2xl font-bold tabular-nums font-mono ${
                  resultData?.status === 'aborted' ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {resultData?.integrity_score}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanations & Item Review */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Pembahasan & Evaluasi Pembelajaran</h3>
          <p className="text-xs text-slate-500">Penjelasan konseptual dan umpan balik formatif</p>
        </div>

        <div className="space-y-3.5">
          {(resultData?.answers || []).map((ans, idx) => (
            <div
              key={ans.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs text-slate-800 border border-slate-200 flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      ans.question_type === 'multiple_choice'
                        ? 'bg-[#f1effa] text-[#6a5fc1] border border-[#ddd9ef]'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    >
                      {ans.question_type === 'multiple_choice' ? 'Pilihan ganda' : 'Esai'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                  {ans.question_type === 'multiple_choice' ? (
                    ans.is_correct == null ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
                        Menunggu penilaian
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                          ans.is_correct
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ans.is_correct ? 'Jawaban Benar' : 'Jawaban Salah'} (Skor: {ans.final_score}/
                        {ans.allocated_points})
                      </span>
                    )
                  ) : ans.final_score == null ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
                      Menunggu penilaian
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                      Skor: {ans.final_score} / {ans.allocated_points} Poin
                    </span>
                  )}
                </div>
              </div>

              {/* Prompt */}
              <div className="text-sm font-semibold text-slate-900 leading-relaxed">{ans.prompt}</div>

              {/* Multiple Choice Breakdown */}
              {ans.question_type === 'multiple_choice' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-medium block">Pilihan Anda:</span>
                      <span className="font-bold text-slate-900">{ans.student_response || '(Kosong)'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-700 font-medium block">Kunci Jawaban:</span>
                      <span className="font-bold text-emerald-900">
                        {ans.correct_answer ?? 'Menunggu penilaian'}
                      </span>
                    </div>
                  </div>

                  {/* Formative AI Explanation */}
                  {ans.ai_explanation && (
                    <div className="p-4 rounded-xl bg-[#f1effa]/70 border border-[#ddd9ef] text-xs space-y-1">
                      <span className="font-bold text-[#6a5fc1] flex items-center gap-1.5 font-mono">
                        <Lightbulb className="w-3.5 h-3.5 text-[#6a5fc1]" />
                        Penjelasan Konsep Pedagogis:
                      </span>
                      <div className="text-slate-800 leading-relaxed text-xs">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={explanationMarkdownComponents}
                        >
                          {ans.ai_explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Essay Breakdown */
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-500 font-bold font-mono">Jawaban anda:</span>
                    <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                      {ans.student_response || '(Tidak dijawab)'}
                    </p>
                  </div>

                  {/* Respan Criteria Scorecard or Standard Explanation */}
                  {(() => {
                    let parsed: any = null
                    try {
                      if (ans.ai_grading_rationale && ans.ai_grading_rationale.startsWith('{')) {
                        parsed = JSON.parse(ans.ai_grading_rationale)
                      }
                    } catch {}

                    if (parsed && parsed.evaluations && parsed.evaluations.length > 0) {
                      return (
                        <div className="p-4 rounded-xl bg-[#f1effa]/70 border border-[#ddd9ef] text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#6a5fc1] font-mono">
                              Penilaian Kriteria Semantik (Respan Decision Engine):
                            </span>
                            <span className="text-[10px] font-mono text-[#6a5fc1] font-semibold">
                              Akurasi Probabilitas Terkalibrasi
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {parsed.evaluations.map((ev: any, evIdx: number) => {
                              const isPass = ev.status === 'passed'
                              return (
                                <div
                                  key={evIdx}
                                  className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                                    isPass
                                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                                  }`}
                                >
                                  <span className="font-bold shrink-0 flex items-center">
                                    {isPass ? <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" /> : <X className="w-4 h-4 text-rose-600" aria-hidden="true" />}
                                  </span>
                                  <div>
                                    <span className="font-semibold">{ev.statement}</span>
                                    <p className="text-[10px] opacity-80 mt-0.5 font-mono">
                                      Status: {isPass ? 'Terpenuhi dengan baik' : 'Belum tercakup dalam jawaban'}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {ans.ai_explanation && (
                            <div className="text-slate-800 leading-relaxed pt-1 border-t border-[#ddd9ef]/60 text-xs">
                              <strong className="text-slate-900 font-semibold">Catatan Formatif:</strong>
                              <div className="mt-1">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={explanationMarkdownComponents}
                                >
                                  {ans.ai_explanation}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }

                    if (ans.ai_explanation || ans.ai_grading_rationale) {
                      return (
                        <div className="p-4 rounded-xl bg-[#f1effa]/70 border border-[#ddd9ef] text-xs space-y-1">
                          <span className="font-bold text-[#6a5fc1] font-mono">
                            Evaluasi & Pembahasan Esai:
                          </span>
                          <div className="text-slate-800 leading-relaxed">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={explanationMarkdownComponents}
                            >
                              {ans.ai_explanation || ans.ai_grading_rationale}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )
                    }

                    return null
                  })()}

                  {ans.teacher_notes && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <span className="font-bold text-amber-900 font-mono">Catatan dari Guru:</span>
                      <p className="text-amber-800 leading-relaxed">{ans.teacher_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Question-Level Explanation Chatbot — hidden while the
                  session is still being graded. Its welcome message
                  treats a falsy isCorrect as "jawaban salah" and prints
                  the (still-gated, empty) official key, so showing it
                  mid-grading would mislabel a pending answer as wrong.
                  (Finding 3.) */}
              {resultData.status !== 'in_progress' && resultData.status !== 'grading_in_progress' ? (
                <QuestionExplanationChat
                  examId={resultData?.exam_id || examId}
                  questionId={ans.question_id}
                  questionNumber={idx + 1}
                  questionPrompt={ans.prompt}
                  questionType={ans.question_type}
                  isCorrect={ans.is_correct ?? undefined}
                  studentResponse={ans.student_response}
                  correctAnswer={ans.correct_answer}
                  officialExplanation={ans.ai_explanation}
                  finalScore={ans.final_score ?? undefined}
                  allocatedPoints={ans.allocated_points}
                />
              ) : (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
                  Diskusi AI untuk soal ini tersedia setelah penilaian selesai.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Printable Signature & Validation Footer (Shown Only on Print) */}
      <div className="hidden print:block mt-10 pt-8 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="font-medium text-slate-600">Peserta Ujian,</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{resultData?.student_name}</p>
            <p className="text-[10px] text-slate-500 font-mono">NISN: {resultData?.student_identifier}</p>
          </div>
          <div>
            <p className="font-medium text-slate-600">
              Mengetahui,
              <br />
              Pengawas / Guru Pengampu
            </p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">Guru Pengampu Mata Pelajaran</p>
            <p className="text-[10px] text-slate-500">EXAMIND Certified System</p>
          </div>
        </div>
      </div>
    </div>
  )
}
