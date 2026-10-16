<template>
  <div class="space-y-6">
    <!-- Floating Toast Notification -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toast"
        :class="[
          'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 max-w-md text-xs font-semibold',
          toast.type === 'success'
            ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
            : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-900/10'
        ]"
      >
        <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4 text-[#c2ef4e] shrink-0" />
        <AlertTriangle v-else class="w-4 h-4 text-rose-600 shrink-0" />
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="toast = null" class="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </Transition>

    <!-- Security & Hot-Reload Banner -->
    <div class="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs shrink-0">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <h3 class="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
            <span>EXAMIND At-Rest Encryption & Dynamic Secret Hot-Reload</span>
            <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#c2ef4e] text-slate-950 font-mono shadow-xs">
              Fernet AES-128 Active
            </span>
          </h3>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Kunci API pihak ketiga disimpan terenkripsi di tabel MySQL <code class="text-slate-800 font-mono font-bold">system_secrets</code> dan langsung diterapkan secara realtime tanpa restart server.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="loadSecrets"
          :disabled="isSecretsLoading"
          class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <RefreshCw class="w-3.5 h-3.5 text-slate-600" :class="{ 'animate-spin': isSecretsLoading }" />
          <span>{{ isSecretsLoading ? 'Menyinkronkan...' : 'Refresh Status' }}</span>
        </button>
      </div>
    </div>

    <!-- Quick Provider Health Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Gemini Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-card-hover transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700 font-black text-sm font-mono shadow-xs">
              G
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Google Gemini AI</h4>
              <p class="text-[11px] text-slate-500">Generator Soal & Auto-Grading Esai</p>
            </div>
          </div>
          <span
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border',
              getSecretByKey('GEMINI_API_KEY')?.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : getSecretByKey('GEMINI_API_KEY')
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            ]"
          >
            {{ getSecretByKey('GEMINI_API_KEY')?.is_active ? 'Aktif di DB' : getSecretByKey('GEMINI_API_KEY') ? 'Nonaktif' : 'Env Fallback' }}
          </span>
        </div>

        <div class="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
          <span class="truncate">{{ getSecretByKey('GEMINI_API_KEY')?.masked_value || 'Menggunakan .env / Fallback' }}</span>
          <span class="text-[10px] font-sans font-semibold text-slate-400 shrink-0">v1beta</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="testSecretConnection('gemini', 'GEMINI_API_KEY')"
            :disabled="testingKey === 'GEMINI_API_KEY'"
            class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Loader2 v-if="testingKey === 'GEMINI_API_KEY'" class="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
            <Zap v-else class="w-3.5 h-3.5 text-[#c2ef4e]" />
            <span>{{ testingKey === 'GEMINI_API_KEY' ? 'Menguji...' : 'Uji Koneksi' }}</span>
          </button>

          <button
            @click="handleConfigureProvider('gemini', 'GEMINI_API_KEY')"
            class="py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Settings class="w-3.5 h-3.5 text-slate-500" />
            <span>{{ getSecretByKey('GEMINI_API_KEY') ? 'Ubah Kunci' : 'Atur Kunci' }}</span>
          </button>
        </div>
      </div>

      <!-- Resend Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-card-hover transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 font-black text-sm font-mono shadow-xs">
              R
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Resend Email API</h4>
              <p class="text-[11px] text-slate-500">Pengiriman OTP & Transaksional</p>
            </div>
          </div>
          <span
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border',
              getSecretByKey('RESEND_API_KEY')?.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : getSecretByKey('RESEND_API_KEY')
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            ]"
          >
            {{ getSecretByKey('RESEND_API_KEY')?.is_active ? 'Aktif di DB' : getSecretByKey('RESEND_API_KEY') ? 'Nonaktif' : 'Env Fallback' }}
          </span>
        </div>

        <div class="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
          <span class="truncate">{{ getSecretByKey('RESEND_API_KEY')?.masked_value || 'Menggunakan .env / Fallback' }}</span>
          <span class="text-[10px] font-sans font-semibold text-slate-400 shrink-0">SMTP/API</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="testSecretConnection('resend', 'RESEND_API_KEY')"
            :disabled="testingKey === 'RESEND_API_KEY'"
            class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Loader2 v-if="testingKey === 'RESEND_API_KEY'" class="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
            <Zap v-else class="w-3.5 h-3.5 text-emerald-400" />
            <span>{{ testingKey === 'RESEND_API_KEY' ? 'Menguji...' : 'Uji Koneksi' }}</span>
          </button>

          <button
            @click="handleConfigureProvider('resend', 'RESEND_API_KEY')"
            class="py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Settings class="w-3.5 h-3.5 text-slate-500" />
            <span>{{ getSecretByKey('RESEND_API_KEY') ? 'Ubah Kunci' : 'Atur Kunci' }}</span>
          </button>
        </div>
      </div>

      <!-- OpenAI Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-card-hover transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center text-purple-700 font-black text-sm font-mono shadow-xs">
              AI
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">OpenAI / Secondary</h4>
              <p class="text-[11px] text-slate-500">Model LLM Alternatif (Opsional)</p>
            </div>
          </div>
          <span
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border',
              getSecretByKey('OPENAI_API_KEY')?.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : getSecretByKey('OPENAI_API_KEY')
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            ]"
          >
            {{ getSecretByKey('OPENAI_API_KEY')?.is_active ? 'Aktif di DB' : getSecretByKey('OPENAI_API_KEY') ? 'Nonaktif' : 'Belum Diatur' }}
          </span>
        </div>

        <div class="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
          <span class="truncate">{{ getSecretByKey('OPENAI_API_KEY')?.masked_value || 'Tidak dikonfigurasi' }}</span>
          <span class="text-[10px] font-sans font-semibold text-slate-400 shrink-0">v1</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="testSecretConnection('openai', 'OPENAI_API_KEY')"
            :disabled="testingKey === 'OPENAI_API_KEY'"
            class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Loader2 v-if="testingKey === 'OPENAI_API_KEY'" class="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
            <Zap v-else class="w-3.5 h-3.5 text-purple-400" />
            <span>{{ testingKey === 'OPENAI_API_KEY' ? 'Menguji...' : 'Uji Koneksi' }}</span>
          </button>

          <button
            @click="handleConfigureProvider('openai', 'OPENAI_API_KEY')"
            class="py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Settings class="w-3.5 h-3.5 text-slate-500" />
            <span>{{ getSecretByKey('OPENAI_API_KEY') ? 'Ubah Kunci' : 'Atur Kunci' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Live Test Result Banner -->
    <div
      v-if="testResult"
      :class="[
        'p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 duration-200',
        testResult.success
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
          : 'bg-rose-50/90 border-rose-200 text-rose-900'
      ]"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <CheckCircle2 v-if="testResult.success" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <AlertTriangle v-else class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <div class="font-extrabold text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Hasil Uji Koneksi: {{ (testResult.service || 'SERVICE').toUpperCase() }}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-current font-mono">
                {{ testResult.latency_ms }} ms
              </span>
            </div>
            <p class="text-xs font-medium">{{ testResult.message }}</p>
          </div>
        </div>
        <button
          @click="testResult = null"
          class="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- All Stored Secrets Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-slate-900 text-sm tracking-tight">Katalog Secret API Terenkripsi</h3>
          <p class="text-xs text-slate-500 font-medium">
            Kredensial pihak ketiga yang tersimpan secara terenkripsi AES-128 di MySQL
          </p>
        </div>

        <div class="flex items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari identifier / provider..."
            class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
          />

          <button
            @click="openAddSecretModal()"
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus class="w-3.5 h-3.5 text-[#c2ef4e]" />
            <span>Tambah Secret Baru</span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 font-bold uppercase tracking-wider font-mono text-[11px]">
              <th class="p-4 pl-6">Service Provider</th>
              <th class="p-4">Key Identifier</th>
              <th class="p-4">Masked Value (Terenkripsi)</th>
              <th class="p-4">Keterangan</th>
              <th class="p-4">Status</th>
              <th class="p-4 pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-600">
            <tr
              v-for="s in filteredSecrets"
              :key="s.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="p-4 pl-6">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono border inline-block',
                    s.service_name === 'gemini'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : s.service_name === 'resend'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : s.service_name === 'openai'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  ]"
                >
                  {{ s.service_name }}
                </span>
              </td>
              <td class="p-4 font-mono font-bold text-slate-900">
                {{ s.key_name }}
              </td>
              <td class="p-4 font-mono text-slate-500">
                <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-mono text-[11px]">
                  {{ s.masked_value }}
                </span>
              </td>
              <td class="p-4 text-slate-600 max-w-xs truncate">
                {{ s.description || '-' }}
              </td>
              <td class="p-4">
                <button
                  @click="toggleSecretStatus(s.key_name)"
                  :disabled="isTogglingKey === s.key_name"
                  :title="s.is_active ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'"
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border transition-all cursor-pointer disabled:opacity-50',
                    s.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  ]"
                >
                  <Loader2 v-if="isTogglingKey === s.key_name" class="w-3 h-3 animate-spin text-current" />
                  <span v-else :class="['w-1.5 h-1.5 rounded-full', s.is_active ? 'bg-emerald-500' : 'bg-slate-400']"></span>
                  {{ s.is_active ? 'Aktif' : 'Nonaktif' }}
                </button>
              </td>
              <td class="p-4 pr-6 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="testSecretConnection(s.service_name, s.key_name)"
                    :disabled="testingKey === s.key_name"
                    title="Uji koneksi API sekarang"
                    class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <Loader2 v-if="testingKey === s.key_name" class="w-3 h-3 animate-spin" />
                    <Zap v-else class="w-3 h-3 text-[#c2ef4e]" />
                    <span>Test</span>
                  </button>

                  <button
                    @click="openEditSecretModal(s)"
                    title="Edit konfigurasi secret"
                    class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 class="w-3 h-3 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    @click="promptDeleteSecret(s.key_name)"
                    title="Hapus secret dari database"
                    class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredSecrets.length === 0">
              <td colspan="6" class="p-10 text-center space-y-2">
                <Key class="w-8 h-8 text-slate-300 mx-auto" />
                <p class="text-xs font-semibold text-slate-500">
                  {{ searchQuery ? 'Tidak ada secret yang cocok dengan pencarian.' : 'Belum ada secret API yang tersimpan di database MySQL.' }}
                </p>
                <button
                  v-if="!searchQuery"
                  @click="openAddSecretModal()"
                  class="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5 text-[#c2ef4e]" />
                  <span>Tambah Secret Sekarang</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: ADD / EDIT SECRET -->
    <div
      v-if="showSecretModal"
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs">
              <Key class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base">
                {{ isEditingSecret ? `Edit Secret: ${secretForm.key_name}` : 'Tambah Secret API Baru' }}
              </h3>
              <p class="text-xs text-slate-500 font-medium">
                Kunci dienkripsi otomatis dengan AES-128 sebelum disimpan ke database
              </p>
            </div>
          </div>
          <button
            @click="showSecretModal = false"
            class="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- In-Modal Test Result Banner -->
        <div
          v-if="modalTestResult"
          :class="[
            'p-3.5 rounded-xl border text-xs flex items-start gap-2.5',
            modalTestResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          ]"
        >
          <CheckCircle2 v-if="modalTestResult.success" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <AlertTriangle v-else class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div class="flex-1">
            <span class="font-bold font-mono uppercase text-[10px]">
              {{ modalTestResult.success ? 'Koneksi Valid' : 'Validasi Gagal' }} ({{ modalTestResult.latency_ms }}ms):
            </span>
            <p class="font-medium mt-0.5">{{ modalTestResult.message }}</p>
          </div>
          <button @click="modalTestResult = null" class="p-1 hover:bg-black/5 rounded cursor-pointer">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <form @submit.prevent="handleSaveSecret" class="space-y-4 text-xs font-medium">
          <!-- Service Provider -->
          <div class="space-y-1.5">
            <label class="font-bold text-slate-800 flex items-center justify-between">
              <span>Penyedia Layanan (Service Provider)</span>
              <span class="text-[10px] text-slate-400 font-normal">Pilih jenis API</span>
            </label>
            <select
              v-model="secretForm.service_name"
              @change="onServiceChange"
              :disabled="isEditingSecret"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400 bg-slate-50 text-slate-900 transition-colors"
              :class="{ 'opacity-60 cursor-not-allowed': isEditingSecret }"
            >
              <option value="gemini">Google Gemini AI (LLM & Vision)</option>
              <option value="resend">Resend Email API (OTP & Transaksional)</option>
              <option value="openai">OpenAI (GPT-4o & LLM Alternatif)</option>
              <option value="custom">Kustom / Layanan Eksternal Lainnya</option>
            </select>
          </div>

          <!-- Key Name Identifier -->
          <div class="space-y-1.5">
            <label class="font-bold text-slate-800 flex items-center justify-between">
              <span>Nama Identifier Kunci</span>
              <span class="text-[10px] text-slate-400 font-mono">Contoh: GEMINI_API_KEY</span>
            </label>
            <input
              v-model="secretForm.key_name"
              :readonly="isEditingSecret"
              required
              type="text"
              placeholder="GEMINI_API_KEY, RESEND_API_KEY, dll."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:bg-white focus:outline-none focus:border-slate-400 uppercase bg-slate-50 text-slate-900 transition-colors"
              :class="{ 'opacity-60 cursor-not-allowed bg-slate-100': isEditingSecret }"
            />
          </div>

          <!-- Secret Value -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-800">
                Nilai API Key
                <span v-if="!isEditingSecret" class="text-rose-600">*</span>
              </label>
              <span v-if="isEditingSecret" class="text-[10px] text-indigo-600 font-semibold">
                Opsional saat edit (kosongkan jika tidak diubah)
              </span>
            </div>

            <div class="relative">
              <input
                v-model="secretForm.value"
                :required="!isEditingSecret"
                :type="showSecretPlain ? 'text' : 'password'"
                :placeholder="isEditingSecret ? 'Kosongkan jika tidak ingin mengubah kunci saat ini' : 'Masukkan nilai API key lengkap...'"
                class="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-slate-200 font-mono focus:bg-white focus:outline-none focus:border-slate-400 bg-slate-50 text-slate-900 transition-colors"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  @click="showSecretPlain = !showSecretPlain"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                  title="Tampilkan / Sembunyikan"
                >
                  <Eye v-if="!showSecretPlain" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- In-Modal Test Key Button -->
            <div class="pt-1 flex items-center justify-between">
              <p class="text-[11px] text-slate-500 font-medium">
                {{ isEditingSecret && !secretForm.value ? 'Kunci tersimpan saat ini akan dipertahankan.' : 'Akan langsung dienkripsi sebelum disimpan ke MySQL.' }}
              </p>

              <button
                type="button"
                @click="testInModalSecret"
                :disabled="isTestingInModal || (!secretForm.value && !isEditingSecret)"
                class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Loader2 v-if="isTestingInModal" class="w-3 h-3 animate-spin text-slate-600" />
                <Zap v-else class="w-3 h-3 text-amber-500" />
                <span>{{ isTestingInModal ? 'Menguji...' : 'Uji Kunci Sekarang' }}</span>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="font-bold text-slate-800">Keterangan / Catatan (Opsional)</label>
            <input
              v-model="secretForm.description"
              type="text"
              placeholder="Contoh: Primary Gemini Flash API Key untuk Ujian Sekolah"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400 bg-slate-50 text-slate-900 transition-colors"
            />
          </div>

          <!-- Active Switch -->
          <div class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <input
              id="is_active_check"
              v-model="secretForm.is_active"
              type="checkbox"
              class="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
            <label for="is_active_check" class="font-bold text-slate-800 cursor-pointer text-xs select-none">
              Jadikan sebagai secret aktif saat ini
              <span class="block text-[11px] font-normal text-slate-500">
                Fitur terkait akan langsung menggunakan secret ini secara otomatis.
              </span>
            </label>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="showSecretModal = false"
              class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmittingSecret"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <Loader2 v-if="isSubmittingSecret" class="w-4 h-4 animate-spin text-[#c2ef4e]" />
              <Lock v-else class="w-3.5 h-3.5 text-[#c2ef4e]" />
              <span>{{ isSubmittingSecret ? 'Menyimpan & Mengenkripsi...' : 'Simpan & Terapkan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: CONFIRM DELETE -->
    <div
      v-if="deleteTargetKey"
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 text-center">
        <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center mx-auto shadow-xs">
          <Trash2 class="w-6 h-6" />
        </div>
        <div>
          <h4 class="font-extrabold text-base text-slate-900">Hapus Secret API?</h4>
          <p class="text-xs text-slate-500 mt-1 font-medium">
            Anda akan menghapus secret <code class="font-mono font-bold text-slate-800">{{ deleteTargetKey }}</code> secara permanen dari database.
          </p>
        </div>
        <div class="flex items-center gap-2.5 pt-2">
          <button
            @click="deleteTargetKey = null"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="executeDeleteSecret"
            :disabled="isDeleting"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ShieldCheck,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Lock,
  Settings,
  Loader2,
} from 'lucide-vue-next'
import api from '@/lib/api'

interface SecretRecord {
  id: number
  key_name: string
  service_name: string
  masked_value: string
  description?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

const secretsList = ref<SecretRecord[]>([])
const isSecretsLoading = ref(false)
const searchQuery = ref('')
const showSecretModal = ref(false)
const isEditingSecret = ref(false)
const isSubmittingSecret = ref(false)
const showSecretPlain = ref(false)
const testingKey = ref<string | null>(null)
const isTogglingKey = ref<string | null>(null)
const testResult = ref<any | null>(null)
const modalTestResult = ref<any | null>(null)
const isTestingInModal = ref(false)
const deleteTargetKey = ref<string | null>(null)
const isDeleting = ref(false)

// Toast notification
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: any = null

function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 4000)
}

const secretForm = ref({
  key_name: 'GEMINI_API_KEY',
  service_name: 'gemini',
  value: '',
  description: '',
  is_active: true,
})

const filteredSecrets = computed(() => {
  if (!searchQuery.value.trim()) return secretsList.value || []
  const q = searchQuery.value.toLowerCase().trim()
  return (secretsList.value || []).filter(
    (s) =>
      (s?.key_name && s.key_name.toLowerCase().includes(q)) ||
      (s?.service_name && s.service_name.toLowerCase().includes(q)) ||
      (s?.description && s.description.toLowerCase().includes(q))
  )
})

function getSecretByKey(key: string): SecretRecord | undefined {
  if (!key || !secretsList.value) return undefined
  return secretsList.value.find((s) => s?.key_name && s.key_name.toUpperCase() === key.toUpperCase())
}

function onServiceChange(): void {
  if (isEditingSecret.value) return
  if (secretForm.value.service_name === 'gemini') {
    secretForm.value.key_name = 'GEMINI_API_KEY'
    secretForm.value.description = 'API Key Google Gemini untuk generator soal & scoring esai'
  } else if (secretForm.value.service_name === 'resend') {
    secretForm.value.key_name = 'RESEND_API_KEY'
    secretForm.value.description = 'API Key Resend untuk pengiriman email OTP & transaksional'
  } else if (secretForm.value.service_name === 'openai') {
    secretForm.value.key_name = 'OPENAI_API_KEY'
    secretForm.value.description = 'API Key OpenAI LLM alternatif'
  } else {
    if (['GEMINI_API_KEY', 'RESEND_API_KEY', 'OPENAI_API_KEY'].includes(secretForm.value.key_name)) {
      secretForm.value.key_name = ''
    }
  }
}

function handleConfigureProvider(service: string, defaultKey: string): void {
  const existing = getSecretByKey(defaultKey)
  if (existing) {
    openEditSecretModal(existing)
  } else {
    openAddSecretModal(service)
  }
}

function openAddSecretModal(prefillService?: string): void {
  isEditingSecret.value = false
  showSecretPlain.value = false
  modalTestResult.value = null

  const service = prefillService || 'gemini'
  let key = 'GEMINI_API_KEY'
  let desc = 'API Key Google Gemini untuk generator soal & scoring esai'

  if (service === 'resend') {
    key = 'RESEND_API_KEY'
    desc = 'API Key Resend untuk pengiriman email OTP & transaksional'
  } else if (service === 'openai') {
    key = 'OPENAI_API_KEY'
    desc = 'API Key OpenAI LLM alternatif'
  }

  secretForm.value = {
    key_name: key,
    service_name: service,
    value: '',
    description: desc,
    is_active: true,
  }
  showSecretModal.value = true
}

function openEditSecretModal(secret: SecretRecord): void {
  isEditingSecret.value = true
  showSecretPlain.value = false
  modalTestResult.value = null
  secretForm.value = {
    key_name: secret.key_name,
    service_name: secret.service_name,
    value: '',
    description: secret.description || '',
    is_active: secret.is_active,
  }
  showSecretModal.value = true
}

async function loadSecrets(): Promise<void> {
  try {
    isSecretsLoading.value = true
    const res = await api.get('/superadmin/secrets')
    secretsList.value = res.data.data || []
  } catch (err: any) {
    console.error('Failed to load secrets:', err)
    showToast(err?.response?.data?.message || 'Gagal memuat katalog secret API.', 'error')
  } finally {
    isSecretsLoading.value = false
  }
}

async function testInModalSecret(): Promise<void> {
  isTestingInModal.value = true
  modalTestResult.value = null
  try {
    const payload: any = {
      service_name: secretForm.value.service_name,
      key_name: secretForm.value.key_name,
    }
    if (secretForm.value.value && secretForm.value.value.trim()) {
      payload.test_value = secretForm.value.value.trim()
    }

    const res = await api.post('/superadmin/secrets/test', payload)
    modalTestResult.value = res.data.data
  } catch (err: any) {
    modalTestResult.value = {
      success: false,
      service: secretForm.value.service_name,
      latency_ms: 0,
      message: err?.response?.data?.message || 'Gagal menguji koneksi API.',
    }
  } finally {
    isTestingInModal.value = false
  }
}

async function handleSaveSecret(): Promise<void> {
  try {
    isSubmittingSecret.value = true

    const payload: any = {
      key_name: secretForm.value.key_name.trim().toUpperCase(),
      service_name: secretForm.value.service_name.trim().toLowerCase(),
      description: secretForm.value.description.trim() || undefined,
      is_active: secretForm.value.is_active,
    }

    // Only include value if provided
    if (secretForm.value.value && secretForm.value.value.trim()) {
      payload.value = secretForm.value.value.trim()
    } else if (!isEditingSecret.value) {
      showToast('Nilai API key wajib diisi untuk secret baru.', 'error')
      isSubmittingSecret.value = false
      return
    }

    await api.post('/superadmin/secrets', payload)
    showSecretModal.value = false
    await loadSecrets()
    showToast(`Secret API '${payload.key_name}' berhasil disimpan dan dienkripsi!`, 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Gagal menyimpan secret API.', 'error')
  } finally {
    isSubmittingSecret.value = false
  }
}

async function toggleSecretStatus(keyName: string): Promise<void> {
  isTogglingKey.value = keyName
  try {
    const res = await api.patch(`/superadmin/secrets/${encodeURIComponent(keyName)}/toggle`)
    const updated = res.data.data
    const statusText = updated?.is_active ? 'diaktifkan' : 'dinonaktifkan'
    await loadSecrets()
    showToast(`Secret '${keyName}' berhasil ${statusText}.`, 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Gagal mengubah status secret.', 'error')
  } finally {
    isTogglingKey.value = null
  }
}

function promptDeleteSecret(keyName: string): void {
  deleteTargetKey.value = keyName
}

async function executeDeleteSecret(): Promise<void> {
  if (!deleteTargetKey.value) return
  const key = deleteTargetKey.value
  isDeleting.value = true
  try {
    await api.delete(`/superadmin/secrets/${encodeURIComponent(key)}`)
    deleteTargetKey.value = null
    await loadSecrets()
    showToast(`Secret '${key}' berhasil dihapus dari database.`, 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Gagal menghapus secret API.', 'error')
  } finally {
    isDeleting.value = false
  }
}

async function testSecretConnection(serviceName: string, keyName: string): Promise<void> {
  testingKey.value = keyName
  testResult.value = null
  try {
    const res = await api.post('/superadmin/secrets/test', {
      service_name: serviceName,
      key_name: keyName,
    })
    testResult.value = res.data.data
  } catch (err: any) {
    testResult.value = {
      success: false,
      service: serviceName,
      latency_ms: 0,
      message: err?.response?.data?.message || 'Gagal terhubung ke API penyedia.',
    }
  } finally {
    testingKey.value = null
  }
}

defineExpose({
  openAddSecretModal,
  openEditSecretModal,
  loadSecrets,
})

onMounted(async () => {
  await loadSecrets()
})
</script>
