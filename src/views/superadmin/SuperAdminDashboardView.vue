<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-purple-50/70 rounded-full blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-50/50 rounded-full blur-2xl"></div>

      <div class="relative flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center justify-center font-bold shrink-0 shadow-xs ring-4 ring-indigo-50/70">
          <Key v-if="!authStore.isSuperAdmin || activeTab === 'secrets'" class="w-6 h-6 text-indigo-600" />
          <Building2 v-else class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {{ !authStore.isSuperAdmin ? 'Secret & API Key Manager' : 'Platform SaaS Super Admin' }}
            </h2>
            <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-[#c2ef4e] font-mono shadow-xs">
              {{ !authStore.isSuperAdmin ? 'Kredensial & Integrasi' : 'Multi-Tenant Hub' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            {{ !authStore.isSuperAdmin ? 'Kelola kunci API Google Gemini dan Resend untuk generator soal, evaluasi esai AI, dan email sekolah.' : 'Pengelolaan seluruh institusi sekolah, alokasi paket langganan, dan manajemen secret API pihak ketiga' }}
          </p>
        </div>
      </div>

      <div class="relative flex items-center gap-2.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <button
          v-if="authStore.isSuperAdmin && activeTab === 'tenants'"
          @click="showCreateModal = true"
          class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
        >
          <Plus class="w-4 h-4 text-[#c2ef4e]" />
          <span>Onboard Sekolah Baru</span>
        </button>

        <button
          v-if="activeTab === 'secrets'"
          @click="openAddSecretModal"
          class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card hover:shadow-card-hover flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide"
        >
          <Plus class="w-4 h-4 text-[#c2ef4e]" />
          <span>Tambah Secret API</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs (Only shown if user is SuperAdmin) -->
    <div v-if="authStore.isSuperAdmin" class="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
      <button
        type="button"
        @click="switchTab('tenants')"
        :class="[
          'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide',
          activeTab === 'tenants'
            ? 'bg-slate-900 text-white shadow-card'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
        ]"
      >
        <Building2 class="w-4 h-4" />
        <span>Manajemen Institusi (Tenants)</span>
      </button>

      <button
        type="button"
        @click="switchTab('secrets')"
        :class="[
          'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer font-display tracking-wide',
          activeTab === 'secrets'
            ? 'bg-slate-900 text-white shadow-card'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
        ]"
      >
        <Key class="w-4 h-4" />
        <span>Secret & API Key Manager</span>
      </button>
    </div>

    <!-- TAB 1: TENANTS MANAGEMENT -->
    <div v-if="activeTab === 'tenants'" class="space-y-6">
      <!-- Global SaaS KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Total Sekolah / Tenant</span>
            <div class="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Building2 class="w-4 h-4" />
            </div>
          </div>
          <div class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {{ stats?.total_tenants || 0 }}
          </div>
          <p class="text-[11px] text-emerald-600 font-semibold font-mono">
            {{ stats?.active_tenants || 0 }} tenant aktif beroperasi
          </p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Siswa Terdaftar Global</span>
            <div class="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <GraduationCap class="w-4 h-4" />
            </div>
          </div>
          <div class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {{ stats?.total_global_students || 0 }}
          </div>
          <p class="text-[11px] text-slate-400 font-mono">
            Dari {{ stats?.total_global_users || 0 }} total pengguna platform
          </p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Guru & Tenaga Pendidik</span>
            <div class="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Users class="w-4 h-4" />
            </div>
          </div>
          <div class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {{ stats?.total_global_teachers || 0 }}
          </div>
          <p class="text-[11px] text-slate-400 font-mono">
            Pengampu dan penyusun ujian
          </p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Kredit AI Digunakan</span>
            <div class="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Cpu class="w-4 h-4" />
            </div>
          </div>
          <div class="font-display text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {{ stats?.total_ai_credits_used || 0 }}
          </div>
          <p class="text-[11px] text-slate-400 font-mono">
            Total konsumsi token LLM global
          </p>
        </div>
      </div>

      <!-- Decomposed Tenant Table -->
      <TenantTable
        :tenants="tenantsList"
        :search="searchQuery"
        :plan="filterPlan"
        @update:search="onSearchUpdate"
        @update:plan="onPlanUpdate"
        @create-tenant="showCreateModal = true"
        @change-plan="promptChangePlan"
        @toggle-status="toggleStatus"
      />
    </div>

    <!-- TAB 2: SECRET & API KEY MANAGER (Decomposed) -->
    <SecretManagerTab v-if="activeTab === 'secrets'" ref="secretManagerRef" />

    <!-- Decomposed Tenant Modal -->
    <TenantModal
      :is-open="showCreateModal"
      :form="createForm"
      :is-submitting="isSubmitting"
      @close="showCreateModal = false"
      @submit="handleCreateTenant"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Building2,
  GraduationCap,
  Users,
  Cpu,
  Plus,
  Key,
} from 'lucide-vue-next'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import TenantTable from './components/TenantTable.vue'
import TenantModal from './components/TenantModal.vue'
import SecretManagerTab from './components/SecretManagerTab.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'tenants' | 'secrets'>(
  !authStore.isSuperAdmin || route.path === '/superadmin/secrets' || route.query.tab === 'secrets' ? 'secrets' : 'tenants'
)
const secretManagerRef = ref<InstanceType<typeof SecretManagerTab> | null>(null)

watch(
  () => [route.path, route.query.tab],
  ([path, tab]) => {
    if (!authStore.isSuperAdmin || path === '/superadmin/secrets' || tab === 'secrets') {
      activeTab.value = 'secrets'
    } else {
      activeTab.value = 'tenants'
    }
  },
  { immediate: true }
)

function switchTab(tab: 'tenants' | 'secrets'): void {
  activeTab.value = tab
  if (tab === 'secrets') {
    router.push({ path: '/superadmin/secrets' })
  } else {
    router.push({ path: '/superadmin/dashboard' })
  }
}

function openAddSecretModal(): void {
  secretManagerRef.value?.openAddSecretModal()
}

// Tenant States
const stats = ref<any | null>(null)
const tenantsList = ref<any[]>([])
const searchQuery = ref('')
const filterPlan = ref('')
const showCreateModal = ref(false)
const isSubmitting = ref(false)

const createForm = ref({
  name: '',
  code: '',
  subscription_plan: 'pro',
  admin_identifier: '',
  admin_full_name: '',
  admin_email: '',
  admin_password: 'Password123!',
})

function onSearchUpdate(val: string): void {
  searchQuery.value = val
  loadTenants()
}

function onPlanUpdate(val: string): void {
  filterPlan.value = val
  loadTenants()
}

async function loadStats(): Promise<void> {
  try {
    const res = await api.get('/superadmin/stats')
    stats.value = res.data.data
  } catch (err) {
    console.error('Failed to load superadmin stats:', err)
  }
}

async function loadTenants(): Promise<void> {
  try {
    const params: Record<string, string> = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterPlan.value) params.plan = filterPlan.value
    const res = await api.get('/superadmin/tenants', { params })
    tenantsList.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load tenants list:', err)
  }
}

async function toggleStatus(tenantId: number): Promise<void> {
  try {
    await api.patch(`/superadmin/tenants/${tenantId}/toggle-status`)
    await loadTenants()
    await loadStats()
  } catch (err) {
    alert('Gagal mengubah status tenant.')
  }
}

async function promptChangePlan(tenant: any): Promise<void> {
  const newPlan = prompt(`Ubah paket langganan untuk ${tenant.name} (starter / pro / enterprise):`, tenant.subscription_plan)
  if (!newPlan || !['starter', 'pro', 'enterprise'].includes(newPlan.toLowerCase())) {
    if (newPlan) alert('Pilihan paket tidak valid (harus starter, pro, atau enterprise).')
    return
  }

  try {
    await api.patch(`/superadmin/tenants/${tenant.id}`, { subscription_plan: newPlan.toLowerCase() })
    await loadTenants()
    await loadStats()
  } catch (err) {
    alert('Gagal memperbarui paket langganan.')
  }
}

async function handleCreateTenant(): Promise<void> {
  try {
    isSubmitting.value = true
    await api.post('/superadmin/tenants', createForm.value)
    showCreateModal.value = false
    createForm.value = {
      name: '',
      code: '',
      subscription_plan: 'pro',
      admin_identifier: '',
      admin_full_name: '',
      admin_email: '',
      admin_password: 'Password123!',
    }
    await loadTenants()
    await loadStats()
    alert('Sekolah baru berhasil didaftarkan ke platform SaaS!')
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal mendaftarkan tenant sekolah.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (authStore.isSuperAdmin) {
    await loadStats()
    await loadTenants()
  }
})
</script>
