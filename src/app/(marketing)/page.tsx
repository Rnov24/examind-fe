'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck,
  Laptop,
  Brain,
  Camera,
  Smartphone,
  GraduationCap,
  BookOpen,
  Building2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  LayoutDashboard,
  FileText,
  Users,
  User,
  ChartColumn,
  Sparkles,
  ClipboardCheck,
  ScanFace,
  Eye,
  Video,
  QrCode,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { formatIDR, useCountUp } from '@/hooks/useCountUp'
import { ExamindLogo } from '@/components/brand/ExamindLogo'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'
import { SectionDivider } from '@/components/marketing/SectionDivider'

interface LandingPlan {
  id: string
  name: string
  price_monthly: number
  price_annually: number
  max_students: number
  max_teachers: number
  max_storage_gb?: number
  ai_credits_monthly: number
  proctoring_type: string
  description: string
  features?: string[]
  is_popular?: boolean
}

interface LandingStats {
  active_schools: number
  total_users: number
  total_exams: number
  total_sessions: number
}

const formatCount = (n: number) => n.toLocaleString('id-ID')

const proctoringLabel = (type: string) =>
  type === 'dual_camera'
    ? 'Proctoring dua kamera (HP + laptop)'
    : type === 'single_camera'
    ? 'Proctoring satu kamera (webcam)'
    : type

function StatCounter({ value, label }: { value: number; label: string }) {
  const { displayValue, ref } = useCountUp(value, 1200, { formatAsIDR: false })
  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums">
        {displayValue}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}

export default function LandingPage() {
  const { isHydrated, hydrate } = useAuthStore()

  // Hero mouse parallax refs (desktop pointer-fine only, lerped via rAF)
  const heroSectionRef = useRef<HTMLElement | null>(null)
  const mockParallaxRef = useRef<HTMLDivElement | null>(null)
  const floatGradeRef = useRef<HTMLDivElement | null>(null)
  const floatProcRef = useRef<HTMLDivElement | null>(null)

  // Real landing data (plans + stats) from GET /public/landing
  const [plans, setPlans] = useState<LandingPlan[] | null>(null)
  const [plansError, setPlansError] = useState(false)
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

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
    // Re-run when plans arrive so pricing cards rendered after the fetch
    // are picked up by the observer too.
  }, [plans])

  // Hero mouse parallax: subtle depth on the dashboard mock + floating cards.
  // Desktop pointer-fine only; disabled for touch and prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const section = heroSectionRef.current
    if (!section) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    let raf = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const apply = () => {
      current.x += (target.x - current.x) * 0.08
      current.y += (target.y - current.y) * 0.08
      const { x, y } = current
      if (mockParallaxRef.current) {
        mockParallaxRef.current.style.transform = `translate3d(${(x * 4).toFixed(2)}px, ${(y * 4).toFixed(2)}px, 0)`
      }
      if (floatGradeRef.current) {
        floatGradeRef.current.style.transform = `translate3d(${(x * 10).toFixed(2)}px, ${(y * 8).toFixed(2)}px, 0)`
      }
      if (floatProcRef.current) {
        floatProcRef.current.style.transform = `translate3d(${(-x * 8).toFixed(2)}px, ${(-y * 6).toFixed(2)}px, 0)`
      }
      if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) {
        raf = requestAnimationFrame(apply)
      } else {
        raf = 0
      }
    }

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
      if (!raf) raf = requestAnimationFrame(apply)
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])


  useEffect(() => {
    let cancelled = false
    const base = process.env.NEXT_PUBLIC_API_URL || '/api/v1'
    fetch(`${base}/public/landing`)
      .then((res) => {
        if (!res.ok) throw new Error(`Landing data request failed: ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        const data = json?.data
        if (Array.isArray(data?.plans) && data.plans.length > 0) {
          setPlans(data.plans)
        } else {
          setPlansError(true)
        }
        const s = data?.stats
        if (s && (s.active_schools || s.total_users || s.total_exams || s.total_sessions)) {
          setLandingStats(s)
        }
      })
      .catch(() => {
        if (!cancelled) setPlansError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const faqs = [
    {
      q: 'Apakah peserta ujian yang menoleh otomatis didiskualifikasi oleh AI?',
      a: 'Tidak. AI hanya mencatat waktu dan snapshot kejadian. Keputusan akhir selalu di tangan guru pengawas.',
    },
    {
      q: 'Bagaimana jika jaringan internet sekolah atau rumah peserta terputus saat ujian berlangsung?',
      a: 'Jawaban tersimpan otomatis di browser lewat IndexedDB, lalu tersinkron ke server begitu koneksi pulih.',
    },
    {
      q: 'Bagaimana EXAMIND melindungi privasi rekaman video peserta sesuai ketentuan hukum?',
      a: 'Kamera aktif hanya dengan izin peserta. Snapshot terenkripsi dan dihapus otomatis setelah 60 hari, sesuai UU PDP No. 27 Tahun 2022.',
    },
    {
      q: 'Apakah guru memiliki wewenang merevisi nilai esai yang diberikan oleh AI?',
      a: 'Bisa. Nilai AI hanya draf awal. Guru meninjau dan mengubahnya sebelum hasil diumumkan.',
    },
    {
      q: 'Mengapa pengadaan EXAMIND tidak menyediakan pembayaran kartu kredit langsung?',
      a: 'Pembayaran lewat penawaran resmi, SPK/MOU, faktur pajak institusi, dan transfer antar-rekening instansi.',
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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#6a5fc1] selection:text-white">
      {/* Ambient Background Depth & Subtle Radial Bleed */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl"></div>
        <div className="absolute top-[900px] -left-48 w-[500px] h-[500px] bg-blue-100/30 blur-3xl rounded-full"></div>
        <div className="absolute top-[1800px] -right-48 w-[600px] h-[600px] bg-indigo-100/30 blur-3xl rounded-full"></div>
      </div>

      <MarketingNavbar />

      {/* HERO SECTION */}
      <section ref={heroSectionRef} id="hero" className="relative z-10 min-h-screen flex flex-col justify-center bg-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl mx-auto text-center space-y-8">
          <h1
            className="anim-rise text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto"
            style={{ '--anim-duration': '400ms', '--anim-delay': '80ms' } as React.CSSProperties}
          >
            Ujian online yang{' '}
            <span
              className="anim-pop bg-[#c2ef4e] text-slate-950 px-2.5 py-0.5 rounded-xs inline-block font-black mt-1"
              style={{ '--anim-duration': '350ms', '--anim-delay': '240ms' } as React.CSSProperties}
            >
              diawasi AI
            </span>
            , dinilai dalam hitungan menit.
          </h1>

          <p
            className="anim-rise text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
            style={{ '--anim-duration': '400ms', '--anim-delay': '180ms' } as React.CSSProperties}
          >
            Satu platform untuk ujian CBT, bank soal, proctoring kamera, dan koreksi esai. Hasilnya rapi, keputusannya tetap di tangan guru.
          </p>

          <div
            className="anim-rise flex flex-wrap items-center justify-center gap-3.5 pt-2"
            style={{ '--anim-duration': '400ms', '--anim-delay': '280ms' } as React.CSSProperties}
          >
            <button
              onClick={() => openInquiryModal('demo')}
              className="mkt-btn-press px-6 py-3.5 rounded-lg bg-[#c2ef4e] hover:bg-[#b2e233] text-slate-950 font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Jadwalkan Demo Sekolah</span>
              <ArrowRight className="w-4 h-4 anim-nudge-x" />
            </button>

            <a
              href="#pricing"
              className="mkt-btn-press px-5 py-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-xs"
            >
              Lihat Harga
            </a>
          </div>
        </div>

        {/* DASHBOARD PREVIEW MOCK */}
        <div data-reveal className="relative w-full max-w-5xl mx-auto mt-16">
          <div ref={mockParallaxRef} className="will-change-transform">
          <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden text-left">
            {/* Window Header Bar */}
            <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              </div>
              <span className="text-xs font-mono text-slate-500">app.examind.id/dashboard</span>
            </div>

            <div className="flex">
              {/* Mock Sidebar */}
              <div className="hidden sm:flex w-44 shrink-0 flex-col gap-1 border-r border-slate-200 bg-slate-50/70 p-3">
                <div className="px-2 pb-3">
                  <ExamindLogo variant="lockup" theme="color" className="h-6 w-auto" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-bold text-white">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500">
                  <FileText className="w-4 h-4" />
                  <span>Ujian</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>Siswa</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500">
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Penilaian</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500">
                  <ChartColumn className="w-4 h-4" />
                  <span>Analitik</span>
                </div>
              </div>

              {/* Mock Main Panel */}
              <div className="flex-1 min-w-0 p-4 sm:p-5 space-y-4 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Dashboard Guru</div>
                    <div className="mt-1.5 h-2 w-36 rounded-full bg-slate-200"></div>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[#6a5fc1] text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </span>
                </div>

                {/* Mock Stat Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ujian Berlangsung', bars: [35, 55, 45, 70, 60] },
                    { label: 'Siswa Aktif', bars: [50, 42, 66, 58, 80] },
                    { label: 'Rata-rata Nilai', bars: [45, 60, 52, 74, 68] },
                  ].map((card) => (
                    <div key={card.label} className="rounded-lg border border-slate-200 p-3">
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-slate-500 truncate">
                        {card.label}
                      </div>
                      <div className="mt-2 flex items-end gap-1 h-8">
                        {card.bars.map((h, i) => (
                          <span
                            key={i}
                            className={`flex-1 rounded-sm ${i === card.bars.length - 1 ? 'bg-[#c2ef4e]' : 'bg-[#6a5fc1]/60'}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock Chart Panel */}
                <div className="rounded-lg border border-slate-200 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Aktivitas Ujian Minggu Ini</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Live
                    </span>
                  </div>
                  <div className="mt-3 flex items-end gap-1.5 h-24">
                    {[38, 52, 44, 66, 58, 80, 72, 92, 84, 64, 74, 96, 86, 100].map((h, i) => (
                      <span
                        key={i}
                        className={`flex-1 rounded-t-sm ${i === 13 ? 'bg-[#c2ef4e]' : i % 3 === 0 ? 'bg-[#6a5fc1]' : 'bg-indigo-200'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Floating Card: AI Grading Result */}
          <div ref={floatGradeRef} className="hidden lg:flex absolute -right-8 top-28 w-60 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-left will-change-transform">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-violet-100 text-[#6a5fc1] flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900">Koreksi Esai AI</div>
                <div className="text-[11px] font-semibold text-emerald-600">Selesai dinilai</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Konsep', w: '92%' },
                { label: 'Argumen', w: '84%' },
                { label: 'Istilah', w: '88%' },
                { label: 'Bahasa', w: '80%' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="w-14 text-[11px] font-medium text-slate-500">{row.label}</span>
                  <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <span className="block h-full rounded-full bg-[#6a5fc1]" style={{ width: row.w }}></span>
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5">
              Draf — menunggu tinjauan guru
            </div>
          </div>

          {/* Floating Card: Proctoring Status */}
          <div ref={floatProcRef} className="hidden lg:flex absolute -left-8 bottom-12 w-56 flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-left will-change-transform">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900">Proctoring Live</div>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Sedang berjalan
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Wajah terverifikasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tatapan ke layar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kamera HP terhubung</span>
              </div>
            </div>
          </div>
        </div>

        {/* REAL STATS STRIP (hidden when the API has no data) */}
        {landingStats && (
          <div className="w-full max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-200 pt-8">
            <StatCounter value={landingStats.active_schools} label="Sekolah aktif" />
            <StatCounter value={landingStats.total_users} label="Pengguna terdaftar" />
            <StatCounter value={landingStats.total_exams} label="Ujian dibuat" />
            <StatCounter value={landingStats.total_sessions} label="Sesi ujian" />
          </div>
        )}

        {/* KEUNGGULAN: BENTO GRID */}
        <div id="keunggulan" className="w-full max-w-6xl mx-auto mt-20 scroll-mt-28">
          <h2 data-reveal className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
            Semua kebutuhan ujian, satu platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
            <div
              data-reveal
              style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
              className="mkt-hover-lift hover:shadow-md md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300"
            >
              <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Ujian CBT Online</h3>
              <p className="mt-1 text-sm text-slate-600">Di browser, tanpa instal aplikasi tambahan.</p>
            </div>

            <div
              data-reveal
              style={{ '--reveal-delay': '50ms' } as React.CSSProperties}
              className="mkt-hover-lift hover:shadow-md rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300"
            >
              <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Proctoring Kamera Ganda</h3>
              <p className="mt-1 text-sm text-slate-600">Deteksi HP, wajah, dan arah tatapan.</p>
            </div>

            <div
              data-reveal
              style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
              className="mkt-hover-lift hover:shadow-md rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300"
            >
              <span className="w-10 h-10 rounded-lg bg-violet-50 text-[#6a5fc1] border border-violet-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Bank Soal &amp; Generate AI</h3>
              <p className="mt-1 text-sm text-slate-600">Soal dibuat dari materi ajar guru.</p>
            </div>

            <div
              data-reveal
              style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
              className="mkt-hover-lift hover:shadow-md md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300"
            >
              <span className="w-10 h-10 rounded-lg bg-violet-50 text-[#6a5fc1] border border-violet-100 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Koreksi Esai Otomatis AI</h3>
              <p className="mt-1 text-sm text-slate-600">Esai dan jawaban singkat dinilai berubrik.</p>
            </div>

            <div
              data-reveal
              style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
              className="mkt-hover-lift hover:shadow-md rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300"
            >
              <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Chatbot Paham Data Sekolah</h3>
              <p className="mt-1 text-sm text-slate-600">Menjawab dari data sekolah Anda langsung.</p>
            </div>

            <div
              data-reveal
              style={{ '--reveal-delay': '250ms' } as React.CSSProperties}
              className="mkt-hover-lift hover:shadow-md md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300"
            >
              <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Multi-Sekolah (Tenant)</h3>
              <p className="mt-1 text-sm text-slate-600">Banyak sekolah terpisah dalam satu platform.</p>
            </div>
          </div>
        </div>

        {/* Divider: hero (white) -> peran (white), subtle slate-50 crescent */}
        <SectionDivider fill="#ffffff" accentFill="#f8fafc" variant="a" />
      </section>

      {/* TIGA PILAR PENGGUNA */}
      <section id="peran" className="relative z-10 min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24">
        <div className="w-full max-w-7xl mx-auto space-y-14">
          <div data-reveal className="max-w-3xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Satu platform, tiga cara pakai
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Siswa, guru, dan admin sekolah memakai tampilan yang sesuai tugasnya.
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
                className="mkt-hover-lift hover:shadow-md relative p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex flex-col justify-between"
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

                  {/* Mini Mock: Exam Room */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Ujian Berlangsung</span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Tersimpan
                      </span>
                    </div>
                    <div className="h-2 w-4/5 rounded-full bg-slate-200"></div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 rounded-md border border-slate-900 bg-slate-900 px-2.5 py-2">
                        <span className="w-2 h-2 rounded-full bg-[#c2ef4e] shrink-0"></span>
                        <span className="h-1.5 w-2/3 rounded-full bg-white/70"></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2">
                        <span className="w-2 h-2 rounded-full border border-slate-300 shrink-0"></span>
                        <span className="h-1.5 w-1/2 rounded-full bg-slate-200"></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2">
                        <span className="w-2 h-2 rounded-full border border-slate-300 shrink-0"></span>
                        <span className="h-1.5 w-3/5 rounded-full bg-slate-200"></span>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Autosave, jawaban tidak hilang</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Tidak ada penutupan ujian sepihak</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pembahasan soal setelah ujian</span>
                  </li>
                </ul>
              </div>

              {/* CARD GURU */}
              <div
                data-reveal
                style={{ '--reveal-delay': '50ms' } as React.CSSProperties}
                className="mkt-hover-lift hover:shadow-md relative p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex flex-col justify-between"
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
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Guru &amp; Pengawas</h3>
                  </div>

                  {/* Mini Mock: Proctoring Console Rows */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 border border-slate-100 px-2.5 py-2">
                      <span className="h-1.5 w-2/3 rounded-full bg-slate-300"></span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">Aman</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 border border-slate-100 px-2.5 py-2">
                      <span className="h-1.5 w-1/2 rounded-full bg-slate-300"></span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">Perlu cek</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 border border-slate-100 px-2.5 py-2">
                      <span className="h-1.5 w-3/5 rounded-full bg-slate-300"></span>
                      <span className="text-[10px] font-bold text-[#6a5fc1] bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded shrink-0">Draf AI</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Generate soal dari bank soal</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pantau satu kelas dalam satu layar</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Nilai draf AI bisa direvisi</span>
                  </li>
                </ul>
              </div>

              {/* CARD SEKOLAH */}
              <div
                data-reveal
                style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
                className="mkt-hover-lift hover:shadow-md relative p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex flex-col justify-between"
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
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Sekolah</h3>
                  </div>

                  {/* Mini Mock: Admin Overview */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['Sekolah', 'Guru', 'Siswa'].map((label) => (
                        <div key={label} className="rounded-md bg-slate-50 border border-slate-100 px-2 py-2 space-y-1.5">
                          <div className="h-1.5 w-3/4 rounded-full bg-slate-300"></div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-end gap-1 h-10">
                      {[45, 70, 55, 85, 65, 95, 78].map((h, i) => (
                        <span
                          key={i}
                          className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-[#c2ef4e]' : 'bg-[#6a5fc1]/60'}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 pt-6 mt-6 border-t border-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Kepatuhan UU PDP</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Berita acara &amp; transkrip PDF</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Analitik capaian antar-kelas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider: peran (white) -> proctoring (#150f23) */}
        <SectionDivider fill="#150f23" variant="b" />
      </section>

      {/* DUAL-CAMERA DETAIL */}
      <section id="proctoring" className="relative z-10 min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 bg-[#150f23] scroll-mt-24">
        <div className="w-full max-w-7xl mx-auto space-y-12">
          <div data-reveal className="max-w-3xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dua kamera, tanpa titik buta
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Kamera laptop memantau wajah dan tatapan. Kamera HP memantau meja dan layar. AI memberi peringatan — pengawas yang memutuskan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* LEFT: CAMERA FRAME MOCKS WITH DETECTION BOXES */}
            <div
              data-reveal
              style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
              className="lg:col-span-6 space-y-4"
            >
              {/* Frame: Laptop Camera */}
              <div className="relative rounded-xl border border-white/10 bg-[#0c0918] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <span className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-300">
                    <Camera className="w-3.5 h-3.5" />
                    KAMERA LAPTOP
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    LIVE
                  </span>
                </div>
                <div className="relative h-52 sm:h-60">
                  {/* Face bounding box */}
                  <div className="absolute left-[14%] top-[20%] w-[30%] h-[56%] rounded-lg border-2 border-emerald-400/90">
                    <span className="absolute -top-7 left-0 text-[10px] font-bold font-mono text-emerald-300 bg-emerald-400/10 border border-emerald-400/40 rounded px-1.5 py-0.5 whitespace-nowrap">
                      WAJAH
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center text-emerald-400/60">
                      <ScanFace className="w-10 h-10" />
                    </span>
                  </div>
                  {/* Desk silhouette */}
                  <div className="absolute bottom-5 left-[56%] right-[8%] space-y-2">
                    <div className="h-2 w-4/5 rounded-full bg-white/10"></div>
                    <div className="h-2 w-3/5 rounded-full bg-white/10"></div>
                    <div className="h-2 w-2/3 rounded-full bg-white/10"></div>
                  </div>
                  {/* Gaze chip */}
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-200 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
                    <Eye className="w-3.5 h-3.5 text-[#c2ef4e]" />
                    Tatapan: ke layar
                  </span>
                </div>
              </div>

              {/* Sync Bridge */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-bold tracking-wider text-slate-400">
                <span className="sync-pulse-dot w-2 h-2 rounded-full bg-[#c2ef4e] shadow-[0_0_6px_rgba(194,239,78,0.9)]" />
                TERSINKRON ANTAR KAMERA
              </div>

              {/* Frame: Phone Camera */}
              <div className="relative rounded-xl border border-white/10 bg-[#0c0918] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <span className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-300">
                    <Smartphone className="w-3.5 h-3.5" />
                    KAMERA HP
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
                    <QrCode className="w-3.5 h-3.5" />
                    QR TERHUBUNG
                  </span>
                </div>
                <div className="relative h-40 sm:h-44">
                  {/* Desk silhouette */}
                  <div className="absolute bottom-5 left-[8%] right-[42%] space-y-2">
                    <div className="h-2 w-4/5 rounded-full bg-white/10"></div>
                    <div className="h-2 w-3/5 rounded-full bg-white/10"></div>
                    <div className="h-2 w-2/3 rounded-full bg-white/10"></div>
                  </div>
                  {/* Detected phone bounding box */}
                  <span className="absolute right-[13%] top-3 text-[10px] font-bold font-mono text-rose-300 bg-rose-400/10 border border-rose-400/40 rounded px-1.5 py-0.5 whitespace-nowrap">
                    HP TERDETEKSI
                  </span>
                  <div className="absolute right-[14%] top-[24%] w-[15%] h-[58%] rounded-md border-2 border-rose-400/90 rotate-6">
                    <span className="absolute inset-x-1 top-1 h-1 rounded-full bg-rose-400/40"></span>
                  </div>
                  {/* Desk chip */}
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-200 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
                    <Eye className="w-3.5 h-3.5 text-[#c2ef4e]" />
                    Meja &amp; layar terpantau
                  </span>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Wajah terverifikasi
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300 bg-rose-400/10 border border-rose-400/30 rounded-full px-2.5 py-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  HP terdeteksi
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-300 bg-violet-400/10 border border-violet-400/30 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e]"></span>
                  Sinkronisasi aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Koneksi WebSocket terenkripsi SSL</p>
            </div>

            {/* RIGHT: NUMBERED STEPS (TRIMMED) */}
            <div
              data-reveal
              style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
              className="lg:col-span-6 space-y-8"
            >
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-[#6a5fc1] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Tanpa instal aplikasi</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    Kamera HP aktif lewat scan QR dari layar ujian.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-[#6a5fc1] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Meja dan layar terpantau</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    Sudut 45° menutup celah catatan dan ponsel kedua.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-[#6a5fc1] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Pengawas yang memutuskan</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    Setiap kejadian disertai snapshot dan cap waktu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider: proctoring (#150f23) -> pricing (white) */}
        <SectionDivider fill="#ffffff" variant="a" />
      </section>

      {/* PRICING & LISENSI SAAS */}
      <section id="pricing" className="relative z-10 min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 bg-white text-slate-900 scroll-mt-24">
        <div className="w-full max-w-7xl mx-auto space-y-14">
          <div data-reveal className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider border border-slate-200">
              Pengadaan Institusi B2B
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Harga &amp; Lisensi Sekolah
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Harga mengikuti jumlah siswa di sekolah Anda. Pengadaan lewat penawaran resmi, SPK/MOU, dan faktur pajak institusi — tanpa pembayaran kartu kredit publik.
            </p>
          </div>

          {plans ? (
            <>
              {/* Billing Period Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-sm font-semibold w-fit shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                    billingPeriod === 'monthly'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                    billingPeriod === 'annual'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tahunan
                </button>
              </div>

              {/* Plan Cards (from GET /public/landing) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan, idx) => {
                  const price = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_annually
                  return (
                    <div
                      key={plan.id}
                      data-reveal
                      style={{ '--reveal-delay': `${Math.min(idx, 5) * 50}ms` } as React.CSSProperties}
                      className={
                        plan.is_popular
                          ? 'mkt-hover-lift hover:shadow-2xl p-7 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between space-y-6 shadow-xl relative text-slate-900'
                          : 'mkt-hover-lift hover:shadow-md p-7 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-300 text-slate-900'
                      }
                    >
                      {plan.is_popular && (
                        <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-xs font-bold bg-[#c2ef4e] text-slate-950 shadow-sm font-mono border border-slate-900">
                          Paling Direkomendasikan
                        </div>
                      )}

                      <div className="space-y-5">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{plan.description}</p>
                        </div>

                        <div key={billingPeriod} className="price-swap py-4 border-y border-slate-200 space-y-1">
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
                            {billingPeriod === 'monthly' ? 'Per bulan' : 'Per tahun'}
                          </div>
                          <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                            {formatIDR(price)}
                          </div>
                        </div>

                        <ul className="space-y-2.5 text-sm text-slate-700">
                          <li className="flex items-start gap-2.5">
                            <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <span>Hingga {formatCount(plan.max_students)} siswa</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <BookOpen className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <span>Hingga {formatCount(plan.max_teachers)} guru</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-[#6a5fc1] shrink-0 mt-0.5" />
                            <span>{formatCount(plan.ai_credits_monthly)} kredit AI per bulan</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Camera className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <span>{proctoringLabel(plan.proctoring_type)}</span>
                          </li>
                        </ul>

                        {plan.features && plan.features.length > 0 && (
                          <ul className="space-y-2.5 text-sm text-slate-700 border-t border-slate-100 pt-4">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <button
                          onClick={() => openInquiryModal(plan.name)}
                          className={
                            plan.is_popular
                              ? 'mkt-btn-press w-full py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md cursor-pointer'
                              : 'mkt-btn-press w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-sm cursor-pointer shadow-xs'
                          }
                        >
                          Konsultasikan Paket Ini
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : plansError ? (
            /* Fetch failed: no cards, no invented prices */
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-10 text-center space-y-4">
              <p className="text-lg font-bold text-slate-900">Harga tersedia saat pendaftaran</p>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Daftar harga resmi dikirim setelah kami tahu jumlah siswa sekolah Anda.
              </p>
              <button
                onClick={() => openInquiryModal('demo')}
                className="mkt-btn-press px-6 py-3 rounded-lg bg-[#c2ef4e] hover:bg-[#b2e233] text-slate-950 font-bold text-sm shadow-md cursor-pointer"
              >
                Minta Daftar Harga
              </button>
            </div>
          ) : (
            /* Loading skeletons */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="p-7 rounded-xl bg-slate-50 border border-slate-200 space-y-5 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-5 w-2/3 rounded bg-slate-200"></div>
                    <div className="h-3 w-full rounded bg-slate-200"></div>
                    <div className="h-3 w-4/5 rounded bg-slate-200"></div>
                  </div>
                  <div className="py-4 border-y border-slate-200">
                    <div className="h-8 w-1/2 rounded bg-slate-200"></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-3 w-full rounded bg-slate-200"></div>
                    <div className="h-3 w-5/6 rounded bg-slate-200"></div>
                    <div className="h-3 w-4/6 rounded bg-slate-200"></div>
                    <div className="h-3 w-3/6 rounded bg-slate-200"></div>
                  </div>
                  <div className="h-11 rounded-lg bg-slate-200"></div>
                </div>
              ))}
            </div>
          )}

          {/* Procurement Guarantee Callout */}
          <div
            data-reveal
            style={{ '--reveal-delay': '50ms' } as React.CSSProperties}
            className="p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-4 text-sm text-slate-900"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <span className="font-bold text-slate-900 text-base">Pengadaan resmi lewat SPK/MOU</span>
                <p className="text-slate-600 mt-1 text-xs sm:text-sm">Faktur pajak institusi, transfer antar-rekening instansi, dan pendampingan Konsultan Edukasi.</p>
              </div>
              <button
                onClick={() => openInquiryModal('spk')}
                className="mkt-btn-press shrink-0 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-semibold text-xs sm:text-sm cursor-pointer whitespace-nowrap shadow-xs"
              >
                Konsultasi Draf SPK / MOU
              </button>
            </div>
          </div>
        </div>

        {/* Divider: pricing (white) -> faq (slate-50) */}
        <SectionDivider fill="#f8fafc" variant="b" />
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 scroll-mt-24">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          <div data-reveal className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan Umum Pengadaan EXAMIND
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Seputar teknis, hukum, dan operasional ujian sekolah.
            </p>
          </div>

          <div
            data-reveal
            style={{ '--reveal-delay': '50ms' } as React.CSSProperties}
            className="divide-y divide-slate-200 border-y border-slate-200"
          >
            {faqs.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={activeFaq === idx}
                  className="w-full py-2 text-left font-bold text-base sm:text-lg text-slate-900 flex items-center justify-between gap-4 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="leading-snug">{item.q}</span>
                  <span className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-mono text-base shrink-0 shadow-xs">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    activeFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                  aria-hidden={activeFaq !== idx}
                >
                  <div className="overflow-hidden">
                    <div className="pt-3 pb-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider: faq (slate-50) -> footer (white) */}
        <SectionDivider fill="#ffffff" variant="a" />
      </section>

      {/* FOOTER */}
      <footer data-reveal className="relative z-10 bg-white text-slate-600 text-xs py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <ExamindLogo variant="lockup" theme="color" className="h-8 w-auto shrink-0" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Platform ujian online untuk sekolah: CBT, proctoring dua kamera, dan penilaian esai AI dalam satu tempat.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Teknologi Utama</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="#proctoring" className="hover:text-slate-900 transition-colors">AI Dual-Camera Proctoring</a></li>
              <li><a href="#peran" className="hover:text-slate-900 transition-colors">AI Essay Grading Rubrik 4D</a></li>
              <li><a href="#peran" className="hover:text-slate-900 transition-colors">Tutor Pembahasan Soal</a></li>
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
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Konsultasi Pengadaan Lisensi Sekolah</h3>
                  <p className="text-xs text-slate-500">Tim kami siap membantu kebutuhan sekolah Anda</p>
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
