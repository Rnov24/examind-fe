'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  RefreshCw,
  Moon,
  SlidersHorizontal,
  KeyRound,
  Lock,
  AlertTriangle,
  Loader2,
  VideoOff,
  BatteryLow,
  Power,
  SwitchCamera,
  Clock,
} from 'lucide-react'
import { CompanionEdgeEngine, type CompanionTelemetry } from '@/utils/companionEdge'
import { wsBaseUrl } from '@/lib/ws'

// Event types the backend accepts on COMPANION_EDGE_VIOLATION (ProctoringLog
// enum). Engine-only signals such as 'camera_error' are surfaced in this UI
// instead and are never forwarded.
const BACKEND_VIOLATION_TYPES = new Set([
  'face_absent',
  'multiple_faces',
  'gaze_away',
  'tab_switch',
  'fullscreen_exit',
  'suspicious_object',
  'companion_disconnected',
  'phone_detected',
])

type ConnState = 'idle' | 'connecting' | 'connected' | 'disconnected'
type CameraState = 'starting' | 'ready' | 'denied'

const INITIAL_TELEMETRY: CompanionTelemetry = {
  motionLevel: 0,
  stabilityScore: 100,
  fps: 0,
  lightLevel: 100,
  deskDetected: true,
  phonePickedUp: false,
}

interface StatusAlert {
  type: string
  severity: 'low' | 'medium' | 'high'
  text: string
  at: number
}

function formatElapsed(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function CompanionInner() {
  const searchParams = useSearchParams()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [connState, setConnState] = useState<ConnState>('idle')
  const [cameraState, setCameraState] = useState<CameraState>('starting')
  const [ended, setEnded] = useState(false)
  const [runId, setRunId] = useState(0)
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment')
  const [isDimmed, setIsDimmed] = useState(false)
  const [hasWakeLock, setHasWakeLock] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualSessionId, setManualSessionId] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [lastAlert, setLastAlert] = useState<StatusAlert | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [connectFails, setConnectFails] = useState(0)
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null)

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
  const [studentName] = useState(
    searchParams.get('student') || searchParams.get('student_name') || ''
  )

  const companionEngineRef = useRef<CompanionEdgeEngine | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wakeLockSentinelRef = useRef<any>(null)
  const telemetryRef = useRef<CompanionTelemetry>(INITIAL_TELEMETRY)
  const sessionRef = useRef(sessionId)
  sessionRef.current = sessionId
  const endedRef = useRef(false)
  const disposedRef = useRef(false)
  const reconnectTimerRef = useRef<any>(null)
  const startTsRef = useRef<number | null>(null)

  const [telemetry, setTelemetry] = useState<CompanionTelemetry>(INITIAL_TELEMETRY)

  function sendViolation(
    eventType: string,
    severity: 'low' | 'medium' | 'high',
    snapshotBase64?: string,
    details?: string
  ) {
    if (!BACKEND_VIOLATION_TYPES.has(eventType)) return
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: 'COMPANION_EDGE_VIOLATION',
          session_id: sessionRef.current,
          event_type: eventType,
          severity,
          snapshot: snapshotBase64,
          details,
          duration_seconds: 1,
        })
      )
    }
  }

  async function startCamera(facing: 'environment' | 'user') {
    setIsSwitchingCamera(true)
    setCameraState('starting')
    if (companionEngineRef.current) {
      companionEngineRef.current.stop()
    }

    const engine = new CompanionEdgeEngine({
      onViolation: (eventType, severity, snapshotBase64, details) => {
        setLastAlert({
          type: eventType,
          severity,
          text: details || 'Pelanggaran terdeteksi kamera pendamping',
          at: Date.now(),
        })
        sendViolation(eventType, severity, snapshotBase64, details)
      },
      onFrame: () => {},
      onTelemetry: (t) => {
        telemetryRef.current = t
        setTelemetry({ ...t })
      },
      onCameraReady: () => {
        setCameraState('ready')
      },
    })
    companionEngineRef.current = engine

    try {
      if (videoRef.current) {
        await engine.start(videoRef.current, facing)
      }
      setCameraState('ready')
    } catch (err) {
      console.warn('Camera error:', err)
      setCameraState('denied')
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
    if (!token || !sessionId || endedRef.current || disposedRef.current) return
    const wsUrl = `${wsBaseUrl()}/ws/proctoring/${sessionId}/companion?token=${token}`

    setConnState('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    let opened = false

    ws.onopen = () => {
      opened = true
      setConnectFails(0)
      setConnState('connected')
      if (!startTsRef.current) {
        startTsRef.current = Date.now()
      }
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
      if (disposedRef.current || endedRef.current) return
      setConnState(opened ? 'disconnected' : 'connecting')
      if (!opened) {
        setConnectFails((n) => n + 1)
      }
      reconnectTimerRef.current = setTimeout(() => {
        if (
          !disposedRef.current &&
          !endedRef.current &&
          wsRef.current === ws &&
          ws.readyState === WebSocket.CLOSED
        ) {
          connectWs()
        }
      }, 4000)
    }
  }

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        const sentinel = await (navigator as any).wakeLock.request('screen')
        wakeLockSentinelRef.current = sentinel
        setHasWakeLock(true)
        sentinel.addEventListener?.('release', () => setHasWakeLock(false))
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
      // The main effect re-runs on sessionId/token change and reconnects.
    }
  }

  function endSession() {
    endedRef.current = true
    setEnded(true)
    setConnState('idle')
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
    if (companionEngineRef.current) {
      companionEngineRef.current.stop()
      companionEngineRef.current = null
    }
    if (wakeLockSentinelRef.current) {
      try {
        wakeLockSentinelRef.current.release()
      } catch {}
      wakeLockSentinelRef.current = null
      setHasWakeLock(false)
    }
    startTsRef.current = null
    setElapsedSec(0)
  }

  function restartSession() {
    endedRef.current = false
    setEnded(false)
    setLastAlert(null)
    setRunId((id) => id + 1)
  }

  // Main lifecycle: camera + WebSocket + periodic frame upload
  useEffect(() => {
    if (ended) return
    disposedRef.current = false
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
            // Backend WS handler reads the frame from `frame` (it relays it
            // to the teacher monitor as snapshot_url). Keep the legacy
            // `snapshot_url` key too so older backends still work.
            frame: snapshot,
            snapshot_url: snapshot,
            metrics: telemetryRef.current,
          })
        )
      }
    }, 3000)

    return () => {
      disposedRef.current = true
      clearInterval(sendInterval)
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (wsRef.current) wsRef.current.close()
      if (companionEngineRef.current) companionEngineRef.current.stop()
      if (wakeLockSentinelRef.current) {
        try {
          wakeLockSentinelRef.current.release()
        } catch {}
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token, runId])

  // Elapsed session clock (also re-renders once per second so transient
  // status alerts expire on time)
  useEffect(() => {
    const timer = setInterval(() => {
      if (startTsRef.current) {
        setElapsedSec(Math.floor((Date.now() - startTsRef.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Re-acquire the screen wake lock when the page returns to foreground
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !endedRef.current) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Battery status (best-effort; stays hidden where the API is unsupported)
  useEffect(() => {
    let battery: any = null
    const update = () => {
      if (battery) {
        setBatteryInfo({ level: battery.level, charging: battery.charging })
      }
    }
    const nav = navigator as any
    if (typeof nav.getBattery === 'function') {
      nav
        .getBattery()
        .then((b: any) => {
          battery = b
          update()
          b.addEventListener('levelchange', update)
          b.addEventListener('chargingchange', update)
        })
        .catch(() => {})
    }
    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', update)
        battery.removeEventListener('chargingchange', update)
      }
    }
  }, [])

  const personPresent = telemetry.detectionActive
    ? !!telemetry.personDetected
    : telemetry.deskDetected
  const guideVisible = cameraState === 'ready' && !!token && !ended && !personPresent
  const batteryLow =
    batteryInfo !== null && batteryInfo.level <= 0.2 && !batteryInfo.charging
  const alertFresh = lastAlert !== null && Date.now() - lastAlert.at < 8000

  const status = ((): { text: string; tone: 'ok' | 'warn' | 'danger' | 'info' } => {
    if (cameraState === 'denied') {
      return { text: 'Kamera belum aktif — izinkan akses kamera', tone: 'danger' }
    }
    if (alertFresh && lastAlert) {
      return { text: lastAlert.text, tone: lastAlert.severity === 'medium' ? 'warn' : 'danger' }
    }
    if (telemetry.phonePickedUp) {
      return { text: 'Jangan angkat HP — letakkan kembali di meja', tone: 'danger' }
    }
    if (connState === 'disconnected') {
      return { text: 'Koneksi terputus — menyambung ulang…', tone: 'warn' }
    }
    if (connState !== 'connected') {
      return { text: 'Menghubungkan ke sesi ujian…', tone: 'info' }
    }
    if (cameraState !== 'ready') {
      return { text: 'Menyiapkan kamera…', tone: 'info' }
    }
    if (!personPresent) {
      return { text: 'Posisikan badan dan meja agar terlihat kamera', tone: 'warn' }
    }
    if (telemetry.stabilityScore < 50) {
      return { text: 'Posisi HP kurang stabil — sandarkan dengan kokoh', tone: 'warn' }
    }
    return { text: 'Semua aman', tone: 'ok' }
  })()

  const statusToneClass =
    status.tone === 'ok'
      ? 'text-emerald-300'
      : status.tone === 'warn'
        ? 'text-amber-300'
        : status.tone === 'danger'
          ? 'text-rose-300'
          : 'text-white'
  const statusTileClass =
    status.tone === 'ok'
      ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
      : status.tone === 'warn'
        ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
        : status.tone === 'danger'
          ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
          : 'bg-white/10 border-white/15 text-white'

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#150f23] text-white font-sans select-none">
      <h1 className="sr-only">Kamera Pendamping Ujian</h1>
      {/* Full-viewport camera preview */}
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay playsInline muted />

      {/* Legibility scrims */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#150f23]/85 to-transparent z-[5]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#150f23]/95 to-transparent z-[5]" />

      {/* Framing guide — visible until a person is detected in frame */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none flex items-center justify-center px-6 pb-40 transition-opacity duration-500 ${
          guideVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!guideVisible}
      >
        <div
          className={`relative w-full max-w-sm h-52 border-2 border-dashed rounded-3xl transition-colors duration-300 ${
            telemetry.phonePickedUp ? 'border-rose-400/80 bg-rose-500/10' : 'border-[#c2ef4e]/50 bg-white/5'
          }`}
        >
          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-[3px] border-l-[3px] border-[#c2ef4e] rounded-tl-2xl" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-[3px] border-r-[3px] border-[#c2ef4e] rounded-tr-2xl" />
          <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-[3px] border-l-[3px] border-[#c2ef4e] rounded-bl-2xl" />
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-[3px] border-r-[3px] border-[#c2ef4e] rounded-br-2xl" />
          <div className="absolute inset-x-0 -bottom-12 flex justify-center">
            <span className="text-[11px] font-semibold bg-[#150f23]/85 border border-white/15 px-3 py-1.5 rounded-full text-white/90 backdrop-blur text-center">
              Arahkan kamera: badan, tangan, dan meja terlihat
            </span>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-black tracking-[0.22em] leading-tight">
              EXAMIND<span className="text-[#c2ef4e]">.</span>
            </div>
            <p className="text-[10px] text-white/55 leading-tight mt-0.5">Kamera Pendamping Ujian</p>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${
              connState === 'connected'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : connState === 'disconnected'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
            role="status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connState === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : connState === 'disconnected'
                    ? 'bg-rose-400'
                    : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>
              {connState === 'connected'
                ? 'Terhubung'
                : connState === 'disconnected'
                  ? 'Terputus'
                  : 'Menghubungkan'}
            </span>
          </div>
        </div>
      </header>

      {/* Camera preparing chip */}
      {cameraState === 'starting' && !ended && (
        <div className="absolute inset-x-0 top-20 z-20 flex justify-center pointer-events-none">
          <span className="flex items-center gap-2 text-[11px] font-semibold bg-[#150f23]/85 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
            Menyiapkan kamera…
          </span>
        </div>
      )}

      {/* Bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-3xl border border-white/10 bg-[#150f23]/90 backdrop-blur-md p-4 space-y-3 shadow-2xl">
          {/* Big status line */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 shrink-0 rounded-2xl border flex items-center justify-center ${statusTileClass}`}>
              {status.tone === 'ok' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <p className={`text-base font-bold leading-snug ${statusToneClass}`} role="status">
              {status.text}
            </p>
          </div>

          {/* Battery warning */}
          {batteryLow && batteryInfo && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold">
              <BatteryLow className="w-4 h-4 shrink-0" />
              <span>
                Baterai {Math.round(batteryInfo.level * 100)}% — sambungkan charger agar kamera tidak
                mati di tengah ujian.
              </span>
            </div>
          )}

          {/* Pairing hint after repeated failed connections */}
          {connState !== 'connected' && connectFails >= 3 && (
            <p className="text-[11px] text-amber-200/90 leading-relaxed px-1">
              Belum bisa terhubung. Token pairing mungkin sudah tidak berlaku — periksa kembali kode
              pairing di layar laptop Anda.
            </p>
          )}

          {/* Session meta */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-white/50 px-1">
            <span className="truncate">
              Sesi #{sessionId}
              {studentName ? ` • ${studentName}` : ''}
            </span>
            <span className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="w-3 h-3" />
                {formatElapsed(elapsedSec)}
              </span>
              <span className="flex items-center gap-1">
                <Lock className={`w-3 h-3 ${hasWakeLock ? 'text-emerald-400' : 'text-white/30'}`} />
                {hasWakeLock ? 'Layar terjaga' : 'Layar standar'}
              </span>
            </span>
          </div>

          {/* Secondary controls — all touch targets >= 48px */}
          <div className="flex items-center gap-2">
            <button
              onClick={recalibrateOrientation}
              className="flex-1 h-12 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#c2ef4e]" />
              <span>Kalibrasi</span>
            </button>
            <button
              onClick={toggleCameraFacing}
              disabled={isSwitchingCamera}
              className="flex-1 h-12 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSwitchingCamera ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <SwitchCamera className="w-4 h-4 text-[#c2ef4e]" />
              )}
              <span>Balik Kamera</span>
            </button>
            <button
              onClick={() => setIsDimmed(true)}
              className="flex-1 h-12 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Moon className="w-4 h-4 text-[#c2ef4e]" />
              <span>Redupkan</span>
            </button>
          </div>

          {/* End session */}
          <button
            onClick={endSession}
            className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Power className="w-5 h-5" />
            Akhiri Kamera
          </button>
        </div>
      </div>

      {/* Battery Saver Dim Overlay */}
      {isDimmed && (
        <div
          onClick={() => setIsDimmed(false)}
          className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
        >
          <Moon className="w-10 h-10 text-[#c2ef4e] mb-2 animate-pulse" />
          <h4 className="text-sm font-bold text-white">Layar Diredupkan</h4>
          <p className="text-xs text-white/50 mt-1">
            Kamera dan pemantauan tetap berjalan di latar belakang.
          </p>
          <span className="mt-4 px-4 py-2 rounded-lg bg-white/5 text-xs text-[#c2ef4e] font-semibold border border-white/10">
            Ketuk layar untuk menampilkan kembali
          </span>
        </div>
      )}

      {/* Waiting-for-pairing state (no token in URL) */}
      {!token && !ended && (
        <div className="absolute inset-0 z-40 bg-[#150f23] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#c2ef4e] flex items-center justify-center mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold">Hubungkan Kamera Pendamping</h2>
          <ol className="text-left text-xs text-white/60 leading-relaxed space-y-2 mt-4 max-w-xs list-decimal list-inside">
            <li>Buka halaman ujian di laptop Anda.</li>
            <li>Tampilkan kode QR atau tautan pairing kamera pendamping.</li>
            <li>Pindai kode atau buka tautan tersebut dengan HP ini.</li>
          </ol>
          <button
            onClick={() => setShowManualModal(true)}
            className="mt-6 w-full max-w-xs h-12 rounded-xl bg-[#c2ef4e] hover:bg-lime-300 text-[#150f23] text-sm font-bold transition-colors cursor-pointer"
          >
            Masukkan Kode Pairing Manual
          </button>
          <p className="text-[11px] text-white/70 mt-4">Kamera akan mulai memantau setelah terhubung ke sesi ujian.</p>
        </div>
      )}

      {/* Camera denied state */}
      {cameraState === 'denied' && !!token && !ended && (
        <div className="absolute inset-0 z-40 bg-[#150f23]/[.97] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center mb-4">
            <VideoOff className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold">Kamera Tidak Dapat Diakses</h2>
          <ul className="text-left text-xs text-white/60 leading-relaxed space-y-2 mt-4 max-w-xs list-disc list-inside">
            <li>Izinkan akses kamera untuk situs ini di pengaturan browser.</li>
            <li>Tutup aplikasi lain yang sedang memakai kamera.</li>
            <li>Gunakan browser terbaru (Chrome atau Safari).</li>
          </ul>
          <button
            onClick={() => startCamera(currentFacingMode)}
            className="mt-6 w-full max-w-xs h-12 rounded-xl bg-[#c2ef4e] hover:bg-lime-300 text-[#150f23] text-sm font-bold transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Session ended state */}
      {ended && (
        <div className="absolute inset-0 z-40 bg-[#150f23] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/70 flex items-center justify-center mb-4">
            <Power className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold">Kamera Pendamping Diakhiri</h2>
          <p className="text-xs text-white/55 leading-relaxed mt-2 max-w-xs">
            Kamera HP ini sudah berhenti memantau. Pengawas di sesi ujian Anda menerima pemberitahuan
            bahwa kamera pendamping terputus.
          </p>
          <button
            onClick={restartSession}
            className="mt-6 w-full max-w-xs h-12 rounded-xl bg-[#c2ef4e] hover:bg-lime-300 text-[#150f23] text-sm font-bold transition-colors cursor-pointer"
          >
            Sambungkan Lagi
          </button>
        </div>
      )}

      {/* Manual Pairing Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1d1430] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white">
            <h3 className="text-base font-bold">Hubungkan Manual</h3>
            <p className="text-xs text-white/55">
              Masukkan ID Sesi dan Token yang tertera di layar komputer Anda:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">ID Sesi</label>
                <input
                  value={manualSessionId}
                  onChange={(e) => setManualSessionId(e.target.value)}
                  type="number"
                  inputMode="numeric"
                  placeholder="Contoh: 1"
                  className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c2ef4e]/60"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">Token Pairing</label>
                <input
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  type="text"
                  placeholder="Masukkan token..."
                  className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c2ef4e]/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowManualModal(false)}
                className="px-4 h-12 rounded-lg border border-white/15 hover:bg-white/5 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={applyManualPairing}
                className="px-5 h-12 rounded-lg bg-[#c2ef4e] hover:bg-lime-300 text-[#150f23] font-bold text-xs cursor-pointer transition-colors"
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
          <div className="bg-rose-950/95 border-2 border-rose-600 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center animate-in fade-in zoom-in duration-200">
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
              className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-[#150f23] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#c2ef4e] animate-spin" />
        </div>
      }
    >
      <CompanionInner />
    </Suspense>
  )
}
