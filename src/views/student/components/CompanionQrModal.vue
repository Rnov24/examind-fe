<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl text-slate-900">
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Smartphone class="w-4 h-4 text-slate-900" />
          <span>Koneksikan Kamera HP (Cam 2)</span>
        </h3>
        <button
          type="button"
          @click="$emit('close')"
          aria-label="Tutup modal"
          class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <p class="text-xs text-slate-500">
        Pindai QR code ini menggunakan smartphone untuk memantau lingkungan sekitar dari samping/belakang:
      </p>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mx-auto shadow-inner w-fit">
        <qrcode-vue :value="companionUrl" :size="180" level="M" />
      </div>

      <div class="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-left space-y-1 font-mono">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-500">Sesi ID:</span>
          <span class="font-bold text-slate-900">#{{ sessionId }}</span>
        </div>
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-500">Status Cam 2:</span>
          <span :class="isCompanionPaired ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'">
            {{ isCompanionPaired ? 'Terhubung (Aktif)' : 'Menunggu Pindai...' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="copyUrl"
          class="flex-1 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors border border-slate-300 shadow-xs cursor-pointer"
        >
          {{ copied ? 'Tautan Disalin! ✓' : 'Salin Tautan' }}
        </button>
        <button
          @click="$emit('close')"
          class="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Smartphone, X } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'

const props = defineProps<{
  isOpen: boolean
  companionUrl: string
  sessionId?: number
  isCompanionPaired: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

function copyUrl(): void {
  navigator.clipboard.writeText(props.companionUrl)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
