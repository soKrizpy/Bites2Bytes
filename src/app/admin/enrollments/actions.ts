'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createEnrollmentAction(prevState: any, formData: FormData) {
  const adminClient = createAdminClient()
  
  const teacher_id = formData.get('teacher_id') as string
  const student_id = formData.get('student_id') as string
  const module_id = formData.get('module_id') as string
  const zoom_link = formData.get('zoom_link') as string

  if (!teacher_id || !student_id || !module_id) {
    return { success: false, error: 'Harap lengkapi Guru, Siswa, dan Modul.', message: '' }
  }

  const { data, error } = await adminClient.from('enrollments').insert({
    teacher_id,
    student_id,
    module_id,
    zoom_link: zoom_link || null
  })

  if (error) {
    console.error('Error creating enrollment:', error.message)
    // Supabase returns 23505 for unique constraint violation
    if (error.code === '23505') {
       return { success: false, error: 'Siswa ini sudah di-enroll ke guru dan modul tersebut!', message: '' }
    }
    return { success: false, error: error.message, message: '' }
  }

  revalidatePath('/admin/enrollments')
  return { success: true, message: 'Kelas berhasil dibuat!', error: '' }
}

export async function deleteEnrollmentAction(id: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('enrollments').delete().eq('id', id)
  if (error) {
    console.error('Error deleting enrollment:', error.message)
    return { success: false, error: error.message }
  }
  revalidatePath('/admin/enrollments')
  return { success: true, message: 'Enrollment dihapus!' }
}
