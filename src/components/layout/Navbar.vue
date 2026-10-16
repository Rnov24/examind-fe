<template>
  <header class="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 text-slate-900 transition-all">
    <!-- Brand Mark & Institution Title -->
    <div class="flex items-center gap-3">
      <router-link to="/dashboard" class="flex items-center gap-3 group">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-display font-black text-xs tracking-wider shadow-sm ring-1 ring-slate-800/60 group-hover:ring-[#c2ef4e]/60 transition-all relative overflow-hidden">
          <span class="relative z-10">EX</span>
          <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#c2ef4e] rounded-full blur-[1px]"></span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-display font-extrabold text-slate-900 leading-none text-base tracking-tight group-hover:text-indigo-600 transition-colors">
              EXAMIND
            </span>
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#c2ef4e] text-slate-950 font-mono tracking-wider">
              CBT
            </span>
          </div>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5 tracking-tight flex items-center gap-1.5">
            <span>{{ institutionName }}</span>
          </p>
        </div>
      </router-link>
    </div>

    <!-- Right Header Actions & User Profile -->
    <div class="flex items-center gap-4">
      <!-- Live Server Status Indicator -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-2xs">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="font-mono text-[10px] font-semibold text-slate-700">Server CBT Aktif</span>
      </div>

      <!-- User Profile & Logout -->
      <div class="flex items-center gap-3 pl-3 border-l border-slate-200/80">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-900 leading-none tracking-tight">
            {{ authStore.user?.full_name || 'Pengguna' }}
          </p>
          <div class="flex items-center justify-end gap-1.5 mt-1">
            <span
              class="inline-block text-[10px] font-bold px-2 py-0.2 rounded-full uppercase border font-mono tracking-wide"
              :class="roleBadgeClass"
            >
              {{ roleLabel }}
            </span>
            <span v-if="authStore.user?.identifier" class="text-[10px] text-slate-400 font-mono">
              {{ authStore.user.identifier }}
            </span>
          </div>
        </div>

        <!-- Avatar Initials -->
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/80 flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xs font-display">
          {{ userInitials }}
        </div>

        <button
          @click="handleLogout"
          title="Keluar dari Akun"
          aria-label="Keluar dari Akun"
          class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const institutionName = computed(() => {
  return authStore.user?.tenant_name || 'Portal CBT Sekolah'
})

const roleLabel = computed(() => {
  const role = authStore.user?.role
  if (role === 'superadmin') return 'Super Admin'
  if (role === 'admin') return 'Admin Sekolah'
  if (role === 'teacher') return 'Guru'
  if (role === 'student') return 'Siswa'
  return role || 'Pengguna'
})

const roleBadgeClass = computed(() => {
  const role = authStore.user?.role
  if (role === 'superadmin') return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  if (role === 'admin') return 'bg-slate-100 text-slate-800 border-slate-200'
  if (role === 'teacher') return 'bg-sky-50 text-sky-700 border-sky-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
})

const userInitials = computed(() => {
  const name = authStore.user?.full_name || authStore.user?.username || 'U'
  return name.substring(0, 2).toUpperCase()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
