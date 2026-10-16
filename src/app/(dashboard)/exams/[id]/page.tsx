'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Send,
  Radio,
  Trash2,
  CheckSquare,
  BarChart3,
  X,
  Loader2,
} from 'lucide-react'
import api from '@/lib/api'

interface Option {
  id: string
  text: string
}

interface Question {
  id: number
  question_type: string
  prompt: string
  options_json?: Option[]
  correct_answer?: string
  default_points?: number
}

interface ExamQuestionItem {
  id: number
  question_id: number
  allocated_points: number
  question?: Question
}

interface ExamDetail {
  id: number
  title: string
  class_name: string
  duration_minutes: number
  total_points: number
  status: string
  exam_questions?: ExamQuestionItem[]
}

interface BankItem {
  id: number
  title: string
  subject: string
}

export default function ExamDetailPage() {
  const params = useParams()
  const examId = params?.id as string

  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)
  const [availableBanks, setAvailableBanks] = useState<BankItem[]>([])
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)
  const [bankQuestions, setBankQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadExam() {
    if (!examId) return
    setIsLoading(true)
    try {
      const res = await api.get(`/exams/${examId}`)
      setExamDetail(res.data.data)
    } catch (err) {
      console.error('Failed to load exam:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadBanks() {
    try {
      const res = await api.get('/questions/banks')
      setAvailableBanks(res.data.data || [])
    } catch (err) {
      console.error('Failed to load banks:', err)
    }
  }

  async function loadBankQuestions(bankIdVal: number) {
    if (!bankIdVal) return
    try {
      const res = await api.get(`/questions/banks/${bankIdVal}`)
      const existingIds = new Set((examDetail?.exam_questions || []).map((eq) => eq.question_id))
      const questions = (res.data.data?.questions || []).filter((q: Question) => !existingIds.has(q.id))
      setBankQuestions(questions)
    } catch (err) {
      console.error('Failed to load bank questions:', err)
    }
  }

  async function handleAddQuestion(q: Question) {
    const nextOrder = (examDetail?.exam_questions?.length || 0) + 1
    try {
      await api.post(`/exams/${examId}/questions`, {
        question_id: q.id,
        order_index: nextOrder,
        allocated_points: q.default_points || 10.0,
      })
      await loadExam()
      if (selectedBankId) {
        await loadBankQuestions(selectedBankId)
      }
    } catch (err) {
      console.error('Failed to add question:', err)
    }
  }

  async function handleRemoveQuestion(qid: number) {
    if (!confirm('Hapus butir soal ini dari paket ujian?')) return
    try {
      await api.delete(`/exams/${examId}/questions/${qid}`)
      await loadExam()
    } catch (err) {
      console.error('Failed to remove question:', err)
    }
  }

  async function handlePublish() {
    if (!confirm('Publikasikan paket ujian ini untuk kelas target sekarang?')) return
    try {
      await api.post(`/exams/${examId}/publish`)
      await loadExam()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mempublikasikan ujian.')
    }
  }

  useEffect(() => {
    loadExam()
    loadBanks()
  }, [examId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5">
          <Link
            href="/exams"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {examDetail?.title}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono shadow-xs ${
                  examDetail?.status === 'published'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {examDetail?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">
              Kelas: {examDetail?.class_name} • Durasi: {examDetail?.duration_minutes} Menit • Total:{' '}
              <strong className="text-slate-800 tabular-nums">{examDetail?.total_points ?? 0}</strong> Poin
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {examDetail?.status === 'draft' && (
            <>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Pilih Soal dari Bank</span>
              </button>

              <button
                onClick={handlePublish}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 cursor-pointer transition-all font-display tracking-wide"
              >
                <Send className="w-4 h-4 text-[#c2ef4e]" />
                <span>Publikasikan Ujian</span>
              </button>
            </>
          )}

          {examDetail?.status === 'published' && (
            <Link
              href={`/exams/${examDetail.id}/monitor`}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Buka Live Monitoring</span>
            </Link>
          )}

          {examDetail && examDetail.status !== 'draft' && (
            <>
              <Link
                href={`/exams/${examDetail.id}/grading`}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-slate-600" />
                <span>Koreksi Esai</span>
              </Link>

              <Link
                href={`/exams/${examDetail.id}/analytics`}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <span>Analisis Soal</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Questions Allocated Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden text-slate-900">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Alokasi Butir Soal Ujian ({examDetail?.exam_questions?.length || 0} Butir)
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Total Akumulasi Poin:{' '}
              <strong className="text-slate-800 tabular-nums">
                {examDetail?.total_points || 0} / 100 Poin
              </strong>
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 font-medium">
            {(examDetail?.exam_questions || []).map((eq, idx) => (
              <div
                key={eq.id}
                className="p-6 hover:bg-slate-50/80 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase font-mono shadow-xs ${
                        eq.question?.question_type === 'multiple_choice'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {eq.question?.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-xl font-mono tabular-nums shadow-xs">
                      {eq.allocated_points} Poin
                    </span>
                    {examDetail?.status === 'draft' && (
                      <button
                        onClick={() => handleRemoveQuestion(eq.question_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Hapus butir soal dari ujian"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-display text-sm font-semibold text-slate-900 leading-relaxed">
                  {eq.question?.prompt}
                </p>

                {eq.question?.question_type === 'multiple_choice' && eq.question?.options_json && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    {eq.question.options_json.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          opt.id === eq.question?.correct_answer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <span className="font-bold w-4 font-mono">{opt.id}.</span> {opt.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {(!examDetail?.exam_questions || examDetail.exam_questions.length === 0) && (
              <div className="p-12 text-center text-slate-500">
                Belum ada butir soal yang dimasukkan ke paket ujian ini. Klik &apos;Pilih Soal dari Bank&apos; di atas.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Attach Questions from Bank */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Pilih Butir Soal dari Bank Soal</h3>
                <p className="text-xs text-slate-500">Pilih soal yang ingin dimasukkan ke dalam paket ujian ini</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                aria-label="Tutup modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">
                  Pilih Bank Soal
                </label>
                <select
                  value={selectedBankId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null
                    setSelectedBankId(val)
                    if (val) loadBankQuestions(val)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                >
                  <option value="">-- Pilih Bank Soal --</option>
                  {availableBanks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.subject})
                    </option>
                  ))}
                </select>
              </div>

              {bankQuestions.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {bankQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold uppercase font-mono">
                          {q.question_type === 'multiple_choice' ? 'PG' : 'Esai'}
                        </span>
                        <p className="font-semibold text-slate-900 line-clamp-2">{q.prompt}</p>
                      </div>

                      <button
                        onClick={() => handleAddQuestion(q)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
