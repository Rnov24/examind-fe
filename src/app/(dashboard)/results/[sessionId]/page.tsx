'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function ResultSessionRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.sessionId
  const [error, setError] = useState(false)

  useEffect(() => {
    async function resolveExam() {
      if (!sessionId) return
      try {
        const res = await api.get(`/grading/session/${sessionId}`)
        const examId = res.data.data?.exam_id
        if (examId) {
          router.replace(`/student/exam/${examId}/result`)
        } else {
          router.replace('/student/dashboard')
        }
      } catch {
        setError(true)
      }
    }
    resolveExam()
  }, [sessionId, router])

  if (error) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Hasil ujian tidak ditemukan atau sesi belum selesai dinilai.
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
    </div>
  )
}
