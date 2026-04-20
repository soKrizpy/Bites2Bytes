'use server'

import { revalidatePath } from 'next/cache'
import {
  createAdminClient,
  ensureStorageBucket,
  hasAdminCredentials,
  syncProfilesFromAuthUsers,
} from '@/utils/supabase/admin'
import { getDeploymentAuditReport } from '@/utils/deploymentAudit'

interface ActionState {
  success: boolean
  error?: string
  message?: string
}

export interface RepairActionResult {
  success: boolean
  error?: string
  message?: string
  syncedCount?: number
  buckets?: string[]
}

export async function createUserAction(prevState: ActionState | null, formData: FormData) {
  void prevState

  if (!hasAdminCredentials()) {
    return {
      success: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY belum diset di environment, jadi akun baru belum bisa dibuat dari panel admin.',
    }
  }

  const adminClient = createAdminClient()
  
  const countryCode = formData.get('country_code') as string
  const rawNumber = formData.get('username') as string
  const role = formData.get('role') as string
  const mpin = formData.get('mpin') as string
  const fullName = (formData.get('full_name') as string) || rawNumber

  if (!rawNumber || !role || !mpin || !fullName) {
    return { success: false, error: 'All fields are required.' }
  }

  // Format WhatsApp number as username (e.g. +628123456789)
  // Remove leading zero if necessary (standard practice for international format)
  const cleanNumber = rawNumber.replace(/^0+/, '')
  const username = `${countryCode}${cleanNumber}`
  
  // Define synthetic email domain for Supabase Auth
  const internalDomain = '@bites2bytes.internal'
  const syntheticEmail = `${username}${internalDomain}`

  // Create user using Supabase Admin API
  const { data: authData, error } = await adminClient.auth.admin.createUser({
    email: syntheticEmail,
    password: mpin,
    email_confirm: true,
    user_metadata: {
      username: username,
      full_name: fullName,
      role: role
    }
  })

  if (error) {
    console.error('Error creating user:', error.message)
    return { success: false, error: error.message }
  }

  // Inject plain_mpin explicitly into profiles table
  if (authData.user) {
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: authData.user.id,
      username: username,
      full_name: fullName,
      role: role,
      plain_mpin: mpin,
      avatar_url: null // Initialize with null
    })
    
    if (profileError) {
      console.error('Error saving profile record:', profileError.message)
      return { success: false, error: `Auth user created but profile insertion failed: ${profileError.message}` }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/students')
  revalidatePath('/admin/teachers')
  return { success: true, message: `Successfully created ${role}: ${username}!` }
}

export async function repairSupabaseAction(): Promise<RepairActionResult> {
  if (!hasAdminCredentials()) {
    return {
      success: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY belum diset, jadi repair otomatis belum bisa dijalankan.',
    }
  }

  const [profileSync, profilePicturesBucket, badgesBucket, thumbnailsBucket] = await Promise.all([
    syncProfilesFromAuthUsers(),
    ensureStorageBucket('profile-pictures'),
    ensureStorageBucket('badges'),
    ensureStorageBucket('thumbnails'),
  ])

  if (!profileSync.success) {
    return {
      success: false,
      error: profileSync.error || 'Sinkronisasi profiles gagal.',
      syncedCount: profileSync.syncedCount,
    }
  }

  const bucketErrors = [
    profilePicturesBucket.error, 
    badgesBucket.error, 
    thumbnailsBucket.error
  ].filter(Boolean)

  if (bucketErrors.length > 0) {
    return {
      success: false,
      error: `Storage Setup Error: ${bucketErrors.join(' | ')}`,
      syncedCount: profileSync.syncedCount,
    }
  }

  const adminClient = createAdminClient()
  const { data: buckets } = await adminClient.storage.listBuckets()
  const report = await getDeploymentAuditReport()
  const remainingWarnings = report.supabaseItems.filter((item) => item.level !== 'ok')

  revalidatePath('/admin')
  revalidatePath('/admin/students')
  revalidatePath('/admin/teachers')
  revalidatePath('/teacher')
  revalidatePath('/student')
  revalidatePath('/admin/teachers')

  return {
    success: true,
    syncedCount: profileSync.syncedCount,
    buckets: (buckets || []).map((bucket) => bucket.id),
    message:
      remainingWarnings.length === 0
        ? `Repair selesai. ${profileSync.syncedCount || 0} profile berhasil disinkronkan dan bucket storage siap.`
        : `Repair selesai, tetapi masih ada ${remainingWarnings.length} item yang perlu dicek di panel Audit Deployment.`,
  }
}

export async function assignModuleToTeacherAction(teacherId: string, moduleId: string) {
  const adminClient = createAdminClient()
  
  const { error } = await adminClient
    .from('teacher_modules')
    .insert({ teacher_id: teacherId, module_id: moduleId })

  if (error) {
    console.error('Error assigning module to teacher:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/teachers')
  revalidatePath('/admin/enrollments')
  revalidatePath('/teacher')
  return { success: true, message: 'Module assigned successfully!' }
}

export async function unassignModuleFromTeacherAction(teacherId: string, moduleId: string) {
  const adminClient = createAdminClient()
  
  const { error } = await adminClient
    .from('teacher_modules')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('module_id', moduleId)

  if (error) {
    console.error('Error unassigning module from teacher:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/teachers')
  revalidatePath('/admin/enrollments')
  revalidatePath('/teacher')
  return { success: true, message: 'Module unassigned successfully!' }
}
