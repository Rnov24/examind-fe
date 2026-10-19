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
  Save,
  Keyboard,
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
  syncStatus?: 'saved_local' | 'syncing' | 'synced' | 'offline'
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
  syncStatus = 'synced',
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
    <article
      key={question.id}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col justify-between overflow-hidden relative min-h-[580px] transition-all duration-150 animate-in fade-in duration-150"
      aria-label={`Butir Soal Nomor ${currentIndex + 1} dari ${totalQuestions}`}
    >
      {/* Top state hairline indicator */}
      <div
        className={`h-1.5 w-full transition-colors duration-200 ${
          isDoubt && isAnswered
            ? 'bg-amber-500'
            : isDoubt
            ? 'bg-amber-400'
            : isAnswered
            ? 'bg-emerald-500'
            : 'bg-slate-200'
        }`}
      />

      {/* Question Header */}
      <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-xl bg-[#150f23] text-white font-bold text-xs uppercase font-mono shadow-xs tracking-wide flex items-center gap-1.5">
            <span>Soal No. {currentIndex + 1}</span>
            <span className="text-slate-400 font-normal">/ {totalQuestions}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold font-mono shadow-2xs">
            {isMultipleChoice ? 'Pilihan Ganda' : 'Lembar Esai'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold font-mono shadow-2xs">
            Bobot: <strong className="text-slate-900 font-bold">{question.points ?? 10}</strong> Poin
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Question State Badge: Unmistakable 4 states */}
          {isDoubt && isAnswered ? (
            <span
              className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs"
              title="Soal ini sudah Anda jawab, namun ditandai ragu-ragu"
            >
              <Flag className="w-3.5 h-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
              <span>Ragu (Terjawab)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
            </span>
          ) : isDoubt ? (
            <span
              className="px-3 py-1.5 rounded-xl bg-amber-50/80 border border-dashed border-amber-400 text-amber-900 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs"
              title="Soal ini belum Anda jawab dan ditandai ragu-ragu"
            >
              <Flag className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Ragu (Kosong)</span>
            </span>
          ) : isAnswered ? (
            <span
              className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs"
              title="Jawaban Anda sudah tersimpan dengan aman"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Sudah Terjawab</span>
            </span>
          ) : (
            <span
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium font-mono flex items-center gap-1.5 shadow-2xs"
              title="Soal belum memiliki jawaban"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Belum Dijawab</span>
            </span>
          )}

          {/* Ragu-ragu Flag Toggle Button */}
          <button
            type="button"
            onClick={onToggleDoubt}
            aria-pressed={isDoubt}
            title={isDoubt ? 'Batalkan tanda ragu-ragu (Shortcut: R)' : 'Tandai soal ini sebagai ragu-ragu (Shortcut: R)'}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 active:scale-95 ${
              isDoubt
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 font-bold'
                : 'bg-white hover:bg-amber-50/80 text-slate-700 hover:text-amber-900 border-slate-300 hover:border-amber-300'
            }`}
          >
            <Flag
              className={`w-3.5 h-3.5 ${isDoubt ? 'fill-white text-white' : 'text-slate-500'}`}
              aria-hidden="true"
            />
            <span>{isDoubt ? 'Ditandai Ragu' : 'Tandai Ragu'}</span>
            <kbd className={`hidden sm:inline-block text-[10px] px-1 py-0.2 rounded font-mono border ${isDoubt ? 'bg-amber-600 text-amber-100 border-amber-400' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              R
            </kbd>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Question Prompt Paper Surface */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 sm:p-7 relative shadow-inner-soft">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Naskah Soal</span>
              </div>
              <span className="text-slate-400 font-normal lowercase text-[10px]">
                {question.points ?? 10} poin maksimal
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-900 font-normal leading-relaxed whitespace-pre-line font-sans select-text">
              {question.prompt}
            </p>
          </div>

          {/* Options (Multiple Choice) or Essay Area */}
          {isMultipleChoice ? (
            <div
              className="space-y-3 pt-1"
              role="radiogroup"
              aria-label={`Pilihan jawaban soal nomor ${currentIndex + 1}`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                  Pilih Salah Satu Jawaban:
                </label>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-flex items-center gap-1">
                  <Keyboard className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>Tekan A–E atau 1–5</span>
                </span>
              </div>

              {(question.options_json || []).map((opt, optIndex) => {
                const isSelected = currentAnswer === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => onSelectOption(opt.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    aria-label={`Opsi ${opt.id}: ${opt.text}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectOption(opt.id)
                      }
                    }}
                    className={`flex items-start justify-between gap-4 p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#150f23] focus-visible:ring-offset-2 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-[#150f23] border-[#150f23] text-white shadow-card-hover -translate-y-0.5'
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
                        className={`text-sm sm:text-base font-medium pt-1.5 leading-snug select-text ${
                          isSelected ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {opt.text}
                      </div>
                    </div>

                    <div className="pt-2 shrink-0 flex items-center gap-2">
                      <span className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                        isSelected
                          ? 'border-white/20 text-slate-300 bg-white/10'
                          : 'border-slate-200 text-slate-400 bg-slate-50 group-hover:border-slate-300'
                      }`}>
                        {optIndex + 1}
                      </span>
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
                aria-label={`Lembar jawaban esai nomor ${currentIndex + 1}`}
                placeholder="Tuliskan argumen, analisis, dan penjelasan konsep Anda secara runtut dan komprehensif..."
                className="w-full bg-white border border-slate-300 rounded-2xl p-5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#150f23] focus:ring-2 focus:ring-[#150f23]/10 transition-all font-sans leading-relaxed resize-y shadow-xs"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Autosave otomatis aktif pada memori lokal dan sinkronisasi berkala.</span>
                </span>
                <span className="text-slate-400">Tekan Tab untuk berpindah navigasi</span>
              </div>
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
          title="Ke butir soal sebelumnya (Shortcut: ← atau P)"
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#150f23] font-mono active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Sebelumnya</span>
          <kbd className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
            ←
          </kbd>
        </button>

        {/* Center Autosave & Status Cue */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-emerald-500'
                : syncStatus === 'offline'
                ? 'bg-rose-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {syncStatus === 'synced'
              ? 'Tersinkron'
              : syncStatus === 'offline'
              ? 'Tersimpan Offline'
              : 'Menyimpan...'}
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="font-semibold text-slate-700">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1}
          title="Ke butir soal selanjutnya (Shortcut: → atau N)"
          className="px-6 py-2.5 rounded-xl bg-[#150f23] hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer font-mono disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5fc1] group active:scale-95"
        >
          <span>Selanjutnya</span>
          <kbd className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded border border-slate-700">
            →
          </kbd>
          <ChevronRight
            className="w-4 h-4 text-[#c2ef4e] group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  )
}
