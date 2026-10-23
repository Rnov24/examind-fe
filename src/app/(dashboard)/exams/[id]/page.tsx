'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  CheckCircle2,
  Sparkles,
  BookOpen,
  Search,
  Filter,
  Square,
  AlertCircle,
  FileQuestion,
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
  difficulty?: string
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
  proctoring_level?: string
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
  const [isPublishing, setIsPublishing] = useState(false)

  // Multi-select inside modal
  const [modalSearch, setModalSearch] = useState('')
  const [modalTypeFilter, setModalTypeFilter] = useState<'all' | 'multiple_choice' | 'essay'>('all')
  const [selectedModalQuestionIds, setSelectedModalQuestionIds] = useState<Set<number>>(new Set())
  const [isBatchAdding, setIsBatchAdding] = useState(false)

  const loadExam = useCallback(async () => {
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
  }, [examId])

  const didAutoSelectBankRef = useRef(false)

  const loadBanks = useCallback(async () => {
    try {
      const res = await api.get('/questions/banks')
      const banks = res.data.data || []
      setAvailableBanks(banks)
      // Auto-select the first bank on initial load only (ref guard prevents re-selection loops)
      if (banks.length > 0 && !didAutoSelectBankRef.current) {
        didAutoSelectBankRef.current = true
        setSelectedBankId(banks[0].id)
      }
    } catch (err) {
      console.error('Failed to load banks:', err)
    }
  }, [])

  const loadBankQuestions = useCallback(async (bankIdVal: number) => {
    if (!bankIdVal) return
    try {
      const res = await api.get(`/questions/banks/${bankIdVal}`)
      const existingIds = new Set((examDetail?.exam_questions || []).map((eq) => eq.question_id))
      const questions = (res.data.data?.questions || []).filter((q: Question) => !existingIds.has(q.id))
      setBankQuestions(questions)
      setSelectedModalQuestionIds(new Set())
    } catch (err) {
      console.error('Failed to load bank questions:', err)
    }
  }, [examDetail?.exam_questions])

  useEffect(() => {
    loadExam()
    loadBanks()
  }, [loadExam, loadBanks])

  useEffect(() => {
    if (selectedBankId) {
      loadBankQuestions(selectedBankId)
    }
  }, [selectedBankId, loadBankQuestions])

  async function handleAddSingleQuestion(q: Question) {
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

  // Batch add multiple selected questions
  async function handleBatchAddQuestions() {
    if (selectedModalQuestionIds.size === 0) return
    setIsBatchAdding(true)
    try {
      let currentOrder = (examDetail?.exam_questions?.length || 0) + 1
      const idsToAdd = Array.from(selectedModalQuestionIds)
      for (const qid of idsToAdd) {
        const q = bankQuestions.find((item) => item.id === qid)
        if (q) {
          await api.post(`/exams/${examId}/questions`, {
            question_id: q.id,
            order_index: currentOrder++,
            allocated_points: q.default_points || 10.0,
          })
        }
      }
      setSelectedModalQuestionIds(new Set())
      await loadExam()
      if (selectedBankId) {
        await loadBankQuestions(selectedBankId)
      }
      setShowAddQuestionModal(false)
    } catch (err) {
      console.error('Failed to batch add questions:', err)
      alert('Gagal menambahkan beberapa soal ke paket ujian.')
    } finally {
      setIsBatchAdding(false)
    }
  }

  async function handleRemoveQuestion(qid: number) {
    if (!confirm('Hapus butir soal ini dari paket ujian?')) return
    try {
      await api.delete(`/exams/${examId}/questions/${qid}`)
      await loadExam()
      if (selectedBankId) {
        await loadBankQuestions(selectedBankId)
      }
    } catch (err) {
      console.error('Failed to remove question:', err)
    }
  }

  async function handlePublish() {
    const questionCount = examDetail?.exam_questions?.length || 0
    if (questionCount === 0) {
      alert('Paket ujian harus memiliki minimal 1 butir soal sebelum dipublikasikan.')
      return
    }

    if (!confirm('Publikasikan paket ujian ini sekarang? Siswa di rombel kelas akan dapat melihat jadwal ujian ini.')) {
      return
    }

    setIsPublishing(true)
    try {
      await api.post(`/exams/${examId}/publish`)
      await loadExam()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mempublikasikan ujian.')
    } finally {
      setIsPublishing(false)
    }
  }

  // Filter bank questions in modal
  const filteredModalQuestions = useMemo(() => {
    return bankQuestions.filter((q) => {
      const matchesSearch = q.prompt.toLowerCase().includes(modalSearch.toLowerCase())
      const matchesType =
        modalTypeFilter === 'all'
          ? true
          : modalTypeFilter === 'multiple_choice'
          ? q.question_type === 'multiple_choice'
          : q.question_type !== 'multiple_choice'
      return matchesSearch && matchesType
    })
  }, [bankQuestions, modalSearch, modalTypeFilter])

  function toggleModalQuestionSelect(qid: number) {
    setSelectedModalQuestionIds((prev) => {
      const next = new Set(prev)
      if (next.has(qid)) {
        next.delete(qid)
      } else {
        next.add(qid)
      }
      return next
    })
  }

  function toggleSelectAllModalQuestions() {
    if (selectedModalQuestionIds.size === filteredModalQuestions.length && filteredModalQuestions.length > 0) {
      setSelectedModalQuestionIds(new Set())
    } else {
      setSelectedModalQuestionIds(new Set(filteredModalQuestions.map((q) => q.id)))
    }
  }

  const totalPoints = examDetail?.total_points || 0
  const isTargetAchieved = totalPoints === 100
  const pointsRemaining = Math.max(0, 100 - totalPoints)

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Wizard Step Tracker Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1 Done */}
          <Link
            href="/exams"
            className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-slate-700 flex items-center gap-3 hover:bg-emerald-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider block text-emerald-800">
                Langkah 1 (Selesai)
              </span>
              <span className="text-xs font-bold truncate block text-slate-800">
                Parameter & Jadwal
              </span>
            </div>
          </Link>

          {/* Step 2 Done */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-slate-700 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider block text-emerald-800">
                Langkah 2 (Selesai)
              </span>
              <span className="text-xs font-bold truncate block text-slate-800">
                Pengawasan & Kebijakan
              </span>
            </div>
          </div>

          {/* Step 3 Active */}
          <div className="p-3 rounded-xl border border-slate-900 bg-slate-900 text-white flex items-center gap-3 shadow-md">
            <div className="w-7 h-7 rounded-lg bg-[#c2ef4e] text-slate-950 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider block text-[#c2ef4e]">
                Langkah 3 (Aktif)
              </span>
              <span className="text-xs font-bold truncate block">
                Alokasi Soal & Publikasi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Exam Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/exams"
            title="Kembali ke Daftar Ujian"
            aria-label="Kembali ke Daftar Ujian"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono shadow-2xs ${
                  examDetail?.status === 'published'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : examDetail?.status === 'in_progress'
                    ? 'bg-[#c2ef4e] text-slate-950'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                Status: {examDetail?.status === 'published' ? 'Terjadwal' : examDetail?.status === 'in_progress' ? 'Berlangsung' : examDetail?.status || 'Draft'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Kelas: {examDetail?.class_name || 'Umum'} • Durasi: {examDetail?.duration_minutes} Menit
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {examDetail?.title || 'Memuat Paket Ujian...'}
            </h1>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto shrink-0">
          {examDetail?.status === 'draft' && (
            <>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
              >
                <Plus className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Pilih Soal dari Bank</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer transition-all font-display tracking-wide focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                )}
                <span>Publikasikan Ujian</span>
              </button>
            </>
          )}

          {examDetail?.status === 'published' && (
            <Link
              href={`/exams/${examDetail.id}/monitor`}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            >
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" aria-hidden="true" />
              <span>Buka Live Monitoring</span>
            </Link>
          )}

          {examDetail && examDetail.status !== 'draft' && (
            <>
              <Link
                href={`/grading/${examDetail.id}`}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
              >
                <CheckSquare className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Koreksi Esai</span>
              </Link>

              <Link
                href={`/exams/${examDetail.id}/analytics`}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
              >
                <BarChart3 className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Analisis Butir Soal</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Target Points Meter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
              Progres Alokasi Target Poin Asesmen
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 font-display tabular-nums">
                {totalPoints} / 100 Poin
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({examDetail?.exam_questions?.length || 0} Butir Soal)
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            {isTargetAchieved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Target 100 Poin Terpenuhi! Siap Rilis</span>
              </span>
            ) : totalPoints < 100 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Kurang {pointsRemaining} Poin Menuju 100</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 text-xs font-bold font-mono">
                <span>Total Poin: {totalPoints}</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isTargetAchieved
                ? 'bg-emerald-500'
                : totalPoints < 100
                ? 'bg-amber-500'
                : 'bg-violet-600'
            }`}
            style={{ width: `${Math.min(100, (totalPoints / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* Questions Allocated Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden text-slate-900">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Daftar Butir Soal Terpasang ({examDetail?.exam_questions?.length || 0} Butir)
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Urutan butir soal dapat diacak otomatis saat ujian sesuai kebijakan.
            </p>
          </div>

          {examDetail?.status === 'draft' && (examDetail?.exam_questions?.length || 0) > 0 && (
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
              <span>Tambah Soal</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-700">Memuat butir soal ujian...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 font-medium">
            {(examDetail?.exam_questions || []).map((eq, idx) => (
              <div
                key={eq.id}
                className="p-5 sm:p-6 hover:bg-[#f1effa] transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase font-mono shadow-2xs ${
                        eq.question?.question_type === 'multiple_choice'
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {eq.question?.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl font-mono tabular-nums shadow-2xs">
                      {eq.allocated_points} Poin
                    </span>
                    {examDetail?.status === 'draft' && (
                      <button
                        onClick={() => handleRemoveQuestion(eq.question_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        title="Hapus butir soal dari ujian"
                        aria-label="Hapus butir soal dari ujian"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
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
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
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

            {/* Actionable Empty State */}
            {(!examDetail?.exam_questions || examDetail.exam_questions.length === 0) && (
              <div className="p-10 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                  <CheckSquare className="w-7 h-7" aria-hidden="true" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    Belum Ada Butir Soal Terpasang
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Paket ujian ini belum memiliki naskah soal. Silakan pilih butir soal dari master bank soal yang sudah dibuat sebelumnya.
                  </p>
                </div>

                {examDetail?.status === 'draft' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddQuestionModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none font-display"
                    >
                      <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                      <span>Pilih Soal dari Bank</span>
                    </button>
                    <Link
                      href="/questions"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs transition-colors"
                    >
                      Buka Master Bank Soal
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Attach Questions from Bank with Multi-Select & Search */}
      {showAddQuestionModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddQuestionModal(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Pilih Butir Soal dari Bank
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih satu atau beberapa butir soal sekaligus untuk dimasukkan ke paket ujian ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                title="Tutup modal"
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Bank Select & Filters */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">
                    Pilih Bank Soal
                  </label>
                  <select
                    value={selectedBankId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null
                      setSelectedBankId(val)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none"
                  >
                    <option value="">-- Pilih Bank Soal --</option>
                    {availableBanks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">
                    Cari & Saring Butir
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Cari teks soal..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Selection Bar inside Modal */}
              {filteredModalQuestions.length > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAllModalQuestions}
                      className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      {selectedModalQuestionIds.size === filteredModalQuestions.length ? (
                        <CheckSquare className="w-4 h-4 text-violet-600" aria-hidden="true" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      )}
                      <span>Pilih Semua ({filteredModalQuestions.length})</span>
                    </button>
                    {selectedModalQuestionIds.size > 0 && (
                      <span className="text-slate-500 font-mono">
                        • {selectedModalQuestionIds.size} butir terpilih
                      </span>
                    )}
                  </div>

                  {selectedModalQuestionIds.size > 0 && (
                    <button
                      type="button"
                      disabled={isBatchAdding}
                      onClick={handleBatchAddQuestions}
                      className="px-3.5 py-1.5 rounded-lg bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isBatchAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                      <span>Tambahkan {selectedModalQuestionIds.size} Soal Terpilih</span>
                    </button>
                  )}
                </div>
              )}

              {/* Bank Questions Scroll List */}
              {filteredModalQuestions.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {filteredModalQuestions.map((q) => {
                    const isSelected = selectedModalQuestionIds.has(q.id)
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-3 text-xs ${
                          isSelected ? 'bg-violet-50/60 border-violet-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleModalQuestionSelect(q.id)}
                            className="mt-0.5 text-slate-400 hover:text-violet-600 cursor-pointer shrink-0"
                            aria-label="Pilih butir soal ini"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-violet-600" aria-hidden="true" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" aria-hidden="true" />
                            )}
                          </button>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded text-[10px] font-bold uppercase font-mono">
                                {q.question_type === 'multiple_choice' ? 'PG' : 'Esai'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {q.default_points || 10} Poin
                              </span>
                            </div>
                            <p className="font-semibold text-slate-900 line-clamp-2 leading-relaxed">
                              {q.prompt}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddSingleQuestion(q)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shrink-0 cursor-pointer transition-colors focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                        >
                          + Tambah
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  {selectedBankId
                    ? 'Semua soal dari bank ini sudah dimasukkan ke ujian atau tidak ada soal yang cocok.'
                    : 'Pilih bank soal di atas untuk menampilkan daftar butir soal.'}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                {selectedModalQuestionIds.size} butir soal dipilih
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f1effa] border border-slate-200 cursor-pointer transition-colors"
                >
                  Tutup
                </button>
                {selectedModalQuestionIds.size > 0 && (
                  <button
                    type="button"
                    disabled={isBatchAdding}
                    onClick={handleBatchAddQuestions}
                    className="px-5 py-2 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 font-display"
                  >
                    {isBatchAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                    <span>Tambahkan ke Ujian</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
