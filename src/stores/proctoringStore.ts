import { create } from 'zustand'
import api from '@/lib/api'
import { withWsToken, wsBaseUrl } from '@/lib/ws'

export interface ProctoringAlert {
  id: string
  session_id: number
  student_name: string
  event_type: string
  camera_source: string
  severity: 'low' | 'medium' | 'high'
  duration_seconds: number
  timestamp: string
  snapshot_url?: string
  current_integrity_score: number
}

interface ProctoringState {
  primaryCamActive: boolean
  companionPaired: boolean
  studentWsState: StudentWsState
  currentIntegrityScore: number
  alerts: ProctoringAlert[]
  warningModalOpen: boolean
  warningMessage: string
  warningTeacherName: string
  teacherDisqualified: boolean
  disqualificationInfo: any | null

  setPrimaryCamActive: (active: boolean) => void
  setCompanionPaired: (paired: boolean) => void
  reconnectStudentWs: () => void
  logViolation: (
    sessionId: number,
    eventType: string,
    cameraSource: string,
    severity?: 'low' | 'medium' | 'high',
    durationSeconds?: number,
    snapshotBase64?: string
  ) => Promise<void>
  initStudentWebSocket: (sessionId: number) => void
  connectStudentWs: (sessionId: number) => void
  closeStudentWebSocket: () => void
  cleanup: () => void
  dismissWarning: () => void
}

let studentWs: WebSocket | null = null
// Unbounded reconnect for the student alerts socket: without it, one failed
// handshake (or a dropped connection — Modal cold start, edge 524,
// ECONNRESET, all observed in the wild) strands the wizard's "Kamera Kedua"
// step on "Menunggu pindai…" forever, even though the phone already shows
// "Terhubung". The phone retries forever; the desktop must too, for as long
// as the exam page is alive. Intentional closes (cleanup / exam end) never
// reconnect. Backoff starts at 2s and is capped at 5s. The hub is in-memory
// per container, so a live broadcast from the companion's container may
// never reach this socket — the DB-backed replay in ws_student_alerts plus
// the REST pairing-status poll cover that gap.
let studentWsIntentionalClose = false
let studentWsReconnectTimer: ReturnType<typeof setTimeout> | null = null
let studentWsReconnectAttempts = 0
let studentWsSessionId: number | null = null
let studentWsEverOpened = false
const STUDENT_WS_RECONNECT_BASE_DELAY_MS = 2000
const STUDENT_WS_RECONNECT_MAX_DELAY_MS = 5000

export type StudentWsState = 'connecting' | 'connected' | 'reconnecting' | 'failed'
// 'failed' is a vocabulary placeholder for a terminal failure: with the
// unbounded retry above there is no terminal state, so it is never assigned
// today. 'connecting' is before the first open; 'reconnecting' is a retry
// after a socket that had opened once dropped.

export const useProctoringStore = create<ProctoringState>((set, get) => ({
  primaryCamActive: false,
  companionPaired: false,
  studentWsState: 'connecting',
  currentIntegrityScore: 100,
  alerts: [],
  warningModalOpen: false,
  warningMessage: '',
  warningTeacherName: '',
  teacherDisqualified: false,
  disqualificationInfo: null,

  setPrimaryCamActive: (active: boolean) => set({ primaryCamActive: active }),
  setCompanionPaired: (paired: boolean) => set({ companionPaired: paired }),

  logViolation: async (
    sessionId: number,
    eventType: string,
    cameraSource: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    durationSeconds: number = 1,
    snapshotBase64?: string
  ) => {
    try {
      await api.post('/proctoring/log-event', {
        session_id: sessionId,
        event_type: eventType,
        camera_source: cameraSource,
        severity,
        duration_seconds: durationSeconds,
        snapshot_base64: snapshotBase64 || null,
      })
    } catch (err) {
      console.warn('[ProctoringStore] Failed to log violation:', err)
    }
  },

  initStudentWebSocket: (sessionId: number) => {
    if (typeof window === 'undefined') return

    if (studentWs) {
      // Detach handlers first: closing the old socket must not schedule a
      // reconnect that would fight the new socket created below.
      studentWs.onclose = null
      studentWs.onmessage = null
      studentWs.close()
    }
    if (studentWsReconnectTimer) {
      clearTimeout(studentWsReconnectTimer)
      studentWsReconnectTimer = null
    }
    studentWsIntentionalClose = false
    studentWsSessionId = sessionId
    set({ studentWsState: studentWsEverOpened ? 'reconnecting' : 'connecting' })

    // Connect to the BACKEND directly, not to the page's own host. In
    // production the page is served by Vercel, which cannot serve WebSocket
    // upgrades, so building the URL from window.location.host made this
    // socket fail silently while the companion socket (which correctly uses
    // wsBaseUrl) connected fine. That mismatch is exactly "phone says
    // connected, desktop still scanning": the COMPANION_PAIRED_SUCCESS event
    // had no desktop socket to arrive on.
    const wsUrl = withWsToken(`${wsBaseUrl()}/ws/student/${sessionId}/alerts`)
    studentWs = new WebSocket(wsUrl)

    studentWs.onopen = () => {
      studentWsReconnectAttempts = 0
      studentWsEverOpened = true
      set({ studentWsState: 'connected' })
    }

    studentWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'COMPANION_PAIRED_SUCCESS') {
          set({ companionPaired: true })
        } else if (msg.event === 'COMPANION_DISCONNECTED') {
          set({ companionPaired: false })
        } else if (msg.event === 'TEACHER_DIRECT_WARNING') {
          set({
            warningTeacherName: msg.payload?.teacher_name || 'Pengawas Ujian',
            warningMessage: msg.payload?.message_text || 'Perhatikan instruksi pengawasan ujian!',
            warningModalOpen: true,
          })
        } else if (msg.event === 'TEACHER_DISQUALIFIED') {
          set({
            teacherDisqualified: true,
            disqualificationInfo: msg.payload,
          })
        }
      } catch (err) {
        console.warn('[ProctoringWS] Error parsing student message:', err)
      }
    }

    studentWs.onclose = () => {
      studentWs = null
      if (studentWsIntentionalClose) return
      // Unbounded retry with backoff (2s, then 4s, capped at 5s) for as
      // long as the exam page is alive. Giving up after N attempts is what
      // stranded the wizard while the phone kept retrying forever.
      set({ studentWsState: studentWsEverOpened ? 'reconnecting' : 'connecting' })
      const delay = Math.min(
        STUDENT_WS_RECONNECT_BASE_DELAY_MS * (studentWsReconnectAttempts + 1),
        STUDENT_WS_RECONNECT_MAX_DELAY_MS
      )
      studentWsReconnectAttempts += 1
      studentWsReconnectTimer = setTimeout(() => {
        get().initStudentWebSocket(sessionId)
      }, delay)
    }
  },

  // Force an immediate reconnect of the student WS (the wizard's
  // "Hubungkan ulang" button). Resets the backoff so the retry happens
  // now instead of at the next scheduled attempt.
  reconnectStudentWs: () => {
    if (studentWsSessionId === null) return
    if (studentWsReconnectTimer) {
      clearTimeout(studentWsReconnectTimer)
      studentWsReconnectTimer = null
    }
    studentWsReconnectAttempts = 0
    get().initStudentWebSocket(studentWsSessionId)
  },

  connectStudentWs: (sessionId: number) => {
    get().initStudentWebSocket(sessionId)
  },

  closeStudentWebSocket: () => {
    studentWsIntentionalClose = true
    if (studentWsReconnectTimer) {
      clearTimeout(studentWsReconnectTimer)
      studentWsReconnectTimer = null
    }
    studentWsReconnectAttempts = 0
    studentWsSessionId = null
    studentWsEverOpened = false
    if (studentWs) {
      studentWs.close()
      studentWs = null
    }
  },

  cleanup: () => {
    get().closeStudentWebSocket()
    set({
      primaryCamActive: false,
      companionPaired: false,
      studentWsState: 'connecting',
      currentIntegrityScore: 100,
      alerts: [],
      warningModalOpen: false,
      warningMessage: '',
      warningTeacherName: '',
      teacherDisqualified: false,
      disqualificationInfo: null,
    })
  },

  dismissWarning: () => set({ warningModalOpen: false }),
}))
