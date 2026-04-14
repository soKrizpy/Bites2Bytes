'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitExamAction(payload: {
  studentId: string
  moduleId: string
  score: number
}) {
  const supabase = await createClient()

  // 1. Fetch module requirements
  const { data: moduleData } = await supabase
    .from('modules')
    .select('passing_score')
    .eq('id', payload.moduleId)
    .single()

  const passingScore = moduleData?.passing_score ?? 80
  const passed = payload.score >= passingScore

  if (!passed) {
    return { success: true, passed: false, score: payload.score, required: passingScore }
  }

  // 2. Generate custom certificate number via RPC
  const { data: certSerial, error: rpcError } = await supabase.rpc('generate_certificate_number')
  
  if (rpcError) {
    console.error('RPC generate_certificate_number error:', rpcError.message)
  }

  // 3. Auto-generate sertifikat
  const { data, error } = await supabase
    .from('certificates')
    .upsert({
      student_id: payload.studentId,
      module_id: payload.moduleId,
      exam_score: payload.score,
      certificate_number: certSerial || `B2B-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    }, { onConflict: 'student_id,module_id' })
    .select('id, certificate_number')
    .single()

  if (error) {
    console.error('submitExamAction error:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  revalidatePath(`/student/exam/${payload.moduleId}`)
  return { success: true, passed: true, score: payload.score, required: passingScore, certificateId: data?.id, serial: data?.certificate_number }
}
