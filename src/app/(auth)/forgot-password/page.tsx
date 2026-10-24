'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { AuthShell, authLabelClass, authInputClass, authPrimaryButtonClass } from '@/components/auth/AuthShell'

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

  return (
    <AuthShell
      topRight={
        <Link
          href="/login"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[13px] font-semibold text-[#1f1633] transition-colors hover:border-[#cfcfdb]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kembali ke Masuk</span>
        </Link>
      }
    >
      {!isSuccess ? (
        <div className="space-y-5">
          {/* Form Header */}
          <div>
            <h1 className="font-display text-[22px] font-bold tracking-tight text-[#150f23]">
              Lupa Kata Sandi?
            </h1>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-900" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forgot Password Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-identifier" className={authLabelClass}>
                Email / NISN / NIP
              </label>
              <div className="relative">
                <input
                  id="forgot-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="nama@sekolah.sch.id"
                  className={`${authInputClass} pl-10`}
                />
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className={authPrimaryButtonClass}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Mengirim Instruksi...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Kirim Tautan &amp; Kode Reset</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back to Login Link */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center gap-1 px-2 text-[13px] font-semibold text-slate-600 transition-colors hover:text-[#150f23]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Success Sent View */
        <div className="space-y-5">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display text-xl font-bold text-[#150f23]">
                Email Reset Terkirim!
              </h1>
              <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-slate-500">
                Tautan &amp; kode reset dikirim ke:
              </p>
              <div className="mt-1 inline-block rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-1.5 font-mono text-[13px] font-bold text-[#1f1633]">
                {maskedEmail}
              </div>
            </div>
          </div>

          {/* Resend Notice */}
          {resendNotice && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{resendNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-900" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
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
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#150f23] text-sm font-bold text-white transition-colors hover:bg-[#1f1633] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5fc1] focus-visible:ring-offset-2"
            >
              <KeyRound className="h-4 w-4 text-[#c2ef4e]" aria-hidden="true" />
              <span>Buka Halaman Reset Kata Sandi</span>
            </button>

            {/* Resend Email Button with Cooldown */}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white text-[13px] font-bold text-[#1f1633] transition-colors hover:border-[#cfcfdb] disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {resending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>Mengirim Ulang...</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Kirim Ulang Email ({cooldown}s)</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Kirim Ulang Email</span>
                </>
              )}
            </button>
          </div>

          {/* Developer Testing Quick Card (When in development / debug) */}
          {devPreview && (
            <div className="mt-4 space-y-2 rounded-xl bg-[#150f23] p-4 text-left font-mono text-xs text-white">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#bdb8c0]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#c2ef4e]" aria-hidden="true" />
                  Pratinjau Mode Pengembang
                </span>
                <span className="rounded border border-[#362d59] bg-[#1f1633] px-1.5 py-0.5 text-[9px] text-[#bdb8c0]">
                  Lokal
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div>
                  <span className="text-[#bdb8c0]">Kode 6-Digit: </span>
                  <strong className="text-sm font-bold text-[#c2ef4e]">{devPreview.short_code}</strong>
                </div>
                <div className="truncate">
                  <span className="text-[#bdb8c0]">Token URL: </span>
                  <span className="text-[10px] text-slate-300">{devPreview.token}</span>
                </div>
              </div>
              <Link
                href={`/reset-password?token=${devPreview.token}&email=${encodeURIComponent(devPreview.target_email || '')}`}
                className="inline-block pt-1 text-[11px] font-bold text-[#c2ef4e] hover:underline"
              >
                &rarr; Klik di sini untuk simulasi 1-Klik Reset Tautan
              </Link>
            </div>
          )}

          <p className="pt-2 text-center text-xs text-slate-500">
            Tidak menerima email? Cek folder Spam.
          </p>

          {/* Footer Back to Login Link */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center gap-1 px-2 text-[13px] font-semibold text-slate-600 transition-colors hover:text-[#150f23]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  )
}
