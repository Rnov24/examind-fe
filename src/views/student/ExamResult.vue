<template>
  <div class="space-y-6 max-w-4xl mx-auto py-6 px-4 font-sans">
    <!-- Header Back & Print Actions -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
      <router-link to="/student/dashboard" class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft class="w-4 h-4" />
        <span>Kembali ke Beranda Siswa</span>
      </router-link>

      <div class="flex items-center gap-2">
        <button
          @click="handlePrint"
          class="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer class="w-4 h-4 text-slate-700" />
          <span>Cetak Lembar Nilai</span>
        </button>

        <button
          @click="downloadPdf"
          :disabled="isDownloadingPdf"
          class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <FileText class="w-4 h-4 text-rose-400" />
          <span>{{ isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF Transkrip' }}</span>
        </button>

        <span
          class="px-3 py-1 rounded-full text-xs font-bold uppercase border font-mono"
          :class="{
            'bg-rose-50 text-rose-700 border-rose-200': resultData?.status === 'aborted',
            'bg-emerald-50 text-emerald-700 border-emerald-200': resultData?.status === 'graded',
            'bg-amber-50 text-amber-700 border-amber-200': resultData?.status !== 'aborted' && resultData?.status !== 'graded',
          }"
        >
          {{ resultData?.status === 'aborted' ? 'Didiskualifikasi Pengawas' : resultData?.status === 'graded' ? 'Selesai Dinilai' : 'Dalam Evaluasi Guru' }}
        </span>
      </div>
    </div>

    <!-- Printable Official Header (Shown Only on Print) -->
    <div class="print-only border-b-2 border-slate-900 pb-4 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black tracking-tight text-slate-900 uppercase">LEMBAR HASIL EVALUASI UJIAN SISWA</h1>
          <p class="text-xs text-slate-600 font-medium">Sistem Evaluasi Akademik Online — EXAMIND Platform</p>
        </div>
        <div class="text-right text-xs text-slate-600">
          <p class="font-bold">Tanggal Cetak: {{ new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</p>
          <p class="text-[10px] font-mono text-slate-400">DOC-REF: EXM-{{ examId }}-{{ resultData?.session_id || '0' }}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200 text-xs">
        <div>
          <p><span class="font-bold text-slate-500">Nama Siswa:</span> {{ resultData?.student_name }}</p>
          <p><span class="font-bold text-slate-500">NISN / Identitas:</span> {{ resultData?.student_identifier }}</p>
          <p><span class="font-bold text-slate-500">Mata Pelajaran:</span> {{ resultData?.exam_title }}</p>
        </div>
        <div>
          <p><span class="font-bold text-slate-500">Kelas:</span> {{ resultData?.subject }}</p>
          <p><span class="font-bold text-slate-500">Waktu Selesai:</span> {{ formatTime(resultData?.submit_time) }}</p>
          <p><span class="font-bold text-slate-500">Skor Integritas:</span> {{ resultData?.integrity_score }}%</p>
        </div>
      </div>
    </div>

    <!-- Deliberate Disqualification Notice (Human-in-the-Loop) -->
    <div v-if="resultData?.status === 'aborted'" class="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4 shadow-xs">
      <div class="p-2.5 rounded-lg bg-rose-600 text-white shrink-0">
        <ShieldAlert class="w-5 h-5" />
      </div>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h3 class="text-base font-black text-rose-900 tracking-tight font-mono">Keputusan Diskualifikasi oleh Pengawas Ujian</h3>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 uppercase font-mono">Resmi</span>
        </div>
        <p class="text-xs text-rose-800 leading-relaxed font-medium">
          Berdasarkan hasil peninjauan langsung atas catatan log anomali dan konfirmasi manual pengawas sekolah, sesi pengerjaan ini telah diputuskan untuk didiskualifikasi secara resmi. Seluruh hasil pengerjaan dibatalkan dengan nilai akhir 0.00.
        </p>
      </div>
    </div>

    <!-- Human-in-the-Loop Integrity Review Informative Banner -->
    <div v-else-if="resultData?.integrity_score < 80" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5 shadow-xs">
      <div class="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
        <AlertTriangle class="w-4 h-4" />
      </div>
      <div class="space-y-0.5">
        <h4 class="text-xs font-bold text-amber-950 font-mono">Tinjauan Integritas Sedang Berlangsung</h4>
        <p class="text-[11px] text-amber-800 leading-relaxed font-medium">
          Sistem mencatat beberapa pergerakan atau anomali kamera selama ujian (Skor Integritas: {{ resultData?.integrity_score }}%). Sesuai prinsip Human-in-the-Loop EXAMIND, hasil pengerjaan Anda tetap tersimpan utuh dan sedang ditinjau secara adil oleh guru pengampu sebelum finalisasi nilai rapor.
        </p>
      </div>
    </div>

    <!-- Hero Score Summary Card -->
    <div class="bg-white rounded-xl p-6 text-slate-900 shadow-xs border border-slate-200">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200 font-mono">
              Lembar Hasil Ujian
            </span>
            <span class="text-xs text-slate-500 font-mono">ID: EXM-{{ examId }}</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-slate-900">{{ resultData?.exam_title }}</h2>
          <p class="text-slate-500 text-xs">
            Peserta: <strong class="text-slate-800">{{ resultData?.student_name }}</strong> • Selesai: {{ formatTime(resultData?.submit_time) }}
          </p>
        </div>

        <!-- Big Score Pill -->
        <div class="flex items-center gap-5 bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl shadow-xs">
          <div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Nilai Akhir</div>
            <div
              class="text-3xl font-extrabold tracking-tight tabular-nums font-mono"
              :class="resultData?.status === 'aborted' ? 'text-rose-600' : 'text-slate-900'"
            >
              {{ resultData?.total_score }} <span class="text-sm text-slate-500 font-normal">/ {{ resultData?.max_score }}</span>
            </div>
          </div>

          <div class="w-px h-10 bg-slate-200"></div>

          <div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Integritas</div>
            <div
              class="text-2xl font-bold tabular-nums font-mono"
              :class="resultData?.status === 'aborted' ? 'text-rose-600' : 'text-emerald-700'"
            >
              {{ resultData?.integrity_score }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Explanations & Item Review -->
    <div class="space-y-3.5">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Pembahasan & Evaluasi Pembelajaran</h3>
        <p class="text-xs text-slate-500">Penjelasan konseptual dan umpan balik formatif</p>
      </div>

      <div class="space-y-3.5">
        <div
          v-for="(ans, idx) in resultData?.answers || []"
          :key="ans.id"
          class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5"
        >
          <!-- Item Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-slate-100 font-black text-xs text-slate-800 border border-slate-200 flex items-center justify-center font-mono">
                {{ idx + 1 }}
              </span>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase font-mono"
                :class="ans.question_type === 'multiple_choice' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
              >
                {{ ans.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai' }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="ans.question_type === 'multiple_choice'"
                class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                :class="ans.is_correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
              >
                {{ ans.is_correct ? 'Jawaban Benar' : 'Jawaban Salah' }} (Skor: {{ ans.final_score }}/{{ ans.allocated_points }})
              </span>
              <span v-else class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                Skor: {{ ans.final_score }} / {{ ans.allocated_points }} Poin
              </span>
            </div>
          </div>

          <!-- Prompt -->
          <div class="text-sm font-semibold text-slate-900 leading-relaxed">
            {{ ans.prompt }}
          </div>

          <!-- Multiple Choice Breakdown -->
          <div v-if="ans.question_type === 'multiple_choice'" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 font-medium block">Pilihan Anda:</span>
                <span class="font-bold text-slate-900">{{ ans.student_response || '(Kosong)' }}</span>
              </div>
              <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span class="text-emerald-700 font-medium block">Kunci Jawaban:</span>
                <span class="font-bold text-emerald-900">{{ ans.correct_answer }}</span>
              </div>
            </div>

            <!-- Formative AI Explanation -->
            <div v-if="ans.ai_explanation" class="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
              <span class="font-bold text-indigo-900 flex items-center gap-1.5 font-mono">
                <Lightbulb class="w-3.5 h-3.5 text-indigo-700" />
                Penjelasan Konsep Pedagogis:
              </span>
              <p class="text-slate-800 leading-relaxed">{{ ans.ai_explanation }}</p>
            </div>
          </div>

          <!-- Essay Breakdown -->
          <div v-else class="space-y-3">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span class="text-slate-500 font-bold uppercase font-mono">Jawaban Anda:</span>
              <p class="text-slate-800 whitespace-pre-line leading-relaxed">{{ ans.student_response || '(Tidak dijawab)' }}</p>
            </div>

            <div v-if="ans.ai_explanation || ans.ai_grading_rationale" class="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
              <span class="font-bold text-indigo-900 flex items-center gap-1.5 font-mono">
                <Sparkles class="w-3.5 h-3.5 text-indigo-700" />
                Evaluasi & Pembahasan Esai:
              </span>
              <p class="text-slate-800 leading-relaxed">{{ ans.ai_explanation || ans.ai_grading_rationale }}</p>
            </div>

            <div v-if="ans.teacher_notes" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <span class="font-bold text-amber-900 font-mono">Catatan dari Guru:</span>
              <p class="text-amber-800 leading-relaxed">{{ ans.teacher_notes }}</p>
            </div>
          </div>

          <!-- Question-Level Explanation Chatbot -->
          <QuestionExplanationChat
            :exam-id="resultData?.exam_id || examId"
            :question-id="ans.question_id"
            :question-number="idx + 1"
            :question-prompt="ans.prompt"
            :question-type="ans.question_type"
            :is-correct="ans.is_correct"
            :student-response="ans.student_response"
            :correct-answer="ans.correct_answer"
            :official-explanation="ans.ai_explanation"
            :final-score="ans.final_score"
            :allocated-points="ans.allocated_points"
          />
        </div>
      </div>
    </div>

    <!-- Printable Signature & Validation Footer (Shown Only on Print) -->
    <div class="print-only mt-10 pt-8 border-t border-slate-200">
      <div class="grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <p class="font-medium text-slate-600">Peserta Ujian,</p>
          <div class="h-16"></div>
          <p class="font-bold underline text-slate-900">{{ resultData?.student_name }}</p>
          <p class="text-[10px] text-slate-500 font-mono">NISN: {{ resultData?.student_identifier }}</p>
        </div>
        <div>
          <p class="font-medium text-slate-600">Mengetahui,<br>Pengawas / Guru Pengampu</p>
          <div class="h-16"></div>
          <p class="font-bold underline text-slate-900">Guru Pengampu Mata Pelajaran</p>
          <p class="text-[10px] text-slate-500">EXAMIND Certified System</p>
        </div>
      </div>
      <div class="mt-8 text-center text-[10px] text-slate-400 font-mono">
        Lembar ini dicetak melalui Sistem Evaluasi Ujian EXAMIND secara digital dan sah sebagai bukti evaluasi akademik.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Lightbulb, Sparkles, ShieldAlert, AlertTriangle, Printer, FileText } from 'lucide-vue-next'
import api from '@/lib/api'
import QuestionExplanationChat from '@/views/student/components/QuestionExplanationChat.vue'

const route = useRoute()
const examId = Number(route.params.examId || route.params.id)
const resultData = ref<any | null>(null)
const isDownloadingPdf = ref(false)

function formatTime(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function handlePrint() {
  window.print()
}

async function downloadPdf() {
  try {
    isDownloadingPdf.value = true
    const response = await api.get(`/student/exam/${examId}/export/pdf`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transkrip_nilai_${resultData.value?.student_identifier || 'siswa'}_exam_${examId}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Gagal mengunduh PDF transkrip:', err)
  } finally {
    isDownloadingPdf.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/student/exam/${examId}/result`)
    resultData.value = res.data.data
  } catch (err) {
    console.error('Failed to load exam result:', err)
  }
})
</script>

<style scoped>
.print-only {
  display: none;
}

@media print {
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  body {
    background: white !important;
    color: black !important;
  }
}
</style>
