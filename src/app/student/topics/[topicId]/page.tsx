import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import QuizSection from './QuizSection'

interface PageProps {
  params: Promise<{ topicId: string }>
}

export default async function StudentTopicPage({ params }: PageProps) {
  const { topicId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil data topik
  const { data: topic } = await supabase
    .from('topics')
    .select('id, title, sort_order, drive_link, canva_link, module_id, modules(title)')
    .eq('id', topicId)
    .single()

  if (!topic) return <div className="page-wrapper"><p>Topik tidak ditemukan.</p></div>

  // Ambil kuis untuk topik ini
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, passing_score, badge_id, badges(name, image_url)')
    .eq('topic_id', topicId)
    .single()

  // Ambil soal kuis
  const { data: questions } = quiz
    ? await supabase
        .from('quiz_questions')
        .select('id, question, option_a, option_b, option_c, option_d, correct_answer, sort_order')
        .eq('quiz_id', quiz.id)
        .order('sort_order')
    : { data: [] }

  // Ambil progress siswa untuk topik ini
  const { data: progress } = await supabase
    .from('student_progress')
    .select('completed, quiz_score, badge_earned, badge_id')
    .eq('student_id', user.id)
    .eq('topic_id', topicId)
    .single()

  const mod = topic.modules as any
  const profile = await supabase.from('profiles').select('username, photo_url').eq('id', user.id).single()

  return (
    <>
      <Navbar role="student" username={profile.data?.username} photoUrl={profile.data?.photo_url} />
      <div className="page-wrapper">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link href="/student" style={{ color: 'var(--color-primary)' }}>← Dashboard</Link>
          <span>/</span>
          <span>{mod?.title}</span>
          <span>/</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{topic.title}</span>
        </div>

        {/* Header topik */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 className="header" style={{ fontSize: '1.75rem' }}>📖 {topic.title}</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Modul: {mod?.title}</p>
            </div>
            {progress?.completed && (
              <span className="chip chip-success" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>✅ Topik Selesai</span>
            )}
          </div>
        </div>

        {/* Materi — iframe Google Drive atau Canva */}
        {(topic.drive_link || topic.canva_link) ? (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
              📄 Materi Pembelajaran
            </h2>
            <div style={{ position: 'relative', paddingBottom: '65%', height: 0, borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
              <iframe
                src={topic.drive_link || topic.canva_link}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="fullscreen"
                title={topic.title}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {topic.drive_link && (
                <a href={topic.drive_link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  🔗 Buka di Google Drive
                </a>
              )}
              {topic.canva_link && (
                <a href={topic.canva_link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  🎨 Buka di Canva
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '2rem', padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
            <p>Materi belum tersedia. Gurumu akan segera menambahkan materi.</p>
          </div>
        )}

        {/* Kuis */}
        {quiz && questions && questions.length > 0 ? (
          <QuizSection
            quiz={{
              ...quiz,
              badges: Array.isArray(quiz.badges) ? quiz.badges[0] : (quiz.badges as any)
            } as any}
            questions={questions}
            topicId={topicId}
            studentId={user.id}
            existingProgress={progress}
          />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            <p>Belum ada kuis untuk topik ini.</p>
          </div>
        )}
      </div>
    </>
  )
}
