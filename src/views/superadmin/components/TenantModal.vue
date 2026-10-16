<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between border-b border-slate-200 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Onboard Sekolah Baru (Multi-Tenant)</h3>
            <p class="text-xs text-slate-500">Daftarkan institusi sekolah dan buat akun administrator pertamanya</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="$emit('submit')" class="space-y-4 text-xs font-medium">
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1 col-span-2">
            <label class="font-bold text-slate-700">Nama Resmi Sekolah</label>
            <input
              v-model="form.name"
              required
              type="text"
              placeholder="Contoh: SMAN 2 Kota Bandung"
              class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700">Kode Unik Institusi</label>
            <input
              v-model="form.code"
              required
              type="text"
              placeholder="sman2bdg"
              class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-slate-400 uppercase"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700">Paket Langganan</label>
            <select
              v-model="form.subscription_plan"
              class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="starter">Starter (150 Siswa)</option>
              <option value="pro">Pro (500 Siswa)</option>
              <option value="enterprise">Enterprise (2000 Siswa)</option>
            </select>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-3">
          <h4 class="font-bold text-slate-900 text-xs mb-2">Akun Administrator Sekolah Pertama:</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-700">Username / NIP Admin</label>
              <input
                v-model="form.admin_identifier"
                required
                type="text"
                placeholder="admin_sman2bdg"
                class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700">Nama Lengkap Admin</label>
              <input
                v-model="form.admin_full_name"
                required
                type="text"
                placeholder="Drs. Mulyadi (Kepala TU)"
                class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700">Email Admin</label>
              <input
                v-model="form.admin_email"
                required
                type="email"
                placeholder="admin@sman2bdg.sch.id"
                class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700">Password Awal</label>
              <input
                v-model="form.admin_password"
                required
                type="password"
                placeholder="Minimal 8 karakter"
                class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {{ isSubmitting ? 'Mendaftarkan...' : 'Konfirmasi Onboard' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, X } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  form: {
    name: string
    code: string
    subscription_plan: string
    admin_identifier: string
    admin_full_name: string
    admin_email: string
    admin_password: string
  }
  isSubmitting: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()
</script>
