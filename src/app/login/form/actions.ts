'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const identifier = formData.get('identifier') as string
  const countryCode = formData.get('country_code') as string
  const password = formData.get('password') as string

  let authEmail = identifier;
  
  if (!identifier.includes('@')) {
    // It's a WhatsApp number username
    // Remove leading zero if they typed it (standard practice)
    const cleanNumber = identifier.trim().replace(/^0+/, '');
    const username = countryCode ? `${countryCode}${cleanNumber}` : cleanNumber;
    authEmail = `${username.toLowerCase()}@bites2bytes.internal`;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: password,
  })

  if (error) {
    // Optionally redirect to an error page or return the error message
    redirect('/login/form?error=Invalid credentials')
  }

  const role = data.user.user_metadata?.role || 'student';

  revalidatePath('/', 'layout')
  redirect(`/${role}`)
}
