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
  Minimize2,
  Bell,
  LayoutGrid,
  CameraOff,
  ShieldCheck,
  Keyboard,
  X,
  Filter,
  Eye,
  Check,
  Save,
  HelpCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useExamStore } from '@/stores/examStore'
import api from '@/lib/api'
import { useProctoringStore } from '@/stores/proctoringStore'
import { ProctoringEdgeEngine } from '@/utils/proctoringEdge'
import QuestionCard from '@/components/student/QuestionCard'
import CompanionQrModal from '@/components/student/CompanionQrModal'
import CameraSetupWizard from '@/components/student/CameraSetupWizard'
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

  // UX Enhancements: Non-distracting camera, navigator filters, mobile drawer, keyboard guide
  const [isCameraMinimized, setIsCameraMinimized] = useState(false)
  const [navigatorFilter, setNavigatorFilter] = useState<'all' | 'unanswered' | 'doubt' | 'answered'>('all')
  const [showMobileNavigator, setShowMobileNavigator] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // Human-in-the-Loop Security State
  const [isExamStarted, setIsExamStarted] = useState(false)
  const isExamStartedRef = useRef(false)

  // Pre-exam setup phase: 'loading' while loadExam fetches, 'wizard' while the
  // student completes the camera setup (proctored exams only), then 'done'.
  const [setupPhase, setSetupPhase] = useState<'loading' | 'wizard' | 'done'>('loading')
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
    const total = Math.max(0, examStore.timeRemainingSeconds)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [examStore.timeRemainingSeconds])

  // Steady calm warning without erratic pulsing
  const isTimerUrgent = examStore.timeRemainingSeconds <= 300 && examStore.timeRemainingSeconds > 0

  const doubtCount = useMemo(() => {
    return Object.values(doubtMap).filter(Boolean).length
  }, [doubtMap])

  const unansweredCount = useMemo(() => {
    return Math.max(0, examStore.totalQuestions - examStore.answeredCount)
  }, [examStore.totalQuestions, examStore.answeredCount])

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
    if (isExamStarted && examStore.timeRemainingSeconds <= 0 && examStore.totalQuestions > 0) {
      handleFinalSubmit()
    }
  }, [examStore.timeRemainingSeconds, isExamStarted, examStore.totalQuestions])

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

  /* Keyboard Navigation Handler */
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (!isExamStartedRef.current) return

      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'INPUT' ||
        target?.isContentEditable

      // Don't intercept shortcuts when typing essays or inside text fields
      if (isInput) return

      if (
        isSecurityModalOpenRef.current ||
        showSubmitModal ||
        showQrModal ||
        showKeyboardShortcuts ||
        proctoringStore.warningModalOpen
      ) {
        if (e.key === 'Escape') {
          setShowKeyboardShortcuts(false)
          setShowMobileNavigator(false)
        }
        return
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShowKeyboardShortcuts((prev) => !prev)
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        nextQuestion()
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        prevQuestion()
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        if (currentQuestion) toggleDoubt(currentQuestion.id)
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        if (currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options_json) {
          const idx = parseInt(e.key, 10) - 1
          if (currentQuestion.options_json[idx]) {
            e.preventDefault()
            handleSelectOption(currentQuestion.options_json[idx].id)
          }
        }
      } else if (['a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'].includes(e.key)) {
        if (currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options_json) {
          const letter = e.key.toUpperCase()
          const match = currentQuestion.options_json.find(
            (opt) => opt.id.toUpperCase() === letter
          )
          if (match) {
            e.preventDefault()
            handleSelectOption(match.id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [
    currentQuestion,
    showSubmitModal,
    showQrModal,
    showKeyboardShortcuts,
    proctoringStore.warningModalOpen,
    examStore.currentIndex,
    examStore.totalQuestions,
  ])

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

  // Starts the edge proctoring engine (camera + detection loops). Deferred
  // until the setup wizard completes so the camera is never grabbed twice:
  // the wizard stops its own preview stream before this runs.
  async function startProctoringEngine() {
    try {
      edgeEngineRef.current = new ProctoringEdgeEngine({
        onViolation: (eventType) => {
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

  // Called by CameraSetupWizard's "Mulai Ujian" button. The wizard has
  // already stopped its preview stream; camera permission is granted, so the
  // engine's getUserMedia resolves instantly. Runs synchronously from the
  // click so the fullscreen request keeps its user-gesture context.
  async function handleSetupComplete() {
    // Start the server-side exam clock only now (after setup), so wizard
    // time never eats into the exam duration. Idempotent on the server.
    try {
      const res = await api.post(`/student/exam/${examId}/begin`)
      const remaining = res.data?.data?.duration_remaining_seconds
      if (typeof remaining === 'number') {
        useExamStore.setState({ timeRemainingSeconds: remaining })
      }
    } catch (err) {
      console.warn('Failed to mark exam begin; continuing with local timer:', err)
    }
    void startProctoringEngine()
    examStore.startTimer()
    examStore.startAutosaveLoop(examId)
    setSetupPhase('done')
    enterFullscreenAndStart()
  }

  useEffect(() => {
    async function initWorkspace() {
      if (!examId) return
      const examData = await examStore.loadExam(examId)

      const pLevel =
        examData?.exam?.proctoring_level || examStore.examMeta?.proctoring_level || 'dual_camera'
      const pEnabled = pLevel !== 'disabled'

      if (pEnabled) {
        // The student WebSocket connects now (not deferred): companion
        // pairing for dual-camera is signalled over this socket, and the
        // wizard's "Kamera Kedua" step watches proctoringStore.companionPaired.
        if (examStore.sessionId) {
          proctoringStore.connectStudentWs(examStore.sessionId)
        }

        if (examData?.begun_at) {
          // Mid-exam resume (e.g. browser crash): the student already
          // finished setup once — go straight back into the exam.
          void startProctoringEngine()
          examStore.startTimer()
          examStore.startAutosaveLoop(examId)
          setSetupPhase('done')
          return
        }

        // loadExam() auto-starts the countdown + autosave inside the store.
        // Pause both while the student is in the setup wizard — the exam
        // (timer, autosave, edge camera engine) only begins at "Mulai Ujian".
        examStore.cleanup()
        setSetupPhase('wizard')
      } else {
        // No wizard for unproctored exams: the clock starts now, as before.
        // /begin is idempotent, so a resume keeps the original start.
        try {
          const res = await api.post(`/student/exam/${examId}/begin`)
          const remaining = res.data?.data?.duration_remaining_seconds
          if (typeof remaining === 'number') {
            useExamStore.setState({ timeRemainingSeconds: remaining })
          }
        } catch (err) {
          console.warn('Failed to mark exam begin; continuing with local timer:', err)
        }
        examStore.startTimer()
        setSetupPhase('done')
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

  // Question Navigator Button Classes Helper
  function getQuestionBtnClasses(
    isCurrent: boolean,
    isAnswered: boolean,
    isDoubt: boolean
  ) {
    let classes =
      'relative h-11 rounded-xl text-xs font-mono transition-all duration-150 flex items-center justify-center border cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#150f23] active:scale-95 '

    if (isCurrent) {
      classes += 'ring-2 ring-[#150f23] ring-offset-2 scale-105 z-10 shadow-md font-black '
    }

    if (isDoubt && isAnswered) {
      classes += 'bg-amber-50 border-amber-400 text-amber-950 font-bold hover:bg-amber-100 '
    } else if (isDoubt) {
      classes += 'bg-amber-50/60 border-dashed border-amber-400 text-amber-900 font-bold hover:bg-amber-100 '
    } else if (isAnswered) {
      classes += 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold hover:bg-emerald-100 '
    } else {
      classes += 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium '
    }

    return classes
  }

  // Filter questions for the navigator
  const visibleQuestions = useMemo(() => {
    return examStore.questions.map((q, idx) => {
      const ans = examStore.answersMap[q.id]
      const isAnswered = Boolean(ans && ans.trim() !== '')
      const isDoubt = Boolean(doubtMap[q.id])
      const isCurrent = idx === examStore.currentIndex

      let isVisible = true
      if (navigatorFilter === 'unanswered') isVisible = !isAnswered
      else if (navigatorFilter === 'doubt') isVisible = isDoubt
      else if (navigatorFilter === 'answered') isVisible = isAnswered

      return {
        q,
        idx,
        isAnswered,
        isDoubt,
        isCurrent,
        isVisible,
      }
    })
  }, [examStore.questions, examStore.answersMap, examStore.currentIndex, doubtMap, navigatorFilter])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col select-none font-sans pb-16 lg:pb-0">
      {/* Top Bar (Full width, slim, daylight fintech aesthetic) */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Brand, Exam Title & Student Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <ExamindLogo variant="symbol" theme="color" className="h-8 sm:h-9 w-auto shrink-0" priority />
          <div className="min-w-0">
            <h1 className="font-display text-xs sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
              {examStore.examMeta?.title || 'Ujian EXAMIND'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
              {authStore.user?.full_name ? authStore.user.full_name : 'Peserta Ujian'}
              {authStore.user?.identifier ? ` • ${authStore.user.identifier}` : ''}
            </p>
          </div>
        </div>

        {/* Center: Calm Timer Pill, Progress, Sync & Proctoring Notice */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Steady Calm Timer Pill */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm tracking-wide shadow-xs tabular-nums transition-colors ${
              isTimerUrgent
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-slate-100/90 border-slate-200 text-slate-900'
            }`}
            title={isTimerUrgent ? 'Sisa waktu pengerjaan kurang dari 5 menit' : 'Sisa waktu pengerjaan'}
          >
            <Clock
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                isTimerUrgent ? 'text-rose-600' : 'text-slate-700'
              }`}
              aria-hidden="true"
            />
            <span>{formattedTime}</span>
            {isTimerUrgent && (
              <span className="hidden md:inline-block text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                Sisa 5m
              </span>
            )}
          </div>

          {/* Progress: Terjawab X / N */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-xs tabular-nums">
            <span>Terjawab:</span>
            <span className="text-slate-900 font-extrabold">{examStore.answeredCount}</span>
            <span className="text-slate-400">/</span>
            <span>{examStore.totalQuestions}</span>
          </div>

          {/* Sync Indicator (Visible on mobile as dot, expanded on desktop) */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 shadow-xs"
            title={`Status sinkronisasi: ${
              examStore.syncStatus === 'synced'
                ? 'Semua jawaban tersinkron ke server & memori lokal'
                : examStore.syncStatus === 'offline'
                ? 'Mode offline: Jawaban aman tersimpan di perangkat'
                : 'Sedang menyinkronkan jawaban...'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                examStore.syncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : examStore.syncStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-slate-600 font-mono text-[11px] hidden md:inline">
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
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600 shadow-xs">
              <CameraOff className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Mode Mandiri (CBT Reguler)</span>
            </div>
          )}
        </div>

        {/* Right: Keyboard Help, Camera Status & Submit Button */}
        <div className="flex items-center gap-2">
          {/* Keyboard shortcuts trigger */}
          <button
            type="button"
            onClick={() => setShowKeyboardShortcuts(true)}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-mono font-medium shadow-xs cursor-pointer transition-colors"
            title="Buka panduan pintasan keyboard (Tekan ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Pintasan</span>
            <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded border border-slate-200">
              ?
            </kbd>
          </button>

          {isCameraProctoringEnabled && (
            <div className="hidden sm:flex items-center gap-1.5 font-mono">
              {/* Primary Webcam Status Badge */}
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-xs ${
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
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
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
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer font-display tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5fc1]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
            <span>Kumpulkan</span>
          </button>
        </div>
      </header>

      {/* Main Bento Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20 lg:pb-6 flex flex-col justify-between">
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
                syncStatus={examStore.syncStatus}
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
            {/* Camera Tile: Live Preview or Minimized Comfort Mode */}
            {isCameraProctoringEnabled ? (
              isCameraMinimized ? (
                /* Minimized Comfort Card (Video stream stays alive in PiP) */
                <div className="rounded-2xl border border-slate-200/90 bg-[#150f23] text-white p-3.5 shadow-card flex items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Small corner video stream keepalive */}
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                      <video
                        ref={videoPreviewRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-black" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          AI Live
                        </span>
                        <span className="text-xs font-bold text-white truncate font-display">
                          Kamera 1 Aktif
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-300 truncate mt-0.5">
                        {faceDetected ? 'Wajah Terdeteksi Normal' : 'Wajah Tidak Terdeteksi!'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCameraMinimized(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 border border-white/10"
                    title="Perbesar Pratinjau Video"
                    aria-label="Perbesar Pratinjau Video"
                  >
                    <Maximize className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                /* Expanded Video Tile */
                <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-900 aspect-video relative shadow-card group transition-all">
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
                          : 'bg-rose-900/80 text-rose-200 border-rose-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          faceDetected ? 'bg-[#c2ef4e]' : 'bg-rose-400 animate-pulse'
                        }`}
                      />
                      <span>{faceDetected ? 'Wajah Terdeteksi' : 'Wajah Tidak Terdeteksi'}</span>
                    </div>
                  </div>

                  {/* Bottom Overlay: Device details, Comfort Minimize, Companion Action */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                    <span className="text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                      Kamera 1 (0° Laptop)
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isDualCamera && (
                        <button
                          type="button"
                          onClick={() => setShowQrModal(true)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md border shadow-xs ${
                            proctoringStore.companionPaired
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/30 hover:bg-amber-900/90'
                          }`}
                        >
                          <Smartphone className="w-3 h-3" aria-hidden="true" />
                          <span>{proctoringStore.companionPaired ? 'Cam 2: OK' : 'Scan Cam 2'}</span>
                        </button>
                      )}

                      {/* Comfort Mode: Minimize Video Button */}
                      <button
                        type="button"
                        onClick={() => setIsCameraMinimized(true)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-slate-200 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Kecilkan pratinjau video agar tidak mengalihkan perhatian"
                      >
                        <Minimize2 className="w-3 h-3 text-slate-300" aria-hidden="true" />
                        <span className="hidden sm:inline">Kecilkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Proctoring Disabled Graceful Banner */
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-slate-700" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-display">Mode Ujian Mandiri</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Kamera pengawas nonaktif untuk sesi ini. Integritas layar penuh tetap diawasi.
                  </p>
                </div>
              </div>
            )}

            {/* "Daftar Soal" Navigator Tile */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-card flex flex-col space-y-4">
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

              {/* Filter Tabs for Easy Triage */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setNavigatorFilter('all')}
                  className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    navigatorFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({examStore.totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setNavigatorFilter('unanswered')}
                  className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    navigatorFilter === 'unanswered'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum ({unansweredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNavigatorFilter('doubt')}
                  className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    navigatorFilter === 'doubt'
                      ? 'bg-white text-amber-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ragu ({doubtCount})
                </button>
              </div>

              {/* Number Grid: State Buttons */}
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-0.5">
                {visibleQuestions.map(({ q, idx, isAnswered, isDoubt, isCurrent, isVisible }) => {
                  if (!isVisible) return null

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => examStore.setCurrentIndex(idx)}
                      className={getQuestionBtnClasses(isCurrent, isAnswered, isDoubt)}
                      title={`Soal ${idx + 1}: ${
                        isDoubt && isAnswered
                          ? 'Ragu-ragu (Sudah Terjawab)'
                          : isDoubt
                          ? 'Ragu-ragu (Belum Terjawab)'
                          : isAnswered
                          ? 'Sudah Terjawab'
                          : 'Belum Dijawab'
                      }${isCurrent ? ' • Sedang Aktif' : ''}`}
                      aria-label={`Soal ${idx + 1}: ${
                        isDoubt && isAnswered
                          ? 'Ragu-ragu tapi sudah terjawab'
                          : isDoubt
                          ? 'Ragu-ragu dan belum dijawab'
                          : isAnswered
                          ? 'Sudah terjawab'
                          : 'Belum dijawab'
                      }`}
                    >
                      <span>{idx + 1}</span>

                      {/* Flag marker for doubt */}
                      {isDoubt && (
                        <span
                          className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white"
                          aria-hidden="true"
                        />
                      )}

                      {/* Verified dot if doubt + answered */}
                      {isDoubt && isAnswered && (
                        <span
                          className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"
                          aria-hidden="true"
                        />
                      )}

                      {/* Current Active Indicator Pip */}
                      {isCurrent && (
                        <span
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[#150f23]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Comprehensive Legend: Unmistakable 4 states */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 shrink-0 flex items-center justify-center font-bold text-[9px]">
                    ✓
                  </span>
                  <span>Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-400 text-amber-800 shrink-0 relative flex items-center justify-center font-bold text-[9px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -left-0.5" />
                    ?
                  </span>
                  <span>Ragu (Terjawab)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-50/60 border border-dashed border-amber-400 text-amber-800 shrink-0 relative flex items-center justify-center font-bold text-[9px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                    ?
                  </span>
                  <span>Ragu (Kosong)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shrink-0" />
                  <span>Belum Dijawab</span>
                </div>
              </div>

              {/* Status Note */}
              <div className="pt-2 text-[11px] text-slate-500 text-center leading-relaxed font-mono border-t border-slate-50">
                Tersinkron otomatis setiap 30 detik • Autosave aktif
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Dock (<lg) */}
      <nav
        aria-label="Navigasi Ujian Seluler"
        className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 flex items-center justify-between gap-2 shadow-elevated"
      >
        <button
          type="button"
          onClick={prevQuestion}
          disabled={examStore.currentIndex === 0}
          className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 font-mono transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMobileNavigator(true)}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-900 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
          <span>Soal {examStore.currentIndex + 1} / {examStore.totalQuestions}</span>
        </button>

        <button
          type="button"
          onClick={nextQuestion}
          disabled={examStore.currentIndex === examStore.totalQuestions - 1}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#150f23] hover:bg-slate-800 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center gap-1 font-mono transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4 text-[#c2ef4e]" aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile Navigator Drawer / Bottom Sheet */}
      {showMobileNavigator && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileNavigator(false)
          }}
          className="fixed inset-0 bg-slate-950/60 z-50 flex flex-col justify-end lg:hidden animate-in fade-in duration-150 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-navigator-title"
        >
          <div className="bg-white rounded-t-3xl border-t border-slate-200/90 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-slate-700" aria-hidden="true" />
                <h3 id="mobile-navigator-title" className="font-display text-sm font-bold text-slate-900">
                  Daftar Soal Ujian
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 tabular-nums bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {examStore.answeredCount} / {examStore.totalQuestions}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMobileNavigator(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Tutup daftar soal"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Filter Tabs on Mobile */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setNavigatorFilter('all')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
                  navigatorFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Semua ({examStore.totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setNavigatorFilter('unanswered')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
                  navigatorFilter === 'unanswered'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Belum ({unansweredCount})
              </button>
              <button
                type="button"
                onClick={() => setNavigatorFilter('doubt')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
                  navigatorFilter === 'doubt'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Ragu ({doubtCount})
              </button>
            </div>

            {/* Mobile Number Grid */}
            <div className="grid grid-cols-5 gap-2.5 py-1">
              {visibleQuestions.map(({ q, idx, isAnswered, isDoubt, isCurrent, isVisible }) => {
                if (!isVisible) return null

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      examStore.setCurrentIndex(idx)
                      setShowMobileNavigator(false)
                    }}
                    className={getQuestionBtnClasses(isCurrent, isAnswered, isDoubt)}
                  >
                    <span>{idx + 1}</span>
                    {isDoubt && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
                    )}
                    {isDoubt && isAnswered && (
                      <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    )}
                    {isCurrent && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[#150f23]" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend on Mobile */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-[9px]">
                  ✓
                </span>
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-400 text-amber-800 relative flex items-center justify-center font-bold text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -left-0.5" />
                  ?
                </span>
                <span>Ragu (Terjawab)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-50/60 border border-dashed border-amber-400 text-amber-800 relative flex items-center justify-center font-bold text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                  ?
                </span>
                <span>Ragu (Kosong)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300" />
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Helper Modal */}
      {showKeyboardShortcuts && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowKeyboardShortcuts(false)
          }}
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Keyboard className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="shortcuts-title" className="text-sm font-bold text-slate-900 font-display">
                    Pintasan Keyboard
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Untuk efisiensi pengerjaan ujian</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Tutup panduan pintasan"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Pilih Opsi Jawaban</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  A – E / 1 – 5
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Soal Berikutnya</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  → atau N
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Soal Sebelumnya</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  ← atau P
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Tandai Ragu-ragu</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  R atau F
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Tutup Dialog / Modal</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  Esc
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Catatan: Pintasan otomatis dinonaktifkan saat Anda sedang mengetik di dalam lembar jawaban esai.
            </p>

            <button
              type="button"
              onClick={() => setShowKeyboardShortcuts(false)}
              className="w-full py-2.5 rounded-xl bg-[#150f23] text-white font-bold text-xs transition-colors cursor-pointer font-display"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Companion QR Modal (Dual Camera) */}
      <CompanionQrModal
        isOpen={showQrModal}
        companionUrl={companionUrl}
        sessionId={examStore.sessionId || undefined}
        isCompanionPaired={proctoringStore.companionPaired}
        onClose={() => setShowQrModal(false)}
      />

      {/* Submit Confirmation Modal with Doubt & Stats Breakdown */}
      <ExamSubmitModal
        isOpen={showSubmitModal}
        answeredCount={examStore.answeredCount}
        totalQuestions={examStore.totalQuestions}
        doubtCount={doubtCount}
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
              type="button"
              onClick={() => proctoringStore.dismissWarning()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer font-display"
            >
              Saya Mengerti & Melanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* Pre-Exam Loading Overlay (exam data still fetching) */}
      {setupPhase === 'loading' && (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center gap-3 p-4">
          <ExamindLogo variant="symbol" theme="color" className="h-12 w-auto" priority />
          <p className="text-sm font-semibold text-slate-700 font-display">Menyiapkan ujian…</p>
          <p className="text-xs text-slate-400">Memuat soal dan memeriksa sesi Anda.</p>
        </div>
      )}

      {/* Pre-Exam Camera Setup Wizard (proctored exams only) */}
      {setupPhase === 'wizard' && (
        <CameraSetupWizard
          proctoringLevel={proctoringLevel}
          examTitle={examStore.examMeta?.title}
          companionUrl={companionUrl}
          sessionId={examStore.sessionId || undefined}
          onComplete={handleSetupComplete}
        />
      )}

      {/* Initial Fullscreen Gate Modal (Mulai Ujian) */}
      {!isExamStarted && !isSecurityModalOpen && setupPhase === 'done' && (
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
              type="button"
              onClick={enterFullscreenAndStart}
              className="w-full py-3.5 px-6 rounded-xl bg-[#150f23] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide group"
            >
              <Maximize
                className="w-4 h-4 text-[#c2ef4e] group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <span>Masuk Mode Layar Penuh & Mulai Ujian</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
