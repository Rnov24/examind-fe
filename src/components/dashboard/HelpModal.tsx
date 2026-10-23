'use client'

import React, { useEffect } from 'react'
import {
  X,
  BookOpen,
  FileSpreadsheet,
  Video,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { EMIL_EASE } from '@/components/system/PageTransition'
import { tokens } from '@/components/system/tokens'
import { useAuthStore } from '@/stores/authStore'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

const GUIDE_ITEMS = [
  {
    icon: BookOpen,
    title: 'Bank Soal',
    body: 'Susun dan kelola butir soal pilihan ganda maupun esai dari menu Bank Soal.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Jadwal Ujian',
    body: 'Buat sesi ujian, atur kelas peserta, durasi, dan tingkat pengawasan dari menu Jadwal Ujian.',
  },
  {
    icon: Video,
    title: 'Monitor Proctoring',
    body: 'Pantau peserta secara langsung dan tinjau catatan pelanggaran integritas selama ujian berlangsung.',
  },
  {
    icon: CheckCircle2,
    title: 'Koreksi Esai AI',
    body: 'Jawaban esai dinilai dengan bantuan AI dan tetap dapat ditinjau ulang oleh guru sebelum nilai final diterbitkan.',
  },
  {
    icon: BarChart3,
    title: 'Rekap & Analisis Nilai',
    body: 'Lihat rekap nilai, distribusi skor, dan analisis butir soal setelah ujian selesai.',
  },
]

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { user } = useAuthStore()
  const whatsapp = process.env.NEXT_PUBLIC_CS_WHATSAPP

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const isStaff = user?.role === 'superadmin' || user?.role === 'admin'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 px-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Bantuan dan Panduan EXAMIND"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <motion.div
            className={cn(
              'bg-white border border-slate-200 w-full max-w-lg p-5 space-y-4 max-h-[80vh] overflow-y-auto',
              tokens.radius.xl,
              tokens.shadow.modal
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EMIL_EASE }}
          >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-9 h-9 bg-[#150f23] text-[#c2ef4e] flex items-center justify-center shrink-0',
                tokens.radius.full
              )}
            >
              <LifeBuoy className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-slate-900">
                Bantuan &amp; Panduan
              </h2>
              <p className="text-[11px] text-slate-500">
                EXAMIND CBT — Platform Ujian Berbasis Komputer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Tutup bantuan"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2.5">
          {GUIDE_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className={cn('flex gap-3 p-3 bg-slate-50/80', tokens.radius.lg)}
              >
                <Icon className="w-4 h-4 text-[#6a5fc1] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.body}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className={cn('p-3 border border-slate-100 space-y-2', tokens.radius.lg)}>
          <p className="text-xs font-bold text-slate-900">Masih butuh bantuan?</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isStaff
              ? 'Untuk kendala teknis platform, hubungi tim dukungan EXAMIND pada jam kerja Senin–Jumat pukul 08.00–17.00 WIB.'
              : 'Untuk kendala akun, jadwal, atau nilai, silakan hubungi guru pengampu atau admin sekolah Anda.'}
          </p>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 bg-[#150f23] text-white text-xs font-bold hover:bg-slate-800 transition-colors',
                tokens.radius.full
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
              <span>Hubungi via WhatsApp</span>
            </a>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HelpModal
