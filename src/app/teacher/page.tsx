import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ZoomLinkForm from './ZoomLinkForm'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil profil guru
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Jika profil belum ada, buat dulu
  if (!profile) {
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.user_metadata?.username || '',
      role: 'teacher',
      full_name: user.user_metadata?.username || '',
    }, { onConflict: 'id' })
  }

  const displayProfile = profile || { username: user.user_metadata?.username || '', full_name: '', bio: '', photo_url: null }

  // Ambil semua enrollment milik guru ini
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      student_id,
      module_id,
      zoom_link,
      modules (id, title, description)
    `)
    .eq('teacher_id', user.id)
    .order('enrolled_at', { ascending: false })

  // Ambil data siswa dari auth (butuh admin client untuk listUsers)
  const adminClient = createAdminClient()
  const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const allUsers = usersData?.users || []
  const getStudent = (id: string) => allUsers.find(u => u.id === id)

  // Hitung statistik
  const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || [])
  const uniqueModules = new Set(enrollments?.map(e => e.module_id) || [])

  // Ambil progress siswa untuk semua enrollment ini
  const studentIds = Array.from(uniqueStudents)
  const { data: progressData } = await supabase
    .from('student_progress')
    .select('student_id, completed')
    .in('student_id', studentIds.length > 0 ? studentIds : [''])

  const completedCount = progressData?.filter(p => p.completed).length || 0

  return (
    <>
      <Navbar role="teacher" username={displayProfile.username} photoUrl={displayProfile.photo_url} />
      <div className="page-wrapper">

        {/* Profil Guru */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {displayProfile.photo_url ? (
            <img src={displayProfile.photo_url} alt="Foto Profil" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {displayProfile.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="header" style={{ marginBottom: '0.25rem', fontSize: '1.75rem' }}>
              🍎 {displayProfile.full_name || displayProfile.username}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>@{displayProfile.username}</p>
            {displayProfile.bio && <p style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{displayProfile.bio}</p>}
          </div>
          <Link href="/teacher/wallet" className="btn" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 700 }}>💰 Cek Dompet & Gaji</Link>
          <Link href="/teacher/profile" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>✏️ Edit Profil</Link>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
            <span className="stat-icon">🎓</span>
            <span className="stat-value">{uniqueStudents.size}</span>
            <span className="stat-label">Siswa Aktif</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-secondary)' }}>
            <span className="stat-icon">📚</span>
            <span className="stat-value">{uniqueModules.size}</span>
            <span className="stat-label">Modul Diajarkan</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-success)' }}>
            <span className="stat-icon">✅</span>
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">Topik Selesai</span>
          </div>
        </div>

        {/* Daftar Siswa & Modul per Enrollment */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>👥 Siswa & Kelas Saya</h2>

        {!enrollments || enrollments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</p>
            <p>Belum ada siswa yang di-assign kepadamu. Hubungi admin.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.map((e) => {
              const student = getStudent(e.student_id)
              const mod = e.modules as any
              return (
                <div key={e.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {/* Avatar siswa */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-success), var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                    {student?.user_metadata?.username?.[0]?.toUpperCase() || '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>@{student?.user_metadata?.username || 'Unknown'}</p>
                    <span className="chip chip-info" style={{ marginTop: '0.3rem' }}>📚 {mod?.title || 'Modul'}</span>
                  </div>

                  {/* Zoom link form */}
                  <ZoomLinkForm enrollmentId={e.id} currentZoomLink={e.zoom_link || ''} />

                  {/* Link ke progress siswa */}
                  <Link href={`/teacher/students/${e.student_id}?module=${e.module_id}`} className="btn btn-ghost btn-sm">
                    📊 Lihat Progress
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
