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
 *
 * Desktop contract (Jal's "perfect landing" rule): the whole surface fits
 * exactly one viewport — h-dvh, no page scroll. Content is sized to fit;
 * mobile keeps natural flow and may scroll.
 */

export const authLabelClass = 'block text-[13px] font-semibold text-[#1f1633] mb-1.5'

export const authInputClass =
  'w-full h-11 rounded-xl bg-white border border-[#cfcfdb] px-3.5 text-[15px] text-[#1f1633] placeholder:text-slate-500 focus:outline-none focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/25 transition-[border-color,box-shadow] duration-200 disabled:opacity-50'

export const authPrimaryButtonClass =
  'w-full h-12 rounded-xl bg-[#c2ef4e] hover:bg-[#b0dc3d] active:bg-[#a3d136] text-[#150f23] font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#150f23]/50 focus-visible:ring-offset-2'

const PANEL_FEATURES = [
  { icon: Video, label: 'Dua kamera' },
  { icon: Save, label: 'Autosave' },
  { icon: FileCheck2, label: 'Nilai bisa ditinjau' },
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
    <div className="min-h-dvh bg-[#f8fafc] font-sans text-[#1f1633] selection:bg-[#c2ef4e] selection:text-[#150f23] lg:grid lg:h-dvh lg:grid-cols-[minmax(380px,40%)_1fr] lg:overflow-hidden">
      {/* Brand panel — desktop only, compact and vertically centered */}
      <aside className="bg-grid-dots-dark relative hidden flex-col overflow-hidden bg-[#150f23] p-8 text-white lg:flex lg:h-full xl:p-10">
        <Link href="/" aria-label="EXAMIND Beranda" className="inline-flex w-fit">
          <ExamindLogo variant="lockup" theme="white" className="h-8 w-auto" priority />
        </Link>

        <div className="flex flex-1 items-center">
        <div className="max-w-md">
          <h2 className="font-display text-[28px] font-bold leading-[1.2] tracking-tight text-white">
            Ujian yang{' '}
            <span className="inline-block rounded bg-[#c2ef4e] px-2 py-0.5 text-[#150f23]">
              jujur
            </span>
            , hasil yang bisa dipertanggungjawabkan.
          </h2>
          <p className="mt-3 text-sm text-[#bdb8c0]">
            Platform ujian berbasis komputer untuk sekolah.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            {PANEL_FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#c2ef4e]">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold leading-tight text-white">
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex min-h-dvh flex-col lg:min-h-0">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-4 sm:px-6">
          <Link href="/" aria-label="EXAMIND Beranda" className="lg:hidden">
            <ExamindLogo variant="lockup" theme="color" className="h-8 w-auto" priority />
          </Link>
          <div className="ml-auto">{topRight}</div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-5 sm:px-6 lg:py-3">
          <div
            className={`anim-rise w-full ${
              width === 'xl' ? 'max-w-xl' : 'max-w-md'
            } rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-subtle-elevated sm:p-7`}
            style={{ '--anim-duration': '300ms' } as React.CSSProperties}
          >
            {children}
          </div>
        </main>

        <footer className="px-4 pb-4 text-center text-xs text-slate-500">
          &copy; 2026 EXAMIND — Platform ujian berbasis komputer untuk sekolah.
        </footer>
      </div>
    </div>
  )
}

export default AuthShell
