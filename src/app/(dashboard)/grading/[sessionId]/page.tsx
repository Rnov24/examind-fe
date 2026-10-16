'use client'

import { useParams } from 'next/navigation'
import GradeReviewWorkspace from '@/components/grading/GradeReviewWorkspace'

export default function GradingSessionPage() {
  const params = useParams()
  const sessionId = Number(params?.sessionId)

  return <GradeReviewWorkspace initialSessionId={sessionId} />
}
