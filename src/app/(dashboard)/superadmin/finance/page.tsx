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
  ShieldCheck,
  CheckCircle2,
  Coins,
  Key,
  RefreshCw,
  FileText,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import api from '@/lib/api'

interface Invoice {
  id: string
  tenant_name: string
  code: string
  plan: string
  amount: number
  status: string
  date: string
  payment_method: string
}

interface PlanStat {
  count: number
  subtotal: number
  percentage: number
}

interface MonthStat {
  month: string
  mrr: number
  tenants: number
  growth: string
}

export default function SuperAdminFinancePage() {
  const [financeData, setFinanceData] = useState<any>(null)
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

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  const invoices: Invoice[] = financeData?.recent_invoices || []
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.tenant_name.toLowerCase().includes(searchInvoice.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchInvoice.toLowerCase()) ||
      inv.code.toLowerCase().includes(searchInvoice.toLowerCase())
  )

  const historical: MonthStat[] = financeData?.historical_mrr || []
  const maxMrr = Math.max(...historical.map((h) => h.mrr), 5000000)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-emerald-50/70 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-blue-50/50 rounded-full blur-2xl"></div>

        <div className="relative flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-emerald-50/70">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Finansial & MRR Analytics
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
            onClick={() => alert('Laporan keuangan format CSV & PDF telah diekspor ke sistem!')}
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
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatIDR(financeData?.mrr || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+16.7% vs bulan lalu</span>
          </div>
        </div>

        {/* ARR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Annual Run Rate (ARR)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatIDR(financeData?.arr || 0)}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Proyeksi tahunan dari langganan aktif</p>
        </div>

        {/* ARPU */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Average Revenue Per School (ARPU)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatIDR(financeData?.arpu || 0)}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Rata-rata pengeluaran per institusi</p>
        </div>

        {/* Paying Schools */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Sekolah Berlangganan Aktif
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {financeData?.paying_tenants || 0} Institusi
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold font-mono">100% Churn Prevention SLA</p>
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
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
              +133% YTD Growth
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4">
            <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between border-b border-slate-200 pb-2">
              {historical.map((item, idx) => {
                const heightPercent = Math.max(15, Math.round((item.mrr / maxMrr) * 100))
                const isCurrent = idx === historical.length - 1

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded-lg whitespace-nowrap shadow-xl pointer-events-none">
                      {formatIDR(item.mrr)} • {item.tenants} Sekolah ({item.growth})
                    </div>

                    <div className="w-full max-w-[48px] flex flex-col items-center">
                      <span className="text-[10px] font-bold font-mono text-slate-600 mb-1">
                        {(item.mrr / 1000000).toFixed(1)}M
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isCurrent
                            ? 'bg-gradient-to-t from-slate-900 to-indigo-600 shadow-md ring-2 ring-[#c2ef4e]/60'
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
                  {financeData?.plans_breakdown?.pro?.percentage || 100}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {financeData?.plans_breakdown?.pro?.count || 1} Sekolah Terdaftar
                </span>
                <span className="font-bold text-slate-800">
                  {formatIDR(financeData?.plans_breakdown?.pro?.subtotal || 3500000)}
                </span>
              </div>
              <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${financeData?.plans_breakdown?.pro?.percentage || 100}%` }}
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
                  {financeData?.plans_breakdown?.enterprise?.percentage || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {financeData?.plans_breakdown?.enterprise?.count || 0} Sekolah
                </span>
                <span className="font-bold text-slate-800">
                  {formatIDR(financeData?.plans_breakdown?.enterprise?.subtotal || 0)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${financeData?.plans_breakdown?.enterprise?.percentage || 0}%` }}
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
                  {financeData?.plans_breakdown?.starter?.percentage || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {financeData?.plans_breakdown?.starter?.count || 0} Sekolah
                </span>
                <span className="font-bold text-slate-800">
                  {formatIDR(financeData?.plans_breakdown?.starter?.subtotal || 0)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${financeData?.plans_breakdown?.starter?.percentage || 0}%` }}
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
              <span>Kelola Tarif & Limit Paket &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Invoices & Billing Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Buku Besar Faktur & Tagihan</h3>
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
                filteredInvoices.map((inv) => (
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
                      {inv.payment_method}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {inv.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatIDR(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Lunas
                      </span>
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
                ✕
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
                  <p className="font-bold text-slate-900 mt-0.5">{selectedInvoice.date}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Status: Terverifikasi
                  </p>
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
                    <p className="text-[10px] text-slate-500">Akses LMS CBT, AI Proctoring & 5.000 Kredit AI</p>
                  </div>
                  <span className="font-mono font-bold">{formatIDR(selectedInvoice.amount)}</span>
                </div>
                <div className="p-3 border-t border-slate-100 flex justify-between items-center text-slate-500 text-[11px]">
                  <span>PPN (11% Ditanggung Platform)</span>
                  <span className="font-mono">Rp 0</span>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-900 font-bold">
                  <span>Total Tagihan Dibayar</span>
                  <span className="font-mono text-base text-emerald-700">{formatIDR(selectedInvoice.amount)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono text-center">
                Metode Pembayaran: {selectedInvoice.payment_method} • Dikeluarkan oleh PT EXAMIND TEKNOLOGI EDUKASI
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
