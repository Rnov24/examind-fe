<template>
  <aside class="w-64 border-r border-slate-200/80 bg-white/75 backdrop-blur-md flex flex-col justify-between p-3.5 min-h-[calc(100vh-4rem)] text-slate-800">
    <nav class="space-y-1">
      <!-- Super Admin Dedicated Navigation -->
      <template v-if="authStore.isSuperAdmin">
        <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          SaaS Management
        </div>

        <router-link
          to="/superadmin/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/superadmin/dashboard') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <Building2 class="w-4 h-4" :class="isActive('/superadmin/dashboard') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Institusi & Tenant</span>
        </router-link>

        <router-link
          to="/superadmin/secrets"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/superadmin/secrets') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <Key class="w-4 h-4" :class="isActive('/superadmin/secrets') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Secret & API Key</span>
        </router-link>

        <router-link
          to="/admin/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/admin/dashboard') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <ShieldCheck class="w-4 h-4" :class="isActive('/admin/dashboard') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Admin Portal</span>
        </router-link>
      </template>

      <!-- Admin Dedicated Navigation -->
      <template v-else-if="authStore.isAdmin">
        <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Administrasi Sekolah
        </div>

        <router-link
          to="/admin/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/admin/dashboard') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <LayoutDashboard class="w-4 h-4" :class="isActive('/admin/dashboard') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Ringkasan Sekolah</span>
        </router-link>

        <router-link
          to="/classes"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/classes') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <Users class="w-4 h-4" :class="isActive('/classes') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Kelas & Siswa</span>
        </router-link>

        <router-link
          to="/questions"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/questions') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <BookOpen class="w-4 h-4" :class="isActive('/questions') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Master Bank Soal</span>
        </router-link>

        <router-link
          to="/exams"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/exams') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <FileSpreadsheet class="w-4 h-4" :class="isActive('/exams') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Jadwal Ujian</span>
        </router-link>

        <router-link
          to="/analytics"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/analytics') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <BarChart3 class="w-4 h-4" :class="isActive('/analytics') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Audit & Rekapitulasi</span>
        </router-link>

        <router-link
          to="/superadmin/secrets"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/superadmin/secrets') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <Key class="w-4 h-4" :class="isActive('/superadmin/secrets') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Secret & API Key</span>
        </router-link>
      </template>

      <!-- Teacher Dedicated Navigation -->
      <template v-else-if="authStore.isTeacher">
        <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Akademik & Penilaian
        </div>

        <router-link
          to="/teacher/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/teacher/dashboard') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <LayoutDashboard class="w-4 h-4" :class="isActive('/teacher/dashboard') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Dashboard Guru</span>
        </router-link>

        <router-link
          to="/classes"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/classes') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <Users class="w-4 h-4" :class="isActive('/classes') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Manajemen Rombel</span>
        </router-link>

        <router-link
          to="/questions"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/questions') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <BookOpen class="w-4 h-4" :class="isActive('/questions') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Bank Soal & AI</span>
        </router-link>

        <router-link
          to="/exams"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/exams') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <FileSpreadsheet class="w-4 h-4" :class="isActive('/exams') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Paket Ujian & Jadwal</span>
        </router-link>

        <div class="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Koreksi & Integritas
        </div>

        <router-link
          to="/grading"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/grading') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <CheckCircle class="w-4 h-4" :class="isActive('/grading') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Koreksi Esai & Override</span>
        </router-link>

        <router-link
          to="/analytics"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/analytics') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <BarChart3 class="w-4 h-4" :class="isActive('/analytics') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Analisis Butir Soal</span>
        </router-link>
      </template>

      <!-- Student Dedicated Navigation -->
      <template v-else-if="authStore.isStudent">
        <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Ruang Evaluasi
        </div>

        <router-link
          to="/student/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          :class="isActive('/student/dashboard') ? 'bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-800/80' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'"
        >
          <FileText class="w-4 h-4" :class="isActive('/student/dashboard') ? 'text-[#c2ef4e]' : 'text-slate-500'" />
          <span>Ujian & Hasil Belajar</span>
        </router-link>
      </template>
    </nav>

    <!-- Refined System Footer -->
    <div class="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 text-[11px] text-slate-600 shadow-2xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="font-display font-bold text-slate-900 text-xs tracking-tight">EXAMIND Engine</span>
        <span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200/60">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Ready
        </span>
      </div>
      <p class="text-[10px] text-slate-400 font-mono tracking-tight">v1.0 • Dual-Proctor Active</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  Building2,
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  CheckCircle,
  BarChart3,
  FileText,
  ShieldCheck,
  Key,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

function isActive(path: string): boolean {
  if (path === '/superadmin/secrets') {
    return route.path === '/superadmin/secrets' || route.query.tab === 'secrets'
  }
  if (path === '/superadmin/dashboard') {
    return route.path === '/superadmin/dashboard' && route.query.tab !== 'secrets'
  }
  if (
    path === '/dashboard' ||
    path === '/admin/dashboard' ||
    path === '/teacher/dashboard' ||
    path === '/student/dashboard'
  ) {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>
