'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Coins,
  Sparkles,
  Ticket,
  CheckCircle2,
  Plus,
  RefreshCw,
  Cpu,
  Layers,
  Copy,
  Check,
} from 'lucide-react'
import api from '@/lib/api'
import {
  DashboardShell,
  DashboardCard,
  getSuperAdminNavTabs,
} from '@/components/dashboard'
import { useAuthStore } from '@/stores/authStore'

interface TaskRate {
  task: string
  label: string
  credits: number
  description: string
}

interface TopupBundle {
  id: string
  name: string
  credits: number
  price: number
  bonus: string
}

interface PricingPlan {
  id: string
  name: string
  price_monthly: number
  price_annually: number
  max_students: number
  max_teachers: number
  max_storage_gb: number
  ai_credits_monthly: number
  proctoring_type: string
  description: string
  features: string[]
  is_popular: boolean
}

interface PromoCode {
  id: number
  code: string
  discount_type: string
  discount_value: number
  credit_bonus: number
  max_uses: number
  used_count: number
  valid_until: string
  description: string
  is_active: boolean
}

export default function SuperAdminPricingPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('pricing')
  const [subTab, setSubTab] = useState<'credits' | 'plans' | 'promos'>('credits')
  const [loading, setLoading] = useState(true)

  // Data states
  const [taskRates, setTaskRates] = useState<TaskRate[]>([])
  const [topupBundles, setTopupBundles] = useState<TopupBundle[]>([])
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [promos, setPromos] = useState<PromoCode[]>([])

  // Modal create promo
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 20,
    credit_bonus: 1000,
    max_uses: 50,
    valid_until: '2026-12-31',
    description: '',
  })

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [creditsRes, plansRes, promosRes] = await Promise.all([
        api.get('/superadmin/ai-credits'),
        api.get('/superadmin/pricing-plans'),
        api.get('/superadmin/promos'),
      ])
      if (creditsRes.data?.data) {
        setTaskRates(creditsRes.data.data.task_rates || [])
        setTopupBundles(creditsRes.data.data.topup_bundles || [])
      }
      if (plansRes.data?.data) {
        setPricingPlans(plansRes.data.data || [])
      }
      if (promosRes.data?.data) {
        setPromos(promosRes.data.data || [])
      }
    } catch (err) {
      console.error('Failed to load pricing/credits/promo data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  const handleTogglePromo = async (promoId: number) => {
    try {
      await api.patch(`/superadmin/promos/${promoId}/toggle`)
      setPromos((prev) =>
        prev.map((p) => (p.id === promoId ? { ...p, is_active: !p.is_active } : p))
      )
    } catch (err) {
      alert('Gagal mengubah status promo')
    }
  }

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoForm.code.trim()) {
      alert('Kode promo wajib diisi')
      return
    }
    setIsSubmittingPromo(true)
    try {
      const res = await api.post('/superadmin/promos', promoForm)
      if (res.data?.data) {
        setPromos((prev) => [res.data.data, ...prev])
      }
      setShowPromoModal(false)
      setPromoForm({
        code: '',
        discount_type: 'percentage',
        discount_value: 20,
        credit_bonus: 1000,
        max_uses: 50,
        valid_until: '2026-12-31',
        description: '',
      })
      alert(`Kode promo ${res.data?.data?.code} berhasil ditambahkan!`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat kode promo.')
    } finally {
      setIsSubmittingPromo(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const navTabs = useMemo(() => getSuperAdminNavTabs(), [])

  return (
    <DashboardShell
      navTabs={navTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      greetingName={user?.full_name || 'Super Admin'}
      greetingSubtitle="Kelola tarif konsumsi kredit per task LLM, struktur paket institusi, dan manajemen kode voucher promo."
      greetingAction={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#150f23]"
            title="Muat ulang data tarif"
            aria-label="Muat ulang data tarif"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowPromoModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-[#150f23] focus:outline-none"
          >
            <Plus className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Tambah Kode Promo</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Sub-Tabs */}
        <div className="bg-white rounded-full p-1.5 border border-slate-200/80 shadow-xs inline-flex items-center gap-1 max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('credits')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer font-display ${
              subTab === 'credits'
                ? 'bg-[#150f23] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Skema Kredit AI</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('plans')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer font-display ${
              subTab === 'plans'
                ? 'bg-[#150f23] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tier Paket Langganan</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('promos')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer font-display ${
              subTab === 'promos'
                ? 'bg-[#150f23] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-rose-400" />
            <span>Manajemen Promo & Voucher ({promos.length})</span>
          </button>
        </div>

        {/* SUB-TAB 1: SKEMA KREDIT AI */}
        {subTab === 'credits' && (
          <div className="space-y-6 tab-content-enter">
            {/* Tokenomics Explainer Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-violet-50/40 to-white border border-indigo-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#150f23] text-[#c2ef4e] shadow-xs shrink-0 mt-0.5">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-extrabold text-slate-900">
                    Sistem Alokasi & Penggunaan Kredit AI Terpusat
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    Setiap sekolah menerima kuota kredit bulanan sesuai paket langganan. Kredit dipotong otomatis saat guru menggunakan Generator Soal, AI Koreksi Esai Otomatis, pendamping belajar, atau verifikasi snapshot pengawas ujian.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl border border-indigo-200/80 shadow-2xs text-center">
                  <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Standar Rasio</span>
                  <span className="font-display text-base font-extrabold text-indigo-700">1 Kredit = 1 Token Unit</span>
                </div>
              </div>
            </div>

            {/* Task Rates Table */}
            <DashboardCard
              title="Tarif Konsumsi Kredit per Task AI"
              subtitle="Biaya pemotongan kuota berdasarkan kompleksitas inferensi model LLM"
              action={
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  5 Operasi Engine Terdaftar
                </span>
              }
              noPadding
            >
              <div className="overflow-x-auto touch-pan-x">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 font-mono text-slate-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-5 font-bold">Jenis Task AI</th>
                      <th className="py-3 px-4 font-bold">Deskripsi Inferensi & Beban Token</th>
                      <th className="py-3 px-4 font-bold text-center">Biaya Kredit</th>
                      <th className="py-3 px-5 font-bold text-right">Estimasi Biaya Server</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {taskRates.map((tr) => (
                      <tr key={tr.task} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{tr.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tr.task}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-md">
                          {tr.description}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-mono">
                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                            {tr.credits} Kredit
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-slate-500 text-[11px] font-semibold">
                          ~Rp {tr.credits * 45} / call
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>

            {/* Top-Up Bundles Grid */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Paket Ekstra Top-Up Kredit AI Sekolah
                </h3>
                <p className="text-xs text-slate-500">
                  Paket isi ulang mandiri yang dapat dibeli oleh administrator sekolah jika kuota bulanan habis
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topupBundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-4 relative overflow-hidden"
                  >
                    {bundle.bonus !== '0%' && (
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shadow-2xs">
                        {bundle.bonus}
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        {bundle.id}
                      </span>
                      <h4 className="font-display text-lg font-extrabold text-slate-900">{bundle.name}</h4>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-semibold">Alokasi Kredit</span>
                        <span className="font-display text-2xl font-black text-amber-600 tabular-nums">
                          {bundle.credits.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-semibold">Harga Paket</span>
                        <span className="font-display text-base font-extrabold text-slate-900">
                          {formatIDR(bundle.price)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Masa berlaku selamanya (tanpa kedaluwarsa kuota) dan dapat digunakan untuk seluruh guru di sekolah.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: TIER PAKET LANGGANAN */}
        {subTab === 'plans' && (
          <div className="space-y-6 tab-content-enter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => {
                const isPopular = plan.is_popular

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between relative shadow-card hover:shadow-card-hover ${
                      isPopular
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider font-mono shadow-xs">
                        Paling Banyak Dipilih
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <h4 className="font-display text-xl font-extrabold text-slate-900">{plan.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                            {formatIDR(plan.price_monthly)}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">/ bulan</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold font-mono mt-0.5">
                          Atau {formatIDR(plan.price_annually)} / tahun (Hemat 2 bulan)
                        </p>
                      </div>

                      {/* Limits Specs */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Maks. Siswa:</span>
                          <span className="font-bold text-slate-900">{plan.max_students.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Maks. Guru:</span>
                          <span className="font-bold text-slate-900">{plan.max_teachers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kredit AI Bulanan:</span>
                          <span className="font-bold text-amber-600">
                            {plan.ai_credits_monthly.toLocaleString('id-ID')} Kredit
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mode Proctoring:</span>
                          <span className="font-bold text-slate-900 capitalize">
                            {plan.proctoring_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kapasitas Storage:</span>
                          <span className="font-bold text-slate-900">{plan.max_storage_gb} GB</span>
                        </div>
                      </div>

                      {/* Features checklist */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Fitur Termasuk:
                        </span>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => alert(`Pengaturan harga untuk ${plan.name} disimpan secara global.`)}
                        className={`w-full py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer font-display ${
                          isPopular
                            ? 'bg-[#150f23] hover:bg-slate-800 text-white shadow-card'
                            : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        Konfigurasi Limit Paket
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: MANAJEMEN PROMO & VOUCHER */}
        {subTab === 'promos' && (
          <div className="space-y-6 tab-content-enter">
            <DashboardCard
              title="Daftar Kode Promo & Voucher Insentif"
              subtitle="Voucher diskon biaya langganan dan injeksi kuota kredit AI tambahan untuk onboarding sekolah"
              noPadding
            >
              <div className="overflow-x-auto touch-pan-x">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 font-mono text-slate-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-5 font-bold">Kode Voucher</th>
                      <th className="py-3 px-4 font-bold">Benefit & Diskon</th>
                      <th className="py-3 px-4 font-bold">Bonus Kredit AI</th>
                      <th className="py-3 px-4 font-bold">Penggunaan Kuota</th>
                      <th className="py-3 px-4 font-bold">Masa Berlaku</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-5 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {promos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 px-2 py-1 bg-slate-100 rounded-lg text-xs tracking-wider border border-slate-200">
                              {p.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(p.code)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                              title="Salin Kode Promo"
                            >
                              {copiedCode === p.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-xs">{p.description}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {p.discount_type === 'percentage' && `${p.discount_value}% OFF Tagihan`}
                          {p.discount_type === 'fixed' && `Potongan ${formatIDR(p.discount_value)}`}
                          {p.discount_type === 'credit_bonus' && 'Khusus Bonus Kredit AI'}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.credit_bonus > 0 ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px] shadow-2xs">
                              <Coins className="w-3 h-3 text-amber-600" />
                              +{p.credit_bonus.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-800 font-semibold text-[11px]">
                            {p.used_count} / {p.max_uses} Digunakan
                          </div>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, (p.used_count / p.max_uses) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                          {p.valid_until}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs transition-colors duration-200 ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {p.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleTogglePromo(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 cursor-pointer ${
                              p.is_active
                                ? 'border-rose-200 hover:bg-rose-50 text-rose-700'
                                : 'border-emerald-200 hover:bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          </div>
        )}
      </div>

      {/* Modal Buat Promo Baru */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2 py-0.5 rounded-md font-bold">
                  Insentif Pertumbuhan
                </span>
                <h3 className="font-display text-lg font-extrabold text-slate-900 mt-1">
                  Buat Kode Promo Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                title="Tutup modal kode promo"
                aria-label="Tutup modal kode promo"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode Promo / Voucher</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MERDEKA2026"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Diskon</label>
                  <select
                    value={promoForm.discount_type}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                    <option value="credit_bonus">Bonus Kredit Saja</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {promoForm.discount_type === 'percentage' ? 'Diskon (%)' : 'Potongan (Rp)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={promoForm.discount_type === 'credit_bonus'}
                    value={promoForm.discount_value}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discount_value: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono disabled:opacity-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bonus Kredit AI</label>
                  <input
                    type="number"
                    min="0"
                    value={promoForm.credit_bonus}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, credit_bonus: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Maksimal Kuota</label>
                  <input
                    type="number"
                    min="1"
                    value={promoForm.max_uses}
                    onChange={(e) => setPromoForm({ ...promoForm, max_uses: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Berlaku Sampai Tanggal</label>
                <input
                  type="date"
                  value={promoForm.valid_until}
                  onChange={(e) => setPromoForm({ ...promoForm, valid_until: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan Promo</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kampanye promo..."
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPromo}
                  className="px-5 py-2.5 rounded-full bg-[#150f23] hover:bg-slate-800 text-white font-bold shadow-card flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingPromo ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
