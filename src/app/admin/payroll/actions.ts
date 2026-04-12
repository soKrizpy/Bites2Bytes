'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function processPayrollAction(teacherId: string, amountToPay: number, sessionCount: number) {
  const adminClient = createAdminClient()
  
  // 1. Get auth user to mark 'processed_by'
  const { data: { user } } = await adminClient.auth.getUser()
  const adminId = user?.id || null 

  // We have a complex update here since class_sessions doesn't have teacher_id directly,
  // we would normally need to do this via RPC or finding the IDs first.
  
  // A. Find all enrollments for this teacher
  const { data: enrollments } = await adminClient.from('enrollments').select('id').eq('teacher_id', teacherId)
  if (!enrollments || enrollments.length === 0) return { success: false, error: 'Tidak ada enrollment untuk guru ini.' }
  
  const enrollmentIds = enrollments.map(e => e.id)

  // B. Find all unpaid sessions for these enrollments
  const { data: sessions } = await adminClient.from('class_sessions')
    .select('id')
    .in('enrollment_id', enrollmentIds)
    .eq('report_submitted', true)
    .eq('is_paid', false)

  if (!sessions || sessions.length === 0) return { success: false, error: 'Tidak ada sesi valid yang belum dibayar.' }

  const sessionIds = sessions.map(s => s.id)

  // C. Update those sessions to is_paid = true
  const { error: updateError } = await adminClient.from('class_sessions')
    .update({ is_paid: true })
    .in('id', sessionIds)

  if (updateError) return { success: false, error: updateError.message }

  // D. Create payroll_slips record
  const { error: slipError } = await adminClient.from('payroll_slips')
    .insert({
      teacher_id: teacherId,
      amount_paid: amountToPay,
      processed_by: adminId
    })

  if (slipError) {
    console.error("Payroll updated but slip creation failed:", slipError)
  }

  revalidatePath('/admin/payroll')
  return { success: true }
}
