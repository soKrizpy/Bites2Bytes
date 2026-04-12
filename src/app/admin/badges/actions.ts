'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createBadgeAction(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File

  if (!name || !image || image.size === 0) {
    return { success: false, error: 'Nama dan gambar badge wajib diisi.' }
  }

  // 1. Upload ke Storage 'badges'
  const fileExt = image.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `items/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('badges')
    .upload(filePath, image, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    return { success: false, error: `Upload error: ${uploadError.message}` }
  }

  // 2. Dapatkan Public URL
  const { data: { publicUrl } } = supabase.storage
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
    await supabase.storage.from('badges').remove([`items/${fileName}`])
  } catch (e) {
    console.error('Gagal menghapus file storage:', e)
  }

  revalidatePath('/admin/badges')
  return { success: true }
}
