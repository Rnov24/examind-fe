<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col select-none font-sans">
    <!-- Top Bar -->
    <header class="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm shadow-card group hover:bg-[#c2ef4e] hover:text-slate-950 transition-colors">
          EX
        </div>
        <div>
          <h1 class="font-display text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">{{ examStore.examMeta?.title || 'Ujian EXAMIND' }}</h1>
          <p class="text-[11px] text-slate-500 font-mono">Peserta: {{ authStore.user?.full_name }} • {{ authStore.user?.identifier }}</p>
        </div>
      </div>

      <!-- Center: Timer & Sync Status -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Timer -->
        <div
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm tracking-wide shadow-xs tabular-nums"
          :class="isTimerUrgent ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-slate-100/80 border-slate-200 text-slate-900'"
        >
          <Clock class="w-4 h-4 text-slate-700 shrink-0" />
          <span>{{ formattedTime }}</span>
        </div>

        <!-- Sync Indicator -->
        <div class="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 shadow-xs">
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-emerald-500 animate-pulse': examStore.syncStatus === 'synced',
              'bg-amber-500': examStore.syncStatus === 'saved_local' || examStore.syncStatus === 'syncing',
              'bg-rose-500': examStore.syncStatus === 'offline'
            }"
          />
          <span class="text-slate-600 font-mono text-[11px]">
            {{ examStore.syncStatus === 'synced' ? 'Tersinkron' : examStore.syncStatus === 'syncing' ? 'Menyinkron...' : examStore.syncStatus === 'saved_local' ? 'Tersimpan Lokal' : 'Offline' }}
          </span>
        </div>
      </div>

      <!-- Right: Proctoring Camera Status & Action -->
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-2 font-mono">
          <!-- Primary Webcam Status -->
          <span
            class="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-xs"
            :class="proctoringStore.primaryCamActive ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'"
          >
            <Video class="w-3.5 h-3.5" />
            <span class="hidden md:inline">Cam 1</span>
          </span>

          <!-- Secondary Companion Status -->
          <button
            v-if="examStore.examMeta?.proctoring_level === 'dual_camera'"
            @click="showQrModal = true"
            class="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs"
            :class="proctoringStore.companionPaired ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span class="hidden md:inline">{{ proctoringStore.companionPaired ? 'Cam 2: OK' : 'Scan Cam 2' }}</span>
          </button>
        </div>

        <!-- Submit Button -->
        <button
          @click="showSubmitModal = true"
          class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-1.5 cursor-pointer font-display tracking-wide"
        >
          <CheckCircle2 class="w-4 h-4 text-[#c2ef4e]" />
          <span>Kumpulkan</span>
        </button>
      </div>
    </header>

    <!-- Main Workspace Body -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Left Area: Active Question Viewer -->
      <main class="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        <QuestionCard
          v-if="examStore.currentQuestion"
          :question="examStore.currentQuestion"
          :current-index="examStore.currentIndex"
          :total-questions="examStore.totalQuestions"
          :is-doubt="!!doubtMap[examStore.currentQuestion.id]"
          :current-answer="currentAnswer"
          :essay-value="essayInput"
          @select-option="handleSelectOption"
          @update:essay-value="onEssayInputUpdate"
          @toggle-doubt="toggleDoubt(examStore.currentQuestion.id)"
          @prev="prevQuestion"
          @next="nextQuestion"
        />

        <div v-else class="text-center py-20 text-slate-500">
          Memuat butir soal ujian...
        </div>
      </main>

      <!-- Right Area: Matrix Navigator & Webcam Monitor Box -->
      <aside class="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200/80 bg-white p-6 flex flex-col justify-between shadow-xs">
        <div class="space-y-6">
          <!-- Mini Cam Preview Box -->
          <div class="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 aspect-video relative shadow-card">
            <video ref="videoPreviewEl" class="w-full h-full object-cover" autoplay playsinline muted></video>
            <div class="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] text-[#c2ef4e] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] animate-pulse"></span>
              <span>Edge AI Active</span>
            </div>
          </div>

          <!-- Question Matrix Navigator -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">Kisi-Kisi Soal</h3>
              <span class="text-xs font-mono font-bold text-slate-600 tabular-nums">{{ examStore.answeredCount }} / {{ examStore.totalQuestions }} Terjawab</span>
            </div>

            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="(q, idx) in examStore.questions"
                :key="q.id"
                @click="examStore.currentIndex = idx"
                class="h-10 rounded-xl font-bold text-xs transition-all relative flex items-center justify-center border cursor-pointer font-mono"
                :class="getMatrixButtonClass(q.id, idx)"
              >
                <span>{{ idx + 1 }}</span>
                <span
                  v-if="doubtMap[q.id]"
                  class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"
                />
              </button>
            </div>
          </div>

          <!-- Legend -->
          <div class="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600 font-semibold font-mono">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span>Terjawab</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-md bg-amber-500"></span>
              <span>Ragu</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-md bg-white border border-slate-300"></span>
              <span>Kosong</span>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100">
          <p class="text-[11px] text-slate-400 text-center leading-relaxed">
            Data tersinkron otomatis setiap 30 detik ke server EXAMIND.
          </p>
        </div>
      </aside>
    </div>

    <!-- Modular Modals -->
    <CompanionQrModal
      :is-open="showQrModal"
      :companion-url="companionUrl"
      :session-id="examStore.sessionId"
      :is-companion-paired="proctoringStore.companionPaired"
      @close="showQrModal = false"
    />

    <ExamSubmitModal
      :is-open="showSubmitModal"
      :answered-count="examStore.answeredCount"
      :total-questions="examStore.totalQuestions"
      :is-submitting="isSubmitting"
      @close="showSubmitModal = false"
      @confirm="handleFinalSubmit"
    />

    <!-- Human-in-the-Loop Security Warning Modal -->
    <SecurityWarningModal
      :is-open="isSecurityModalOpen"
      :details="securityInfractionDetails"
      @re-enter-fullscreen="handleReEnterFullscreen"
      @exit-exam="handleExitExam"
    />

    <!-- Direct Supervisor Warning Alert Modal (Human-in-the-Loop) -->
    <div
      v-if="proctoringStore.warningModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border-2 border-amber-400 text-slate-900">
        <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Bell class="w-5 h-5 text-amber-600 animate-bounce" />
          </div>
          <div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 font-mono">
              Peringatan Langsung Pengawas
            </span>
            <h3 class="text-sm font-bold text-slate-900 mt-0.5">{{ proctoringStore.warningTeacherName }}</h3>
          </div>
        </div>

        <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
          "{{ proctoringStore.warningMessage }}"
        </div>

        <p class="text-[11px] text-slate-500 leading-normal">
          Harap segera patuhi instruksi pengawas ujian di atas untuk menjaga integritas sesi ujian Anda.
        </p>

        <button
          @click="proctoringStore.dismissWarning()"
          class="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          Saya Mengerti & Melanjutkan Ujian
        </button>
      </div>
    </div>

    <!-- Initial Fullscreen Gate Modal -->
    <div v-if="!isExamStarted && !isSecurityModalOpen" class="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-subtle-elevated relative overflow-hidden">
        <div class="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-indigo-50/70 rounded-full blur-2xl"></div>
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center mx-auto shadow-xs ring-4 ring-indigo-50/70">
          <ShieldAlert class="w-8 h-8 text-indigo-600" />
        </div>
        <div class="space-y-1.5">
          <h2 class="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Protokol Keamanan CBT EXAMIND</h2>
          <p class="text-xs text-slate-500">Ujian ini dipantau secara otomatis dengan AI Proctoring dan peninjauan pengawas.</p>
        </div>
        <div class="text-left bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5 text-xs text-slate-700">
          <div class="flex items-start gap-3">
            <Maximize class="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong class="text-slate-900 font-display">Layar Penuh (Fullscreen) Wajib:</strong>
              <p class="text-slate-600 text-[11px] mt-0.5 leading-relaxed">Ujian dikerjakan dalam mode layar penuh tanpa jendela aplikasi lain aktif.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong class="text-slate-900 font-display">Integritas Pengawasan:</strong>
              <p class="text-slate-600 text-[11px] mt-0.5 leading-relaxed">Perpindahan tab atau kehilangan fokus akan dicatat dan dilaporkan langsung ke pengawas.</p>
            </div>
          </div>
        </div>
        <button
          @click="enterFullscreenAndStart"
          class="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide group"
        >
          <Maximize class="w-4 h-4 text-[#c2ef4e] group-hover:scale-110 transition-transform" />
          <span>Masuk Mode Layar Penuh & Mulai Ujian</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Clock,
  Video,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Maximize,
  Bell,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useExamStore } from '@/stores/exam'
import { useProctoringStore } from '@/stores/proctoring'
import { ProctoringEdgeEngine } from '@/utils/proctoringEdge'
import QuestionCard from './components/QuestionCard.vue'
import CompanionQrModal from './components/CompanionQrModal.vue'
import ExamSubmitModal from './components/ExamSubmitModal.vue'
import SecurityWarningModal from './components/SecurityWarningModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const examStore = useExamStore()
const proctoringStore = useProctoringStore()

const examId = Number(route.params.examId)
const videoPreviewEl = ref<HTMLVideoElement | null>(null)
const doubtMap = ref<Record<number, boolean>>({})
const essayInput = ref<string>('')
const showQrModal = ref<boolean>(false)
const showSubmitModal = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)

// Human-in-the-Loop Security State
const isExamStarted = ref<boolean>(false)
const isSecurityModalOpen = ref<boolean>(false)
const securityInfractionDetails = ref<string>('')

// Human-in-the-Loop Supervisor Adjudication Watcher
watch(
  () => proctoringStore.teacherDisqualified,
  async (isDisqualified) => {
    if (isDisqualified) {
      removeSecurityListeners()
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch (e) {}
      }
      router.push(`/student/exam/${examId}/result`)
    }
  }
)

let edgeEngine: ProctoringEdgeEngine | null = null

const formattedTime = computed(() => {
  const total = examStore.timeRemainingSeconds
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const isTimerUrgent = computed(() => examStore.timeRemainingSeconds <= 300)

const currentAnswer = computed(() => {
  if (!examStore.currentQuestion) return undefined
  return examStore.answersMap[examStore.currentQuestion.id]
})

const companionUrl = computed(() => {
  const origin = window.location.origin
  return `${origin}/#/companion?session_id=${examStore.sessionId}&token=${examStore.pairingToken}`
})

watch(
  () => examStore.currentQuestion,
  (newQ) => {
    if (newQ && newQ.question_type !== 'multiple_choice') {
      essayInput.value = examStore.answersMap[newQ.id] || ''
    } else {
      essayInput.value = ''
    }
  },
  { immediate: true }
)

function toggleDoubt(qid: number): void {
  doubtMap.value[qid] = !doubtMap.value[qid]
}

function handleSelectOption(optId: string): void {
  if (!examStore.currentQuestion || isSecurityModalOpen.value) return
  examStore.setAnswer(examStore.currentQuestion.id, optId)
}

function onEssayInputUpdate(val: string): void {
  essayInput.value = val
  if (!examStore.currentQuestion || isSecurityModalOpen.value) return
  examStore.setAnswer(examStore.currentQuestion.id, val)
}

function nextQuestion(): void {
  if (examStore.currentIndex < examStore.totalQuestions - 1) {
    examStore.currentIndex++
  }
}

function prevQuestion(): void {
  if (examStore.currentIndex > 0) {
    examStore.currentIndex--
  }
}

function getMatrixButtonClass(qid: number, idx: number): string {
  const isCurrent = idx === examStore.currentIndex
  const ans = examStore.answersMap[qid]
  const isAnswered = ans && ans.trim() !== ''
  const isDoubt = doubtMap.value[qid]

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

/* ==========================================================================
   HUMAN-IN-THE-LOOP CBT PROCTORING SECURITY CONTROLLERS
   ========================================================================== */

async function enterFullscreenAndStart(): Promise<void> {
  try {
    const el = document.documentElement as any
    if (el.requestFullscreen) await el.requestFullscreen()
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    else if (el.msRequestFullscreen) await el.msRequestFullscreen()
  } catch (err) {
    console.warn('Fullscreen request rejected:', err)
  }

  isExamStarted.value = true
  setTimeout(() => {
    attachSecurityListeners()
  }, 400)
}

function handleFullscreenChange(): void {
  if (!isExamStarted.value || isSubmitting.value || isSecurityModalOpen.value) return
  const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement)
  if (!isFs) {
    triggerSecurityWarning('fullscreen_exit', 'Menutup mode layar penuh (Fullscreen keluar)')
  }
}

function handleVisibilityChange(): void {
  if (!isExamStarted.value || isSubmitting.value || isSecurityModalOpen.value) return
  if (document.hidden || document.visibilityState === 'hidden') {
    triggerSecurityWarning('tab_switch', 'Berpindah tab atau aplikasi lain')
  }
}

function handleWindowBlur(): void {
  if (!isExamStarted.value || isSubmitting.value || isSecurityModalOpen.value) return
  triggerSecurityWarning('tab_switch', 'Kehilangan fokus jendela ujian (Window blur)')
}

function triggerSecurityWarning(reason: string, details: string): void {
  if (isSecurityModalOpen.value || isSubmitting.value) return

  isSecurityModalOpen.value = true
  securityInfractionDetails.value = details

  // Capture snapshot and log proctoring event for human teacher review
  const snapshot = edgeEngine?.captureSnapshot()
  if (examStore.sessionId) {
    proctoringStore.logViolation(
      examStore.sessionId,
      reason,
      'primary_camera',
      'high',
      snapshot
    )
  }
}

async function handleReEnterFullscreen(): Promise<void> {
  try {
    const el = document.documentElement as any
    if (el.requestFullscreen) await el.requestFullscreen()
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    else if (el.msRequestFullscreen) await el.msRequestFullscreen()
  } catch (e) {}
  isSecurityModalOpen.value = false
}

async function handleExitExam(): Promise<void> {
  isSecurityModalOpen.value = false
  removeSecurityListeners()
  await examStore.failExam(examId, 'student_aborted', securityInfractionDetails.value)
  router.push(`/student/exam/${examId}/result`)
}

function attachSecurityListeners(): void {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
}

function removeSecurityListeners(): void {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
}

async function handleFinalSubmit(): Promise<void> {
  try {
    isSubmitting.value = true
    removeSecurityListeners()

    await examStore.submitExam(examId)
    showSubmitModal.value = false

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (e) {}
    }

    router.push(`/student/exam/${examId}/result`)
  } catch (err: any) {
    isSubmitting.value = false
    attachSecurityListeners()
    alert(err?.response?.data?.error?.message || 'Gagal mengumpulkan ujian. Silakan coba lagi.')
  }
}

onMounted(async () => {
  try {
    await examStore.startExamSession(examId)

    if (examStore.sessionId) {
      proctoringStore.initStudentWebSocket(examStore.sessionId)

      edgeEngine = new ProctoringEdgeEngine({
        onViolation: (eventType, severity, snapshot) => {
          if (examStore.sessionId && !isSecurityModalOpen.value) {
            proctoringStore.logViolation(
              examStore.sessionId,
              eventType,
              'primary_camera',
              severity,
              snapshot
            )
          }
        },
        onStatusChange: (status) => {
          proctoringStore.primaryCamActive = status.active
        },
      })

      if (videoPreviewEl.value) {
        await edgeEngine.start(videoPreviewEl.value)
      }
    }
  } catch (err) {
    console.error('Failed to initialize exam workspace:', err)
  }
})

onUnmounted(() => {
  removeSecurityListeners()
  if (edgeEngine) {
    try {
      edgeEngine.stop()
    } catch (e) {}
  }
})
</script>
