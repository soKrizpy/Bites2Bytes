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

export async function submitQuizAction(payload: {
  studentId: string
  topicId: string
  score: number
}) {
  const supabase = await createClient()

  // 1. Fetch topic requirements
  const { data: topic } = await supabase
    .from('topics')
    .select('passing_score, badge_id')
    .eq('id', payload.topicId)
    .single()

  const passingScore = topic?.passing_score ?? 80
  const badgeId = topic?.badge_id
  const passed = payload.score >= passingScore

  // 2. Upsert record
  const { error } = await supabase
    .from('student_progress')
    .upsert({
      student_id: payload.studentId,
      topic_id: payload.topicId,
      completed: passed,
      quiz_score: payload.score,
      badge_earned: passed && !!badgeId,
      badge_id: passed ? badgeId : null,
      completed_at: passed ? new Date().toISOString() : null,
    }, { onConflict: 'student_id,topic_id' })

  if (error) {
    console.error('submitQuizAction error:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  revalidatePath(`/student/topics/${payload.topicId}`)
  return { success: true, passed, score: payload.score, required: passingScore }
}
