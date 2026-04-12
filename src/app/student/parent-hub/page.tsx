import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function ParentHubPage() {
  const supabase = await createClient()

  // Ambil user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Profil
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Ambil data enrollments (kelas)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id, module_id, 
      modules (title), 
      profiles!enrollments_teacher_id_fkey(full_name)
    `)
    .eq('student_id', user.id)

  const enrollmentIds = (enrollments || []).map(e => e.id)

  // Ambil semua session (Rapor AI) yang sudah disubmit
  const { data: sessions } = await supabase
    .from('class_sessions')
    .select(`
      id, enrollment_id, session_date, ai_progress_report,
      topics (title, sort_order)
    `)
    .in('enrollment_id', enrollmentIds.length > 0 ? enrollmentIds : [''])
    .eq('report_submitted', true)
    .order('session_date', { ascending: false })

  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar role="student" username={profile?.username} photoUrl={profile?.photo_url} />

      <div className="container" style={{ padding: '2rem' }}>
        <Link href="/student" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>
          ← Dashboard Anak
        </Link>

        {/* Hero Header Parent Hub */}
        <div className="glass-panel animate-in" style={{ padding: '3rem', marginBottom: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, #1e3a8a, var(--color-primary))', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍👩‍👦</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>The Parent Hub</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Pantau perkembangan dan kecerdasan logika anak Anda setiap minggu. Seluruh laporan di bawah dirangkum secara profesional berdasarkan observasi mentor di kelas.
          </p>
        </div>

        {/* Daftar Progress Reports */}
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {!sessions || sessions.length === 0 ? (
            <div className="bento-card animate-in" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', filter: 'grayscale(1)', opacity: 0.5, marginBottom: '1rem' }}>📭</div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Belum ada Progress Report yang diterbitkan.</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>Laporan akan muncul setelah anak menyelesaikan sesi kelas bersama mentor.</p>
            </div>
          ) : (
            sessions.map((session: any, i) => {
              const enrollment = enrollments?.find(e => e.id === session.enrollment_id)
              const module = enrollment?.modules as any
              const teacher = enrollment?.profiles as any
              const topic = session.topics as any

              const sessionDate = new Date(session.session_date).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })

              return (
                <div key={session.id} className="bento-card animate-in" style={{ animationDelay: `${i * 0.15}s`, display: 'block', padding: '2.5rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <div className="chip chip-info" style={{ marginBottom: '0.5rem' }}>📚 {module?.title || 'Modul Utama'}</div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        Pertemuan Ke-{topic?.sort_order || '?'}: {topic?.title || 'Pengenalan Logika'}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                        Dilaporkan oleh Mentor <strong>{teacher?.full_name || 'Guru'}</strong>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>📅 TANGGAL KELAS</span>
                      <p style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{sessionDate}</p>
                    </div>
                  </div>

                  {/* AI Report Content */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontSize: '3rem', opacity: 0.1, zIndex: 0 }}>❝</div>
                    <p style={{ position: 'relative', zIndex: 1, fontSize: '1.1rem', lineHeight: '1.8', color: '#334155' }}>
                      {session.ai_progress_report}
                    </p>
                  </div>

                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
