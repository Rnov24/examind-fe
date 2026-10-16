'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, X, Loader2 } from 'lucide-react'
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
  const [isFetching, setIsFetching] = useState(true)

  async function loadBanks() {
    setIsFetching(true)
    try {
      const res = await api.get('/questions/banks')
      setBanks(res.data.data || [])
    } catch (err) {
      console.error('Failed to load question banks:', err)
    } finally {
      setIsFetching(false)
    }
  }

  async function handleCreateBank(e: React.FormEvent) {
    e.preventDefault()
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
      alert(err.response?.data?.message || 'Gagal membuat bank soal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanks()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bank Soal & AI Generator</h2>
          <p className="text-sm text-slate-500 font-medium">Koleksi bank butir soal per mata pelajaran dengan generator cerdas</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Bank Soal</span>
          </button>
        </div>
      </div>

      {/* Question Banks Grid */}
      {isFetching ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold font-mono">
                    {b.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {b.questions_count ?? 0} Butir Soal
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{b.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {b.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/questions/${b.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Buka Bank Soal</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}

          {banks.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900">Belum Ada Bank Soal</h4>
              <p className="text-xs text-slate-500 mt-1">Buat bank soal baru untuk mulai merancang butir soal PG dan esai.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Bank Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Buat Bank Soal Baru</h3>
                <p className="text-xs text-slate-500">Atur judul dan mata pelajaran untuk bank soal</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
                <input
                  value={newBankSubject}
                  onChange={(e) => setNewBankSubject(e.target.value)}
                  type="text"
                  required
                  placeholder="Contoh: Fisika, Matematika, Biologi"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Bank Soal</label>
                <input
                  value={newBankTitle}
                  onChange={(e) => setNewBankTitle(e.target.value)}
                  type="text"
                  required
                  placeholder="Contoh: Bank Soal Teori Kuantum & Relativitas"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={newBankDesc}
                  onChange={(e) => setNewBankDesc(e.target.value)}
                  rows={3}
                  placeholder="Catatan lingkup materi..."
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white border border-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
