'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
} from 'lucide-react'
import api from '@/lib/api'
import { AuthShell, authLabelClass, authInputClass, authPrimaryButtonClass } from '@/components/auth/AuthShell'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlToken = searchParams.get('token') || ''
  const urlEmail = searchParams.get('email') || ''

  const [token, setToken] = useState(urlToken)
  const [email, setEmail] = useState(urlEmail)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [verifying, setVerifying] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [userName, setUserName] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [redirectCount, setRedirectCount] = useState(3)

  // Verify token when component mounts if token exists in URL
  useEffect(() => {
    if (urlToken) {
      verifyToken(urlToken, urlEmail)
    }
  }, [urlToken, urlEmail])

  // Automatic redirect countdown after success
  useEffect(() => {
    if (!isSuccess) return
    if (redirectCount <= 0) {
      router.push('/login')
      return
    }
    const timer = setTimeout(() => {
      setRedirectCount((c) => c - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [isSuccess, redirectCount, router])

  const verifyToken = async (tok: string, targetEmail?: string) => {
    if (!tok.trim()) return
    setVerifying(true)
    setTokenError('')

    try {
      const res = await api.post('/auth/verify-reset-token', {
        token: tok.trim(),
        email: targetEmail?.trim() || undefined,
      })
      const data = res.data?.data
      setTokenValid(true)
      if (data?.user_name) setUserName(data.user_name)
      if (data?.email && !email) setEmail(data.email)
    } catch (err: any) {
      setTokenValid(false)
      setTokenError(
        err.response?.data?.message ||
          'Tautan atau kode reset kata sandi tidak valid atau telah kedaluwarsa.'
      )
    } finally {
      setVerifying(false)
    }
  }

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      verifyToken(token.trim(), email.trim() || undefined)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!token.trim()) {
      setErrorMessage('Token atau kode reset tidak boleh kosong.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus terdiri dari 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak sesuai dengan kata sandi baru.')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        email: email.trim() || undefined,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setIsSuccess(true)
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui kata sandi. Pastikan tautan atau kode reset masih berlaku.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return 0
    let score = 0
    if (newPassword.length >= 6) score += 1
    if (newPassword.length >= 8) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1
    return score
  }

  const strength = getPasswordStrength()
  const strengthText =
    strength <= 1 ? 'Lemah' : strength <= 3 ? 'Cukup Kuat' : 'Sangat Kuat'
  const strengthColor =
    strength <= 1
      ? 'bg-rose-500'
      : strength <= 3
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  return (
    <AuthShell
      topRight={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Masuk</span>
        </Link>
      }
    >
      <div className="space-y-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-bold text-[#150f23]">
                  Kata Sandi Berhasil Diperbarui
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Kata sandi baru akun Anda telah aktif dan diamankan. Notifikasi konfirmasi perubahan telah dikirimkan ke email Anda.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[13px]">
                <span>Mengalihkan ke halaman login dalam </span>
                <strong className="text-[#150f23] font-mono font-bold text-sm">
                  {redirectCount}s
                </strong>
                <span>...</span>
              </div>

              <Link
                href="/login"
                className={authPrimaryButtonClass}
              >
                <span>Masuk Sekarang</span>
              </Link>
            </div>
          ) : verifying ? (
            /* Verifying Token Spinner */
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Memvalidasi token & kode reset keamanan...
              </p>
            </div>
          ) : tokenValid === false ? (
            /* Invalid or Expired Token View */
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-xs">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-bold text-[#150f23]">
                  Tautan Kedaluwarsa atau Tidak Valid
                </h2>
                <p className="text-xs text-rose-600 max-w-xs mx-auto leading-relaxed">
                  {tokenError ||
                    'Tautan atau kode reset yang Anda gunakan telah kedaluwarsa atau sudah pernah dipakai sebelumnya.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/forgot-password"
                  className={authPrimaryButtonClass}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Minta Tautan Reset Baru</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setTokenValid(null)
                    setToken('')
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200 cursor-pointer flex items-center justify-center"
                >
                  Input Token/Kode Secara Manual
                </button>
              </div>
            </div>
          ) : (
            /* Reset Password Form */
            <>
              <div className="space-y-2 text-center">
                <h1 className="font-display text-[22px] font-bold text-[#150f23]">
                  Buat Kata Sandi Baru
                </h1>
                {userName ? (
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Mengatur kata sandi untuk akun:{' '}
                    <strong className="text-[#150f23]">{userName}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Masukkan kata sandi baru yang kuat untuk mengamankan akun EXAMIND Anda.
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-900" role="alert">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Token or Short Code Input (If not verified from URL) */}
                {tokenValid !== true && (
                  <div>
                    <label htmlFor="reset-token" className={authLabelClass}>
                      Token URL atau Kode 6-Digit dari Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="reset-token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        type="text"
                        required
                        placeholder="Contoh: 414805 atau ZalTuBDM..."
                        className={`${authInputClass} font-mono flex-1`}
                      />
                      <button
                        type="button"
                        onClick={handleManualVerify}
                        disabled={!token.trim()}
                        className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
                      >
                        Periksa
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label htmlFor="reset-new-password" className={authLabelClass}>
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      id="reset-new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 6 karakter"
                      className={`${authInputClass} pl-10 pr-10`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Tampilkan kata sandi"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Kekuatan Kata Sandi:</span>
                        <span className="font-bold text-slate-700">{strengthText}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full w-full origin-left transition-[transform] duration-300 ${strengthColor}`}
                          style={{ transform: `scaleX(${Math.min(1, strength / 4)})` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="reset-confirm-password" className={authLabelClass}>
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi baru"
                      className={`${authInputClass} pl-10`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword || (tokenValid !== true && !token.trim())}
                  className={authPrimaryButtonClass}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memperbarui Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Simpan & Perbarui Kata Sandi</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer Back Link */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
      </div>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
