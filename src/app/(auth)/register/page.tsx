'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

interface SchoolOption {
  id: number
  name: string
  code: string
  domain?: string
}

interface CodeVerificationResult {
  valid: boolean
  code: string
  role: string
  tenant_id: number
  tenant_name: string
  tenant_code: string
  description?: string
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyParam = searchParams.get('verify')
  const { hydrate, login } = useAuthStore()

  // Step State (1: Registration Form, 2: OTP Verification Panel)
  const [step, setStep] = useState<1 | 2>(1)

  // Form State
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [schools, setSchools] = useState<SchoolOption[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<number | ''>('')
  const [registrationCode, setRegistrationCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Verification & Status State
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [codeVerified, setCodeVerified] = useState<CodeVerificationResult | null>(null)
  const [codeError, setCodeError] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // OTP Step 2 State
  const [otpCode, setOtpCode] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')
  const [resendSuccessMessage, setResendSuccessMessage] = useState('')

  // Handle direct verification link: /register?verify=<email>
  useEffect(() => {
    if (verifyParam) {
      setEmail(verifyParam)
      setStep(2)
      setCooldown(60)
    }
  }, [verifyParam])

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Load available schools on mount
  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await api.get('/auth/schools')
        if (res.data?.data) {
          setSchools(res.data.data)
          if (res.data.data.length > 0) {
            setSelectedTenantId(res.data.data[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load schools:', err)
      }
    }
    loadSchools()
  }, [])

  // Verify registration code against backend
  const verifyCode = async (codeToVerify: string, targetRole: string, tenantId?: number | '') => {
    const clean = codeToVerify.trim().toUpperCase()
    if (!clean) {
      setCodeVerified(null)
      setCodeError('')
      return
    }

    setVerifyingCode(true)
    setCodeError('')

    try {
      const res = await api.post('/auth/verify-registration-code', {
        code: clean,
        role: targetRole,
        tenant_id: tenantId ? Number(tenantId) : undefined,
      })
      const data = res.data?.data
      setCodeVerified(data)
      setCodeError('')

      // Auto-sync school if not set or different
      if (data?.tenant_id && selectedTenantId !== data.tenant_id) {
        setSelectedTenantId(data.tenant_id)
      }
    } catch (err: any) {
      setCodeVerified(null)
      setCodeError(
        err.response?.data?.message ||
          'Kode pendaftaran tidak valid atau tidak cocok dengan sekolah/peran yang dipilih.'
      )
    } finally {
      setVerifyingCode(false)
    }
  }

  // Quick fill demo code helper
  const handleSelectDemoCode = (demoCode: string, demoRole: 'student' | 'teacher' | 'admin', schoolId: number) => {
    setRole(demoRole)
    setSelectedTenantId(schoolId)
    setRegistrationCode(demoCode)
    verifyCode(demoCode, demoRole, schoolId)
  }

  // Handle registration submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!registrationCode.trim()) {
      setErrorMessage('Kode pendaftaran khusus sekolah wajib dimasukkan.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus terdiri dari 6 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/register', {
        tenant_id: selectedTenantId ? Number(selectedTenantId) : undefined,
        role: role,
        registration_code: registrationCode.trim().toUpperCase(),
        full_name: fullName.trim(),
        identifier: identifier.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        confirm_password: confirmPassword,
      })

      const resData = res.data?.data || res.data
      if (resData?.requires_verification) {
        setStep(2)
        setCooldown(60)
        setOtpCode('')
        setOtpError('')
        setOtpSuccess('')
        setResendSuccessMessage('')
        return
      }

      const tokenData = resData
      if (tokenData?.access_token) {
        // Persist token & user profile in localStorage for instant login (fallback)
        localStorage.setItem('examind_token', tokenData.access_token)
        localStorage.setItem('examind_user', JSON.stringify(tokenData.user))
        hydrate()

        const roleLabel =
          tokenData.user.role === 'admin'
            ? 'Admin Sekolah'
            : tokenData.user.role === 'teacher'
            ? 'Guru'
            : 'Siswa'

        setSuccessMessage(
          `Pendaftaran sebagai ${roleLabel} berhasil! Mengalihkan ke dashboard Anda...`
        )

        // Redirect to appropriate role dashboard
        setTimeout(() => {
          if (tokenData.user.role === 'student') router.push('/student/dashboard')
          else if (tokenData.user.role === 'teacher') router.push('/teacher/dashboard')
          else if (tokenData.user.role === 'admin') router.push('/admin/dashboard')
          else router.push('/dashboard')
        }, 1500)
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error?.details ||
          err.message ||
          'Gagal melakukan pendaftaran. Periksa kembali data dan kode registrasi Anda.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP verification submission
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (otpCode.length !== 6 || verifyingOtp) return

    setVerifyingOtp(true)
    setOtpError('')
    setOtpSuccess('')

    try {
      await api.post('/auth/otp/verify', {
        email: email.trim().toLowerCase(),
        otp_code: otpCode.trim(),
        purpose: 'email_verification',
      })

      if (password) {
        setOtpSuccess('Verifikasi berhasil! Sedang masuk ke akun Anda...')
        try {
          const loggedUser = await login(email.trim().toLowerCase(), password)
          setOtpSuccess('Pendaftaran berhasil! Mengalihkan ke dashboard Anda...')
          setTimeout(() => {
            const userRole = loggedUser?.role || role
            if (userRole === 'student') router.push('/student/dashboard')
            else if (userRole === 'teacher') router.push('/teacher/dashboard')
            else if (userRole === 'admin') router.push('/admin/dashboard')
            else router.push('/dashboard')
          }, 1200)
        } catch {
          setOtpSuccess('Verifikasi berhasil, silakan masuk.')
        }
      } else {
        setOtpSuccess('Verifikasi berhasil, silakan masuk.')
      }
    } catch (err: any) {
      const resData = err.response?.data
      setOtpError(
        resData?.message ||
          resData?.error?.details ||
          err.message ||
          'Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali atau kirim ulang kode.'
      )
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || sendingOtp) return

    setSendingOtp(true)
    setOtpError('')
    setResendSuccessMessage('')

    try {
      await api.post('/auth/otp/send', {
        email: email.trim().toLowerCase(),
        purpose: 'email_verification',
      })
      setCooldown(60)
      setResendSuccessMessage(`Kode verifikasi baru berhasil dikirim ke ${email.trim().toLowerCase()}.`)
    } catch (err: any) {
      const resData = err.response?.data
      setOtpError(
        resData?.message ||
          resData?.error?.details ||
          err.message ||
          'Gagal mengirim ulang kode verifikasi. Silakan coba lagi.'
      )
    } finally {
      setSendingOtp(false)
    }
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    return score
  }
  const strength = getPasswordStrength()
  const strengthText = strength <= 1 ? 'Lemah' : strength <= 2 ? 'Cukup' : 'Kuat'
  const strengthColor =
    strength <= 1 ? 'bg-rose-500' : strength <= 2 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#c2ef4e] selection:text-slate-950 relative overflow-hidden">
      {/* Ambient Background Gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-100/60 via-[#c2ef4e]/10 to-transparent rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3 group" aria-label="EXAMIND Beranda">
          <ExamindLogo variant="lockup" theme="color" className="h-8 w-auto shrink-0" priority />
          <div className="border-l border-slate-200/80 pl-3 hidden sm:block">
            <span className="text-[11px] text-slate-500 font-medium block leading-none">
              Platform Ujian AI Sekolah
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sudah punya akun? Masuk</span>
        </Link>
      </header>

      {/* Main Registration Card Area */}
      <main className="relative z-10 max-w-xl w-full mx-auto my-auto py-8">
        {step === 1 ? (
          <div
            className="anim-rise bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-subtle-elevated p-6 sm:p-8 space-y-6 text-slate-900"
            style={{ '--anim-duration': '300ms' } as React.CSSProperties}
          >
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Pendaftaran Akun Sekolah
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Registrasi Akun Institusi
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Pendaftaran memerlukan <strong>Kode Akses Khusus</strong> yang dialokasikan oleh provider/sekolah untuk setiap peran.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Role Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 font-mono">
                Pilih Peran Akun:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Siswa */}
                <button
                  type="button"
                  onClick={() => {
                    setRole('student')
                    if (registrationCode) verifyCode(registrationCode, 'student', selectedTenantId)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    role === 'student'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    {role === 'student' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Siswa / Murid</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Peserta Ujian</p>
                </button>

                {/* Guru */}
                <button
                  type="button"
                  onClick={() => {
                    setRole('teacher')
                    if (registrationCode) verifyCode(registrationCode, 'teacher', selectedTenantId)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    role === 'teacher'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        role === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    {role === 'teacher' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Guru / Pengajar</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pembuat Soal</p>
                </button>

                {/* Admin Sekolah */}
                <button
                  type="button"
                  onClick={() => {
                    setRole('admin')
                    if (registrationCode) verifyCode(registrationCode, 'admin', selectedTenantId)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    role === 'admin'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    {role === 'admin' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Admin Sekolah</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pengelola</p>
                </button>
              </div>
            </div>

            {/* 2. School Selection & Specific Registration Code */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  Otorisasi Kode Provider & Sekolah
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Wajib Diisi</span>
              </div>

              {/* School Dropdown */}
              <div>
                <label htmlFor="register-school-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekolah / Institusi:
                </label>
                <select
                  id="register-school-select"
                  aria-label="Sekolah / Institusi"
                  value={selectedTenantId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : ''
                    setSelectedTenantId(id)
                    if (registrationCode) verifyCode(registrationCode, role, id)
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                >
                  <option value="">-- Pilih Sekolah Terdaftar --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Registration Code Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Spesifik Registrasi (Diberikan oleh Provider):
                </label>
                <div className="relative">
                  <input
                    value={registrationCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase()
                      setRegistrationCode(val)
                      if (val.length >= 6) {
                        verifyCode(val, role, selectedTenantId)
                      } else {
                        setCodeVerified(null)
                        setCodeError('')
                      }
                    }}
                    onBlur={() => {
                      if (registrationCode) verifyCode(registrationCode, role, selectedTenantId)
                    }}
                    type="text"
                    required
                    placeholder="Contoh: SMAN1-SIS-PROV2026"
                    className="w-full pl-9 pr-24 py-2.5 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs uppercase tracking-wide"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => verifyCode(registrationCode, role, selectedTenantId)}
                    disabled={verifyingCode || !registrationCode.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {verifyingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verifikasi'}
                  </button>
                </div>

                {/* Real-time Code Verification Feedback */}
                {codeVerified && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Kode Terverifikasi:</strong> {codeVerified.tenant_name} • Peran:{' '}
                      <span className="capitalize font-bold text-emerald-900">{codeVerified.role}</span>
                    </span>
                  </div>
                )}

                {codeError && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{codeError}</span>
                  </div>
                )}

                {/* Quick Helper Pill Chips for Testing */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-1.5">
                    Kode Uji Coba Cepat (Klik untuk Isi):
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectDemoCode('SMAN1-SIS-PROV2026', 'student', 1)}
                      className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition-colors cursor-pointer"
                    >
                      SMAN 1: Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoCode('SMAN1-GUR-PROV2026', 'teacher', 1)}
                      className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold transition-colors cursor-pointer"
                    >
                      SMAN 1: Guru
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoCode('SMAN1-ADM-PROV2026', 'admin', 1)}
                      className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold transition-colors cursor-pointer"
                    >
                      SMAN 1: Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoCode('SMKN2-SIS-PROV2026', 'student', 2)}
                      className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold transition-colors cursor-pointer"
                    >
                      SMKN 2: Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoCode('SMKN2-GUR-PROV2026', 'teacher', 2)}
                      className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold transition-colors cursor-pointer"
                    >
                      SMKN 2: Guru
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Personal & Identity Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    required
                    placeholder="Contoh: Rina Kartika"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                    {role === 'student' ? 'NISN (Nomor Induk Siswa)' : 'NIP / ID Resmi'}
                  </label>
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    type="text"
                    required
                    placeholder={
                      role === 'student' ? 'Contoh: 0081234567' : 'Contoh: 19800101...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      placeholder="email@sekolah.sch.id"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 karakter"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Kekuatan: {strengthText}</span>
                      <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strengthColor}`}
                          style={{ width: `${Math.min(100, (strength / 4) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-card hover:shadow-card-hover font-display tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
                  <span>Mendaftarkan Akun Institusi...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#c2ef4e]" />
                  <span>
                    Daftar sebagai{' '}
                    {role === 'student' ? 'Siswa' : role === 'teacher' ? 'Guru' : 'Admin Sekolah'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back to Login */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun terdaftar?{' '}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Masuk ke Portal Ujian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div
          className="anim-rise bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-subtle-elevated p-6 sm:p-8 space-y-6 text-slate-900"
          style={{ '--anim-duration': '300ms' } as React.CSSProperties}
        >
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              <Mail className="w-3 h-3 text-indigo-600" />
              Verifikasi Email Institusi
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Verifikasi Alamat Email
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Kode verifikasi dikirim ke <strong className="text-slate-900 font-semibold">{email}</strong>. Masukkan 6 digit kode OTP di bawah ini untuk mengaktifkan akun Anda.
            </p>
          </div>

          {/* Resend Success Banner */}
          {resendSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendSuccessMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {otpError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {/* Success Banner */}
          {otpSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{otpSuccess}</span>
              </div>
              {!password && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                >
                  <span>Masuk ke Akun Anda</span>
                  <ArrowRight className="w-4 h-4 text-[#c2ef4e]" />
                </Link>
              )}
            </div>
          )}

          {/* OTP Input Form */}
          {(!otpSuccess || password) && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 font-mono text-center">
                  Kode Verifikasi (6 Digit):
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtpCode(clean)
                      if (otpError) setOtpError('')
                    }}
                    placeholder="000000"
                    disabled={verifyingOtp || Boolean(otpSuccess)}
                    className="w-full text-center tracking-[0.6em] pl-[0.6em] py-3.5 rounded-xl bg-slate-50/80 border border-slate-300 text-2xl font-mono font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/25 transition-all shadow-xs disabled:opacity-50"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center font-mono">
                  Kode berlaku selama 10 menit
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={otpCode.length !== 6 || verifyingOtp || Boolean(otpSuccess)}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-card hover:shadow-card-hover font-display tracking-wide"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
                    <span>Memverifikasi Kode...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#c2ef4e]" />
                    <span>Verifikasi</span>
                  </>
                )}
              </button>

              {/* Resend Cooldown Section */}
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || sendingOtp || Boolean(otpSuccess)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Mengirim ulang kode...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kirim ulang dalam {cooldown} dtk</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kirim ulang kode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back Link to Step 1 */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtpError('')
                setOtpSuccess('')
                setResendSuccessMessage('')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ganti email / kembali</span>
            </button>
          </div>
        </div>
      )}
      </main>

      {/* Footer System Info */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-500">
        &copy; 2026 EXAMIND Academic Assessment System. Pendaftaran Terproteksi Kode Otorisasi Provider.
      </footer>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
