<template>
  <div class="space-y-6">
    <!-- Institutional Daylight Header -->
    <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-indigo-50/70 rounded-full blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-emerald-50/50 rounded-full blur-2xl"></div>

      <div class="relative space-y-2 max-w-xl">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-950 bg-[#c2ef4e] px-2.5 py-0.5 rounded font-mono shadow-xs">
            Administrator Institusi
          </span>
          <span class="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            {{ authStore.user?.identifier || 'Admin' }}
          </span>
        </div>
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Panel Administrasi: {{ authStore.user?.full_name || 'Admin Sekolah' }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Pusat kendali sekolah: kelola akun guru & siswa, pantau status server MySQL XAMPP, dan audit integritas ujian.
        </p>
      </div>

      <div class="relative flex items-center gap-2.5 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <router-link
          to="/classes"
          class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          Kelola Kelas
        </router-link>
        <button
          @click="showAddUserModal = true"
          class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-card hover:shadow-card-hover flex items-center gap-2 cursor-pointer font-display tracking-wide"
        >
          <UserPlus class="w-3.5 h-3.5 text-[#c2ef4e]" />
          <span>Tambah Pengguna</span>
        </button>
      </div>
    </div>

    <!-- Institutional KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Total Pengguna</span>
          <div class="flex items-baseline gap-1.5">
            <h3 class="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{{ stats.total_users }}</h3>
            <span class="text-[11px] text-slate-400 font-medium">({{ stats.total_teachers }} Guru, {{ stats.total_students }} Siswa)</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
          <GraduationCap class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Kelas & Rombel</span>
          <h3 class="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{{ stats.total_classes }} Rombel</h3>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-indigo-50/70">
          <FileSpreadsheet class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Paket Ujian Sekolah</span>
          <div class="flex items-baseline gap-1.5">
            <h3 class="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{{ stats.total_exams }}</h3>
            <span class="text-[11px] text-slate-400 font-medium">({{ stats.total_question_banks }} Bank)</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center font-bold shrink-0 ring-4 ring-rose-50/70">
          <ShieldAlert class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Diskualifikasi CBT</span>
          <div class="flex items-baseline gap-1.5">
            <h3 class="text-2xl font-extrabold text-rose-600 font-display tabular-nums">{{ stats.disqualified_sessions }}</h3>
            <span class="text-[11px] text-slate-400 font-medium">/ {{ stats.total_sessions }} Sesi</span>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management Section -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div class="p-5 sm:px-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="font-display text-base font-bold text-slate-900">Manajemen Akun Pengguna</h3>
          <p class="text-xs text-slate-500">Daftar akun terdaftar di platform sekolah (Administrator, Guru, dan Siswa)</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Filter Role -->
          <select
            v-model="selectedRole"
            @change="fetchUsers"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 font-sans shadow-xs"
          >
            <option value="all">Semua Peran (All)</option>
            <option value="admin">Administrator</option>
            <option value="teacher">Guru / Pengawas</option>
            <option value="student">Siswa / Peserta</option>
          </select>

          <!-- Search Input -->
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchKeyword"
              @input="fetchUsers"
              type="text"
              placeholder="Cari nama, NIP, NISN..."
              class="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white w-48 sm:w-60 shadow-xs transition-colors"
            />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200 font-mono">
            <tr>
              <th class="px-6 py-4">Pengguna</th>
              <th class="px-6 py-4">Identifier (NIP / NISN)</th>
              <th class="px-6 py-4">Peran (Role)</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Status Akun</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="user in userList" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                    {{ user.full_name.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-display font-bold text-slate-900 leading-snug">{{ user.full_name }}</p>
                    <p class="text-[11px] text-slate-400 font-mono">ID: #{{ user.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-slate-600">{{ user.identifier }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono inline-block shadow-xs"
                  :class="{
                    'bg-purple-50 text-purple-700 border border-purple-200': user.role === 'admin',
                    'bg-indigo-50 text-indigo-700 border border-indigo-200': user.role === 'teacher',
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': user.role === 'student',
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-slate-600 font-mono">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono border shadow-xs"
                  :class="user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.is_active ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  {{ user.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="user.id !== authStore.user?.id"
                  @click="toggleUserStatus(user)"
                  class="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  :class="user.is_active ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'"
                >
                  {{ user.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
                <span v-else class="text-xs text-slate-400 italic">Akun Anda</span>
              </td>
            </tr>
            <tr v-if="userList.length === 0">
              <td colspan="6" class="text-center py-12 text-slate-400 text-xs">Tidak ada data pengguna yang sesuai filter.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-subtle-elevated space-y-5 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Tambah Akun Pengguna</h3>
            <p class="text-xs text-slate-500">Daftarkan akun baru ke dalam sistem institusi</p>
          </div>
          <button
            type="button"
            @click="showAddUserModal = false"
            aria-label="Tutup Modal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="submitAddUser" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              v-model="newUserForm.full_name"
              required
              type="text"
              placeholder="Contoh: Budi Prasetyo, M.Pd"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Identifier (NIP / NISN / Username)</label>
              <input
                v-model="newUserForm.identifier"
                required
                type="text"
                placeholder="19820310..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
              <select
                v-model="newUserForm.role"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              >
                <option value="student">Siswa (Student)</option>
                <option value="teacher">Guru (Teacher)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
            <input
              v-model="newUserForm.email"
              required
              type="email"
              placeholder="nama@sekolah.sch.id"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
            <input
              v-model="newUserForm.password"
              required
              type="password"
              placeholder="Minimal 6 karakter"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div v-if="errorMessage" class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {{ errorMessage }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showAddUserModal = false"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Akun' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  ShieldAlert,
  UserPlus,
  Search,
  X,
} from 'lucide-vue-next'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const stats = ref({
  total_users: 0,
  total_admins: 0,
  total_teachers: 0,
  total_students: 0,
  total_classes: 0,
  total_question_banks: 0,
  total_exams: 0,
  total_sessions: 0,
  active_sessions: 0,
  completed_sessions: 0,
  disqualified_sessions: 0,
  database_status: 'Connecting...',
  edge_cv_status: 'Online',
})

const userList = ref<any[]>([])
const selectedRole = ref('all')
const searchKeyword = ref('')
const showAddUserModal = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const newUserForm = ref({
  full_name: '',
  identifier: '',
  role: 'student',
  email: '',
  password: '',
})

async function fetchStats() {
  try {
    const res = await api.get('/admin/stats')
    if (res.data.data) {
      stats.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to load admin stats:', err)
  }
}

async function fetchUsers() {
  try {
    const params: any = {}
    if (selectedRole.value !== 'all') params.role = selectedRole.value
    if (searchKeyword.value.trim()) params.search = searchKeyword.value.trim()

    const res = await api.get('/admin/users', { params })
    userList.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

async function toggleUserStatus(user: any) {
  try {
    const res = await api.patch(`/admin/users/${user.id}/toggle-status`)
    user.is_active = res.data.data.is_active
    await fetchStats()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengubah status pengguna')
  }
}

async function submitAddUser() {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await api.post('/admin/users', newUserForm.value)
    showAddUserModal.value = false
    newUserForm.value = {
      full_name: '',
      identifier: '',
      role: 'student',
      email: '',
      password: '',
    }
    await Promise.all([fetchStats(), fetchUsers()])
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal membuat pengguna'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchStats()
  fetchUsers()
})
</script>
