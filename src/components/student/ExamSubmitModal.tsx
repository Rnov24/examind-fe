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
}

export default function ExamSubmitModal({
  isOpen,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onClose,
  onConfirm,
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

  const isComplete = answeredCount >= totalQuestions

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
      className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isComplete
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Konfirmasi Pengumpulan
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display tracking-tight mt-0.5">
              Kumpulkan Lembar Ujian?
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono flex items-center justify-between text-xs">
            <span className="text-slate-600">Progres Jawaban:</span>
            <span className="font-bold text-slate-900">
              <span className="text-emerald-700">{answeredCount}</span> dari {totalQuestions} Soal
            </span>
          </div>

          {!isComplete && (
            <div className="flex items-start gap-2.5 text-amber-900 bg-amber-50 border border-amber-200/90 p-3 rounded-xl font-medium text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Perhatian:</strong> Masih terdapat{' '}
                <strong className="underline">{totalQuestions - answeredCount} butir soal</strong> yang belum Anda jawab. Jawaban yang belum terisi akan memperoleh nilai 0.
              </span>
            </div>
          )}

          <p className="text-[11px] text-slate-500">
            Setelah dikumpulkan, sesi ujian akan langsung diakhiri dan lembar jawaban akan diproses oleh mesin penilaian otomatis.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            Kembali Mengerjakan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#150f23] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer font-display flex items-center gap-2 focus:ring-2 focus:ring-[#6a5fc1]/30 focus:outline-none"
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
