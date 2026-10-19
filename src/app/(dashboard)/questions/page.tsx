'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  BookOpen,
  Sparkles,
  Search,
  ArrowRight,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  FileQuestion,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react'
import api from '@/lib/api'
import AIGeneratorModal from '@/components/questions/AIGeneratorModal'

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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'questions' | 'alpha'>('newest')

  // AI Generator Modal from Bank List
  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedBankForAI, setSelectedBankForAI] = useState<QuestionBank | null>(null)

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

  // Extract unique subjects for filtering
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>()
    banks.forEach((b) => {
      if (b.subject) subjects.add(b.subject)
    })
    return Array.from(subjects)
  }, [banks])

  // Filtered and sorted banks
  const filteredBanks = useMemo(() => {
    return banks
      .filter((b) => {
        const matchesSearch =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())

        const matchesSubject = selectedSubject === 'all' || b.subject === selectedSubject

        return matchesSearch && matchesSubject
      })
      .sort((a, b) => {
        if (sortBy === 'questions') {
          return (b.questions_count || 0) - (a.questions_count || 0)
        }
        if (sortBy === 'alpha') {
          return a.title.localeCompare(b.title)
        }
        return b.id - a.id
      })
  }, [banks, searchQuery, selectedSubject, sortBy])

  function handleOpenAIStudio() {
    if (banks.length === 0) {
      setShowCreateModal(true)
    } else {
      setSelectedBankForAI(banks[0])
      setShowAIModal(true)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-[#c2ef4e] px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
              Repository Kurikulum
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total {banks.length} Bank Terdaftar
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight truncate">
            Master Bank Soal & AI Generator
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola kumpulan butir soal per mata pelajaran dengan rubrik evaluasi dan generator cerdas.
          </p>
        </div>

        {/* Action Header: Primary & AI Shortcut */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleOpenAIStudio}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/20 focus:outline-none"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>AI Studio</span>
          </button>
          <button
            onClick={() => {
              setCreateError(null)
              setShowCreateModal(true)
            }}
            className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Buat Bank Soal</span>
          </button>
        </div>
      </div>

      {/* Prominent AI Generator Spotlight Card */}
      <div className="bg-gradient-to-r from-[#150f23] via-[#1c1430] to-[#241a3e] rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md text-[11px] font-bold text-[#c2ef4e] font-mono border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
            <span>AI Question Generator Studio</span>
          </div>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight">
            Buat Butir Soal & Rubrik Otomatis dari Silabus
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hasilkan draf soal pilihan ganda berdistraktor pedagogis atau soal esai bertingkat dengan matriks Rubrik 4 Dimensi langsung ke dalam bank soal Anda.
          </p>
        </div>

        <div className="relative z-10 shrink-0 w-full md:w-auto">
          <button
            onClick={handleOpenAIStudio}
            className="w-full md:w-auto min-h-[44px] px-5 py-3 rounded-xl bg-[#c2ef4e] hover:bg-[#b0dc3d] text-slate-950 font-bold text-xs shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#c2ef4e]/30 focus:outline-none"
          >
            <Sparkles className="w-4 h-4 text-slate-950" aria-hidden="true" />
            <span>Generate Soal dengan AI</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bank soal berdasarkan judul, mata pelajaran, atau deskripsi..."
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter by Subject & Sort */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {availableSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="newest">Terbaru</option>
              <option value="questions">Butir Soal Terbanyak</option>
              <option value="alpha">Abjad A-Z</option>
            </select>
          </div>
        </div>
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
          {filteredBanks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[11px] font-bold font-mono">
                    {b.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium tabular-nums flex items-center gap-1.5">
                    <FileQuestion className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{b.questions_count ?? 0} Butir Soal</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug font-display line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {b.description || 'Tidak ada deskripsi lingkup materi.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBankForAI(b)
                    setShowAIModal(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                  title="Generate soal AI untuk bank ini"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                  <span>AI Gen</span>
                </button>

                <Link
                  href={`/questions/${b.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 hover:border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  <span>Buka Bank Soal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}

          {/* Filtered Empty State */}
          {filteredBanks.length === 0 && banks.length > 0 && (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tidak Ditemukan Bank Soal yang Sesuai</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada bank soal yang cocok dengan filter pencarian Anda. Coba sesuaikan kata kunci atau pilih semua mata pelajaran.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSubject('all')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Pencarian</span>
              </button>
            </div>
          )}

          {/* Total Empty State with Action Guidance */}
          {banks.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-200/80 shadow-card space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" aria-hidden="true" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-slate-900 text-base font-display">
                  Belum Ada Master Bank Soal
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bank soal adalah pusat penyimpanan butir soal pedagogis Anda. Mulai dengan membuat bank baru atau gunakan generator cerdas AI untuk menyusun soal secara instan.
                </p>
              </div>

              {/* 3-Step Guided Action */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <p className="text-xs font-bold text-slate-900">Buat Bank Soal</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Tentukan nama mapel dan cakupan materi silabus.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <p className="text-xs font-bold text-slate-900">Isi dengan AI / Manual</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Generate butir otomatis atau ketik pilihan ganda & esai.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <p className="text-xs font-bold text-slate-900">Pasang di Ujian</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Pilih butir soal untuk dimasukkan ke paket ujian kelas.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all cursor-pointer font-display focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                >
                  <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                  <span>Buat Bank Soal Pertama</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Bank Modal */}
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

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white border border-slate-200 cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-slate-900/10 focus:outline-none font-display tracking-wide"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>{loading ? 'Menyimpan...' : 'Simpan Bank Soal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generator Modal from Bank List */}
      {selectedBankForAI && (
        <AIGeneratorModal
          isOpen={showAIModal}
          bankId={selectedBankForAI.id}
          subject={selectedBankForAI.subject}
          onClose={() => {
            setShowAIModal(false)
            setSelectedBankForAI(null)
          }}
          onSaved={() => {
            loadBanks()
          }}
        />
      )}
    </div>
  )
}
