'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, Check, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { AuthShell, authLabelClass, authInputClass } from '@/components/auth/AuthShell'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, user, isHydrated, hydrate } = useAuthStore()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [sendingVerificationOtp, setSendingVerificationOtp] = useState(false)
  const [otpSendError, setOtpSendError] = useState('')

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [isHydrated, hydrate])

  useEffect(() => {
    if (isHydrated && isAuthenticated() && user) {
      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
      } else {
        if (user.role === 'superadmin') router.push('/superadmin/dashboard')
        else if (user.role === 'admin') router.push('/admin/dashboard')
        else if (user.role === 'student') router.push('/student/dashboard')
        else router.push('/teacher/dashboard')
      }
    }
  }, [isHydrated, user, router, searchParams, isAuthenticated])

  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      setSessionExpiredNotice(true)
    }
  }, [searchParams])

  const handleSendVerificationOtp = async () => {
    if (!unverifiedEmail) return
    setSendingVerificationOtp(true)
    setOtpSendError('')

    try {
      await api.post('/auth/otp/send', {
        email: unverifiedEmail.trim().toLowerCase(),
        purpose: 'email_verification',
      })
      router.push(`/register?verify=${encodeURIComponent(unverifiedEmail.trim().toLowerCase())}`)
    } catch (err: any) {
      const resData = err.response?.data
      setOtpSendError(
        resData?.message ||
          resData?.error?.details ||
          err.message ||
          'Gagal mengirim kode verifikasi. Silakan coba lagi.'
      )
    } finally {
      setSendingVerificationOtp(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginSuccess(false)
    setErrorMessage('')
    setSessionExpiredNotice(false)
    setUnverifiedEmail(null)
    setOtpSendError('')

    try {
      const loggedUser = await login(identifier.trim(), password)
      if (loggedUser) {
        setLoading(false)
        setLoginSuccess(true)
        await new Promise((resolve) => setTimeout(resolve, 600))
        const redirect = searchParams.get('redirect') || (
          loggedUser.role === 'superadmin'
            ? '/superadmin/dashboard'
            : loggedUser.role === 'admin'
            ? '/admin/dashboard'
            : loggedUser.role === 'student'
            ? '/student/dashboard'
            : '/teacher/dashboard'
        )
        router.push(redirect)
      }
    } catch (err: any) {
      setLoginSuccess(false)
      const resData = err.response?.data
      const errorCode =
        resData?.error?.code ||
        resData?.error_code ||
        resData?.code ||
        resData?.detail?.error_code

      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        const targetEmail =
          (typeof resData?.error?.details === 'object' && resData?.error?.details?.email) ||
          resData?.data?.email ||
          resData?.email ||
          identifier.trim()
        setUnverifiedEmail(targetEmail)
      } else {
        setErrorMessage(
          resData?.message ||
            err.message ||
            'Gagal masuk. Periksa kembali identifier dan kata sandi.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        {/* Card Header */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#150f23]">
            Masuk ke Portal Ujian
          </h1>
          <p className="text-[13px] leading-relaxed text-slate-500">
            Gunakan akun resmi sekolah Anda — NISN untuk siswa, NIP untuk guru dan
            admin, atau alamat email terdaftar.
          </p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpiredNotice && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[13px] text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>Sesi Anda telah kedaluwarsa. Silakan masuk kembali.</span>
          </div>
        )}

        {/* Unverified Email Notice */}
        {unverifiedEmail && (
          <div className="space-y-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <span className="font-bold text-[#150f23]">Email belum diverifikasi.</span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-600">
              Akun terdaftar, namun alamat email Anda ({unverifiedEmail}) belum diverifikasi. Klik tombol di bawah untuk menerima kode OTP verifikasi.
            </p>
            {otpSendError && (
              <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
                <span>{otpSendError}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSendVerificationOtp}
              disabled={sendingVerificationOtp}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 text-[13px] font-bold text-white transition-colors hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50"
            >
              {sendingVerificationOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Mengirim kode verifikasi...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Kirim kode verifikasi</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-900" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-identifier" className={authLabelClass}>
              NISN / NIP / Email / Nama Pengguna
            </label>
            <input
              id="login-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              type="text"
              required
              autoComplete="username"
              placeholder="nama@sekolah.sch.id"
              className={authInputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="text-[13px] font-semibold text-[#1f1633]">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold text-[#6a5fc1] transition-colors hover:text-[#422082]"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Kata sandi akun Anda"
                className={`${authInputClass} pr-11`}
              />
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
          </div>

          <button
            type="submit"
            disabled={loading || loginSuccess}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#c2ef4e] text-sm font-bold text-[#150f23] transition-colors hover:bg-[#b0dc3d] active:bg-[#a3d136] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#150f23]/50 focus-visible:ring-offset-2"
          >
            {loginSuccess ? (
              <span className="anim-pop inline-flex items-center gap-2">
                <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                <span>Berhasil Masuk</span>
              </span>
            ) : loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Memeriksa…</span>
              </>
            ) : (
              <span>Masuk ke Sistem Ujian</span>
            )}
          </button>

          {/* Registration Link */}
          <div className="pt-2 text-center">
            <p className="text-[13px] text-slate-500">
              Belum memiliki akun?{' '}
              <Link
                href="/register"
                className="inline-flex items-center gap-1 font-bold text-[#6a5fc1] transition-colors hover:text-[#422082]"
              >
                <span>Daftar dengan Kode Sekolah</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <Loader2 className="h-6 w-6 animate-spin text-[#150f23]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
