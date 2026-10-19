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
  Unlock,
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
  Copy,
  Check,
  Search,
  Key,
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

interface ProviderMeta {
  id: string
  name: string
  keyName: string
  protocol: string
  icon: React.ComponentType<{ className?: string }>
}

const PROVIDER_METAS: ProviderMeta[] = [
  { id: 'gemini', name: 'Google Gemini', keyName: 'GEMINI_API_KEY', protocol: 'Google v1beta', icon: Sparkles },
  { id: 'openai', name: 'OpenAI API', keyName: 'OPENAI_API_KEY', protocol: 'REST / SSE', icon: Cpu },
  { id: 'claude', name: 'Anthropic Claude', keyName: 'CLAUDE_API_KEY', protocol: 'Messages API', icon: Layers },
  { id: 'deepseek', name: 'DeepSeek AI', keyName: 'DEEPSEEK_API_KEY', protocol: 'OpenAI-compat', icon: Server },
  { id: 'resend', name: 'Resend Email', keyName: 'RESEND_API_KEY', protocol: 'SMTP / REST', icon: Zap },
  { id: 'ollama', name: 'Ollama Local', keyName: 'OLLAMA_BASE_URL', protocol: 'On-Premise', icon: Database },
]

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

  // View & Filter State
  const [activeTab, setActiveTab] = useState<'vault' | 'tasks' | 'all'>('vault')
  const [searchQuery, setSearchQuery] = useState('')
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [deletingSecret, setDeletingSecret] = useState<SecretItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
  const [showTaskApiKey, setShowTaskApiKey] = useState(false)

  // Global Secret Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFormValue, setShowFormValue] = useState(false)
  const [form, setForm] = useState({
    provider: 'gemini',
    key_name: 'GEMINI_API_KEY',
    value: '',
    description: '',
    is_active: true,
  })

  useImperativeHandle(ref, () => ({
    openAddSecretModal: () => {
      setActiveTab('vault')
      setForm({
        provider: 'gemini',
        key_name: 'GEMINI_API_KEY',
        value: '',
        description: 'Google Gemini API key untuk AI Question Generator & Grading',
        is_active: true,
      })
      setIsEditingExisting(false)
      setShowFormValue(false)
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

  const getSecretForProvider = (providerId: string, defaultKey: string) => {
    return secrets.find((s) => s.key_name === defaultKey || (s.provider ?? '').toLowerCase() === providerId.toLowerCase())
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
    const existing = getSecretByKey(keyName) || getSecretForProvider(provider, keyName)
    setForm({
      provider,
      key_name: existing?.key_name || keyName,
      value: '',
      description:
        existing?.description ||
        (provider === 'gemini'
          ? 'Google Gemini API key'
          : provider === 'resend'
          ? 'Resend Email API key'
          : `${provider.toUpperCase()} API key`),
      is_active: existing ? existing.is_active : true,
    })
    setIsEditingExisting(Boolean(existing))
    setShowFormValue(false)
    setIsModalOpen(true)
  }

  const handleEditSecret = (s: SecretItem) => {
    setForm({
      provider: s.provider,
      key_name: s.key_name,
      value: '',
      description: s.description || '',
      is_active: s.is_active,
    })
    setIsEditingExisting(true)
    setShowFormValue(false)
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

  const handleConfirmDelete = async () => {
    if (!deletingSecret) return
    setIsDeleting(true)
    try {
      await api.delete(`/superadmin/secrets/${deletingSecret.key_name}`)
      showToast('success', `Kunci ${deletingSecret.key_name} berhasil dihapus dari vault.`)
      setDeletingSecret(null)
      loadSecrets()
    } catch (err: any) {
      showToast('error', 'Gagal menghapus secret dari vault.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
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
    setShowTaskApiKey(false)
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

  const copyToClipboard = async (text: string, identifier: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedKey(identifier)
      setTimeout(() => {
        setCopiedKey((curr) => (curr === identifier ? null : curr))
      }, 2000)
    } catch (err) {
      showToast('error', 'Gagal menyalin teks ke clipboard.')
    }
  }

  const toggleRevealKey = (keyName: string) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [keyName]: !prev[keyName],
    }))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingSecret) setDeletingSecret(null)
        else if (isModalOpen) setIsModalOpen(false)
        else if (editingTask) setEditingTask(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, editingTask, deletingSecret])

  // Filtered secrets list based on search
  const filteredSecrets = secrets.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (s.key_name ?? '').toLowerCase().includes(q) ||
      (s.provider ?? '').toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    )
  })

  const activeSecretsCount = secrets.filter((s) => s.is_active).length
  const activeTasksCount = taskSecrets.filter((t) => t.is_active).length

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-[max(1.5rem,env(safe-area-inset-right))] z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 max-w-md text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-[#150f23] text-white border-slate-700 shadow-slate-900/30'
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
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ZONE 1: CALM VAULT TELEMETRY & VIEW SWITCHER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Single Calm Telemetry Line */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#c2ef4e] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#c2ef4e]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-900">
              <span>KMS Vault Aktif</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="font-mono text-slate-600 font-semibold text-[11px]">Fernet AES-128</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-emerald-700 font-semibold">{activeSecretsCount} Kunci Database</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-slate-600 font-medium">{activeTasksCount} Engine Siap</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hot-reload instan aktif. Perubahan kredensial langsung terintegrasi tanpa reboot node backend.
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented View Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kredensial Vault ({secrets.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Routing Task ({taskSecrets.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => {
              loadSecrets()
              loadTaskSecrets()
            }}
            disabled={isSecretsLoading || isTaskLoading}
            title="Muat ulang seluruh konfigurasi vault & task"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-600 ${isSecretsLoading || isTaskLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">
              {isSecretsLoading || isTaskLoading ? 'Sinkron...' : 'Sinkronkan'}
            </span>
          </button>
        </div>
      </div>

      {/* ZONE 2 (a): COMPACT PROVIDER STATUS OVERVIEW */}
      {(activeTab === 'vault' || activeTab === 'all') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Status Provider & Kunci Induk
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Otomatis fallback ke environment variable jika tidak terdaftar di DB
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROVIDER_METAS.map((p) => {
              const matchedSecret = getSecretForProvider(p.id, p.keyName)
              const isConfiguredInDb = Boolean(matchedSecret)
              const isActive = matchedSecret ? matchedSecret.is_active : false
              const IconComp = p.icon

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs ${
                          p.id === 'gemini'
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200/80'
                            : p.id === 'openai'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
                            : p.id === 'claude'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : p.id === 'deepseek'
                            ? 'bg-violet-50 text-[#6a5fc1] border-violet-200/80'
                            : p.id === 'resend'
                            ? 'bg-rose-50 text-rose-600 border-rose-200/80'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">{p.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{p.protocol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isConfiguredInDb
                            ? isActive
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="text-slate-600 font-semibold truncate">
                        {isConfiguredInDb
                          ? isActive
                            ? 'Database'
                            : 'Nonaktif'
                          : 'Fallback .env'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => testSecretConnection(p.id, matchedSecret?.key_name || p.keyName)}
                        disabled={testingKey === (matchedSecret?.key_name || p.keyName)}
                        title={`Uji koneksi ${p.name}`}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                      >
                        {testingKey === (matchedSecret?.key_name || p.keyName) ? (
                          <Loader2 className="w-3 h-3 animate-spin text-slate-700" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleConfigureProvider(p.id, p.keyName)}
                        title={`Konfigurasi ${p.name}`}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ZONE 2 (b): SECRET LIST (THE WORKING AREA) */}
      {(activeTab === 'vault' || activeTab === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 px-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900">
                Inventaris Kunci API & Kredensial Database
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kunci terenkripsi at-rest TiDB. Sistem aman membuka nilai tersamar hanya atas permintaan deliberate.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kunci atau provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-48 sm:w-56"
                />
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
                  setIsEditingExisting(false)
                  setShowFormValue(false)
                  setIsModalOpen(true)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer font-display"
              >
                <Plus className="w-3.5 h-3.5 text-[#c2ef4e]" />
                <span>Tambah Kunci</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200/80 text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-6">Nama Kunci</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Nilai Tersamar (Vault Cipher)</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSecrets.map((s) => {
                  const isRevealed = Boolean(revealedKeys[s.key_name])
                  const isCopied = copiedKey === s.key_name

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Key Name */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 text-[11px]">
                            {s.key_name}
                          </span>
                          <button
                            onClick={() => copyToClipboard(s.key_name, `name-${s.key_name}`)}
                            title="Salin nama kunci"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            {copiedKey === `name-${s.key_name}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono uppercase text-[11px] font-bold text-slate-700">
                          {s.provider}
                        </span>
                      </td>

                      {/* Masked Value with Vault Cipher Reveal Interaction */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-2">
                          {isRevealed ? (
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded font-mono text-slate-800 text-[11px]">
                              <Unlock className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[180px]">{s.masked_value}</span>
                              <button
                                onClick={() => copyToClipboard(s.masked_value, s.key_name)}
                                title="Salin nilai tersamar"
                                className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="tracking-widest">••••••••••••</span>
                            </div>
                          )}

                          {/* Deliberate Reveal Toggle */}
                          <button
                            onClick={() => toggleRevealKey(s.key_name)}
                            title={isRevealed ? 'Kunci kembali nilai' : 'Lihat nilai tersamar'}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                        {s.description || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Progressive Disclosure Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => testSecretConnection(s.provider, s.key_name)}
                            disabled={testingKey === s.key_name}
                            title="Uji koneksi kunci ini"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {testingKey === s.key_name ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleEditSecret(s)}
                            title="Perbarui kunci atau deskripsi"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(s.key_name)}
                            title={s.is_active ? 'Nonaktifkan kunci' : 'Aktifkan kunci'}
                            className="px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 cursor-pointer transition-colors"
                          >
                            {s.is_active ? 'Matikan' : 'Aktifkan'}
                          </button>

                          <button
                            onClick={() => setDeletingSecret(s)}
                            title="Hapus secret dari vault"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredSecrets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Key className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">
                          {searchQuery
                            ? 'Tidak ada kunci yang cocok dengan pencarian.'
                            : 'Belum ada secret kustom yang tersimpan di vault database.'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {searchQuery
                            ? 'Coba gunakan kata kunci pencarian yang lain.'
                            : 'Sistem saat ini berjalan dengan fallback variabel lingkungan .env.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION DIVIDER (when all views are active) */}
      {activeTab === 'all' && <div className="border-t border-slate-200/80 my-2" />}

      {/* ZONE 3: TASK-SPECIFIC AI ENGINE HUB */}
      {(activeTab === 'tasks' || activeTab === 'all') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-800" />
                <span>Konfigurasi Engine AI per Kategori Task</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih arsitektur model dan parameter inferensi untuk setiap task operasional platform
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              Multi-Model Router
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskSecrets.map((task) => (
              <div
                key={task.task_id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  {/* Task Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-extrabold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {task.task_id}
                      </span>
                      <h4 className="font-display text-sm font-bold text-slate-900 pt-1">{task.name}</h4>
                    </div>

                    <div>
                      {task.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                          Engine Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                  {/* Clean Spec Telemetry Row (No card-inside-card) */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-y-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Provider & Model</span>
                      <span className="font-bold text-slate-900">
                        {task.provider.toUpperCase()} / <span className="text-indigo-700">{task.model}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Parameter</span>
                      <span className="text-slate-700">
                        Temp <strong className="text-slate-900">{task.temperature}</strong> / Max{' '}
                        <strong className="text-slate-900">{task.max_tokens}</strong>
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-100/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[10px] uppercase">Kredensial API</span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {task.has_custom_key ? (
                          <span className="text-emerald-700 font-bold">{task.api_key_masked} (Custom)</span>
                        ) : (
                          <span className="text-slate-500">Inherit Vault Global</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
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
      )}

      {/* ======================================================== */}
      {/* DIALOG 1: SAFE DELETE CONFIRMATION (PROGRESSIVE)         */}
      {/* ======================================================== */}
      {deletingSecret && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingSecret(null)
          }}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-display text-base font-extrabold text-slate-900">
                Hapus Kunci dari Vault?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Kunci <span className="font-mono font-bold text-slate-900">{deletingSecret.key_name}</span> akan
                dihapus dari database TiDB. Server akan otomatis kembali menggunakan konfigurasi variabel
                lingkungan (.env).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingSecret(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG 2: ADD / EDIT GLOBAL SECRET (PROGRESSIVE)         */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-800" />
                <span>{isEditingExisting ? 'Perbarui Kunci API' : 'Simpan Kunci API Terenkripsi'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
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
                      key_name:
                        p === 'gemini'
                          ? 'GEMINI_API_KEY'
                          : p === 'resend'
                          ? 'RESEND_API_KEY'
                          : p === 'openai'
                          ? 'OPENAI_API_KEY'
                          : p === 'claude'
                          ? 'CLAUDE_API_KEY'
                          : p === 'deepseek'
                          ? 'DEEPSEEK_API_KEY'
                          : form.key_name,
                    })
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="gemini">Google Gemini AI</option>
                  <option value="openai">OpenAI API</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="deepseek">DeepSeek AI</option>
                  <option value="resend">Resend Email</option>
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Nilai Kunci API (Secret Value)</label>
                  <button
                    type="button"
                    onClick={() => setShowFormValue(!showFormValue)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showFormValue ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showFormValue ? 'Sembunyikan' : 'Perlihatkan'}</span>
                  </button>
                </div>
                <input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                  type={showFormValue ? 'text' : 'password'}
                  placeholder="Tempel kunci API Anda di sini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  type="text"
                  placeholder="Opsional: Keterangan peruntukan kunci"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Status Operasi Kunci</span>
                  <span className="text-[11px] text-slate-500">Aktifkan untuk digunakan langsung oleh sistem</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 cursor-pointer shadow-xs font-display"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Enkripsi & Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG 3: TASK SPECIFIC AI CONFIGURATION (PROGRESSIVE)   */}
      {/* ======================================================== */}
      {editingTask && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTask(null)
          }}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
                  {editingTask.task_id}
                </span>
                <h3 className="font-display text-base font-extrabold text-slate-900 mt-1">
                  Konfigurasi Engine: {editingTask.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                title="Tutup konfigurasi task"
                aria-label="Tutup konfigurasi task"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskConfig} className="space-y-4 text-xs">
              {/* Provider Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Penyedia AI (Provider)</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(editingTask.providers_supported || ['gemini', 'openai', 'claude', 'deepseek', 'ollama']).map(
                    (p) => {
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
                          className={`p-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Model Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilihan Model Arsitektur</label>
                <select
                  value={taskForm.model}
                  onChange={(e) => setTaskForm({ ...taskForm, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                  <button
                    type="button"
                    onClick={() => setShowTaskApiKey(!showTaskApiKey)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showTaskApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showTaskApiKey ? 'Sembunyikan' : 'Perlihatkan'}</span>
                  </button>
                </div>
                <input
                  type={showTaskApiKey ? 'text' : 'password'}
                  placeholder="Kosongkan untuk otomatis menggunakan Vault Global"
                  value={taskForm.api_key}
                  onChange={(e) => setTaskForm({ ...taskForm, api_key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Hyperparameters: Temperature & Max Tokens */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
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
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {taskForm.temperature <= 0.2
                      ? 'Deterministik (Optimal koreksi esai)'
                      : taskForm.temperature <= 0.7
                      ? 'Seimbang (Penalaran & konsep)'
                      : 'Kreatif (Variasi butir soal)'}
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                  className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs flex items-center gap-2 font-display"
                >
                  {isSavingTask ? 'Menyimpan...' : 'Simpan Konfigurasi'}
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
