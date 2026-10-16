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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#c2ef4e] selection:text-slate-950 relative overflow-hidden">
      {/* Ambient Background Gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-100/60 via-[#c2ef4e]/10 to-transparent rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-card group-hover:bg-[#c2ef4e] group-hover:text-slate-950 transition-colors">
            EX
          </div>
          <div>
            <span className="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-none">
              EXAMIND
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Platform Ujian AI Sekolah</span>
          </div>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Masuk</span>
        </Link>
      </header>

      {/* Main Form Area */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-subtle-elevated p-6 sm:p-8 space-y-6 text-slate-900">
          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Kata Sandi Berhasil Diperbarui!
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Kata sandi baru akun Anda telah aktif dan diamankan. Notifikasi konfirmasi perubahan telah dikirimkan ke email Anda via Resend.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                <span>Mengalihkan ke halaman login dalam </span>
                <strong className="text-indigo-600 font-mono font-bold text-sm">
                  {redirectCount}s
                </strong>
                <span>...</span>
              </div>

              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-card hover:shadow-card-hover font-display flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk Sekarang</span>
              </Link>
            </div>
          ) : verifying ? (
            /* Verifying Token Spinner */
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
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
                <h2 className="font-display text-xl font-bold text-slate-900">
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
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-card hover:shadow-card-hover font-display flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#c2ef4e]" />
                  <span>Minta Tautan Reset Baru</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setTokenValid(null)
                    setToken('')
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
                >
                  Input Token/Kode Secara Manual
                </button>
              </div>
            </div>
          ) : (
            /* Reset Password Form */
            <>
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  Atur Ulang Kata Sandi
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  Buat Kata Sandi Baru
                </h1>
                {userName ? (
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Mengatur kata sandi untuk akun:{' '}
                    <strong className="text-slate-900">{userName}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Masukkan kata sandi baru yang kuat untuk mengamankan akun EXAMIND Anda.
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Token or Short Code Input (If not verified from URL) */}
                {tokenValid !== true && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                      Token URL atau Kode 6-Digit dari Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        type="text"
                        required
                        placeholder="Contoh: 414805 atau ZalTuBDM..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 font-mono transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={handleManualVerify}
                        disabled={!token.trim()}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
                      >
                        Periksa
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500">Kekuatan Kata Sandi:</span>
                        <span className="font-bold text-slate-700">{strengthText}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${Math.min(100, (strength / 4) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword || (tokenValid !== true && !token.trim())}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-card hover:shadow-card-hover font-display tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
                      <span>Memperbarui Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#c2ef4e]" />
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
      </main>

      {/* Footer System Info */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-400">
        &copy; 2026 EXAMIND Academic Assessment System. Dilengkapi Keamanan Resend Transactional Email.
      </footer>
    </div>
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
