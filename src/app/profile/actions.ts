'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import {
  createAdminClient,
  ensureStorageBucket,
  hasAdminCredentials,
} from '@/utils/supabase/admin'

async function ensureOwnProfile(userId: string, username: string, role: string) {
  const supabase = await createClient()

  return supabase.from('profiles').upsert(
    {
      id: userId,
      username,
      full_name: username,
      role,
      avatar_url: null,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  const full_name = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const role = user.user_metadata?.role || 'student'
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user'

  const { error: profileError } = await ensureOwnProfile(user.id, username, role)
  if (profileError) {
    return { success: false, error: profileError.message }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, bio })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/${user.user_metadata?.role}`)
  revalidatePath(`/${user.user_metadata?.role}/profile`)
  return { success: true, message: 'Profil berhasil diperbarui!' }
}

export async function updatePhotoAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  const photo = formData.get('photo') as File
  if (!photo || photo.size === 0) return { success: false, error: 'File tidak valid.' }
  if (photo.size > 2 * 1024 * 1024) return { success: false, error: 'Ukuran file maksimal 2MB.' }

  const role = user.user_metadata?.role || 'student'
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user'
  const { error: profileError } = await ensureOwnProfile(user.id, username, role)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  const bucketResult = await ensureStorageBucket('profile-pictures')
  if (!bucketResult.success && hasAdminCredentials()) {
    return { success: false, error: bucketResult.error || 'Bucket profile-pictures gagal disiapkan.' }
  }

  const ext = photo.name.split('.').pop()
  const filePath = `${user.id}/avatar.${ext}`
  const storageClient = hasAdminCredentials() ? createAdminClient() : supabase

  const { error: uploadError } = await storageClient.storage
    .from('profile-pictures')
    .upload(filePath, photo, { upsert: true, contentType: photo.type })

  if (uploadError) {
    const hint = hasAdminCredentials()
      ? ''
      : ' Pastikan bucket `profile-pictures` dan policy storage sudah dibuat di Supabase.'

    return { success: false, error: `${uploadError.message}${hint}` }
  }

  const { data: urlData } = storageClient.storage
    .from('profile-pictures')
    .getPublicUrl(filePath)

  // Tambah cache buster agar gambar reload
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath(`/${user.user_metadata?.role}`)
  revalidatePath(`/${user.user_metadata?.role}/profile`)
  return { success: true, message: 'Foto profil berhasil diperbarui!' }
}
