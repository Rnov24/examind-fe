'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, X, Loader2, Save } from 'lucide-react'
import api from '@/lib/api'

interface Option {
  id: string
  text: string
  rationale?: string
}

interface McqQuestion {
  prompt: string
  bloom_level?: string
  options: Option[]
  correct_option_id: string
  explanation?: string
  difficulty?: string
  points: number
}

interface RefPoint {
  id: string
  statement: string
  weight: number
}

interface EssayRubric {
  dimension_1_concept?: { criteria: string }
  dimension_2_argument?: { criteria: string }
  dimension_3_terminology?: { criteria: string }
  dimension_4_clarity?: { criteria: string }
  ref_points?: RefPoint[]
}

interface EssayQuestion {
  prompt: string
  ideal_answer?: string
  sample_answer?: string
  rubric?: EssayRubric
  ref_points?: RefPoint[]
  explanation?: string
  difficulty?: string
  points: number
}

interface GeneratedData {
  mcq_questions: McqQuestion[]
  essay_questions: EssayQuestion[]
}

interface AIGeneratorModalProps {
  bankId: number
  subject: string
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AIGeneratorModal({
  bankId,
  subject,
  isOpen,
  onClose,
  onSaved,
}: AIGeneratorModalProps) {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [topicContent, setTopicContent] = useState('')
  const [mcqCount, setMcqCount] = useState(3)
  const [essayCount, setEssayCount] = useState(1)
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiApiKey(localStorage.getItem('examind_gemini_key') || '')
    }
  }, [])

  function handleApiKeyChange(val: string) {
    setGeminiApiKey(val)
    if (typeof window !== 'undefined') {
      if (val.trim()) {
        localStorage.setItem('examind_gemini_key', val.trim())
      } else {
        localStorage.removeItem('examind_gemini_key')
      }
    }
  }

  async function handleGenerate() {
    setErrorMessage(null)
    if (!topicContent.trim()) {
      setErrorMessage('Silakan masukkan topik atau ringkasan materi terlebih dahulu.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/ai/generate-questions', {
        subject: subject || 'Umum',
        topic_content: topicContent,
        grade_level: '12',
        mcq_count: mcqCount,
        essay_count: essayCount,
        difficulty: difficulty,
        api_key: geminiApiKey ? geminiApiKey.trim() : undefined,
      })
      setGeneratedData(res.data.data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal menghasilkan soal dengan AI.'
      setErrorMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleSaveAllToBank() {
    if (!generatedData) return
    setSaving(true)
    setErrorMessage(null)

    try {
      // Save MCQs
      for (const mcq of generatedData.mcq_questions) {
        await api.post(`/questions/banks/${bankId}/items`, {
          question_type: 'multiple_choice',
          prompt: mcq.prompt,
          options_json: mcq.options,
          correct_answer: mcq.correct_option_id,
          explanation: mcq.explanation,
          difficulty: mcq.difficulty,
          default_points: mcq.points,
        })
      }

      // Save Essays
      for (const essay of generatedData.essay_questions) {
        await api.post(`/questions/banks/${bankId}/items`, {
          question_type: 'long_essay',
          prompt: essay.prompt,
          correct_answer: essay.ideal_answer,
          rubric_json: essay.rubric,
          explanation: essay.explanation,
          difficulty: essay.difficulty,
          default_points: essay.points,
        })
      }

      onSaved()
      onClose()
    } catch (err: any) {
      console.error('Failed to save generated questions:', err)
      setErrorMessage(
        err.response?.data?.message ||
          'Gagal menyimpan butir soal ke bank soal. Periksa koneksi ke server.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">AI Question Generator Studio</h3>
              <p className="text-xs text-slate-500">Generate draft soal PG & Esai lengkap dengan analisis distractor & rubrik 4D</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal pembuatan soal AI"
            title="Tutup modal pembuatan soal AI"
            className="p-2 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Step 1: Input Prompt / Topic */}
        {!generatedData ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">
                Topik atau Ringkasan Materi Pembelajaran
              </label>
              <textarea
                value={topicContent}
                onChange={(e) => setTopicContent(e.target.value)}
                rows={4}
                placeholder="Ketik topik materi secara spesifik, contoh: Teori Kuantum Planck, Efek Fotolistrik Einstein, dan spektrum garis atom hidrogen..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Jumlah Soal PG</label>
                <input
                  value={mcqCount}
                  onChange={(e) => setMcqCount(Number(e.target.value))}
                  type="number"
                  min={1}
                  max={20}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Jumlah Soal Esai</label>
                <input
                  value={essayCount}
                  onChange={(e) => setEssayCount(Number(e.target.value))}
                  type="number"
                  min={0}
                  max={10}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Tingkat Kesukaran</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                >
                  <option value="easy">Mudah (C1-C2)</option>
                  <option value="medium">Sedang (C3-C4)</option>
                  <option value="hard">Sukar (C4-C5)</option>
                </select>
              </div>
            </div>

            {/* Google Gemini Provider & API Key */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-900">AI Provider: Google Gemini</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    geminiApiKey
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {geminiApiKey ? '● Gemini Live Online' : '● Mode Cerdas (Tanpa Key)'}
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Google Gemini API Key (Opsional)
                </label>
                <input
                  value={geminiApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  type="password"
                  placeholder="Masukkan Google Gemini API Key (AIzaSy...)"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Dapatkan API Key gratis di{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline font-semibold"
                  >
                    Google AI Studio
                  </a>
                  . Kunci akan tersimpan aman di browser Anda.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading || !topicContent}
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                )}
                <span>{loading ? 'AI Sedang Memproses...' : 'Generate Soal dengan AI'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Curation & Review Results */
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <span>
                AI berhasil menghasilkan {generatedData.mcq_questions.length} Pilihan Ganda &{' '}
                {generatedData.essay_questions.length} Esai.
              </span>
              <button
                onClick={() => setGeneratedData(null)}
                className="underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Ubah Parameter
              </button>
            </div>

            {/* MCQs Preview */}
            {generatedData.mcq_questions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Pilihan Ganda ({generatedData.mcq_questions.length} Butir)
                </h4>
                {generatedData.mcq_questions.map((mcq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        {idx + 1}. {mcq.prompt}
                      </p>
                      {mcq.bloom_level && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-black uppercase font-mono">
                          {mcq.bloom_level}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 pl-2">
                      {mcq.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg text-xs flex items-start gap-2 border ${
                            opt.id === mcq.correct_option_id
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold w-4 font-mono">{opt.id}.</span>
                          <div className="flex-1">
                            <span>{opt.text}</span>
                            {opt.rationale && (
                              <p className="text-[11px] text-slate-500 font-normal mt-0.5 italic">
                                {opt.id === mcq.correct_option_id ? '✓ Alasan Kunci:' : '✗ Pengecoh:'}{' '}
                                {opt.rationale}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Essays Preview */}
            {generatedData.essay_questions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Esai Berbobot ({generatedData.essay_questions.length} Butir)
                </h4>
                {generatedData.essay_questions.map((essay, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-sm font-bold text-slate-900">
                      {idx + 1}. {essay.prompt}
                    </p>
                    {/* Respan Atomic Reference Criteria or Legacy 4D Rubric */}
                    {essay.rubric?.ref_points && essay.rubric.ref_points.length > 0 ? (
                      <div className="p-3 bg-white rounded-lg border border-indigo-200/80 text-xs text-slate-700 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-900 font-mono">
                            Kriteria Acuan Respan Decision Model:
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                            0 Output Tokens • Deterministic
                          </span>
                        </div>
                        <div className="space-y-1">
                          {essay.rubric.ref_points.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2 text-[11px]">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700 shrink-0">
                                Poin {pIdx + 1} ({Math.round(pt.weight * 100)}%)
                              </span>
                              <span className="text-slate-800">{pt.statement}</span>
                            </div>
                          ))}
                        </div>
                        {essay.ideal_answer && (
                          <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-600">
                            <strong className="text-slate-900 font-semibold">Jawaban Acuan:</strong>{' '}
                            {essay.ideal_answer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1 shadow-xs">
                        <p className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono">
                          Matriks Rubrik 4 Dimensi:
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                          <li>
                            <strong className="font-semibold text-slate-900">Konsep (40%):</strong>{' '}
                            {essay.rubric?.dimension_1_concept?.criteria}
                          </li>
                          <li>
                            <strong className="font-semibold text-slate-900">Argumen (30%):</strong>{' '}
                            {essay.rubric?.dimension_2_argument?.criteria}
                          </li>
                          <li>
                            <strong className="font-semibold text-slate-900">Terminologi (15%):</strong>{' '}
                            {essay.rubric?.dimension_3_terminology?.criteria}
                          </li>
                          <li>
                            <strong className="font-semibold text-slate-900">Kejelasan (15%):</strong>{' '}
                            {essay.rubric?.dimension_4_clarity?.criteria}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAllToBank}
                className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span>{saving ? 'Menyimpan ke Bank...' : 'Simpan Semua Butir ke Bank Soal'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
