import { create } from 'zustand'
import api from '@/lib/api'
import { withWsToken } from '@/lib/ws'

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
      studentWs.close()
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = withWsToken(`${protocol}//${host}/ws/student/${sessionId}/alerts`)
    studentWs = new WebSocket(wsUrl)

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
      // Reconnect if needed
    }
  },

  connectStudentWs: (sessionId: number) => {
    get().initStudentWebSocket(sessionId)
  },

  closeStudentWebSocket: () => {
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
