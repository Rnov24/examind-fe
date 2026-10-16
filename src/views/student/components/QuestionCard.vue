<template>
  <div v-if="question" class="space-y-6">
    <!-- Question Header Pill -->
    <div class="flex items-center justify-between border-b border-slate-200/80 pb-4 flex-wrap gap-3">
      <div class="flex items-center gap-2.5">
        <span class="px-3 py-1 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase font-mono shadow-xs">
          Soal No. {{ currentIndex + 1 }} <span class="text-slate-400 font-normal">/ {{ totalQuestions }}</span>
        </span>
        <span class="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold font-mono">
          Bobot: <strong class="text-slate-900">{{ question.points }}</strong> Poin
        </span>
      </div>

      <!-- Ragu-ragu Checkbox -->
      <label class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold cursor-pointer hover:bg-amber-100/70 transition-colors select-none">
        <input
          type="checkbox"
          :checked="isDoubt"
          @change="$emit('toggle-doubt')"
          class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-white border-slate-300 cursor-pointer accent-amber-600"
        />
        <span>Tandai Ragu-ragu</span>
      </label>
    </div>

    <!-- Question Prompt Surface -->
    <div class="prose max-w-none text-slate-900 text-base sm:text-lg leading-relaxed bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-card">
      <p class="whitespace-pre-line font-medium text-slate-800">{{ question.prompt }}</p>
    </div>

    <!-- Multiple Choice Options -->
    <div v-if="question.question_type === 'multiple_choice'" class="space-y-3 pt-2">
      <div
        v-for="opt in question.options_json || []"
        :key="opt.id"
        @click="$emit('select-option', opt.id)"
        class="flex items-start gap-4 p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none group"
        :class="
          currentAnswer === opt.id
            ? 'bg-slate-900 border-slate-900 text-white shadow-card-hover -translate-y-0.5'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800 shadow-xs'
        "
      >
        <div
          class="w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-all font-mono"
          :class="
            currentAnswer === opt.id
              ? 'bg-[#c2ef4e] text-slate-950 shadow-xs'
              : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200'
          "
        >
          {{ opt.id }}
        </div>
        <div class="text-sm sm:text-base font-medium pt-1.5 leading-snug" :class="currentAnswer === opt.id ? 'text-white' : 'text-slate-800'">
          {{ opt.text }}
        </div>
      </div>
    </div>

    <!-- Essay Input Area -->
    <div v-else class="space-y-3 pt-2">
      <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Tuliskan lembar jawaban esai Anda:</span>
        <span class="font-mono text-slate-800 font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
          {{ (essayValue || '').length }} karakter
        </span>
      </div>
      <textarea
        :value="essayValue"
        @input="$emit('update:essayValue', ($event.target as HTMLTextAreaElement).value)"
        rows="8"
        placeholder="Tuliskan argumen, analisis, dan penjelasan konsep secara komprehensif..."
        class="w-full bg-white border border-slate-300 rounded-2xl p-5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-sans leading-relaxed resize-y shadow-xs"
      />
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between pt-6 border-t border-slate-200/80">
      <button
        @click="$emit('prev')"
        :disabled="currentIndex === 0"
        class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>Sebelumnya</span>
      </button>

      <button
        @click="$emit('next')"
        :disabled="currentIndex === totalQuestions - 1"
        class="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer font-display tracking-wide group"
      >
        <span>Selanjutnya</span>
        <ChevronRight class="w-4 h-4 text-[#c2ef4e] group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  question: any
  currentIndex: number
  totalQuestions: number
  isDoubt: boolean
  currentAnswer?: string
  essayValue?: string
}>()

defineEmits<{
  (e: 'select-option', optId: string): void
  (e: 'update:essayValue', value: string): void
  (e: 'toggle-doubt'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>
