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
  currentIntegrityScore: number
  alerts: ProctoringAlert[]
  warningModalOpen: boolean
  warningMessage: string
  warningTeacherName: string
  teacherDisqualified: boolean
  disqualificationInfo: any | null

  setPrimaryCamActive: (active: boolean) => void
  setCompanionPaired: (paired: boolean) => void
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
// Bounded reconnect for the student alerts socket: without it, one failed
// handshake (or a dropped connection) strands the wizard's "Kamera Kedua"
// step on "Menunggu pindai…" forever, even though the phone already shows
// "Terhubung". Intentional closes (cleanup / exam end) never reconnect.
let studentWsIntentionalClose = false
let studentWsReconnectTimer: ReturnType<typeof setTimeout> | null = null
let studentWsReconnectAttempts = 0
const STUDENT_WS_MAX_RECONNECTS = 5
const STUDENT_WS_RECONNECT_DELAY_MS = 2000

export const useProctoringStore = create<ProctoringState>((set, get) => ({
  primaryCamActive: false,
  companionPaired: false,
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
      if (studentWsReconnectAttempts >= STUDENT_WS_MAX_RECONNECTS) return
      studentWsReconnectAttempts += 1
      studentWsReconnectTimer = setTimeout(() => {
        get().initStudentWebSocket(sessionId)
      }, STUDENT_WS_RECONNECT_DELAY_MS)
    }
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
