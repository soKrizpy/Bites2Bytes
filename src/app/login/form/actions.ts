'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string

  // Note: Standard Supabase auth expects an email.
  // To support both email AND username, you may need a custom view or RPC in Supabase
  // that maps a username to an email, or use the email directory if it has an @ sign.
  // We're handling the primary authentication via email/password here.
  let authEmail = identifier;
  
  if (!identifier.includes('@')) {
    // We use the synthetic domains for usernames
    const username = identifier.trim().toLowerCase();
    authEmail = `${username}@bites2bytes.internal`;
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
