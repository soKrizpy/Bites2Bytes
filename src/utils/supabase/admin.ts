import { createClient } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'teacher' | 'student'

export interface ProfileSyncRow {
  id: string
  username: string
  full_name: string
  role: AppRole
}

export function hasAdminCredentials() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY belum diset. Fitur admin tingkat lanjut membutuhkan environment variable ini di Vercel/local.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function normalizeRole(role: unknown): AppRole | null {
  if (typeof role !== 'string') return null

  const normalizedRole = role.toLowerCase()
  if (normalizedRole === 'admin' || normalizedRole === 'teacher' || normalizedRole === 'student') {
    return normalizedRole
  }

  return null
}

export async function syncProfilesFromAuthUsers() {
  if (!hasAdminCredentials()) {
    return {
      success: false,
      skipped: true,
      error: 'SUPABASE_SERVICE_ROLE_KEY belum diset.',
      syncedCount: 0,
    }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })

  if (error) {
    return {
      success: false,
      skipped: false,
      error: error.message,
      syncedCount: 0,
    }
  }

  const rows: ProfileSyncRow[] = (data?.users || [])
    .map((user) => {
      const role = normalizeRole(user.user_metadata?.role)
      const username =
        typeof user.user_metadata?.username === 'string'
          ? user.user_metadata.username.trim()
          : user.email?.split('@')[0]?.trim()

      if (!role || !username) {
        return null
      }

      return {
        id: user.id,
        username,
        full_name: username,
        role,
      }
    })
    .filter((row): row is ProfileSyncRow => Boolean(row))

  if (rows.length === 0) {
    return {
      success: true,
      skipped: false,
      error: null,
      syncedCount: 0,
    }
  }

  const { error: upsertError } = await adminClient
    .from('profiles')
    .upsert(rows, { onConflict: 'id' })

  return {
    success: !upsertError,
    skipped: false,
    error: upsertError?.message || null,
    syncedCount: upsertError ? 0 : rows.length,
  }
}

export async function ensureStorageBucket(bucketId: string) {
  if (!hasAdminCredentials()) {
    return {
      success: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY belum diset, jadi bucket storage tidak bisa dibuat otomatis.',
    }
  }

  const adminClient = createAdminClient()
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets()

  if (listError) {
    return {
      success: false,
      error: listError.message,
    }
  }

  const exists = buckets?.some((bucket) => bucket.id === bucketId)
  if (exists) {
    return { success: true, error: null }
  }

  const { error: createError } = await adminClient.storage.createBucket(bucketId, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
  })

  return {
    success: !createError,
    error: createError?.message || null,
  }
}
