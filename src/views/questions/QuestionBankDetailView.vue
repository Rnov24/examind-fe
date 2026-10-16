<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link to="/questions" class="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs">
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ bankDetail?.title }}</h2>
          <p class="text-xs text-slate-500 font-medium font-mono">Mata Pelajaran: {{ bankDetail?.subject }} • Total: {{ bankDetail?.questions?.length || 0 }} Butir Soal</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showAIModal = true"
          class="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Sparkles class="w-4 h-4 text-[#c2ef4e]" />
          <span>Generate dengan AI</span>
        </button>
        <button
          @click="showManualModal = true"
          class="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Manual</span>
        </button>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4">
      <div
        v-for="(q, idx) in bankDetail?.questions"
        :key="q.id"
        class="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 text-slate-900"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 font-black text-xs text-slate-800 flex items-center justify-center font-mono">
              {{ idx + 1 }}
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase font-mono"
              :class="q.question_type === 'multiple_choice' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
            >
              {{ q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai' }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-600 capitalize font-mono">
              {{ q.difficulty }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-500 font-mono">{{ q.default_points }} Poin</span>
            <button
              @click="handleDeleteQuestion(q.id)"
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p class="text-sm font-semibold text-slate-900 leading-relaxed">{{ q.prompt }}</p>

        <!-- Options for MCQ -->
        <div v-if="q.question_type === 'multiple_choice' && q.options_json" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <div
            v-for="opt in q.options_json"
            :key="opt.id"
            class="p-2.5 rounded-lg border text-xs flex items-center gap-2"
            :class="opt.id === q.correct_answer ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'"
          >
            <span class="w-5 font-black font-mono">{{ opt.id }}.</span>
            <span>{{ opt.text }}</span>
          </div>
        </div>

        <!-- Rubric for Essay -->
        <div v-if="q.question_type !== 'multiple_choice' && q.rubric_json" class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900">
          <p class="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 font-mono">Rubrik 4 Dimensi:</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
              <span class="font-bold block text-slate-900 font-mono">Konsep (40%)</span>
              <span class="text-slate-500 text-[10px] mt-0.5 block">{{ q.rubric_json.dimension_1_concept?.criteria }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
              <span class="font-bold block text-slate-900 font-mono">Argumen (30%)</span>
              <span class="text-slate-500 text-[10px] mt-0.5 block">{{ q.rubric_json.dimension_2_argument?.criteria }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
              <span class="font-bold block text-slate-900 font-mono">Terminologi (15%)</span>
              <span class="text-slate-500 text-[10px] mt-0.5 block">{{ q.rubric_json.dimension_3_terminology?.criteria }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
              <span class="font-bold block text-slate-900 font-mono">Kejelasan (15%)</span>
              <span class="text-slate-500 text-[10px] mt-0.5 block">{{ q.rubric_json.dimension_4_clarity?.criteria }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!bankDetail?.questions || bankDetail.questions.length === 0" class="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300 text-slate-900">
        <BookOpen class="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h4 class="font-bold text-slate-900">Bank Soal Masih Kosong</h4>
        <p class="text-xs text-slate-500 mt-1">Gunakan tombol 'Generate dengan AI' untuk membuat draft paket soal secara instan.</p>
      </div>
    </div>

    <!-- AI Generator Modal -->
    <AIGeneratorModal
      v-if="showAIModal"
      :bank-id="Number(bankId)"
      :subject="bankDetail?.subject || 'Fisika'"
      @close="showAIModal = false"
      @saved="loadDetail"
    />

    <!-- Manual Question Creation Modal -->
    <div v-if="showManualModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 class="text-lg font-black text-slate-900">Tambah Butir Soal Manual</h3>
            <p class="text-xs text-slate-500">Rancang butir soal PG atau esai langsung ke bank soal ini</p>
          </div>
          <button
            type="button"
            @click="showManualModal = false"
            aria-label="Tutup modal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleSaveManualQuestion" class="space-y-4 text-xs font-medium">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1 font-mono">Tipe Soal</label>
              <select
                v-model="manualForm.question_type"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
              >
                <option value="multiple_choice">Pilihan Ganda (PG)</option>
                <option value="short_essay">Esai Singkat</option>
                <option value="long_essay">Esai Panjang</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1 font-mono">Tingkat Kesulitan</label>
              <select
                v-model="manualForm.difficulty"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
              >
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sulit</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1 font-mono">Alokasi Poin</label>
              <input
                v-model.number="manualForm.default_points"
                type="number"
                min="1"
                max="100"
                step="0.5"
                required
                class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-mono font-medium focus:bg-white focus:border-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1 font-mono">Teks Pertanyaan / Soal</label>
            <textarea
              v-model="manualForm.prompt"
              rows="3"
              required
              placeholder="Tuliskan teks pertanyaan atau instruksi tugas secara rinci..."
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 outline-none leading-relaxed"
            ></textarea>
          </div>

          <!-- Multiple Choice Options -->
          <div v-if="manualForm.question_type === 'multiple_choice'" class="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 uppercase tracking-wider font-mono text-[11px]">Pilihan Opsi & Kunci Jawaban</span>
              <span class="text-[11px] text-slate-500">Pilih opsi yang merupakan kunci jawaban</span>
            </div>

            <div class="space-y-2">
              <div
                v-for="opt in manualForm.options"
                :key="opt.id"
                class="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200"
              >
                <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    :value="opt.id"
                    v-model="manualForm.correct_answer"
                    name="manual_correct_opt"
                    class="w-4 h-4 text-slate-900"
                  />
                  <span class="font-mono font-bold text-xs w-4">{{ opt.id }}.</span>
                </label>
                <input
                  v-model="opt.text"
                  type="text"
                  required
                  :placeholder="`Isi pilihan ${opt.id}...`"
                  class="flex-1 px-2.5 py-1 text-xs border-0 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <!-- Essay Rubric Note -->
          <div v-else class="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900 text-[11px] leading-relaxed">
            <span class="font-bold font-mono uppercase block mb-0.5">Pedoman Penilaian Esai:</span>
            Sistem evaluasi EXAMIND akan menerapkan Rubrik 4 Dimensi otomatis (Konsep 40%, Argumen 30%, Terminologi 15%, Kejelasan 15%) saat grading dengan AI dan verifikasi guru.
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1 font-mono">Penjelasan / Pembahasan Konsep (Opsional)</label>
            <textarea
              v-model="manualForm.explanation"
              rows="2"
              placeholder="Uraian konsep kunci atau pembahasan mengapa jawaban tersebut benar..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900 outline-none leading-relaxed"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              @click="showManualModal = false"
              class="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 cursor-pointer shadow-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSavingManual"
              class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Loader2 v-if="isSavingManual" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSavingManual ? 'Menyimpan...' : 'Simpan Butir Soal' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Plus, Sparkles, Trash2, BookOpen, X, Loader2 } from 'lucide-vue-next'
import api from '@/lib/api'
import AIGeneratorModal from './AIGeneratorModal.vue'

const route = useRoute()
const bankId = route.params.id

const bankDetail = ref<any>(null)
const showAIModal = ref(false)
const showManualModal = ref(false)
const isSavingManual = ref(false)

const manualForm = ref({
  question_type: 'multiple_choice',
  difficulty: 'medium',
  default_points: 10,
  prompt: '',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ],
  correct_answer: 'A',
  explanation: '',
})

async function loadDetail() {
  const res = await api.get(`/questions/banks/${bankId}`)
  bankDetail.value = res.data.data
}

async function handleDeleteQuestion(qid: number) {
  if (!confirm('Hapus butir soal ini dari bank?')) return
  await api.delete(`/questions/items/${qid}`)
  await loadDetail()
}

async function handleSaveManualQuestion() {
  if (isSavingManual.value) return
  isSavingManual.value = true
  try {
    const payload: any = {
      bank_id: Number(bankId),
      question_type: manualForm.value.question_type,
      prompt: manualForm.value.prompt,
      difficulty: manualForm.value.difficulty,
      default_points: Number(manualForm.value.default_points) || 10,
      explanation: manualForm.value.explanation || null,
    }

    if (manualForm.value.question_type === 'multiple_choice') {
      payload.options_json = manualForm.value.options.map(opt => ({
        id: opt.id,
        text: opt.text,
      }))
      payload.correct_answer = manualForm.value.correct_answer
    }

    await api.post(`/questions/banks/${bankId}/items`, payload)
    showManualModal.value = false
    manualForm.value = {
      question_type: 'multiple_choice',
      difficulty: 'medium',
      default_points: 10,
      prompt: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correct_answer: 'A',
      explanation: '',
    }
    await loadDetail()
  } catch (err: any) {
    console.error('Failed to create question manually:', err)
    alert(err?.response?.data?.message || 'Gagal menyimpan butir soal.')
  } finally {
    isSavingManual.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>
