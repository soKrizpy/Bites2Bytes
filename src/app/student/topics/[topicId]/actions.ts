'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

interface SubmitQuizPayload {
  studentId: string
  topicId: string
  quizId: string
  score: number
  passed: boolean
  badgeId: string | null
}

export async function submitQuizAction(payload: SubmitQuizPayload) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('student_progress')
    .upsert({
      student_id: payload.studentId,
      topic_id: payload.topicId,
      completed: payload.passed,
      quiz_score: payload.score,
      badge_earned: payload.passed && !!payload.badgeId,
      badge_id: payload.passed ? payload.badgeId : null,
      completed_at: payload.passed ? new Date().toISOString() : null,
    }, { onConflict: 'student_id,topic_id' })

  if (error) {
    console.error('submitQuizAction error:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  revalidatePath(`/student/topics/${payload.topicId}`)
  return { success: true }
}
