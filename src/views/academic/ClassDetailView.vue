<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/classes" class="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs">
        <ArrowLeft class="w-4 h-4" />
      </router-link>
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ classDetail?.name || 'Rombel Kelas' }}</h2>
        <p class="text-xs text-slate-500 font-medium font-mono">Tingkat {{ classDetail?.grade_level }} • Tahun Ajaran {{ classDetail?.academic_year }}</p>
      </div>
    </div>

    <!-- Student Roster Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-slate-900">
      <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900">Daftar Anggota & Roster Siswa</h3>
          <p class="text-xs text-slate-500">Total: {{ classDetail?.members?.length || 0 }} Siswa Terdaftar</p>
        </div>

        <button
          @click="openAddMemberModal"
          class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>Tambah Siswa ke Kelas</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-600 tracking-wider font-mono border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">NISN / Identifier</th>
              <th class="px-6 py-4">Nama Lengkap</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Peran</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="m in classDetail?.members" :key="m.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-mono text-xs font-bold text-slate-900">{{ m.user?.identifier }}</td>
              <td class="px-6 py-4 font-bold text-slate-900">{{ m.user?.full_name }}</td>
              <td class="px-6 py-4 text-xs text-slate-500">{{ m.user?.email }}</td>
              <td class="px-6 py-4">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize font-mono"
                  :class="m.role === 'teacher' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'"
                >
                  {{ m.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="m.role !== 'teacher'"
                  @click="handleRemoveMember(m.user_id)"
                  class="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="!classDetail?.members || classDetail.members.length === 0">
              <td colspan="5" class="text-center py-8 text-slate-500">Belum ada siswa yang ditambahkan.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 class="text-base font-bold text-slate-900">Daftarkan Siswa ke Kelas</h3>
            <p class="text-xs text-slate-500">Pilih siswa dari database untuk dimasukkan ke rombel ini</p>
          </div>
          <button
            type="button"
            @click="showAddModal = false"
            aria-label="Tutup modal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1 font-mono">Pilih Siswa</label>
            <select
              v-model="selectedStudentId"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:bg-white focus:border-slate-900 outline-none bg-slate-50 text-slate-900"
            >
              <option :value="null">-- Pilih Siswa --</option>
              <option v-for="s in availableStudents" :key="s.id" :value="s.id">
                {{ s.full_name }} ({{ s.identifier }})
              </option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 cursor-pointer shadow-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="!selectedStudentId || isSubmitting"
              @click="handleAddMember"
              class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSubmitting ? 'Menambahkan...' : 'Tambahkan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, UserPlus, X, Loader2 } from 'lucide-vue-next'
import api from '@/lib/api'

const route = useRoute()
const classId = route.params.id

const classDetail = ref<any>(null)
const availableStudents = ref<any[]>([])
const showAddModal = ref(false)
const selectedStudentId = ref<number | null>(null)
const isSubmitting = ref(false)

async function loadDetail() {
  try {
    const res = await api.get(`/academic/classes/${classId}`)
    classDetail.value = res.data.data
  } catch (err) {
    try {
      const res = await api.get(`/classes/${classId}`)
      classDetail.value = res.data.data
    } catch (e) {
      console.error('Failed to load class detail:', e)
    }
  }
}

async function openAddMemberModal() {
  try {
    const res = await api.get('/academic/classes/users/students')
    const currentMemberIds = new Set((classDetail.value?.members || []).map((m: any) => m.user_id))
    availableStudents.value = (res.data.data || []).filter((s: any) => !currentMemberIds.has(s.id))
  } catch (err) {
    const res = await api.get('/classes/users/students')
    const currentMemberIds = new Set((classDetail.value?.members || []).map((m: any) => m.user_id))
    availableStudents.value = (res.data.data || []).filter((s: any) => !currentMemberIds.has(s.id))
  }
  selectedStudentId.value = availableStudents.value.length > 0 ? availableStudents.value[0].id : null
  showAddModal.value = true
}

async function handleAddMember() {
  if (!selectedStudentId.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    try {
      await api.post(`/academic/classes/${classId}/members`, {
        user_id: selectedStudentId.value,
        role: 'student',
      })
    } catch (err) {
      await api.post(`/classes/${classId}/members`, {
        user_id: selectedStudentId.value,
        role: 'student',
      })
    }
    showAddModal.value = false
    await loadDetail()
  } catch (err) {
    console.error('Failed to add member:', err)
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemoveMember(userId: number) {
  if (!confirm('Yakin ingin mengeluarkan siswa ini dari kelas?')) return
  try {
    await api.delete(`/academic/classes/${classId}/members/${userId}`)
  } catch (err) {
    await api.delete(`/classes/${classId}/members/${userId}`)
  }
  await loadDetail()
}

onMounted(() => {
  loadDetail()
})
</script>
