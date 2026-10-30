'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  MessageCircle,
  MessageSquarePlus,
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
import { ExamindLogo } from '@/components/brand/ExamindLogo'

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

function ExaAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const tile =
    size === 'lg'
      ? 'w-14 h-14 rounded-2xl'
      : size === 'sm'
        ? 'w-7 h-7 rounded-lg'
        : 'w-8 h-8 rounded-lg'
  const mark = size === 'lg' ? 'h-8' : size === 'sm' ? 'h-4' : 'h-5'
  return (
    <div
      className={clsx(
        tile,
        'bg-[#150f23] border border-[#362d59] flex items-center justify-center shrink-0'
      )}
      aria-hidden="true"
    >
      <ExamindLogo variant="symbol" theme="white" className={clsx(mark, 'w-auto')} />
    </div>
  )
}

export default function AIAssistantWidget() {
  const { user, isAuthenticated } = useAuthStore()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputQuery, setInputQuery] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [view, setView] = useState<'onboarding' | 'chat'>('onboarding')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const isStudent = user?.role === 'student'
  const isTeacher = user?.role === 'teacher'
  const userName = user?.full_name || user?.identifier || 'Pengguna'
  const storageKey = `examind_ai_chat_mem_${user?.id || 'guest'}`
  const openedKey = `examind_exa_opened_${user?.id || 'guest'}`

  const formatCurrentTime = (): string => {
    const d = new Date()
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${mins}`
  }

  // Load chat memory from localStorage; returning users with history skip
  // the onboarding screen and land straight in the conversation.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        setMessages(parsed)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setView('chat')
        }
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    }
  }, [storageKey])

  // Remember that EXA has been opened at least once for this user.
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem(openedKey, '1')
      } catch {}
    }
  }, [isOpen, openedKey])

  // Scroll to bottom on updates
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [isOpen, messages, isLoading, view])

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

  const startNewConversation = () => {
    setMessages([])
    setView('onboarding')
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
        { label: 'Kapan ujian saya berikutnya?', icon: CalendarClock },
        { label: 'Berapa nilai ujian terakhir saya?', icon: BarChart3 },
        { label: 'Ujian apa saja yang sedang aktif?', icon: ListChecks },
        { label: 'Berapa rata-rata nilai saya?', icon: TrendingUp },
        { label: 'Kelas apa saja yang saya ikuti?', icon: Users },
      ]
    } else if (isTeacher) {
      return [
        { label: 'Bagaimana hasil ujian terakhir kelas saya?', icon: BarChart3 },
        { label: 'Ujian apa yang sedang berjalan saat ini?', icon: CalendarClock },
        { label: 'Kelas apa saja yang saya ampu?', icon: Users },
        { label: 'Bantu saya menyusun rubrik penilaian esai', icon: FileText },
      ]
    } else {
      // admin, superadmin, and school managers
      return [
        { label: 'Ringkasan statistik sekolah', icon: BarChart3 },
        { label: 'Berapa jumlah siswa & guru aktif?', icon: Users },
        { label: 'Insiden proctoring terbaru', icon: ShieldCheck },
        { label: 'Paket harga & promo yang aktif', icon: Sparkles },
      ]
    }
  })()

  const statusLine = isStudent
    ? 'Siap membantu soal nilai & jadwal ujianmu'
    : isTeacher
      ? 'Siap membantu memantau kelasmu'
      : 'Siap membantu ringkasan data sekolah'

  const onboardingIntro = isStudent
    ? 'Aku bisa membantumu mengecek nilai ujian, jadwal ujian berikutnya, dan info kelasmu — langsung dari data akunmu.'
    : isTeacher
      ? 'Aku bisa membantumu melihat hasil ujian kelasmu, memantau ujian yang sedang berjalan, dan menyusun rubrik penilaian.'
      : 'Aku bisa membantumu melihat ringkasan statistik sekolah, jumlah pengguna aktif, insiden proctoring, serta info paket & promo.'

  const handleSend = async (overridePrompt?: string, baseHistory?: ChatMessage[]) => {
    const query = (overridePrompt !== undefined ? overridePrompt : inputQuery).trim()
    if (!query || isLoading) return

    setView('chat')
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

      const reply = res.data?.data?.reply || 'Jawaban diterima dari EXA.'
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: formatCurrentTime(),
      }
      const finalMsgs: ChatMessage[] = [...newMsgs, assistantMsg]
      setMessages(finalMsgs)
      saveMessages(finalMsgs)
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content:
          'Maaf, EXA sedang tidak bisa dihubungi saat ini. Periksa koneksimu, lalu coba lagi sebentar lagi ya.',
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
      {/* Floating Action Button — icon only */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka chat dengan EXA"
          title="Chat dengan EXA"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-40 w-14 h-14 rounded-full bg-[#150f23] hover:bg-[#1f1633] border border-[#362d59] shadow-xl shadow-[#150f23]/30 flex items-center justify-center transition-colors cursor-pointer focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none anim-pop"
        >
          <MessageCircle className="w-6 h-6 text-[#c2ef4e]" aria-hidden="true" />
        </button>
      )}

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Jendela chat dengan EXA"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-[max(1.5rem,env(safe-area-inset-right))] left-4 sm:left-auto z-50 w-[min(24rem,calc(100vw-2rem))] h-[min(600px,calc(100dvh-6rem))] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900 anim-rise"
        >
          {/* Drawer Header */}
          <div className="p-4 px-5 bg-[#150f23] text-white flex items-center justify-between border-b border-[#362d59] shrink-0">
            <div className="flex items-center gap-2.5">
              <ExaAvatar size="md" />
              <div>
                <h3 className="text-sm font-semibold leading-tight">EXA</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  {statusLine}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={startNewConversation}
                  title="Mulai percakapan baru"
                  aria-label="Mulai percakapan baru"
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1f1633] text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5fc1]/40"
                >
                  <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
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

          {/* Main Area: onboarding on first open, chat stream afterwards */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs"
          >
            {view === 'onboarding' ? (
              <div className="flex flex-col items-center text-center pt-4 pb-2 anim-rise">
                <ExaAvatar size="lg" />
                <h4 className="mt-3.5 text-base font-bold text-slate-900">Halo, aku EXA</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-[17rem]">
                  Senang bertemu denganmu,{' '}
                  <span className="font-semibold text-slate-900">{userName}</span>.{' '}
                  {onboardingIntro}
                </p>

                <div className="mt-4 w-full flex flex-col gap-2">
                  {currentQuickChips.map((chip) => {
                    const Icon = chip.icon
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleSend(chip.label)}
                        disabled={isLoading}
                        className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#6a5fc1]/50 hover:bg-[#6a5fc1]/5 text-left text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50 shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/20 focus:outline-none"
                      >
                        <span className="w-7 h-7 rounded-lg bg-[#6a5fc1]/10 text-[#6a5fc1] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                        <span>{chip.label}</span>
                      </button>
                    )
                  })}
                </div>

                <p className="mt-4 text-[11px] text-slate-400">
                  Atau ketik pertanyaanmu sendiri di kolom bawah.
                </p>
              </div>
            ) : (
              <>
                {/* Chat History */}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      'flex items-start gap-2.5',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' &&
                      (msg.isError ? (
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="mt-0.5">
                          <ExaAvatar size="sm" />
                        </div>
                      ))}

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
                              <span>Ups, ada gangguan</span>
                            </div>
                            <p className="text-slate-700 mb-2.5 text-xs">{msg.content}</p>
                            <button
                              type="button"
                              onClick={handleRetry}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[28px] rounded-md bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
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
                          <span className="text-[10px] text-slate-400">
                            {msg.timestamp}
                          </span>
                        )}
                        {msg.role === 'assistant' && !msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, idx)}
                            title={copiedIdx === idx ? 'Tersalin' : 'Salin jawaban'}
                            aria-label={copiedIdx === idx ? 'Teks berhasil disalin' : 'Salin jawaban EXA'}
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
                    <ExaAvatar size="sm" />
                    <div
                      className="bg-white border border-slate-200 rounded-xl rounded-tl-xs px-3.5 py-3 shadow-xs flex items-center gap-1.5"
                      role="status"
                      aria-label="EXA sedang mengetik"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6a5fc1] animate-bounce motion-reduce:animate-none" aria-hidden="true" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#6a5fc1] animate-bounce motion-reduce:animate-none"
                        style={{ animationDelay: '150ms' }}
                        aria-hidden="true"
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#6a5fc1] animate-bounce motion-reduce:animate-none"
                        style={{ animationDelay: '300ms' }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Action Prompt Chips (chat view) */}
          {view === 'chat' && (
            <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
              {currentQuickChips.map((chip) => {
                const Icon = chip.icon
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSend(chip.label)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs focus:ring-2 focus:ring-[#6a5fc1]/20 focus:outline-none shrink-0"
                  >
                    <Icon className="w-3 h-3 text-[#6a5fc1] shrink-0" aria-hidden="true" />
                    <span>{chip.label}</span>
                  </button>
                )
              })}
            </div>
          )}

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
                  ? 'Tanya nilai atau jadwal ujianmu…'
                  : 'Tulis pertanyaanmu untuk EXA…'
              }
              disabled={isLoading}
              aria-label="Tulis pesan untuk EXA"
              className="flex-1 px-3.5 py-2.5 min-h-[44px] rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#6a5fc1] focus:ring-2 focus:ring-[#6a5fc1]/20 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none transition-colors resize-none max-h-28 overflow-y-auto leading-relaxed"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              title="Kirim pesan"
              aria-label="Kirim pesan"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#150f23] hover:bg-[#1f1633] disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs shrink-0 focus:ring-2 focus:ring-[#6a5fc1]/40 focus:outline-none"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
