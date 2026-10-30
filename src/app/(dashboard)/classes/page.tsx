'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import api from '@/lib/api'

interface ClassItem {
  id: number
  name: string
  grade_level: string | number
  academic_year: string
  creator_name?: string
  members_count?: number
}

export default function ClassListPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newGradeLevel, setNewGradeLevel] = useState('12')
  const [newAcademicYear, setNewAcademicYear] = useState('2026/2027')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  async function loadClasses() {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.get('/classes')
      setClasses(res.data.data || [])
    } catch (e: any) {
      console.error('Failed to load classes:', e)
      setErrorMessage(
        e.response?.data?.message ||
          'Gagal memuat daftar kelas akademik. Periksa koneksi ke server database CBT.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setModalError(null)
    try {
      await api.post('/classes', {
        name: newClassName,
        grade_level: newGradeLevel,
        academic_year: newAcademicYear,
      })
      setNewClassName('')
      setShowCreateModal(false)
      await loadClasses()
    } catch (err: any) {
      console.error('Failed to create class:', err)
      setModalError(
        err.response?.data?.message ||
          'Gagal menambahkan kelas baru. Pastikan format nama kelas valid dan belum terdaftar.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (!showCreateModal) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCreateModal])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Kelas Akademik</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola rombel belajar, pendaftaran siswa, dan penugasan ujian</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={loadClasses}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Class Cards Grid */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 font-mono">
            <Loader2 className="w-4 h-4 text-violet-600 animate-spin" aria-hidden="true" />
            <span>Memuat data kelas akademik & rombel belajar...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-6 w-20 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between text-slate-900 min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded text-[11px] font-bold font-mono">
                    Tingkat {c.grade_level}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">{c.academic_year}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 truncate" title={c.name}>
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  Dibuat oleh: {c.creator_name || 'Guru Pengampu'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 min-w-0">
                  <Users className="w-4 h-4 text-violet-600 shrink-0" aria-hidden="true" />
                  <span className="font-mono truncate">{c.members_count ?? 0} Siswa Terdaftar</span>
                </div>

                <Link
                  href={`/classes/${c.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#f1effa] text-xs font-bold text-slate-700 border border-slate-300 transition-colors shadow-xs shrink-0"
                >
                  Lihat Roster →
                </Link>
              </div>
            </div>
          ))}

          {classes.length === 0 && !errorMessage && (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-dashed border-[#c9c2ec] shadow-xs flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-[#f1effa] border border-[#ddd9ef] text-[#6a5fc1] flex items-center justify-center mb-3">
                <Users className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Belum Ada Kelas Akademik</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
                Tambahkan kelas pertama Anda untuk mulai mengatur rombel belajar dan mendaftarkan siswa.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambah Kelas Baru</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Buat Kelas Akademik Baru</h3>
                <p className="text-xs text-slate-500">Tentukan nama rombel dan tahun akademik</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                title="Tutup modal"
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kelas</label>
                <input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: XII MIPA 2"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat</label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none"
                  >
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun Ajaran</label>
                  <input
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    type="text"
                    required
                    placeholder="2026/2027"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-[#6a5fc1]/40 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-[#f1effa] bg-white border border-slate-300 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#150f23] hover:bg-[#1f1633] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Kelas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
