<template>
  <div class="mt-3 border-t border-slate-200 pt-3">
    <!-- Toggle Button to Open/Close Tutor Chat -->
    <div class="flex items-center justify-between">
      <button
        @click="toggleChat"
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
        :class="isOpen
          ? 'bg-indigo-600 text-white font-bold'
          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'"
      >
        <Bot class="w-3.5 h-3.5" />
        <span>{{ isOpen ? 'Tutup Tutor AI' : 'Tanya Tutor AI tentang Soal Ini' }}</span>
        <span
          v-if="messages.length > 0"
          class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-white font-mono font-bold"
        >
          {{ messages.length }}
        </span>
      </button>

      <span v-if="!isOpen" class="text-[11px] text-slate-500 font-medium hidden sm:inline">
        Diskusikan konsep, alasan salah/benar, atau trik soal
      </span>
    </div>

    <!-- Collapsible Socratic Tutor Chat Interface -->
    <div
      v-if="isOpen"
      class="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <!-- Chat Header -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[10px] font-bold shadow-xs">
            <Bot class="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 class="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <span>EXAMIND Socratic Tutor</span>
              <span class="text-[10px] font-normal text-slate-500">• Butir Soal #{{ questionNumber }}</span>
              <span v-if="messages.length > 0" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                Memori Diskusi
              </span>
            </h4>
          </div>
        </div>

        <button
          v-if="messages.length > 0"
          type="button"
          @click="resetChat"
          title="Reset diskusi soal ini"
          aria-label="Reset diskusi soal ini"
          class="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw class="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <!-- Messages Stream -->
      <div ref="chatContainer" class="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs scrollbar-thin">
        <!-- Initial Tutor Welcome -->
        <div class="flex items-start gap-2">
          <div class="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 font-mono">
            AI
          </div>
          <div class="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 text-slate-800 leading-relaxed shadow-xs max-w-[90%]">
            <template v-if="isCorrect">
              🌟 <b>Bagus sekali!</b> Jawabanmu pada nomor ini sudah <b>benar</b> (Skor {{ finalScore }}/{{ allocatedPoints }}).<br />
              Mau mendalami mengapa opsi pengecoh lainnya salah, atau ingin analogi pemahaman yang lebih kuat?
            </template>
            <template v-else>
              💡 Di soal nomor ini, jawabanmu adalah <code class="bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold font-mono border border-rose-200">{{ studentResponse || '(Kosong)' }}</code>, sedangkan kunci jawaban resmi adalah <code class="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-bold font-mono border border-emerald-200">{{ correctAnswer }}</code>.<br />
              Jangan khawatir, yuk kita bedah di mana letak kekeliruan konsepnya! Apa yang ingin kamu tanyakan?
            </template>
          </div>
        </div>

        <!-- Chat History -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex items-start gap-2"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 font-mono"
          >
            AI
          </div>

          <div
            class="p-3 rounded-xl text-xs leading-relaxed max-w-[90%]"
            :class="msg.role === 'user'
              ? 'bg-slate-900 text-white rounded-tr-xs whitespace-pre-line font-medium shadow-xs'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'"
          >
            <div v-if="msg.role === 'assistant'" v-html="formatMarkdown(msg.content)"></div>
            <div v-else>{{ msg.content }}</div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isLoading" class="flex items-start gap-2">
          <div class="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 animate-pulse font-mono">
            AI
          </div>
          <div class="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-2.5 text-slate-500 flex items-center gap-1.5 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
            <span class="text-[11px] font-medium text-slate-500">Tutor AI sedang menganalisis soal...</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Prompt Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none pt-1">
        <button
          v-for="chip in quickChips"
          :key="chip"
          @click="sendQuickPrompt(chip)"
          :disabled="isLoading"
          class="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {{ chip }}
        </button>
      </div>

      <!-- Input Bar -->
      <div class="flex items-center gap-2 pt-1">
        <input
          v-model="inputQuery"
          @keydown.enter="handleSend"
          type="text"
          :placeholder="isCorrect ? 'Tanyakan materi lanjutan atau variasi soal...' : 'Tanyakan kenapa jawabanmu salah atau konsepnya...'"
          :disabled="isLoading"
          class="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
        />
        <button
          @click="handleSend"
          :disabled="!inputQuery.trim() || isLoading"
          class="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Send class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Bot, Send, RotateCcw } from 'lucide-vue-next'
import api from '@/lib/api'

interface Props {
  examId: number
  questionId: number
  questionNumber: number
  questionPrompt: string
  questionType: string
  isCorrect?: boolean | null
  studentResponse?: string | null
  correctAnswer?: string | null
  officialExplanation?: string | null
  finalScore: number
  allocatedPoints: number
}

const props = defineProps<Props>()

const isOpen = ref(false)
const isLoading = ref(false)
const inputQuery = ref('')
const chatContainer = ref<HTMLDivElement | null>(null)

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Memory & Caching per question discussion
const tutorStorageKey = computed(() => `examind_tutor_mem_${props.examId}_${props.questionId}`)

function loadSavedMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(tutorStorageKey.value)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const messages = ref<ChatMessage[]>(loadSavedMessages())

watch(tutorStorageKey, () => {
  messages.value = loadSavedMessages()
})

function saveMessages() {
  try {
    localStorage.setItem(tutorStorageKey.value, JSON.stringify(messages.value.slice(-20)))
  } catch (e) {
    console.error('Failed to save tutor memory:', e)
  }
}

const quickChips = computed(() => {
  if (props.isCorrect) {
    return [
      '🔍 Mengapa opsi lainnya salah?',
      '🌟 Bagaimana analogi konsep ini?',
      '🚀 Beri contoh variasi soal serupa',
    ]
  } else {
    return [
      '💡 Kenapa jawaban saya salah?',
      '📖 Jelaskan konsep dasar step-by-step',
      '🎯 Apa trik / rumus soal ini?',
    ]
  }
})

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

function resetChat() {
  messages.value = []
  try {
    localStorage.removeItem(tutorStorageKey.value)
  } catch (e) {
    console.error('Failed to clear tutor memory:', e)
  }
}

function formatMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 border border-slate-200">$1</code>')
    .replace(/^- (.*$)/gim, '<li class="ml-3 list-disc">$1</li>')
    .replace(/\n\n/g, '<div class="h-1.5"></div>')
    .replace(/\n/g, '<br />')
  return html
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function handleSend() {
  const query = inputQuery.value.trim()
  if (!query || isLoading.value) return

  messages.value.push({ role: 'user', content: query })
  saveMessages()
  inputQuery.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const historyPayload = messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
    const savedKey = localStorage.getItem('examind_gemini_key') || undefined

    const res = await api.post('/ai/question-explanation/chat', {
      exam_id: props.examId,
      question_id: props.questionId,
      message: query,
      history: historyPayload,
      api_key: savedKey,
    })

    const reply = res.data?.data?.reply || 'Respon pembahasan diterima dari Tutor AI.'
    messages.value.push({ role: 'assistant', content: reply })
    saveMessages()
  } catch (err: any) {
    const errorDetail = err.response?.data?.message || err.response?.data?.detail
    messages.value.push({
      role: 'assistant',
      content: errorDetail
        ? `⚠️ ${errorDetail}`
        : 'Maaf, terjadi gangguan saat menghubungi Tutor AI. Pastikan sesi ujian telah selesai dan silakan coba kembali.',
    })
    saveMessages()
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function sendQuickPrompt(chipText: string) {
  const cleanText = chipText.replace(/^[^\w\s]+/, '').trim()
  inputQuery.value = cleanText || chipText
  handleSend()
}
</script>
