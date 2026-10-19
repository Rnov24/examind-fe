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

  // Interactive Hero Tab State
  const [activeHeroTab, setActiveHeroTab] = useState<'exam' | 'monitor' | 'grading'>('exam')

  // Hero Interactive State - Tab 1 (Ruang Ujian Siswa)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A')
  const [autosaveStatus, setAutosaveStatus] = useState('Tersimpan di IndexedDB (<1s)')

  const selectOption = (opt: 'A' | 'B' | 'C') => {
    setSelectedOption(opt)
    setAutosaveStatus('Menyimpan...')
    setTimeout(() => {
      setAutosaveStatus('Tersimpan di IndexedDB (<1s)')
    }, 250)
  }

  // Hero Interactive State - Tab 2 (Live Proctoring Guru)
  const [incidentStatus, setIncidentStatus] = useState<'idle' | 'tolerated' | 'flagged'>('idle')
  const [previewSnapshot, setPreviewSnapshot] = useState(false)

  // Hero Interactive State - Tab 3 (Koreksi Esai & Socratic Tutor)
  const tutorPrompts = [
    {
      q: 'Kenapa opsi B kurang tepat?',
      a: 'Bagus sekali pertanyaannya! Pada opsi B, kamu menghitung daya tanpa memperhitungkan efisiensi transformator 80%. Rumus yang tepat: Daya Masukan = Daya Keluaran / Efisiensi = 160 W / 0.8 = 200 W. Maka Kuat Arus Primer = 200 W / 220 V = 0,91 Ampere.',
    },
    {
      q: 'Bagaimana kaitan efisiensi dengan hukum termodinamika?',
      a: 'Berdasarkan Hukum Termodinamika II, tidak ada mesin kalor yang mampu mengubah seluruh energi kalor menjadi usaha mekanik secara sempurna (efisiensi 100%). Selalu ada energi yang terbuang ke reservoir dingin sebagai peningkatan entropi sistem.',
    },
    {
      q: 'Bagaimana AI menilai esai saya secara transparan?',
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
      a: 'Tidak. AI EXAMIND tidak memiliki kewenangan memutus ujian siswa. Sistem hanya mencatat cap waktu dan snapshot bukti ke konsol pengawas. Keputusan verifikasi dan sanksi sepenuhnya berada di tangan guru pengawas (prinsip Human-in-the-Loop).',
    },
    {
      q: 'Bagaimana jika jaringan internet sekolah atau rumah peserta terputus saat ujian berlangsung?',
      a: 'Ujian berjalan lancar tanpa kehilangan data. Mesin IndexedDB di peramban peserta merekam setiap perubahan jawaban seketika. Begitu sambungan internet pulih, sistem secara otomatis menyinkronkan data jawaban ke server.',
    },
    {
      q: 'Bagaimana EXAMIND melindungi privasi rekaman video peserta sesuai ketentuan hukum?',
      a: 'EXAMIND tunduk penuh pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Kamera hanya diaktifkan atas persetujuan eksplisit peserta, berkas snapshot dienkripsi, dan seluruh data biometrik dihapus permanen secara otomatis setelah 60 hari.',
    },
    {
      q: 'Apakah guru memiliki wewenang merevisi nilai esai yang diberikan oleh AI?',
      a: 'Ya, mutlak. AI hanya menyajikan draf penilaian awal berdasarkan rubrik 4 dimensi objektif beserta alasannya. Guru mata pelajaran memegang kendali penuh untuk meninjau, menyunting, atau merevisi nilai sebelum hasil diumumkan.',
    },
    {
      q: 'Mengapa pengadaan EXAMIND tidak menyediakan pembayaran kartu kredit langsung?',
      a: 'Sebagai penyedia platform institusi, kami menghormati tata kelola anggaran sekolah dan yayasan. Pembayaran diproses melalui mekanisme penawaran resmi, penerbitan SPK/MOU, faktur pajak institusi, dan transfer antar-rekening bank instansi.',
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#c2ef4e] selection:text-slate-950">
      {/* Ambient Background Depth & Subtle Radial Bleed */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl"></div>
        <div className="absolute top-[900px] -left-48 w-[500px] h-[500px] bg-blue-100/30 blur-3xl rounded-full"></div>
        <div className="absolute top-[1800px] -right-48 w-[600px] h-[600px] bg-indigo-100/30 blur-3xl rounded-full"></div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#hero" className="flex items-center gap-3 group" aria-label="EXAMIND Beranda">
            <ExamindLogo variant="lockup" theme="color" className="h-8 w-auto shrink-0" priority />
            <div className="border-l border-slate-200/80 pl-3 hidden sm:flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                Platform Ujian AI
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#keunggulan" className="hover:text-slate-900 transition-colors">Fitur Unggulan</a>
            <a href="#peran" className="hover:text-slate-900 transition-colors">Peran Pengguna</a>
            <a href="#proctoring" className="hover:text-slate-900 transition-colors">Dual-Camera AI</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <span>Paket & Lisensi</span>
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-[#c2ef4e] text-slate-950 rounded-xs font-mono">B2B SaaS</span>
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">Tanya Jawab</a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openInquiryModal('demo')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-900" />
              <span>Konsultasi Lisensi</span>
            </button>

            {isAuth ? (
              <Link
                href={dashboardRoute}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm transition-all"
              >
                <span>Dashboard ({userName})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Portal CBT</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {!isMobileMenuOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
              <a onClick={() => setIsMobileMenuOpen(false)} href="#keunggulan" className="py-2 hover:text-slate-900 transition-colors">Fitur Unggulan</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#peran" className="py-2 hover:text-slate-900 transition-colors">Peran Pengguna</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#proctoring" className="py-2 hover:text-slate-900 transition-colors">Dual-Camera AI</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#pricing" className="py-2 hover:text-slate-900 transition-colors flex items-center justify-between">
                <span>Paket & Lisensi</span>
                <span className="px-1.5 py-0.5 text-[11px] font-bold bg-[#c2ef4e] text-slate-950 rounded-xs font-mono">B2B SaaS</span>
              </a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#faq" className="py-2 hover:text-slate-900 transition-colors">Tanya Jawab</a>
            </nav>
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  openInquiryModal('demo')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-800 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-900" />
                <span>Konsultasi Lisensi</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1
            className="anim-rise text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto"
            style={{ '--anim-duration': '400ms', '--anim-delay': '80ms' } as React.CSSProperties}
          >
            Satu Platform Ujian Berstandar Institusi.<br className="hidden sm:inline" />
            <span
              className="anim-pop bg-[#c2ef4e] text-slate-950 px-2.5 py-0.5 rounded-xs inline-block font-black mt-1"
              style={{ '--anim-duration': '350ms', '--anim-delay': '240ms' } as React.CSSProperties}
            >
              Bebas Kecurangan
            </span>,
            Adil bagi Siswa, Efisien bagi Guru.
          </h1>

          <p
            className="anim-rise text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
            style={{ '--anim-duration': '400ms', '--anim-delay': '180ms' } as React.CSSProperties}
          >
            Menggabungkan pengawasan AI Dual-Camera beretika, pembuatan soal adaptif, dan koreksi esai otomatis rubrik 4 dimensi. Menjamin objektivitas penilaian dan ketenangan peserta ujian tanpa risiko diskualifikasi sepihak.
          </p>

          <div
            className="anim-rise flex flex-wrap items-center justify-center gap-3.5 pt-2"
            style={{ '--anim-duration': '400ms', '--anim-delay': '280ms' } as React.CSSProperties}
          >
            <button
              onClick={() => openInquiryModal('demo')}
              className="px-6 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Jadwalkan Demo Sekolah</span>
              <ArrowRight className="w-4 h-4 anim-nudge-x" />
            </button>

            <a
              href="#pricing"
              className="px-5 py-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-all shadow-xs"
            >
              Lihat Skema Biaya & Lisensi
            </a>
          </div>

          <div
            className="anim-rise pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium border-t border-slate-200 max-w-4xl mx-auto"
            style={{ '--anim-duration': '400ms', '--anim-delay': '380ms' } as React.CSSProperties}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Standar Integritas 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Human-in-the-Loop Proctoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-600" />
              <span>Penyimpanan Offline Aman (IndexedDB)</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Koreksi Esai Objektif (Rubrik 4D)</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE HERO STAGE / MOCKUP SHOWCASE */}
        <div id="keunggulan" data-reveal className="max-w-6xl mx-auto mt-14 scroll-mt-24">
          <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden backdrop-blur-md">
            {/* Window Header Bar */}
            <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                </div>
                <span className="text-xs font-mono text-slate-500">cbt.examind.sch.id/workspace</span>
              </div>

              {/* Stage Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold overflow-x-auto shadow-xs">
                <button
                  onClick={() => setActiveHeroTab('exam')}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    activeHeroTab === 'exam'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ruang Ujian Siswa
                </button>
                <button
                  onClick={() => setActiveHeroTab('monitor')}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    activeHeroTab === 'monitor'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Proctoring Pengawas
                </button>
                <button
                  onClick={() => setActiveHeroTab('grading')}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    activeHeroTab === 'grading'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Koreksi Esai & Socratic Tutor
                </button>
              </div>
            </div>

            {/* Showcase Content Body */}
            <div className="p-6 md:p-8 bg-slate-50/60 min-h-[420px]">
              {/* 1. TAB: RUANG UJIAN SISWA */}
              {activeHeroTab === 'exam' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-sm font-bold text-slate-900">Penilaian Akhir Semester — Fisika Terapan XII</span>
                        <p className="text-xs text-slate-500 mt-0.5">Peserta: Andi Pratama (NISN: 0081234567)</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">01:34:20 Tersisa</span>
                        <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {autosaveStatus}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs">Soal #4</span>
                        <span className="text-slate-500">• Pilihan Ganda (Bobot: 10 Poin)</span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
                        Sebuah transformator memiliki efisiensi 80% dengan daya keluaran 160 Watt. Jika tegangan primer 220 Volt, berapakah kuat arus primer transformator tersebut?
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => selectOption('A')}
                        className={`w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer ${
                          selectedOption === 'A'
                            ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span>A. 0,91 Ampere</span>
                        {selectedOption === 'A' && <span className="text-xs bg-white text-slate-900 px-2.5 py-0.5 rounded font-bold">Jawaban Dipilih</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => selectOption('B')}
                        className={`w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer ${
                          selectedOption === 'B'
                            ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span>B. 1,14 Ampere</span>
                        {selectedOption === 'B' && <span className="text-xs bg-white text-slate-900 px-2.5 py-0.5 rounded font-bold">Jawaban Dipilih</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => selectOption('C')}
                        className={`w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer ${
                          selectedOption === 'C'
                            ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span>C. 0,72 Ampere</span>
                        {selectedOption === 'C' && <span className="text-xs bg-white text-slate-900 px-2.5 py-0.5 rounded font-bold">Jawaban Dipilih</span>}
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">Kamera Primer (Laptop)</span>
                        <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">● WAJAH TERVERIFIKASI</span>
                      </div>
                      <div className="h-28 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 font-mono">
                        <Camera className="w-5 h-5 text-slate-400" />
                        <span>Sudut Pandang Wajah Peserta (0°)</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">Kamera Sekunder (HP)</span>
                        <span className="text-indigo-700 font-mono text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">● MEJA & LAYAR AKTIF</span>
                      </div>
                      <div className="h-28 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 font-mono">
                        <Smartphone className="w-5 h-5 text-slate-400" />
                        <span>Sudut Pandang Meja & Layar (45°)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TAB: LIVE MONITORING GURU */}
              {activeHeroTab === 'monitor' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Konsol Pengawas Kelas XII MIPA 1 (34 Siswa)</h3>
                      <p className="text-slate-500 text-xs mt-0.5">WebSocket Hub Aktif • Status Integritas Rata-Rata: 98.2%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pengawasan Realtime
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Siswa <strong>Rudi Hermawan</strong> terdeteksi menoleh ke luar frame. Snapshot tersimpan otomatis.
                        {incidentStatus === 'tolerated' && (
                          <span className="block mt-1 text-emerald-700 font-medium">
                            Catatan pengawas: Siswa membetulkan posisi kacamata, integritas valid.
                          </span>
                        )}
                        {incidentStatus === 'flagged' && (
                          <span className="block mt-1 text-rose-700 font-medium">
                            Catatan pengawas: Memerlukan klarifikasi interkom pengawas.
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setPreviewSnapshot(!previewSnapshot)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                        >
                          {previewSnapshot ? 'Tutup Bukti Snapshot' : 'Buka Bukti Snapshot'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIncidentStatus('tolerated')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
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
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
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
                        Tidak terdeteksi perpindahan tab, suara mencurigakan, atau perangkat sekunder. Seluruh autosave lokal tersinkronisasi.
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Otoritas Diskualifikasi:</span>
                        <span className="text-slate-900 font-bold">Otoritas Penuh Pengawas (Human-in-the-Loop)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TAB: KOREKSI ESAI & TUTOR */}
              {activeHeroTab === 'grading' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <span className="text-sm font-bold text-slate-900">Evaluasi Esai AI Rubrik 4 Dimensi</span>
                      <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">Skor: 18.5 / 20.0</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">Pemahaman Konsep (5.0/5.0)</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">Penjelasan hukum termodinamika tepat dan menyeluruh.</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">Runtutan Argumen (4.5/5.0)</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">Alur logika sebab-akibat mesin Carnot runtut.</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">Ketepatan Istilah (4.5/5.0)</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">Kosakata fisika kalor baku sesuai kaidah.</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">Kejelasan Bahasa (4.5/5.0)</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">Struktur kalimat efektif dan mudah dipahami.</div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 text-xs sm:text-sm">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-purple-600" />
                        Socratic Tutor AI (Bimbingan Belajar Siswa)
                      </span>
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded font-mono font-bold">
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
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.q}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg text-xs sm:text-sm space-y-2.5 border border-slate-200">
                      <div className="text-indigo-700 font-bold">
                        Siswa: "{tutorPrompts[activeTutorPromptIdx].q}"
                      </div>
                      <div className="text-slate-800 leading-relaxed">
                        Tutor AI: "{tutorPrompts[activeTutorPromptIdx].a}"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TIGA PILAR PENGGUNA */}
      <section id="peran" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-14">
          <div data-reveal className="max-w-3xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tiga Sudut Pandang, Satu Ekosistem Harmonis
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Dirancang adil untuk peserta ujian, efisien bagi pendidik, dan akuntabel bagi pengambil kebijakan sekolah.
            </p>
          </div>

          {/* Ecosystem Baseline & Roles Container */}
          <div className="relative pl-7 sm:pl-8 md:pl-0">
            {/* Desktop Ecosystem Baseline (Horizontal) */}
            <div className="hidden md:block relative mb-6">
              <div
                data-reveal-line
                className="ecosystem-baseline-h absolute top-1/2 left-0 right-0 h-px bg-slate-200 -translate-y-1/2"
              />
              <div className="grid grid-cols-3 gap-6 relative">
                <div className="flex items-center pl-6">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white shrink-0" />
                </div>
                <div className="flex items-center pl-6">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white shrink-0" />
                </div>
                <div className="flex items-center pl-6">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-white shrink-0" />
                </div>
              </div>
            </div>

            {/* Mobile Vertical Ecosystem Baseline Line */}
            <div
              data-reveal-line
              className="md:hidden ecosystem-baseline-v absolute left-3.5 top-6 bottom-8 w-px bg-slate-200"
            />

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CARD SISWA */}
              <div
                data-reveal
                style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
                className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                {/* Mobile Node Dot */}
                <div className="md:hidden absolute -left-3.5 top-7 -translate-x-1/2 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white shrink-0" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-emerald-600 uppercase">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>PESERTA UJIAN</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Siswa (Peserta Ujian)</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Fokus mengerjakan ujian tanpa kecemasan teknis. Autosave IndexedDB menjamin jawaban tidak pernah hilang meski aliran listrik atau koneksi WiFi terputus. Setelah ujian, Socratic Tutor memandu pemahaman konsep secara mendalam.
                  </p>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Zero Data-Loss: Jawaban tersimpan di peramban seketika</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ketenangan Mental: Tanpa penutupan paksa ujian sepihak</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Socratic Tutor: Pembahasan interaktif langkah demi langkah</span>
                  </li>
                </ul>
              </div>

              {/* CARD GURU */}
              <div
                data-reveal
                style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
                className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                {/* Mobile Node Dot */}
                <div className="md:hidden absolute -left-3.5 top-7 -translate-x-1/2 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white shrink-0" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-indigo-600 uppercase">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>PENDIDIK</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Guru & Tim Pengawas</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Memangkas hingga 80% beban administrasi koreksi. Generator soal berbasis kurikulum merumuskan paket soal dalam hitungan detik. AI mengevaluasi esai secara objektif, sementara guru tetap memegang otoritas penuh penyesuaian nilai.
                  </p>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Generator Paket Soal: Pilihan ganda & esai siap pakai</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live Proctoring: Pantau seluruh kelas dalam satu layar konsol</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Otoritas Mutlak: Guru bebas merevisi nilai draf AI kapan saja</span>
                  </li>
                </ul>
              </div>

              {/* CARD SEKOLAH */}
              <div
                data-reveal
                style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
                className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                {/* Mobile Node Dot */}
                <div className="md:hidden absolute -left-3.5 top-7 -translate-x-1/2 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-white shrink-0" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-purple-600 uppercase">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>INSTITUSI</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kepala Sekolah & Tim Asesmen</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Menjamin reputasi integritas dan kepatuhan hukum institusi. Seluruh data biometrik terlindungi sesuai UU Pelindungan Data Pribadi (UU PDP). Cetak Berita Acara dan Transkrip Nilai resmi instansi dalam satu klik.
                  </p>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Kepatuhan Hukum: Tunduk penuh pada UU PDP No. 27/2022</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dokumentasi Legal: Berita Acara & Transkrip Nilai PDF resmi</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Analitik Mutu: Komparasi capaian kompetensi antar-kelas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL-CAMERA DETAIL */}
      <section id="proctoring" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div data-reveal className="max-w-3xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bagaimana AI Dual-Camera Mengamankan Ruang Ujian
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Menutup titik buta kamera tunggal secara menyeluruh tanpa mewajibkan instalasi aplikasi rumit di ponsel peserta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* LEFT: MONITORING CONSOLE (FLATTENED) */}
            <div
              data-reveal
              style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
              className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Header Bar */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Topologi Pengawasan Kamera Ganda</span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-mono font-bold">
                  ● Sinkronisasi Aktif
                </span>
              </div>

              {/* Dual-Feed Area with Sync Bridge */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-white">
                {/* Kamera Primer (0°) */}
                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-mono text-xs font-bold">
                    <Camera className="w-4 h-4" />
                    <span>Kamera Primer (0°)</span>
                  </div>
                  <div className="text-sm text-slate-900 font-bold">Webcam Laptop Peserta</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Memantau kehadiran wajah, arah tatapan mata, serta mendeteksi jika peserta meninggalkan meja ujian.
                  </p>
                </div>

                {/* Kamera Sekunder (45°) */}
                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>Kamera Sekunder (45°)</span>
                  </div>
                  <div className="text-sm text-slate-900 font-bold">Ponsel Siswa via QR Code</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Memantau permukaan meja, keyboard, tangan, dan layar tanpa perlu memasang aplikasi tambahan.
                  </p>
                </div>

                {/* Sync Bridge: Horizontal on sm+, Vertical on <sm */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  aria-hidden="true"
                >
                  <div className="bg-white border border-slate-200 shadow-xs rounded-full p-1.5 flex items-center justify-center">
                    <div className="relative flex items-center justify-center w-4 h-14 sm:w-16 sm:h-4">
                      {/* Horizontal track line (sm+) */}
                      <div className="hidden sm:block absolute inset-x-1 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 rounded-full" />
                      {/* Vertical track line (<sm) */}
                      <div className="sm:hidden block absolute inset-y-1 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 rounded-full" />
                      {/* Traveling sync pulse dot */}
                      <span className="sync-pulse-dot w-2.5 h-2.5 rounded-full bg-[#c2ef4e] border border-emerald-600 shadow-[0_0_6px_rgba(194,239,78,0.9)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Footer Strip: Transmission Bar */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Transmisi Data: Protokol WebSocket Terenkripsi SSL</span>
                <span className="font-mono text-slate-900 font-bold text-xs">Latensi Teruji &lt; 200 ms</span>
              </div>
            </div>

            {/* RIGHT: NUMBERED STEPS */}
            <div
              data-reveal
              style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
              className="lg:col-span-6 space-y-8"
            >
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Kemudahan Akses Tanpa Instalasi Aplikasi
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                    Peserta cukup membuka kamera bawaan ponsel dan memindai QR Code di layar ujian. Streaming langsung aktif di peramban tanpa membebani memori penyimpanan perangkat siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Cakupan Meja dan Layar Menyeluruh
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                    Penempatan sudut 45 derajat memastikan seluruh area kerja tangan peserta dan sisi layar terpantau jelas, menutup celah pemakaian catatan fisik maupun ponsel sekunder.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Otoritas Penuh Pengawas Manusia
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                    AI berfungsi sebagai sistem peringatan dini, bukan penentu hukuman. Setiap peristiwa disajikan dalam bentuk bukti snapshot dan cap waktu agar pengawas dapat mengambil keputusan yang adil dan beretika.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & LISENSI SAAS */}
      <section id="pricing" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white text-slate-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-14">
          <div data-reveal className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider border border-slate-200">
              Pengadaan Institusi B2B
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Paket & Lisensi SaaS Resmi Sekolah
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              EXAMIND bermitra resmi melalui Surat Perjanjian Kerja (SPK) atau MOU sekolah.{' '}
              <strong className="text-slate-900">Kami tidak menyediakan sistem pembayaran kartu kredit publik</strong>. Seluruh proses pengadaan diurus melalui penawaran resmi, faktur pajak institusi, dan transfer antar-rekening instansi dengan pendampingan Konsultan Edukasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* TIER 1: STARTER */}
            <div
              data-reveal
              style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
              className="p-7 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-300 transition-all text-slate-900"
            >
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Sekolah Mandiri</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Paket Rintisan & Bimbel</h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">Untuk sekolah rintisan, SMP swasta, atau bimbel persiapan ujian.</p>
                </div>

                <div className="py-4 border-y border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Investasi Semester</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    Rp 3.500.000 <span className="text-xs font-normal text-slate-500">/ smt</span>
                  </div>
                  <div className="text-xs text-slate-500">Hingga 300 siswa aktif</div>
                </div>

                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-900 font-medium">Kamera Tunggal (Webcam Laptop)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Koreksi Pilihan Ganda Instan</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>IndexedDB Zero Data-Loss Autosave</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ekspor Rekapitulasi Nilai Excel</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => openInquiryModal('Paket Rintisan & Bimbel')}
                  className="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Konsultasikan Paket Dasar
                </button>
                <p className="text-xs text-center text-slate-500">Terhubung langsung dengan Konsultan Edukasi</p>
              </div>
            </div>

            {/* TIER 2: INSTITUSI PRO */}
            <div
              data-reveal
              style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
              className="p-7 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between space-y-6 shadow-xl relative text-slate-900"
            >
              <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-xs font-bold bg-[#c2ef4e] text-slate-950 shadow-sm font-mono border border-slate-900">
                Paling Direkomendasikan
              </div>

              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">Standar Institusi</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Institusi Terpadu</h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">Solusi komprehensif untuk SMP, SMA, dan SMK terakreditasi.</p>
                </div>

                <div className="py-4 border-y border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Investasi Semester</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    Rp 7.800.000 <span className="text-xs font-normal text-slate-500">/ smt</span>
                  </div>
                  <div className="text-xs text-slate-500">Hingga 1.500 siswa aktif</div>
                </div>

                <ul className="space-y-3 text-sm text-slate-800">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">AI Dual-Camera Proctoring</strong> (Laptop + HP)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">AI Essay Grading Rubrik 4 Dimensi</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Socratic Tutor AI</strong> Pembahasan Pasca-Ujian</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live Proctoring WebSocket & Flag Snapshot</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Berita Acara & Transkrip Hasil PDF Resmi</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => openInquiryModal('Institusi Terpadu')}
                  className="w-full py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Jadwalkan Demo & Ajukan Penawaran SPK
                </button>
                <p className="text-xs text-center text-slate-500">Sudah termasuk sesi pelatihan guru dan pengawas</p>
              </div>
            </div>

            {/* TIER 3: ENTERPRISE */}
            <div
              data-reveal
              style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
              className="p-7 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-300 transition-all text-slate-900"
            >
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Konsorsium & Yayasan</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Enterprise & Dinas Pendidikan</h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">Untuk yayasan besar multi-cabang atau dinas pendidikan wilayah.</p>
                </div>

                <div className="py-4 border-y border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Skema Kemitraan</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    Kustom SPK <span className="text-xs font-normal text-slate-500">/ tahun</span>
                  </div>
                  <div className="text-xs text-slate-500">Kapasitas Siswa Tanpa Batas (Multi-Sekolah)</div>
                </div>

                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-900 font-medium">Seluruh Fitur Paket Institusi Terpadu</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Private Server / On-Premise MySQL Sync</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Integrasi Database Siswa & Dapodik</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pendampingan On-Site Ujian Serentak</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>SLA 99.9% & Dedicated Support Engineer</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => openInquiryModal('Enterprise & Dinas')}
                  className="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Hubungi Tim Kemitraan Strategis
                </button>
                <p className="text-xs text-center text-slate-500">Konsultasi nota kesepahaman dan pengadaan institusi</p>
              </div>
            </div>
          </div>

          {/* Procurement Guarantee Callout */}
          <div
            data-reveal
            style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
            className="p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-4 text-sm text-slate-900"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <span className="font-bold text-slate-900 text-base">Tata Kelola Pengadaan B2B Resmi (Tanpa Payment Gateway)</span>
                <p className="text-slate-600 mt-1 text-xs sm:text-sm">Pengadaan lisensi EXAMIND menggunakan dokumen legal SPK/MOU resmi sekolah, faktur pajak institusi, dan transfer antar-rekening instansi.</p>
              </div>
              <button
                onClick={() => openInquiryModal('spk')}
                className="shrink-0 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                Konsultasi Draf SPK / MOU
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50 scroll-mt-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div data-reveal className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan Umum Pengadaan EXAMIND
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Jawaban transparan seputar aspek teknis, hukum, dan operasional ujian sekolah.
            </p>
          </div>

          <div
            data-reveal
            style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
            className="divide-y divide-slate-200 border-y border-slate-200"
          >
            {faqs.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-2 text-left font-bold text-base sm:text-lg text-slate-900 flex items-center justify-between gap-4 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="leading-snug">{item.q}</span>
                  <span className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-mono text-base shrink-0 shadow-xs">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="pt-3 pb-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SQUIGGLY ACCENT DIVIDER */}
      <div data-reveal className="relative w-full overflow-hidden leading-none bg-slate-50 pt-4">
        <svg className="w-full h-4 sm:h-5 text-[#c2ef4e]" viewBox="0 0 1200 24" fill="none" preserveAspectRatio="none">
          <path
            d="M0,12 Q30,0 60,12 T120,12 T180,12 T240,12 T300,12 T360,12 T420,12 T480,12 T540,12 T600,12 T660,12 T720,12 T780,12 T840,12 T900,12 T960,12 T1020,12 T1080,12 T1140,12 T1200,12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* FOOTER */}
      <footer data-reveal className="relative z-10 bg-white border-t border-slate-200 text-slate-600 text-xs py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <ExamindLogo variant="lockup" theme="color" className="h-8 w-auto shrink-0" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Platform Ujian Daring AI Berintegritas Institusional. Mengamankan ujian sekolah dengan martabat, keadilan, dan teknologi pedagogis.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Teknologi Utama</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="#proctoring" className="hover:text-slate-900 transition-colors">AI Dual-Camera Proctoring</a></li>
              <li><a href="#peran" className="hover:text-slate-900 transition-colors">AI Essay Grading Rubrik 4D</a></li>
              <li><a href="#peran" className="hover:text-slate-900 transition-colors">Socratic Tutor Pembahasan</a></li>
              <li><a href="#hero" className="hover:text-slate-900 transition-colors">IndexedDB Autosave Engine</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pengadaan Sekolah</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="#pricing" className="hover:text-slate-900 transition-colors">Paket Lisensi Institusi</a></li>
              <li><button onClick={() => openInquiryModal('demo')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">Jadwalkan Demo Sekolah</button></li>
              <li><button onClick={() => openInquiryModal('spk')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">Draf Kontrak SPK / MOU</button></li>
              <li><button onClick={() => openInquiryModal('cs')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">Konsultasi Lisensi Institusi</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Kepatuhan Hukum</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tunduk pada ketentuan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Snapshot terenkripsi dan dihapus otomatis dalam 60 hari.
            </p>
            <div className="pt-2 text-xs text-slate-500 font-mono">
              FastAPI • PyTorch • Gemini 2.5 • Next.js
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 EXAMIND Technologies. Seluruh hak cipta dilindungi.
          </div>
          <div>
            Dirancang Khusus untuk Sekolah & Institusi di Indonesia
          </div>
        </div>
      </footer>

      {/* SAAS INQUIRY MODAL */}
      {isInquiryModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInquiryModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                  CS
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Konsultasi Pengadaan Lisensi Sekolah</h3>
                  <p className="text-xs text-slate-500">Konsultan Edukasi EXAMIND Siap Membantu Kebutuhan Institusi Anda</p>
                </div>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950">Tata Kelola Resmi:</strong> Pengadaan lisensi diproses menggunakan Surat Perjanjian Kerja (SPK) resmi sekolah dan transfer antar-rekening instansi.
                </div>
              </div>

              <form onSubmit={submitInquiry} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Paket yang Dipilih</label>
                  <input
                    type="text"
                    value={inquiryForm.packageType}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-semibold text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Nama Lengkap & Gelar Akademik *</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.fullName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, fullName: e.target.value })}
                      placeholder="Contoh: Drs. Bambang Sutrisno, M.Pd."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Jabatan di Sekolah *</label>
                    <select
                      value={inquiryForm.role}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 text-sm outline-none"
                    >
                      <option value="Kepala Sekolah">Kepala Sekolah</option>
                      <option value="Wakil Kepala Sekolah Bidang Kurikulum">Wakil Kepala Sekolah Bidang Kurikulum</option>
                      <option value="Koordinator Asesmen / Ujian">Koordinator Asesmen / Ujian</option>
                      <option value="Kepala Laboratorium Komputer / IT">Kepala Laboratorium Komputer / IT</option>
                      <option value="Pengurus Yayasan Pendidikan">Pengurus Yayasan Pendidikan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Nama Sekolah / Institusi Pendidikan *</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.schoolName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, schoolName: e.target.value })}
                      placeholder="Contoh: SMA Negeri 1 Teladan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Nomor WhatsApp Kontak Resmi *</label>
                    <input
                      type="tel"
                      required
                      value={inquiryForm.whatsapp}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, whatsapp: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Estimasi Jumlah Siswa Peserta Ujian</label>
                  <select
                    value={inquiryForm.studentCount}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, studentCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 text-sm outline-none"
                  >
                    <option value="< 300 Siswa (Paket Rintisan)">&lt; 300 Siswa (Paket Rintisan)</option>
                    <option value="300 - 800 Siswa (Paket Menengah)">300 - 800 Siswa (Paket Menengah)</option>
                    <option value="800 - 1.500 Siswa (Paket Institusi Terpadu)">800 - 1.500 Siswa (Paket Institusi Terpadu)</option>
                    <option value="> 1.500 Siswa (Konsorsium / Multi-Sekolah)">&gt; 1.500 Siswa (Konsorsium / Multi-Sekolah)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Kebutuhan Khusus / Jadwal Ujian Terdekat</label>
                  <textarea
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    rows={2}
                    placeholder="Contoh: Rencana Penilaian Akhir Semester bulan depan untuk 650 siswa, memerlukan pelatihan teknis pengawas..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-none"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ajukan Jadwal Demo & Konsultasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={directWhatsAppChat}
                    className="w-full sm:w-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Hubungi via WhatsApp Resmi</span>
                  </button>
                </div>
              </form>

              {/* Feedback Success State */}
              {submissionStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center space-y-1">
                  <p className="font-bold text-emerald-950">Permohonan Anda Berhasil Terkirim!</p>
                  <p className="text-xs text-emerald-700">
                    Konsultan Edukasi EXAMIND akan menghubungi nomor WhatsApp Anda dalam waktu maksimal 1x24 jam kerja untuk penjadwalan demo dan pengiriman draf penawaran.
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
