'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitExamAction(payload: {
  studentId: string
  moduleId: string
  examId: string
  score: number
  passed: boolean
}) {
  const supabase = await createClient()

  if (!payload.passed) {
    // Simpan skor gagal saja, tidak buat sertifikat
    return { success: true, passed: false, score: payload.score }
  }

  // Auto-generate sertifikat
  const { data, error } = await supabase
    .from('certificates')
    .upsert({
      student_id: payload.studentId,
      module_id: payload.moduleId,
      exam_score: payload.score,
    }, { onConflict: 'student_id,module_id' })
    .select('id, certificate_number')
    .single()

  if (error) {
    console.error('submitExamAction error:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  revalidatePath(`/student/exam/${payload.moduleId}`)
  return { success: true, passed: true, score: payload.score, certificateId: data?.id }
}
