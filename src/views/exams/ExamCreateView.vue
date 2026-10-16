<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/exams" class="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs">
        <ArrowLeft class="w-4 h-4" />
      </router-link>
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Buat Paket Ujian Baru</h2>
        <p class="text-xs text-slate-500 font-medium">Konfigurasikan judul, kelas target, jadwal, durasi, dan tingkat pengawasan proctoring</p>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs text-slate-900">
      <form @submit.prevent="handleCreateExam" class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Judul Ujian</label>
          <input
            v-model="title"
            type="text"
            required
            placeholder="Contoh: Ujian Tengah Semester Fisika Kuantum XII MIPA"
            class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Deskripsi / Petunjuk Pengerjaan</label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Petunjuk khusus ujian..."
            class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none placeholder:text-slate-400"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Pilih Kelas Target</label>
            <select
              v-model="classId"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option :value="null">-- Pilih Rombel Kelas --</option>
              <option v-for="c in classes" :key="c.id" :value="c.id">
                {{ c.name }} (Tingkat {{ c.grade_level }} - {{ c.members_count }} Siswa)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Durasi Pengerjaan (Menit)</label>
            <input
              v-model.number="durationMinutes"
              type="number"
              min="5"
              max="300"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Waktu Mulai Buka Ujian</label>
            <input
              v-model="startTime"
              type="datetime-local"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 font-mono">Waktu Batas Akhir Penutupan</label>
            <input
              v-model="endTime"
              type="datetime-local"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>
        </div>

        <!-- Policy Settings -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">Kebijakan Pengawasan & Pembahasan</h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1 font-mono">Tingkat Pengawasan AI</label>
              <select
                v-model="proctoringLevel"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none bg-white text-slate-900"
              >
                <option value="dual_camera">Dual-Camera (Kamera Laptop + HP Sekunder)</option>
                <option value="single_camera">Single-Camera (Hanya Kamera Depan Laptop)</option>
                <option value="disabled">Nonaktifkan Proctoring</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1 font-mono">Kebijakan Rilis Pembahasan</label>
              <select
                v-model="explanationPolicy"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none bg-white text-slate-900"
              >
                <option value="after_exam_closed">Setelah Ujian Ditutup / Dinilai</option>
                <option value="instant">Seketika Setelah Siswa Mengumpulkan</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-6 pt-2">
            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
              <input v-model="randomizeQuestions" type="checkbox" class="w-4 h-4 rounded text-slate-900 bg-white border-slate-300 focus:ring-slate-900" />
              <span>Acak Urutan Soal Siswa</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
              <input v-model="randomizeOptions" type="checkbox" class="w-4 h-4 rounded text-slate-900 bg-white border-slate-300 focus:ring-slate-900" />
              <span>Acak Opsi Pilihan Ganda</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <router-link
            to="/exams"
            class="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
          >
            Batal
          </router-link>
          <button
            type="submit"
            :disabled="loading || !classId"
            class="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
          >
            {{ loading ? 'Menyimpan...' : 'Lanjut ke Pemilihan Butir Soal →' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import api from '@/lib/api'

const router = useRouter()

const title = ref('')
const description = ref('')
const classId = ref<number | null>(null)
const durationMinutes = ref(90)
const startTime = ref('')
const endTime = ref('')
const proctoringLevel = ref('dual_camera')
const explanationPolicy = ref('after_exam_closed')
const randomizeQuestions = ref(true)
const randomizeOptions = ref(true)
const loading = ref(false)
const classes = ref<any[]>([])

onMounted(async () => {
  const now = new Date()
  const later = new Date(now.getTime() + 4 * 60 * 60 * 1000)

  // Format to local ISO string YYYY-MM-DDTHH:mm
  startTime.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  endTime.value = new Date(later.getTime() - later.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  const res = await api.get('/academic/classes')
  classes.value = res.data.data || []
  if (classes.value.length > 0) {
    classId.value = classes.value[0].id
  }
})

async function handleCreateExam() {
  if (!classId.value) return
  loading.value = true

  try {
    const res = await api.post('/exams', {
      title: title.value,
      description: description.value,
      class_id: classId.value,
      duration_minutes: durationMinutes.value,
      start_time: new Date(startTime.value).toISOString(),
      end_time: new Date(endTime.value).toISOString(),
      proctoring_level: proctoringLevel.value,
      explanation_policy: explanationPolicy.value,
      randomize_questions: randomizeQuestions.value,
      randomize_options: randomizeOptions.value,
    })
    const newExam = res.data.data
    router.push(`/exams/${newExam.id}`)
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal membuat paket ujian.')
  } finally {
    loading.value = false
  }
}
</script>
