<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
      <div class="flex items-center gap-3.5">
        <router-link to="/exams" class="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs">
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{{ examDetail?.title }}</h2>
            <span
              class="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono shadow-xs"
              :class="examDetail?.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'"
            >
              {{ examDetail?.status }}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium font-mono mt-0.5">Kelas: {{ examDetail?.class_name }} • Durasi: {{ examDetail?.duration_minutes }} Menit • Total: <strong class="text-slate-800 tabular-nums">{{ examDetail?.total_points }}</strong> Poin</p>
        </div>
      </div>

      <div class="flex items-center flex-wrap gap-2.5">
        <button
          v-if="examDetail?.status === 'draft'"
          @click="showAddQuestionModal = true"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus class="w-4 h-4 text-slate-600" />
          <span>Pilih Soal dari Bank</span>
        </button>

        <button
          v-if="examDetail?.status === 'draft'"
          @click="handlePublish"
          class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 cursor-pointer transition-all font-display tracking-wide"
        >
          <Send class="w-4 h-4 text-[#c2ef4e]" />
          <span>Publikasikan Ujian</span>
        </button>

        <router-link
          v-if="examDetail?.status === 'published'"
          :to="`/proctoring/exam/${examDetail.id}`"
          class="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Radio class="w-4 h-4 text-rose-600 animate-pulse" />
          <span>Buka Live Monitoring</span>
        </router-link>

        <router-link
          v-if="examDetail && examDetail.status !== 'draft'"
          :to="`/exams/${examDetail.id}/grading`"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckSquare class="w-4 h-4 text-slate-600" />
          <span>Koreksi Esai</span>
        </router-link>

        <router-link
          v-if="examDetail && examDetail.status !== 'draft'"
          :to="`/exams/${examDetail.id}/analytics`"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BarChart3 class="w-4 h-4 text-slate-600" />
          <span>Analisis Soal</span>
        </router-link>
      </div>
    </div>

    <!-- Questions Allocated Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden text-slate-900">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-display text-base font-bold text-slate-900">Alokasi Butir Soal Ujian ({{ examDetail?.exam_questions?.length || 0 }} Butir)</h3>
          <p class="text-xs text-slate-500 font-mono">Total Akumulasi Poin: <strong class="text-slate-800 tabular-nums">{{ examDetail?.total_points || 0 }} / 100 Poin</strong></p>
        </div>
      </div>

      <div class="divide-y divide-slate-100 font-medium">
        <div
          v-for="(eq, idx) in examDetail?.exam_questions"
          :key="eq.id"
          class="p-6 hover:bg-slate-50/80 transition-colors space-y-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
                {{ idx + 1 }}
              </span>
              <span
                class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase font-mono shadow-xs"
                :class="eq.question?.question_type === 'multiple_choice' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
              >
                {{ eq.question?.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai' }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-xl font-mono tabular-nums shadow-xs">
                {{ eq.allocated_points }} Poin
              </span>
              <button
                v-if="examDetail?.status === 'draft'"
                @click="handleRemoveQuestion(eq.question_id)"
                class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                title="Hapus butir soal dari ujian"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <p class="font-display text-sm font-semibold text-slate-900 leading-relaxed">{{ eq.question?.prompt }}</p>

          <div v-if="eq.question?.question_type === 'multiple_choice' && eq.question?.options_json" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div
              v-for="opt in eq.question.options_json"
              :key="opt.id"
              class="p-3 rounded-xl border text-xs transition-colors"
              :class="opt.id === eq.question.correct_answer ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs' : 'bg-slate-50 border-slate-200/80 text-slate-700'"
            >
              <span class="font-bold w-4 font-mono">{{ opt.id }}.</span> {{ opt.text }}
            </div>
          </div>
        </div>

        <div v-if="!examDetail?.exam_questions || examDetail.exam_questions.length === 0" class="p-12 text-center text-slate-500">
          Belum ada butir soal yang dimasukkan ke paket ujian ini. Klik 'Pilih Soal dari Bank' di atas.
        </div>
      </div>
    </div>

    <!-- Modal Attach Questions from Bank -->
    <div v-if="showAddQuestionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4 text-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 class="text-lg font-black text-slate-900">Pilih Butir Soal dari Bank Soal</h3>
            <p class="text-xs text-slate-500">Pilih soal yang ingin dimasukkan ke dalam paket ujian ini</p>
          </div>
          <button
            type="button"
            @click="showAddQuestionModal = false"
            aria-label="Tutup modal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1 font-mono">Pilih Bank Soal</label>
            <select
              v-model="selectedBankId"
              @change="loadBankQuestions"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option :value="null">-- Pilih Bank Soal --</option>
              <option v-for="b in availableBanks" :key="b.id" :value="b.id">
                {{ b.title }} ({{ b.subject }})
              </option>
            </select>
          </div>

          <div v-if="bankQuestions.length > 0" class="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
            <div
              v-for="q in bankQuestions"
              :key="q.id"
              class="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-xs"
            >
              <div class="space-y-1">
                <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold uppercase font-mono">
                  {{ q.question_type === 'multiple_choice' ? 'PG' : 'Esai' }}
                </span>
                <p class="font-semibold text-slate-900 line-clamp-2">{{ q.prompt }}</p>
              </div>

              <button
                @click="handleAddQuestion(q)"
                class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                + Tambah
              </button>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            @click="showAddQuestionModal = false"
            class="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Plus, Send, Radio, Trash2, CheckSquare, BarChart3, X } from 'lucide-vue-next'
import api from '@/lib/api'

const route = useRoute()
const examId = route.params.id

const examDetail = ref<any>(null)
const showAddQuestionModal = ref(false)
const availableBanks = ref<any[]>([])
const selectedBankId = ref<number | null>(null)
const bankQuestions = ref<any[]>([])

async function loadExam() {
  const res = await api.get(`/exams/${examId}`)
  examDetail.value = res.data.data
}

async function loadBanks() {
  const res = await api.get('/questions/banks')
  availableBanks.value = res.data.data || []
}

async function loadBankQuestions() {
  if (!selectedBankId.value) return
  const res = await api.get(`/questions/banks/${selectedBankId.value}`)
  const existingIds = new Set((examDetail.value?.exam_questions || []).map((eq: any) => eq.question_id))
  bankQuestions.value = (res.data.data?.questions || []).filter((q: any) => !existingIds.has(q.id))
}

async function handleAddQuestion(q: any) {
  const nextOrder = (examDetail.value?.exam_questions?.length || 0) + 1
  await api.post(`/exams/${examId}/questions`, {
    question_id: q.id,
    order_index: nextOrder,
    allocated_points: q.default_points || 10.0,
  })
  await loadExam()
  await loadBankQuestions()
}

async function handleRemoveQuestion(qid: number) {
  if (!confirm('Hapus butir soal ini dari paket ujian?')) return
  await api.delete(`/exams/${examId}/questions/${qid}`)
  await loadExam()
}

async function handlePublish() {
  if (!confirm('Publikasikan paket ujian ini untuk kelas target sekarang?')) return
  try {
    await api.post(`/exams/${examId}/publish`)
    await loadExam()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mempublikasikan ujian.')
  }
}

onMounted(async () => {
  await loadExam()
  await loadBanks()
})
</script>
