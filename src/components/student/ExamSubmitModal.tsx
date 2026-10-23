'use client'

import React, { useEffect, useRef } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Send } from 'lucide-react'

interface ExamSubmitModalProps {
  isOpen: boolean
  answeredCount: number
  totalQuestions: number
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
  doubtCount?: number
}

export default function ExamSubmitModal({
  isOpen,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onClose,
  onConfirm,
  doubtCount = 0,
}: ExamSubmitModalProps) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting])

  if (!isOpen) return null

  const unansweredCount = Math.max(0, totalQuestions - answeredCount)
  const isComplete = unansweredCount === 0

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
      className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-submit-title"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isComplete && doubtCount === 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isComplete && doubtCount === 0 ? (
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Konfirmasi Pengumpulan
            </span>
            <h3 id="exam-submit-title" className="text-base sm:text-lg font-extrabold text-slate-900 font-display tracking-tight mt-0.5">
              Kumpulkan Lembar Ujian?
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed space-y-3">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[10px] text-emerald-800 font-semibold block">Terjawab</span>
              <span className="text-base font-extrabold text-emerald-950">{answeredCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-[10px] text-amber-800 font-semibold block">Ragu-ragu</span>
              <span className="text-base font-extrabold text-amber-950">{doubtCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-600 font-semibold block">Belum Diisi</span>
              <span className={`text-base font-extrabold ${unansweredCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {unansweredCount}
              </span>
            </div>
          </div>

          {!isComplete && (
            <div className="flex items-start gap-2.5 text-rose-900 bg-rose-50/80 border border-rose-200/90 p-3 rounded-xl font-medium text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Perhatian:</strong> Masih terdapat{' '}
                <strong className="underline">{unansweredCount} butir soal</strong> yang belum Anda jawab. Butir soal yang kosong akan bernilai 0.
              </span>
            </div>
          )}

          {doubtCount > 0 && (
            <div className="flex items-start gap-2.5 text-amber-900 bg-amber-50/80 border border-amber-200/90 p-3 rounded-xl font-medium text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Terdapat <strong>{doubtCount} butir soal</strong> yang masih bertanda ragu-ragu. Pilihan jawaban Anda yang sudah tersimpan tetap akan dinilai.
              </span>
            </div>
          )}

          <p className="text-[11px] text-slate-500">
            Setelah dikumpulkan, sesi ujian berakhir permanen dan lembar jawaban Anda segera diproses oleh sistem.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none flex items-center justify-center"
          >
            Kembali Mengerjakan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-display flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#6a5fc1]/30 focus:outline-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" aria-hidden="true" />
                <span>Mengumpulkan...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                <span>Ya, Kumpulkan Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
