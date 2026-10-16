'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bot, RotateCcw, Send, Sparkles } from 'lucide-react'
import api from '@/lib/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface QuestionExplanationChatProps {
  examId: number
  questionId: number
  questionNumber: number
  questionPrompt: string
  questionType: string
  isCorrect?: boolean
  studentResponse?: string
  correctAnswer?: string
  officialExplanation?: string
  finalScore?: number
  allocatedPoints?: number
}

export default function QuestionExplanationChat({
  examId,
  questionId,
  questionNumber,
  questionPrompt,
  questionType,
  isCorrect,
  studentResponse,
  correctAnswer,
  officialExplanation,
  finalScore = 0,
  allocatedPoints = 10,
}: QuestionExplanationChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const storageKey = `examind_tutor_${examId}_${questionId}`

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          setMessages(JSON.parse(saved))
        } catch {
          // ignore corrupted data
        }
      }
    }
  }, [storageKey])

  function saveMessages(newMsgs: ChatMessage[]) {
    setMessages(newMsgs)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newMsgs))
    }
  }

  function resetChat() {
    if (confirm('Reset riwayat percakapan untuk butir soal ini?')) {
      setMessages([])
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey)
      }
    }
  }

  const quickChips =
    questionType === 'essay' || questionType === 'short_answer'
      ? [
          'Poin acuan apa saja yang belum terpenuhi di jawaban saya?',
          'Bagaimana menyempurnakan jawaban essay ini agar bernilai penuh?',
          'Apakah ada miskonsepsi dalam penjelasan saya?',
          'Jelaskan konsep inti soal ini secara ringkas',
        ]
      : [
          'Jelaskan konsep dasar soal ini',
          'Kenapa jawaban saya salah?',
          'Beri analogi sederhana dalam kehidupan sehari-hari',
          'Beri tips/trik cepat menyelesaikan tipe soal ini',
        ]

  async function handleSend(overrideQuery?: string) {
    const q = (overrideQuery || inputQuery).trim()
    if (!q || isLoading) return

    const updated: ChatMessage[] = [...messages, { role: 'user', content: q }]
    saveMessages(updated)
    setInputQuery('')
    setIsLoading(true)

    try {
      const res = await api.post('/ai/socratic-tutor', {
        exam_id: examId,
        question_id: questionId,
        question_prompt: questionPrompt,
        question_type: questionType,
        student_response: studentResponse,
        correct_answer: correctAnswer,
        official_explanation: officialExplanation,
        user_query: q,
        conversation_history: messages.slice(-6),
      })

      const reply = res.data.data?.reply || 'Terima kasih telah bertanya. Mari kita pelajari kembali konsepnya.'
      saveMessages([...updated, { role: 'assistant', content: reply }])
    } catch {
      saveMessages([
        ...updated,
        {
          role: 'assistant',
          content:
            'Maaf, koneksi ke asisten tutor sedang terganggu. Pastikan koneksi internet Anda stabil atau tanyakan langsung ke guru pengampu.',
        },
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      }, 50)
    }
  }

  function sendQuickPrompt(chipText: string) {
    handleSend(chipText)
  }

  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      {/* Toggle Button to Open/Close Tutor Chat */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            isOpen
              ? 'bg-indigo-600 text-white font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Tutup Tutor AI' : 'Tanya Tutor AI tentang Soal Ini'}</span>
          {messages.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-white font-mono font-bold">
              {messages.length}
            </span>
          )}
        </button>

        {!isOpen && (
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Diskusikan konsep, alasan salah/benar, atau trik soal
          </span>
        )}
      </div>

      {/* Collapsible Socratic Tutor Chat Interface */}
      {isOpen && (
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[10px] font-bold shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <span>EXAMIND Socratic Tutor</span>
                <span className="text-[10px] font-normal text-slate-500">• Butir Soal #{questionNumber}</span>
                {messages.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    Memori Diskusi
                  </span>
                )}
              </h4>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={resetChat}
                title="Reset diskusi soal ini"
                aria-label="Reset diskusi soal ini"
                className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Messages Stream */}
          <div ref={chatContainerRef} className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
            {/* Initial Tutor Welcome */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 font-mono">
                AI
              </div>
              <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 text-slate-800 leading-relaxed shadow-xs max-w-[90%]">
                {isCorrect ? (
                  <>
                    🌟 <b>Bagus sekali!</b> Jawabanmu pada nomor ini sudah <b>benar</b> (Skor {finalScore}/
                    {allocatedPoints}).
                    <br />
                    Mau mendalami mengapa opsi pengecoh lainnya salah, atau ingin analogi pemahaman yang lebih kuat?
                  </>
                ) : (
                  <>
                    💡 Di soal nomor ini, jawabanmu adalah{' '}
                    <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold font-mono border border-rose-200">
                      {studentResponse || '(Kosong)'}
                    </code>
                    , sedangkan kunci jawaban resmi adalah{' '}
                    <code className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-bold font-mono border border-emerald-200">
                      {correctAnswer}
                    </code>
                    .
                    <br />
                    Jangan khawatir, yuk kita bedah di mana letak kekeliruan konsepnya! Apa yang ingin kamu tanyakan?
                  </>
                )}
              </div>
            </div>

            {/* Chat History */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 font-mono">
                    AI
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs whitespace-pre-line font-medium shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 animate-pulse font-mono">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-2.5 text-slate-500 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                  <span className="text-[11px] font-medium text-slate-500">
                    Tutor AI sedang menganalisis soal...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap pt-1">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => sendQuickPrompt(chip)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 pt-1">
            <input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text"
              placeholder={
                isCorrect
                  ? 'Tanyakan materi lanjutan atau variasi soal...'
                  : 'Tanyakan kenapa jawabanmu salah atau konsepnya...'
              }
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
