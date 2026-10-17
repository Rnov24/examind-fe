'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Coins,
  RefreshCw,
  FileText,
  Printer,
  Clock,
  X,
} from 'lucide-react'
import api from '@/lib/api'
import { useCountUp, MoneyCountUp, formatIDR } from '@/hooks/useCountUp'

interface Invoice {
  id: string
  tenant_name: string
  code: string
  plan: string
  amount: number
  status: string
  date: string
  payment_method: string
  period?: string
}

interface PlanStat {
  count: number
  subtotal: number
  percentage: number
}

interface MonthStat {
  month: string
  mrr: number
  schools?: number
  tenants: number
  growth: string
}

interface FinanceData {
  mrr: number
  arr: number
  arpu: number
  active_tenants?: number
  paying_tenants?: number
  growth_rate_mom?: number
  churn_rate?: number
  plan_revenue?: Record<string, number>
  plan_distribution?: Record<string, number>
  plans_breakdown?: {
    starter?: PlanStat
    pro?: PlanStat
    enterprise?: PlanStat
    [key: string]: PlanStat | undefined
  }
  mrr_history?: MonthStat[]
  historical_mrr?: MonthStat[]
  recent_invoices?: Invoice[]
  invoices?: Invoice[]
}

export default function SuperAdminFinancePage() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchInvoice, setSearchInvoice] = useState('')

  const loadFinance = async () => {
    setLoading(true)
    try {
      const res = await api.get('/superadmin/finance')
      setFinanceData(res.data.data)
    } catch (err) {
      console.error('Failed to load finance data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinance()
  }, [])

  // Cascading money count-up hooks for top KPI cards (settles like a financial ledger)
  const mrrCount = useCountUp(financeData?.mrr, 1200, { delay: 0 })
  const arrCount = useCountUp(financeData?.arr, 1300, { delay: 200 })
  const arpuCount = useCountUp(financeData?.arpu, 1400, { delay: 400 })

  const handleExportLedger = () => {
    const list = financeData?.recent_invoices || financeData?.invoices || []
    if (list.length === 0) {
      alert('Belum ada data faktur buku besar untuk diekspor.')
      return
    }

    const headers = ['No. Faktur', 'Institusi Sekolah', 'Kode', 'Paket', 'Metode Bayar', 'Tanggal', 'Nominal (IDR)', 'Status']
    const rows = list.map((inv) => [
      `"${inv.id}"`,
      `"${(inv.tenant_name || '').replace(/"/g, '""')}"`,
      `"${inv.code || ''}"`,
      `"${inv.plan || ''}"`,
      `"${inv.payment_method && inv.payment_method !== '-' ? inv.payment_method : 'Belum ditentukan'}"`,
      `"${inv.date || ''}"`,
      inv.amount || 0,
      `"${inv.status || ''}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Buku-Besar-EXAMIND-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const invoices: Invoice[] = financeData?.recent_invoices || financeData?.invoices || []
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.tenant_name.toLowerCase().includes(searchInvoice.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchInvoice.toLowerCase()) ||
      inv.code.toLowerCase().includes(searchInvoice.toLowerCase())
  )

  const historical: MonthStat[] = financeData?.historical_mrr || financeData?.mrr_history || []
  const maxMrr = historical.length > 0 ? Math.max(...historical.map((h) => h.mrr), 1000000) : 1000000

  // Honest growth rate across the historical period (first non-zero month vs latest month)
  const firstMonthWithData = historical.find((h) => h.mrr > 0)
  const latestMonth = historical.length > 0 ? historical[historical.length - 1] : null
  const periodGrowthPct =
    firstMonthWithData && latestMonth && firstMonthWithData.mrr > 0
      ? Math.round(((latestMonth.mrr - firstMonthWithData.mrr) / firstMonthWithData.mrr) * 100)
      : null

  // Honest plan breakdown data with honest fallbacks to 0
  const proStats = financeData?.plans_breakdown?.pro ?? { count: 0, subtotal: 0, percentage: 0 }
  const enterpriseStats = financeData?.plans_breakdown?.enterprise ?? { count: 0, subtotal: 0, percentage: 0 }
  const starterStats = financeData?.plans_breakdown?.starter ?? { count: 0, subtotal: 0, percentage: 0 }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-emerald-50/70 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-50/40 rounded-full blur-2xl" />

        <div className="relative flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-emerald-50/70">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Finansial &amp; MRR Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-[#c2ef4e] font-mono shadow-xs">
                Revenue Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pemantauan Monthly Recurring Revenue (MRR), ARR tahunan, alokasi tier, dan buku besar invoice institusi.
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={loadFinance}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            title="Muat ulang data finansial"
            aria-label="Muat ulang data finansial"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} aria-hidden="true" />
          </button>
          <button
            onClick={handleExportLedger}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <Download className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Ekspor Buku Besar</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Monthly Recurring Revenue (MRR)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            ref={mrrCount.ref}
            className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-2"
          >
            <span>{mrrCount.displayValue}</span>
            <span
              aria-hidden="true"
              className={`inline-block w-2 h-2 rounded-full transition-all duration-75 shrink-0 ${
                mrrCount.isAnimating
                  ? mrrCount.justTickedThousand
                    ? 'bg-[#c2ef4e] scale-125 shadow-[0_0_8px_#c2ef4e]'
                    : 'bg-[#c2ef4e]/30 scale-90'
                  : 'opacity-0 scale-50'
              }`}
            />
          </div>
          {financeData?.growth_rate_mom != null ? (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-semibold font-mono ${
                financeData.growth_rate_mom > 0
                  ? 'text-emerald-600'
                  : financeData.growth_rate_mom < 0
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {financeData.growth_rate_mom > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : financeData.growth_rate_mom < 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : null}
              <span>
                {financeData.growth_rate_mom > 0
                  ? `+${financeData.growth_rate_mom}%`
                  : `${financeData.growth_rate_mom}%`}{' '}
                vs bulan lalu
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 font-mono">Pertumbuhan MoM belum terhitung</p>
          )}
        </div>

        {/* ARR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Annual Run Rate (ARR)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div
            ref={arrCount.ref}
            className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-2"
          >
            <span>{arrCount.displayValue}</span>
            <span
              aria-hidden="true"
              className={`inline-block w-2 h-2 rounded-full transition-all duration-75 shrink-0 ${
                arrCount.isAnimating
                  ? arrCount.justTickedThousand
                    ? 'bg-[#c2ef4e] scale-125 shadow-[0_0_8px_#c2ef4e]'
                    : 'bg-[#c2ef4e]/30 scale-90'
                  : 'opacity-0 scale-50'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Proyeksi tahunan dari langganan aktif (MRR &times; 12)</p>
        </div>

        {/* ARPU */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Average Revenue Per School (ARPU)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div
            ref={arpuCount.ref}
            className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-2"
          >
            <span>{arpuCount.displayValue}</span>
            <span
              aria-hidden="true"
              className={`inline-block w-2 h-2 rounded-full transition-all duration-75 shrink-0 ${
                arpuCount.isAnimating
                  ? arpuCount.justTickedThousand
                    ? 'bg-[#c2ef4e] scale-125 shadow-[0_0_8px_#c2ef4e]'
                    : 'bg-[#c2ef4e]/30 scale-90'
                  : 'opacity-0 scale-50'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Rata-rata pengeluaran per institusi aktif</p>
        </div>

        {/* Paying Schools */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Sekolah Berlangganan Aktif
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {financeData?.paying_tenants ?? financeData?.active_tenants ?? 0} Institusi
          </div>
          {financeData?.churn_rate != null ? (
            <p className="text-[11px] text-slate-500 font-mono">
              Tingkat churn:{' '}
              <span className="font-semibold text-emerald-600">
                {financeData.churn_rate}%
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 font-mono">Tingkat churn belum tercatat</p>
          )}
        </div>
      </div>

      {/* Main Grid: Historical Chart & Plan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical MRR Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Tren Pertumbuhan MRR (6 Bulan Terakhir)
              </h3>
              <p className="text-xs text-slate-500">
                Trajektori pendapatan berulang bulanan dari onboarding sekolah baru
              </p>
            </div>
            {periodGrowthPct !== null ? (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                  periodGrowthPct >= 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {periodGrowthPct >= 0 ? `+${periodGrowthPct}%` : `${periodGrowthPct}%`} Pertumbuhan Periode
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium font-mono">
                Data historis berjalan
              </span>
            )}
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4">
            {historical.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-mono border-b border-slate-200">
                Belum ada data historis MRR yang tercatat.
              </div>
            ) : (
              <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between border-b border-slate-200 pb-2">
                {historical.map((item, idx) => {
                  const heightPercent = maxMrr > 0 ? Math.max(12, Math.round((item.mrr / maxMrr) * 100)) : 12
                  const isCurrent = idx === historical.length - 1
                  const labelFormatted =
                    item.mrr >= 1000000
                      ? `${(item.mrr / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}M`
                      : item.mrr > 0
                      ? `${Math.round(item.mrr / 1000)}k`
                      : '0'

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] font-mono py-1 px-2.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none">
                        {formatIDR(item.mrr)} • {item.tenants ?? item.schools ?? 0} Sekolah ({item.growth || '0%'})
                      </div>

                      <div className="w-full max-w-[48px] flex flex-col items-center">
                        <span className="text-[10px] font-bold font-mono text-slate-600 mb-1">
                          {labelFormatted}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isCurrent
                              ? 'bg-gradient-to-t from-slate-900 to-indigo-600 shadow-md ring-2 ring-indigo-500/60'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              Bulan Berjalan (Aktif)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              Periode Sebelumnya
            </span>
            <span className="font-mono text-slate-600">Siklus Penagihan: Tanggal 1 Tiap Bulan</span>
          </div>
        </div>

        {/* Plan Revenue Distribution (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Distribusi Paket Langganan</h3>
            <p className="text-xs text-slate-500">Kontribusi pendapatan per tingkatan layanan</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Pro Tier */}
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Paket Pro (Unggulan)</span>
                </div>
                <span className="text-xs font-bold text-indigo-700 font-mono">
                  {proStats.percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {proStats.count} Sekolah Terdaftar
                </span>
                <span className="font-bold text-slate-800">
                  <MoneyCountUp value={proStats.subtotal} delay={100} duration={900} />
                </span>
              </div>
              <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, proStats.percentage))}%` }}
                />
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span className="text-xs font-bold text-slate-900">Enterprise District</span>
                </div>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {enterpriseStats.percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {enterpriseStats.count} Sekolah
                </span>
                <span className="font-bold text-slate-800">
                  <MoneyCountUp value={enterpriseStats.subtotal} delay={250} duration={900} />
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, enterpriseStats.percentage))}%` }}
                />
              </div>
            </div>

            {/* Starter Tier */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Starter Edukasi</span>
                </div>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {starterStats.percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {starterStats.count} Sekolah
                </span>
                <span className="font-bold text-slate-800">
                  <MoneyCountUp value={starterStats.subtotal} delay={400} duration={900} />
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, starterStats.percentage))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/superadmin/pricing"
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/80 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all font-display"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Kelola Tarif &amp; Limit Paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Invoices & Billing Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Buku Besar Faktur &amp; Tagihan</h3>
            <p className="text-xs text-slate-500">Riwayat transaksi pembayaran langganan SaaS institusi sekolah</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Cari nomor faktur / sekolah..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 font-mono text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-bold">No. Faktur</th>
                <th className="py-3 px-4 font-bold">Institusi Sekolah</th>
                <th className="py-3 px-4 font-bold">Paket</th>
                <th className="py-3 px-4 font-bold">Metode Bayar</th>
                <th className="py-3 px-4 font-bold">Tanggal</th>
                <th className="py-3 px-4 font-bold">Nominal</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada faktur tagihan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.tenant_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
                        {inv.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {inv.payment_method && inv.payment_method !== '-' ? (
                        inv.payment_method
                      ) : (
                        <span className="text-slate-400 italic">Belum ditentukan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {inv.date && inv.date !== '-' ? inv.date : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <MoneyCountUp value={inv.amount} duration={800} delay={Math.min(idx * 40, 300)} />
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Lunas
                        </span>
                      ) : inv.status === 'past_due' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Jatuh Tempo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {inv.status || 'Draft'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>Faktur</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c2ef4e] bg-slate-900 px-2 py-0.5 rounded font-black">
                  Bukti Pembayaran Resmi
                </span>
                <h3 className="font-display text-lg font-extrabold text-slate-900 mt-1.5">
                  Faktur #{selectedInvoice.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                title="Tutup rincian faktur"
                aria-label="Tutup rincian faktur"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Diterbitkan Untuk:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedInvoice.tenant_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Kode: {selectedInvoice.code}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Tanggal Bayar:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedInvoice.date && selectedInvoice.date !== '-' ? selectedInvoice.date : '-'}</p>
                  {selectedInvoice.status === 'paid' ? (
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Status: Terverifikasi (Lunas)
                    </p>
                  ) : selectedInvoice.status === 'past_due' ? (
                    <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Status: Menunggu Pembayaran (Jatuh Tempo)
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      Status: {selectedInvoice.status}
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 font-mono text-[11px] font-bold text-slate-700 flex justify-between">
                  <span>Deskripsi Layanan</span>
                  <span>Subtotal</span>
                </div>
                <div className="p-3 flex justify-between items-center text-slate-800">
                  <div>
                    <p className="font-bold">Langganan EXAMIND SaaS ({selectedInvoice.plan.toUpperCase()})</p>
                    <p className="text-[10px] text-slate-500">
                      {selectedInvoice.plan.toLowerCase() === 'starter'
                        ? 'Akses LMS CBT, Pengawasan Single Camera & 1.000 Kredit AI'
                        : selectedInvoice.plan.toLowerCase() === 'enterprise'
                        ? 'Akses Yayasan Multi-Sekolah, KMS Dedicated & 25.000 Kredit AI'
                        : 'Akses LMS CBT, AI Dual-Camera Proctoring & 5.000 Kredit AI'}
                    </p>
                  </div>
                  <span className="font-mono font-bold">
                    <MoneyCountUp value={selectedInvoice.amount} duration={800} />
                  </span>
                </div>
                <div className="p-3 border-t border-slate-100 flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Pajak Pertambahan Nilai (PPN 11%)</span>
                  <span className="font-mono text-emerald-700 font-semibold">Termasuk dalam tarif</span>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-900 font-bold">
                  <span>Total Tagihan Dibayar</span>
                  <MoneyCountUp value={selectedInvoice.amount} duration={800} className="font-mono text-base text-emerald-700" />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono text-center">
                Metode Pembayaran: {selectedInvoice.payment_method && selectedInvoice.payment_method !== '-' ? selectedInvoice.payment_method : 'Transfer Bank / SPK Resmi'} • Dikeluarkan oleh PT EXAMIND TEKNOLOGI EDUKASI
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-card cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#c2ef4e]" />
                <span>Cetak Bukti Tagihan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
