<template>
  <div>
    <!-- Floating Action Button -->
    <button
      v-if="!isOpen && authStore.isAuthenticated"
      @click="isOpen = true"
      class="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xl shadow-slate-900/20 border border-slate-700/60 flex items-center gap-2.5 transition-all cursor-pointer"
    >
      <div class="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-mono text-[10px] font-bold">
        AI
      </div>
      <span>Asisten EXAMIND</span>
      <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
        Gemini
      </span>
      <span
        v-if="isStudent"
        class="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono"
      >
        Data Ujian
      </span>
    </button>

    <!-- Chat Drawer Window -->
    <div
      v-if="isOpen"
      class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-4rem)] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-slate-900"
    >
      <!-- Drawer Header -->
      <div class="p-4 px-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-mono text-[11px] font-bold">
            AI
          </div>
          <div>
            <h3 class="text-xs font-semibold leading-tight flex items-center gap-1.5">
              <span>Asisten EXAMIND</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">Gemini</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 font-mono">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Memori Aktif
              </span>
            </h3>
            <p class="text-[10px] text-slate-400">
              {{ isStudent ? 'Data Akademik, Nilai & Jadwal Ujian' : 'Asisten Kurikulum & Evaluasi Belajar' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            v-if="messages.length > 0"
            type="button"
            @click="clearMessages"
            title="Bersihkan Percakapan"
            aria-label="Bersihkan Percakapan"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click="isOpen = false"
            title="Tutup Chat"
            aria-label="Tutup Chat"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Messages Stream Area -->
      <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
        <!-- Initial Welcome Message -->
        <div class="flex items-start gap-2.5">
          <div class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
            AI
          </div>
          <div class="bg-white border border-slate-200 text-slate-800 rounded-xl rounded-tl-xs p-3 shadow-xs leading-relaxed max-w-[85%]">
            <template v-if="isStudent">
              Halo, <span class="font-bold text-slate-900">{{ userName }}</span>! 🎓<br />
              Saya asisten pintar EXAMIND yang terhubung langsung dengan riwayat akademikmu.
              Kamu bisa menanyakan <b>nilai ujian terakhir</b>, <b>jadwal ujian mendatang</b>, atau <b>rekapitulasi nilaimu</b> secara langsung!
            </template>
            <template v-else-if="isTeacher">
              Halo, <span class="font-bold text-slate-900">{{ userName }}</span>! 👨‍🏫<br />
              Saya siap membantu Anda memantau ringkasan hasil belajar kelas, membuat butir soal, atau menyusun rubrik esai 4 Dimensi.
            </template>
            <template v-else>
              Halo, <span class="font-bold text-slate-900">{{ userName }}</span>! 🛡️<br />
              Saya siap memberikan ringkasan statistik sekolah dan aktivitas ujian pada platform EXAMIND.
            </template>
          </div>
        </div>

        <!-- Chat History -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex items-start gap-2.5"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0"
          >
            AI
          </div>

          <div
            class="p-3 rounded-xl text-xs leading-relaxed max-w-[85%] shadow-xs"
            :class="msg.role === 'user'
              ? 'bg-slate-900 text-white rounded-tr-xs whitespace-pre-line'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'"
          >
            <div v-if="msg.role === 'assistant'" v-html="formatMarkdown(msg.content)"></div>
            <div v-else>{{ msg.content }}</div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isLoading" class="flex items-start gap-2.5">
          <div class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 animate-pulse">
            AI
          </div>
          <div class="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 text-slate-500 flex items-center gap-1.5 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
            <span class="text-[11px] font-medium">Gemini sedang mencari data & merespon...</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Prompt Chips (Tailored by Role) -->
      <div class="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
        <button
          v-for="chip in currentQuickChips"
          :key="chip"
          @click="sendQuickPrompt(chip)"
          :disabled="isLoading"
          class="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {{ chip }}
        </button>
      </div>

      <!-- Input Bar -->
      <div class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          v-model="inputQuery"
          @keydown.enter="handleSend"
          type="text"
          :placeholder="isStudent ? 'Tanya nilai, jadwal, atau materi...' : 'Tanyakan sesuatu ke Gemini AI...'"
          :disabled="isLoading"
          class="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
        />
        <button
          @click="handleSend"
          :disabled="!inputQuery.trim() || isLoading"
          class="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { X, Send, RotateCcw } from 'lucide-vue-next'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isOpen = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const inputQuery = ref<string>('')
const chatContainer = ref<HTMLDivElement | null>(null)

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Memory & Caching: persistent per authenticated user
const storageKey = computed(() => `examind_ai_chat_mem_${authStore.user?.id || 'guest'}`)

function loadSavedMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey.value)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const messages = ref<ChatMessage[]>(loadSavedMessages())

watch(storageKey, () => {
  messages.value = loadSavedMessages()
})

watch(isOpen, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})

function saveMessages() {
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(messages.value.slice(-30)))
  } catch (e) {
    console.error('Failed to save chat memory:', e)
  }
}

const isStudent = computed(() => authStore.user?.role === 'student')
const isTeacher = computed(() => authStore.user?.role === 'teacher')
const userName = computed(() => authStore.user?.full_name || authStore.user?.username || 'Pengguna')

const currentQuickChips = computed(() => {
  if (isStudent.value) {
    return [
      '📊 Berapa nilai ujian terakhir saya?',
      '⏰ Apa jadwal ujian mendatang?',
      '📝 Tampilkan daftar ujian saya',
      '📈 Berapa rata-rata nilai saya?',
    ]
  } else if (isTeacher.value) {
    return [
      '📊 Ringkasan Nilai Ujian Siswa',
      '💡 Ide Paket Soal Baru',
      '📝 Panduan Rubrik Esai 4D',
      '🛡️ Status Proctoring Kelas',
    ]
  } else {
    return [
      '📊 Ringkasan Statistik Sekolah',
      '👥 Total Siswa & Guru Aktif',
      '🚨 Insiden Proctoring Terbaru',
    ]
  }
})

function formatMarkdown(text: string): string {
  if (!text) return ''
  // Basic safe markdown parser for bold, italic, code, lists, and linebreaks
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 border border-slate-200">$1</code>')
    .replace(/^- (.*$)/gim, '<li class="ml-3 list-disc">$1</li>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
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

function clearMessages() {
  messages.value = []
  try {
    localStorage.removeItem(storageKey.value)
  } catch (e) {
    console.error('Failed to clear chat memory:', e)
  }
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
    const res = await api.post('/ai/assistant/chat', {
      message: query,
      history: historyPayload,
      context: isStudent.value ? 'EXAMIND Student Portal' : 'EXAMIND Dashboard',
      api_key: savedKey,
    })

    const reply = res.data?.data?.reply || 'Respon diterima dari asisten.'
    messages.value.push({ role: 'assistant', content: reply })
    saveMessages()
  } catch (err: any) {
    const errorDetail = err.response?.data?.message || err.response?.data?.detail
    messages.value.push({
      role: 'assistant',
      content: errorDetail
        ? `⚠️ ${errorDetail}`
        : 'Maaf, terjadi gangguan saat menghubungi asisten AI. Pastikan server backend aktif dan silakan coba kembali.',
    })
    saveMessages()
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function sendQuickPrompt(chipText: string) {
  // Strip leading emoji if present for cleaner prompt
  const cleanText = chipText.replace(/^[^\w\s]+/, '').trim()
  inputQuery.value = cleanText || chipText
  handleSend()
}
</script>
