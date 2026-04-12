'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createModuleAction(formData: FormData) {
  const supabase = await createClient() // Use regular server client (Admin can insert if we use DB constraints correctly, wait! We disabled RLS so regular client works)
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const teacher_id = formData.get('teacher_id') as string

  if (!title) {
    return { success: false, error: 'Title is required.' }
  }

  const { error } = await supabase
    .from('modules')
    .insert({
      title,
      description,
      teacher_id: teacher_id || null
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
