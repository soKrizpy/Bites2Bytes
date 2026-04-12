'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createUserAction(prevState: any, formData: FormData) {
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
