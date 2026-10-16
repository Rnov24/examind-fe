<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="bg-white border-2 border-rose-500 rounded-xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-900">
      <div class="w-16 h-16 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
        <ShieldAlert class="w-8 h-8" />
      </div>

      <div class="space-y-2">
        <span class="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs uppercase tracking-widest inline-block font-mono">
          Peringatan Pengawasan CBT
        </span>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pelanggaran Terdeteksi oleh Sistem</h2>
        <p class="text-xs text-slate-600 leading-relaxed">
          Aktivitas mencurigakan telah ditandai dan dicatat secara realtime ke dashboard pengawas ujian.
        </p>
      </div>

      <div class="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-xs text-left space-y-3">
        <div class="text-slate-500 text-[11px] font-semibold uppercase tracking-wider font-mono">Detail Insiden:</div>
        <div class="text-rose-800 font-bold flex items-start gap-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertTriangle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{{ details || 'Keluar dari mode layar penuh atau berpindah jendela/tab aplikasi' }}</span>
        </div>
        <div class="p-2.5 rounded-lg bg-white text-slate-600 text-[11px] leading-relaxed border border-slate-200 shadow-xs">
          ℹ️ <strong class="text-slate-900">Prinsip Human-in-the-Loop:</strong> Sistem EXAMIND tidak menggugurkan Anda secara sepihak. Catatan timestamp dan foto pengawasan telah dikirimkan ke guru pengawas untuk ditinjau saat penilaian akhir.
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="$emit('re-enter-fullscreen')"
          class="flex-1 py-3 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Maximize class="w-4 h-4" />
          <span>Kembali ke Layar Penuh</span>
        </button>
        <button
          @click="$emit('exit-exam')"
          class="py-3 px-4 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Batalkan & Keluar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldAlert, AlertTriangle, Maximize } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  details: string
}>()

defineEmits<{
  (e: 're-enter-fullscreen'): void
  (e: 'exit-exam'): void
}>()
</script>
