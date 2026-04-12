import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import JoinZoomButton from '../JoinZoomButton'

export default async function StudentPathPage({ params }: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get Profil
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Get Enrollment + Module
  const { data: en } = await supabase
    .from('enrollments')
    .select(`
      zoom_link, module_id, 
      modules (title, description),
      profiles!enrollments_teacher_id_fkey (username, full_name)
    `)
    .eq('id', enrollmentId).single()
  
  if (!en) return <div>Enrollment not found!</div>

  const moduleObj = en.modules as any
  const teacher = en.profiles as any

  // Get all Topics aligned to this Module
  const { data: topics } = await supabase
    .from('topics')
    .select('*, quizzes(id)')
    .eq('module_id', en.module_id)
    .order('sort_order', { ascending: true })

  // Get the progress and class_sessions for lock states
  const { data: progress } = await supabase.from('student_progress').select('*').eq('student_id', user.id)
  const { data: sessions } = await supabase.from('class_sessions').select('*').eq('enrollment_id', enrollmentId)

  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar role="student" username={profile?.username} photoUrl={profile?.photo_url} />
      
      <div className="container" style={{ padding: '2rem' }}>
        <Link href="/student" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>
          ← Dashboard
        </Link>

        {/* Header Board */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Misi: {moduleObj?.title}</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Instruktur Ahli: {teacher?.full_name}</p>
        </div>

        {/* ROADMAP TREE */}
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {topics?.map((topic, i) => {
            const hasJoinedSession = sessions?.some(s => s.topic_id === topic.id && s.student_joined)
            const prog = progress?.find(p => p.topic_id === topic.id)
            const isCompleted = prog?.completed
            const quizId = topic.quizzes?.[0]?.id

            return (
              <div key={topic.id} className="bento-card animate-in" style={{ animationDelay: `${i * 0.15}s`, position: 'relative', overflow: 'visible' }}>
                
                {/* Connecting Line (Path) */}
                {i !== (topics.length - 1) && (
                  <div style={{ position: 'absolute', top: '100%', left: '50px', width: '4px', height: '2rem', backgroundColor: isCompleted ? 'var(--color-success)' : '#e2e8f0', zIndex: -1 }} />
                )}

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  {/* Circle Checkpoint */}
                  <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.5rem',
                    backgroundColor: isCompleted ? 'var(--color-success)' : 'white',
                    color: isCompleted ? 'white' : 'var(--color-primary)',
                    border: `4px solid ${isCompleted ? 'var(--color-success)' : 'var(--color-primary)'}`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--color-text)' }}>{topic.title}</h3>
                    
                    {/* Ringkasan Topik */}
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                       {topic.description || 'Guru belum memberikan ringkasan materi untuk topik ini.'}
                    </p>
                    
                    {/* Interaktif Board */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
                       
                       <JoinZoomButton 
                         enrollmentId={enrollmentId} 
                         topicId={topic.id} 
                         zoomLink={en.zoom_link || 'https://zoom.us'} 
                       />

                       {quizId ? (
                         <Link href={`/student/topics/${topic.id}`} className="btn" style={{ 
                           pointerEvents: hasJoinedSession ? 'auto' : 'none', 
                           opacity: hasJoinedSession ? 1 : 0.5,
                           backgroundColor: hasJoinedSession ? '#10b981' : '#cbd5e1', 
                           color: hasJoinedSession ? 'white' : '#64748b' 
                         }}>
                           {hasJoinedSession ? '🧠 Kerjakan Kuis Sekarang' : '🔒 Akses via Join Zoom'}
                         </Link>
                       ) : (
                         <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center' }}>Tidak ada Kuis</span>
                       )}

                    </div>

                    {prog?.badge_earned && (
                      <div className="animate-in" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700 }}>
                        🪄 Badge Trophy Unlocked!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
