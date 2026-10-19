'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Laptop,
  Brain,
  Camera,
  Smartphone,
  GraduationCap,
  BookOpen,
  Building2,
  Lock,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  Menu,
  Sparkles,
  Database,
  FileText,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

export default function LandingPage() {
  const { user, isHydrated, hydrate, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [isHydrated, hydrate])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const revealElements = document.querySelectorAll('[data-reveal], [data-reveal-line]')
    revealElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const userName = user?.full_name || user?.identifier || 'Pengguna'
  const isAuth = isAuthenticated()

  const dashboardRoute = (() => {
    if (user?.role === 'superadmin') return '/superadmin/dashboard'
    if (user?.role === 'admin') return '/admin/dashboard'
    if (user?.role === 'student') return '/student/dashboard'
    return '/teacher/dashboard'
  })()

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Interactive Hero Stage Tab State
  const [activeHeroTab, setActiveHeroTab] = useState<'exam' | 'monitor' | 'grading'>('exam')

  // Hero Interactive State - Tab 1 (Ruang Ujian Siswa)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A')
  const [autosaveStatus, setAutosaveStatus] = useState('Tersimpan di IndexedDB (<1s)')

  const selectOption = (opt: 'A' | 'B' | 'C') => {
    setSelectedOption(opt)
    setAutosaveStatus('Menyimpan ke IndexedDB...')
    setTimeout(() => {
      setAutosaveStatus('Tersimpan di IndexedDB (<1s)')
    }, 280)
  }

  // Hero Interactive State - Tab 2 (Live Proctoring Pengawas)
  const [incidentStatus, setIncidentStatus] = useState<'idle' | 'tolerated' | 'flagged'>('idle')
  const [previewSnapshot, setPreviewSnapshot] = useState(false)

  // Hero Interactive State - Tab 3 (Koreksi Esai & Socratic Tutor)
  const tutorPrompts = [
    {
      q: 'Kenapa opsi B kurang tepat?',
      a: 'Pada opsi B, perhitungan daya belum memperhitungkan efisiensi transformator 80%. Rumus yang tepat: Daya Masukan = Daya Keluaran / Efisiensi = 160 W / 0.8 = 200 W. Maka Kuat Arus Primer = 200 W / 220 V = 0,91 Ampere.',
    },
    {
      q: 'Bagaimana kaitan efisiensi dengan hukum termodinamika?',
      a: 'Berdasarkan Hukum Termodinamika II, tidak ada mesin kalor yang mampu mengubah seluruh energi kalor menjadi usaha mekanik secara sempurna (efisiensi 100%). Selalu ada energi yang dilepaskan ke reservoir dingin sebagai peningkatan entropi sistem.',
    },
    {
      q: 'Bagaimana AI menilai esai secara transparan?',
      a: 'EXAMIND mengoreksi draf esai berbasis Rubrik 4 Dimensi objektif: Pemahaman Konsep (5.0), Runtutan Argumen (5.0), Ketepatan Istilah Baku (5.0), dan Kejelasan Bahasa (5.0). Guru mata pelajaran memegang hak mutlak untuk meninjau dan mengubah skor.',
    },
  ]
  const [activeTutorPromptIdx, setActiveTutorPromptIdx] = useState(0)

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const faqs = [
    {
      q: 'Apakah peserta ujian yang menoleh otomatis didiskualifikasi oleh AI?',
      a: 'Tidak. AI EXAMIND tidak memiliki kewenangan memutus ujian siswa secara sepihak. Sistem hanya mencatat cap waktu dan snapshot bukti ke konsol pengawas. Keputusan verifikasi dan sanksi sepenuhnya berada di tangan guru pengawas (prinsip Human-in-the-Loop).',
    },
    {
      q: 'Bagaimana jika jaringan internet sekolah atau rumah peserta terputus saat ujian berlangsung?',
      a: 'Ujian berjalan tanpa kehilangan data. Mesin IndexedDB di peramban peserta merekam setiap ketukan dan perubahan jawaban seketika di penyimpanan lokal. Begitu sambungan internet pulih, sistem menyinkronkan data jawaban ke server secara otomatis.',
    },
    {
      q: 'Bagaimana EXAMIND melindungi privasi rekaman video peserta sesuai ketentuan hukum?',
      a: 'EXAMIND tunduk penuh pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Kamera hanya diaktifkan atas persetujuan eksplisit peserta, berkas snapshot dienkripsi, dan seluruh data biometrik dihapus permanen secara otomatis setelah 60 hari.',
    },
    {
      q: 'Apakah guru memiliki wewenang merevisi nilai esai yang diberikan oleh AI?',
      a: 'Ya, mutlak. AI hanya menyajikan draf penilaian awal berdasarkan rubrik 4 dimensi objektif beserta catatan alasan. Guru mata pelajaran memegang kendali penuh untuk meninjau, menyunting, atau merevisi nilai sebelum hasil diumumkan.',
    },
    {
      q: 'Mengapa pengadaan EXAMIND tidak menyediakan pembayaran kartu kredit langsung?',
      a: 'Sebagai platform institusi sekolah, kami menghormati tata kelola anggaran sekolah dan yayasan. Pembayaran diproses melalui mekanisme penawaran resmi, penerbitan SPK/MOU, faktur pajak institusi, dan transfer antar-rekening bank instansi dengan pendampingan Konsultan Edukasi.',
    },
  ]

  // Modal & Inquiry State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    packageType: 'Paket Institusi Terpadu',
    fullName: '',
    role: 'Wakil Kepala Sekolah Bidang Kurikulum',
    schoolName: '',
    whatsapp: '',
    studentCount: '300 - 800 Siswa (Paket Menengah)',
    notes: '',
  })

  const openInquiryModal = (pkgName?: string) => {
    if (pkgName && pkgName !== 'demo' && pkgName !== 'tech' && pkgName !== 'spk' && pkgName !== 'cs') {
      setInquiryForm((prev) => ({ ...prev, packageType: pkgName }))
    } else {
      setInquiryForm((prev) => ({ ...prev, packageType: 'Paket Institusi Terpadu (Konsultasi Demo)' }))
    }
    setSubmissionStatus(false)
    setIsInquiryModalOpen(true)
  }

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmissionStatus(true)
  }

  const directWhatsAppChat = () => {
    const phone = process.env.NEXT_PUBLIC_CS_WHATSAPP || '6281234567890'
    const text = encodeURIComponent(
      `Halo Tim Konsultan Edukasi EXAMIND, saya ${inquiryForm.fullName || 'Pihak Sekolah'} (${inquiryForm.role || 'Perwakilan Sekolah'}) dari ${inquiryForm.schoolName || 'Institusi Pendidikan'}. Kami ingin berkonsultasi mengenai pengadaan ${inquiryForm.packageType} untuk estimasi ${inquiryForm.studentCount}. Mohon info penjadwalan demo dan pengiriman draf penawaran resminya. Terima kasih.`
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-[#c2ef4e] selection:text-[#150f23] overflow-x-hidden">
      {/* Daylight Ambient Canvas Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-indigo-100/50 via-violet-50/30 to-transparent blur-3xl" />
        <div className="absolute top-[850px] -left-48 w-[450px] h-[450px] bg-slate-200/40 blur-3xl rounded-full" />
        <div className="absolute top-[1800px] -right-48 w-[550px] h-[550px] bg-violet-100/30 blur-3xl rounded-full" />
      </div>

      {/* STICKY HEADER NAV (Strict single-row, height 64px, <=96px budget) */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
          {/* Brand Wordmark & Tag */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none" aria-label="EXAMIND Beranda">
            <ExamindLogo variant="lockup" theme="color" className="h-7 w-auto shrink-0 select-none" priority />
            <div className="hidden sm:flex items-center border-l border-slate-200 pl-2.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">
                Platform CBT AI
              </span>
            </div>
          </Link>

          {/* Desktop Floating Pill Navigation (Finexy Family Aesthetic) */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-2xs">
            <a
              href="#fitur"
              className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-colors whitespace-nowrap"
            >
              Fitur Unggulan
            </a>
            <a
              href="#proctoring"
              className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-colors whitespace-nowrap"
            >
              Dual-Camera AI
            </a>
            <a
              href="#peran"
              className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-colors whitespace-nowrap"
            >
              Tiga Sudut Pandang
            </a>
            <a
              href="#biaya"
              className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Paket & Lisensi</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#c2ef4e] text-[#150f23] rounded-full">
                B2B SPK
              </span>
            </a>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-colors whitespace-nowrap"
            >
              Tanya Jawab
            </a>
          </nav>

          {/* Right Header Cluster (Status, Consultation, and Auth) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live CBT Status Pill */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem CBT Siap</span>
            </div>

            {/* Consultation CTA */}
            <button
              type="button"
              onClick={() => openInquiryModal('demo')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-800 shrink-0" />
              <span className="whitespace-nowrap">Jadwalkan Demo</span>
            </button>

            {/* Auth CTA Button */}
            {isAuth ? (
              <Link
                href={dashboardRoute}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#150f23] hover:bg-slate-800 text-white shadow-xs transition-colors whitespace-nowrap min-h-[40px] sm:min-h-0"
              >
                <span className="hidden sm:inline">Dashboard ({userName})</span>
                <span className="sm:hidden">Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#150f23] hover:bg-slate-800 text-white shadow-xs transition-colors whitespace-nowrap min-h-[40px] sm:min-h-0"
              >
                <Lock className="w-3.5 h-3.5 text-[#c2ef4e] shrink-0" />
                <span className="whitespace-nowrap">Masuk Portal</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-1 text-xs font-semibold text-slate-700">
              <a
                href="#fitur"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Fitur Unggulan
              </a>
              <a
                href="#proctoring"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Dual-Camera AI
              </a>
              <a
                href="#peran"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Tiga Sudut Pandang
              </a>
              <a
                href="#biaya"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-between"
              >
                <span>Paket & Lisensi Sekolah</span>
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#c2ef4e] text-[#150f23] rounded-full">
                  B2B SPK
                </span>
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Tanya Jawab
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  openInquiryModal('demo')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                <span>Jadwalkan Demo Sekolah</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION (Calm Daylight Fintech & Editorial Confidence) */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#150f23] text-[#c2ef4e] border border-[#362d59] text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c2ef4e] shrink-0" />
            <span>Platform CBT Ujian Sekolah Berbasis AI</span>
          </div>

          {/* Editorial Display Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#150f23] tracking-tight leading-[1.18] max-w-4xl mx-auto">
            Ujian online yang aman, diawasi AI, dan gampang dipakai.
          </h1>

          {/* Subhead Prose */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            EXAMIND menggabungkan pengawasan AI Dual-Camera beretika, pembuatan bank soal kurikulum, dan koreksi esai otomatis rubrik 4 dimensi. Menjamin objektivitas penilaian dan ketenangan peserta tanpa diskualifikasi sepihak.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => openInquiryModal('demo')}
              className="px-6 py-3.5 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-3 group cursor-pointer"
            >
              <span>Jadwalkan Demo Sekolah</span>
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#c2ef4e] group-hover:text-[#150f23] transition-colors">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>

            <a
              href="#biaya"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm transition-colors shadow-2xs"
            >
              Lihat Skema Pengadaan & SPK
            </a>
          </div>

          {/* Trust & Capability Strip (Honest values only, no invented metrics) */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium border-t border-slate-200/80 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Human-in-the-Loop Proctoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Autosave Offline IndexedDB</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#6a5fc1] shrink-0" />
              <span>Koreksi Esai Rubrik 4D</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Kepatuhan UU PDP No. 27/2022</span>
            </div>
          </div>
        </div>

        {/* HERO INTERACTIVE PRODUCT STAGE (Finexy Aesthetic Double-Bezel Stage) */}
        <div id="fitur" data-reveal className="max-w-6xl mx-auto mt-12 scroll-mt-24">
          <h2 className="sr-only">Simulasi interaktif antarmuka ujian siswa dan pengawas</h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-100/90 p-2 sm:p-3 shadow-cardHover">
            <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
              {/* Window Header Strip */}
              <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-mono text-slate-500 shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>cbt.examind.sch.id/workspace</span>
                  </div>
                </div>

                {/* Finexy Top Pill Tabs Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold overflow-x-auto select-none shadow-2xs max-w-full touch-pan-x scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('exam')}
                    className={`shrink-0 min-h-[36px] sm:min-h-[40px] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                      activeHeroTab === 'exam'
                        ? 'bg-[#150f23] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ruang Ujian Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('monitor')}
                    className={`shrink-0 min-h-[36px] sm:min-h-[40px] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                      activeHeroTab === 'monitor'
                        ? 'bg-[#150f23] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Live Proctoring Pengawas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('grading')}
                    className={`shrink-0 min-h-[36px] sm:min-h-[40px] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                      activeHeroTab === 'grading'
                        ? 'bg-[#150f23] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Koreksi Esai & Rubrik 4D
                  </button>
                </div>
              </div>

              {/* Showcase Body */}
              <div className="p-5 sm:p-7 bg-[#f8fafc]/70 min-h-[440px]">
                {/* 1. TAB: RUANG UJIAN SISWA */}
                {activeHeroTab === 'exam' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Question Card */}
                    <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">
                            Penilaian Akhir Semester — Fisika Terapan XII
                          </span>
                          <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                            Peserta: Andi Pratama (NISN: 0081234567)
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums inline-block">
                            01:34:20 Tersisa
                          </span>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center justify-end gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {autosaveStatus}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs">
                            Soal #4
                          </span>
                          <span className="text-slate-500">• Pilihan Ganda (Bobot: 10 Poin)</span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
                          Sebuah transformator memiliki efisiensi 80% dengan daya keluaran 160 Watt. Jika tegangan primer 220 Volt, berapakah kuat arus primer transformator tersebut?
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => selectOption('A')}
                          className={`w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer ${
                            selectedOption === 'A'
                              ? 'border-[#150f23] bg-[#150f23] text-white font-medium shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>A. 0,91 Ampere</span>
                          {selectedOption === 'A' && (
                            <span className="text-xs bg-[#c2ef4e] text-[#150f23] px-2 py-0.5 rounded font-mono font-bold">
                              Pilihan Terpilih
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectOption('B')}
                          className={`w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer ${
                            selectedOption === 'B'
                              ? 'border-[#150f23] bg-[#150f23] text-white font-medium shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>B. 1,14 Ampere</span>
                          {selectedOption === 'B' && (
                            <span className="text-xs bg-[#c2ef4e] text-[#150f23] px-2 py-0.5 rounded font-mono font-bold">
                              Pilihan Terpilih
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectOption('C')}
                          className={`w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer ${
                            selectedOption === 'C'
                              ? 'border-[#150f23] bg-[#150f23] text-white font-medium shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>C. 0,72 Ampere</span>
                          {selectedOption === 'C' && (
                            <span className="text-xs bg-[#c2ef4e] text-[#150f23] px-2 py-0.5 rounded font-mono font-bold">
                              Pilihan Terpilih
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Dual-Feed Camera Indicators */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-900">Kamera Primer (Webcam 0°)</span>
                          <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ● WAJAH VALID
                          </span>
                        </div>
                        <div className="h-28 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 font-mono">
                          <Camera className="w-5 h-5 text-indigo-600" />
                          <span>Deteksi Wajah & Kehadiran (0°)</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-900">Kamera Sekunder (Ponsel 45°)</span>
                          <span className="text-indigo-700 font-mono text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            ● MEJA TERPANTAU
                          </span>
                        </div>
                        <div className="h-28 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 font-mono">
                          <Smartphone className="w-5 h-5 text-emerald-600" />
                          <span>Sudut Pandang Meja & Layar (45°)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TAB: LIVE PROCTORING PENGAWAS */}
                {activeHeroTab === 'monitor' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 text-xs">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Konsol Pengawas Kelas XII MIPA 1 (34 Siswa)
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5 font-mono">
                          WebSocket Hub Terhubung • Otoritas Penuh Pengawas Manusia
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Pengawasan Realtime
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Flagged Student Review Card */}
                      <div
                        className={`bg-white rounded-xl border p-4 sm:p-5 space-y-3 transition-colors shadow-xs ${
                          incidentStatus === 'tolerated'
                            ? 'border-emerald-300'
                            : incidentStatus === 'flagged'
                            ? 'border-rose-300'
                            : 'border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span
                            className={`font-bold flex items-center gap-1.5 ${
                              incidentStatus === 'tolerated'
                                ? 'text-emerald-700'
                                : incidentStatus === 'flagged'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {incidentStatus === 'idle' && <span>AI Flag: Gerakan Kepala ke Kanan (8 Detik)</span>}
                            {incidentStatus === 'tolerated' && <span>Status: Diverifikasi Wajar oleh Pengawas</span>}
                            {incidentStatus === 'flagged' && <span>Status: Ditandai untuk Klarifikasi Lanjutan</span>}
                          </span>
                          <span className="font-mono text-slate-500 text-xs">10:18:04 WIB</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          Siswa <strong>Rudi Hermawan</strong> terdeteksi menoleh ke luar frame kamera. Snapshot bukti tersimpan otomatis untuk verifikasi.
                          {incidentStatus === 'tolerated' && (
                            <span className="block mt-1 text-emerald-700 font-medium">
                              Catatan pengawas: Siswa membetulkan posisi kacamata, integritas valid.
                            </span>
                          )}
                          {incidentStatus === 'flagged' && (
                            <span className="block mt-1 text-rose-700 font-medium">
                              Catatan pengawas: Memerlukan panggilan klarifikasi interkom pengawas.
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setPreviewSnapshot(!previewSnapshot)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                          >
                            {previewSnapshot ? 'Tutup Bukti Snapshot' : 'Buka Bukti Snapshot'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIncidentStatus('tolerated')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              incidentStatus === 'tolerated'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            Toleransi Insiden (Bukan Curang)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIncidentStatus('flagged')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              incidentStatus === 'flagged'
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            Minta Klarifikasi Siswa
                          </button>
                        </div>

                        {previewSnapshot && (
                          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 mt-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                              <span>Bukti #084-RUDI</span>
                              <span>Kamera Primer + Sekunder</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-center text-xs text-slate-600 font-mono">
                              <div className="p-3 bg-white rounded border border-slate-200 flex flex-col items-center justify-center">
                                <Camera className="w-4 h-4 text-amber-600 mb-1" />
                                <span>Wajah Menoleh (Laptop)</span>
                              </div>
                              <div className="p-3 bg-white rounded border border-slate-200 flex flex-col items-center justify-center">
                                <Smartphone className="w-4 h-4 text-emerald-600 mb-1" />
                                <span>Meja Bersih (HP)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Normal Summary Card */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            33 Siswa Terkonfirmasi Wajar
                          </span>
                          <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs font-bold">
                            ● Tanpa Pelanggaran
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          Tidak terdeteksi perpindahan tab, suara mencurigakan, atau perangkat lain. Seluruh autosave lokal tersinkronisasi tanpa hambatan.
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Otoritas Diskualifikasi:</span>
                          <span className="text-slate-900 font-bold">Pengawas Manusia (Human-in-the-Loop)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TAB: KOREKSI ESAI & RUBRIK 4D */}
                {activeHeroTab === 'grading' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <span className="text-sm font-bold text-slate-900">Evaluasi Esai AI Rubrik 4 Dimensi</span>
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                          Skor Draf: 18.5 / 20.0
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-900">Pemahaman Konsep (5.0/5.0)</div>
                          <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Penjelasan hukum termodinamika tepat dan menyeluruh.
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-900">Runtutan Argumen (4.5/5.0)</div>
                          <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Alur logika sebab-akibat mesin Carnot runtut.
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-900">Ketepatan Istilah (4.5/5.0)</div>
                          <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Kosakata fisika kalor baku sesuai kaidah kurikulum.
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-900">Kejelasan Bahasa (4.5/5.0)</div>
                          <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Struktur kalimat efektif dan mudah dipahami.
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-violet-50 text-[#6a5fc1] border border-violet-200/80 text-xs font-semibold flex items-center justify-between">
                        <span>Hak Override Nilai Guru: Aktif</span>
                        <span className="font-mono text-[11px] underline cursor-pointer">Edit Nilai Draf</span>
                      </div>
                    </div>

                    <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 text-xs sm:text-sm">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-[#6a5fc1]" />
                          Socratic Tutor AI (Bimbingan Pasca-Ujian)
                        </span>
                        <span className="text-xs bg-violet-50 text-[#6a5fc1] border border-violet-200 px-2 py-0.5 rounded font-mono font-bold">
                          Konsultasi Mandiri
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {tutorPrompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setActiveTutorPromptIdx(pIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                              activeTutorPromptIdx === pIdx
                                ? 'bg-[#150f23] text-white font-bold'
                                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {p.q}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg text-xs sm:text-sm space-y-2.5 border border-slate-200">
                        <div className="text-indigo-700 font-bold">
                          Siswa: &ldquo;{tutorPrompts[activeTutorPromptIdx].q}&rdquo;
                        </div>
                        <div className="text-slate-800 leading-relaxed">
                          Tutor AI: &ldquo;{tutorPrompts[activeTutorPromptIdx].a}&rdquo;
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TELEMETRY STRIP (Finexy Daylight Architecture Anchor) */}
      <section className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
            <span className="font-bold text-slate-900 font-sans text-sm">
              Standar Integritas & Arsitektur CBT EXAMIND
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">Protokol:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">WebSocket Terenkripsi SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">Edge Cache:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">IndexedDB Lokal (0ms Lag)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">Hukum:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                UU PDP No. 27/2022
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BENTO GRID SECTION (Calm Daylight Fintech Asymmetry) */}
      <section id="proctoring" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div data-reveal className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-indigo-700 uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>Kemampuan Inti Platform</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#150f23] tracking-tight">
              Arsitektur ujian berintegritas tanpa friksi teknis
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Dirancang untuk mengatasi masalah utama ujian daring sekolah: kecurangan peserta, putusnya internet di tengah ujian, dan lamanya waktu koreksi esai guru.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Tile 1: Dual-Camera AI (Spans 7 cols) */}
            <div
              data-reveal
              className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#150f23] text-[#c2ef4e] flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    Tanpa Instal Aplikasi HP
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  AI Dual-Camera Proctoring (Laptop + Kamera Ponsel)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menutup titik buta webcam laptop secara menyeluruh. Siswa cukup memindai QR Code di layar ujian menggunakan kamera bawaan ponsel untuk mengaktifkan sudut meja dan keyboard (45°), sementara webcam laptop mengawasi wajah dan tatapan (0°).
                </p>
              </div>

              {/* Dual-Angle Diagram Strip */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    Kamera 0° (Laptop)
                  </span>
                  <p className="text-slate-500 text-[11px]">Memantau wajah, mata, dan kehadiran di depan layar.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    Kamera 45° (Ponsel)
                  </span>
                  <p className="text-slate-500 text-[11px]">Memantau permukaan meja, tangan, keyboard, dan layar.</p>
                </div>
              </div>
            </div>

            {/* Tile 2: IndexedDB Autosave (Spans 5 cols) */}
            <div
              data-reveal
              className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-card"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#150f23] text-[#c2ef4e] flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Autosave Offline IndexedDB (Anti-Hilang Data)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Setiap huruf esai dan jawaban pilihan ganda disimpan seketika di database lokal peramban siswa (&lt;1 detik). Ketika listrik sekolah padam atau jaringan WiFi putus, siswa tetap dapat melanjutkan pengerjaan dan data tersinkronisasi otomatis saat terhubung kembali.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero Data-Loss Teruji di Koneksi Tidak Stabil</span>
              </div>
            </div>

            {/* Tile 3: Bank Soal & Generator Kurikulum (Spans 5 cols) */}
            <div
              data-reveal
              className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-card"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#150f23] text-[#c2ef4e] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Bank Soal CBT & Generator Kurikulum
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Guru dapat merumuskan paket soal pilihan ganda, esai singkat, dan esai bertingkat dalam hitungan menit. Dilengkapi fitur pengacakan urutan soal, opsi jawaban, dan token ujian unik untuk mencegah kebocoran antar-kelas.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Format Standar: CBT Kurikulum Nasional</span>
                <span className="font-bold text-slate-800">PG + Esai + Rubrik</span>
              </div>
            </div>

            {/* Tile 4: Rubrik 4 Dimensi Koreksi Esai (Spans 7 cols) */}
            <div
              id="koreksi"
              data-reveal
              className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-card scroll-mt-20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#150f23] text-[#c2ef4e] flex items-center justify-center font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-violet-50 text-[#6a5fc1] border border-violet-200 rounded-full">
                    Otoritas Pendidik Penuh
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Koreksi Esai Otomatis & Rubrik 4 Dimensi
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Memangkas waktu koreksi esai guru hingga 80%. AI menganalisis draf jawaban esai berdasarkan 4 indikator objektif (Konsep, Argumen, Istilah Baku, Bahasa), memberikan skor draf dan catatan evaluasi. Guru tetap memegang otoritas penuh untuk meninjau dan mengubah nilai.
                </p>
              </div>

              {/* Rubric Badge Matrix */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">Konsep</span>
                  <span className="text-[10px] text-slate-500">Materi Tepat</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">Argumen</span>
                  <span className="text-[10px] text-slate-500">Alur Logika</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">Istilah</span>
                  <span className="text-[10px] text-slate-500">Bahasa Baku</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">Bahasa</span>
                  <span className="text-[10px] text-slate-500">Struktur Runtut</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIGA PERAN PENGGUNA SECTION */}
      <section id="peran" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div data-reveal className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Tiga Sudut Pandang</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#150f23] tracking-tight">
              Adil untuk siswa, efisien bagi guru, akuntabel bagi sekolah
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Sebuah ekosistem penilaian yang menghormati martabat peserta didik dan meringankan beban administrasi guru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD SISWA */}
            <div
              data-reveal
              className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 tracking-wider uppercase block">
                    PESERTA UJIAN
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Siswa Sekolah</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mengerjakan ujian dengan tenang tanpa ketakutan terlempar keluar dari sistem secara sepihak. Autosave IndexedDB memastikan jawaban tetap aman, sementara Socratic Tutor membimbing pemahaman konsep setelah hasil diumumkan.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Autosave per detik di peramban lokal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Kamera ponsel mudah tanpa instal aplikasi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Pembahasan interaktif Socratic Tutor</span>
                </li>
              </ul>
            </div>

            {/* CARD GURU */}
            <div
              data-reveal
              className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold text-indigo-700 tracking-wider uppercase block">
                    PENDIDIK & PENGAWAS
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Guru Mata Pelajaran</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Memangkas waktu koreksi lembar jawaban esai secara signifikan. Layar monitor live menyajikan status seluruh siswa secara seketika, dan guru memegang hak mutlak atas keputusan peninjauan nilai.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Koreksi esai otomatis rubrik 4 dimensi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Konsol pengawasan live seisi kelas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Otoritas penuh mengubah nilai draf AI</span>
                </li>
              </ul>
            </div>

            {/* CARD KEPALA SEKOLAH */}
            <div
              data-reveal
              className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#150f23] text-[#c2ef4e] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-700 tracking-wider uppercase block">
                    MANAJEMEN SEKOLAH
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Kepala Sekolah & Kurikulum</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Memastikan kredibilitas ujian sekolah terlindungi dari kecurangan massal. Seluruh data biometrik dikelola sesuai ketentuan UU Pelindungan Data Pribadi (UU PDP) dengan dokumen berita acara resmi.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Kepatuhan hukum UU PDP No. 27/2022</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Berita Acara & Rekap Nilai PDF resmi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tata kelola pengadaan institusi SPK/MOU</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & PENGADAAN SAAS B2B SECTION */}
      <section id="biaya" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div data-reveal className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider">
              Pengadaan Institusi B2B
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#150f23] tracking-tight">
              Skema lisensi resmi sekolah dan yayasan
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Pengadaan EXAMIND diproses secara resmi melalui Surat Perjanjian Kerja (SPK) atau MOU sekolah, faktur pajak institusi, dan transfer antar-rekening instansi. <strong className="text-slate-900 font-semibold">Kami tidak menggunakan sistem langganan kartu kredit publik</strong> untuk menjamin kesesuaian anggaran sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* TIER 1: RINTISAN */}
            <div
              data-reveal
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-card space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Sekolah Mandiri / Bimbel
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Paket Rintisan</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Untuk sekolah rintisan atau bimbel persiapan ujian.</p>
                </div>

                <div className="py-4 border-y border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Investasi Semester</div>
                  <div className="text-3xl font-extrabold font-mono text-[#150f23] tracking-tight">
                    Rp 3.500.000 <span className="text-xs font-normal text-slate-500">/ semester</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">Hingga 300 siswa aktif</div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Kamera Tunggal (Webcam Laptop)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Koreksi Pilihan Ganda Instan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Autosave Offline IndexedDB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ekspor Nilai Format Excel</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => openInquiryModal('Paket Rintisan')}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  Konsultasikan Paket Rintisan
                </button>
              </div>
            </div>

            {/* TIER 2: INSTITUSI TERPADU (PROMINENT FINE-CRAFT) */}
            <div
              data-reveal
              className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#150f23] flex flex-col justify-between shadow-cardHover relative space-y-6"
            >
              <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-xs font-bold bg-[#c2ef4e] text-[#150f23] shadow-sm font-mono border border-[#150f23]">
                Pilihan Utama Sekolah
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
                    Standar Institusi
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Institusi Terpadu</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Solusi komprehensif untuk SMP, SMA, dan SMK.</p>
                </div>

                <div className="py-4 border-y border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Investasi Semester</div>
                  <div className="text-3xl font-extrabold font-mono text-[#150f23] tracking-tight">
                    Rp 7.800.000 <span className="text-xs font-normal text-slate-500">/ semester</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">Hingga 1.500 siswa aktif</div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">AI Dual-Camera Proctoring</strong> (Laptop + HP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Koreksi Esai AI Rubrik 4 Dimensi</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Socratic Tutor AI</strong> Pasca-Ujian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live Monitoring WebSocket & Snapshot Flag</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Berita Acara & Transkrip Hasil PDF Resmi</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => openInquiryModal('Institusi Terpadu')}
                  className="w-full py-3 px-4 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                >
                  Jadwalkan Demo & Draf SPK
                </button>
                <p className="text-[11px] text-center text-slate-500">Termasuk sesi pelatihan teknis guru dan pengawas</p>
              </div>
            </div>

            {/* TIER 3: KONSORSIUM & YAYASAN */}
            <div
              data-reveal
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-card space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Yayasan & Dinas Pendidikan
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Konsorsium Yayasan</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Untuk yayasan multi-sekolah atau dinas pendidikan wilayah.</p>
                </div>

                <div className="py-4 border-y border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Skema Kemitraan</div>
                  <div className="text-3xl font-extrabold font-mono text-[#150f23] tracking-tight">
                    Kustom SPK <span className="text-xs font-normal text-slate-500">/ tahun</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">Kapasitas Multi-Sekolah Terpadu</div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Seluruh Fitur Paket Institusi Terpadu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Integrasi Basis Data Dapodik / Siswa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Sinkronisasi Private Server MySQL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pendampingan On-Site Ujian Serentak</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => openInquiryModal('Konsorsium Yayasan')}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  Hubungi Konsultan Kemitraan
                </button>
              </div>
            </div>
          </div>

          {/* Institutional Procurement Notice Box */}
          <div
            data-reveal
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-slate-900 text-sm sm:text-base block">
                  Tata kelola pengadaan resmi institusi pendidikan
                </span>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  Seluruh penerbitan lisensi dilengkapi dokumen penawaran resmi, SPK bermeterai, faktur pajak instansi, dan rekening bank resmi perusahaan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openInquiryModal('spk')}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Konsultasi Draf SPK
            </button>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div data-reveal className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#150f23] tracking-tight">
              Pertanyaan umum seputar pengadaan EXAMIND
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Jawaban transparan mengenai aspek hukum, teknis konektivitas, dan operasional pengawasan ujian.
            </p>
          </div>

          <div data-reveal className="divide-y divide-slate-200/80 border-y border-slate-200/80">
            {faqs.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-2 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:text-[#6a5fc1] transition-colors cursor-pointer"
                >
                  <span className="leading-snug">{item.q}</span>
                  <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-mono text-sm shrink-0">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="pt-2.5 pb-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL SITEMAP FOOTER */}
      <footer className="relative z-10 bg-white border-t border-slate-200/80 text-slate-600 text-xs py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <ExamindLogo variant="lockup" theme="color" className="h-7 w-auto shrink-0 select-none" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Platform Ujian Daring (CBT) Berintegritas Institusional Berbasis AI. Menjaga martabat ujian sekolah di Indonesia.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>UU PDP No. 27/2022 Patuh</span>
            </div>
          </div>

          {/* Kolom Fitur */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Teknologi utama</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <a href="#proctoring" className="hover:text-slate-900 transition-colors">
                  AI Dual-Camera Proctoring
                </a>
              </li>
              <li>
                <a href="#koreksi" className="hover:text-slate-900 transition-colors">
                  Koreksi Esai Rubrik 4 Dimensi
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-slate-900 transition-colors">
                  Autosave Offline IndexedDB
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-slate-900 transition-colors">
                  Socratic Tutor Pasca-Ujian
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom Pengadaan */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Pengadaan sekolah</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <a href="#biaya" className="hover:text-slate-900 transition-colors">
                  Paket Lisensi Institusi
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInquiryModal('demo')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Jadwalkan Demo Sekolah
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInquiryModal('spk')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Konsultasi Draf SPK / MOU
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={directWhatsAppChat}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Kontak Konsultan Edukasi
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom Legal & Akses */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Akses portal</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Masuk Portal CBT Siswa
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Konsol Guru & Pengawas
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Portal Administrasi Sekolah
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-900 transition-colors">
                  Pendaftaran Akun Sekolah
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>&copy; 2026 EXAMIND Technologies. Seluruh hak cipta dilindungi.</div>
          <div>Dirancang Khusus untuk Sekolah &amp; Institusi di Indonesia</div>
        </div>
      </footer>

      {/* SAAS INQUIRY MODAL (Accessible Dialog) */}
      {isInquiryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-inquiry-title"
          className="fixed inset-0 z-50 bg-[#150f23]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop button for outside click */}
          <button
            type="button"
            className="fixed inset-0 w-full h-full cursor-default -z-10 bg-transparent border-0"
            onClick={() => setIsInquiryModalOpen(false)}
            aria-label="Tutup jendela modal"
          />

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 relative">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#150f23] text-[#c2ef4e] flex items-center justify-center font-bold text-xs">
                  CS
                </div>
                <div>
                  <h2 id="modal-inquiry-title" className="text-base font-bold text-slate-900 tracking-tight">
                    Konsultasi pengadaan lisensi sekolah
                  </h2>
                  <p className="text-xs text-slate-500">Konsultan Edukasi EXAMIND Siap Membantu Kebutuhan Sekolah Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950">Tata Kelola Resmi:</strong> Pengadaan lisensi diproses menggunakan Surat Perjanjian Kerja (SPK) resmi sekolah dan transfer antar-rekening instansi.
                </div>
              </div>

              <form onSubmit={submitInquiry} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label htmlFor="inquiry-package" className="block font-semibold text-slate-700 mb-1">Paket yang Dipilih</label>
                  <input
                    id="inquiry-package"
                    type="text"
                    value={inquiryForm.packageType}
                    readOnly
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-semibold text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="inquiry-name" className="block font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar *</label>
                    <input
                      id="inquiry-name"
                      type="text"
                      required
                      value={inquiryForm.fullName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, fullName: e.target.value })}
                      placeholder="Contoh: Drs. Bambang Sutrisno, M.Pd."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#150f23] text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiry-role" className="block font-semibold text-slate-700 mb-1">Jabatan di Sekolah *</label>
                    <select
                      id="inquiry-role"
                      value={inquiryForm.role}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#150f23] text-slate-900 text-xs sm:text-sm outline-none"
                    >
                      <option value="Kepala Sekolah">Kepala Sekolah</option>
                      <option value="Wakil Kepala Sekolah Bidang Kurikulum">Wakil Kepala Sekolah Kurikulum</option>
                      <option value="Koordinator Asesmen / Ujian">Koordinator Asesmen / Ujian</option>
                      <option value="Kepala Laboratorium Komputer / IT">Kepala Lab Komputer / IT</option>
                      <option value="Pengurus Yayasan Pendidikan">Pengurus Yayasan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="inquiry-school" className="block font-semibold text-slate-700 mb-1">Nama Sekolah / Institusi *</label>
                    <input
                      id="inquiry-school"
                      type="text"
                      required
                      value={inquiryForm.schoolName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, schoolName: e.target.value })}
                      placeholder="Contoh: SMA Negeri 1 Teladan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#150f23] text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiry-whatsapp" className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Resmi *</label>
                    <input
                      id="inquiry-whatsapp"
                      type="tel"
                      required
                      value={inquiryForm.whatsapp}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, whatsapp: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#150f23] text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiry-count" className="block font-semibold text-slate-700 mb-1">Estimasi Jumlah Siswa</label>
                  <select
                    id="inquiry-count"
                    value={inquiryForm.studentCount}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, studentCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#150f23] text-slate-900 text-xs sm:text-sm outline-none"
                  >
                    <option value="< 300 Siswa (Paket Rintisan)">&lt; 300 Siswa (Paket Rintisan)</option>
                    <option value="300 - 800 Siswa (Paket Menengah)">300 - 800 Siswa (Paket Menengah)</option>
                    <option value="800 - 1.500 Siswa (Paket Institusi Terpadu)">800 - 1.500 Siswa (Paket Institusi Terpadu)</option>
                    <option value="> 1.500 Siswa (Konsorsium / Multi-Sekolah)">&gt; 1.500 Siswa (Konsorsium Yayasan)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inquiry-notes" className="block font-semibold text-slate-700 mb-1">Catatan Kebutuhan Ujian Terdekat</label>
                  <textarea
                    id="inquiry-notes"
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    rows={2}
                    placeholder="Contoh: Penilaian Akhir Semester untuk 650 siswa bulan depan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#150f23] text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm outline-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 px-4 bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span>Kirim Pengajuan Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={directWhatsAppChat}
                    className="w-full sm:w-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Hubungi WhatsApp</span>
                  </button>
                </div>
              </form>

              {/* Feedback Success State */}
              {submissionStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-1">
                  <p className="font-bold text-emerald-950">Permohonan Anda Berhasil Terkirim!</p>
                  <p className="text-xs text-emerald-700">
                    Konsultan Edukasi EXAMIND akan menghubungi nomor WhatsApp Anda dalam waktu maksimal 1x24 jam kerja untuk penjadwalan demo dan draf penawaran resmi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
