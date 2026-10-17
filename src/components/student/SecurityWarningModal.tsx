'use client'

import React from 'react'
import { ShieldAlert, AlertTriangle, Maximize, Info, LogOut } from 'lucide-react'

interface SecurityWarningModalProps {
  isOpen: boolean
  details: string
  onReEnterFullscreen: () => void
  onExitExam: () => void
}

export default function SecurityWarningModal({
  isOpen,
  details,
  onReEnterFullscreen,
  onExitExam,
}: SecurityWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border-2 border-rose-500 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm ring-4 ring-rose-50/80">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[11px] uppercase tracking-wider inline-block font-mono">
            Peringatan Pengawasan CBT
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Aktivitas Terindikasi Pelanggaran
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Sistem pengawasan mendeteksi tindakan di luar batas izin sesi ujian. Seluruh log kejadian dicatat secara realtime.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 text-xs text-left space-y-3">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider font-mono">
            Detail Log Kejadian:
          </div>
          <div className="text-rose-900 font-semibold flex items-start gap-2.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
            <span>{details || 'Keluar dari mode layar penuh atau berpindah jendela/tab aplikasi'}</span>
          </div>
          <div className="p-3 rounded-xl bg-white text-slate-600 text-[11px] leading-relaxed border border-slate-200/80 shadow-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-slate-900 font-semibold">Prinsip Human-in-the-Loop:</strong> Sistem EXAMIND tidak
              menggugurkan ujian Anda secara sepihak. Rekaman timestamp dan snapshot dikirimkan ke guru
              pengawas untuk ditinjau saat evaluasi kelulusan.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onReEnterFullscreen}
            className="flex-1 py-3 px-5 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 font-display focus:ring-2 focus:ring-[#6a5fc1]/30 focus:outline-none"
          >
            <Maximize className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Kembali ke Layar Penuh</span>
          </button>
          <button
            type="button"
            onClick={onExitExam}
            className="py-3 px-4 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Batalkan & Keluar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
