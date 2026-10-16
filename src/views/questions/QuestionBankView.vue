<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Bank Soal & AI Generator</h2>
        <p class="text-sm text-slate-500 font-medium">Koleksi bank butir soal per mata pelajaran dengan generator cerdas</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showCreateModal = true"
          class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Buat Bank Soal</span>
        </button>
      </div>
    </div>

    <!-- Question Banks Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="b in banks"
        :key="b.id"
        class="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold font-mono">
              {{ b.subject }}
            </span>
            <span class="text-xs text-slate-500 font-mono font-medium">{{ b.questions_count }} Butir Soal</span>
          </div>

          <h3 class="text-base font-bold text-slate-900 leading-snug">{{ b.title }}</h3>
          <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{{ b.description || 'Tidak ada deskripsi.' }}</p>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <router-link
            :to="`/questions/${b.id}`"
            class="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Buka Bank Soal</span>
            <span>→</span>
          </router-link>
        </div>
      </div>

      <div v-if="banks.length === 0" class="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
        <BookOpen class="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h4 class="font-bold text-slate-900">Belum Ada Bank Soal</h4>
        <p class="text-xs text-slate-500 mt-1">Buat bank soal baru untuk mulai merancang butir soal PG dan esai.</p>
      </div>
    </div>

    <!-- Create Bank Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 class="text-lg font-black text-slate-900">Buat Bank Soal Baru</h3>
            <p class="text-xs text-slate-500">Atur judul dan mata pelajaran untuk bank soal</p>
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

        <form @submit.prevent="handleCreateBank" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
            <input
              v-model="newBankSubject"
              type="text"
              required
              placeholder="Contoh: Fisika, Matematika, Biologi"
              class="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Bank Soal</label>
            <input
              v-model="newBankTitle"
              type="text"
              required
              placeholder="Contoh: Bank Soal Teori Kuantum & Relativitas"
              class="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi (Opsional)</label>
            <textarea
              v-model="newBankDesc"
              rows="3"
              placeholder="Catatan lingkup materi..."
              class="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 outline-none"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white border border-slate-300 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ loading ? 'Menyimpan...' : 'Simpan Bank Soal' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, BookOpen, X, Loader2 } from 'lucide-vue-next'
import api from '@/lib/api'

const banks = ref<any[]>([])
const showCreateModal = ref(false)
const newBankSubject = ref('')
const newBankTitle = ref('')
const newBankDesc = ref('')
const loading = ref(false)

async function loadBanks() {
  const res = await api.get('/questions/banks')
  banks.value = res.data.data || []
}

async function handleCreateBank() {
  loading.value = true
  try {
    await api.post('/questions/banks', {
      subject: newBankSubject.value,
      title: newBankTitle.value,
      description: newBankDesc.value,
    })
    showCreateModal.value = false
    newBankSubject.value = ''
    newBankTitle.value = ''
    newBankDesc.value = ''
    await loadBanks()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal membuat bank soal.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBanks()
})
</script>
