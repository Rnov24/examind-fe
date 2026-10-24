'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Video,
  Smartphone,
  ShieldAlert,
  Loader2,
  X,
  CheckCircle2,
  Calendar,
  Settings,
  HelpCircle,
  FileQuestion,
  Users,
  UserRound,
} from 'lucide-react'
import api from '@/lib/api'

interface ClassOption {
  id: number
  name: string
  grade_level: string | number
  members_count: number
}

export default function ExamCreatePage() {
  const router = useRouter()

  // Wizard active step: 1 = Basic Info & Schedule, 2 = Proctoring & Policies
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [classId, setClassId] = useState<number | null>(null)
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  // 'live': semua siswa mulai serentak pada startTime. 'non_live': siswa
  // mulai sendiri kapan saja dalam jendela [startTime, endTime].
  const [examMode, setExamMode] = useState<'live' | 'non_live'>('live')
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

  function validateStep1(): boolean {
    setFormError(null)
    if (!title.trim()) {
      setFormError('Silakan masukkan judul paket ujian.')
      return false
    }
    if (!classId) {
      setFormError('Silakan pilih rombel kelas target untuk ujian ini.')
      return false
    }
    if (!startTime || !endTime) {
      setFormError('Waktu mulai dan batas akhir pengerjaan harus diisi.')
      return false
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setFormError('Waktu batas akhir penutupan ujian harus lebih lambat dari waktu mulai.')
      return false
    }
    if (durationMinutes < 5 || durationMinutes > 300) {
      setFormError('Durasi ujian harus antara 5 hingga 300 menit.')
      return false
    }
    if (examMode === 'non_live') {
      const windowMinutes = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
      if (durationMinutes > windowMinutes) {
        setFormError(
          `Durasi ujian mandiri (${durationMinutes} menit) tidak boleh melebihi panjang jendela pengerjaan (${Math.floor(windowMinutes)} menit). Perpanjang jendela atau pendekkan durasi.`
        )
        return false
      }
    }
    return true
  }

  function handleGoToStep2() {
    if (validateStep1()) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep1()) {
      setCurrentStep(1)
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
        exam_mode: examMode,
        proctoring_level: isProctoringEnabled ? cameraMode : 'disabled',
        explanation_policy: explanationPolicy,
        randomize_questions: randomizeQuestions,
        randomize_options: randomizeOptions,
      })
      const newExam = res.data.data
      router.push(`/exams/${newExam.id}`)
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Gagal membuat paket ujian. Silakan periksa kembali formulir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3.5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <Link
          href="/exams"
          title="Kembali ke Daftar Ujian"
          aria-label="Kembali ke Daftar Ujian"
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#f1effa] text-slate-700 transition-colors shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-[#c2ef4e] px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
              Wizard Pembuatan Ujian
            </span>
            <span className="text-xs text-slate-500 font-mono">
              3 Langkah Mudah
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            Buat Paket Ujian Baru
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Atur parameter asesmen, jadwal kelas, konfigurasi proctoring, dan siapkan butir soal ujian.
          </p>
        </div>
      </div>

      {/* Visual Stepper Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              currentStep === 1
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-emerald-50/60 border-emerald-200 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                currentStep === 1
                  ? 'bg-[#c2ef4e] text-slate-950'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {currentStep > 1 ? (
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                '1'
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider block opacity-75">
                Langkah 1
              </span>
              <span className="text-xs font-bold truncate block">
                Parameter & Jadwal
              </span>
            </div>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2)
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              currentStep === 2
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                currentStep === 2
                  ? 'bg-[#c2ef4e] text-slate-950'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider block opacity-75">
                Langkah 2
              </span>
              <span className="text-xs font-bold truncate block">
                Pengawasan & Kebijakan
              </span>
            </div>
          </button>

          {/* Step 3 Pill (Future step on /exams/[id]) */}
          <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 flex items-center gap-3 select-none">
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider block">
                Langkah 3
              </span>
              <span className="text-xs font-medium truncate block">
                Alokasi Butir Soal & Rilis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-card text-slate-900">
        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between mb-6 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold">Perhatian:</span>
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-600 hover:text-rose-800 font-bold ml-2 cursor-pointer focus:outline-none p-1"
              aria-label="Tutup pesan kesalahan"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <form onSubmit={handleCreateExam} className="space-y-6">
          {/* STEP 1: Basic Information & Schedule */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Langkah 1: Parameter & Jadwal Ujian
                </h2>
                <p className="text-xs text-slate-500">
                  Tentukan judul evaluasi, kelas siswa sasaran, serta jadwal pembukaan ujian.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                  Judul Paket Ujian
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  required
                  placeholder="Contoh: Penilaian Harian Bersama Fisika Kuantum XII MIPA"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none placeholder:text-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                  Petunjuk & Instruksi Pengerjaan (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Bacalah setiap butir soal dengan teliti. Dilarang membuka tab lain selama ujian..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-normal focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                    Rombel Kelas Target
                  </label>
                  <select
                    value={classId ?? ''}
                    onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : null)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none"
                  >
                    <option value="">-- Pilih Rombel Kelas --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Tingkat {c.grade_level} — {c.members_count} Siswa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                    Durasi Pengerjaan Siswa (Menit)
                  </label>
                  <input
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    type="number"
                    min={5}
                    max={300}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Rentang waktu antara 5 hingga 300 menit per sesi.
                  </p>
                </div>
              </div>

              {/* Mode Ujian: Live (serentak) vs Mandiri (jendela waktu) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                  Mode Ujian
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Mode ujian">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={examMode === 'live'}
                    onClick={() => setExamMode('live')}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all select-none ${
                      examMode === 'live'
                        ? 'bg-white border-[#150f23] shadow-sm ring-1 ring-[#150f23]'
                        : 'bg-white/70 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${examMode === 'live' ? 'bg-[#150f23] text-[#c2ef4e]' : 'bg-slate-100 text-slate-500'}`}>
                      <Users className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900">Ujian Live</span>
                      <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Semua siswa mulai serentak pada waktu yang ditentukan.
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={examMode === 'non_live'}
                    onClick={() => setExamMode('non_live')}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all select-none ${
                      examMode === 'non_live'
                        ? 'bg-white border-[#150f23] shadow-sm ring-1 ring-[#150f23]'
                        : 'bg-white/70 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${examMode === 'non_live' ? 'bg-[#150f23] text-[#c2ef4e]' : 'bg-slate-100 text-slate-500'}`}>
                      <UserRound className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900">Ujian Mandiri</span>
                      <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Siswa mulai sendiri kapan saja dalam jendela waktu, tetap diawasi AI.
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                    {examMode === 'live' ? 'Waktu Mulai Buka Ujian' : 'Jendela Pengerjaan Dibuka'}
                  </label>
                  <input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    type="datetime-local"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    {examMode === 'live'
                      ? 'Siswa mulai diizinkan membuka lembar soal.'
                      : 'Siswa boleh mulai kapan saja mulai waktu ini.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">
                    {examMode === 'live' ? 'Waktu Batas Akhir Penutupan' : 'Jendela Pengerjaan Ditutup'}
                  </label>
                  <input
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    type="datetime-local"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    {examMode === 'live'
                      ? 'Seluruh sesi otomatis terkumpul setelah batas ini.'
                      : 'Siswa tidak bisa mulai setelah waktu ini; sesi yang berjalan terkumpul otomatis.'}
                  </p>
                </div>
              </div>

              {/* Action: Next Step */}
              <div className="flex items-center justify-end pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleGoToStep2}
                  className="px-6 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
                >
                  <span>Lanjut ke Pengawasan & Kebijakan</span>
                  <ArrowRight className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Proctoring & Exam Policies */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Langkah 2: Pengawasan AI & Kebijakan Ujian
                </h2>
                <p className="text-xs text-slate-500">
                  Konfigurasikan mode kamera pengawasan integritas, kebijakan rilis penjelasan AI, dan pengacakan butir soal.
                </p>
              </div>

              {/* AI Proctoring Camera Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
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
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border shadow-2xs ${
                            isProctoringEnabled
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {isProctoringEnabled ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Verifikasi kehadiran siswa otomatis via webcam laptop dan kamera ponsel pendamping.
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <button
                    id="proctoring-toggle"
                    type="button"
                    role="switch"
                    aria-checked={isProctoringEnabled}
                    onClick={() => setIsProctoringEnabled(!isProctoringEnabled)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40 self-start sm:self-center ${
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
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Pilih Mode Kamera Pengawasan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                          cameraMode === 'dual_camera'
                            ? 'bg-white border-[#150f23] shadow-sm ring-1 ring-[#150f23]'
                            : 'bg-white/70 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cameraMode"
                          value="dual_camera"
                          checked={cameraMode === 'dual_camera'}
                          onChange={() => setCameraMode('dual_camera')}
                          className="mt-1 w-4 h-4 text-[#6a5fc1] focus:ring-[#6a5fc1] border-[#c9c2ec] accent-[#6a5fc1]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-slate-700" aria-hidden="true" />
                            <span className="text-xs font-bold text-slate-900">Dual-Camera</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-bold border border-violet-200">
                              Rekomendasi
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Webcam laptop (wajah siswa) + kamera ponsel kedua via scan QR (meja dan area pengerjaan).
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                          cameraMode === 'single_camera'
                            ? 'bg-white border-[#150f23] shadow-sm ring-1 ring-[#150f23]'
                            : 'bg-white/70 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cameraMode"
                          value="single_camera"
                          checked={cameraMode === 'single_camera'}
                          onChange={() => setCameraMode('single_camera')}
                          className="mt-1 w-4 h-4 text-[#6a5fc1] focus:ring-[#6a5fc1] border-[#c9c2ec] accent-[#6a5fc1]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-slate-700" aria-hidden="true" />
                            <span className="text-xs font-bold text-slate-900">Single-Camera</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Hanya menggunakan satu kamera depan laptop/komputer untuk memverifikasi wajah peserta.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white/80 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                      <span>
                        Ujian berjalan tanpa rekaman kamera. Protokol layar penuh (fullscreen) dan deteksi keluar-tab tetap aktif memverifikasi siswa.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation and Randomization Policies */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  Kebijakan Pembahasan & Pengacakan
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                    Kebijakan Rilis Penjelasan Konsep AI
                  </label>
                  <select
                    value={explanationPolicy}
                    onChange={(e) => setExplanationPolicy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#6a5fc1]/40 focus:border-slate-900 outline-none bg-white text-slate-900"
                  >
                    <option value="after_exam_closed">Setelah Ujian Resmi Ditutup & Dinilai Guru</option>
                    <option value="instant">Seketika Setelah Siswa Mengumpulkan Jawaban</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Menentukan waktu bagi siswa untuk mengakses fitur tanya konsep AI.
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={randomizeQuestions}
                      onChange={(e) => setRandomizeQuestions(e.target.checked)}
                      className="w-4 h-4 rounded text-[#6a5fc1] bg-white border-[#c9c2ec] focus:ring-[#6a5fc1] accent-[#6a5fc1]"
                    />
                    <span>Acak Urutan Soal Tiap Siswa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={randomizeOptions}
                      onChange={(e) => setRandomizeOptions(e.target.checked)}
                      className="w-4 h-4 rounded text-[#6a5fc1] bg-white border-[#c9c2ec] focus:ring-[#6a5fc1] accent-[#6a5fc1]"
                    />
                    <span>Acak Opsi Pilihan Ganda</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f1effa] border border-slate-300 transition-colors shadow-xs cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                  <span>Kembali ke Langkah 1</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || !classId}
                  className="px-6 py-2.5 rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white text-xs font-bold shadow-card hover:shadow-card-hover disabled:opacity-50 cursor-pointer transition-all flex items-center gap-2 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none font-display tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Menyimpan Paket Ujian...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan & Lanjut ke Alokasi Soal (Langkah 3)</span>
                      <ArrowRight className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
