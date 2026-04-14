import { createAdminClient, hasAdminCredentials } from '@/utils/supabase/admin'

type AuditLevel = 'ok' | 'warn' | 'error'

export interface AuditItem {
  label: string
  level: AuditLevel
  detail: string
}

export interface DeploymentAuditReport {
  envItems: AuditItem[]
  supabaseItems: AuditItem[]
}

function envItem(label: string, isPresent: boolean, detail: string): AuditItem {
  return {
    label,
    level: isPresent ? 'ok' : 'error',
    detail,
  }
}

export async function getDeploymentAuditReport(): Promise<DeploymentAuditReport> {
  const envItems: AuditItem[] = [
    envItem(
      'NEXT_PUBLIC_SUPABASE_URL',
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? 'URL Supabase tersedia.'
        : 'Wajib ada di Vercel untuk client, server, dan proxy auth.'
    ),
    envItem(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'Anon key tersedia.'
        : 'Wajib ada di Vercel untuk login dan request user biasa.'
    ),
    envItem(
      'SUPABASE_SERVICE_ROLE_KEY',
      Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'Service role tersedia untuk fitur admin sinkronisasi profile dan storage bucket.'
        : 'Tanpa ini, create user admin, sinkronisasi profiles, dan auto-create bucket tidak akan stabil.'
    ),
    {
      label: 'GEMINI_API_KEY',
      level: process.env.GEMINI_API_KEY ? 'ok' : 'warn',
      detail: process.env.GEMINI_API_KEY
        ? 'AI report guru aktif.'
        : 'Opsional, tapi fitur AI progress report guru akan gagal jika kosong.',
    },
  ]

  if (!hasAdminCredentials()) {
    return {
      envItems,
      supabaseItems: [
        {
          label: 'Supabase Admin Audit',
          level: 'warn',
          detail: 'Audit lanjutan Supabase dilewati karena service role tidak tersedia di environment ini.',
        },
      ],
    }
  }

  const adminClient = createAdminClient()
  const [usersResult, profilesResult, modulesResult, topicsResult, enrollmentsResult, bucketsResult] = await Promise.all([
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    adminClient.from('profiles').select('id', { count: 'exact', head: true }),
    adminClient.from('modules').select('id', { count: 'exact', head: true }),
    adminClient.from('topics').select('id', { count: 'exact', head: true }),
    adminClient.from('enrollments').select('id', { count: 'exact', head: true }),
    adminClient.storage.listBuckets(),
  ])

  const buckets = bucketsResult.data || []
  const hasProfilePicturesBucket = buckets.some((bucket) => bucket.id === 'profile-pictures')
  const hasBadgesBucket = buckets.some((bucket) => bucket.id === 'badges')
  const authUsers = usersResult.data?.users || []
  const managedUsers = authUsers.filter((user) => {
    const role = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role.toLowerCase() : null
    return role === 'admin' || role === 'teacher' || role === 'student'
  })
  const unmanagedUsers = authUsers.length - managedUsers.length
  const authUserCount = authUsers.length
  const managedUserCount = managedUsers.length
  const profileCount = profilesResult.count || 0

  const supabaseItems: AuditItem[] = [
    {
      label: 'Auth Users',
      level: usersResult.error ? 'error' : 'ok',
      detail: usersResult.error ? usersResult.error.message : `${authUserCount} user auth terdeteksi.`,
    },
    {
      label: 'Profiles Sync',
      level: profilesResult.error ? 'error' : profileCount >= managedUserCount ? 'ok' : 'warn',
      detail: profilesResult.error
        ? profilesResult.error.message
        : `${profileCount} profile vs ${managedUserCount} app user valid.${unmanagedUsers > 0 ? ` Ada ${unmanagedUsers} auth user tanpa role app.` : ''}`,
    },
    {
      label: 'Bucket profile-pictures',
      level: bucketsResult.error ? 'error' : hasProfilePicturesBucket ? 'ok' : 'warn',
      detail: bucketsResult.error
        ? bucketsResult.error.message
        : hasProfilePicturesBucket
          ? 'Bucket foto profil tersedia.'
          : 'Bucket belum ada. Upload foto profil akan gagal sampai bucket dibuat.',
    },
    {
      label: 'Bucket badges',
      level: bucketsResult.error ? 'error' : hasBadgesBucket ? 'ok' : 'warn',
      detail: bucketsResult.error
        ? bucketsResult.error.message
        : hasBadgesBucket
          ? 'Bucket badge tersedia.'
          : 'Bucket belum ada. Upload badge admin akan gagal sampai bucket dibuat.',
    },
    {
      label: 'Core Tables',
      level:
        profilesResult.error || modulesResult.error || topicsResult.error || enrollmentsResult.error
          ? 'error'
          : 'ok',
      detail:
        profilesResult.error || modulesResult.error || topicsResult.error || enrollmentsResult.error
          ? [
              profilesResult.error?.message,
              modulesResult.error?.message,
              topicsResult.error?.message,
              enrollmentsResult.error?.message,
            ]
              .filter(Boolean)
              .join(' | ')
          : `modules=${modulesResult.count || 0}, topics=${topicsResult.count || 0}, enrollments=${enrollmentsResult.count || 0}.`,
    },
  ]

  return { envItems, supabaseItems }
}
