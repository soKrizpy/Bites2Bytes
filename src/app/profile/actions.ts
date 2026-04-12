'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi.' }

  const full_name = formData.get('full_name') as string
  const bio = formData.get('bio') as string

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

  const ext = photo.name.split('.').pop()
  const filePath = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, photo, { upsert: true, contentType: photo.type })

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath)

  // Tambah cache buster agar gambar reload
  const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ photo_url: photoUrl })
    .eq('id', user.id)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath(`/${user.user_metadata?.role}`)
  revalidatePath(`/${user.user_metadata?.role}/profile`)
  return { success: true, message: 'Foto profil berhasil diperbarui!' }
}
