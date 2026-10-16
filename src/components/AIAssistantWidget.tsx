'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, RotateCcw } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistantWidget() {
  const { user, isAuthenticated } = useAuthStore()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputQuery, setInputQuery] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  const isStudent = user?.role === 'student'
  const isTeacher = user?.role === 'teacher'
  const userName = user?.full_name || user?.identifier || 'Pengguna'
  const storageKey = `examind_ai_chat_mem_${user?.id || 'guest'}`

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
  }, [storageKey])

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [isOpen, messages, isLoading])

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

  const currentQuickChips = (() => {
    if (isStudent) {
      return [
        '📊 Berapa nilai ujian terakhir saya?',
        '⏰ Apa jadwal ujian mendatang?',
        '📝 Tampilkan daftar ujian saya',
        '📈 Berapa rata-rata nilai saya?',
      ]
    } else if (isTeacher) {
      return [
        '📊 Ringkasan Nilai Ujian Siswa',
        '💡 Ide Paket Soal Baru',
        '📝 Panduan Rubrik Esai 4D',
        '🛡️ Status Proctoring Kelas',
      ]
    } else {
      return [
        '📊 Ringkasan Statistik Sekolah',
        '👥 Total Siswa & Guru Aktif',
        '🚨 Insiden Proctoring Terbaru',
      ]
    }
  })()

  const formatMarkdown = (text: string): string => {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 border border-slate-200">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-3 list-disc">$1</li>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br />')
  }

  const handleSend = async (overridePrompt?: string) => {
    const query = (overridePrompt || inputQuery).trim()
    if (!query || isLoading) return

    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: query }]
    setMessages(newMsgs)
    saveMessages(newMsgs)
    setInputQuery('')
    setIsLoading(true)

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }))
      const savedKey = localStorage.getItem('examind_gemini_key') || undefined
      const res = await api.post('/ai/assistant/chat', {
        message: query,
        history: historyPayload,
        context: isStudent ? 'EXAMIND Student Portal' : 'EXAMIND Dashboard',
        api_key: savedKey,
      })

      const reply = res.data?.data?.reply || 'Respon diterima dari asisten.'
      const finalMsgs: ChatMessage[] = [...newMsgs, { role: 'assistant', content: reply }]
      setMessages(finalMsgs)
      saveMessages(finalMsgs)
    } catch (err: any) {
      const errorDetail = err.response?.data?.message || err.response?.data?.detail
      const errorMsgs: ChatMessage[] = [
        ...newMsgs,
        {
          role: 'assistant',
          content: errorDetail
            ? `⚠️ ${errorDetail}`
            : 'Maaf, terjadi gangguan saat menghubungi asisten AI. Pastikan server backend aktif dan silakan coba kembali.',
        },
      ]
      setMessages(errorMsgs)
      saveMessages(errorMsgs)
    } finally {
      setIsLoading(false)
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
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-40 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xl shadow-slate-900/20 border border-slate-700/60 flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-mono text-[10px] font-bold">
            AI
          </div>
          <span>Asisten EXAMIND</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Gemini
          </span>
          {isStudent && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
              Data Ujian
            </span>
          )}
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-[max(1.5rem,env(safe-area-inset-right))] left-4 sm:left-auto z-50 sm:w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-max(4rem,calc(2rem+env(safe-area-inset-bottom))))] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900">
          {/* Drawer Header */}
          <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-mono text-[11px] font-bold">
                AI
              </div>
              <div>
                <h3 className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                  <span>Asisten EXAMIND</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Gemini
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                aria-label="Tutup Chat"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream Area */}
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
            {/* Initial Welcome Message */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                AI
              </div>
              <div className="bg-white border border-slate-200 text-slate-800 rounded-xl rounded-tl-xs p-3 shadow-xs leading-relaxed max-w-[85%]">
                {isStudent ? (
                  <>
                    Halo, <span className="font-bold text-slate-900">{userName}</span>! 🎓<br />
                    Saya asisten pintar EXAMIND yang terhubung langsung dengan riwayat akademikmu.
                    Kamu bisa menanyakan <b>nilai ujian terakhir</b>, <b>jadwal ujian mendatang</b>, atau <b>rekapitulasi nilaimu</b> secara langsung!
                  </>
                ) : isTeacher ? (
                  <>
                    Halo, <span className="font-bold text-slate-900">{userName}</span>! 👨‍🏫<br />
                    Saya siap membantu Anda memantau ringkasan hasil belajar kelas, membuat butir soal, atau menyusun rubrik esai 4 Dimensi.
                  </>
                ) : (
                  <>
                    Halo, <span className="font-bold text-slate-900">{userName}</span>! 🛡️<br />
                    Saya siap memberikan ringkasan statistik sekolah dan aktivitas ujian pada platform EXAMIND.
                  </>
                )}
              </div>
            </div>

            {/* Chat History */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    AI
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs whitespace-pre-line'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 animate-pulse">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 text-slate-500 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                  <span className="text-[11px] font-medium">Gemini sedang mencari data & merespon...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            {currentQuickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  const cleanText = chip.replace(/^[^\w\s]+/, '').trim()
                  handleSend(cleanText || chip)
                }}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text"
              placeholder={
                isStudent
                  ? 'Tanya nilai, jadwal, atau materi...'
                  : 'Tanyakan sesuatu ke Gemini AI...'
              }
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              aria-label="Kirim Pesan"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
