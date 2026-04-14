'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import {
  createAdminClient,
  ensureStorageBucket,
  hasAdminCredentials,
} from '@/utils/supabase/admin'

export async function createBadgeAction(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File

  if (!name || !image || image.size === 0) {
    return { success: false, error: 'Nama dan gambar badge wajib diisi.' }
  }

  const bucketResult = await ensureStorageBucket('badges')
  if (!bucketResult.success && hasAdminCredentials()) {
    return { success: false, error: bucketResult.error || 'Bucket badges gagal disiapkan.' }
  }

  // 1. Upload ke Storage 'badges'
  const fileExt = image.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `items/${fileName}`
  const storageClient = hasAdminCredentials() ? createAdminClient() : supabase

  const { error: uploadError } = await storageClient.storage
    .from('badges')
    .upload(filePath, image, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    const hint = hasAdminCredentials()
      ? ''
      : ' Pastikan bucket `badges` dan policy upload storage untuk admin sudah dibuat di Supabase.'

    return { success: false, error: `Upload error: ${uploadError.message}${hint}` }
  }

  // 2. Dapatkan Public URL
  const { data: { publicUrl } } = storageClient.storage
    .from('badges')
    .getPublicUrl(filePath)

  // 3. Simpan ke database
  const { error: dbError } = await supabase
    .from('badges')
    .insert({
      name,
      description,
      image_url: publicUrl
    })

  if (dbError) {
    return { success: false, error: `Database error: ${dbError.message}` }
  }

  revalidatePath('/admin/badges')
  return { success: true, message: 'Badge berhasil dibuat!' }
}

export async function deleteBadgeAction(id: string, imageUrl: string) {
  const supabase = await createClient()
  const storageClient = hasAdminCredentials() ? createAdminClient() : supabase

  // 1. Hapus record DB
  const { error: dbError } = await supabase
    .from('badges')
    .delete()
    .eq('id', id)

  if (dbError) return { success: false, error: dbError.message }

  // 2. Hapus file di Storage (opsional tapi disarankan)
  try {
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    await storageClient.storage.from('badges').remove([`items/${fileName}`])
  } catch (e) {
    console.error('Gagal menghapus file storage:', e)
  }

  revalidatePath('/admin/badges')
  return { success: true }
}
