<template>
  <div class="space-y-6">
    <!-- Top Welcome Banner -->
    <div class="bg-white rounded-xl p-6 sm:p-7 text-slate-900 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <span class="px-2.5 py-0.5 bg-slate-900 text-[#c2ef4e] rounded-xs text-xs font-bold tracking-wide uppercase inline-block mb-3 font-mono">
          Dashboard Guru & Admin
        </span>
        <h2 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Selamat Datang, {{ authStore.user?.full_name }}</h2>
        <p class="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
          Kelola bank soal, paket ujian terjadwal, pantau proctoring dual-camera secara langsung, dan lakukan koreksi esai AI.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <router-link
          to="/questions"
          class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-lg transition-all shadow-xs"
        >
          Buat Soal AI
        </router-link>
        <router-link
          to="/exams/create"
          class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
        >
          Buat Ujian Baru
        </router-link>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
          <BookOpen class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Bank Soal</p>
          <h3 class="text-xl font-bold text-slate-900 tabular-nums font-mono">{{ banksCount }}</h3>
        </div>
      </div>

      <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
          <FileSpreadsheet class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Paket Ujian</p>
          <h3 class="text-xl font-bold text-slate-900 tabular-nums font-mono">{{ examsCount }}</h3>
        </div>
      </div>

      <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Kelas Aktif</p>
          <h3 class="text-xl font-bold text-slate-900 tabular-nums font-mono">{{ classesCount }}</h3>
        </div>
      </div>

      <div class="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
          <ShieldAlert class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Dual-Cam Engine</p>
          <h3 class="text-xs font-bold text-emerald-700 font-mono">ONLINE</h3>
        </div>
      </div>
    </div>

    <!-- Active Exams Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900">Daftar Paket Ujian Terkini</h3>
          <p class="text-xs text-slate-500">Status publikasi dan pemantauan proctoring</p>
        </div>
        <router-link to="/exams" class="text-xs font-bold text-indigo-700 hover:underline font-mono">
          Lihat Semua →
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Judul Ujian</th>
              <th class="px-6 py-4">Kelas</th>
              <th class="px-6 py-4">Durasi</th>
              <th class="px-6 py-4">Pengawasan</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="exam in recentExams" :key="exam.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-900">{{ exam.title }}</td>
              <td class="px-6 py-4 text-slate-500">{{ exam.class_name || '-' }}</td>
              <td class="px-6 py-4 text-slate-500 font-mono">{{ exam.duration_minutes }} Menit</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize font-mono border"
                  :class="exam.proctoring_level === 'dual_camera' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
                >
                  <Eye class="w-3.5 h-3.5" />
                  {{ exam.proctoring_level.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono border"
                  :class="exam.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
                >
                  {{ exam.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <router-link
                  :to="`/proctoring/exam/${exam.id}`"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors"
                >
                  <Radio class="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  Live Monitor
                </router-link>
                <router-link
                  :to="`/grading/exam/${exam.id}`"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-colors"
                >
                  Koreksi
                </router-link>
              </td>
            </tr>
            <tr v-if="recentExams.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-400">Belum ada paket ujian yang dibuat.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  BookOpen,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Eye,
  Radio,
} from 'lucide-vue-next'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const banksCount = ref(0)
const examsCount = ref(0)
const classesCount = ref(0)
const recentExams = ref<any[]>([])

onMounted(async () => {
  try {
    const [bRes, eRes, cRes] = await Promise.all([
      api.get('/questions/banks'),
      api.get('/exams'),
      api.get('/classes'),
    ])
    banksCount.value = bRes.data.data?.length || 0
    examsCount.value = eRes.data.data?.length || 0
    classesCount.value = cRes.data.data?.length || 0
    recentExams.value = (eRes.data.data || []).slice(0, 5)
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  }
})
</script>
