'use client'

import { useParams } from 'next/navigation'
import GradeReviewWorkspace from '@/components/grading/GradeReviewWorkspace'

export default function ExamGradingPage() {
  const params = useParams()
  const examId = Number(params?.id)

  return <GradeReviewWorkspace initialExamId={examId} />
}
