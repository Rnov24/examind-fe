'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Trash2,
  BookOpen,
  X,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  AlertTriangle,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react'
import api from '@/lib/api'
import AIGeneratorModal from '@/components/questions/AIGeneratorModal'

interface Option {
  id: string
  text: string
}

interface RubricDimension {
  criteria: string
}

interface QuestionRubric {
  dimension_1_concept?: RubricDimension
  dimension_2_argument?: RubricDimension
  dimension_3_terminology?: RubricDimension
  dimension_4_clarity?: RubricDimension
}

interface QuestionItem {
  id: number
  question_type: string
  difficulty: string
  default_points: number
  prompt: string
  options_json?: Option[]
  correct_answer?: string
  rubric_json?: QuestionRubric
  explanation?: string
}

interface BankDetail {
  id: number
  title: string
  subject: string
  questions?: QuestionItem[]
}

export default function QuestionBankDetailPage() {
  const params = useParams()
  const bankId = params?.id as string

  const [bankDetail, setBankDetail] = useState<BankDetail | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [isSavingManual, setIsSavingManual] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'multiple_choice' | 'essay'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Expand explanations
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({})

  const [manualForm, setManualForm] = useState({
    question_type: 'multiple_choice',
    difficulty: 'medium',
    default_points: 10,
    prompt: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    correct_answer: 'A',
    explanation: '',
  })

  const loadDetail = useCallback(async () => {
    if (!bankId) return
    setIsLoading(true)
    try {
      const res = await api.get(`/questions/banks/${bankId}`)
      setBankDetail(res.data.data)
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Failed to load bank detail:', err)
    } finally {
      setIsLoading(false)
    }
  }, [bankId])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  // Filter questions
  const filteredQuestions = useMemo(() => {
    const list = bankDetail?.questions || []
    return list.filter((q) => {
      const matchesSearch = q.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'multiple_choice'
          ? q.question_type === 'multiple_choice'
          : q.question_type !== 'multiple_choice'
      const matchesDifficulty =
        difficultyFilter === 'all' ? true : q.difficulty === difficultyFilter

      return matchesSearch && matchesType && matchesDifficulty
    })
  }, [bankDetail?.questions, searchQuery, typeFilter, difficultyFilter])

  // Single delete
  async function handleDeleteQuestion(qid: number) {
    if (!confirm('Hapus butir soal ini dari bank?')) return
    try {
      await api.delete(`/questions/items/${qid}`)
      await loadDetail()
    } catch (err) {
      console.error('Failed to delete question:', err)
    }
  }

  // Bulk select toggles
  function toggleSelectQuestion(qid: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(qid)) {
        next.delete(qid)
      } else {
        next.add(qid)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.id)))
    }
  }

  // Bulk delete
  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Hapus ${selectedIds.size} butir soal yang dipilih sekaligus?`)) return

    setIsBulkDeleting(true)
    try {
      const idsToDelete = Array.from(selectedIds)
      for (const qid of idsToDelete) {
        await api.delete(`/questions/items/${qid}`)
      }
      await loadDetail()
    } catch (err) {
      console.error('Failed to perform bulk delete:', err)
      alert('Terjadi kesalahan saat menghapus beberapa butir soal.')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  function toggleExplanation(qid: number) {
    setExpandedExplanations((prev) => ({
      ...prev,
      [qid]: !prev[qid],
    }))
  }

  async function handleSaveManualQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (isSavingManual) return
    setIsSavingManual(true)
    try {
      const payload: any = {
        bank_id: Number(bankId),
        question_type: manualForm.question_type,
        prompt: manualForm.prompt,
        difficulty: manualForm.difficulty,
        default_points: Number(manualForm.default_points) || 10,
        explanation: manualForm.explanation || null,
      }

      if (manualForm.question_type === 'multiple_choice') {
        payload.options_json = manualForm.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        }))
        payload.correct_answer = manualForm.correct_answer
      }

      await api.post(`/questions/banks/${bankId}/items`, payload)
      setShowManualModal(false)
      setManualForm({
        question_type: 'multiple_choice',
        difficulty: 'medium',
        default_points: 10,
        prompt: '',
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ],
        correct_answer: 'A',
        explanation: '',
      })
      await loadDetail()
    } catch (err: any) {
      console.error('Failed to create question manually:', err)
      alert(err?.response?.data?.message || 'Gagal menyimpan butir soal.')
    } finally {
      setIsSavingManual(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/questions"
            title="Kembali ke Bank Soal"
            aria-label="Kembali ke Bank Soal"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-md text-[11px] font-bold font-mono">
                {bankDetail?.subject || 'Mata Pelajaran'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {bankDetail?.questions?.length || 0} Butir Soal Terdaftar
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate font-display">
              {bankDetail?.title || 'Memuat Bank Soal...'}
            </h1>
          </div>
        </div>

        {/* Action Buttons: AI Studio (Highlighted) + Tambah Manual */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 cursor-pointer transition-colors focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none font-display tracking-wide"
          >
            <Sparkles className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Generate dengan AI</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-[#f1effa] text-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Filter & Bulk Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari teks soal atau kata kunci..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-500 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900"
            >
              <option value="all">Semua Tipe Soal</option>
              <option value="multiple_choice">Pilihan Ganda (PG)</option>
              <option value="essay">Esai</option>
            </select>
          </div>

          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900"
            >
              <option value="all">Semua Kesulitan</option>
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </select>
          </div>

          {/* Bulk Select All Button */}
          {filteredQuestions.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0 ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-violet-600" aria-hidden="true" />
                  <span>Batal Pilih Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Pilih Semua</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-[#150f23] text-white p-3.5 px-5 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#c2ef4e] text-slate-950 font-black text-xs font-mono flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-slate-100">
              Butir soal dipilih
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isBulkDeleting}
              onClick={handleBulkDelete}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isBulkDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isBulkDeleting ? 'Menghapus...' : `Hapus (${selectedIds.size})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" aria-hidden="true" />
          <p className="text-xs font-bold text-slate-900">Memuat butir soal dari bank...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isSelected = selectedIds.has(q.id)
            const isExplanationExpanded = !!expandedExplanations[q.id]

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-colors text-slate-900 space-y-4 shadow-card ${
                  isSelected ? 'border-violet-600 ring-2 ring-violet-600/10 bg-violet-50/10' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Checkbox for selection */}
                    <button
                      type="button"
                      onClick={() => toggleSelectQuestion(q.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-violet-600 cursor-pointer"
                      aria-label={isSelected ? 'Hapus pilihan butir soal' : 'Pilih butir soal ini'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-violet-600" aria-hidden="true" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" aria-hidden="true" />
                      )}
                    </button>

                    <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 font-black text-xs text-slate-800 flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase font-mono ${
                        q.question_type === 'multiple_choice'
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border font-mono capitalize ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : q.difficulty === 'hard'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono tabular-nums">
                      {q.default_points} Poin
                    </span>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Hapus butir soal"
                      aria-label="Hapus butir soal"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-sm font-semibold text-slate-900 leading-relaxed font-display">
                  {q.prompt}
                </p>

                {/* Options for MCQ */}
                {q.question_type === 'multiple_choice' && q.options_json && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options_json.map((opt) => {
                      const isCorrect = opt.id === q.correct_answer
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2.5 transition-colors ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-slate-50 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="w-5 font-black font-mono shrink-0">{opt.id}.</span>
                            <span className="leading-relaxed">{opt.text}</span>
                          </div>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                              <span>Kunci Jawaban</span>
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Rubric for Essay */}
                {q.question_type !== 'multiple_choice' && q.rubric_json && (
                  <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-900 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 font-mono">
                        Pedoman Matriks Rubrik 4 Dimensi:
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Evaluasi Komprehensif EXAMIND
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                        <span className="font-bold block text-slate-900 font-mono">1. Konsep (40%)</span>
                        <span className="text-slate-600 text-[10px] leading-relaxed block">
                          {q.rubric_json.dimension_1_concept?.criteria || 'Pemahaman prinsip dasar teori materi'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                        <span className="font-bold block text-slate-900 font-mono">2. Argumen (30%)</span>
                        <span className="text-slate-600 text-[10px] leading-relaxed block">
                          {q.rubric_json.dimension_2_argument?.criteria || 'Logika penalaran dan bukti pendukung'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                        <span className="font-bold block text-slate-900 font-mono">3. Terminologi (15%)</span>
                        <span className="text-slate-600 text-[10px] leading-relaxed block">
                          {q.rubric_json.dimension_3_terminology?.criteria || 'Ketepatan kosakata ilmiah/kejuruan'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                        <span className="font-bold block text-slate-900 font-mono">4. Kejelasan (15%)</span>
                        <span className="text-slate-600 text-[10px] leading-relaxed block">
                          {q.rubric_json.dimension_4_clarity?.criteria || 'Sistematika bahasa dan struktur jawaban'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation Expandable */}
                {q.explanation && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExplanation(q.id)}
                      className="text-[11px] font-bold text-slate-600 hover:text-violet-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{isExplanationExpanded ? 'Sembunyikan Pembahasan Konsep' : 'Lihat Pembahasan Konsep'}</span>
                      {isExplanationExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>

                    {isExplanationExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-violet-50/40 border border-violet-100 text-xs text-slate-700 leading-relaxed font-normal">
                        <p className="font-bold text-violet-950 font-display mb-0.5">Penjelasan Konsep Kunci:</p>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Filtered Empty State */}
          {filteredQuestions.length === 0 && (bankDetail?.questions || []).length > 0 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tidak Ada Soal yang Sesuai dengan Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan sesuaikan kata kunci pencarian, tipe soal, atau tingkat kesulitan.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setTypeFilter('all')
                  setDifficultyFilter('all')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Filter Soal</span>
              </button>
            </div>
          )}

          {/* Total Empty State with Guided Action Paths */}
          {(!bankDetail?.questions || bankDetail.questions.length === 0) && (
            <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-200/80 text-slate-900 shadow-card flex flex-col items-center justify-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7" aria-hidden="true" />
              </div>

              <div className="space-y-1 max-w-md">
                <h4 className="font-bold text-slate-900 text-lg font-display">
                  Bank Soal Ini Masih Kosong
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih salah satu metode di bawah ini untuk mulai mengisi butir soal ke dalam repositori {bankDetail?.subject || 'mata pelajaran'}.
                </p>
              </div>

              {/* Two Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full text-left pt-2">
                <div
                  onClick={() => setShowAIModal(true)}
                  className="p-5 rounded-2xl border-2 border-violet-500/30 hover:border-violet-600 bg-violet-50/30 hover:bg-violet-50/60 transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#150f23] text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-[#c2ef4e] text-slate-950">
                      Rekomendasi
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm font-display group-hover:text-violet-600 transition-colors">
                    AI Question Generator
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hasilkan butir soal PG dan esai otomatis dari silabus atau materi belajar dalam hitungan detik.
                  </p>
                </div>

                <div
                  onClick={() => setShowManualModal(true)}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm font-display group-hover:text-slate-700 transition-colors">
                    Input Butir Manual
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Rancang pertanyaan, tentukan opsi pilihan ganda dan kunci jawaban secara kustom satu per satu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={showAIModal}
        bankId={Number(bankId)}
        subject={bankDetail?.subject || 'Fisika'}
        onClose={() => setShowAIModal(false)}
        onSaved={loadDetail}
      />

      {/* Manual Question Creation Modal */}
      {showManualModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowManualModal(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Tambah Butir Soal Manual</h3>
                <p className="text-xs text-slate-500">Rancang butir soal PG atau esai langsung ke bank soal ini</p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                title="Tutup modal"
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveManualQuestion} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 font-mono">Tipe Soal</label>
                  <select
                    value={manualForm.question_type}
                    onChange={(e) => setManualForm({ ...manualForm, question_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none"
                  >
                    <option value="multiple_choice">Pilihan Ganda (PG)</option>
                    <option value="short_essay">Esai Singkat</option>
                    <option value="long_essay">Esai Panjang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 font-mono">Tingkat Kesulitan</label>
                  <select
                    value={manualForm.difficulty}
                    onChange={(e) => setManualForm({ ...manualForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 font-mono">Alokasi Poin</label>
                  <input
                    value={manualForm.default_points}
                    onChange={(e) => setManualForm({ ...manualForm, default_points: Number(e.target.value) })}
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-mono font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 font-mono">
                  Teks Pertanyaan / Soal
                </label>
                <textarea
                  value={manualForm.prompt}
                  onChange={(e) => setManualForm({ ...manualForm, prompt: e.target.value })}
                  rows={3}
                  required
                  placeholder="Tuliskan teks pertanyaan atau instruksi tugas secara rinci..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none leading-relaxed"
                />
              </div>

              {/* Multiple Choice Options */}
              {manualForm.question_type === 'multiple_choice' ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wider font-mono text-[11px]">
                      Pilihan Opsi & Kunci Jawaban
                    </span>
                    <span className="text-[11px] text-slate-500">Pilih opsi yang merupakan kunci jawaban</span>
                  </div>

                  <div className="space-y-2">
                    {manualForm.options.map((opt, optIdx) => (
                      <div
                        key={opt.id}
                        className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 focus-within:border-[#6a5fc1] focus-within:ring-2 focus-within:ring-[#6a5fc1]/25"
                      >
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            value={opt.id}
                            checked={manualForm.correct_answer === opt.id}
                            onChange={(e) => setManualForm({ ...manualForm, correct_answer: e.target.value })}
                            name="manual_correct_opt"
                            aria-label={`Jadikan opsi ${opt.id} sebagai kunci jawaban`}
                            className="w-4 h-4 text-slate-900 accent-slate-900"
                          />
                          <span className="font-mono font-bold text-xs w-4">{opt.id}.</span>
                        </label>
                        <input
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...manualForm.options]
                            newOpts[optIdx] = { ...newOpts[optIdx], text: e.target.value }
                            setManualForm({ ...manualForm, options: newOpts })
                          }}
                          type="text"
                          required
                          aria-label={`Teks pilihan ${opt.id}`}
                          placeholder={`Isi pilihan ${opt.id}...`}
                          className="flex-1 px-2.5 py-1 text-xs border-0 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-500 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Essay Rubric Note */
                <div className="p-3.5 bg-violet-50/60 rounded-xl border border-violet-100 text-violet-900 text-[11px] leading-relaxed">
                  <span className="font-bold font-mono uppercase block mb-0.5">Pedoman Penilaian Esai:</span>
                  Sistem evaluasi EXAMIND akan menerapkan Rubrik 4 Dimensi otomatis (Konsep 40%, Argumen 30%,
                  Terminologi 15%, Kejelasan 15%) saat grading dengan AI dan verifikasi guru.
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 font-mono">
                  Penjelasan / Pembahasan Konsep (Opsional)
                </label>
                <textarea
                  value={manualForm.explanation}
                  onChange={(e) => setManualForm({ ...manualForm, explanation: e.target.value })}
                  rows={2}
                  placeholder="Uraian konsep kunci atau pembahasan mengapa jawaban tersebut benar..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f1effa] border border-slate-200 cursor-pointer shadow-xs transition-colors focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none font-display tracking-wide"
                >
                  {isSavingManual && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>{isSavingManual ? 'Menyimpan...' : 'Simpan Butir Soal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
