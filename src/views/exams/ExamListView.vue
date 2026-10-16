<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
      <div>
        <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Paket Ujian & Jadwal</h2>
        <p class="text-xs text-slate-500 font-medium mt-0.5">Buat paket ujian, konfigurasikan pengawasan dual-camera, dan publikasikan ke kelas</p>
      </div>

      <router-link
        to="/exams/create"
        class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer font-display tracking-wide"
      >
        <Plus class="w-4 h-4 text-[#c2ef4e]" />
        <span>Buat Paket Ujian Baru</span>
      </router-link>
    </div>

    <!-- Exams Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Judul Ujian</th>
              <th class="px-6 py-4">Kelas Sasaran</th>
              <th class="px-6 py-4">Jadwal & Durasi</th>
              <th class="px-6 py-4">Pengawasan</th>
              <th class="px-6 py-4">Total Soal</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="e in exams" :key="e.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <router-link :to="`/exams/${e.id}`" class="font-display font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                  {{ e.title }}
                </router-link>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-800">{{ e.class_name }}</td>
              <td class="px-6 py-4">
                <p class="text-xs font-semibold text-slate-800">{{ formatDate(e.start_time) }}</p>
                <p class="text-[11px] text-slate-400 font-mono">{{ e.duration_minutes }} Menit</p>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                  <Eye class="w-3.5 h-3.5" />
                  {{ e.proctoring_level.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-6 py-4 font-bold text-slate-900 font-mono tabular-nums">{{ e.questions_count }} Butir ({{ e.total_points }} Poin)</td>
              <td class="px-6 py-4">
                <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono border shadow-xs"
                  :class="e.status === 'published' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'"
                >
                  {{ e.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <router-link
                  :to="`/exams/${e.id}`"
                  class="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs"
                >
                  Kelola
                </router-link>
                <router-link
                  v-if="e.status === 'published'"
                  :to="`/proctoring/exam/${e.id}`"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Radio class="w-3.5 h-3.5 animate-pulse text-rose-600" />
                  <span>Monitor</span>
                </router-link>
                <router-link
                  v-else-if="e.status === 'completed'"
                  :to="`/exams/${e.id}/analytics`"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <BarChart3 class="w-3.5 h-3.5" />
                  <span>Hasil</span>
                </router-link>
              </td>
            </tr>
            <tr v-if="exams.length === 0">
              <td colspan="7" class="text-center py-16 text-slate-400 text-xs">Belum ada paket ujian. Buat paket ujian pertama Anda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Eye, Radio, BarChart3 } from 'lucide-vue-next'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

const exams = ref<any[]>([])

async function loadExams() {
  const res = await api.get('/exams')
  exams.value = res.data.data || []
}

onMounted(() => {
  loadExams()
})
</script>
