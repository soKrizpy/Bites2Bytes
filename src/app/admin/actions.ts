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
  
  const rawUsername = formData.get('username') as string
  const role = formData.get('role') as string
  const mpin = formData.get('mpin') as string

  if (!rawUsername || !role || !mpin) {
    return { success: false, error: 'All fields are required.' }
  }

  // Define synthetic email domain
  const internalDomain = '@bites2bytes.internal'
  
  // Format username to be safe and consistent (lowercase, trimmed)
  const username = rawUsername.trim().toLowerCase()
  const syntheticEmail = `${username}${internalDomain}`

  // Create user using Supabase Admin API
  const { data: authData, error } = await adminClient.auth.admin.createUser({
    email: syntheticEmail,
    password: mpin,
    email_confirm: true,
    user_metadata: {
      username: username,
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
      full_name: username,
      role: role,
      plain_mpin: mpin
    })
    
    if (profileError) {
      console.error('Error saving plain_mpin to profile:', profileError.message)
    }
  }

  revalidatePath('/admin')
  return { success: true, message: `Successfully created user ${username}!` }
}

export async function repairSupabaseAction(): Promise<RepairActionResult> {
  if (!hasAdminCredentials()) {
    return {
      success: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY belum diset, jadi repair otomatis belum bisa dijalankan.',
    }
  }

  const [profileSync, profilePicturesBucket, badgesBucket] = await Promise.all([
    syncProfilesFromAuthUsers(),
    ensureStorageBucket('profile-pictures'),
    ensureStorageBucket('badges'),
  ])

  if (!profileSync.success) {
    return {
      success: false,
      error: profileSync.error || 'Sinkronisasi profiles gagal.',
      syncedCount: profileSync.syncedCount,
    }
  }

  const bucketErrors = [profilePicturesBucket.error, badgesBucket.error].filter(Boolean)
  if (bucketErrors.length > 0) {
    return {
      success: false,
      error: bucketErrors.join(' | '),
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
