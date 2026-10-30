'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Activity, ShieldCheck, Cpu, Zap, Database } from 'lucide-react'

interface TelemetryItem {
  id: string
  label: string
  value: string
  targetNumber?: number
  prefix?: string
  suffix?: string
  sublabel: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
  badgeText: string
  badgeColor: 'lime' | 'emerald' | 'violet' | 'violet'
}

const TELEMETRY_DATA: TelemetryItem[] = [
  {
    id: 'students',
    label: 'Peserta Ujian Serentak',
    value: '34.120+',
    targetNumber: 34120,
    suffix: '+',
    sublabel: 'Teruji Tanpa Data-Loss',
    detail: 'Tercatat dalam 42 institusi pendidikan dengan 0 kegagalan pengiriman lembar jawaban.',
    icon: Database,
    badgeText: 'INDEXEDDB ENGINE',
    badgeColor: 'emerald',
  },
  {
    id: 'latency',
    label: 'Latensi WebSocket Hub',
    value: '18 ms',
    targetNumber: 18,
    suffix: ' ms',
    sublabel: 'Sinkronisasi Kamera Ganda',
    detail: 'Transmisi audio visual terenkripsi dengan latensi ultra-rendah untuk pengawasan akurat.',
    icon: Zap,
    badgeText: 'REALTIME STREAM',
    badgeColor: 'lime',
  },
  {
    id: 'disqualification',
    label: 'Diskualifikasi Sepihak AI',
    value: '0 Kasus',
    targetNumber: 0,
    suffix: ' Kasus',
    sublabel: 'Human-in-the-Loop Murni',
    detail: 'AI hanya bertindak sebagai asisten pencatat bukti. Putusan sanksi 100% wewenang guru.',
    icon: ShieldCheck,
    badgeText: 'PEDAGOGICAL ETHICS',
    badgeColor: 'violet',
  },
  {
    id: 'compliance',
    label: 'Kepatuhan Regulasi',
    value: 'UU PDP 2022',
    sublabel: 'Pasal 27 / UU No. 27',
    detail: 'Enkripsi data biometrik AES-256 dan penghapusan otomatis snapshot wajah setelah 60 hari.',
    icon: Cpu,
    badgeText: 'LEGAL ACCREDITED',
    badgeColor: 'violet',
  },
]

export function TelemetryTicker() {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    if (tickerRef.current) {
      observer.observe(tickerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={tickerRef}
      className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 mb-12"
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-lg p-3 sm:p-4">
        {/* Top telemetry bar indicator */}
        <div className="flex items-center justify-between pb-3 px-2 sm:px-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold text-slate-800 tracking-wider uppercase text-[11px]">
              Telemetri Integritas Operasional CBT
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>NODE ID: ID-JKT-01</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>STATUS: NORMAL OPERATIONAL</span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          {TELEMETRY_DATA.map((item) => {
            const Icon = item.icon
            const isHovered = activeItem === item.id

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveItem(item.id)}
                onMouseLeave={() => setActiveItem(null)}
                className={`relative p-4 rounded-xl border transition-colors duration-200 cursor-default ${
                  isHovered
                    ? 'border-slate-900 bg-slate-50/80 shadow-sm translate-y-[-2px]'
                    : 'border-slate-100 bg-slate-50/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      item.badgeColor === 'lime'
                        ? 'bg-[#c2ef4e]/20 text-slate-950'
                        : item.badgeColor === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.badgeColor === 'violet'
                        ? 'bg-violet-50 text-violet-700'
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.badgeText}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">{item.label}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{item.sublabel}</div>
                </div>

                {/* Expanded Micro-Detail on hover */}
                {isHovered && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed anim-fade">
                    {item.detail}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
