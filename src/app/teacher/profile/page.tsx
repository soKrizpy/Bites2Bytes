import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import ProfileForm from '@/components/ProfileForm'

export default async function TeacherProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Upsert profil jika belum ada
  await supabase.from('profiles').upsert({
    id: user.id,
    username: user.user_metadata?.username || '',
    role: 'teacher',
    full_name: user.user_metadata?.username || '',
  }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <>
      <Navbar role="teacher" username={profile?.username} photoUrl={profile?.photo_url} />
      <div className="page-wrapper">
        <a href="/teacher" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' }}>
          ← Kembali ke Dashboard
        </a>
        <h1 className="header">👤 Profil Saya</h1>
        <p className="page-subtitle">Perbarui biodata dan foto profilmu.</p>
        <ProfileForm profile={profile || { id: user.id, username: user.user_metadata?.username || '', full_name: null, bio: null, photo_url: null, role: 'teacher' }} />
      </div>
    </>
  )
}
