'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Compass,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  SlidersHorizontal,
  KeyRound,
  Lock,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { CompanionEdgeEngine, type CompanionTelemetry } from '@/utils/companionEdge'
import { wsBaseUrl } from '@/lib/ws'

function CompanionInner() {
  const searchParams = useSearchParams()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment')
  const [isDimmed, setIsDimmed] = useState(false)
  const [hasWakeLock, setHasWakeLock] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualSessionId, setManualSessionId] = useState('')
  const [manualToken, setManualToken] = useState('')

  // Teacher Warning State
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [warningTeacherName, setWarningTeacherName] = useState('')
  const [warningMessage, setWarningMessage] = useState('')

  const [token, setToken] = useState(
    searchParams.get('token') || searchParams.get('pairing_token') || ''
  )
  const [sessionId, setSessionId] = useState(
    Number(searchParams.get('sessionId') || searchParams.get('session_id')) || 1
  )

  const companionEngineRef = useRef<CompanionEdgeEngine | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wakeLockSentinelRef = useRef<any>(null)

  const [telemetry, setTelemetry] = useState<CompanionTelemetry>({
    motionLevel: 0,
    stabilityScore: 100,
    fps: 0,
    lightLevel: 100,
    deskDetected: true,
    phonePickedUp: false,
  })

  async function startCamera(facing: 'environment' | 'user') {
    setIsSwitchingCamera(true)
    if (companionEngineRef.current) {
      companionEngineRef.current.stop()
    }

    try {
      companionEngineRef.current = new CompanionEdgeEngine({
        onViolation: () => {},
        onFrame: () => {},
        onTelemetry: (t) => {
          setTelemetry({ ...t })
        },
      })

      if (videoRef.current) {
        await companionEngineRef.current.start(videoRef.current, facing)
      }
    } catch (err) {
      console.warn('Camera error:', err)
    } finally {
      setIsSwitchingCamera(false)
    }
  }

  function toggleCameraFacing() {
    const nextFacing = currentFacingMode === 'environment' ? 'user' : 'environment'
    setCurrentFacingMode(nextFacing)
    startCamera(nextFacing)
  }

  function recalibrateOrientation() {
    companionEngineRef.current?.recalibrateOrientation()
  }

  function connectWs() {
    if (!token || !sessionId) return
    const wsUrl = `${wsBaseUrl()}/ws/proctoring/${sessionId}/companion?token=${token}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'SUPERVISOR_WARNING') {
          setWarningTeacherName(msg.payload.teacher_name || 'Pengawas')
          setWarningMessage(msg.payload.message_text || 'Harap fokus ke ujian.')
          setWarningModalOpen(true)
        }
      } catch {}
    }

    ws.onclose = () => {
      setIsConnected(false)
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
          connectWs()
        }
      }, 4000)
    }
  }

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen')
        setHasWakeLock(true)
      }
    } catch {
      setHasWakeLock(false)
    }
  }

  function applyManualPairing() {
    if (manualSessionId && manualToken) {
      setSessionId(Number(manualSessionId))
      setToken(manualToken.trim())
      setShowManualModal(false)
      connectWs()
    }
  }

  useEffect(() => {
    startCamera(currentFacingMode)
    connectWs()
    requestWakeLock()

    // Send telemetry & frames periodically
    const sendInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && companionEngineRef.current) {
        const snapshot = companionEngineRef.current.captureSnapshot()
        wsRef.current.send(
          JSON.stringify({
            event: 'COMPANION_FRAME',
            session_id: sessionId,
            snapshot_url: snapshot,
            metrics: telemetry,
          })
        )
      }
    }, 3000)

    return () => {
      clearInterval(sendInterval)
      if (wsRef.current) wsRef.current.close()
      if (companionEngineRef.current) companionEngineRef.current.stop()
      if (wakeLockSentinelRef.current) wakeLockSentinelRef.current.release()
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [sessionId, token])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-5 font-sans select-none overflow-hidden touch-none">
      {/* Top Header Bar */}
      <header className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-lg backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-[#c2ef4e] flex items-center justify-center font-black text-xs font-mono shadow-xs">
            C2
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                EXAMIND Companion
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#c2ef4e] text-slate-950 font-mono">
                Edge AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Kamera Meja & Sensor Integritas</p>
          </div>
        </div>

        {/* Connection & Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold font-mono ${
              isConnected
                ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/50 border-rose-800/60 text-rose-400 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span>{isConnected ? 'Terhubung' : 'Menghubungkan...'}</span>
          </div>

          {/* Controls button: Flip camera */}
          <button
            onClick={toggleCameraFacing}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 transition-colors cursor-pointer"
            title="Ganti Kamera"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSwitchingCamera ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Camera Viewport */}
      <main className="flex-1 my-3 sm:my-4 rounded-xl overflow-hidden border border-slate-800 bg-black relative flex items-center justify-center shadow-2xl">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

        {/* Interactive 45° Desk Alignment Overlay Guide */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          {/* Top Guide Banner */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold bg-slate-900/85 border border-slate-800 px-3 py-1.5 rounded-lg text-white backdrop-blur flex items-center gap-1.5 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-[#c2ef4e]" />
              <span>Sudut Rekomendasi: 45° ke Meja & Tangan</span>
            </div>

            {/* Stability Indicator */}
            <div
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border backdrop-blur flex items-center gap-1.5 shadow-lg ${
                telemetry.stabilityScore >= 80
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-700 text-amber-300 animate-pulse'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Stabil: {telemetry.stabilityScore}%</span>
            </div>
          </div>

          {/* Center Desk Framing Reticle */}
          <div
            className={`relative w-full h-44 sm:h-56 mx-auto border-2 border-dashed rounded-xl transition-colors duration-300 flex items-center justify-center ${
              telemetry.phonePickedUp ? 'border-rose-500 bg-rose-500/10' : 'border-indigo-500/40 bg-indigo-500/10'
            }`}
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />

            {telemetry.phonePickedUp ? (
              <div className="text-center px-4 py-2 bg-rose-950/90 border border-rose-600 rounded-lg text-xs font-bold text-rose-200 animate-pulse">
                ⚠️ PERINGATAN: Jangan Mengangkat Smartphone!
              </div>
            ) : (
              <div className="text-center text-[11px] text-slate-300 font-medium px-4">
                Area Pantauan Keyboard, Layar Laptop, & Meja Kerja
              </div>
            )}
          </div>

          {/* Bottom Telemetry HUD Overlay */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/85 border border-slate-800 rounded-xl p-2.5 backdrop-blur shadow-lg">
            {/* Motion Level */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Gerakan</span>
                <span
                  className={`font-mono font-bold ${
                    telemetry.motionLevel > 60 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {telemetry.motionLevel}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    telemetry.motionLevel > 60
                      ? 'bg-rose-500'
                      : telemetry.motionLevel > 30
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, telemetry.motionLevel)}%` }}
                />
              </div>
            </div>

            {/* Edge AI Status */}
            <div className="space-y-1 border-x border-slate-800 px-2 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Edge CV</span>
              <span className="text-[11px] font-bold text-[#c2ef4e] flex items-center justify-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] animate-ping" />
                {telemetry.fps} FPS
              </span>
            </div>

            {/* Light & Placement Level */}
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Cahaya</span>
              </div>
              <span className="text-[11px] font-bold font-mono text-white">
                {telemetry.lightLevel > 180 ? 'Terang' : telemetry.lightLevel > 40 ? 'Optimal' : 'Redup'}
              </span>
            </div>
          </div>
        </div>

        {/* Battery Saver Dim Overlay */}
        {isDimmed && (
          <div
            onClick={() => setIsDimmed(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <Moon className="w-10 h-10 text-indigo-400 mb-2 animate-pulse" />
            <h4 className="text-sm font-bold text-white">Mode Hemat Daya Layar Aktif</h4>
            <p className="text-xs text-slate-400 mt-1">Kamera & Edge AI tetap aktif memantau di latar belakang.</p>
            <span className="mt-4 px-4 py-2 rounded-lg bg-slate-950 text-xs text-[#c2ef4e] font-semibold border border-slate-800 font-mono">
              Ketuk layar untuk menampilkan kembali
            </span>
          </div>
        )}
      </main>

      {/* Footer Controls & Calibration */}
      <footer className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2 shadow-lg backdrop-blur z-20">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={recalibrateOrientation}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#c2ef4e]" />
            <span>Kalibrasi Ulang Posisi</span>
          </button>

          <button
            onClick={() => setIsDimmed(!isDimmed)}
            className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isDimmed ? 'Layar Nyala' : 'Redupkan'}</span>
          </button>

          {(!token || !sessionId) && (
            <button
              onClick={() => setShowManualModal(true)}
              className="py-2 px-3 rounded-lg bg-[#c2ef4e] hover:bg-lime-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium font-mono">
          <span>Sesi: #{sessionId}</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            Screen Wake Lock: {hasWakeLock ? 'Aktif' : 'Standby'}
          </span>
        </div>
      </footer>

      {/* Manual Pairing PIN Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-900">
            <h3 className="text-base font-bold text-slate-900">Hubungkan Manual</h3>
            <p className="text-xs text-slate-500">
              Masukkan ID Sesi dan Token yang tertera di layar komputer Anda:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1 font-mono">Session ID</label>
                <input
                  value={manualSessionId}
                  onChange={(e) => setManualSessionId(e.target.value)}
                  type="number"
                  placeholder="Contoh: 1"
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1 font-mono">Token Pairing</label>
                <input
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  type="text"
                  placeholder="Masukkan token..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={applyManualPairing}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Hubungkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Teacher Warning Modal for Mobile */}
      {warningModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-rose-950/95 border-2 border-rose-600 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500 text-rose-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Peringatan dari Pengawas</h3>
              <p className="text-[11px] text-rose-300 mt-0.5">Pengawas: {warningTeacherName}</p>
            </div>
            <p className="text-xs font-semibold text-rose-100 bg-rose-900/40 p-3 rounded-xl border border-rose-800/50 leading-relaxed text-left">
              &quot;{warningMessage}&quot;
            </p>
            <button
              onClick={() => setWarningModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompanionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#c2ef4e] animate-spin" />
        </div>
      }
    >
      <CompanionInner />
    </Suspense>
  )
}
