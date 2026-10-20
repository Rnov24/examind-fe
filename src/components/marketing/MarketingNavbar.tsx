'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

const NAV_LINKS = [
  { id: 'keunggulan', label: 'Keunggulan', href: '#keunggulan' },
  { id: 'peran', label: 'Peran', href: '#peran' },
  { id: 'proctoring', label: 'Proctoring', href: '#proctoring' },
  { id: 'pricing', label: 'Harga', href: '#pricing' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
] as const

type SectionId = (typeof NAV_LINKS)[number]['id']

/**
 * Floating pill navbar for the marketing landing page.
 *
 * Fixed at the top center as a rounded-full bar. A scrollspy
 * (IntersectionObserver with a rootMargin band around the viewport center)
 * tracks which section currently occupies the middle of the screen and
 * highlights its link with a lime pill background.
 */
export function MarketingNavbar() {
  const { user, isHydrated, hydrate, isAuthenticated } = useAuthStore()
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [isHydrated, hydrate])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // The band between 45% and 50% of the viewport height approximates the
    // viewport center: whichever section crosses it becomes active.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId)
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )

    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const isAuth = isAuthenticated()

  const dashboardRoute = (() => {
    if (user?.role === 'superadmin') return '/superadmin/dashboard'
    if (user?.role === 'admin') return '/admin/dashboard'
    if (user?.role === 'student') return '/student/dashboard'
    return '/teacher/dashboard'
  })()

  const linkClasses = (id: SectionId) =>
    `rounded-full px-3.5 py-1.5 transition-all duration-200 ${
      activeSection === id
        ? 'bg-[#c2ef4e] text-slate-950 shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`

  return (
    <div className="fixed inset-x-0 top-3 sm:top-4 z-50 flex justify-center px-3 sm:px-4">
      <div className="relative w-full max-w-3xl">
        <header className="flex items-center justify-between gap-2 rounded-full border border-slate-200 bg-white/90 py-2 pl-4 pr-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          {/* Brand */}
          <a href="#hero" className="flex shrink-0 items-center" aria-label="EXAMIND Beranda">
            <ExamindLogo variant="lockup" theme="color" className="h-7 w-auto shrink-0" priority />
          </a>

          {/* Desktop links */}
          <nav
            className="hidden items-center gap-1 text-[13px] font-semibold md:flex"
            aria-label="Navigasi utama"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setActiveSection(link.id)}
                aria-current={activeSection === link.id ? 'true' : undefined}
                className={linkClasses(link.id)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex shrink-0 items-center gap-1.5">
            {isAuth ? (
              <Link
                href={dashboardRoute}
                className="mkt-btn-press inline-flex items-center gap-1.5 rounded-full bg-[#c2ef4e] px-4 py-2 text-[13px] font-bold text-slate-950 shadow-xs hover:bg-[#b2e234]"
              >
                <span>Ke Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="mkt-btn-press inline-flex items-center gap-1.5 rounded-full bg-[#c2ef4e] px-4 py-2 text-[13px] font-bold text-slate-950 shadow-xs hover:bg-[#b2e234]"
              >
                <span>Mulai</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
              aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile panel */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full mt-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 md:hidden">
            <nav className="flex flex-col gap-1 text-sm font-semibold" aria-label="Navigasi seluler">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.id)
                    setIsMobileMenuOpen(false)
                  }}
                  aria-current={activeSection === link.id ? 'true' : undefined}
                  className={`rounded-2xl px-4 py-2.5 transition-colors duration-200 ${
                    activeSection === link.id
                      ? 'bg-[#c2ef4e] text-slate-950'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
