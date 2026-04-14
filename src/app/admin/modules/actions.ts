'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient, hasAdminCredentials } from '@/utils/supabase/admin'

export async function createModuleAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const passing_score = parseInt(formData.get('passing_score') as string) || 80
  const thumbnail = formData.get('thumbnail') as File

  if (!title) {
    return { success: false, error: 'Title is required.' }
  }

  let thumbnail_url = null

  // Handle Thumbnail Upload if present
  if (thumbnail && thumbnail.size > 0) {
    const fileExt = thumbnail.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `modules/${fileName}`
    const storageClient = hasAdminCredentials() ? createAdminClient() : supabase

    const { error: uploadError } = await storageClient.storage
      .from('thumbnails')
      .upload(filePath, thumbnail)

    if (!uploadError) {
      const { data: { publicUrl } } = storageClient.storage
        .from('thumbnails')
        .getPublicUrl(filePath)
      thumbnail_url = publicUrl
    } else {
      console.error('Thumbnail upload error:', uploadError.message)
    }
  }

  const { error } = await supabase
    .from('modules')
    .insert({
      title,
      description,
      thumbnail_url,
      passing_score,
      created_by: user.id
    })

  if (error) {
    console.error('Error creating module:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/modules')
  return { success: true, message: `Module "${title}" created successfully!` }
}

export async function createTopicAction(formData: FormData) {
  const supabase = await createClient()
  
  const module_id = formData.get('module_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const passing_score = parseInt(formData.get('passing_score') as string) || 80
  const badge_id = formData.get('badge_id') as string || null
  const drive_link = formData.get('drive_link') as string
  const canva_link = formData.get('canva_link') as string
  const sort_order = parseInt(formData.get('sort_order') as string) || 0

  if (!title || !module_id) {
    return { success: false, error: 'Module and title are required.' }
  }

  const { error } = await supabase
    .from('topics')
    .insert({
      module_id,
      title,
      description,
      passing_score,
      badge_id,
      drive_link,
      canva_link,
      sort_order
    })

  if (error) {
    console.error('Error creating topic:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/modules')
  return { success: true, message: `Topic "${title}" added successfully!` }
}
