<template>
  <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#c2ef4e] selection:text-slate-950 relative overflow-hidden">
    <!-- Ambient Background Depth -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-100/60 via-[#c2ef4e]/10 to-transparent rounded-full blur-3xl opacity-70"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl"></div>
    </div>

    <!-- Top Header Bar -->
    <header class="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between py-2">
      <div class="flex items-center gap-3 group">
        <div class="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-card group-hover:bg-[#c2ef4e] group-hover:text-slate-950 transition-colors">
          EX
        </div>
        <div>
          <span class="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-none">EXAMIND</span>
          <span class="text-[11px] text-slate-500 font-medium">Platform Ujian AI Sekolah</span>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="font-mono text-[11px]">Server CBT Online</span>
      </div>
    </header>

    <!-- Main Login Card Area -->
    <main class="relative z-10 max-w-md w-full mx-auto my-auto py-8">
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-subtle-elevated p-6 sm:p-8 space-y-6 text-slate-900">
        <!-- Card Header -->
        <div class="space-y-2 text-center">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-[#c2ef4e]"></span>
            Autentikasi Terpusat
          </div>
          <h1 class="font-display text-2xl font-bold tracking-tight text-slate-900">Masuk ke Portal Ujian</h1>
          <p class="text-xs text-slate-500 max-w-xs mx-auto">
            Gunakan akun resmi sekolah Anda (NISN untuk Siswa, NIP untuk Guru/Admin).
          </p>
        </div>

        <!-- Session Expired Alert -->
        <div v-if="sessionExpiredNotice" class="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
          <span>Sesi Anda telah kedaluwarsa. Silakan masuk kembali.</span>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
              NISN / NIP / Email / Nama Pengguna
            </label>
            <input
              v-model="identifier"
              type="text"
              required
              placeholder="Contoh: 0081234567 atau budi.santoso@..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
              Kata Sandi
            </label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-card hover:shadow-card-hover font-display tracking-wide"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin text-[#c2ef4e]" />
            <span>{{ loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem Ujian' }}</span>
          </button>
        </form>

        <!-- Quick Demo Switcher (Synced with Seeded Database Accounts) -->
        <div class="pt-5 border-t border-slate-100 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Akses Cepat Uji Coba:</span>
            <span class="text-[10px] text-slate-400 font-mono">1-Klik Isi Data</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              @click="fillDemo('andi.pratama@student.sman1unggul.sch.id', 'Siswa123!')"
              class="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">Andi Pratama</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-mono">Siswa</span>
              </div>
              <p class="text-[10px] text-slate-500 font-mono truncate">0081234567</p>
            </button>

            <button
              type="button"
              @click="fillDemo('budi.santoso@sman1unggul.sch.id', 'Guru123!')"
              class="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">Budi Santoso</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 border border-indigo-200 font-mono">Guru</span>
              </div>
              <p class="text-[10px] text-slate-500 font-mono truncate">Guru Fisika</p>
            </button>

            <button
              type="button"
              @click="fillDemo('admin@sman1unggul.sch.id', 'Admin123!')"
              class="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">Admin Sekolah</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-800 border border-amber-200 font-mono">Admin</span>
              </div>
              <p class="text-[10px] text-slate-500 font-mono truncate">SMA 1 Unggul</p>
            </button>

            <button
              type="button"
              @click="fillDemo('superadmin@examind.id', 'SuperAdmin123!')"
              class="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-400/80 text-left transition-all cursor-pointer hover:shadow-xs group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">SuperAdmin</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100/80 text-purple-800 border border-purple-200 font-mono">SaaS</span>
              </div>
              <p class="text-[10px] text-slate-500 font-mono truncate">Platform Owner</p>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 max-w-5xl w-full mx-auto text-center py-4 text-xs text-slate-400">
      <p>EXAMIND Platform • Dilindungi Protokol Dual-Proctoring & Standar Ujian Digital Nasional</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const identifier = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const sessionExpiredNotice = ref(false)

function fillDemo(loginUser: string, loginPass: string) {
  identifier.value = loginUser
  password.value = loginPass
}

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''
  sessionExpiredNotice.value = false

  try {
    const user = await authStore.login(identifier.value.trim(), password.value)
    if (user) {
      const redirect = (route.query.redirect as string) || (
        user.role === 'superadmin' ? '/superadmin/dashboard' :
        user.role === 'admin' ? '/admin/dashboard' :
        user.role === 'student' ? '/student/dashboard' :
        '/teacher/dashboard'
      )
      router.push(redirect)
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal masuk. Periksa kembali identifier dan kata sandi.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.reason === 'session_expired') {
    sessionExpiredNotice.value = true
  }
})
</script>
