'use client'

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  ShieldCheck,
  RefreshCw,
  Zap,
  Settings,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Cpu,
  Sparkles,
  Sliders,
  Server,
  Layers,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react'
import api from '@/lib/api'

export interface SecretItem {
  id: number
  key_name: string
  provider: string
  masked_value: string
  description?: string
  is_active: boolean
  updated_at?: string
}

export interface TaskSecretItem {
  task_id: string
  name: string
  description: string
  provider: string
  model: string
  temperature: number
  max_tokens: number
  api_key_masked: string
  has_custom_key: boolean
  is_active: boolean
  providers_supported: string[]
  last_tested: string
}

export interface SecretManagerTabRef {
  openAddSecretModal: () => void
}

const PROVIDER_MODELS: Record<string, { id: string; label: string; desc: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Ultra-cepat & efisien untuk reasoning multi-step' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Akurasi tinggi untuk koreksi esai kompleks & rubrik' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Latensi terendah untuk live student chat' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Window konteks 2M token untuk dokumen kurikulum besar' },
  ],
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o (Omni)', desc: 'Model multimodal flagship OpenAI' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Hemat biaya untuk pembuatan soal rutin' },
    { id: 'o3-mini', label: 'o3-mini (Reasoning)', desc: 'Reasoning sains, matematika & coding tingkat lanjut' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'Model instruksi terstandarisasi' },
  ],
  claude: [
    { id: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet', desc: 'Hybrid reasoning terdepan untuk analisis rubrik kritis' },
    { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', desc: 'Akurasi pemahaman teks bahasa Indonesia terbaik' },
    { id: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', desc: 'Inferensi cepat untuk respons tutor instan' },
  ],
  deepseek: [
    { id: 'deepseek-chat', label: 'DeepSeek-V3', desc: 'Model open-weight komersial ekonomis' },
    { id: 'deepseek-reasoner', label: 'DeepSeek-R1', desc: 'Chain-of-thought transparan untuk pembuktian jawaban' },
  ],
  ollama: [
    { id: 'llama-3.3-70b', label: 'Llama 3.3 70B (Local)', desc: 'On-premise zero data egress untuk privasi instansi' },
    { id: 'qwen2.5-coder-32b', label: 'Qwen 2.5 Coder 32B', desc: 'Evaluasi soal pemrograman & algoritma' },
    { id: 'mistral-nemo', label: 'Mistral NeMo 12B', desc: 'Model lokal hemat resource untuk edge proctoring' },
  ],
}

const SecretManagerTab = forwardRef<SecretManagerTabRef>((_props, ref) => {
  // Global Secrets State
  const [secrets, setSecrets] = useState<SecretItem[]>([])
  const [isSecretsLoading, setIsSecretsLoading] = useState(false)
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Task Secrets State
  const [taskSecrets, setTaskSecrets] = useState<TaskSecretItem[]>([])
  const [isTaskLoading, setIsTaskLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskSecretItem | null>(null)
  const [taskForm, setTaskForm] = useState({
    task_id: '',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    api_key: '',
    temperature: 0.7,
    max_tokens: 2048,
    is_active: true,
  })
  const [isSavingTask, setIsSavingTask] = useState(false)

  // Global Secret Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    provider: 'gemini',
    key_name: 'GEMINI_API_KEY',
    value: '',
    description: '',
    is_active: true,
  })

  useImperativeHandle(ref, () => ({
    openAddSecretModal: () => {
      setForm({
        provider: 'gemini',
        key_name: 'GEMINI_API_KEY',
        value: '',
        description: 'Google Gemini API key untuk AI Question Generator & Grading',
        is_active: true,
      })
      setIsModalOpen(true)
    },
  }))

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const loadSecrets = async () => {
    setIsSecretsLoading(true)
    try {
      const res = await api.get('/superadmin/secrets')
      setSecrets(res.data.data || [])
    } catch (err: any) {
      console.warn('Failed to load secrets:', err)
    } finally {
      setIsSecretsLoading(false)
    }
  }

  const loadTaskSecrets = async () => {
    setIsTaskLoading(true)
    try {
      const res = await api.get('/superadmin/secrets/tasks')
      setTaskSecrets(res.data.data || [])
    } catch (err: any) {
      console.warn('Failed to load task secrets:', err)
    } finally {
      setIsTaskLoading(false)
    }
  }

  useEffect(() => {
    loadSecrets()
    loadTaskSecrets()
  }, [])

  const getSecretByKey = (keyName: string) => {
    return secrets.find((s) => s.key_name === keyName)
  }

  const testSecretConnection = async (provider: string, keyName: string) => {
    setTestingKey(keyName)
    try {
      const res = await api.post('/superadmin/secrets/test', {
        service_name: provider,
        key_name: keyName,
      })
      showToast('success', res.data?.message || `Koneksi ke ${provider.toUpperCase()} berhasil diverifikasi!`)
    } catch (err: any) {
      showToast('error', err.response?.data?.message || `Gagal menghubungi ${provider.toUpperCase()}. Periksa API key.`)
    } finally {
      setTestingKey(null)
    }
  }

  const handleConfigureProvider = (provider: string, keyName: string) => {
    setForm({
      provider,
      key_name: keyName,
      value: '',
      description: provider === 'gemini' ? 'Google Gemini API key' : 'Resend Email API key',
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const handleToggleStatus = async (keyName: string) => {
    try {
      await api.patch(`/superadmin/secrets/${keyName}/toggle`)
      showToast('success', 'Status secret berhasil diubah.')
      loadSecrets()
    } catch (err: any) {
      showToast('error', 'Gagal mengubah status secret.')
    }
  }

  const handleDeleteSecret = async (keyName: string) => {
    if (!confirm('Hapus secret ini dari database? Server akan kembali menggunakan variabel lingkungan .env.')) {
      return
    }
    try {
      await api.delete(`/superadmin/secrets/${keyName}`)
      showToast('success', 'Secret berhasil dihapus.')
      loadSecrets()
    } catch (err: any) {
      showToast('error', 'Gagal menghapus secret.')
    }
  }

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Backend SecretCreateOrUpdate expects `service_name`; the form tracks it as `provider`.
      await api.post('/superadmin/secrets', {
        key_name: form.key_name,
        service_name: form.provider,
        value: form.value,
        description: form.description,
        is_active: form.is_active,
      })
      showToast('success', `Kunci API ${form.key_name} berhasil disimpan dan di-reload!`)
      setIsModalOpen(false)
      loadSecrets()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan secret API.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false)
        else if (editingTask) setEditingTask(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, editingTask])

  // Open Task Configuration Modal
  const openTaskConfigModal = (task: TaskSecretItem) => {
    setEditingTask(task)
    setTaskForm({
      task_id: task.task_id,
      provider: task.provider || 'gemini',
      model: task.model || 'gemini-2.5-flash',
      api_key: '',
      temperature: task.temperature ?? 0.7,
      max_tokens: task.max_tokens ?? 2048,
      is_active: task.is_active ?? true,
    })
  }

  const handleSaveTaskConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingTask(true)
    try {
      await api.post('/superadmin/secrets/tasks', taskForm)
      showToast('success', `Konfigurasi engine task ${taskForm.task_id} berhasil disimpan!`)
      setEditingTask(null)
      loadTaskSecrets()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan konfigurasi task.')
    } finally {
      setIsSavingTask(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-[max(1.5rem,env(safe-area-inset-right))] z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 max-w-md text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
              : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-900/10'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#c2ef4e] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Security & Hot-Reload Banner */}
      <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Task-Specific AI Routing & Vault Hot-Reload</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shadow-xs">
                Fernet AES-128 Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Atur provider & model AI yang berbeda untuk setiap operasi ujian (Soal, Koreksi, Tutor, Proctoring) dengan kredensial terenkripsi di database TiDB.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              loadSecrets()
              loadTaskSecrets()
            }}
            disabled={isSecretsLoading || isTaskLoading}
            title="Muat ulang status engine"
            aria-label="Muat ulang status engine"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSecretsLoading || isTaskLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isSecretsLoading || isTaskLoading ? 'Menyinkronkan...' : 'Refresh All Engines'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: TASK-SPECIFIC AI ENGINE HUB                   */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>Konfigurasi Engine AI per Kategori Task</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pilih penyedia LLM, arsitektur model, dan parameter inferensi untuk masing-masing modul platform
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            Multi-Provider Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taskSecrets.map((task) => (
            <div
              key={task.task_id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Task Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {task.task_id}
                    </span>
                    <h4 className="font-display text-base font-bold text-slate-900">{task.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      task.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {task.is_active ? 'Engine Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                {/* Engine Parameters Pill */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[10px]">AI Provider:</span>
                    <span className="font-bold text-slate-900 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                      {task.provider}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[10px]">Model Utama:</span>
                    <span className="font-bold text-indigo-700">{task.model}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 uppercase text-[10px]">Parameter:</span>
                    <span className="text-slate-700">
                      Temp: <strong className="text-slate-900">{task.temperature}</strong> • Max Tokens:{' '}
                      <strong className="text-slate-900">{task.max_tokens}</strong>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 uppercase text-[10px]">Kredensial API:</span>
                    <span className="text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      {task.has_custom_key ? (
                        <span className="text-emerald-700 font-bold">{task.api_key_masked} (Custom)</span>
                      ) : (
                        <span className="text-slate-500 italic">Inherit Vault Global</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => testSecretConnection(task.provider, task.task_id)}
                  disabled={testingKey === task.task_id}
                  className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs font-display"
                >
                  {testingKey === task.task_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-[#c2ef4e]" />
                  )}
                  <span>{testingKey === task.task_id ? 'Menguji...' : 'Uji Model'}</span>
                </button>

                <button
                  onClick={() => openTaskConfigModal(task)}
                  className="py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs font-display"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Konfigurasi Engine</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: GLOBAL INTEGRATION SECRETS & KMS VAULT        */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>Kredensial Global & Master Provider Keys</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kunci API induk yang digunakan sebagai fallback otomatis saat task menggunakan provider terkait
            </p>
          </div>
          <button
            onClick={() => {
              setForm({
                provider: 'custom',
                key_name: '',
                value: '',
                description: '',
                is_active: true,
              })
              setIsModalOpen(true)
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-card flex items-center gap-1.5 cursor-pointer font-display"
          >
            <Plus className="w-3.5 h-3.5 text-[#c2ef4e]" />
            <span>Tambah Kunci Baru</span>
          </button>
        </div>

        {/* Global Provider Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gemini Master Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700 font-black text-sm font-mono shadow-xs">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Google Gemini Master Key</h4>
                  <p className="text-[11px] text-slate-500">Kunci API Utama Google Cloud Platform</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                  getSecretByKey('GEMINI_API_KEY')?.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : getSecretByKey('GEMINI_API_KEY')
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {getSecretByKey('GEMINI_API_KEY')?.is_active
                  ? 'Aktif di DB'
                  : getSecretByKey('GEMINI_API_KEY')
                  ? 'Nonaktif'
                  : 'Env Fallback'}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
              <span className="truncate">
                {getSecretByKey('GEMINI_API_KEY')?.masked_value || 'Menggunakan .env / Fallback'}
              </span>
              <span className="text-[10px] font-sans font-semibold text-slate-500 shrink-0">v1beta API</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => testSecretConnection('gemini', 'GEMINI_API_KEY')}
                disabled={testingKey === 'GEMINI_API_KEY'}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {testingKey === 'GEMINI_API_KEY' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-[#c2ef4e]" />
                )}
                <span>{testingKey === 'GEMINI_API_KEY' ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>

              <button
                onClick={() => handleConfigureProvider('gemini', 'GEMINI_API_KEY')}
                className="py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>{getSecretByKey('GEMINI_API_KEY') ? 'Ubah Kunci' : 'Atur Kunci'}</span>
              </button>
            </div>
          </div>

          {/* Resend Master Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 font-black text-sm font-mono shadow-xs">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Resend Email API</h4>
                  <p className="text-[11px] text-slate-500">Pengiriman Email OTP & Bukti Pembayaran</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                  getSecretByKey('RESEND_API_KEY')?.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : getSecretByKey('RESEND_API_KEY')
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {getSecretByKey('RESEND_API_KEY')?.is_active
                  ? 'Aktif di DB'
                  : getSecretByKey('RESEND_API_KEY')
                  ? 'Nonaktif'
                  : 'Env Fallback'}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
              <span className="truncate">
                {getSecretByKey('RESEND_API_KEY')?.masked_value || 'Menggunakan .env / Fallback'}
              </span>
              <span className="text-[10px] font-sans font-semibold text-slate-500 shrink-0">SMTP / REST</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => testSecretConnection('resend', 'RESEND_API_KEY')}
                disabled={testingKey === 'RESEND_API_KEY'}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {testingKey === 'RESEND_API_KEY' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2ef4e]" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-[#c2ef4e]" />
                )}
                <span>{testingKey === 'RESEND_API_KEY' ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>

              <button
                onClick={() => handleConfigureProvider('resend', 'RESEND_API_KEY')}
                className="py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>{getSecretByKey('RESEND_API_KEY') ? 'Ubah Kunci' : 'Atur Kunci'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Secrets Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Inventaris Kunci API & Kredensial Database</h4>
              <p className="text-xs text-slate-500 mt-0.5">Daftar kunci terenkripsi yang tersimpan di sistem.</p>
            </div>
          </div>

          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider font-mono text-[11px]">
                  <th className="p-4 pl-6">Nama Kunci (Key Name)</th>
                  <th className="p-4">Penyedia (Provider)</th>
                  <th className="p-4">Nilai Tersamar (Masked Value)</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {secrets.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {s.key_name}
                      </span>
                    </td>
                    <td className="p-4 font-mono uppercase text-[11px] font-bold text-indigo-700">
                      {s.provider}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.masked_value}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">
                      {s.description || '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-colors duration-200 ${
                          s.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${s.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        ></span>
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(s.key_name)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 cursor-pointer transition-colors duration-200"
                        >
                          {s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleDeleteSecret(s.key_name)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Hapus Secret"
                          aria-label="Hapus secret API"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {secrets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Belum ada secret kustom yang tersimpan di database. Sistem saat ini berjalan dengan fallback variabel lingkungan .env.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: TASK SPECIFIC AI CONFIGURATION                  */}
      {/* ======================================================== */}
      {editingTask && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTask(null)
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c2ef4e] bg-slate-900 px-2 py-0.5 rounded font-black">
                  {editingTask.task_id}
                </span>
                <h3 className="font-display text-lg font-extrabold text-slate-900 mt-1">
                  Konfigurasi Engine: {editingTask.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                title="Tutup konfigurasi task"
                aria-label="Tutup konfigurasi task"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTaskConfig} className="space-y-4 text-xs">
              {/* Provider Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Penyedia AI (Provider)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(editingTask.providers_supported || ['gemini', 'openai', 'claude', 'deepseek', 'ollama']).map((p) => {
                    const isSelected = taskForm.provider === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          const availableModels = PROVIDER_MODELS[p] || []
                          setTaskForm({
                            ...taskForm,
                            provider: p,
                            model: availableModels[0]?.id || '',
                          })
                        }}
                        className={`p-2.5 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Model Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilihan Model Arsitektur</label>
                <select
                  value={taskForm.model}
                  onChange={(e) => setTaskForm({ ...taskForm, model: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {(PROVIDER_MODELS[taskForm.provider] || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.id}) - {m.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dedicated API Key (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Kunci API Khusus Task (Opsional)</label>
                  <span className="text-[10px] text-slate-500 font-mono">Kosongkan jika pakai Vault Global</span>
                </div>
                <input
                  type="password"
                  placeholder="Tempel API key baru (biarkan kosong untuk mempertahankan)"
                  value={taskForm.api_key}
                  onChange={(e) => setTaskForm({ ...taskForm, api_key: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Hyperparameters: Temperature & Max Tokens */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Temperature</label>
                    <span className="font-mono font-bold text-indigo-700">{taskForm.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={taskForm.temperature}
                    onChange={(e) => setTaskForm({ ...taskForm, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {taskForm.temperature <= 0.2
                      ? 'Deterministik (Tepat untuk Koreksi)'
                      : 'Kreatif (Variasi Soal)'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Max Tokens</label>
                    <span className="font-mono font-bold text-indigo-700">{taskForm.max_tokens}</span>
                  </div>
                  <select
                    value={taskForm.max_tokens}
                    onChange={(e) => setTaskForm({ ...taskForm, max_tokens: parseInt(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                  >
                    <option value={1024}>1.024 tokens</option>
                    <option value={2048}>2.048 tokens</option>
                    <option value={4096}>4.096 tokens</option>
                    <option value={8192}>8.192 tokens</option>
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Status Operasi Engine</span>
                  <span className="text-[11px] text-slate-500">Aktifkan atau nonaktifkan engine untuk task ini</span>
                </div>
                <input
                  type="checkbox"
                  checked={taskForm.is_active}
                  onChange={(e) => setTaskForm({ ...taskForm, is_active: e.target.checked })}
                  className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-card flex items-center gap-2"
                >
                  {isSavingTask ? 'Menyimpan...' : 'Simpan Konfigurasi Engine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT GLOBAL SECRET                        */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Simpan Kunci API Terenkripsi</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSecret} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Penyedia (Provider)</label>
                <select
                  value={form.provider}
                  onChange={(e) => {
                    const p = e.target.value
                    setForm({
                      ...form,
                      provider: p,
                      key_name: p === 'gemini' ? 'GEMINI_API_KEY' : p === 'resend' ? 'RESEND_API_KEY' : form.key_name,
                    })
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold"
                >
                  <option value="gemini">Google Gemini AI</option>
                  <option value="resend">Resend Email</option>
                  <option value="openai">OpenAI API</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="deepseek">DeepSeek AI</option>
                  <option value="custom">Kustom / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Variabel (Key Name)</label>
                <input
                  value={form.key_name}
                  onChange={(e) => setForm({ ...form, key_name: e.target.value })}
                  required
                  type="text"
                  placeholder="Contoh: GEMINI_API_KEY"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Kunci API (Secret Value)</label>
                <input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                  type="password"
                  placeholder="Tempel kunci API Anda di sini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  type="text"
                  placeholder="Opsional: Keterangan peruntukan kunci"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Enkripsi & Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
})

SecretManagerTab.displayName = 'SecretManagerTab'
export default SecretManagerTab
