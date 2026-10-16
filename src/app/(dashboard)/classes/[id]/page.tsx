'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, X, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface Member {
  id: number
  user_id: number
  role: string
  user?: {
    id: number
    identifier: string
    full_name: string
    email: string
  }
}

interface ClassDetail {
  id: number
  name: string
  grade_level: string | number
  academic_year: string
  members?: Member[]
}

interface StudentOption {
  id: number
  identifier: string
  full_name: string
}

export default function ClassDetailPage() {
  const params = useParams()
  const classId = params?.id as string

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [availableStudents, setAvailableStudents] = useState<StudentOption[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  async function loadDetail() {
    if (!classId) return
    setIsLoading(true)
    try {
      const res = await api.get(`/academic/classes/${classId}`)
      setClassDetail(res.data.data)
    } catch {
      try {
        const res = await api.get(`/classes/${classId}`)
        setClassDetail(res.data.data)
      } catch (e) {
        console.error('Failed to load class detail:', e)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function openAddMemberModal() {
    try {
      let res
      try {
        res = await api.get('/academic/classes/users/students')
      } catch {
        res = await api.get('/classes/users/students')
      }
      const currentMemberIds = new Set((classDetail?.members || []).map((m) => m.user_id))
      const available = (res.data.data || []).filter((s: any) => !currentMemberIds.has(s.id))
      setAvailableStudents(available)
      setSelectedStudentId(available.length > 0 ? available[0].id : null)
      setShowAddModal(true)
    } catch (err) {
      console.error('Failed to fetch students:', err)
    }
  }

  async function handleAddMember() {
    if (!selectedStudentId || isSubmitting) return
    setIsSubmitting(true)
    try {
      try {
        await api.post(`/academic/classes/${classId}/members`, {
          user_id: selectedStudentId,
          role: 'student',
        })
      } catch {
        await api.post(`/classes/${classId}/members`, {
          user_id: selectedStudentId,
          role: 'student',
        })
      }
      setShowAddModal(false)
      await loadDetail()
    } catch (err) {
      console.error('Failed to add member:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!confirm('Yakin ingin mengeluarkan siswa ini dari kelas?')) return
    try {
      try {
        await api.delete(`/academic/classes/${classId}/members/${userId}`)
      } catch {
        await api.delete(`/classes/${classId}/members/${userId}`)
      }
      await loadDetail()
    } catch (err) {
      console.error('Failed to remove member:', err)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [classId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/classes"
          className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {classDetail?.name || 'Rombel Kelas'}
          </h2>
          <p className="text-xs text-slate-500 font-medium font-mono">
            Tingkat {classDetail?.grade_level} • Tahun Ajaran {classDetail?.academic_year}
          </p>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-slate-900">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Anggota & Roster Siswa</h3>
            <p className="text-xs text-slate-500">Total: {classDetail?.members?.length || 0} Siswa Terdaftar</p>
          </div>

          <button
            onClick={openAddMemberModal}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Siswa ke Kelas</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">NISN / Identifier</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Peran</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(classDetail?.members || []).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                      {m.user?.identifier}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{m.user?.full_name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{m.user?.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize font-mono ${
                          m.role === 'teacher'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {m.role !== 'teacher' && (
                        <button
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!classDetail?.members || classDetail.members.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      Belum ada siswa yang ditambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftarkan Siswa ke Kelas</h3>
                <p className="text-xs text-slate-500">Pilih siswa dari database untuk dimasukkan ke rombel ini</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Tutup modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-mono">Pilih Siswa</label>
                <select
                  value={selectedStudentId ?? ''}
                  onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:bg-white focus:border-slate-900 outline-none bg-slate-50 text-slate-900"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.identifier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 cursor-pointer shadow-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!selectedStudentId || isSubmitting}
                  onClick={handleAddMember}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Menambahkan...' : 'Tambahkan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
