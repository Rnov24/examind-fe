'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
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
  RefreshCw,
} from 'lucide-react'
import api from '@/lib/api'
import { AnimatePresence, motion } from 'motion/react'
import { EMIL_EASE } from '@/components/system/PageTransition'
import { useAuthStore } from '@/stores/authStore'
import { AuthShell, authLabelClass, authInputClass, authPrimaryButtonClass } from '@/components/auth/AuthShell'

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

  // Segmented OTP boxes — presentation only; `otpCode` remains the single
  // source of truth exactly as before.
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const handleOtpSlotChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (otpError) setOtpError('')

    if (!digits) {
      if (index < otpCode.length) {
        setOtpCode(otpCode.slice(0, index) + otpCode.slice(index + 1))
      }
      return
    }

    if (digits.length > 1) {
      const merged = (otpCode.slice(0, index) + digits).slice(0, 6)
      setOtpCode(merged)
      otpRefs.current[Math.min(merged.length, 5)]?.focus()
      return
    }

    let next: string
    if (index < otpCode.length) {
      next = otpCode.slice(0, index) + digits + otpCode.slice(index + 1)
    } else {
      next = (otpCode + digits).slice(0, 6)
    }
    setOtpCode(next)
    if (index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpSlotKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpCode[index]) {
        setOtpCode(otpCode.slice(0, index) + otpCode.slice(index + 1))
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    if (otpError) setOtpError('')
    setOtpCode(text)
    otpRefs.current[Math.min(text.length, 5)]?.focus()
  }

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

  const roleOptions = [
    {
      value: 'student' as const,
      icon: GraduationCap,
      title: 'Siswa / Murid',
      desc: 'Peserta ujian',
    },
    {
      value: 'teacher' as const,
      icon: BookOpen,
      title: 'Guru / Pengajar',
      desc: 'Pembuat soal',
    },
    {
      value: 'admin' as const,
      icon: Building2,
      title: 'Admin Sekolah',
      desc: 'Pengelola',
    },
  ]

  return (
    <AuthShell
      width="xl"
      topRight={
        <Link
          href="/login"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[13px] font-semibold text-[#1f1633] transition-colors hover:border-[#cfcfdb]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Sudah punya akun? Masuk</span>
        </Link>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
      {step === 1 ? (
        <motion.div
          key="register-form"
          className="space-y-6"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: EMIL_EASE }}
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#150f23]">
              Registrasi Akun
            </h1>
            <p className="text-[13px] leading-relaxed text-slate-500">
              Pendaftaran memerlukan <strong className="font-semibold text-[#1f1633]">kode pendaftaran</strong> yang
              diberikan oleh sekolah atau provider untuk setiap peran.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-900" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Role Selection Grid */}
            <div>
              <span className={authLabelClass} id="register-role-label">
                Pilih Peran Akun
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-labelledby="register-role-label">
                {roleOptions.map((option) => {
                  const selected = role === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setRole(option.value)
                        if (registrationCode) verifyCode(registrationCode, option.value, selectedTenantId)
                      }}
                      className={`min-h-[76px] cursor-pointer rounded-xl border p-3.5 text-left transition-colors ${
                        selected
                          ? 'border-[#6a5fc1] bg-[#6a5fc1]/5 ring-1 ring-[#6a5fc1]/40'
                          : 'border-[#e5e7eb] bg-white hover:border-[#cfcfdb]'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            selected ? 'bg-[#6a5fc1] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <option.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {selected && <Check className="h-4 w-4 text-[#6a5fc1]" aria-hidden="true" />}
                      </div>
                      <span className="block text-[13px] font-bold text-[#1f1633]">{option.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{option.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. School Selection & Registration Code */}
            <div className="space-y-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#1f1633]">
                <KeyRound className="h-4 w-4 text-[#6a5fc1]" aria-hidden="true" />
                Kode Pendaftaran &amp; Sekolah
              </span>

              {/* School Dropdown */}
              <div>
                <label htmlFor="register-school-select" className={authLabelClass}>
                  Sekolah / Institusi
                </label>
                <select
                  id="register-school-select"
                  value={selectedTenantId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : ''
                    setSelectedTenantId(id)
                    if (registrationCode) verifyCode(registrationCode, role, id)
                  }}
                  required
                  className={authInputClass}
                >
                  <option value="">— Pilih Sekolah Terdaftar —</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Registration Code Input */}
              <div>
                <label htmlFor="register-code" className={authLabelClass}>
                  Kode Pendaftaran (dari sekolah / provider)
                </label>
                <div className="relative">
                  <input
                    id="register-code"
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
                    placeholder="Format: XXXX-XXX-XXXXXX"
                    className={`${authInputClass} pl-10 pr-24 font-mono text-sm font-bold uppercase tracking-wide`}
                  />
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => verifyCode(registrationCode, role, selectedTenantId)}
                    disabled={verifyingCode || !registrationCode.trim()}
                    className="absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 cursor-pointer items-center rounded-lg bg-[#150f23] px-3 text-xs font-bold text-white transition-colors hover:bg-[#1f1633] disabled:opacity-40"
                  >
                    {verifyingCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : 'Verifikasi'}
                  </button>
                </div>

                {/* Real-time Code Verification Feedback */}
                {codeVerified && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>
                      <strong>Kode Terverifikasi:</strong> {codeVerified.tenant_name} • Peran:{' '}
                      <span className="font-bold capitalize text-emerald-900">{codeVerified.role}</span>
                    </span>
                  </div>
                )}

                {codeError && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                    <span>{codeError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Personal & Identity Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="register-fullname" className={authLabelClass}>
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    id="register-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Nama lengkap sesuai data sekolah"
                    className={`${authInputClass} pl-10`}
                  />
                  <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="register-identifier" className={authLabelClass}>
                    {role === 'student' ? 'NISN (Nomor Induk Siswa)' : 'NIP / ID Resmi'}
                  </label>
                  <input
                    id="register-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    type="text"
                    required
                    placeholder={role === 'student' ? '10 digit NISN' : 'Nomor induk pegawai'}
                    className={`${authInputClass} font-mono`}
                  />
                </div>

                <div>
                  <label htmlFor="register-email" className={authLabelClass}>
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      id="register-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="nama@sekolah.sch.id"
                      className={`${authInputClass} pl-10`}
                    />
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="register-password" className={authLabelClass}>
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="Minimal 6 karakter"
                      className={`${authInputClass} pl-10 pr-11`}
                    />
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Kekuatan: {strengthText}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${strengthColor} transition-[width] duration-200`}
                          style={{ width: `${Math.min(100, (strength / 4) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className={authLabelClass}>
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="Ulangi kata sandi"
                      className={`${authInputClass} pl-10`}
                    />
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Daftar sebagai{' '}
                    {role === 'student' ? 'Siswa' : role === 'teacher' ? 'Guru' : 'Admin Sekolah'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back to Login */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[13px] text-slate-500">
              Sudah memiliki akun terdaftar?{' '}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-bold text-[#6a5fc1] transition-colors hover:text-[#422082]"
              >
                <span>Masuk ke Portal Ujian</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="otp-form"
          className="space-y-6"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: EMIL_EASE }}
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#150f23]">
              Verifikasi Alamat Email
            </h1>
            <p className="text-[13px] leading-relaxed text-slate-500">
              Kode verifikasi dikirim ke <strong className="font-semibold text-[#150f23]">{email}</strong>. Masukkan 6 digit kode OTP di bawah ini untuk mengaktifkan akun Anda.
            </p>
          </div>

          {/* Resend Success Banner */}
          {resendSuccessMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{resendSuccessMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {otpError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-900" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{otpError}</span>
            </div>
          )}

          {/* Success Banner */}
          {otpSuccess && (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-900">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{otpSuccess}</span>
              </div>
              {!password && (
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#150f23] text-[13px] font-bold text-white transition-colors hover:bg-[#1f1633]"
                >
                  <span>Masuk ke Akun Anda</span>
                  <ArrowRight className="h-4 w-4 text-[#c2ef4e]" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}

          {/* OTP Input Form */}
          {(!otpSuccess || password) && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <span className={authLabelClass} id="register-otp-label">
                  Kode Verifikasi (6 Digit)
                </span>
                <div
                  className="flex items-center justify-center gap-1.5 sm:gap-2"
                  role="group"
                  aria-labelledby="register-otp-label"
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      aria-label={`Digit ke-${index + 1} dari 6`}
                      value={otpCode[index] ?? ''}
                      onChange={(e) => handleOtpSlotChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpSlotKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      disabled={verifyingOtp || Boolean(otpSuccess)}
                      autoFocus={index === 0}
                      className="h-12 w-10 rounded-xl border border-[#cfcfdb] bg-white text-center font-mono text-xl font-bold text-[#1f1633] transition-[border-color,box-shadow] duration-200 focus:border-[#6a5fc1] focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/25 disabled:opacity-50 sm:h-14 sm:w-12"
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-slate-500">
                  Kode berlaku selama 10 menit
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={otpCode.length !== 6 || verifyingOtp || Boolean(otpSuccess)}
                className={authPrimaryButtonClass}
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Memverifikasi Kode...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
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
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 px-2 text-[13px] font-semibold text-[#6a5fc1] transition-colors hover:text-[#422082] disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      <span>Mengirim ulang kode...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Kirim ulang dalam {cooldown} dtk</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Kirim ulang kode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back Link to Step 1 */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtpError('')
                setOtpSuccess('')
                setResendSuccessMessage('')
              }}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 px-2 text-[13px] font-semibold text-slate-600 transition-colors hover:text-[#150f23]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ganti email / kembali</span>
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </AuthShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <Loader2 className="h-6 w-6 animate-spin text-[#150f23]" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
