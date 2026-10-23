'use client'

import React, { useState, useEffect } from 'react'
import { FileText, ChevronRight } from 'lucide-react'

interface SectionTrack {
  id: string
  label: string
  code: string
}

const SECTIONS: SectionTrack[] = [
  { id: 'hero', label: 'Ikhtisar CBT', code: '01' },
  { id: 'keunggulan', label: 'Simulasi Workspace', code: '02' },
  { id: 'peran', label: 'Tiga Pilar Peran', code: '03' },
  { id: 'proctoring', label: 'Dual-Camera Topologi', code: '04' },
  { id: 'pricing', label: 'Paket Lisensi SPK', code: '05' },
  { id: 'faq', label: 'Tanya Jawab Legal', code: '06' },
]

export function ExamSpine() {
  const [activeSection, setActiveSection] = useState('hero')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100)
        setScrollProgress(progress)
      }

      // Check current section
      const sectionElements = SECTIONS.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      }))

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, el } = sectionElements[i]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.4) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Top scroll progress line (visible on all viewports) */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-[#c2ef4e] to-slate-900 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Exam Paper Progress Spine (Desktop only, >= 1280px) */}
      <nav
        aria-label="Navigasi Lembar Ujian Berjalan"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end"
      >
        <div
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3 flex flex-col items-center gap-3 transition-all duration-300"
        >
          {/* Header booklet stamp */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 w-full justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-700 uppercase">
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              {isExpanded && <span className="anim-fade">Lembar Penilaian</span>}
            </div>
            <span className="font-mono text-[10px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
              {Math.round(scrollProgress)}%
            </span>
          </div>

          {/* Section track steps */}
          <div className="flex flex-col gap-1 w-full">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-[#c2ef4e] text-slate-950 font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sec.code}
                  </span>
                  {isExpanded && (
                    <span className="text-xs whitespace-nowrap anim-fade font-medium">
                      {sec.label}
                    </span>
                  )}
                  {isActive && isExpanded && (
                    <ChevronRight className="w-3 h-3 text-[#c2ef4e] ml-auto shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Vertical mini progress bar */}
          <div className="w-1.5 h-12 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div
              className="w-full bg-slate-900 rounded-full transition-all duration-150"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </nav>
    </>
  )
}
