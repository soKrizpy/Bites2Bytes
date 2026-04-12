'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function joinZoomAction(enrollmentId: string, topicId: string) {
  const supabase = await createClient()

  // Upsert the class_session record as an attendance log
  const { data, error } = await supabase.from('class_sessions').upsert({
    enrollment_id: enrollmentId,
    topic_id: topicId,
    session_date: new Date().toISOString(),
    student_joined: true
  }, { onConflict: 'enrollment_id,topic_id' })

  if (error) {
    console.error('Error logging student attendance:', error.message)
    return { success: false }
  }

  revalidatePath('/student')
  return { success: true }
}
