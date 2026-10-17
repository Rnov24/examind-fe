'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Video, Smartphone, ShieldAlert, Loader2, X } from 'lucide-react'
import api from '@/lib/api'

interface ClassOption {
  id: number
  name: string
  grade_level: string | number
  members_count: number
}

export default function ExamCreatePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [classId, setClassId] = useState<number | null>(null)
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isProctoringEnabled, setIsProctoringEnabled] = useState(true)
  const [cameraMode, setCameraMode] = useState<'dual_camera' | 'single_camera'>('dual_camera')
  const [explanationPolicy, setExplanationPolicy] = useState('after_exam_closed')
  const [randomizeQuestions, setRandomizeQuestions] = useState(true)
  const [randomizeOptions, setRandomizeOptions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [classes, setClasses] = useState<ClassOption[]>([])

  useEffect(() => {
    const now = new Date()
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    // Format to local ISO string YYYY-MM-DDTHH:mm
    setStartTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
    setEndTime(new Date(later.getTime() - later.getTimezoneOffset() * 60000).toISOString().slice(0, 16))

    async function fetchClasses() {
      try {
        let res
        try {
          res = await api.get('/academic/classes')
        } catch {
          res = await api.get('/classes')
        }
        const data = res.data.data || []
        setClasses(data)
        if (data.length > 0) {
          setClassId(data[0].id)
        }
      } catch (err) {
        console.error('Failed to load classes:', err)
      }
    }

    fetchClasses()
  }, [])

  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault()
    if (!classId) return
    setFormError(null)

    if (new Date(endTime) <= new Date(startTime)) {
      setFormError('Waktu batas akhir penutupan ujian harus lebih lambat dari waktu mulai.')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/exams', {
        title,
        description,
        class_id: classId,
        duration_minutes: durationMinutes,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        proctoring_level: isProctoringEnabled ? cameraMode : 'disabled',
        explanation_policy: explanationPolicy,
        randomize_questions: randomizeQuestions,
        randomize_options: randomizeOptions,
      })
      const newExam = res.data.data
      router.push(`/exams/${newExam.id}`)
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Gagal membuat paket ujian. Silakan periksa formulir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/exams"
          title="Kembali ke Daftar Ujian"
          aria-label="Kembali ke Daftar Ujian"
          className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buat Paket Ujian Baru</h2>
          <p className="text-xs text-slate-500 font-medium">
            Konfigurasikan judul, kelas target, jadwal, durasi, dan tingkat pengawasan proctoring
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs text-slate-900">
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between mb-6">
            <span>{formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-600 hover:text-rose-800 font-bold ml-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/30 rounded-md p-0.5"
              aria-label="Tutup pesan kesalahan"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        <form onSubmit={handleCreateExam} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Judul Ujian</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              required
              placeholder="Contoh: Ujian Tengah Semester Fisika Kuantum XII MIPA"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
              Deskripsi / Petunjuk Pengerjaan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Petunjuk khusus ujian..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                Pilih Kelas Target
              </label>
              <select
                value={classId ?? ''}
                onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : null)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
              >
                <option value="">-- Pilih Rombel Kelas --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Tingkat {c.grade_level} - {c.members_count} Siswa)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                Durasi Pengerjaan (Menit)
              </label>
              <input
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                type="number"
                min={5}
                max={300}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Rentang durasi ujian antara 5 hingga 300 menit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                Waktu Mulai Buka Ujian
              </label>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                type="datetime-local"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Waktu saat siswa diizinkan memulai pengerjaan.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                Waktu Batas Akhir Penutupan
              </label>
              <input
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                type="datetime-local"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Batas akhir pengumpulan seluruh sesi ujian.</p>
            </div>
          </div>

          {/* AI Proctoring Camera Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                    isProctoringEnabled ? 'bg-slate-900 text-[#c2ef4e]' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Camera className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <label htmlFor="proctoring-toggle" className="text-sm font-bold text-slate-900 font-display cursor-pointer">
                      AI Proctoring Kamera
                    </label>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border shadow-xs ${
                        isProctoringEnabled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-200/80 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isProctoringEnabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pengawasan integritas ujian otomatis melalui analisis kamera untuk memverifikasi kehadiran peserta.
                  </p>
                </div>
              </div>

              {/* Accessible Switch Control */}
              <button
                id="proctoring-toggle"
                type="button"
                role="switch"
                aria-checked={isProctoringEnabled}
                onClick={() => setIsProctoringEnabled(!isProctoringEnabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900/20 self-start sm:self-center ${
                  isProctoringEnabled ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Aktifkan AI Proctoring Kamera</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isProctoringEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Mode selection when proctoring is enabled */}
            {isProctoringEnabled ? (
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Mode Kamera Pengawasan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      cameraMode === 'dual_camera'
                        ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                        : 'bg-white/70 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cameraMode"
                      value="dual_camera"
                      checked={cameraMode === 'dual_camera'}
                      onChange={() => setCameraMode('dual_camera')}
                      className="mt-1 w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300 accent-slate-900"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                        <span className="text-xs font-bold text-slate-900">Dual-Camera</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Kamera laptop (wajah depan) + kamera ponsel kedua via QR (meja & lingkungan kerja).
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      cameraMode === 'single_camera'
                        ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                        : 'bg-white/70 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cameraMode"
                      value="single_camera"
                      checked={cameraMode === 'single_camera'}
                      onChange={() => setCameraMode('single_camera')}
                      className="mt-1 w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300 accent-slate-900"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                        <span className="text-xs font-bold text-slate-900">Single-Camera</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Hanya menggunakan kamera depan laptop/komputer untuk memantau kehadiran wajah peserta.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200/80">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white/80 p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>
                    Ujian berlangsung tanpa rekaman video. Protokol keamanan layar penuh (fullscreen) dan pemantauan perpindahan tab tetap aktif.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Explanation and Randomization Policies */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Kebijakan Pembahasan & Pengacakan
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">
                Kebijakan Rilis Pembahasan
              </label>
              <select
                value={explanationPolicy}
                onChange={(e) => setExplanationPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none bg-white text-slate-900"
              >
                <option value="after_exam_closed">Setelah Ujian Ditutup / Dinilai Guru</option>
                <option value="instant">Seketika Setelah Siswa Mengumpulkan</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Menentukan kapan siswa dapat membaca penjelasan konsep AI.</p>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 bg-white border-slate-300 focus:ring-slate-900"
                />
                <span>Acak Urutan Soal Siswa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={randomizeOptions}
                  onChange={(e) => setRandomizeOptions(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 bg-white border-slate-300 focus:ring-slate-900"
                />
                <span>Acak Opsi Pilihan Ganda</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/exams"
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs inline-block focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || !classId}
              className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-2 focus:ring-2 focus:ring-slate-900/10 focus:outline-none font-display"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>Lanjut ke Pemilihan Butir Soal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
