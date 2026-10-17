'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import api from '@/lib/api'

interface QuestionBank {
  id: number
  subject: string
  title: string
  description?: string
  questions_count?: number
}

export default function QuestionBankPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBankSubject, setNewBankSubject] = useState('')
  const [newBankTitle, setNewBankTitle] = useState('')
  const [newBankDesc, setNewBankDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const subjectInputRef = useRef<HTMLInputElement | null>(null)

  const loadBanks = useCallback(async () => {
    setIsFetching(true)
    setFetchError(null)
    try {
      const res = await api.get('/questions/banks')
      setBanks(res.data.data || [])
    } catch (err: any) {
      console.error('Failed to load question banks:', err)
      setFetchError(
        err.response?.data?.message || 'Gagal memuat master bank soal. Silakan coba lagi.'
      )
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    loadBanks()
  }, [loadBanks])

  // Handle Escape key and autoFocus for Create Modal
  useEffect(() => {
    if (!showCreateModal) return

    const timer = setTimeout(() => {
      subjectInputRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showCreateModal])

  async function handleCreateBank(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setCreateError(null)
    setLoading(true)
    try {
      await api.post('/questions/banks', {
        subject: newBankSubject,
        title: newBankTitle,
        description: newBankDesc,
      })
      setShowCreateModal(false)
      setNewBankSubject('')
      setNewBankTitle('')
      setNewBankDesc('')
      await loadBanks()
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Gagal membuat bank soal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight truncate">
            Master Bank Soal & AI Generator
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola kumpulan butir soal pedagogis per mata pelajaran dengan rubrik evaluasi dan generator cerdas.
          </p>
        </div>

        {/* ONE Primary Action */}
        <button
          onClick={() => {
            setCreateError(null)
            setShowCreateModal(true)
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide shrink-0 w-full sm:w-auto focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        >
          <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
          <span>Buat Bank Soal</span>
        </button>
      </div>

      {/* Question Banks Grid */}
      {isFetching ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-card space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" aria-hidden="true" />
          <p className="text-xs font-bold text-slate-900">Memuat master bank soal...</p>
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Gagal Mengambil Bank Soal</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={loadBanks}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[11px] font-bold font-mono">
                    {b.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium tabular-nums">
                    {b.questions_count ?? 0} Butir Soal
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug font-display line-clamp-2">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {b.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/questions/${b.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  <span>Buka Bank Soal</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          ))}

          {banks.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-indigo-600" aria-hidden="true" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Belum Ada Bank Soal</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Mulai dengan membuat master bank soal baru untuk menyusun butir pilihan ganda dan esai.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              >
                <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                <span>Buat Bank Soal</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Bank Modal with Escape and Backdrop Dismiss */}
      {showCreateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Buat Bank Soal Baru</h3>
                <p className="text-xs text-slate-500">Atur judul dan mata pelajaran untuk bank soal</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-4 text-xs font-medium">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-mono">
                  Mata Pelajaran
                </label>
                <input
                  ref={subjectInputRef}
                  value={newBankSubject}
                  onChange={(e) => setNewBankSubject(e.target.value)}
                  type="text"
                  required
                  placeholder="Contoh: Fisika, Matematika, Biologi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-mono">
                  Judul Bank Soal
                </label>
                <input
                  value={newBankTitle}
                  onChange={(e) => setNewBankTitle(e.target.value)}
                  type="text"
                  required
                  placeholder="Contoh: Bank Soal Teori Kuantum & Relativitas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-mono">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={newBankDesc}
                  onChange={(e) => setNewBankDesc(e.target.value)}
                  rows={3}
                  placeholder="Catatan lingkup materi atau silabus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white border border-slate-200 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 focus:ring-2 focus:ring-slate-900/10 focus:outline-none font-display tracking-wide"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>{loading ? 'Menyimpan...' : 'Simpan Bank Soal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

