import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      const role = user.user_metadata?.role || 'student'
      const username = user.user_metadata?.username || user.email?.split('@')[0] || ''

      // Auto-upsert profil ke tabel profiles
      await supabase.from('profiles').upsert({
        id: user.id,
        username,
        role,
        full_name: username,
      }, { onConflict: 'id' })

      return NextResponse.redirect(`${origin}/${role}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
