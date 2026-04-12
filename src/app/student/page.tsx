import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Upsert profil
  await supabase.from('profiles').upsert({
    id: user.id,
    username: user.user_metadata?.username || '',
    role: 'student',
    full_name: user.user_metadata?.username || '',
  }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Ambil enrollment siswa (guru + modul)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id, zoom_link,
      modules (id, title, description),
      profiles!enrollments_teacher_id_fkey (username, full_name, photo_url)
    `)
    .eq('student_id', user.id)

  // Ambil semua topik dari modul yang di-enroll
  const moduleIds = (enrollments || []).map(e => (e.modules as any)?.id).filter(Boolean)
  const { data: allTopics } = await supabase
    .from('topics')
    .select('id, module_id, title, sort_order')
    .in('module_id', moduleIds.length > 0 ? moduleIds : [''])
    .order('sort_order')

  // Ambil progress siswa
  const { data: progress } = await supabase
    .from('student_progress')
    .select('topic_id, completed, badge_earned, quiz_score, badge_id')
    .eq('student_id', user.id)

  // Ambil badge yang diraih
  const earnedBadgeIds = (progress || []).filter(p => p.badge_earned && p.badge_id).map(p => p.badge_id!)
  const { data: badges } = await supabase
    .from('badges')
    .select('id, name, image_url')
    .in('id', earnedBadgeIds.length > 0 ? earnedBadgeIds : [''])

  // Ambil sertifikat
  const { data: certificates } = await supabase
    .from('certificates')
    .select('id, module_id, exam_score, issued_at, modules(title)')
    .eq('student_id', user.id)

  // Helper: hitung progress per modul
  const getModuleProgress = (moduleId: string) => {
    const topics = (allTopics || []).filter(t => t.module_id === moduleId)
    const completed = topics.filter(t => (progress || []).some(p => p.topic_id === t.id && p.completed)).length
    return { total: topics.length, completed }
  }

  const displayName = profile?.full_name || profile?.username || ''

  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar role="student" username={profile?.username} photoUrl={profile?.photo_url} />
      
      <div className="container" style={{ paddingTop: '2rem' }}>

        {/* Profil & Sambutan */}
        <div className="glass-panel animate-in" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Foto" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: 'var(--shadow-md)' }}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 className="header" style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: '#0f172a' }}>
              Halo Kapten, {displayName}! 🚀
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Siap untuk petualangan belajarmu hari ini?</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/student/parent-hub" className="btn" style={{ backgroundColor: '#1e3a8a', color: 'white', fontWeight: 700 }}>👨‍👩‍👦 Parent Hub</Link>
            <Link href="/student/profile" className="btn btn-ghost">✏️ Edit Profil</Link>
          </div>
        </div>

        <div className="bento-grid">
          
          {/* Kolom Kiri: Peta Misi (Modul) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}>
            <h2 className="animate-in" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', animationDelay: '0.1s' }}>🗺️ Peta Misi Belajar</h2>
            
            {!enrollments || enrollments.length === 0 ? (
              <div className="bento-card animate-in" style={{ textAlign: 'center', color: '#94a3b8', animationDelay: '0.2s' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>Belum ada misi modul. Kontak Admin untuk ditambahkan ke dalam misi!</p>
              </div>
            ) : (
              enrollments.map((e, idx) => {
                const mod = e.modules as any
                const prog = getModuleProgress(mod?.id)
                const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0
                
                return (
                  <div key={e.id} className="bento-card animate-in" style={{ animationDelay: `${0.2 + idx*0.1}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span className="navbar-role-badge" style={{ backgroundColor: 'var(--color-primary)', display: 'inline-block', marginBottom: '0.75rem' }}>🔥 MISSION ACTIVE</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{mod?.title}</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Mentor: {(e.profiles as any)?.full_name || 'Unknown'}</p>
                      </div>
                      <Link href={`/student/path/${e.id}`} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                        Masuk Peta Roadmap ➝
                      </Link>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        <span>Progress Misi</span>
                        <span>{pct}% ({prog.completed}/{prog.total} Checkpoint)</span>
                      </div>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Kolom Kanan: Trophy & Sertifikat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 className="animate-in" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', animationDelay: '0.3s' }}>🏅 Rak Trophy</h2>
            
            <div className="bento-card animate-in" style={{ animationDelay: '0.4s', background: 'linear-gradient(135deg, #fff, #f8fafc)' }}>
              {!badges || badges.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>Rak masih kosong. Selesaikan kuis untuk mengumpulkan Trophy Badge!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  {badges.map(badge => (
                    <div key={badge.id} style={{ textAlign: 'center', width: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={badge.image_url} alt={badge.name} className="badge-img badge-earned" style={{ width: '50px', height: '50px' }} />
                      <p style={{ fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{badge.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {certificates && certificates.length > 0 && (
              <>
                <h2 className="animate-in" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', animationDelay: '0.5s', marginTop: '1rem' }}>📜 Sertifikat Lulus</h2>
                <div className="bento-card animate-in" style={{ animationDelay: '0.6s' }}>
                  {certificates.map(cert => (
                    <div key={cert.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4 style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{(cert.modules as any)?.title}</h4>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Skor Akhir: {cert.exam_score}</p>
                      <a href={`/api/certificate/${cert.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                        Lihat Cetakan PDF 🎓
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
