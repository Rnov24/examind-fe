import React from 'react'
import Link from 'next/link'
import { Video, Save, FileCheck2 } from 'lucide-react'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

/**
 * Shared frame for the auth surfaces (login, register, forgot-password).
 *
 * Two-polarity canvas per DESIGN.md: a midnight-violet brand panel on
 * desktop (hidden on mobile) and a daylight form column. The panel only
 * carries product truth — what the platform actually does — no stats,
 * no testimonials.
 */

export const authLabelClass = 'block text-[13px] font-semibold text-[#1f1633] mb-1.5'

export const authInputClass =
  'w-full h-11 rounded-xl bg-white border border-[#cfcfdb] px-3.5 text-[15px] text-[#1f1633] placeholder:text-slate-500 focus:outline-none focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/25 transition-[border-color,box-shadow] duration-200 disabled:opacity-50'

export const authPrimaryButtonClass =
  'w-full h-12 rounded-xl bg-[#c2ef4e] hover:bg-[#b0dc3d] active:bg-[#a3d136] text-[#150f23] font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#150f23]/50 focus-visible:ring-offset-2'

const PANEL_FEATURES = [
  {
    icon: Video,
    title: 'Pengawasan dua kamera',
    body: 'Kamera laptop dan kamera HP pendamping memantau jalannya ujian. AI menandai kejadian, pengawas yang mengambil keputusan.',
  },
  {
    icon: Save,
    title: 'Jawaban tersimpan otomatis',
    body: 'Setiap jawaban tersimpan di perangkat dan tersinkron ke server, sehingga pekerjaan siswa tidak hilang saat koneksi terganggu.',
  },
  {
    icon: FileCheck2,
    title: 'Penilaian yang bisa ditinjau',
    body: 'Esai dinilai dengan bantuan AI berdasarkan rubrik. Guru selalu dapat memeriksa kembali dan mengubah nilai.',
  },
]

interface AuthShellProps {
  children: React.ReactNode
  /** Optional action rendered at the top-right of the form column. */
  topRight?: React.ReactNode
  /** Card width: 'md' for login/forgot-password, 'xl' for register. */
  width?: 'md' | 'xl'
}

export function AuthShell({ children, topRight, width = 'md' }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1f1633] selection:bg-[#c2ef4e] selection:text-[#150f23] lg:grid lg:grid-cols-[minmax(400px,42%)_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="bg-grid-dots-dark relative hidden flex-col justify-between overflow-hidden bg-[#150f23] p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-screen xl:p-14">
        <Link href="/" aria-label="EXAMIND Beranda" className="inline-flex w-fit">
          <ExamindLogo variant="lockup" theme="white" className="h-9 w-auto" priority />
        </Link>

        <div className="max-w-md">
          <h2 className="font-display text-[32px] font-bold leading-[1.25] tracking-tight text-white">
            Ujian yang{' '}
            <span className="inline-block rounded bg-[#c2ef4e] px-2 py-0.5 text-[#150f23]">
              jujur
            </span>
            , hasil yang bisa dipertanggungjawabkan.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#bdb8c0]">
            EXAMIND adalah platform ujian berbasis komputer untuk sekolah, lengkap
            dengan pengawasan dua kamera dan penilaian esai berbantuan AI — dengan
            keputusan akhir tetap di tangan guru.
          </p>

          <ul className="mt-8 space-y-5">
            {PANEL_FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#c2ef4e]">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{feature.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-[#bdb8c0]">
                    {feature.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#bdb8c0]">
          Gunakan akun resmi yang diberikan sekolah Anda untuk masuk.
        </p>
      </aside>

      {/* Form column */}
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-5 sm:px-6">
          <Link href="/" aria-label="EXAMIND Beranda" className="lg:hidden">
            <ExamindLogo variant="lockup" theme="color" className="h-8 w-auto" priority />
          </Link>
          <div className="ml-auto">{topRight}</div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div
            className={`anim-rise w-full ${
              width === 'xl' ? 'max-w-xl' : 'max-w-md'
            } rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-subtle-elevated sm:p-8`}
            style={{ '--anim-duration': '300ms' } as React.CSSProperties}
          >
            {children}
          </div>
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-slate-500">
          &copy; 2026 EXAMIND — Platform ujian berbasis komputer untuk sekolah.
        </footer>
      </div>
    </div>
  )
}

export default AuthShell
