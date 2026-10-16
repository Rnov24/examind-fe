'use client'

import React from 'react'

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Kumpulkan Lembar Ujian?</h3>
        <div className="text-xs text-slate-600 leading-relaxed">
          Anda telah menjawab{' '}
          <span className="text-slate-900 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {answeredCount}
          </span>{' '}
          dari <span className="text-slate-900 font-mono font-bold">{totalQuestions}</span> butir soal.
          {answeredCount < totalQuestions && (
            <span className="text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg font-semibold mt-2.5 block text-xs">
              Perhatian: Masih ada butir soal yang belum Anda jawab!
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Kembali Mengerjakan
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-mono"
          >
            {isSubmitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan Sekarang'}
          </button>
        </div>
      </div>
    </div>
  )
}
