'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, X, Loader2 } from 'lucide-react'
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

  async function loadClasses() {
    setIsLoading(true)
    try {
      const res = await api.get('/academic/classes')
      setClasses(res.data.data || [])
    } catch {
      try {
        const res = await api.get('/classes')
        setClasses(res.data.data || [])
      } catch (e) {
        console.error('Failed to load classes:', e)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      try {
        await api.post('/academic/classes', {
          name: newClassName,
          grade_level: newGradeLevel,
          academic_year: newAcademicYear,
        })
      } catch {
        await api.post('/classes', {
          name: newClassName,
          grade_level: newGradeLevel,
          academic_year: newAcademicYear,
        })
      }
      setNewClassName('')
      setShowCreateModal(false)
      await loadClasses()
    } catch (err) {
      console.error('Failed to create class:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Kelas Akademik</h2>
          <p className="text-sm text-slate-500 font-medium">Kelola rombel belajar, pendaftaran siswa, dan penugasan ujian</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between text-slate-900"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold font-mono">
                    Tingkat {c.grade_level}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">{c.academic_year}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Dibuat oleh: {c.creator_name || 'Guru'}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono">{c.members_count ?? 0} Siswa Terdaftar</span>
                </div>

                <Link
                  href={`/classes/${c.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-300 transition-colors shadow-xs"
                >
                  Lihat Roster →
                </Link>
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900">Belum Ada Kelas</h4>
              <p className="text-xs text-slate-500 mt-1">Tambahkan kelas pertama Anda untuk memulai pendaftaran siswa.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Buat Kelas Akademik Baru</h3>
                <p className="text-xs text-slate-500">Tentukan nama rombel dan tahun akademik</p>
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

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kelas</label>
                <input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  type="text"
                  required
                  placeholder="Contoh: XII MIPA 2"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat</label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white border border-slate-300 cursor-pointer shadow-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
