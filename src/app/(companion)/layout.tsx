import React from 'react'

export default function CompanionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans select-none overflow-hidden touch-none">
      {children}
    </div>
  )
}
