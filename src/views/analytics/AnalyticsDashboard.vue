<template>
  <div class="space-y-6">
    <!-- Header & Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
      <div class="flex items-center gap-3.5">
        <router-link to="/exams" class="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors">
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Analisis Butir Soal & Laporan Resmi</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Evaluasi statistik psikometrik butir soal dan ekspor Berita Acara ujian</p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap no-print">
        <button
          @click="handlePrint"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer class="w-4 h-4 text-slate-600" />
          <span>Cetak Rekap Nilai</span>
        </button>

        <button
          @click="downloadExcel"
          :disabled="isDownloadingExcel"
          class="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Loader2 v-if="isDownloadingExcel" class="w-4 h-4 animate-spin text-emerald-600" />
          <FileSpreadsheet v-else class="w-4 h-4 text-emerald-600" />
          <span>{{ isDownloadingExcel ? 'Mengunduh...' : 'Unduh Excel' }}</span>
        </button>

        <button
          @click="downloadPdf"
          :disabled="isDownloadingPdf"
          class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
        >
          <Loader2 v-if="isDownloadingPdf" class="w-4 h-4 animate-spin text-[#c2ef4e]" />
          <FileText v-else class="w-4 h-4 text-[#c2ef4e]" />
          <span>{{ isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF Berita Acara' }}</span>
        </button>
      </div>
    </div>

    <!-- Printable Official Header (Shown Only on Print) -->
    <div class="print-only border-b-2 border-slate-900 pb-4 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black tracking-tight text-slate-900 uppercase">LAPORAN REKAPITULASI EVALUASI & STATISTIK UJIAN</h1>
          <p class="text-xs text-slate-600 font-medium">Sistem Evaluasi Akademik Terpadu — EXAMIND Platform</p>
        </div>
        <div class="text-right text-xs text-slate-600">
          <p class="font-bold">Tanggal Cetak: {{ new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</p>
          <p class="text-[10px] font-mono text-slate-400">EXAM-ID: {{ examId }}</p>
        </div>
      </div>
      <div class="mt-3 pt-2 border-t border-slate-200 text-xs flex justify-between">
        <p><span class="font-bold text-slate-500">Paket Ujian:</span> {{ allExams.find(e => e.id === examId)?.title || `Ujian #${examId}` }}</p>
        <p><span class="font-bold text-slate-500">Total Peserta:</span> {{ analyticsData?.total_submissions || 0 }} Siswa</p>
        <p><span class="font-bold text-slate-500">Rata-rata Nilai:</span> {{ analyticsData?.average_score || 0 }}</p>
        <p><span class="font-bold text-slate-500">Ketuntasan KKM:</span> {{ analyticsData?.mastery_percentage || 0 }}%</p>
      </div>
    </div>

    <!-- Exam Selector if coming from /analytics -->
    <div v-if="allExams.length > 1" class="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-3 text-slate-800">
      <span class="text-xs font-bold text-slate-500 uppercase font-mono">Pilih Paket Ujian:</span>
      <select
        v-model="selectedExamId"
        @change="handleExamChange"
        class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-slate-400 text-slate-900 font-sans shadow-xs"
      >
        <option v-for="e in allExams" :key="e.id" :value="e.id" class="bg-white text-slate-900">
          {{ e.title }} ({{ e.class_name }})
        </option>
      </select>
    </div>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Rata-Rata Kelas</span>
        <div class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
          {{ analyticsData?.average_score ?? 0 }}
        </div>
        <p class="text-[11px] text-slate-400 font-mono">Dari total {{ analyticsData?.total_examinees ?? analyticsData?.total_submissions ?? 0 }} siswa dinilai</p>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Ketuntasan KKM (70.0)</span>
        <div class="flex items-baseline gap-2.5">
          <span class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {{ analyticsData?.pass_rate ?? analyticsData?.mastery_percentage ?? 0 }}%
          </span>
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#c2ef4e] text-slate-950 font-mono shadow-xs">
            TUNTAS
          </span>
        </div>
        <p class="text-[11px] text-slate-400">Standar Kurikulum Nasional</p>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Nilai Tertinggi / Terendah</span>
        <div class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
          {{ analyticsData?.highest_score ?? 0 }} <span class="text-lg text-slate-400 font-normal">/ {{ analyticsData?.lowest_score ?? 0 }}</span>
        </div>
        <p class="text-[11px] text-slate-400">Rentang sebaran nilai siswa</p>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Standar Deviasi</span>
        <div class="font-display text-3xl font-extrabold text-indigo-700 tracking-tight tabular-nums">
          {{ analyticsData?.std_deviation ?? analyticsData?.standard_deviation ?? 0 }}
        </div>
        <p class="text-[11px] text-slate-400">Tingkat homogenitas kelas</p>
      </div>
    </div>

    <!-- Score Distribution Histogram Curve -->
    <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-card space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-display text-base font-bold text-slate-900">Kurva Distribusi Nilai Kelas</h3>
          <p class="text-xs text-slate-500">Frekuensi perolehan rentang skor peserta ujian</p>
        </div>
      </div>

      <div class="h-52 flex items-end justify-between gap-3 sm:gap-4 pt-8 px-4 border-b border-slate-100">
        <div
          v-for="(bin, idx) in distributionBins"
          :key="idx"
          class="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
        >
          <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 font-mono tabular-nums transition-colors">{{ bin.count }} Siswa</div>
          <div
            class="w-full rounded-t-xl transition-all duration-200 group-hover:scale-y-105"
            :class="bin.count === maxBinCount && bin.count > 0 ? 'bg-[#c2ef4e] border-t-2 border-[#addc3b] shadow-xs' : 'bg-slate-900 group-hover:bg-slate-800'"
            :style="{ height: `${Math.max(14, (bin.count / maxBinCount) * 130)}px` }"
          ></div>
          <div class="text-[10px] font-semibold text-slate-500 group-hover:text-slate-900 text-center font-mono pt-1">{{ bin.range }}</div>
        </div>
      </div>
    </div>

    <!-- Item Analysis Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-display text-base font-bold text-slate-900">Tabel Analisis Butir Soal (Item Psychometrics)</h3>
          <p class="text-xs text-slate-500">Korelasi tingkat kesukaran dan daya pembeda butir soal</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">No</th>
              <th class="px-6 py-4">Tipe Soal</th>
              <th class="px-6 py-4">Butir Soal</th>
              <th class="px-6 py-4">Tingkat Kesukaran</th>
              <th class="px-6 py-4">Daya Pembeda</th>
              <th class="px-6 py-4">Rekomendasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="(item, idx) in analyticsData?.item_analysis || []" :key="item.question_id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-900 font-mono">{{ idx + 1 }}</td>
              <td class="px-6 py-4">
                <span
                  class="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase font-mono shadow-xs"
                  :class="item.question_type === 'multiple_choice' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
                >
                  {{ item.question_type === 'multiple_choice' ? 'PG' : 'Esai' }}
                </span>
              </td>
              <td class="px-6 py-4 max-w-xs truncate text-slate-900 font-medium">{{ item.prompt }}</td>
              <td class="px-6 py-4">
                <span class="font-bold text-slate-900 font-mono tabular-nums">{{ item.difficulty_index }}</span>
                <span class="text-xs text-slate-400 block capitalize font-mono">({{ item.difficulty_category }})</span>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-slate-900 font-mono tabular-nums">{{ item.discrimination_index }}</span>
                <span class="text-xs text-slate-400 block capitalize font-mono">({{ item.discrimination_category }})</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-xl text-xs font-bold font-mono inline-block shadow-xs"
                  :class="item.status === 'good' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : item.status === 'revise' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  {{ item.status === 'good' ? 'Sangat Baik' : item.status === 'revise' ? 'Perlu Revisi' : 'Gugur' }}
                </span>
              </td>
            </tr>

            <tr v-if="!analyticsData?.item_analysis?.length">
              <td colspan="6" class="p-16 text-center text-slate-400 text-xs">
                Data analisis butir soal belum tersedia atau siswa belum mengumpulkan ujian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Printable Official Signature Block -->
    <div class="print-only mt-10 pt-6 border-t border-slate-300">
      <div class="grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <p class="font-medium text-slate-700">Mengetahui,<br>Kepala Sekolah / Wakil Kurikulum</p>
          <div class="h-16"></div>
          <p class="font-bold underline text-slate-900">Kepala Sekolah / Kurikulum</p>
          <p class="text-[10px] text-slate-500 font-mono">NIP. ........................................</p>
        </div>
        <div>
          <p class="font-medium text-slate-700">Guru Pengampu / Pengawas Ujian,</p>
          <div class="h-16"></div>
          <p class="font-bold underline text-slate-900">Guru Pengampu Mata Pelajaran</p>
          <p class="text-[10px] text-slate-500 font-mono">EXAMIND Certified System Report</p>
        </div>
      </div>
      <div class="mt-8 text-center text-[10px] text-slate-400 font-mono">
        Rekapitulasi nilai dan analisis psikometrik ini dicetak secara sah melalui platform evaluasi akademik EXAMIND.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-vue-next'
import api from '@/lib/api'

const route = useRoute()
const router = useRouter()

const examId = ref<number>(Number(route.params.id) || 1)
const selectedExamId = ref<number>(examId.value)
const allExams = ref<any[]>([])
const analyticsData = ref<any | null>(null)
const isDownloadingExcel = ref(false)
const isDownloadingPdf = ref(false)

const distributionBins = computed<Array<{ range: string; count: number }>>(() => {
  if (analyticsData.value?.score_distribution) {
    const dist = analyticsData.value.score_distribution
    return Object.entries(dist).map(([range, count]) => ({
      range,
      count: Number(count) || 0,
    }))
  }
  return [
    { range: '0-49', count: 0 },
    { range: '50-69', count: 0 },
    { range: '70-84', count: 0 },
    { range: '85-100', count: 0 },
  ]
})

const maxBinCount = computed(() => {
  return Math.max(...distributionBins.value.map(b => b.count), 1)
})

function handlePrint(): void {
  window.print()
}

async function downloadExcel(): Promise<void> {
  if (isDownloadingExcel.value) return
  isDownloadingExcel.value = true
  try {
    const res = await api.get(`/analytics/exam/${examId.value}/export/excel`, {
      responseType: 'blob',
    })
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rekap_nilai_exam_${examId.value}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download Excel report:', err)
    alert('Gagal mengunduh berkas Excel. Pastikan ujian memiliki data nilai.')
  } finally {
    isDownloadingExcel.value = false
  }
}

async function downloadPdf(): Promise<void> {
  if (isDownloadingPdf.value) return
  isDownloadingPdf.value = true
  try {
    const res = await api.get(`/analytics/exam/${examId.value}/export/pdf`, {
      responseType: 'blob',
    })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `berita_acara_exam_${examId.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download PDF report:', err)
    alert('Gagal mengunduh berkas Berita Acara PDF.')
  } finally {
    isDownloadingPdf.value = false
  }
}

async function loadExamsList(): Promise<void> {
  try {
    const res = await api.get('/exams')
    allExams.value = res.data.data || []
  } catch (err) {
    console.warn('Failed to load exams list:', err)
  }
}

async function loadAnalytics(id: number): Promise<void> {
  try {
    const res = await api.get(`/analytics/exam/${id}/items`)
    analyticsData.value = res.data.data
  } catch (err) {
    console.error('Failed to load analytics:', err)
  }
}

function handleExamChange(): void {
  examId.value = selectedExamId.value
  router.push(`/exams/${examId.value}/analytics`)
  loadAnalytics(examId.value)
}

onMounted(async () => {
  await loadExamsList()
  await loadAnalytics(examId.value)
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
