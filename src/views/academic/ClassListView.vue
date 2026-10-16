<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Manajemen Kelas Akademik</h2>
        <p class="text-sm text-slate-500 font-medium">Kelola rombel belajar, pendaftaran siswa, dan penugasan ujian</p>
      </div>

      <button
        @click="showCreateModal = true"
        class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Kelas Baru</span>
      </button>
    </div>

    <!-- Class Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="c in classes"
        :key="c.id"
        class="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between text-slate-900"
      >
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold font-mono">
              Tingkat {{ c.grade_level }}
            </span>
            <span class="text-xs text-slate-500 font-mono font-medium">{{ c.academic_year }}</span>
          </div>

          <h3 class="text-base font-bold text-slate-900">{{ c.name }}</h3>
          <p class="text-xs text-slate-500 mt-1">Dibuat oleh: {{ c.creator_name || 'Guru' }}</p>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Users class="w-4 h-4 text-indigo-600" />
            <span class="font-mono">{{ c.members_count }} Siswa Terdaftar</span>
          </div>

          <router-link
            :to="`/classes/${c.id}`"
            class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-300 transition-colors shadow-xs"
          >
            Lihat Roster →
          </router-link>
        </div>
      </div>

      <div v-if="classes.length === 0" class="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
        <Users class="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h4 class="font-bold text-slate-900">Belum Ada Kelas</h4>
        <p class="text-xs text-slate-500 mt-1">Tambahkan kelas pertama Anda untuk memulai pendaftaran siswa.</p>
      </div>
    </div>

    <!-- Create Class Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 class="text-lg font-black text-slate-900">Buat Kelas Akademik Baru</h3>
            <p class="text-xs text-slate-500">Tentukan nama rombel dan tahun akademik</p>
          </div>
          <button
            type="button"
            @click="showCreateModal = false"
            aria-label="Tutup modal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreateClass" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kelas</label>
            <input
              v-model="newClassName"
              type="text"
              required
              placeholder="Contoh: XII MIPA 2"
              class="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat</label>
              <select
                v-model="newGradeLevel"
                class="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
              >
                <option value="10">Kelas 10</option>
                <option value="11">Kelas 11</option>
                <option value="12">Kelas 12</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun Ajaran</label>
              <input
                v-model="newAcademicYear"
                type="text"
                required
                placeholder="2026/2027"
                class="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none font-mono"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white border border-slate-300 cursor-pointer shadow-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Kelas' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Users, X, Loader2 } from 'lucide-vue-next'
import api from '@/lib/api'

const classes = ref<any[]>([])
const showCreateModal = ref(false)
const newClassName = ref('')
const newGradeLevel = ref('12')
const newAcademicYear = ref('2026/2027')
const isSubmitting = ref(false)

async function loadClasses() {
  try {
    const res = await api.get('/academic/classes')
    classes.value = res.data.data || []
  } catch (err) {
    try {
      const res = await api.get('/classes')
      classes.value = res.data.data || []
    } catch (e) {
      console.error('Failed to load classes:', e)
    }
  }
}

async function handleCreateClass() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    try {
      await api.post('/academic/classes', {
        name: newClassName.value,
        grade_level: newGradeLevel.value,
        academic_year: newAcademicYear.value,
      })
    } catch (err) {
      await api.post('/classes', {
        name: newClassName.value,
        grade_level: newGradeLevel.value,
        academic_year: newAcademicYear.value,
      })
    }
    newClassName.value = ''
    showCreateModal.value = false
    await loadClasses()
  } catch (err) {
    console.error('Failed to create class:', err)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>
