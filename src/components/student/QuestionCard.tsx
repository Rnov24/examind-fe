'use client'

import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Check,
  CheckCircle2,
  HelpCircle,
  FileText,
  PenTool,
} from 'lucide-react'

interface Option {
  id: string
  text: string
}

interface Question {
  id: number
  question_type: string
  prompt: string
  points?: number
  options_json?: Option[]
}

interface QuestionCardProps {
  question: Question | null
  currentIndex: number
  totalQuestions: number
  isDoubt: boolean
  currentAnswer?: string
  essayValue?: string
  onSelectOption: (optId: string) => void
  onUpdateEssayValue: (val: string) => void
  onToggleDoubt: () => void
  onPrev: () => void
  onNext: () => void
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  isDoubt,
  currentAnswer,
  essayValue,
  onSelectOption,
  onUpdateEssayValue,
  onToggleDoubt,
  onPrev,
  onNext,
}: QuestionCardProps) {
  if (!question) return null

  const isMultipleChoice = question.question_type === 'multiple_choice'
  const isAnswered = isMultipleChoice
    ? Boolean(currentAnswer && currentAnswer.trim() !== '')
    : Boolean(essayValue && essayValue.trim() !== '')

  const essayLength = (essayValue || '').length
  const essayWords = essayValue && essayValue.trim() ? essayValue.trim().split(/\s+/).length : 0

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col justify-between overflow-hidden relative min-h-[580px]">
      {/* Top state hairline indicator */}
      <div
        className={`h-1.5 w-full transition-colors duration-200 ${
          isDoubt
            ? 'bg-amber-500'
            : isAnswered
            ? 'bg-emerald-500'
            : 'bg-slate-300'
        }`}
      />

      {/* Question Header */}
      <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase font-mono shadow-xs tracking-wide">
            Soal No. {currentIndex + 1}{' '}
            <span className="text-slate-400 font-normal">/ {totalQuestions}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold font-mono shadow-2xs">
            {isMultipleChoice ? 'Pilihan Ganda' : 'Lembar Esai'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold font-mono shadow-2xs">
            Bobot:{' '}
            <strong className="text-slate-900 font-bold">{question.points ?? 10}</strong> Poin
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Question State Badge */}
          {isDoubt ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
              <Flag className="w-3.5 h-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
              <span>Ragu-ragu</span>
            </span>
          ) : isAnswered ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Sudah Terjawab</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium font-mono flex items-center gap-1.5 shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Belum Dijawab</span>
            </span>
          )}

          {/* Ragu-ragu Flag Toggle Button */}
          <button
            type="button"
            onClick={onToggleDoubt}
            aria-pressed={isDoubt}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs select-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
              isDoubt
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 font-bold'
                : 'bg-white hover:bg-amber-50/80 text-slate-700 hover:text-amber-900 border-slate-300 hover:border-amber-300'
            }`}
          >
            <Flag
              className={`w-3.5 h-3.5 ${isDoubt ? 'fill-white text-white' : 'text-slate-500'}`}
              aria-hidden="true"
            />
            <span>Tandai Ragu</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Question Prompt Paper Surface */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 sm:p-7 relative shadow-inner-soft">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Naskah Soal</span>
            </div>
            <p className="text-base sm:text-lg text-slate-900 font-normal leading-relaxed whitespace-pre-line font-sans">
              {question.prompt}
            </p>
          </div>

          {/* Options (Multiple Choice) or Essay Area */}
          {isMultipleChoice ? (
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 font-mono mb-2">
                Pilih Salah Satu Jawaban:
              </label>
              {(question.options_json || []).map((opt) => {
                const isSelected = currentAnswer === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => onSelectOption(opt.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectOption(opt.id)
                      }
                    }}
                    className={`flex items-start justify-between gap-4 p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-card-hover -translate-y-0.5'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-all font-mono ${
                          isSelected
                            ? 'bg-[#c2ef4e] text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200 group-hover:text-slate-900'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <div
                        className={`text-sm sm:text-base font-medium pt-1.5 leading-snug ${
                          isSelected ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {opt.text}
                      </div>
                    </div>

                    <div className="pt-2 shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#c2ef4e] text-slate-950 flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Essay Writing Area */
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <PenTool className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Lembar Jawaban Esai:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                    {essayLength} Karakter
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                    ~{essayWords} Kata
                  </span>
                </div>
              </div>

              <textarea
                value={essayValue || ''}
                onChange={(e) => onUpdateEssayValue(e.target.value)}
                rows={9}
                placeholder="Tuliskan argumen, analisis, dan penjelasan konsep Anda secara runtut dan komprehensif..."
                className="w-full bg-white border border-slate-300 rounded-2xl p-5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-sans leading-relaxed resize-y shadow-xs"
              />
              <p className="text-[11px] text-slate-400 font-mono">
                Autosave aktif: jawaban tersimpan secara berkala ke penyimpanan lokal dan sinkronisasi server.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Strip */}
      <div className="p-4 sm:p-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>

        <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
          Navigasi Butir Soal {currentIndex + 1} dari {totalQuestions}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer font-mono disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-900/10 group"
        >
          <span>Selanjutnya</span>
          <ChevronRight
            className="w-4 h-4 text-[#c2ef4e] group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  )
}
