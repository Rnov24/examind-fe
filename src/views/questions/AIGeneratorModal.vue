<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-slate-900">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900">AI Question Generator Studio</h3>
            <p class="text-xs text-slate-500">Generate draft soal PG & Esai lengkap dengan analisis distractor & rubrik 4D</p>
          </div>
        </div>

        <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Step 1: Input Prompt / Topic -->
      <div v-if="!generatedData" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Topik atau Ringkasan Materi Pembelajaran</label>
          <textarea
            v-model="topicContent"
            rows="4"
            placeholder="Ketik topik materi secara spesifik, contoh: Teori Kuantum Planck, Efek Fotolistrik Einstein, dan spektrum garis atom hidrogen..."
            class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none placeholder:text-slate-400"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Jumlah Soal PG</label>
            <input
              v-model.number="mcqCount"
              type="number"
              min="1"
              max="20"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Jumlah Soal Esai</label>
            <input
              v-model.number="essayCount"
              type="number"
              min="0"
              max="10"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Tingkat Kesukaran</label>
            <select
              v-model="difficulty"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="easy">Mudah (C1-C2)</option>
              <option value="medium">Sedang (C3-C4)</option>
              <option value="hard">Sukar (C4-C5)</option>
            </select>
          </div>
        </div>

        <!-- Google Gemini Provider & API Key -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-indigo-600" />
              <span class="text-xs font-bold text-slate-900">AI Provider: Google Gemini</span>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
              :class="geminiApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'"
            >
              {{ geminiApiKey ? '● Gemini Live Online' : '● Mode Cerdas (Tanpa Key)' }}
            </span>
          </div>
          <div>
            <input
              v-model="geminiApiKey"
              @input="saveApiKey"
              type="password"
              placeholder="Masukkan Google Gemini API Key (AIzaSy...)"
              class="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none placeholder:text-slate-400"
            />
            <p class="text-[10px] text-slate-500 mt-1">
              Dapatkan API Key gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-semibold">Google AI Studio</a>. Kunci akan tersimpan aman di browser Anda.
            </p>
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="loading || !topicContent"
            @click="handleGenerate"
            class="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Sparkles v-else class="w-4 h-4 text-[#c2ef4e]" />
            <span>{{ loading ? 'AI Sedang Memproses...' : 'Generate Soal dengan AI' }}</span>
          </button>
        </div>
      </div>

      <!-- Step 2: Curation & Review Results -->
      <div v-else class="space-y-6">
        <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>AI berhasil menghasilkan {{ generatedData.mcq_questions.length }} Pilihan Ganda & {{ generatedData.essay_questions.length }} Esai.</span>
          <button @click="generatedData = null" class="underline text-emerald-700 hover:text-emerald-900 cursor-pointer">Ubah Parameter</button>
        </div>

        <!-- MCQs Preview -->
        <div v-if="generatedData.mcq_questions.length > 0" class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Pilihan Ganda ({{ generatedData.mcq_questions.length }} Butir)</h4>
          <div v-for="(mcq, idx) in generatedData.mcq_questions" :key="idx" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm font-bold text-slate-900">{{ idx + 1 }}. {{ mcq.prompt }}</p>
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-black uppercase font-mono">{{ mcq.bloom_level }}</span>
            </div>

            <div class="space-y-1.5 pl-2">
              <div
                v-for="opt in mcq.options"
                :key="opt.id"
                class="p-2 rounded-lg text-xs flex items-start gap-2 border"
                :class="opt.id === mcq.correct_option_id ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'"
              >
                <span class="font-bold w-4 font-mono">{{ opt.id }}.</span>
                <div class="flex-1">
                  <span>{{ opt.text }}</span>
                  <p v-if="opt.rationale" class="text-[11px] text-slate-500 font-normal mt-0.5 italic">
                    {{ opt.id === mcq.correct_option_id ? '✓ Alasan Kunci:' : '✗ Pengecoh:' }} {{ opt.rationale }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Essays Preview -->
        <div v-if="generatedData.essay_questions.length > 0" class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Esai Berbobot ({{ generatedData.essay_questions.length }} Butir)</h4>
          <div v-for="(essay, idx) in generatedData.essay_questions" :key="idx" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <p class="text-sm font-bold text-slate-900">{{ idx + 1 }}. {{ essay.prompt }}</p>
            <div class="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1 shadow-xs">
              <p class="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono">Matriks Rubrik 4 Dimensi:</p>
              <ul class="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                <li><strong class="font-semibold text-slate-900">Konsep (40%):</strong> {{ essay.rubric?.dimension_1_concept?.criteria }}</li>
                <li><strong class="font-semibold text-slate-900">Argumen (30%):</strong> {{ essay.rubric?.dimension_2_argument?.criteria }}</li>
                <li><strong class="font-semibold text-slate-900">Terminologi (15%):</strong> {{ essay.rubric?.dimension_3_terminology?.criteria }}</li>
                <li><strong class="font-semibold text-slate-900">Kejelasan (15%):</strong> {{ essay.rubric?.dimension_4_clarity?.criteria }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="saving"
            @click="handleSaveAllToBank"
            class="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4 text-white" />
            <span>{{ saving ? 'Menyimpan ke Bank...' : 'Simpan Semua Butir ke Bank Soal' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, X, Loader2, Save } from 'lucide-vue-next'
import api from '@/lib/api'

const props = defineProps<{
  bankId: number
  subject: string
}>()

const emit = defineEmits(['close', 'saved'])

const geminiApiKey = ref(localStorage.getItem('examind_gemini_key') || '')

function saveApiKey() {
  if (geminiApiKey.value) {
    localStorage.setItem('examind_gemini_key', geminiApiKey.value.trim())
  } else {
    localStorage.removeItem('examind_gemini_key')
  }
}

const topicContent = ref('')
const mcqCount = ref(3)
const essayCount = ref(1)
const difficulty = ref('medium')
const loading = ref(false)
const saving = ref(false)
const generatedData = ref<any>(null)

async function handleGenerate() {
  if (!topicContent.value.trim()) {
    alert('Silakan masukkan topik atau ringkasan materi terlebih dahulu.')
    return
  }

  loading.value = true
  try {
    const res = await api.post('/ai/generate-questions', {
      subject: props.subject || 'Umum',
      topic_content: topicContent.value,
      grade_level: '12',
      mcq_count: mcqCount.value,
      essay_count: essayCount.value,
      difficulty: difficulty.value,
      api_key: geminiApiKey.value ? geminiApiKey.value.trim() : undefined,
    })
    generatedData.value = res.data.data
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Gagal menghasilkan soal dengan AI.'
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}

async function handleSaveAllToBank() {
  if (!generatedData.value) return
  saving.value = true

  try {
    // Save MCQs
    for (const mcq of generatedData.value.mcq_questions) {
      await api.post(`/questions/banks/${props.bankId}/items`, {
        question_type: 'multiple_choice',
        prompt: mcq.prompt,
        options_json: mcq.options,
        correct_answer: mcq.correct_option_id,
        explanation: mcq.explanation,
        difficulty: mcq.difficulty,
        default_points: mcq.points,
      })
    }

    // Save Essays
    for (const essay of generatedData.value.essay_questions) {
      await api.post(`/questions/banks/${props.bankId}/items`, {
        question_type: 'long_essay',
        prompt: essay.prompt,
        correct_answer: essay.ideal_answer,
        rubric_json: essay.rubric,
        explanation: essay.explanation,
        difficulty: essay.difficulty,
        default_points: essay.points,
      })
    }

    emit('saved')
    emit('close')
  } catch (err) {
    alert('Gagal menyimpan butir soal ke bank.')
  } finally {
    saving.value = false
  }
}
</script>
