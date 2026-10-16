import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'

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

export const useProctoringStore = defineStore('proctoring', () => {
  const primaryCamActive = ref<boolean>(false)
  const companionPaired = ref<boolean>(false)
  const currentIntegrityScore = ref<number>(100)
  const alerts = ref<ProctoringAlert[]>([])
  const warningModalOpen = ref<boolean>(false)
  const warningMessage = ref<string>('')
  const warningTeacherName = ref<string>('')
  const teacherDisqualified = ref<boolean>(false)
  const disqualificationInfo = ref<any | null>(null)

  let studentWs: WebSocket | null = null

  async function logViolation(
    sessionId: number,
    eventType: string,
    cameraSource: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    durationSeconds: number = 1,
    snapshotBase64?: string
  ): Promise<void> {
    try {
      const res = await api.post('/proctoring/log-event', {
        session_id: sessionId,
        event_type: eventType,
        camera_source: cameraSource,
        severity,
        duration_seconds: durationSeconds,
        snapshot_base64: snapshotBase64 || null,
      })
      if (res.data.data) {
        // Integrity updated
      }
    } catch (err) {
      console.warn('[ProctoringStore] Failed to log violation:', err)
    }
  }

  function initStudentWebSocket(sessionId: number): void {
    if (studentWs) {
      studentWs.close()
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/student/${sessionId}/alerts`
    studentWs = new WebSocket(wsUrl)

    studentWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'COMPANION_PAIRED_SUCCESS') {
          companionPaired.value = true
        } else if (msg.event === 'COMPANION_DISCONNECTED') {
          companionPaired.value = false
        } else if (msg.event === 'TEACHER_DIRECT_WARNING') {
          warningTeacherName.value = msg.payload.teacher_name || 'Pengawas Ujian'
          warningMessage.value = msg.payload.message_text || 'Perhatikan instruksi pengawasan ujian!'
          warningModalOpen.value = true
        } else if (msg.event === 'TEACHER_DISQUALIFIED') {
          teacherDisqualified.value = true
          disqualificationInfo.value = msg.payload
        }
      } catch (err) {
        console.warn('[ProctoringWS] Error parsing student message:', err)
      }
    }

    studentWs.onclose = () => {
      // Automatic reconnect after 5s
      setTimeout(() => {
        if (studentWs && studentWs.readyState === WebSocket.CLOSED) {
          initStudentWebSocket(sessionId)
        }
      }, 5000)
    }
  }

  function closeStudentWebSocket(): void {
    if (studentWs) {
      studentWs.close()
      studentWs = null
    }
  }

  function dismissWarning(): void {
    warningModalOpen.value = false
  }

  return {
    primaryCamActive,
    companionPaired,
    currentIntegrityScore,
    alerts,
    warningModalOpen,
    warningMessage,
    warningTeacherName,
    teacherDisqualified,
    disqualificationInfo,
    logViolation,
    initStudentWebSocket,
    closeStudentWebSocket,
    dismissWarning,
  }
})
