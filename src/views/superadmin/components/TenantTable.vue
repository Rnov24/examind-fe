<template>
  <div class="space-y-4">
    <!-- Filter & Search Bar -->
    <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="localSearch"
          type="text"
          placeholder="Cari sekolah, kode, atau domain..."
          class="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-slate-400"
          @input="$emit('update:search', localSearch)"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select
          v-model="localPlan"
          class="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
          @change="$emit('update:plan', localPlan)"
        >
          <option value="">Semua Paket</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <button
          @click="$emit('create-tenant')"
          class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Sekolah</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider font-mono">
              <th class="p-4 pl-6">Institusi Sekolah</th>
              <th class="p-4">Kode & Domain</th>
              <th class="p-4">Paket Langganan</th>
              <th class="p-4">Kuota Siswa</th>
              <th class="p-4">Kredit AI Digunakan</th>
              <th class="p-4">Status</th>
              <th class="p-4 pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="t in tenants" :key="t.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="p-4 pl-6">
                <div class="font-bold text-slate-900 text-sm">{{ t.name }}</div>
                <div class="text-[11px] text-slate-500">{{ t.total_teachers }} Guru &bull; {{ t.total_exams }} Ujian Dibuat</div>
              </td>
              <td class="p-4">
                <span class="font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold text-[11px]">
                  {{ t.code }}
                </span>
                <div class="text-[11px] text-slate-500 mt-0.5 font-mono">{{ t.domain || `${t.code}.examind.edu` }}</div>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono border inline-block',
                    t.subscription_plan === 'enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    t.subscription_plan === 'pro' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                  ]"
                >
                  {{ t.subscription_plan }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2 font-mono">
                  <span class="font-bold text-slate-900">{{ t.total_students }}</span>
                  <span class="text-slate-500">/ {{ t.max_students }}</span>
                </div>
                <div class="w-24 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mt-1">
                  <div
                    class="h-full bg-slate-900 rounded-full"
                    :style="{ width: `${Math.min(100, (t.total_students / (t.max_students || 1)) * 100)}%` }"
                  ></div>
                </div>
              </td>
              <td class="p-4 font-mono font-bold text-slate-900">
                {{ t.ai_credits_used }}
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border',
                    t.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', t.is_active ? 'bg-emerald-500' : 'bg-rose-500']"></span>
                  {{ t.is_active ? 'Aktif' : 'Ditangguhkan' }}
                </span>
              </td>
              <td class="p-4 pr-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="$emit('change-plan', t)"
                    class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Ubah Paket
                  </button>
                  <button
                    @click="$emit('toggle-status', t.id)"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border',
                      t.is_active
                        ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    ]"
                  >
                    {{ t.is_active ? 'Suspend' : 'Aktifkan' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400">
                Tidak ada data sekolah / tenant yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus } from 'lucide-vue-next'

const props = defineProps<{
  tenants: any[]
  search: string
  plan: string
}>()

defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:plan', val: string): void
  (e: 'create-tenant'): void
  (e: 'change-plan', tenant: any): void
  (e: 'toggle-status', tenantId: number): void
}>()

const localSearch = ref(props.search)
const localPlan = ref(props.plan)
</script>
