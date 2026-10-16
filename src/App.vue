<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- Standalone View for Login, Exam Workspace, Companion, or Exam Result -->
    <template v-if="isStandalone">
      <router-view />
    </template>

    <!-- Standard Dashboard Shell for Teacher / Admin / Student Dashboard -->
    <template v-else>
      <Navbar />
      <div class="flex-1 flex flex-row">
        <Sidebar class="hidden md:flex shrink-0" />
        <main class="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <router-view />
        </main>
      </div>
      <!-- Floating AI Assistant Widget (Gemini) -->
      <AIAssistantWidget />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import AIAssistantWidget from '@/components/AIAssistantWidget.vue'

const route = useRoute()

const isStandalone = computed(() => {
  return (
    route.meta.fullscreen ||
    route.meta.companion ||
    route.meta.standalone ||
    route.name === 'Landing' ||
    route.path === '/' ||
    route.name === 'Login' ||
    route.path === '/login' ||
    route.path.startsWith('/companion') ||
    (route.path.includes('/student/exam/') && !route.path.includes('/result'))
  )
})
</script>
