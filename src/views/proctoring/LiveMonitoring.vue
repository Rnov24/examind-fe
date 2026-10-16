<template>
  <div class="space-y-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
      <div class="flex items-center gap-3.5">
        <router-link :to="`/exams/${examId}`" class="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs">
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Live Monitoring Pengawasan AI</h2>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono shadow-xs">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              LIVE PROCTOR
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Pemantauan real-time dual-camera & deteksi anomali integritas siswa</p>
        </div>
      </div>

      <!-- Quick Stats Filter -->
      <div class="flex items-center gap-2 self-stretch sm:self-auto">
        <button
          @click="filterMode = 'all'"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer font-display tracking-wide"
          :class="filterMode === 'all' ? 'bg-slate-900 text-white shadow-card' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'"
        >
          Semua Siswa ({{ studentsList.length }})
        </button>
        <button
          @click="filterMode = 'flagged'"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer font-display tracking-wide"
          :class="filterMode === 'flagged' ? 'bg-amber-600 text-white shadow-card' : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 shadow-xs'"
        >
          Perlu Klarifikasi ({{ flaggedCount }})
        </button>
      </div>
    </div>

    <!-- Live Grid Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="student in filteredStudents"
        :key="student.session_id"
        class="bg-white rounded-2xl border transition-all duration-200 p-5 space-y-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 text-slate-900"
        :class="student.status === 'aborted' ? 'border-rose-400 ring-2 ring-rose-200/80' : student.integrity_score < 70 ? 'border-rose-400 ring-2 ring-rose-200/80' : student.integrity_score < 90 ? 'border-amber-400 ring-2 ring-amber-200/80' : 'border-slate-200/80'"
      >
        <!-- Card Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h4 class="font-display font-bold text-slate-900 text-sm leading-snug truncate">{{ student.student_name }}</h4>
              <span
                v-if="student.status === 'aborted'"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 tracking-wider font-mono flex items-center gap-1 shrink-0"
              >
                <ShieldAlert class="w-3 h-3 text-rose-600" />
                Didiskualifikasi
              </span>
              <span
                v-else-if="student.integrity_score < 90"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 tracking-wider font-mono flex items-center gap-1 animate-pulse shrink-0"
              >
                <AlertTriangle class="w-3 h-3 text-amber-600" />
                Perlu Klarifikasi
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider font-mono flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 class="w-3 h-3 text-emerald-600" />
                Aman
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono mt-0.5">{{ student.student_identifier }}</p>
          </div>

          <!-- Integrity Score Pill -->
          <div
            class="px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0 shadow-xs tabular-nums"
            :class="student.status === 'aborted' ? 'bg-rose-50 text-rose-700 border border-rose-200' : student.integrity_score >= 90 ? 'bg-[#c2ef4e]/20 text-slate-900 border border-[#c2ef4e]' : student.integrity_score >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
          >
            {{ student.status === 'aborted' ? '0%' : student.integrity_score + '%' }}
          </div>
        </div>

        <!-- Latest Event Snapshot or Status (Dual-Camera Picture-in-Picture) -->
        <div class="rounded-xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center border border-slate-200/80 shadow-inner group">
          <div v-if="student.status === 'aborted'" class="text-center p-4 bg-slate-950/95 w-full h-full flex flex-col items-center justify-center space-y-1.5">
            <ShieldAlert class="w-7 h-7 text-rose-500" />
            <span class="text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">Didiskualifikasi Pengawas</span>
            <span class="text-[11px] text-slate-300 font-medium px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 max-w-[90%] truncate">{{ student.last_event ? student.last_event.replace('_', ' ') : 'Pelanggaran Dikonfirmasi Guru' }}</span>
          </div>
          <img
            v-else-if="student.last_snapshot_url"
            :src="student.last_snapshot_url"
            alt="Proctoring Snapshot"
            class="w-full h-full object-cover"
          />
          <div v-else class="text-center p-4">
            <UserCheck class="w-8 h-8 text-slate-500 mx-auto mb-1" />
            <span class="text-[11px] text-slate-400 font-medium">Tidak ada anomali visual</span>
          </div>

          <!-- Secondary Camera (Companion) Picture-in-Picture Thumbnail -->
          <div
            v-if="student.companion_snapshot_url"
            class="absolute top-2 right-2 w-20 h-14 rounded-lg overflow-hidden border-2 border-indigo-500 bg-black shadow-lg"
            title="Cam 2 (Mobile Desk Cam)"
          >
            <img :src="student.companion_snapshot_url" class="w-full h-full object-cover" alt="Cam 2" />
            <div class="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-[#c2ef4e] text-center font-bold font-mono">
              Cam 2
            </div>
          </div>
          <div
            v-else
            class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-semibold border backdrop-blur font-mono"
            :class="student.companion_paired ? 'bg-indigo-950/80 border-indigo-500/80 text-emerald-300' : 'bg-black/60 border-slate-700 text-slate-400'"
          >
            {{ student.companion_paired ? 'Cam 2: OK' : 'Cam 2: Off' }}
          </div>

          <div
            v-if="student.last_event && student.status !== 'aborted'"
            class="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-md rounded-lg p-1.5 px-2.5 flex items-center justify-between text-[11px] border border-white/10"
          >
            <span class="font-semibold text-rose-300 capitalize truncate mr-2">{{ student.last_event.replace('_', ' ') }}</span>
            <span class="text-slate-400 text-[10px] font-mono shrink-0">{{ student.last_event_time }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-1">
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="openWarningModal(student)"
              :disabled="student.status === 'aborted'"
              class="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Bell class="w-3.5 h-3.5 text-amber-600" />
              <span>Peringatkan</span>
            </button>
            <button
              @click="openSnapshotModal(student)"
              class="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <History class="w-3.5 h-3.5 text-indigo-600" />
              <span>Log Bukti</span>
            </button>
          </div>

          <!-- Human-in-the-Loop Proctoring Decision Bar -->
          <div v-if="student.status !== 'aborted' && student.integrity_score < 90" class="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              @click="tolerateStudent(student)"
              :disabled="isProcessingAction"
              title="Toleransi wajar sebagai false positive / pergerakan alami"
              class="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Check class="w-3.5 h-3.5 text-emerald-600" />
              <span>Toleransi</span>
            </button>
            <button
              @click="openDisqualifyModal(student)"
              :disabled="isProcessingAction"
              title="Putuskan diskualifikasi resmi oleh pengawas"
              class="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <ShieldAlert class="w-3.5 h-3.5 text-rose-600" />
              <span>Diskualifikasi</span>
            </button>
          </div>
          <div v-else-if="student.status === 'aborted'" class="pt-1.5 border-t border-slate-100 text-center">
            <span class="text-[10px] text-rose-600 font-bold font-mono">Sesi Gugur (Keputusan Pengawas)</span>
          </div>
        </div>
      </div>

      <div v-if="filteredStudents.length === 0" class="col-span-full bg-white rounded-2xl p-16 text-center text-slate-500 border border-slate-200/80 shadow-card">
        Tidak ada data peserta ujian yang sesuai filter.
      </div>
    </div>

    <!-- Send Warning Modal -->
    <div v-if="activeWarningStudent" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 text-slate-900">
        <h3 class="text-base font-bold text-slate-900">Kirim Peringatan Langsung</h3>
        <p class="text-xs text-slate-500">
          Pesan akan muncul seketika di layar ujian siswa <span class="font-bold text-slate-900">{{ activeWarningStudent.student_name }}</span>.
        </p>

        <textarea
          v-model="warningMessageText"
          rows="3"
          placeholder="Contoh: Harap fokus dan pandangan tetap ke arah layar laptop..."
          class="w-full p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-slate-900"
        ></textarea>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="activeWarningStudent = null"
            class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer shadow-xs"
          >
            Batal
          </button>
          <button
            @click="sendWarning"
            :disabled="!warningMessageText.trim()"
            class="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Kirim ke Layar Siswa
          </button>
        </div>
      </div>
    </div>

    <!-- Log & Snapshot Detail Modal -->
    <div v-if="selectedStudentLogs" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl border border-slate-200 text-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-900">Riwayat Insiden Pengawasan</h3>
            <p class="text-xs text-slate-500 font-mono">{{ selectedStudentLogs.student_name }} ({{ selectedStudentLogs.student_identifier }})</p>
          </div>
          <button @click="selectedStudentLogs = null" class="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div
            v-for="log in studentIncidentLogs"
            :key="log.id"
            class="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="log.snapshot_url"
                :src="log.snapshot_url"
                class="w-16 h-12 object-cover rounded-lg border border-slate-300"
              />
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900 capitalize">{{ log.event_type.replace('_', ' ') }}</span>
                <p class="text-[11px] text-slate-500 font-mono">{{ formatTimestamp(log.event_timestamp) }} • Kamera: {{ log.camera_source }}</p>
                <span
                  class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono"
                  :class="log.teacher_verdict === 'confirmed_violation' ? 'bg-rose-50 text-rose-700 border border-rose-200' : log.teacher_verdict === 'ignored_false_positive' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                >
                  {{ log.teacher_verdict === 'confirmed_violation' ? 'Pelanggaran Dikonfirmasi' : log.teacher_verdict === 'ignored_false_positive' ? 'Diabaikan (False Positive)' : 'Pending Review' }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="setVerdict(log.id, 'ignored_false_positive')"
                class="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer shadow-xs"
              >
                Abaikan
              </button>
              <button
                @click="setVerdict(log.id, 'confirmed_violation')"
                class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
              >
                Konfirmasi
              </button>
            </div>
          </div>

          <div v-if="studentIncidentLogs.length === 0" class="p-8 text-center text-slate-500 text-xs">
            Belum ada insiden tercatat untuk siswa ini.
          </div>
        </div>

        <!-- Footer Actions in Log Modal -->
        <div class="border-t border-slate-200 pt-3 flex items-center justify-between gap-3">
          <div class="text-[11px] text-slate-500 font-medium">
            Prinsip Human-in-the-Loop: Evaluasi pengawas menentukan validitas pelanggaran.
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="selectedStudentLogs && selectedStudentLogs.status !== 'aborted'"
              @click="tolerateStudent(selectedStudentLogs)"
              :disabled="isProcessingAction"
              class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Check class="w-3.5 h-3.5 text-emerald-600" />
              <span>Toleransi Semua Anomali</span>
            </button>
            <button
              v-if="selectedStudentLogs && selectedStudentLogs.status !== 'aborted'"
              @click="openDisqualifyModal(selectedStudentLogs)"
              :disabled="isProcessingAction"
              class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <ShieldAlert class="w-3.5 h-3.5 text-rose-600" />
              <span>Putuskan Diskualifikasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deliberate Disqualification Decision Modal (Human-in-the-Loop) -->
    <div v-if="activeDisqualifyStudent" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 text-slate-900">
        <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div class="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <ShieldAlert class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 tracking-tight">Putusan Diskualifikasi Ujian</h3>
            <p class="text-xs text-slate-500 font-mono">{{ activeDisqualifyStudent.student_name }} ({{ activeDisqualifyStudent.student_identifier }})</p>
          </div>
        </div>

        <!-- Human-in-the-Loop Guarantee Notice -->
        <div class="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <p class="font-bold flex items-center gap-1.5">
            <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
            Prinsip Human-in-the-Loop EXAMIND:
          </p>
          <p class="text-[11px] text-amber-800 leading-relaxed">
            Sistem AI tidak pernah menggugurkan peserta secara sepihak. Diskualifikasi ini adalah keputusan sadar dan resmi dari Bapak/Ibu pengawas. Sesi siswa akan dihentikan seketika dan catatan resmi Anda akan tersimpan di lembar evaluasi.
          </p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Alasan Pelanggaran Resmi <span class="text-rose-600">*</span></label>
            <select
              v-model="disqualifyReason"
              class="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900"
            >
              <option value="Kerjasama / Menyontek Terang-terangan">Kerjasama / Menyontek Terang-terangan (Orang lain / Gadget)</option>
              <option value="Joki Ujian / Pergantian Peserta">Joki Ujian / Wajah Peserta Tidak Sesuai Terus Menerus</option>
              <option value="Meninggalkan Meja Ujian Tanpa Izin">Meninggalkan Meja Ujian Tanpa Izin (Face Absent Berkepanjangan)</option>
              <option value="Mengabaikan Peringatan Pengawas Berkali-kali">Mengabaikan Peringatan Pengawas Berkali-kali</option>
              <option value="Pelanggaran Integritas Akademik Berat Lainnya">Pelanggaran Integritas Akademik Berat Lainnya</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Verifikasi Pengawas (Opsional)</label>
            <textarea
              v-model="disqualifyNotes"
              rows="3"
              placeholder="Contoh: Terkonfirmasi membuka buku materi dan mengabaikan 2 kali peringatan pengawas pada menit 15 dan 22."
              class="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-900"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            @click="activeDisqualifyStudent = null"
            class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer shadow-xs"
          >
            Batalkan
          </button>
          <button
            @click="confirmDisqualifyStudent"
            :disabled="isProcessingAction || !disqualifyReason"
            class="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert class="w-4 h-4" />
            <span>{{ isProcessingAction ? 'Memproses...' : 'Tetapkan Diskualifikasi' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  Radio,
  Bell,
  History,
  UserCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Check,
} from 'lucide-vue-next'
import api from '@/lib/api'

const route = useRoute()
const examId = Number(route.params.id)

const filterMode = ref<'all' | 'flagged'>('all')
const studentsList = ref<any[]>([])
const activeWarningStudent = ref<any | null>(null)
const warningMessageText = ref<string>('')
const selectedStudentLogs = ref<any | null>(null)
const studentIncidentLogs = ref<any[]>([])

// Human-in-the-Loop Proctoring State
const isProcessingAction = ref<boolean>(false)
const activeDisqualifyStudent = ref<any | null>(null)
const disqualifyReason = ref<string>('Kerjasama / Menyontek Terang-terangan')
const disqualifyNotes = ref<string>('')

let ws: WebSocket | null = null

const flaggedCount = computed(() =>
  studentsList.value.filter(s => s.integrity_score < 90 || s.status === 'aborted').length
)

const filteredStudents = computed(() => {
  if (filterMode.value === 'flagged') {
    return studentsList.value.filter(s => s.integrity_score < 90 || s.status === 'aborted')
  }
  return studentsList.value
})

function formatTimestamp(ts: string): string {
  if (!ts) return '-'
  return new Date(ts).toLocaleTimeString('id-ID')
}

function openWarningModal(student: any): void {
  activeWarningStudent.value = student
  warningMessageText.value = 'Harap kembali fokus ke layar ujian dan jangan menoleh.'
}

async function sendWarning(): Promise<void> {
  if (!activeWarningStudent.value) return
  try {
    await api.post('/proctoring/send-warning', {
      session_id: activeWarningStudent.value.session_id,
      message_text: warningMessageText.value,
      urgency: 'high',
    })
    activeWarningStudent.value = null
    warningMessageText.value = ''
    alert('Peringatan telah terkirim!')
  } catch (err) {
    alert('Gagal mengirim peringatan')
  }
}

async function openSnapshotModal(student: any): Promise<void> {
  selectedStudentLogs.value = student
  try {
    const res = await api.get(`/proctoring/exam/${examId}/logs`)
    const allLogs = res.data.data || []
    studentIncidentLogs.value = allLogs.filter((l: any) => l.session_id === student.session_id)
  } catch (err) {
    console.error('Failed to load student logs:', err)
  }
}

async function setVerdict(logId: number, verdict: string): Promise<void> {
  try {
    const res = await api.put(`/proctoring/log/${logId}/verdict`, { verdict })
    const target = studentIncidentLogs.value.find(l => l.id === logId)
    if (target) target.teacher_verdict = verdict
    const newScore = res.data.data?.new_integrity_score
    if (newScore !== undefined && selectedStudentLogs.value) {
      selectedStudentLogs.value.integrity_score = newScore
      const studentInList = studentsList.value.find(s => s.session_id === selectedStudentLogs.value.session_id)
      if (studentInList) studentInList.integrity_score = newScore
    }
  } catch (err) {
    alert('Gagal memperbarui verdict')
  }
}

async function tolerateStudent(student: any): Promise<void> {
  if (!student) return
  try {
    isProcessingAction.value = true
    const res = await api.post('/proctoring/session/tolerate', {
      session_id: student.session_id,
      notes: 'Toleransi wajar oleh pengawas (false positive / pergerakan wajar)',
    })
    const newScore = res.data.data?.new_integrity_score ?? 100
    student.integrity_score = newScore
    student.last_event = 'Ditoleransi Pengawas'

    const target = studentsList.value.find(s => s.session_id === student.session_id)
    if (target) {
      target.integrity_score = newScore
      target.last_event = 'Ditoleransi Pengawas'
    }

    if (selectedStudentLogs.value && selectedStudentLogs.value.session_id === student.session_id) {
      selectedStudentLogs.value.integrity_score = newScore
      studentIncidentLogs.value.forEach(l => {
        if (l.teacher_verdict !== 'confirmed_violation') {
          l.teacher_verdict = 'ignored_false_positive'
        }
      })
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal memberikan toleransi')
  } finally {
    isProcessingAction.value = false
  }
}

function openDisqualifyModal(student: any): void {
  activeDisqualifyStudent.value = student
  disqualifyReason.value = 'Kerjasama / Menyontek Terang-terangan'
  disqualifyNotes.value = ''
}

async function confirmDisqualifyStudent(): Promise<void> {
  if (!activeDisqualifyStudent.value) return
  try {
    isProcessingAction.value = true
    await api.post('/proctoring/session/disqualify', {
      session_id: activeDisqualifyStudent.value.session_id,
      reason: disqualifyReason.value,
      notes: disqualifyNotes.value || 'Diskualifikasi resmi diputuskan oleh pengawas ujian.',
    })

    const target = studentsList.value.find(s => s.session_id === activeDisqualifyStudent.value.session_id)
    if (target) {
      target.status = 'aborted'
      target.integrity_score = 0
      target.last_event = disqualifyReason.value
    }

    if (selectedStudentLogs.value && selectedStudentLogs.value.session_id === activeDisqualifyStudent.value.session_id) {
      selectedStudentLogs.value.status = 'aborted'
      selectedStudentLogs.value.integrity_score = 0
    }

    activeDisqualifyStudent.value = null
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menetapkan diskualifikasi')
  } finally {
    isProcessingAction.value = false
  }
}

async function loadExamSessions(): Promise<void> {
  try {
    const res = await api.get(`/grading/exam/${examId}/sessions`)
    const sessions = res.data.data || []
    studentsList.value = sessions.map((s: any) => ({
      session_id: s.session_id,
      student_name: s.student_name,
      student_identifier: s.student_identifier,
      status: s.status,
      integrity_score: s.status === 'aborted' ? 0 : (s.integrity_score ?? 100),
      last_snapshot_url: null,
      last_event: s.status === 'aborted' ? 'Didiskualifikasi Pengawas' : null,
      last_event_time: null,
    }))
  } catch (err) {
    console.error('Failed to load exam sessions:', err)
  }
}

function initLiveMonitorWs(): void {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws/exam/${examId}/live-monitor`
  ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.event === 'PROCTORING_FLAG_ALERT' || msg.event === 'STUDENT_DISQUALIFIED') {
        const payload = msg.payload
        const target = studentsList.value.find(s => s.session_id === payload.session_id)
        if (target) {
          target.integrity_score = payload.current_integrity_score ?? target.integrity_score
          target.last_event = payload.event_type || payload.reason
          if (payload.snapshot_url) {
            target.last_snapshot_url = payload.snapshot_url
          }
          if (payload.status) {
            target.status = payload.status
          }
          target.last_event_time = new Date(payload.timestamp).toLocaleTimeString('id-ID')
        }
      } else if (msg.event === 'COMPANION_FRAME_UPDATE') {
        const payload = msg.payload
        const target = studentsList.value.find(s => s.session_id === payload.session_id)
        if (target) {
          target.companion_snapshot_url = payload.snapshot_url
          target.companion_metrics = payload.metrics
          target.companion_paired = true
        }
      } else if (msg.event === 'COMPANION_STATUS_CHANGE') {
        const payload = msg.payload
        const target = studentsList.value.find(s => s.session_id === payload.session_id)
        if (target) {
          target.companion_paired = payload.companion_paired
        }
      }
    } catch (err) {
      console.warn('[LiveMonitorWS] Error parsing message:', err)
    }
  }

  ws.onclose = () => {
    setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CLOSED) initLiveMonitorWs()
    }, 5000)
  }
}

onMounted(async () => {
  await loadExamSessions()
  initLiveMonitorWs()
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>
