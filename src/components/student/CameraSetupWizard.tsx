'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Ban,
  Camera,
  CameraOff,
  Check,
  ChevronLeft,
  ClipboardList,
  Copy,
  Eye,
  Lightbulb,
  Loader2,
  Maximize,
  Moon,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Smartphone,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useProctoringStore } from '@/stores/proctoringStore'
import { detectFaces, ensureMediaPipeLoaded } from '@/utils/mediapipeDetect'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

type CamState = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable' | 'error'
type FaceMode = 'checking' | 'mediapipe' | 'manual'
type LightState = 'unknown' | 'dark' | 'bright' | 'ok'
type StepKey = 'kamera' | 'wajah' | 'cahaya' | 'kamera2' | 'aturan'

interface FaceBoxCss {
  left: number
  top: number
  width: number
  height: number
}

interface CameraSetupWizardProps {
  proctoringLevel: string
  examTitle?: string
  companionUrl: string
  sessionId?: number
  onComplete: () => void
}

/**
 * Pre-exam camera setup wizard (T2).
 *
 * Runs BEFORE the exam starts: camera permission, face position check
 * (MediaPipe BlazeFace via the shared mediapipeDetect singleton — the same
 * models the proctoring engine uses, never re-loaded), lighting check, dual
 * camera pairing, and the rules acknowledgement. Only when every step passes
 * and the student clicks "Mulai Ujian" does the parent page start the exam
 * timer and the ProctoringEdgeEngine.
 *
 * The wizard owns its own getUserMedia stream and stops every track before
 * handing control back, so the engine can re-request the camera cleanly
 * (permission is already granted at that point, so it resolves instantly).
 */
export default function CameraSetupWizard({
  proctoringLevel,
  examTitle,
  companionUrl,
  sessionId,
  onComplete,
}: CameraSetupWizardProps) {
  const isDual = proctoringLevel === 'dual_camera'
  const companionPaired = useProctoringStore((s) => s.companionPaired)

  const steps = useMemo<Array<{ key: StepKey; label: string; icon: typeof Camera }>>(() => {
    const base: Array<{ key: StepKey; label: string; icon: typeof Camera }> = [
      { key: 'kamera', label: 'Kamera', icon: Camera },
      { key: 'wajah', label: 'Posisi Wajah', icon: ScanFace },
      { key: 'cahaya', label: 'Pencahayaan', icon: Lightbulb },
    ]
    if (isDual) base.push({ key: 'kamera2', label: 'Kamera Kedua', icon: Smartphone })
    base.push({ key: 'aturan', label: 'Aturan', icon: ClipboardList })
    return base
  }, [isDual])

  const [stepIndex, setStepIndex] = useState(0)
  const currentStep = steps[stepIndex].key

  // ---------------------------------------------------------------
  // Camera stream (owned by the wizard, stopped before hand-off)
  // ---------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lumaCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [camState, setCamState] = useState<CamState>('idle')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCamState('unavailable')
      return
    }
    setCamState('requesting')
    try {
      // Same constraints the ProctoringEdgeEngine uses.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } },
        audio: false,
      })
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCamState('ready')
    } catch (err: any) {
      const name = err?.name || ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCamState('denied')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCamState('unavailable')
      } else {
        // e.g. NotReadableError (camera busy in another app) — retryable.
        setCamState('error')
      }
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  // ---------------------------------------------------------------
  // Step 2 — face position check (MediaPipe, manual fallback)
  // ---------------------------------------------------------------
  const [faceMode, setFaceMode] = useState<FaceMode>('checking')
  const [faceCount, setFaceCount] = useState(0)
  const [faceSingle, setFaceSingle] = useState(false)
  const [faceCentered, setFaceCentered] = useState(false)
  const [faceSizeOk, setFaceSizeOk] = useState(false)
  const [faceBoxCss, setFaceBoxCss] = useState<FaceBoxCss | null>(null)
  const [facePassed, setFacePassed] = useState(false)
  const [manualFaceConfirm, setManualFaceConfirm] = useState(false)
  const faceGoodStreakRef = useRef(0)

  // Resolve the detection mode when the face step is opened. If MediaPipe
  // cannot load on this device/browser we degrade HONESTLY to a manual
  // confirmation instead of pretending an automatic check ran — the exam's
  // proctoring engine keeps monitoring for real once the exam starts.
  useEffect(() => {
    if (currentStep !== 'wajah' || faceMode !== 'checking') return
    let cancelled = false
    ensureMediaPipeLoaded().then((ok) => {
      if (!cancelled) setFaceMode(ok ? 'mediapipe' : 'manual')
    })
    return () => {
      cancelled = true
    }
  }, [currentStep, faceMode])

  useEffect(() => {
    if (currentStep !== 'wajah' || faceMode !== 'mediapipe' || camState !== 'ready') return
    let cancelled = false
    let inFlight = false

    const interval = setInterval(async () => {
      if (inFlight || cancelled) return
      const video = videoRef.current
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return
      inFlight = true
      const result = await detectFaces(video, performance.now())
      inFlight = false
      if (cancelled || !result) return

      const frameW = video.videoWidth
      const frameH = video.videoHeight
      const faces = result.faces
      setFaceCount(faces.length)

      const single = faces.length === 1
      setFaceSingle(single)

      let centered = false
      let sizeOk = false
      let boxCss: FaceBoxCss | null = null

      if (single && faces[0].boundingBox) {
        const b = faces[0].boundingBox
        const centerX = (b.originX + b.width / 2) / frameW
        const centerY = (b.originY + b.height / 2) / frameH
        // Centered = face center stays within the middle 50% of the frame.
        centered = centerX >= 0.25 && centerX <= 0.75 && centerY >= 0.25 && centerY <= 0.75
        // Reasonable size = face width between 15% and 60% of frame width.
        const widthRatio = b.width / frameW
        sizeOk = widthRatio >= 0.15 && widthRatio <= 0.6

        // Map the pixel bbox onto the displayed (object-cover) video box.
        const elW = video.clientWidth
        const elH = video.clientHeight
        if (elW > 0 && elH > 0) {
          const scale = Math.max(elW / frameW, elH / frameH)
          const dispW = frameW * scale
          const dispH = frameH * scale
          const offX = (elW - dispW) / 2
          const offY = (elH - dispH) / 2
          boxCss = {
            left: offX + b.originX * scale,
            top: offY + b.originY * scale,
            width: b.width * scale,
            height: b.height * scale,
          }
        }
      }

      setFaceCentered(centered)
      setFaceSizeOk(sizeOk)
      setFaceBoxCss(boxCss)

      // Require ~1s of continuously good readings before latching the pass,
      // so a single lucky frame does not clear the step.
      if (single && centered && sizeOk) {
        faceGoodStreakRef.current += 1
        if (faceGoodStreakRef.current >= 3) setFacePassed(true)
      } else {
        faceGoodStreakRef.current = 0
      }
    }, 350)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [currentStep, faceMode, camState])

  const faceStepPassed = faceMode === 'manual' ? manualFaceConfirm : facePassed

  // ---------------------------------------------------------------
  // Step 3 — lighting check (downscaled average luma, same recipe as
  // the ProctoringEdgeEngine camera-covered check)
  // ---------------------------------------------------------------
  const [lightState, setLightState] = useState<LightState>('unknown')
  const [lightPassed, setLightPassed] = useState(false)
  const lightGoodStreakRef = useRef(0)

  useEffect(() => {
    if (camState !== 'ready') return
    const interval = setInterval(() => {
      const video = videoRef.current
      if (!video || video.readyState < 2 || !video.videoWidth) return
      if (!lumaCanvasRef.current) {
        lumaCanvasRef.current = document.createElement('canvas')
      }
      const canvas = lumaCanvasRef.current
      const width = 64
      const height = 48
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      try {
        ctx.drawImage(video, 0, 0, width, height)
        const data = ctx.getImageData(0, 0, width, height).data
        let total = 0
        const pixels = width * height
        for (let i = 0; i < data.length; i += 4) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        }
        const avgLuma = total / pixels
        const state: LightState = avgLuma < 45 ? 'dark' : avgLuma > 220 ? 'bright' : 'ok'
        setLightState(state)
        if (state === 'ok') {
          lightGoodStreakRef.current += 1
          if (lightGoodStreakRef.current >= 2) setLightPassed(true)
        } else {
          lightGoodStreakRef.current = 0
        }
      } catch {
        /* frame not readable yet — try again next tick */
      }
    }, 600)
    return () => clearInterval(interval)
  }, [camState])

  // ---------------------------------------------------------------
  // Step 5 — rules acknowledgement + pass bookkeeping
  // ---------------------------------------------------------------
  const [rulesChecked, setRulesChecked] = useState(false)
  const [copied, setCopied] = useState(false)

  const stepPassed: Record<StepKey, boolean> = {
    kamera: camState === 'ready',
    wajah: faceStepPassed,
    cahaya: lightPassed,
    kamera2: companionPaired,
    aturan: rulesChecked,
  }

  const allPassed = steps.every((s) => stepPassed[s.key])
  const canProceed = stepPassed[currentStep]

  function goNext() {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1)
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  function handleComplete() {
    // Stop the wizard stream first; the proctoring engine re-requests the
    // camera itself and gets it instantly because permission is granted.
    stopCamera()
    onComplete()
  }

  function copyCompanionUrl() {
    navigator.clipboard.writeText(companionUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const faceAllGood = faceSingle && faceCentered && faceSizeOk

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 font-sans">
      <div className="min-h-full flex flex-col items-center px-3 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center gap-3 mb-5">
          <ExamindLogo variant="symbol" theme="color" className="h-9 w-auto shrink-0" priority />
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
              Persiapan Ujian
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              {examTitle || 'Ujian EXAMIND'} — selesaikan pemeriksaan kamera sebelum mulai.
            </p>
          </div>
        </div>

        <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200/90 shadow-card p-4 sm:p-7 space-y-6">
          {/* Step indicator */}
          <ol className="flex items-start">
            {steps.map((step, idx) => {
              const done = idx < stepIndex || (stepPassed[step.key] && idx !== stepIndex)
              const active = idx === stepIndex
              const StepIcon = step.icon
              return (
                <li key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <span
                      className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                        stepPassed[steps[idx - 1].key] ? 'bg-[#150f23]' : 'bg-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done
                        ? 'bg-[#c2ef4e] border-[#c2ef4e] text-slate-900'
                        : active
                          ? 'bg-[#150f23] border-[#150f23] text-white'
                          : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {done ? (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <StepIcon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </span>
                  <span
                    className={`mt-1.5 text-[10px] sm:text-[11px] font-bold text-center leading-tight ${
                      active ? 'text-slate-900' : 'text-slate-400'
                    } ${idx !== stepIndex ? 'hidden sm:block' : ''}`}
                  >
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Live preview column (stream stays mounted across all steps) */}
            <div className="space-y-2.5">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] border border-slate-200 shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Face guide overlays (step 2 only) */}
                {currentStep === 'wajah' && camState === 'ready' && (
                  <>
                    <div
                      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46%] h-[68%] rounded-[50%] border-2 border-dashed transition-colors ${
                        faceMode === 'mediapipe' && faceAllGood
                          ? 'border-[#c2ef4e]'
                          : 'border-white/70'
                      }`}
                      aria-hidden="true"
                    />
                    {faceMode === 'mediapipe' && faceBoxCss && (
                      <div
                        className={`pointer-events-none absolute rounded-xl border-2 transition-all duration-200 ${
                          faceAllGood ? 'border-emerald-400' : 'border-amber-400'
                        }`}
                        style={{
                          left: faceBoxCss.left,
                          top: faceBoxCss.top,
                          width: faceBoxCss.width,
                          height: faceBoxCss.height,
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}

                {/* Camera placeholder / status overlay */}
                {camState !== 'ready' && (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-2.5 text-center p-6">
                    {camState === 'requesting' || camState === 'idle' ? (
                      <>
                        <Loader2 className="w-8 h-8 text-[#c2ef4e] animate-spin" aria-hidden="true" />
                        <p className="text-xs text-slate-300 font-medium">
                          Meminta izin kamera…
                        </p>
                      </>
                    ) : (
                      <>
                        <CameraOff className="w-8 h-8 text-rose-400" aria-hidden="true" />
                        <p className="text-xs text-slate-300 font-medium">
                          {camState === 'denied'
                            ? 'Izin kamera ditolak'
                            : camState === 'unavailable'
                              ? 'Kamera tidak ditemukan'
                              : 'Kamera belum bisa diakses'}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {camState === 'ready' && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-[#c2ef4e] font-mono font-bold text-[10px] flex items-center gap-1.5 border border-white/10 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] animate-pulse" />
                    Pratinjau
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                Pratinjau ini hanya tampil di perangkat Anda untuk pemeriksaan awal. Pengawasan
                berjalan setelah ujian dimulai.
              </p>
            </div>

            {/* Step content column */}
            <div className="space-y-4 min-h-[280px] flex flex-col">
              {currentStep === 'kamera' && (
                <div className="space-y-3.5 flex-1">
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Langkah 1 — Periksa Kamera
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ujian ini diawasi lewat kamera. Izinkan akses kamera saat browser meminta, lalu
                    pastikan wajah Anda terlihat di pratinjau.
                  </p>
                  {camState === 'ready' && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
                      <p className="text-xs leading-relaxed font-medium">
                        Kamera berhasil terhubung. Anda bisa melanjutkan ke pemeriksaan posisi
                        wajah.
                      </p>
                    </div>
                  )}
                  {camState === 'denied' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                        <div className="text-xs leading-relaxed">
                          <p className="font-bold">Izin kamera ditolak.</p>
                          <p className="mt-1">
                            Klik ikon kamera atau gembok di bilah alamat browser, ubah izin kamera
                            menjadi <strong>Izinkan</strong>, lalu klik tombol Coba Lagi di bawah.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs cursor-pointer font-display"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                        Coba Lagi
                      </button>
                    </div>
                  )}
                  {camState === 'unavailable' && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                      <CameraOff className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                      <p className="text-xs leading-relaxed">
                        Tidak ada kamera yang terdeteksi di perangkat ini. Periksa apakah webcam
                        sudah terpasang dan tidak sedang dipakai aplikasi lain, lalu muat ulang
                        halaman ini. Ujian dengan pengawasan membutuhkan kamera yang berfungsi.
                      </p>
                    </div>
                  )}
                  {camState === 'error' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                        <p className="text-xs leading-relaxed">
                          Kamera belum bisa diakses. Biasanya karena sedang dipakai aplikasi lain
                          (misalnya aplikasi meeting). Tutup aplikasi tersebut, lalu coba lagi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs cursor-pointer font-display"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#c2ef4e]" aria-hidden="true" />
                        Coba Lagi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'wajah' && (
                <div className="space-y-3.5 flex-1">
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Langkah 2 — Posisikan Wajah
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Duduk tegak dan hadapkan wajah ke kamera sampai ketiga tanda di bawah hijau.
                  </p>

                  {faceMode === 'checking' && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      Menyiapkan pemeriksaan wajah…
                    </p>
                  )}

                  {faceMode === 'mediapipe' && (
                    <>
                      <ul className="space-y-2">
                        {[
                          {
                            ok: faceSingle,
                            label:
                              faceCount > 1
                                ? 'Lebih dari satu wajah terdeteksi — pastikan hanya Anda di depan kamera'
                                : faceCount === 0
                                  ? 'Belum ada wajah terdeteksi — hadapkan wajah ke kamera'
                                  : 'Satu wajah terdeteksi',
                          },
                          { ok: faceCentered, label: 'Wajah berada di tengah bingkai' },
                          { ok: faceSizeOk, label: 'Jarak wajah pas — tidak terlalu dekat atau jauh' },
                        ].map((chip, chipIdx) => (
                          <li
                            key={chipIdx}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                              chip.ok
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                chip.ok ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {chip.ok ? (
                                <Check className="w-3 h-3" aria-hidden="true" />
                              ) : (
                                <X className="w-3 h-3" aria-hidden="true" />
                              )}
                            </span>
                            {chip.label}
                          </li>
                        ))}
                      </ul>
                      {facePassed && (
                        <p className="text-xs font-semibold text-emerald-700">
                          Posisi wajah sudah bagus. Pertahankan selama ujian berlangsung.
                        </p>
                      )}
                    </>
                  )}

                  {faceMode === 'manual' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                        <p className="text-xs leading-relaxed">
                          Pemeriksaan wajah otomatis tidak tersedia di perangkat ini, jadi kami
                          minta Anda memeriksa sendiri lewat pratinjau. Pengawasan otomatis tetap
                          berjalan normal selama ujian.
                        </p>
                      </div>
                      <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manualFaceConfirm}
                          onChange={(e) => setManualFaceConfirm(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#150f23] cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed font-medium">
                          Wajah saya terlihat jelas dan berada di tengah pratinjau kamera.
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'cahaya' && (
                <div className="space-y-3.5 flex-1">
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Langkah 3 — Cek Pencahayaan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Wajah yang terlihat jelas membantu pengawas dan sistem memeriksa ujian Anda
                    dengan benar.
                  </p>

                  <div
                    className={`flex items-start gap-3 p-4 rounded-2xl border ${
                      lightState === 'ok'
                        ? 'bg-emerald-50 border-emerald-200'
                        : lightState === 'dark'
                          ? 'bg-indigo-50 border-indigo-200'
                          : lightState === 'bright'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {lightState === 'dark' ? (
                      <Moon className="w-6 h-6 shrink-0 text-indigo-600" aria-hidden="true" />
                    ) : (
                      <Sun
                        className={`w-6 h-6 shrink-0 ${
                          lightState === 'ok'
                            ? 'text-emerald-600'
                            : lightState === 'bright'
                              ? 'text-amber-600'
                              : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="text-xs leading-relaxed">
                      {lightState === 'unknown' && (
                        <p className="text-slate-600 font-medium">Mengukur cahaya ruangan…</p>
                      )}
                      {lightState === 'dark' && (
                        <>
                          <p className="font-bold text-indigo-950">Ruangan terlalu gelap.</p>
                          <p className="text-indigo-900 mt-0.5">
                            Nyalakan lampu atau pindah ke tempat yang lebih terang sampai wajah
                            Anda terlihat jelas di pratinjau.
                          </p>
                        </>
                      )}
                      {lightState === 'bright' && (
                        <>
                          <p className="font-bold text-amber-950">Cahaya terlalu terang atau silau.</p>
                          <p className="text-amber-900 mt-0.5">
                            Hindari jendela atau lampu tepat di belakang Anda. Geser posisi duduk
                            sampai wajah terlihat jelas tanpa bayangan keras.
                          </p>
                        </>
                      )}
                      {lightState === 'ok' && (
                        <>
                          <p className="font-bold text-emerald-950">Pencahayaan cukup.</p>
                          <p className="text-emerald-900 mt-0.5">
                            Wajah Anda terlihat jelas. Usahakan cahaya ruangan tetap seperti ini
                            selama ujian.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'kamera2' && (
                <div className="space-y-3.5 flex-1">
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Langkah 4 — Hubungkan Kamera Kedua
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Pindai kode QR ini dengan HP Anda. Kamera HP menjadi kamera kedua yang
                    mengawasi meja dari samping.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner shrink-0 mx-auto sm:mx-0">
                      <QRCodeSVG value={companionUrl} size={150} level="M" />
                    </div>
                    <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed flex-1">
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                        <span className="text-slate-500">Status Kamera 2:</span>
                        <span
                          className={`font-bold flex items-center gap-1.5 ${
                            companionPaired ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              companionPaired ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          {companionPaired ? 'Terhubung' : 'Menunggu pindai…'}
                        </span>
                      </div>
                      <ul className="space-y-1.5 list-disc pl-4">
                        <li>Sandarkan HP di sisi kanan atau kiri meja, jangan dipegang.</li>
                        <li>Atur posisi sampai meja, kedua tangan, dan layar laptop terlihat.</li>
                        <li>Pastikan baterai HP cukup dan matikan mode hemat daya.</li>
                        <li>Sesi: <span className="font-mono font-bold">#{sessionId || '-'}</span></li>
                      </ul>
                      <button
                        type="button"
                        onClick={copyCompanionUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                            Tautan Disalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                            Salin Tautan Kamera 2
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {companionPaired && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
                      <p className="text-xs leading-relaxed font-medium">
                        Kamera kedua terhubung. Biarkan HP tetap di posisinya selama ujian.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'aturan' && (
                <div className="space-y-3.5 flex-1">
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Terakhir — Aturan Ujian
                  </h2>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Ban className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
                      <span>
                        <strong className="text-slate-900">Dilarang memakai HP untuk hal lain.</strong>{' '}
                        {isDual
                          ? 'HP hanya boleh menjadi kamera kedua.'
                          : 'Jauhkan HP dari meja selama ujian.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Eye className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
                      <span>
                        <strong className="text-slate-900">Tetap di depan kamera.</strong> Wajah
                        harus terlihat selama ujian berlangsung.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Users className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
                      <span>
                        <strong className="text-slate-900">Tidak ada orang lain</strong> di ruangan
                        atau yang ikut terlihat di kamera.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Maximize className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
                      <span>
                        <strong className="text-slate-900">Mode layar penuh wajib.</strong> Keluar
                        dari layar penuh, berpindah tab, atau membuka aplikasi lain akan dicatat
                        sebagai pelanggaran.
                      </span>
                    </li>
                  </ul>

                  <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rulesChecked}
                      onChange={(e) => setRulesChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#150f23] cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed font-medium">
                      Saya paham dan siap mengikuti aturan ujian di atas.
                    </span>
                  </label>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-2.5 pt-1">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs cursor-pointer font-display flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    Kembali
                  </button>
                )}
                {stepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#150f23] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-card transition-all cursor-pointer font-display flex items-center justify-center gap-2"
                  >
                    <span>Lanjut</span>
                    <Check className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={!allPassed}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#150f23] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-card transition-all cursor-pointer font-display flex items-center justify-center gap-2"
                  >
                    <Maximize className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                    <span>Mulai Ujian</span>
                  </button>
                )}
              </div>
              {currentStep !== 'aturan' && !canProceed && (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tombol Lanjut aktif setelah pemeriksaan di langkah ini selesai.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="w-full max-w-3xl text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
          Luangkan waktu secukupnya di tahap ini. Pengawasan baru berjalan setelah Anda menekan
          Mulai Ujian.
        </p>
      </div>
    </div>
  )
}
