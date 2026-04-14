import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const envPath = path.resolve('.env.local')

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [name, ...rest] = line.split('=')
    if (!process.env[name]) {
      process.env[name] = rest.join('=')
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia.')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (usersError) {
  console.error('Gagal mengambil auth users:', usersError.message)
  process.exit(1)
}

const allUsers = usersData?.users || []
const profileRows = allUsers
  .map((user) => {
    const role = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role.toLowerCase() : null
    const username =
      typeof user.user_metadata?.username === 'string'
        ? user.user_metadata.username.trim()
        : user.email?.split('@')[0]?.trim()

    if (!role || !username || !['admin', 'teacher', 'student'].includes(role)) {
      return null
    }

    return {
      id: user.id,
      username,
      full_name: username,
      role,
    }
  })
  .filter(Boolean)
const skippedUsers = allUsers.length - profileRows.length

const { error: upsertError } = await admin.from('profiles').upsert(profileRows, { onConflict: 'id' })
if (upsertError) {
  console.error('Gagal sinkronisasi profiles:', upsertError.message)
  process.exit(1)
}

const { data: buckets, error: bucketListError } = await admin.storage.listBuckets()
if (bucketListError) {
  console.error('Gagal memeriksa bucket:', bucketListError.message)
  process.exit(1)
}

for (const bucketId of ['profile-pictures', 'badges']) {
  const exists = (buckets || []).some((bucket) => bucket.id === bucketId)
  if (!exists) {
    const { error } = await admin.storage.createBucket(bucketId, {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024,
    })

    if (error) {
      console.error(`Gagal membuat bucket ${bucketId}:`, error.message)
      process.exit(1)
    }
  }
}

const { count: profileCount } = await admin.from('profiles').select('id', { count: 'exact', head: true })
const { data: finalBuckets } = await admin.storage.listBuckets()

console.log(
  JSON.stringify(
    {
      message: 'Supabase repair selesai.',
      authUsers: allUsers.length,
      managedUsers: profileRows.length,
      skippedUsers,
      profiles: profileCount || 0,
      buckets: (finalBuckets || []).map((bucket) => bucket.id),
    },
    null,
    2
  )
)
