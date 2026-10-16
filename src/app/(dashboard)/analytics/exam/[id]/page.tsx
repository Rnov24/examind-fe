'use client'

import { useParams } from 'next/navigation'
import AnalyticsWorkspace from '@/components/analytics/AnalyticsWorkspace'

export default function ExamAnalyticsPage() {
  const params = useParams()
  const examId = Number(params?.id)

  return <AnalyticsWorkspace initialExamId={examId} />
}
