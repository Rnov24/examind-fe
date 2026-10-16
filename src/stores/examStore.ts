import { create } from 'zustand'
import api from '@/lib/api'
import { saveLocalAnswer, getAllLocalAnswers, clearLocalAnswers } from '@/utils/indexedDB'

export interface ExamQuestion {
  id: number
  order_index: number
  question_type: 'multiple_choice' | 'short_essay' | 'long_essay'
  prompt: string
  options_json?: Array<{ id: string; text: string }>
  difficulty?: string
  points: number
  saved_response?: string
}

interface ExamState {
  sessionId: number | null
  examMeta: any | null
  questions: ExamQuestion[]
  currentIndex: number
  answersMap: Record<number, string>
  timeRemainingSeconds: number
  companionQrUrl: string
  pairingToken: string
  syncStatus: 'saved_local' | 'syncing' | 'synced' | 'offline'
  lastSyncTime: string
  totalQuestions: number
  answeredCount: number

  // Getters
  getCurrentQuestion: () => ExamQuestion | null
  getTotalQuestions: () => number
  getAnsweredCount: () => number
  getIsComplete: () => boolean

  // Actions
  setCurrentIndex: (index: number) => void
  loadExam: (examId: number) => Promise<void>
  startExamSession: (examId: number) => Promise<void>
  setAnswer: (questionId: number, response: string) => void
  syncToServer: (examId: number) => Promise<void>
  startTimer: () => void
  startAutosaveLoop: (examId: number) => void
  submitExam: (examId?: number) => Promise<any>
  failExam: (examId: number, reason: string, details?: string) => Promise<any>
  cleanup: () => void
}

let timerInterval: any = null
let autosaveInterval: any = null

export const useExamStore = create<ExamState>((set, get) => ({
  sessionId: null,
  examMeta: null,
  questions: [],
  currentIndex: 0,
  answersMap: {},
  timeRemainingSeconds: 0,
  companionQrUrl: '',
  pairingToken: '',
  syncStatus: 'synced',
  lastSyncTime: '',
  totalQuestions: 0,
  answeredCount: 0,

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get()
    return questions[currentIndex] || null
  },
  getTotalQuestions: () => get().questions.length,
  getAnsweredCount: () => {
    const { answersMap } = get()
    return Object.keys(answersMap).filter((k) => (answersMap[Number(k)] || '').trim() !== '').length
  },
  getIsComplete: () => {
    const total = get().questions.length
    return total > 0 && get().getAnsweredCount() === total
  },

  setCurrentIndex: (index: number) => set({ currentIndex: index }),

  loadExam: async (examId: number) => {
    return get().startExamSession(examId)
  },

  startExamSession: async (examId: number) => {
    const res = await api.post(`/student/exam/${examId}/start`)
    const data = res.data.data

    const answersMap: Record<number, string> = {}
    for (const q of data.questions) {
      if (q.saved_response) {
        answersMap[q.id] = q.saved_response
      }
    }

    // Hydrate from IndexedDB in case of network drops
    try {
      const localCached = await getAllLocalAnswers(data.session_id)
      for (const item of localCached) {
        if (item.response) {
          answersMap[item.questionId] = item.response
        }
      }
    } catch (e) {
      console.warn('[ExamStore] IndexedDB load warning:', e)
    }

    const answeredCount = Object.keys(answersMap).filter((k) => (answersMap[Number(k)] || '').trim() !== '').length

    set({
      sessionId: data.session_id,
      examMeta: data.exam,
      questions: data.questions || [],
      totalQuestions: (data.questions || []).length,
      answeredCount,
      timeRemainingSeconds: data.duration_remaining_seconds,
      companionQrUrl: data.companion_qr_url,
      pairingToken: data.pairing_token,
      currentIndex: 0,
      answersMap,
      syncStatus: 'synced',
    })

    get().startTimer()
    get().startAutosaveLoop(examId)
  },

  setAnswer: (questionId: number, response: string) => {
    const currentMap = { ...get().answersMap, [questionId]: response }
    const answeredCount = Object.keys(currentMap).filter((k) => (currentMap[Number(k)] || '').trim() !== '').length
    set({ answersMap: currentMap, answeredCount, syncStatus: 'saved_local' })

    const sid = get().sessionId
    if (sid) {
      saveLocalAnswer(sid, questionId, response)
    }
  },

  syncToServer: async (examId: number) => {
    const { sessionId, syncStatus, answersMap } = get()
    if (!sessionId || syncStatus === 'syncing') return

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      set({ syncStatus: 'offline' })
      return
    }

    try {
      set({ syncStatus: 'syncing' })
      const payloadAnswers = Object.entries(answersMap).map(([qid, ans]) => ({
        question_id: Number(qid),
        response: ans,
      }))

      const res = await api.post(`/student/exam/${examId}/autosave`, {
        session_id: sessionId,
        answers: payloadAnswers,
      })

      const d = new Date(res.data.data.last_saved_at)
      set({
        syncStatus: 'synced',
        lastSyncTime: d.toLocaleTimeString('id-ID'),
      })
    } catch (err) {
      console.warn('[ExamStore] Sync to server failed, staying in local mode:', err)
      set({ syncStatus: 'offline' })
    }
  },

  startTimer: () => {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      const remaining = get().timeRemainingSeconds
      if (remaining > 0) {
        set({ timeRemainingSeconds: remaining - 1 })
      } else {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }, 1000)
  },

  startAutosaveLoop: (examId: number) => {
    if (autosaveInterval) clearInterval(autosaveInterval)
    autosaveInterval = setInterval(() => {
      get().syncToServer(examId)
    }, 30000)

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => get().syncToServer(examId))
    }
  },

  submitExam: async (examId?: number) => {
    get().cleanup()
    const targetExamId = examId || get().examMeta?.id
    if (targetExamId) {
      await get().syncToServer(targetExamId)
    }

    const sid = get().sessionId
    const res = await api.post(`/student/exam/${targetExamId}/submit`, {
      session_id: sid,
    })

    if (sid) {
      await clearLocalAnswers(sid)
    }

    return res.data.data
  },

  failExam: async (examId: number, reason: string, details?: string) => {
    get().cleanup()
    const sid = get().sessionId
    if (!sid) return null

    try {
      const res = await api.post(`/student/exam/${examId}/fail`, {
        session_id: sid,
        reason,
        details,
      })
      await clearLocalAnswers(sid)
      return res.data.data
    } catch (err) {
      console.error('[ExamStore] failExam error:', err)
      return null
    }
  },

  cleanup: () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    if (autosaveInterval) {
      clearInterval(autosaveInterval)
      autosaveInterval = null
    }
  },
}))
