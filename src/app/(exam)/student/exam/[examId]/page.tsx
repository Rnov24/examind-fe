'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Clock,
  Video,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Maximize,
  Bell,
  LayoutGrid,
  CameraOff,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useExamStore } from '@/stores/examStore'
import { useProctoringStore } from '@/stores/proctoringStore'
import { ProctoringEdgeEngine } from '@/utils/proctoringEdge'
import QuestionCard from '@/components/student/QuestionCard'
import CompanionQrModal from '@/components/student/CompanionQrModal'
import ExamSubmitModal from '@/components/student/ExamSubmitModal'
import SecurityWarningModal from '@/components/student/SecurityWarningModal'
import { ExamindLogo } from '@/components/brand/ExamindLogo'

export default function ExamWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const examId = Number(params?.examId)

  const authStore = useAuthStore()
  const examStore = useExamStore()
  const proctoringStore = useProctoringStore()

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const edgeEngineRef = useRef<ProctoringEdgeEngine | null>(null)

  const [doubtMap, setDoubtMap] = useState<Record<number, boolean>>({})
  const [essayInput, setEssayInput] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faceDetected, setFaceDetected] = useState(true)

  // Human-in-the-Loop Security State
  const [isExamStarted, setIsExamStarted] = useState(false)
  const isExamStartedRef = useRef(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const isSecurityModalOpenRef = useRef(false)
  const [securityInfractionDetails, setSecurityInfractionDetails] = useState('')
  const isSubmittingRef = useRef(false)

  // Proctoring Level config
  const proctoringLevel = examStore.examMeta?.proctoring_level || 'dual_camera'
  const isCameraProctoringEnabled = proctoringLevel !== 'disabled'
  const isDualCamera = proctoringLevel === 'dual_camera'

  const currentQuestion = examStore.getCurrentQuestion()

  const formattedTime = useMemo(() => {
    const total = examStore.timeRemainingSeconds
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [examStore.timeRemainingSeconds])

  const isTimerUrgent = examStore.timeRemainingSeconds <= 300

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return undefined
    return examStore.answersMap[currentQuestion.id]
  }, [currentQuestion, examStore.answersMap])

  const companionUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    return `${origin}/companion?session_id=${examStore.sessionId}&token=${examStore.pairingToken}`
  }, [examStore.sessionId, examStore.pairingToken])

  useEffect(() => {
    if (currentQuestion && currentQuestion.question_type !== 'multiple_choice') {
      setEssayInput(examStore.answersMap[currentQuestion.id] || '')
    } else {
      setEssayInput('')
    }
  }, [currentQuestion, examStore.answersMap])

  // Human-in-the-Loop Supervisor Adjudication Check
  useEffect(() => {
    if (proctoringStore.teacherDisqualified) {
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      router.push(`/student/exam/${examId}/result`)
    }
  }, [proctoringStore.teacherDisqualified, examId, router])

  // Timer auto-submit on zero
  useEffect(() => {
    if (isExamStarted && examStore.timeRemainingSeconds <= 0) {
      handleFinalSubmit()
    }
  }, [examStore.timeRemainingSeconds, isExamStarted])

  function toggleDoubt(qid: number) {
    setDoubtMap((prev) => ({ ...prev, [qid]: !prev[qid] }))
  }

  function handleSelectOption(optId: string) {
    if (!currentQuestion || isSecurityModalOpen) return
    examStore.setAnswer(currentQuestion.id, optId)
  }

  function handleEssayInputUpdate(val: string) {
    setEssayInput(val)
    if (!currentQuestion || isSecurityModalOpen) return
    examStore.setAnswer(currentQuestion.id, val)
  }

  function nextQuestion() {
    if (examStore.currentIndex < examStore.totalQuestions - 1) {
      examStore.setCurrentIndex(examStore.currentIndex + 1)
    }
  }

  function prevQuestion() {
    if (examStore.currentIndex > 0) {
      examStore.setCurrentIndex(examStore.currentIndex - 1)
    }
  }

  /* Fullscreen & Security Controllers */
  function triggerSecurityWarning(reason: string, details: string) {
    if (isSecurityModalOpenRef.current || isSubmittingRef.current) return

    setIsSecurityModalOpen(true)
    isSecurityModalOpenRef.current = true
    setSecurityInfractionDetails(details)

    // Capture snapshot if camera proctoring is enabled
    const snapshot = edgeEngineRef.current?.captureSnapshot()
    if (examStore.sessionId) {
      proctoringStore.logViolation(
        examStore.sessionId,
        reason,
        isCameraProctoringEnabled ? 'primary_camera' : 'browser_lock',
        'high',
        1,
        snapshot || undefined
      )
    }
  }

  function handleFullscreenChange() {
    if (!isExamStartedRef.current || isSubmittingRef.current || isSecurityModalOpenRef.current) return
    const isFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )
    if (!isFs) {
      triggerSecurityWarning('fullscreen_exit', 'Menutup mode layar penuh (Fullscreen keluar)')
    }
  }

  function handleVisibilityChange() {
    if (!isExamStartedRef.current || isSubmittingRef.current || isSecurityModalOpenRef.current) return
    if (document.hidden || document.visibilityState === 'hidden') {
      triggerSecurityWarning('tab_switch', 'Berpindah tab atau aplikasi lain')
    }
  }

  function handleWindowBlur() {
    if (!isExamStartedRef.current || isSubmittingRef.current || isSecurityModalOpenRef.current) return
    triggerSecurityWarning('tab_switch', 'Kehilangan fokus jendela ujian (Window blur)')
  }

  function attachSecurityListeners() {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
  }

  function removeSecurityListeners() {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('blur', handleWindowBlur)
  }

  async function enterFullscreenAndStart() {
    try {
      const el = document.documentElement as any
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else if (el.msRequestFullscreen) await el.msRequestFullscreen()
    } catch (err) {
      console.warn('Fullscreen request rejected:', err)
    }

    setIsExamStarted(true)
    isExamStartedRef.current = true
    setTimeout(() => {
      attachSecurityListeners()
    }, 400)
  }

  async function handleReEnterFullscreen() {
    try {
      const el = document.documentElement as any
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    } catch {}
    setIsSecurityModalOpen(false)
    isSecurityModalOpenRef.current = false
  }

  function handleExitExam() {
    removeSecurityListeners()
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    router.push('/student/dashboard')
  }

  async function handleFinalSubmit() {
    setIsSubmitting(true)
    isSubmittingRef.current = true
    try {
      await examStore.submitExam(examId)
      removeSecurityListeners()
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      router.push(`/student/exam/${examId}/result`)
    } catch (err) {
      alert('Gagal mengumpulkan lembar ujian. Coba lagi.')
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  useEffect(() => {
    async function initWorkspace() {
      if (!examId) return
      const examData = await examStore.loadExam(examId)
      examStore.startTimer()

      const pLevel = examData?.exam?.proctoring_level || examStore.examMeta?.proctoring_level || 'dual_camera'
      const pEnabled = pLevel !== 'disabled'

      // Only initialize Proctoring WS & Edge Camera if proctoring is active
      if (pEnabled) {
        if (examStore.sessionId) {
          proctoringStore.connectStudentWs(examStore.sessionId)
        }

        try {
          edgeEngineRef.current = new ProctoringEdgeEngine({
            onViolation: (eventType, severity, snapshot) => {
              if (eventType === 'face_absent' && isExamStartedRef.current) {
                triggerSecurityWarning('face_absent', 'Wajah tidak terdeteksi di kamera depan')
              }
            },
            onCameraReady: () => {
              proctoringStore.setPrimaryCamActive(true)
            },
            onStatusChange: (status) => {
              setFaceDetected(status.faceDetected)
              if (!status.faceDetected && isExamStartedRef.current) {
                triggerSecurityWarning('face_absent', 'Wajah tidak terdeteksi di kamera depan')
              }
            },
          })

          if (videoPreviewRef.current) {
            await edgeEngineRef.current.start(videoPreviewRef.current)
          } else {
            await edgeEngineRef.current.start()
          }
        } catch (err) {
          console.warn('Webcam permission denied or unavailable:', err)
        }
      }
    }

    initWorkspace()

    return () => {
      removeSecurityListeners()
      examStore.cleanup()
      proctoringStore.cleanup()
      if (edgeEngineRef.current) {
        edgeEngineRef.current.stop()
      }
      if (videoPreviewRef.current?.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [examId])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col select-none font-sans">
      {/* Top Bar (Full width, slim) */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Brand, Exam Title & Student Info */}
        <div className="flex items-center gap-3 min-w-0">
          <ExamindLogo variant="symbol" theme="color" className="h-9 w-auto shrink-0" priority />
          <div className="min-w-0">
            <h1 className="font-display text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
              {examStore.examMeta?.title || 'Ujian EXAMIND'}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {authStore.user?.full_name ? `Peserta: ${authStore.user.full_name}` : 'Peserta Ujian'}{' '}
              {authStore.user?.identifier ? `• ${authStore.user.identifier}` : ''}
            </p>
          </div>
        </div>

        {/* Center: Timer Pill, Progress, Sync & Proctoring Notice */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Urgent / Standard Timer Pill */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm tracking-wide shadow-xs tabular-nums ${
              isTimerUrgent
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-100/90 border-slate-200 text-slate-900'
            }`}
          >
            <Clock className={`w-4 h-4 shrink-0 ${isTimerUrgent ? 'text-rose-600' : 'text-slate-700'}`} aria-hidden="true" />
            <span>{formattedTime}</span>
          </div>

          {/* Progress: Terjawab X / N */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-xs tabular-nums">
            <span>Terjawab:</span>
            <span className="text-slate-900 font-extrabold">{examStore.answeredCount}</span>
            <span className="text-slate-400">/</span>
            <span>{examStore.totalQuestions}</span>
          </div>

          {/* Sync Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                examStore.syncStatus === 'synced'
                  ? 'bg-emerald-500 animate-pulse'
                  : examStore.syncStatus === 'saved_local' || examStore.syncStatus === 'syncing'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-600 font-mono text-[11px]">
              {examStore.syncStatus === 'synced'
                ? 'Tersinkron'
                : examStore.syncStatus === 'syncing'
                ? 'Menyinkron...'
                : examStore.syncStatus === 'saved_local'
                ? 'Tersimpan Lokal'
                : 'Offline'}
            </span>
          </div>

          {/* Proctoring Disabled Notification Badge */}
          {!isCameraProctoringEnabled && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600 shadow-xs">
              <CameraOff className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Proctoring kamera nonaktif untuk ujian ini</span>
            </div>
          )}
        </div>

        {/* Right: Camera Status (if enabled) & Submit Button */}
        <div className="flex items-center gap-2.5">
          {isCameraProctoringEnabled && (
            <div className="flex items-center gap-2 font-mono">
              {/* Primary Webcam Status Badge */}
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-xs ${
                  proctoringStore.primaryCamActive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
                title={proctoringStore.primaryCamActive ? 'Kamera 1 Aktif' : 'Kamera 1 Belum Aktif'}
              >
                <Video className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden xl:inline">Cam 1</span>
              </span>

              {/* Secondary Companion Status Button (Dual Camera only) */}
              {isDualCamera && (
                <button
                  onClick={() => setShowQrModal(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
                    proctoringStore.companionPaired
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                  title={proctoringStore.companionPaired ? 'Kamera 2 Terhubung' : 'Pindai QR Kamera 2'}
                >
                  <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden xl:inline">
                    {proctoringStore.companionPaired ? 'Cam 2: OK' : 'Scan Cam 2'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer font-display tracking-wide focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <CheckCircle2 className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Kumpulkan</span>
          </button>
        </div>
      </header>

      {/* Main Bento Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Tile (~2/3 on desktop): Current Question Exam Paper */}
          <main className="lg:col-span-8 flex flex-col w-full order-1">
            {currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                currentIndex={examStore.currentIndex}
                totalQuestions={examStore.totalQuestions}
                isDoubt={!!doubtMap[currentQuestion.id]}
                currentAnswer={currentAnswer}
                essayValue={essayInput}
                onSelectOption={handleSelectOption}
                onUpdateEssayValue={handleEssayInputUpdate}
                onToggleDoubt={() => toggleDoubt(currentQuestion.id)}
                onPrev={prevQuestion}
                onNext={nextQuestion}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center text-slate-500 font-mono shadow-card">
                Memuat butir soal ujian...
              </div>
            )}
          </main>

          {/* Side Column (~1/3 on desktop): Camera Tile (if enabled) + Navigator Tile */}
          <aside className="lg:col-span-4 flex flex-col gap-5 w-full order-2">
            {/* Camera Tile: Live Preview (Conditional based on proctoring_level) */}
            {isCameraProctoringEnabled && (
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-900 aspect-video relative shadow-card group">
                <video
                  ref={videoPreviewRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Top Overlay: LIVE & Face Detection Status */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <div className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black text-[10px] flex items-center gap-1.5 shadow-xs uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>LIVE</span>
                  </div>

                  <div
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border shadow-xs ${
                      faceDetected
                        ? 'bg-black/60 text-[#c2ef4e] border-white/10'
                        : 'bg-rose-900/80 text-rose-200 border-rose-500/30 animate-pulse'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${faceDetected ? 'bg-[#c2ef4e]' : 'bg-rose-400'}`}
                    />
                    <span>{faceDetected ? 'Wajah Terdeteksi' : 'Wajah Tidak Terdeteksi'}</span>
                  </div>
                </div>

                {/* Bottom Overlay: Device details & Companion Action */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                  <span className="text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                    Kamera 1 (0° Laptop)
                  </span>
                  {isDualCamera && (
                    <button
                      onClick={() => setShowQrModal(true)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md border shadow-xs ${
                        proctoringStore.companionPaired
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/30 hover:bg-amber-900/90'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" aria-hidden="true" />
                      <span>{proctoringStore.companionPaired ? 'Cam 2: Aktif' : 'Sambungkan Cam 2'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* "Daftar Soal" Navigator Tile */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-card flex flex-col space-y-5">
              {/* Navigator Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-slate-700" aria-hidden="true" />
                  <h3 className="font-display text-sm font-bold text-slate-900 tracking-tight">
                    Daftar Soal
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 tabular-nums bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                  {examStore.answeredCount} / {examStore.totalQuestions} Terjawab
                </span>
              </div>

              {/* Progress Track */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        examStore.totalQuestions > 0
                          ? (examStore.answeredCount / examStore.totalQuestions) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Number Grid: State Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {examStore.questions.map((q, idx) => {
                  const isCurrent = idx === examStore.currentIndex
                  const ans = examStore.answersMap[q.id]
                  const isAnswered = ans && ans.trim() !== ''
                  const isDoubt = Boolean(doubtMap[q.id])

                  let stateClasses = ''
                  if (isCurrent) {
                    stateClasses =
                      'ring-2 ring-[#c2ef4e] ring-offset-2 bg-slate-900 text-[#c2ef4e] font-black border-slate-900 shadow-md scale-105 z-10'
                  } else if (isDoubt) {
                    stateClasses =
                      'bg-amber-50 border-amber-300 text-amber-900 font-bold hover:bg-amber-100'
                  } else if (isAnswered) {
                    stateClasses =
                      'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100'
                  } else {
                    stateClasses =
                      'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium'
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => examStore.setCurrentIndex(idx)}
                      className={`h-11 rounded-xl text-xs transition-all relative flex items-center justify-center border cursor-pointer font-mono ${stateClasses}`}
                      title={`Soal ${idx + 1}: ${
                        isCurrent
                          ? 'Sedang Dikerjakan'
                          : isDoubt
                          ? 'Ragu-ragu'
                          : isAnswered
                          ? 'Sudah Terjawab'
                          : 'Belum Dijawab'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isDoubt && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-slate-900 ring-2 ring-[#c2ef4e] shrink-0" />
                  <span>Sedang Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-700 shrink-0 flex items-center justify-center font-bold text-[9px]">
                    OK
                  </span>
                  <span>Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-300 text-amber-700 shrink-0 flex items-center justify-center font-bold text-[9px]">
                    ?
                  </span>
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shrink-0" />
                  <span>Belum Dijawab</span>
                </div>
              </div>

              {/* Status Note */}
              <div className="pt-2 text-[11px] text-slate-400 text-center leading-relaxed font-mono border-t border-slate-50">
                Tersinkron otomatis setiap 30 detik • Autosave aktif
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Companion QR Modal (Dual Camera) */}
      <CompanionQrModal
        isOpen={showQrModal}
        companionUrl={companionUrl}
        sessionId={examStore.sessionId}
        isCompanionPaired={proctoringStore.companionPaired}
        onClose={() => setShowQrModal(false)}
      />

      {/* Submit Confirmation Modal */}
      <ExamSubmitModal
        isOpen={showSubmitModal}
        answeredCount={examStore.answeredCount}
        totalQuestions={examStore.totalQuestions}
        isSubmitting={isSubmitting}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleFinalSubmit}
      />

      {/* Human-in-the-Loop Security Infraction Warning Modal */}
      <SecurityWarningModal
        isOpen={isSecurityModalOpen}
        details={securityInfractionDetails}
        onReEnterFullscreen={handleReEnterFullscreen}
        onExitExam={handleExitExam}
      />

      {/* Supervisor Direct Intervention Modal (Human-in-the-Loop) */}
      {proctoringStore.warningModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border-2 border-amber-400 text-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-600 animate-bounce" aria-hidden="true" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                  Peringatan Langsung Pengawas
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {proctoringStore.warningTeacherName || 'Guru Pengawas'}
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
              &quot;{proctoringStore.warningMessage}&quot;
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Harap segera patuhi instruksi pengawas ujian di atas untuk menjaga integritas sesi ujian Anda.
            </p>

            <button
              onClick={() => proctoringStore.dismissWarning()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer font-display"
            >
              Saya Mengerti & Melanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* Initial Fullscreen Gate Modal (Mulai Ujian) */}
      {!isExamStarted && !isSecurityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-subtle-elevated relative overflow-hidden">
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-indigo-50/70 rounded-full blur-2xl" />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center mx-auto shadow-xs ring-4 ring-indigo-50/70">
              {isCameraProctoringEnabled ? (
                <ShieldAlert className="w-8 h-8 text-indigo-600" aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-indigo-600" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                Protokol Keamanan CBT EXAMIND
              </h2>
              <p className="text-xs text-slate-500">
                {isCameraProctoringEnabled
                  ? 'Ujian ini dipantau secara otomatis dengan AI Proctoring dan peninjauan pengawas.'
                  : 'Ujian ini menggunakan sistem penguncian layar penuh dan peninjauan pengawas.'}
              </p>
            </div>
            <div className="text-left bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <Maximize className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="text-slate-900 font-display">Layar Penuh (Fullscreen) Wajib:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    Ujian dikerjakan dalam mode layar penuh tanpa jendela aplikasi lain aktif.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="text-slate-900 font-display">Integritas Pengawasan:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    Perpindahan tab atau kehilangan fokus akan dicatat dan dilaporkan langsung ke pengawas.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={enterFullscreenAndStart}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide group"
            >
              <Maximize className="w-4 h-4 text-[#c2ef4e] group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span>Masuk Mode Layar Penuh & Mulai Ujian</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
