import Link from 'next/link'
import { ArrowLeft, LogIn, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Halaman Tidak Ditemukan | EXAMIND',
  description: 'Halaman yang kamu cari tidak terdaftar di EXAMIND.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#150f23] text-white relative overflow-hidden flex flex-col">
      {/* Ambient violet glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(106,95,193,0.22), transparent 70%)',
        }}
      />
      {/* Giant watermark 404 */}
      <div
        aria-hidden
        className="anim-fade pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        style={{ '--anim-duration': '800ms' } as React.CSSProperties}
      >
        <span className="font-black tracking-tight text-[38vw] sm:text-[26vw] leading-none text-white/[0.04]">
          404
        </span>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16">
        <div
          className="anim-rise inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-white/[0.06] border border-white/10 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#c2ef4e]"
          style={{ '--anim-duration': '400ms', '--anim-delay': '60ms' } as React.CSSProperties}
        >
          404 — Halaman tidak ditemukan
        </div>

        <h1
          className="anim-rise mt-6 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-2xl"
          style={{ '--anim-duration': '450ms', '--anim-delay': '160ms' } as React.CSSProperties}
        >
          Ruangan ini{' '}
          <span className="anim-pop inline-block bg-[#c2ef4e] text-slate-950 px-2.5 py-0.5 rounded-xs"
            style={{ '--anim-duration': '350ms', '--anim-delay': '420ms' } as React.CSSProperties}
          >
            tidak ada
          </span>
          .
        </h1>

        <p
          className="anim-rise mt-5 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl"
          style={{ '--anim-duration': '450ms', '--anim-delay': '260ms' } as React.CSSProperties}
        >
          Halaman yang kamu cari tidak terdaftar di EXAMIND. Mungkin tautannya
          salah ketik, atau halamannya sudah dipindahkan ke ruangan lain.
        </p>

        <div
          className="anim-rise mt-9 flex flex-wrap items-center justify-center gap-3.5"
          style={{ '--anim-duration': '450ms', '--anim-delay': '360ms' } as React.CSSProperties}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#c2ef4e] hover:bg-[#d3f56e] text-slate-950 font-bold text-sm transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
            <ArrowLeft className="w-4 h-4 anim-nudge-x rotate-180" aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-sm transition-colors"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Masuk ke Sistem</span>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 pb-8 text-center text-xs text-white/70 font-mono">
        EXAMIND — Sistem Ujian Online Berbasis AI
      </footer>
    </div>
  )
}
