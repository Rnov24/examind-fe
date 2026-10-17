'use client'

import React, { useState } from 'react'
import { ShieldCheck, Scale, Database, Check } from 'lucide-react'

export type StampVariant = 'pdp' | 'indexeddb' | 'human-loop'

interface InstitutionalStampProps {
  variant: StampVariant
  className?: string
  angle?: number
}

const STAMP_CONFIG: Record<
  StampVariant,
  {
    title: string
    subtitle: string
    code: string
    year: string
    icon: React.ComponentType<{ className?: string }>
    theme: 'violet' | 'emerald' | 'slate'
  }
> = {
  pdp: {
    title: 'UU PDP PASAL 27/2022',
    subtitle: 'RETENSI MAKSIMAL 60 HARI',
    code: 'LEGAL PRIVACY ASSURED',
    year: '2026',
    icon: Scale,
    theme: 'slate',
  },
  indexeddb: {
    title: 'ZERO DATA-LOSS GUARANTEE',
    subtitle: 'INDEXEDDB LOCAL EDGE SYNC',
    code: 'SECURE PERSISTENCE',
    year: '2026',
    icon: Database,
    theme: 'emerald',
  },
  'human-loop': {
    title: 'HUMAN-IN-THE-LOOP AI',
    subtitle: 'OTORITAS MUTLAK PENDIDIK',
    code: 'ZERO AUTO-DISQUALIFY',
    year: '2026',
    icon: ShieldCheck,
    theme: 'violet',
  },
}

export function InstitutionalStamp({
  variant,
  className = '',
  angle = -2,
}: InstitutionalStampProps) {
  const [isPressed, setIsPressed] = useState(false)
  const config = STAMP_CONFIG[variant]
  const Icon = config.icon

  const handlePress = () => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 300)
  }

  const themeColors = {
    slate: 'border-slate-800 text-slate-800 hover:border-slate-950',
    emerald: 'border-emerald-700 text-emerald-800 hover:border-emerald-900',
    violet: 'border-indigo-900 text-indigo-900 hover:border-indigo-950',
  }[config.theme]

  return (
    <div
      onClick={handlePress}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handlePress()
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        transform: `rotate(${angle}deg) scale(${isPressed ? 0.94 : 1})`,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease',
      }}
      className={`inline-block select-none cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl ${className}`}
      aria-label={`Stempel Sertifikasi Institusi: ${config.title}`}
    >
      <div
        className={`relative p-2.5 sm:p-3 rounded-xl border-2 border-dashed bg-white/95 backdrop-blur-sm shadow-xs ${themeColors}`}
      >
        {/* Double ring border */}
        <div className="border border-current rounded-lg p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-current flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-current" />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-black tracking-widest uppercase opacity-75">
              <span>{config.code}</span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span>{config.year}</span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-extrabold tracking-tight leading-none mt-0.5">
              {config.title}
            </span>
            <span className="text-[10px] font-semibold tracking-wider opacity-80 mt-0.5 uppercase">
              {config.subtitle}
            </span>
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center pl-2 border-l border-current/30 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider">VALID</span>
          </div>
        </div>

        {/* Tactile ink ripple ring on press */}
        {isPressed && (
          <span
            className="absolute inset-0 rounded-xl border-2 border-current animate-ping opacity-30 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
