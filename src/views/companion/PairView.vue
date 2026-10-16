<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-5 font-sans select-none overflow-hidden touch-none">
    <!-- Top Header Bar -->
    <header class="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-lg backdrop-blur z-20">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-[#c2ef4e] flex items-center justify-center font-black text-xs font-mono shadow-xs">
          C2
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h1 class="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">EXAMIND Companion</h1>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#c2ef4e] text-slate-950 font-mono">
              Edge AI
            </span>
          </div>
          <p class="text-[10px] text-slate-400">Kamera Meja & Sensor Integritas</p>
        </div>
      </div>

      <!-- Connection & Status Pill -->
      <div class="flex items-center gap-2">
        <div
          class="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold font-mono"
          :class="isConnected
            ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-400'
            : 'bg-rose-950/50 border-rose-800/60 text-rose-400 animate-pulse'"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'"
          />
          <span>{{ isConnected ? 'Terhubung' : 'Menghubungkan...' }}</span>
        </div>

        <!-- Controls button: Flip camera -->
        <button
          @click="toggleCameraFacing"
          class="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 transition-colors cursor-pointer"
          title="Ganti Kamera"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSwitchingCamera }" />
        </button>
      </div>
    </header>

    <!-- Main Camera Viewport -->
    <main class="flex-1 my-3 sm:my-4 rounded-xl overflow-hidden border border-slate-800 bg-black relative flex items-center justify-center shadow-2xl">
      <video
        ref="videoEl"
        class="w-full h-full object-cover"
        autoplay
        playsinline
        muted
      ></video>

      <!-- Interactive 45° Desk Alignment Overlay Guide -->
      <div class="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
        <!-- Top Guide Banner -->
        <div class="flex items-center justify-between gap-2">
          <div class="text-[11px] font-semibold bg-slate-900/85 border border-slate-800 px-3 py-1.5 rounded-lg text-white backdrop-blur flex items-center gap-1.5 shadow-lg">
            <Compass class="w-3.5 h-3.5 text-[#c2ef4e]" />
            <span>Sudut Rekomendasi: 45° ke Meja & Tangan</span>
          </div>

          <!-- Stability Indicator -->
          <div
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border backdrop-blur flex items-center gap-1.5 shadow-lg"
            :class="telemetry.stabilityScore >= 80
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
              : 'bg-amber-950/70 border-amber-700 text-amber-300 animate-pulse'"
          >
            <ShieldCheck class="w-3 h-3" />
            <span>Stabil: {{ telemetry.stabilityScore }}%</span>
          </div>
        </div>

        <!-- Center Desk Framing Reticle -->
        <div class="relative w-full h-44 sm:h-56 mx-auto border-2 border-dashed rounded-xl transition-colors duration-300 flex items-center justify-center"
          :class="telemetry.phonePickedUp ? 'border-rose-500 bg-rose-500/10' : 'border-indigo-500/40 bg-indigo-500/10'"
        >
          <!-- Corner brackets for target reticle -->
          <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
          <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
          <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>

          <div v-if="telemetry.phonePickedUp" class="text-center px-4 py-2 bg-rose-950/90 border border-rose-600 rounded-lg text-xs font-bold text-rose-200 animate-pulse">
            ⚠️ PERINGATAN: Jangan Mengangkat Smartphone!
          </div>
          <div v-else class="text-center text-[11px] text-slate-300 font-medium px-4">
            Area Pantauan Keyboard, Layar Laptop, & Meja Kerja
          </div>
        </div>

        <!-- Bottom Telemetry HUD Overlay -->
        <div class="grid grid-cols-3 gap-2 bg-slate-900/85 border border-slate-800 rounded-xl p-2.5 backdrop-blur shadow-lg">
          <!-- Motion Level -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Gerakan</span>
              <span class="font-mono font-bold" :class="telemetry.motionLevel > 60 ? 'text-rose-400' : 'text-emerald-400'">
                {{ telemetry.motionLevel }}%
              </span>
            </div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="telemetry.motionLevel > 60 ? 'bg-rose-500' : telemetry.motionLevel > 30 ? 'bg-amber-400' : 'bg-emerald-400'"
                :style="{ width: `${Math.min(100, telemetry.motionLevel)}%` }"
              />
            </div>
          </div>

          <!-- Edge AI Status -->
          <div class="space-y-1 border-x border-slate-800 px-2 text-center">
            <span class="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Edge CV</span>
            <span class="text-[11px] font-bold text-[#c2ef4e] flex items-center justify-center gap-1 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] animate-ping"></span>
              {{ telemetry.fps }} FPS
            </span>
          </div>

          <!-- Light & Placement Level -->
          <div class="space-y-1 text-right">
            <div class="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
              <Sun class="w-3 h-3 text-amber-400" />
              <span>Cahaya</span>
            </div>
            <span class="text-[11px] font-bold font-mono text-white">
              {{ telemetry.lightLevel > 180 ? 'Terang' : telemetry.lightLevel > 40 ? 'Optimal' : 'Redup' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Battery Saver Dim Overlay (Optional Screen Dimming to Save Battery) -->
      <div
        v-if="isDimmed"
        @click="isDimmed = false"
        class="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
      >
        <Moon class="w-10 h-10 text-indigo-400 mb-2 animate-pulse" />
        <h4 class="text-sm font-bold text-white">Mode Hemat Daya Layar Aktif</h4>
        <p class="text-xs text-slate-400 mt-1">Kamera & Edge AI tetap aktif memantau di latar belakang.</p>
        <span class="mt-4 px-4 py-2 rounded-lg bg-slate-950 text-xs text-[#c2ef4e] font-semibold border border-slate-800 font-mono">
          Ketuk layar untuk menampilkan kembali
        </span>
      </div>
    </main>

    <!-- Footer Controls & Calibration -->
    <header class="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2 shadow-lg backdrop-blur z-20">
      <div class="flex items-center justify-between gap-3">
        <button
          @click="recalibrateOrientation"
          class="flex-1 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <SlidersHorizontal class="w-3.5 h-3.5 text-[#c2ef4e]" />
          <span>Kalibrasi Ulang Posisi</span>
        </button>

        <button
          @click="isDimmed = !isDimmed"
          class="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Moon class="w-3.5 h-3.5 text-indigo-400" />
          <span>{{ isDimmed ? 'Layar Nyala' : 'Redupkan' }}</span>
        </button>

        <button
          v-if="!token || !sessionId"
          @click="showManualModal = true"
          class="py-2 px-3 rounded-lg bg-[#c2ef4e] hover:bg-lime-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <KeyRound class="w-3.5 h-3.5" />
          <span>PIN</span>
        </button>
      </div>

      <div class="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium font-mono">
        <span>Sesi: #{{ sessionId }}</span>
        <span class="flex items-center gap-1">
          <Lock class="w-3 h-3 text-emerald-400" />
          Screen Wake Lock: {{ hasWakeLock ? 'Aktif' : 'Standby' }}
        </span>
      </div>
    </header>

    <!-- Manual Pairing PIN Modal (If QR not scanned with params) -->
    <div v-if="showManualModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-900">
        <h3 class="text-base font-bold text-slate-900">Hubungkan Manual</h3>
        <p class="text-xs text-slate-500">Masukkan ID Sesi dan Token yang tertera di layar komputer Anda:</p>

        <div class="space-y-3">
          <div>
            <label class="text-[11px] font-semibold text-slate-700 block mb-1 font-mono">Session ID</label>
            <input
              v-model="manualSessionId"
              type="number"
              placeholder="Contoh: 1"
              class="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>
          <div>
            <label class="text-[11px] font-semibold text-slate-700 block mb-1 font-mono">Token Pairing</label>
            <input
              v-model="manualToken"
              type="text"
              placeholder="Masukkan token..."
              class="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 font-mono text-xs"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="showManualModal = false"
            class="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            @click="applyManualPairing"
            class="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Hubungkan
          </button>
        </div>
      </div>
    </div>

    <!-- Direct Teacher Warning Modal for Mobile -->
    <div v-if="warningModalOpen" class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-rose-950/95 border-2 border-rose-600 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center animate-in fade-in zoom-in duration-200">
        <div class="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500 text-rose-300 flex items-center justify-center mx-auto">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-black text-white uppercase tracking-wider">Peringatan dari Pengawas</h3>
          <p class="text-[11px] text-rose-300 mt-0.5">Pengawas: {{ warningTeacherName }}</p>
        </div>
        <p class="text-xs font-semibold text-rose-100 bg-rose-900/40 p-3 rounded-xl border border-rose-800/50 leading-relaxed text-left">
          "{{ warningMessage }}"
        </p>
        <button
          @click="warningModalOpen = false"
          class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Compass,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  SlidersHorizontal,
  KeyRound,
  Lock,
  AlertTriangle,
} from 'lucide-vue-next'
import { CompanionEdgeEngine, type CompanionTelemetry } from '@/utils/companionEdge'

const route = useRoute()
const router = useRouter()

const videoEl = ref<HTMLVideoElement | null>(null)
const isConnected = ref<boolean>(false)
const isSwitchingCamera = ref<boolean>(false)
const currentFacingMode = ref<'environment' | 'user'>('environment')
const isDimmed = ref<boolean>(false)
const hasWakeLock = ref<boolean>(false)
const showManualModal = ref<boolean>(false)
const manualSessionId = ref<string>('')
const manualToken = ref<string>('')

// Teacher Warning State
const warningModalOpen = ref<boolean>(false)
const warningTeacherName = ref<string>('')
const warningMessage = ref<string>('')

const token = ref<string>((route.query.token || route.query.pairing_token) as string || '')
const sessionId = ref<number>(Number(route.query.sessionId || route.query.session_id) || 1)

let companionEngine: CompanionEdgeEngine | null = null
let ws: WebSocket | null = null
let wakeLockSentinel: any = null

const telemetry = reactive<CompanionTelemetry>({
  motionLevel: 0,
  stabilityScore: 100,
  lightLevel: 100,
  deskDetected: true,
  phonePickedUp: false,
  fps: 3,
})

async function initCompanionEngine(): Promise<void> {
  if (companionEngine) {
    companionEngine.stop()
  }

  companionEngine = new CompanionEdgeEngine({
    onCameraReady: () => {
      // Camera started
    },
    onViolation: (eventType, severity, snapshotBase64, details) => {
      // Transmit client-detected Edge CV violation to server over WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'COMPANION_EDGE_VIOLATION',
          event_type: eventType,
          severity,
          snapshot: snapshotBase64,
          details,
          timestamp: Date.now(),
        }))
      }
    },
    onFrame: (snapshotBase64, currentTelemetry) => {
      // Transmit low-bandwidth live preview thumbnail to teacher monitor
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'COMPANION_FRAME',
          frame: snapshotBase64,
          metrics: currentTelemetry,
          timestamp: Date.now(),
        }))
      }
    },
    onTelemetry: (t) => {
      telemetry.motionLevel = t.motionLevel
      telemetry.stabilityScore = t.stabilityScore
      telemetry.lightLevel = t.lightLevel
      telemetry.deskDetected = t.deskDetected
      telemetry.phonePickedUp = t.phonePickedUp
      telemetry.fps = t.fps
    },
  })

  if (videoEl.value) {
    await companionEngine.start(videoEl.value, currentFacingMode.value)
  }
}

async function toggleCameraFacing(): Promise<void> {
  try {
    isSwitchingCamera.value = true
    currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment'
    await initCompanionEngine()
  } catch (err) {
    console.warn('Failed to switch camera:', err)
  } finally {
    isSwitchingCamera.value = false
  }
}

function recalibrateOrientation(): void {
  if (companionEngine) {
    companionEngine.recalibrateOrientation()
    telemetry.stabilityScore = 100
  }
}

function applyManualPairing(): void {
  if (manualSessionId.value) sessionId.value = Number(manualSessionId.value)
  if (manualToken.value) token.value = manualToken.value
  showManualModal.value = false
  initWebSocket()
}

async function requestScreenWakeLock(): Promise<void> {
  try {
    if ('wakeLock' in navigator) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen')
      hasWakeLock.value = true
      wakeLockSentinel.addEventListener('release', () => {
        hasWakeLock.value = false
      })
    }
  } catch (err) {
    console.warn('[WakeLock] Unable to acquire screen wake lock:', err)
  }
}

function initWebSocket(): void {
  if (ws) {
    ws.close()
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws/proctoring/${sessionId.value}/companion?token=${token.value}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    isConnected.value = true
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.event === 'TEACHER_DIRECT_WARNING') {
        warningTeacherName.value = msg.payload.teacher_name || 'Pengawas Ujian'
        warningMessage.value = msg.payload.message_text || 'Perhatikan area meja pengerjaan!'
        warningModalOpen.value = true

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([300, 100, 300])
        }
      }
    } catch (err) {
      console.warn('[CompanionWS] Error parsing message:', err)
    }
  }

  ws.onclose = () => {
    isConnected.value = false
    setTimeout(() => {
      if (!isConnected.value) initWebSocket()
    }, 4000)
  }

  ws.onerror = (err) => {
    console.warn('[CompanionWS] WebSocket error:', err)
  }
}

onMounted(async () => {
  await requestScreenWakeLock()
  await initCompanionEngine()
  initWebSocket()
})

onUnmounted(() => {
  if (companionEngine) {
    companionEngine.stop()
  }
  if (ws) {
    ws.close()
  }
  if (wakeLockSentinel) {
    wakeLockSentinel.release()
  }
})
</script>
