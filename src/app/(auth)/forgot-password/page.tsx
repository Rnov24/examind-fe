'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [resendNotice, setResendNotice] = useState('')
  const [devPreview, setDevPreview] = useState<{
    reset_url?: string
    token?: string
    short_code?: string
    target_email?: string
  } | null>(null)

  // Countdown timer for Resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return

    setLoading(true)
    setErrorMessage('')
    setResendNotice('')

    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      })
      const data = res.data?.data
      setIsSuccess(true)
      setMaskedEmail(data?.email || identifier)
      setCooldown(data?.cooldown_seconds || 60)
      if (data?.dev_preview) {
        setDevPreview(data.dev_preview)
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return

    setResending(true)
    setErrorMessage('')
    setResendNotice('')

    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      })
      const data = res.data?.data
      setCooldown(data?.cooldown_seconds || 60)
      setResendNotice('Email instruksi dan kode reset baru berhasil dikirim ulang!')
      if (data?.dev_preview) {
        setDevPreview(data.dev_preview)
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Gagal mengirim ulang email. Silakan coba beberapa saat lagi.'
      )
    } finally {
      setResending(false)
    }
  }

  const fillDemo = (val: string) => {
    setIdentifier(val)
  }

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
          {!isSuccess ? (
            <>
              {/* Form Header */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                  <KeyRound className="w-3 h-3 text-indigo-600" />
                  Pemulihan Akses Akun
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  Lupa Kata Sandi?
                </h1>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Masukkan email terdaftar, NISN, atau NIP akun Anda untuk menerima tautan dan kode reset melalui email via Resend.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Forgot Password Request Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                    Email / NISN / NIP
                  </label>
                  <div className="relative">
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      type="text"
                      required
                      placeholder="Contoh: andi.pratama@... atau 0081234567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-card hover:shadow-card-hover font-display tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
                      <span>Mengirim Instruksi via Resend...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Kirim Tautan & Kode Reset</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Quick Fill */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono block">
                  Uji Coba Cepat (Akun Demo):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillDemo('andi.pratama@student.sman1unggul.sch.id')}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all cursor-pointer text-[11px] text-slate-700"
                  >
                    <span className="font-bold block text-slate-900">Andi (Siswa)</span>
                    <span className="text-[10px] text-slate-500 font-mono">andi.pratama@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('budi.santoso@sman1unggul.sch.id')}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all cursor-pointer text-[11px] text-slate-700"
                  >
                    <span className="font-bold block text-slate-900">Budi (Guru)</span>
                    <span className="text-[10px] text-slate-500 font-mono">budi.santoso@...</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Success Sent View */
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Email Reset Terkirim!
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Kami telah mengirimkan tautan dan kode verifikasi 6-digit ke alamat:
                </p>
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold mt-1">
                  {maskedEmail}
                </div>
              </div>

              {/* Resend Notice */}
              {resendNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Direct Reset Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const emailParam = devPreview?.target_email || identifier
                    const tokenParam = devPreview?.token ? `&token=${devPreview.token}` : ''
                    router.push(`/reset-password?email=${encodeURIComponent(emailParam)}${tokenParam}`)
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-card hover:shadow-card-hover font-display flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#c2ef4e]" />
                  <span>Buka Halaman Reset Kata Sandi</span>
                </button>

                {/* Resend Email Button with Cooldown */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-bold text-xs transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                      <span>Mengirim Ulang via Resend...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Kirim Ulang Email ({cooldown}s)</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
                      <span>Kirim Ulang Email (Resend)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Developer Testing Quick Card (When in development / debug) */}
              {devPreview && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-white text-left text-xs space-y-2 font-mono shadow-xs border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-300 font-bold text-[10px] uppercase">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c2ef4e]" />
                      Pratinjau Mode Pengembang
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 text-[9px]">
                      Lokal
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div>
                      <span className="text-slate-400">Kode 6-Digit: </span>
                      <strong className="text-[#c2ef4e] font-bold text-sm">{devPreview.short_code}</strong>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-400">Token URL: </span>
                      <span className="text-slate-300 text-[10px]">{devPreview.token}</span>
                    </div>
                  </div>
                  <Link
                    href={`/reset-password?token=${devPreview.token}&email=${encodeURIComponent(devPreview.target_email || '')}`}
                    className="inline-block text-[11px] font-bold text-[#c2ef4e] hover:underline pt-1"
                  >
                    &rarr; Klik di sini untuk simulasi 1-Klik Reset Tautan
                  </Link>
                </div>
              )}

              <p className="text-[11px] text-slate-400 pt-2">
                Tidak menerima email? Periksa folder Spam atau gunakan tombol Kirim Ulang di atas.
              </p>
            </div>
          )}

          {/* Footer Back to Login Link */}
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
