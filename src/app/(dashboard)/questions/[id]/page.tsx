'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Sparkles, Trash2, BookOpen, X, Loader2 } from 'lucide-react'
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

  async function loadDetail() {
    if (!bankId) return
    setIsLoading(true)
    try {
      const res = await api.get(`/questions/banks/${bankId}`)
      setBankDetail(res.data.data)
    } catch (err) {
      console.error('Failed to load bank detail:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteQuestion(qid: number) {
    if (!confirm('Hapus butir soal ini dari bank?')) return
    try {
      await api.delete(`/questions/items/${qid}`)
      await loadDetail()
    } catch (err) {
      console.error('Failed to delete question:', err)
    }
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

  useEffect(() => {
    loadDetail()
  }, [bankId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/questions"
            title="Kembali ke Bank Soal"
            aria-label="Kembali ke Bank Soal"
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{bankDetail?.title}</h2>
            <p className="text-xs text-slate-500 font-medium font-mono">
              Mata Pelajaran: {bankDetail?.subject} • Total: {bankDetail?.questions?.length || 0} Butir Soal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Sparkles className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Generate dengan AI</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden="true" />
        </div>
      ) : (
        <div className="space-y-4">
          {(bankDetail?.questions || []).map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 text-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 font-black text-xs text-slate-800 flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase font-mono ${
                      q.question_type === 'multiple_choice'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-600 capitalize font-mono">
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 font-mono">{q.default_points} Poin</span>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    title="Hapus butir soal"
                    aria-label="Hapus butir soal"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.prompt}</p>

              {/* Options for MCQ */}
              {q.question_type === 'multiple_choice' && q.options_json && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.options_json.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        opt.id === q.correct_answer
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-5 font-black font-mono">{opt.id}.</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rubric for Essay */}
              {q.question_type !== 'multiple_choice' && q.rubric_json && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 font-mono">
                    Rubrik 4 Dimensi:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="font-bold block text-slate-900 font-mono">Konsep (40%)</span>
                      <span className="text-slate-500 text-[10px] mt-0.5 block">
                        {q.rubric_json.dimension_1_concept?.criteria}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="font-bold block text-slate-900 font-mono">Argumen (30%)</span>
                      <span className="text-slate-500 text-[10px] mt-0.5 block">
                        {q.rubric_json.dimension_2_argument?.criteria}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="font-bold block text-slate-900 font-mono">Terminologi (15%)</span>
                      <span className="text-slate-500 text-[10px] mt-0.5 block">
                        {q.rubric_json.dimension_3_terminology?.criteria}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="font-bold block text-slate-900 font-mono">Kejelasan (15%)</span>
                      <span className="text-slate-500 text-[10px] mt-0.5 block">
                        {q.rubric_json.dimension_4_clarity?.criteria}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {(!bankDetail?.questions || bankDetail.questions.length === 0) && (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 text-slate-900 shadow-xs flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Bank Soal Masih Kosong</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
                Buat butir soal pertama Anda secara otomatis dengan bantuan AI Generator atau tambahkan secara manual.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAIModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                  <span>Generate AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(true)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tambah Manual</span>
                </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Tambah Butir Soal Manual</h3>
                <p className="text-xs text-slate-500">Rancang butir soal PG atau esai langsung ke bank soal ini</p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                title="Tutup modal"
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-mono font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
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
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none leading-relaxed"
                />
              </div>

              {/* Multiple Choice Options */}
              {manualForm.question_type === 'multiple_choice' ? (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
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
                        className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10"
                      >
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            value={opt.id}
                            checked={manualForm.correct_answer === opt.id}
                            onChange={(e) => setManualForm({ ...manualForm, correct_answer: e.target.value })}
                            name="manual_correct_opt"
                            aria-label={`Jadikan opsi ${opt.id} sebagai kunci jawaban`}
                            className="w-4 h-4 text-slate-900"
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
                          className="flex-1 px-2.5 py-1 text-xs border-0 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Essay Rubric Note */
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900 text-[11px] leading-relaxed">
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 cursor-pointer shadow-xs transition-colors focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
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
