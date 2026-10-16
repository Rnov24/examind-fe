<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
      <div class="flex items-center gap-3.5">
        <router-link to="/exams" class="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs">
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Koreksi Esai & Human-in-the-Loop Override</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Validasi penilaian otomatis AI, sesuaikan nilai dengan rubrik pedagogis guru</p>
        </div>
      </div>
    </div>

    <!-- Mode 1: Exam Session Selection or List -->
    <div v-if="!selectedSessionId" class="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden text-slate-900">
      <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-display text-base font-bold text-slate-900">Daftar Hasil Submission Siswa</h3>
          <p class="text-xs text-slate-500">Pilih lembar pengerjaan siswa untuk meninjau rubrik esai AI</p>
        </div>

        <div class="flex items-center gap-2 no-print">
          <button
            @click="handlePrint"
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer class="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Nilai</span>
          </button>
        </div>
      </div>

      <!-- Printable Official Header (Shown Only on Print) -->
      <div class="print-only p-6 border-b-2 border-slate-900 mb-2">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-black tracking-tight text-slate-900 uppercase">REKAPITULASI NILAI AKHIR SISWA</h1>
            <p class="text-xs text-slate-600 font-medium">Sistem Evaluasi Akademik & Koreksi Esai — EXAMIND Platform</p>
          </div>
          <div class="text-right text-xs text-slate-600">
            <p class="font-bold">Tanggal Cetak: {{ new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</p>
            <p class="text-[10px] font-mono text-slate-400">EXAM-ID: {{ examId }}</p>
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-200 text-xs flex justify-between">
          <p><span class="font-bold text-slate-500">Total Submission:</span> {{ sessionsList.length }} Siswa</p>
          <p><span class="font-bold text-slate-500">Status Penilaian:</span> Human-in-the-Loop Verified</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200 font-mono">
            <tr>
              <th class="px-6 py-4">Nama Siswa</th>
              <th class="px-6 py-4">NISN / Identitas</th>
              <th class="px-6 py-4">Status Sesi</th>
              <th class="px-6 py-4">Nilai Total</th>
              <th class="px-6 py-4">Integritas</th>
              <th class="px-6 py-4">Confidence AI</th>
              <th class="px-6 py-4 text-right no-print">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="s in sessionsList" :key="s.session_id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 font-display font-bold text-slate-900">{{ s.student_name }}</td>
              <td class="px-6 py-4 font-mono text-xs text-slate-600">{{ s.student_identifier }}</td>
              <td class="px-6 py-4">
                <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono shadow-xs"
                  :class="s.status === 'graded' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'"
                >
                  {{ s.status }}
                </span>
              </td>
              <td class="px-6 py-4 font-extrabold text-slate-900 font-mono tabular-nums text-sm">{{ s.total_score }} / 100</td>
              <td class="px-6 py-4">
                <span class="font-bold font-mono tabular-nums" :class="s.integrity_score >= 90 ? 'text-emerald-700' : 'text-rose-600'">
                  {{ s.integrity_score }}%
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize font-mono shadow-xs"
                  :class="s.lowest_confidence_level === 'high' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : s.lowest_confidence_level === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  {{ s.lowest_confidence_level }}
                </span>
              </td>
              <td class="px-6 py-4 text-right no-print">
                <button
                  @click="openSessionReview(s.session_id)"
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover cursor-pointer transition-all font-display tracking-wide"
                >
                  Review & Override
                </button>
              </td>
            </tr>

            <tr v-if="sessionsList.length === 0">
              <td colspan="7" class="p-16 text-center text-slate-500">
                Belum ada submission ujian yang siap dinilai.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Printable Signature Block -->
      <div class="print-only p-6 mt-6 border-t border-slate-300">
        <div class="grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p class="font-medium text-slate-700">Mengetahui,<br>Kepala Sekolah / Kurikulum</p>
            <div class="h-16"></div>
            <p class="font-bold underline text-slate-900">Kepala Sekolah</p>
            <p class="text-[10px] text-slate-500 font-mono">NIP. ........................................</p>
          </div>
          <div>
            <p class="font-medium text-slate-700">Guru Pengampu / Penilai,</p>
            <div class="h-16"></div>
            <p class="font-bold underline text-slate-900">Guru Pengampu Mata Pelajaran</p>
            <p class="text-[10px] text-slate-500 font-mono">EXAMIND Certified Gradebook</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 2: Side-by-Side Review Workspace -->
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between bg-white p-5 px-6 rounded-2xl border border-slate-200/80 shadow-card text-slate-900">
        <div class="flex items-center gap-3.5">
          <button @click="selectedSessionId = null" class="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-xs">
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <h3 class="font-display font-bold text-slate-900 text-lg">{{ sessionDetail?.student_name }}</h3>
            <p class="text-xs text-slate-500 font-mono">NISN: {{ sessionDetail?.student_identifier }} • Nilai Sementara: <strong class="text-slate-900 font-bold tabular-nums">{{ sessionDetail?.total_score }} / {{ sessionDetail?.max_score }}</strong></p>
          </div>
        </div>

        <button @click="selectedSessionId = null" class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition-colors">
          Selesai Meninjau
        </button>
      </div>

      <!-- Answers List -->
      <div class="space-y-6">
        <div
          v-for="(ans, idx) in sessionDetail?.answers || []"
          :key="ans.id"
          class="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-5 text-slate-900"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div class="flex items-center gap-2.5">
              <span class="px-3 py-1 rounded-xl bg-slate-900 font-black text-xs text-white font-mono shadow-xs">
                Nomor {{ idx + 1 }}
              </span>
              <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase font-mono shadow-xs"
                :class="ans.question_type === 'multiple_choice' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
              >
                {{ ans.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai' }}
              </span>
            </div>

            <div class="flex items-center gap-2.5 text-xs font-semibold">
              <span class="text-slate-500 font-mono">Bobot: {{ ans.allocated_points }} Poin</span>
              <span class="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold font-mono border border-emerald-200 shadow-xs tabular-nums">
                Skor Akhir: {{ ans.final_score }} Poin
              </span>
            </div>
          </div>

          <!-- Question Prompt -->
          <div class="font-display text-base font-semibold text-slate-900 leading-relaxed">
            {{ ans.prompt }}
          </div>

          <!-- Multiple Choice Review -->
          <div v-if="ans.question_type === 'multiple_choice'" class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-xs text-slate-500 font-medium">Jawaban Siswa:</span>
              <p class="text-sm font-bold font-mono" :class="ans.is_correct ? 'text-emerald-700' : 'text-rose-700'">
                Pilihan {{ ans.student_response || '(Kosong)' }} — {{ ans.is_correct ? 'BENAR (Kunci: ' + ans.correct_answer + ')' : 'SALAH (Kunci: ' + ans.correct_answer + ')' }}
              </p>
            </div>
          </div>

          <!-- Essay Side-by-Side Review -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <!-- Left: Student Response -->
            <div class="space-y-3 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">Lembar Jawaban Siswa</span>
              <p class="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                {{ ans.student_response || '(Siswa tidak menjawab)' }}
              </p>
            </div>

            <!-- Right: AI Evaluation & Teacher Override Form -->
            <div class="space-y-4 p-6 rounded-2xl bg-indigo-50/40 border border-indigo-200/80">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-900 font-mono">Analisis AI & Rubrik 4D</span>
                <span
                  class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold capitalize font-mono shadow-xs"
                  :class="ans.ai_confidence_level === 'high' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                >
                  Confidence: {{ ans.ai_confidence_level || 'N/A' }}
                </span>
              </div>

              <!-- Rationale -->
              <div class="text-xs text-slate-700 space-y-1.5 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed shadow-xs">
                <p class="font-bold text-indigo-950 font-display">Pertimbangan AI:</p>
                <p>{{ ans.ai_grading_rationale || 'Penilaian otomatis berhasil dihitung berdasarkan rubrik konsep dan kata kunci.' }}</p>
              </div>

              <!-- Teacher Override Input -->
              <div class="space-y-3.5 pt-2">
                <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-700 mb-1.5 font-mono">Skor Guru (Maks: {{ ans.allocated_points }})</label>
                    <input
                      type="number"
                      step="0.5"
                      :max="ans.allocated_points"
                      min="0"
                      v-model.number="overrideForm[ans.id]"
                      class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-mono shadow-xs"
                    />
                  </div>

                  <div class="pt-5">
                    <button
                      @click="acceptAiScore(ans)"
                      class="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer font-mono shadow-xs"
                    >
                      Gunakan Nilai AI ({{ ans.auto_score }})
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5 font-mono">Catatan Koreksi Guru (Opsional)</label>
                  <input
                    type="text"
                    v-model="notesForm[ans.id]"
                    placeholder="Feedback pedagogis untuk siswa..."
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                  />
                </div>

                <div class="flex justify-end pt-1">
                  <button
                    @click="saveOverride(ans.id)"
                    :disabled="savingOverrideMap[ans.id]"
                    class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-1.5 cursor-pointer font-display tracking-wide"
                  >
                    <Loader2 v-if="savingOverrideMap[ans.id]" class="w-3.5 h-3.5 animate-spin" />
                    <Check v-else class="w-3.5 h-3.5 text-[#c2ef4e]" />
                    <span>{{ savingOverrideMap[ans.id] ? 'Menyimpan...' : 'Simpan Nilai Guru' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Check, Printer, Loader2 } from 'lucide-vue-next'
import api from '@/lib/api'

const route = useRoute()
const examId = Number(route.params.id) || 1

const sessionsList = ref<any[]>([])
const selectedSessionId = ref<number | null>(null)
const sessionDetail = ref<any | null>(null)
const overrideForm = ref<Record<number, number>>({})
const notesForm = ref<Record<number, string>>({})
const savingOverrideMap = ref<Record<number, boolean>>({})

function handlePrint(): void {
  window.print()
}

async function loadSessions(): Promise<void> {
  try {
    const res = await api.get(`/grading/exam/${examId}/sessions`)
    sessionsList.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load grading sessions:', err)
  }
}

async function openSessionReview(sessionId: number): Promise<void> {
  selectedSessionId.value = sessionId
  try {
    const res = await api.get(`/grading/session/${sessionId}`)
    sessionDetail.value = res.data.data
    for (const ans of sessionDetail.value.answers || []) {
      overrideForm.value[ans.id] = ans.teacher_override_score !== null && ans.teacher_override_score !== undefined
        ? ans.teacher_override_score
        : ans.final_score
      notesForm.value[ans.id] = ans.teacher_notes || ''
    }
  } catch (err) {
    alert('Gagal memuat detail sesi jawaban.')
  }
}

function acceptAiScore(ans: any): void {
  overrideForm.value[ans.id] = ans.auto_score
}

async function saveOverride(ansId: number): Promise<void> {
  if (savingOverrideMap.value[ansId]) return
  savingOverrideMap.value[ansId] = true
  try {
    const newScore = overrideForm.value[ansId]
    const notes = notesForm.value[ansId]
    await api.put(`/grading/answer/${ansId}/override`, {
      teacher_override_score: newScore,
      teacher_notes: notes,
    })
    const target = sessionDetail.value?.answers.find((a: any) => a.id === ansId)
    if (target) {
      target.final_score = newScore
      target.teacher_override_score = newScore
    }
    alert('Nilai override berhasil disimpan!')
    await loadSessions()
  } catch (err) {
    alert('Gagal menyimpan nilai override.')
  } finally {
    savingOverrideMap.value[ansId] = false
  }
}

onMounted(async () => {
  if (route.params.sessionId) {
    await openSessionReview(Number(route.params.sessionId))
  } else {
    await loadSessions()
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
