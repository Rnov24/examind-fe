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
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useExamStore } from '@/stores/examStore'
import { useProctoringStore } from '@/stores/proctoringStore'
import { ProctoringEdgeEngine } from '@/utils/proctoringEdge'
import QuestionCard from '@/components/student/QuestionCard'
import CompanionQrModal from '@/components/student/CompanionQrModal'
import ExamSubmitModal from '@/components/student/ExamSubmitModal'
import SecurityWarningModal from '@/components/student/SecurityWarningModal'

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

  // Human-in-the-Loop Security State
  const [isExamStarted, setIsExamStarted] = useState(false)
  const isExamStartedRef = useRef(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const isSecurityModalOpenRef = useRef(false)
  const [securityInfractionDetails, setSecurityInfractionDetails] = useState('')
  const isSubmittingRef = useRef(false)

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

  function getMatrixButtonClass(qid: number, idx: number): string {
    const isCurrent = idx === examStore.currentIndex
    const ans = examStore.answersMap[qid]
    const isAnswered = ans && ans.trim() !== ''
    const isDoubt = doubtMap[qid]

    if (isCurrent) {
      return 'ring-2 ring-slate-900 bg-slate-900 text-[#c2ef4e] font-mono font-black border-slate-900 shadow-card scale-105 z-10'
    }
    if (isDoubt) {
      return 'bg-amber-50 border-amber-300 text-amber-900 font-mono font-bold hover:bg-amber-100'
    }
    if (isAnswered) {
      return 'bg-emerald-50 text-emerald-800 font-mono font-bold border-emerald-300 hover:bg-emerald-100'
    }
    return 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-mono'
  }

  /* Fullscreen & Security Controllers */
  function triggerSecurityWarning(reason: string, details: string) {
    if (isSecurityModalOpenRef.current || isSubmittingRef.current) return

    setIsSecurityModalOpen(true)
    isSecurityModalOpenRef.current = true
    setSecurityInfractionDetails(details)

    // Capture snapshot and log proctoring event
    const snapshot = edgeEngineRef.current?.captureSnapshot()
    if (examStore.sessionId) {
      proctoringStore.logViolation(
        examStore.sessionId,
        reason,
        'primary_camera',
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
      await examStore.loadExam(examId)
      examStore.startTimer()

      // Connect Proctoring WS
      if (examStore.sessionId) {
        proctoringStore.connectStudentWs(examStore.sessionId)
      }

      // Initialize Edge Proctoring Camera
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
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm shadow-card group hover:bg-[#c2ef4e] hover:text-slate-950 transition-colors">
            EX
          </div>
          <div>
            <h1 className="font-display text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              {examStore.examMeta?.title || 'Ujian EXAMIND'}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              Peserta: {authStore.user?.full_name} • {authStore.user?.identifier}
            </p>
          </div>
        </div>

        {/* Center: Timer & Sync Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm tracking-wide shadow-xs tabular-nums ${
              isTimerUrgent
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-100/80 border-slate-200 text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-700 shrink-0" />
            <span>{formattedTime}</span>
          </div>

          {/* Sync Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 shadow-xs">
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
        </div>

        {/* Right: Proctoring Camera Status & Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 font-mono">
            {/* Primary Webcam Status */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-xs ${
                proctoringStore.primaryCamActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cam 1</span>
            </span>

            {/* Secondary Companion Status */}
            {examStore.examMeta?.proctoring_level === 'dual_camera' && (
              <button
                onClick={() => setShowQrModal(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
                  proctoringStore.companionPaired
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {proctoringStore.companionPaired ? 'Cam 2: OK' : 'Scan Cam 2'}
                </span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-1.5 cursor-pointer font-display tracking-wide"
          >
            <CheckCircle2 className="w-4 h-4 text-[#c2ef4e]" />
            <span>Kumpulkan</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Area: Active Question Viewer */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
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
            <div className="text-center py-20 text-slate-500">Memuat butir soal ujian...</div>
          )}
        </main>

        {/* Right Area: Matrix Navigator & Webcam Monitor Box */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200/80 bg-white p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            {/* Mini Cam Preview Box */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 aspect-video relative shadow-card">
              <video ref={videoPreviewRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] text-[#c2ef4e] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] animate-pulse" />
                <span>Edge AI Active</span>
              </div>
            </div>

            {/* Question Matrix Navigator */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Kisi-Kisi Soal
                </h3>
                <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                  {examStore.answeredCount} / {examStore.totalQuestions} Terjawab
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {examStore.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => examStore.setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all relative flex items-center justify-center border cursor-pointer font-mono ${getMatrixButtonClass(
                      q.id,
                      idx
                    )}`}
                  >
                    <span>{idx + 1}</span>
                    {doubtMap[q.id] && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600 font-semibold font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                <span>Kosong</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Data tersinkron otomatis setiap 30 detik ke server EXAMIND.
            </p>
          </div>
        </aside>
      </div>

      {/* Modular Modals */}
      <CompanionQrModal
        isOpen={showQrModal}
        companionUrl={companionUrl}
        sessionId={examStore.sessionId}
        isCompanionPaired={proctoringStore.companionPaired}
        onClose={() => setShowQrModal(false)}
      />

      <ExamSubmitModal
        isOpen={showSubmitModal}
        answeredCount={examStore.answeredCount}
        totalQuestions={examStore.totalQuestions}
        isSubmitting={isSubmitting}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleFinalSubmit}
      />

      {/* Human-in-the-Loop Security Warning Modal */}
      <SecurityWarningModal
        isOpen={isSecurityModalOpen}
        details={securityInfractionDetails}
        onReEnterFullscreen={handleReEnterFullscreen}
        onExitExam={handleExitExam}
      />

      {/* Direct Supervisor Warning Alert Modal (Human-in-the-Loop) */}
      {proctoringStore.warningModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border-2 border-amber-400 text-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-600 animate-bounce" />
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

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
              &quot;{proctoringStore.warningMessage}&quot;
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Harap segera patuhi instruksi pengawas ujian di atas untuk menjaga integritas sesi ujian Anda.
            </p>

            <button
              onClick={() => proctoringStore.dismissWarning()}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Saya Mengerti & Melanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* Initial Fullscreen Gate Modal */}
      {!isExamStarted && !isSecurityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-subtle-elevated relative overflow-hidden">
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-indigo-50/70 rounded-full blur-2xl" />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center mx-auto shadow-xs ring-4 ring-indigo-50/70">
              <ShieldAlert className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                Protokol Keamanan CBT EXAMIND
              </h2>
              <p className="text-xs text-slate-500">
                Ujian ini dipantau secara otomatis dengan AI Proctoring dan peninjauan pengawas.
              </p>
            </div>
            <div className="text-left bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <Maximize className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-display">Layar Penuh (Fullscreen) Wajib:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    Ujian dikerjakan dalam mode layar penuh tanpa jendela aplikasi lain aktif.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
              <Maximize className="w-4 h-4 text-[#c2ef4e] group-hover:scale-110 transition-transform" />
              <span>Masuk Mode Layar Penuh & Mulai Ujian</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
