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
  Sparkles,
} from 'lucide-react'
import api from '@/lib/api'
import QuestionExplanationChat from '@/components/student/QuestionExplanationChat'

interface ResultAnswer {
  id: number
  question_id: number
  question_type: string
  prompt: string
  is_correct?: boolean
  final_score: number
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

export default function ExamResultPage() {
  const params = useParams()
  const examId = Number(params?.examId)

  const [resultData, setResultData] = useState<ExamResultData | null>(null)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    async function loadResult() {
      if (!examId) return
      setIsLoading(true)
      try {
        const res = await api.get(`/grading/exam/${examId}/result`)
        setResultData(res.data.data)
      } catch (err) {
        console.error('Failed to load exam result:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadResult()
  }, [examId])

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
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Cetak Lembar Nilai</span>
          </button>

          <button
            onClick={downloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>{isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF Transkrip'}</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase border font-mono ${
              resultData?.status === 'aborted'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : resultData?.status === 'graded'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {resultData?.status === 'aborted'
              ? 'Didiskualifikasi Pengawas'
              : resultData?.status === 'graded'
              ? 'Selesai Dinilai'
              : 'Dalam Evaluasi Guru'}
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
              <h3 className="text-base font-black text-rose-900 tracking-tight font-mono">
                Keputusan Diskualifikasi oleh Pengawas Ujian
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 uppercase font-mono">
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
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200 font-mono">
                Lembar Hasil Ujian
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: EXM-{examId}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{resultData?.exam_title}</h2>
            <p className="text-slate-500 text-xs">
              Peserta: <strong className="text-slate-800">{resultData?.student_name}</strong> • Selesai:{' '}
              {formatTime(resultData?.submit_time)}
            </p>
          </div>

          {/* Big Score Pill */}
          <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl shadow-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                Nilai Akhir
              </div>
              <div
                className={`text-3xl font-extrabold tracking-tight tabular-nums font-mono ${
                  resultData?.status === 'aborted' ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {resultData?.total_score}{' '}
                <span className="text-sm text-slate-500 font-normal">/ {resultData?.max_score}</span>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200" />

            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
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
                  <span className="w-7 h-7 rounded-lg bg-slate-100 font-black text-xs text-slate-800 border border-slate-200 flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase font-mono ${
                      ans.question_type === 'multiple_choice'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    >
                      {ans.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                  {ans.question_type === 'multiple_choice' ? (
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
                      <span className="font-bold text-emerald-900">{ans.correct_answer}</span>
                    </div>
                  </div>

                  {/* Formative AI Explanation */}
                  {ans.ai_explanation && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5 font-mono">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-700" />
                        Penjelasan Konsep Pedagogis:
                      </span>
                      <p className="text-slate-800 leading-relaxed">{ans.ai_explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Essay Breakdown */
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-500 font-bold uppercase font-mono">Jawaban Anda:</span>
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
                        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-900 flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                              Penilaian Kriteria Semantik (Respan Decision Engine):
                            </span>
                            <span className="text-[10px] font-mono text-indigo-600 font-semibold">
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
                                  <span className="font-bold shrink-0">
                                    {isPass ? '✅' : '❌'}
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
                            <p className="text-slate-800 leading-relaxed pt-1 border-t border-indigo-200/60 text-xs">
                              <strong className="text-slate-900 font-semibold">Catatan Formatif:</strong>{' '}
                              {ans.ai_explanation}
                            </p>
                          )}
                        </div>
                      )
                    }

                    if (ans.ai_explanation || ans.ai_grading_rationale) {
                      return (
                        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
                          <span className="font-bold text-indigo-900 flex items-center gap-1.5 font-mono">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                            Evaluasi & Pembahasan Esai:
                          </span>
                          <p className="text-slate-800 leading-relaxed">
                            {ans.ai_explanation || ans.ai_grading_rationale}
                          </p>
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

              {/* Question-Level Explanation Chatbot */}
              <QuestionExplanationChat
                examId={resultData?.exam_id || examId}
                questionId={ans.question_id}
                questionNumber={idx + 1}
                questionPrompt={ans.prompt}
                questionType={ans.question_type}
                isCorrect={ans.is_correct}
                studentResponse={ans.student_response}
                correctAnswer={ans.correct_answer}
                officialExplanation={ans.ai_explanation}
                finalScore={ans.final_score}
                allocatedPoints={ans.allocated_points}
              />
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
