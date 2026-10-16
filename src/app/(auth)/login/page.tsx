'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, user, isHydrated, hydrate } = useAuthStore()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false)

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

  const fillDemo = (loginUser: string, loginPass: string) => {
    setIdentifier(loginUser)
    setPassword(loginPass)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginSuccess(false)
    setErrorMessage('')
    setSessionExpiredNotice(false)

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
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Gagal masuk. Periksa kembali identifier dan kata sandi.'
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#c2ef4e] selection:text-slate-950 relative overflow-hidden">
      {/* Ambient Background Depth */}
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

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px]">Server CBT Online</span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div
          className="anim-rise bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-subtle-elevated p-6 sm:p-8 space-y-6 text-slate-900"
          style={{ '--anim-duration': '300ms' } as React.CSSProperties}
        >
          {/* Card Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e]"></span>
              Autentikasi Terpusat
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Masuk ke Portal Ujian
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Gunakan akun resmi sekolah Anda (NISN untuk Siswa, NIP untuk Guru/Admin).
            </p>
          </div>

          {/* Session Expired Alert */}
          {sessionExpiredNotice && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sesi Anda telah kedaluwarsa. Silakan masuk kembali.</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                NISN / NIP / Email / Nama Pengguna
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                required
                placeholder="Contoh: 0081234567 atau budi.santoso@..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/25 transition-[border-color,box-shadow,background-color] duration-200 ease-out shadow-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 font-mono">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/25 transition-[border-color,box-shadow,background-color] duration-200 ease-out shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || loginSuccess}
              className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-card font-display tracking-wide ${
                loginSuccess
                  ? 'bg-[#c2ef4e] text-slate-950 shadow-[0_0_16px_rgba(194,239,78,0.35)] cursor-default'
                  : loading
                  ? 'bg-slate-900 text-white opacity-75 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white cursor-pointer hover:shadow-card-hover'
              }`}
            >
              {loginSuccess ? (
                <span className="anim-pop inline-flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Berhasil Masuk</span>
                </span>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
                  <span>Memeriksa…</span>
                </>
              ) : (
                <span>Masuk ke Sistem Ujian</span>
              )}
            </button>

            {/* Registration Link */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500">
                Belum memiliki akun?{' '}
                <Link
                  href="/register"
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  Daftar dengan Kode Sekolah &rarr;
                </Link>
              </p>
            </div>
          </form>

          {/* Quick Demo Switcher — dev only, stripped from production builds */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Akses Cepat Uji Coba:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1-Klik Isi Data</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('andi.pratama@student.sman1unggul.sch.id', 'Siswa123!')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                    Andi Pratama
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-mono">
                    Siswa
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">0081234567</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('budi.santoso@sman1unggul.sch.id', 'Guru123!')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                    Budi Santoso
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 border border-indigo-200 font-mono">
                    Guru
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">Guru Fisika</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin@sman1unggul.sch.id', 'Admin123!')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                    Admin Sekolah
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-800 border border-amber-200 font-mono">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">SMA 1 Unggul</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('superadmin@examind.id', 'SuperAdmin123!')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                    SuperAdmin
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100/80 text-purple-800 border border-purple-200 font-mono">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">Platform Owner</p>
              </button>
            </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        <p>EXAMIND Platform • Dilindungi Protokol Dual-Proctoring & Standar Ujian Digital Nasional</p>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
