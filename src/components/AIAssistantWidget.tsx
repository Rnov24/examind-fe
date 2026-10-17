'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  BarChart3,
  CalendarClock,
  ListChecks,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Users,
  FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  isError?: boolean
}

interface QuickChip {
  label: string
  icon: LucideIcon
}

const markdownComponents: Components = {
  p: ({ node, children, ...props }) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-slate-800" {...props}>{children}</p>
  ),
  strong: ({ node, children, ...props }) => (
    <strong className="font-semibold text-slate-900" {...props}>{children}</strong>
  ),
  em: ({ node, children, ...props }) => <em className="italic text-slate-800" {...props}>{children}</em>,
  code: ({ node, className, children, ...props }) => (
    <code
      className={clsx(
        'bg-slate-100 text-[#150f23] px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200/80 font-medium',
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ node, children, ...props }) => (
    <pre
      className="my-2.5 p-3 rounded-lg bg-[#150f23] text-slate-100 overflow-x-auto text-[11px] font-mono leading-relaxed border border-[#362d59] [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:!border-0 [&_code]:!text-inherit"
      {...props}
    >
      {children}
    </pre>
  ),
  ul: ({ node, children, ...props }) => (
    <ul className="list-disc pl-4 space-y-1 my-2 text-slate-800" {...props}>{children}</ul>
  ),
  ol: ({ node, children, ...props }) => (
    <ol className="list-decimal pl-4 space-y-1 my-2 text-slate-800" {...props}>{children}</ol>
  ),
  li: ({ node, children, ...props }) => (
    <li className="leading-relaxed text-slate-800" {...props}>{children}</li>
  ),
  h1: ({ node, children, ...props }) => (
    <h1 className="text-base font-bold text-slate-900 mt-3 mb-1.5 border-b border-slate-200 pb-1" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1" {...props}>{children}</h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1" {...props}>{children}</h3>
  ),
  h4: ({ node, children, ...props }) => (
    <h4 className="text-xs font-semibold text-slate-900 mt-1.5 mb-0.5" {...props}>{children}</h4>
  ),
  blockquote: ({ node, children, ...props }) => (
    <blockquote className="border-l-2 border-[#6a5fc1] pl-3 py-1 my-2 text-slate-600 italic bg-slate-50/80 rounded-r" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ node, children, ...props }) => (
    <div className="overflow-x-auto my-2.5 rounded border border-slate-200">
      <table className="w-full text-left border-collapse text-[11px]" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ node, children, ...props }) => (
    <th
      className="border-b border-slate-200 bg-slate-100/90 px-2.5 py-1.5 font-semibold text-slate-900"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ node, children, ...props }) => (
    <td className="border-b border-slate-100 px-2.5 py-1.5 text-slate-800" {...props}>
      {children}
    </td>
  ),
  a: ({ node, href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#6a5fc1] hover:text-[#422082] underline underline-offset-2 font-medium break-all"
      {...props}
    >
      {children}
    </a>
  ),
}

export default function AIAssistantWidget() {
  const { user, isAuthenticated } = useAuthStore()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputQuery, setInputQuery] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [provider, setProvider] = useState<string>('AI')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const isStudent = user?.role === 'student'
  const isTeacher = user?.role === 'teacher'
  const userName = user?.full_name || user?.identifier || 'Pengguna'
  const storageKey = `examind_ai_chat_mem_${user?.id || 'guest'}`

  const formatCurrentTime = (): string => {
    const d = new Date()
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${mins}`
  }

  // Load chat memory and provider from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        setMessages(JSON.parse(raw))
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    }

    try {
      const savedProvider = localStorage.getItem('examind_ai_provider')
      if (savedProvider) {
        setProvider(savedProvider)
      }
    } catch {}
  }, [storageKey])

  // Scroll to bottom on updates
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [isOpen, messages, isLoading])

  // Escape key handler to close chat drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Auto-grow textarea up to ~4 lines (max 116px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 116
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [inputQuery])

  const saveMessages = (msgs: ChatMessage[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-30)))
    } catch (e) {
      console.error('Failed to save chat memory:', e)
    }
  }

  const clearMessages = () => {
    setMessages([])
    try {
      localStorage.removeItem(storageKey)
    } catch (e) {
      console.error('Failed to clear chat memory:', e)
    }
  }

  const handleCopy = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIdx(idx)
      setTimeout(() => {
        setCopiedIdx((curr) => (curr === idx ? null : curr))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const currentQuickChips: QuickChip[] = (() => {
    if (isStudent) {
      return [
        { label: 'Berapa nilai ujian terakhir saya?', icon: BarChart3 },
        { label: 'Apa jadwal ujian mendatang?', icon: CalendarClock },
        { label: 'Tampilkan daftar ujian saya', icon: ListChecks },
        { label: 'Berapa rata-rata nilai saya?', icon: TrendingUp },
      ]
    } else if (isTeacher) {
      return [
        { label: 'Ringkasan Nilai Ujian Siswa', icon: BarChart3 },
        { label: 'Ide Paket Soal Baru', icon: Sparkles },
        { label: 'Panduan Rubrik Esai 4D', icon: FileText },
        { label: 'Status Proctoring Kelas', icon: ShieldCheck },
      ]
    } else {
      // admin, superadmin, and school managers
      return [
        { label: 'Ringkasan Statistik Sekolah', icon: BarChart3 },
        { label: 'Total Siswa & Guru Aktif', icon: Users },
        { label: 'Insiden Proctoring Terbaru', icon: ShieldCheck },
        { label: 'Lihat promo & paket harga', icon: Sparkles },
      ]
    }
  })()

  const handleSend = async (overridePrompt?: string, baseHistory?: ChatMessage[]) => {
    const query = (overridePrompt !== undefined ? overridePrompt : inputQuery).trim()
    if (!query || isLoading) return

    const historyToUse = baseHistory || messages
    const userMsg: ChatMessage = {
      role: 'user',
      content: query,
      timestamp: formatCurrentTime(),
    }
    const newMsgs: ChatMessage[] = [...historyToUse, userMsg]
    setMessages(newMsgs)
    saveMessages(newMsgs)
    setInputQuery('')
    setIsLoading(true)

    try {
      const historyPayload = historyToUse.map((m) => ({ role: m.role, content: m.content }))
      const savedKey = localStorage.getItem('examind_gemini_key') || undefined
      const res = await api.post('/ai/assistant/chat', {
        message: query,
        history: historyPayload,
        context: isStudent ? 'EXAMIND Student Portal' : 'EXAMIND Dashboard',
        api_key: savedKey,
      })

      const resProvider = res.data?.data?.provider
      if (resProvider && typeof resProvider === 'string') {
        setProvider(resProvider)
        try {
          localStorage.setItem('examind_ai_provider', resProvider)
        } catch {}
      }

      const reply = res.data?.data?.reply || 'Respon diterima dari asisten.'
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: formatCurrentTime(),
      }
      const finalMsgs: ChatMessage[] = [...newMsgs, assistantMsg]
      setMessages(finalMsgs)
      saveMessages(finalMsgs)
    } catch (err: any) {
      const errorDetail = err.response?.data?.message || err.response?.data?.detail
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content:
          errorDetail ||
          'Maaf, terjadi gangguan saat menghubungi asisten AI. Pastikan server backend aktif dan silakan coba kembali.',
        timestamp: formatCurrentTime(),
        isError: true,
      }
      const errorMsgs: ChatMessage[] = [...newMsgs, errorMsg]
      setMessages(errorMsgs)
      saveMessages(errorMsgs)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (isLoading) return
    const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user')
    if (lastUserIndex === -1) return
    const lastPrompt = messages[lastUserIndex].content
    const baseHistory = messages.slice(0, lastUserIndex)
    handleSend(lastPrompt, baseHistory)
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka Asisten AI EXAMIND"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-40 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#150f23] hover:bg-[#1f1633] text-white font-semibold text-xs shadow-xl shadow-[#150f23]/30 border border-[#362d59] flex items-center gap-2.5 transition-all cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none anim-rise"
        >
          <div className="w-5 h-5 rounded-md bg-[#6a5fc1]/20 text-[#c2ef4e] border border-[#6a5fc1]/40 flex items-center justify-center font-mono text-[10px] font-bold">
            AI
          </div>
          <span>Asisten EXAMIND</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#1f1633] text-slate-300 border border-[#362d59] font-mono">
            {provider}
          </span>
          {isStudent && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
              Data Ujian
            </span>
          )}
        </button>
      )}

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Jendela Chat Asisten EXAMIND"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-[max(1.5rem,env(safe-area-inset-right))] left-4 sm:left-auto z-50 w-[min(24rem,calc(100vw-2rem))] h-[min(600px,calc(100dvh-6rem))] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900 anim-rise"
        >
          {/* Drawer Header */}
          <div className="p-4 px-5 bg-[#150f23] text-white flex items-center justify-between border-b border-[#362d59] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#6a5fc1]/20 border border-[#6a5fc1]/40 flex items-center justify-center text-[#c2ef4e] font-mono text-[11px] font-bold">
                AI
              </div>
              <div>
                <h3 className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                  <span>Asisten EXAMIND</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#1f1633] text-slate-300 border border-[#362d59] font-mono">
                    {provider}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                    Memori Aktif
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isStudent
                    ? 'Data Akademik, Nilai & Jadwal Ujian'
                    : 'Asisten Kurikulum & Evaluasi Belajar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearMessages}
                  title="Bersihkan Percakapan"
                  aria-label="Bersihkan Percakapan"
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1f1633] text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                aria-label="Tutup Chat"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1f1633] text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages Stream Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs"
          >
            {/* Initial Welcome Message */}
            <div className="flex items-start gap-2.5 anim-rise">
              <div className="w-6 h-6 rounded-md bg-[#6a5fc1]/10 text-[#6a5fc1] border border-[#6a5fc1]/20 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                AI
              </div>
              <div className="bg-white border border-slate-200 text-slate-800 rounded-xl rounded-tl-xs p-3 shadow-xs leading-relaxed max-w-[85%] text-xs">
                {isStudent ? (
                  <>
                    Halo, <span className="font-bold text-slate-900">{userName}</span>!<br />
                    Saya asisten pintar EXAMIND yang terhubung langsung dengan riwayat akademikmu.
                    Kamu bisa menanyakan <b>nilai ujian terakhir</b>, <b>jadwal ujian mendatang</b>, atau <b>rekapitulasi nilaimu</b> secara langsung!
                  </>
                ) : isTeacher ? (
                  <>
                    Halo, <span className="font-bold text-slate-900">{userName}</span>!<br />
                    Saya siap membantu Anda memantau ringkasan hasil belajar kelas, membuat butir soal, atau menyusun rubrik esai 4 Dimensi.
                  </>
                ) : (
                  <>
                    Halo, <span className="font-bold text-slate-900">{userName}</span>!<br />
                    Saya siap memberikan ringkasan statistik sekolah dan aktivitas ujian pada platform EXAMIND.
                  </>
                )}
              </div>
            </div>

            {/* Chat History */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  'flex items-start gap-2.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div
                    className={clsx(
                      'w-6 h-6 rounded-md font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5',
                      msg.isError
                        ? 'bg-rose-100 text-rose-600 border border-rose-200'
                        : 'bg-[#6a5fc1]/10 text-[#6a5fc1] border border-[#6a5fc1]/20'
                    )}
                  >
                    {msg.isError ? (
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      'AI'
                    )}
                  </div>
                )}

                <div
                  className={clsx(
                    'flex flex-col',
                    msg.role === 'user' ? 'items-end max-w-[85%]' : 'items-start max-w-[85%]'
                  )}
                >
                  <div
                    className={clsx(
                      'p-3 rounded-xl text-xs leading-relaxed shadow-xs',
                      msg.role === 'user'
                        ? 'bg-[#150f23] text-white rounded-tr-xs whitespace-pre-line'
                        : msg.isError
                        ? 'bg-rose-50/70 border border-rose-200 text-rose-950 rounded-tl-xs w-full'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <div>{msg.content}</div>
                    ) : msg.isError ? (
                      <div>
                        <div className="font-semibold text-rose-900 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
                          <span>Gagal Mendapatkan Respon</span>
                        </div>
                        <p className="text-slate-700 mb-2.5 text-xs">{msg.content}</p>
                        <button
                          type="button"
                          onClick={handleRetry}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                        >
                          <RotateCcw className="w-3 h-3 text-rose-600" aria-hidden="true" />
                          <span>Coba lagi</span>
                        </button>
                      </div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Message extras: timestamp & copy button */}
                  <div
                    className={clsx(
                      'flex items-center gap-2 mt-1 px-1',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    )}
                    {msg.role === 'assistant' && !msg.isError && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, idx)}
                        title={copiedIdx === idx ? 'Tersalin' : 'Salin jawaban'}
                        aria-label={copiedIdx === idx ? 'Teks berhasil disalin' : 'Salin jawaban asisten'}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-slate-200/50"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                            <span className="text-emerald-600 font-medium">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" aria-hidden="true" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 anim-rise">
                <div className="w-6 h-6 rounded-md bg-[#6a5fc1]/10 text-[#6a5fc1] border border-[#6a5fc1]/20 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 animate-pulse mt-0.5">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 text-slate-500 flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#6a5fc1] animate-ping" aria-hidden="true" />
                  <span className="text-[11px] font-medium">
                    {provider} sedang mencari data &amp; merespon...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            {currentQuickChips.map((chip) => {
              const Icon = chip.icon
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSend(chip.label)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/20 focus:outline-none shrink-0"
                >
                  <Icon className="w-3 h-3 text-[#6a5fc1] shrink-0" aria-hidden="true" />
                  <span>{chip.label}</span>
                </button>
              )
            })}
          </div>

          {/* Input Bar with Auto-growing Textarea */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                isStudent
                  ? 'Tanya nilai, jadwal, atau materi...'
                  : 'Tanyakan sesuatu ke Asisten AI...'
              }
              disabled={isLoading}
              aria-label="Tulis pertanyaan ke Asisten AI"
              className="flex-1 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/20 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all resize-none max-h-28 overflow-y-auto leading-relaxed"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              title="Kirim pesan"
              aria-label="Kirim pesan"
              className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-[#150f23] hover:bg-[#1f1633] disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs shrink-0 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
