'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Smartphone, X, Check, Copy, ShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface CompanionQrModalProps {
  isOpen: boolean
  companionUrl: string
  sessionId?: number
  isCompanionPaired: boolean
  onClose: () => void
}

export default function CompanionQrModal({
  isOpen,
  companionUrl,
  sessionId,
  isCompanionPaired,
  onClose,
}: CompanionQrModalProps) {
  const [copied, setCopied] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  function copyUrl() {
    navigator.clipboard.writeText(companionUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="companion-modal-title"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#150f23] text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                Dual-Cam AI
              </span>
              <h3 id="companion-modal-title" className="text-sm font-bold text-slate-900 font-display mt-0.5">
                Kamera HP (Cam 2)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed text-left">
          Pindai QR code ini menggunakan smartphone untuk memantau lingkungan sekitar dari sudut samping/belakang meja:
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-center mx-auto shadow-inner w-fit">
          <QRCodeSVG value={companionUrl} size={180} level="M" />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-left space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Sesi ID:</span>
            <span className="font-bold text-slate-900">#{sessionId || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Status Cam 2:</span>
            <span
              className={`font-semibold flex items-center gap-1.5 ${
                isCompanionPaired ? 'text-emerald-700 font-bold' : 'text-amber-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCompanionPaired ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isCompanionPaired ? 'Terhubung (Aktif)' : 'Menunggu Pindai...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={copyUrl}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors border border-slate-200 shadow-xs cursor-pointer flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Tautan Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md cursor-pointer font-display focus:ring-2 focus:ring-[#6a5fc1]/30 focus:outline-none"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
