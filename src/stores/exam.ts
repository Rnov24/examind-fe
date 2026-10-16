import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

export const useExamStore = defineStore('exam', () => {
  const sessionId = ref<number | null>(null)
  const examMeta = ref<any | null>(null)
  const questions = ref<ExamQuestion[]>([])
  const currentIndex = ref<number>(0)
  const answersMap = ref<Record<number, string>>({})
  const timeRemainingSeconds = ref<number>(0)
  const companionQrUrl = ref<string>('')
  const pairingToken = ref<string>('')
  const syncStatus = ref<'saved_local' | 'syncing' | 'synced' | 'offline'>('synced')
  const lastSyncTime = ref<string>('')

  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
  const totalQuestions = computed(() => questions.value.length)
  const answeredCount = computed(() => Object.keys(answersMap.value).filter(k => (answersMap.value[Number(k)] || '').trim() !== '').length)
  const isComplete = computed(() => answeredCount.value === totalQuestions.value && totalQuestions.value > 0)

  let timerInterval: any = null
  let autosaveInterval: any = null

  async function startExamSession(examId: number): Promise<void> {
    const res = await api.post(`/student/exam/${examId}/start`)
    const data = res.data.data

    sessionId.value = data.session_id
    examMeta.value = data.exam
    questions.value = data.questions
    timeRemainingSeconds.value = data.duration_remaining_seconds
    companionQrUrl.value = data.companion_qr_url
    pairingToken.value = data.pairing_token
    currentIndex.value = 0

    // Hydrate existing answers from server & IndexedDB
    answersMap.value = {}
    for (const q of data.questions) {
      if (q.saved_response) {
        answersMap.value[q.id] = q.saved_response
      }
    }

    // Load from local IndexedDB in case of recent network drops
    const localCached = await getAllLocalAnswers(data.session_id)
    for (const item of localCached) {
      if (item.response) {
        answersMap.value[item.questionId] = item.response
      }
    }

    startTimer()
    startAutosaveLoop(examId)
  }

  function setAnswer(questionId: number, response: string): void {
    answersMap.value[questionId] = response
    syncStatus.value = 'saved_local'

    // Immediate save to IndexedDB (<5ms)
    if (sessionId.value) {
      saveLocalAnswer(sessionId.value, questionId, response)
    }
  }

  async function syncToServer(examId: number): Promise<void> {
    if (!sessionId.value || syncStatus.value === 'syncing') return

    if (!navigator.onLine) {
      syncStatus.value = 'offline'
      return
    }

    try {
      syncStatus.value = 'syncing'
      const payloadAnswers = Object.entries(answersMap.value).map(([qid, ans]) => ({
        question_id: Number(qid),
        response: ans,
      }))

      const res = await api.post(`/student/exam/${examId}/autosave`, {
        session_id: sessionId.value,
        answers: payloadAnswers,
      })

      syncStatus.value = 'synced'
      const d = new Date(res.data.data.last_saved_at)
      lastSyncTime.value = d.toLocaleTimeString('id-ID')
    } catch (err) {
      console.warn('[ExamStore] Sync to server failed, staying in local mode:', err)
      syncStatus.value = 'offline'
    }
  }

  function startTimer(): void {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      if (timeRemainingSeconds.value > 0) {
        timeRemainingSeconds.value--
      } else {
        clearInterval(timerInterval)
      }
    }, 1000)
  }

  function startAutosaveLoop(examId: number): void {
    if (autosaveInterval) clearInterval(autosaveInterval)
    // 30 seconds heartbeat sync
    autosaveInterval = setInterval(() => {
      syncToServer(examId)
    }, 30000)

    // Window online listener
    window.addEventListener('online', () => syncToServer(examId))
  }

  async function submitExam(examId: number): Promise<any> {
    if (timerInterval) clearInterval(timerInterval)
    if (autosaveInterval) clearInterval(autosaveInterval)

    // Final push to autosave
    await syncToServer(examId)

    const res = await api.post(`/student/exam/${examId}/submit`, {
      session_id: sessionId.value,
    })

    if (sessionId.value) {
      await clearLocalAnswers(sessionId.value)
    }

    return res.data.data
  }

  async function failExam(examId: number, reason: string, details?: string): Promise<any> {
    if (timerInterval) clearInterval(timerInterval)
    if (autosaveInterval) clearInterval(autosaveInterval)
    timerInterval = null
    autosaveInterval = null

    if (!sessionId.value) return null

    try {
      const res = await api.post(`/student/exam/${examId}/fail`, {
        session_id: sessionId.value,
        reason,
        details,
      })

      await clearLocalAnswers(sessionId.value)
      return res.data.data
    } catch (err) {
      console.error('[ExamStore] failExam error:', err)
      return null
    }
  }

  function cleanup(): void {
    if (timerInterval) clearInterval(timerInterval)
    if (autosaveInterval) clearInterval(autosaveInterval)
    timerInterval = null
    autosaveInterval = null
  }

  return {
    sessionId,
    examMeta,
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answeredCount,
    isComplete,
    answersMap,
    timeRemainingSeconds,
    companionQrUrl,
    pairingToken,
    syncStatus,
    lastSyncTime,
    startExamSession,
    setAnswer,
    syncToServer,
    submitExam,
    failExam,
    cleanup,
  }
})
