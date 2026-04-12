import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ProgressControl from './ProgressControl'
import AIEnhancedReporter from './AIEnhancedReporter'
import GrandPDFButton from './GrandPDFButton'

interface PageProps {
  params: Promise<{ studentId: string }>
  searchParams: Promise<{ module?: string }>
}

export default async function TeacherStudentDetailPage({ params, searchParams }: PageProps) {
  const { studentId } = await params
  const { module: moduleId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Ambil data guru (untuk Navbar)
  const { data: teacherProfile } = await supabase.from('profiles').select('username, photo_url').eq('id', user.id).single()

  // 2. Ambil data siswa (auth)
  const adminClient = createAdminClient()
  const { data: userData } = await adminClient.auth.admin.getUserById(studentId)
  const student = userData?.user

  // 3. Ambil data profil siswa (DB)
  const { data: studentProfile } = await supabase.from('profiles').select('*').eq('id', studentId).single()

  // 4. Ambil Modul
  if (!moduleId) return <div className="page-wrapper">Module ID is required.</div>
  const { data: module } = await supabase.from('modules').select('*').eq('id', moduleId).single()

  // 5. Ambil Topik & Kuis
  const { data: topics } = await supabase
    .from('topics')
    .select(`
        *,
        quizzes (
            id, title, passing_score, badge_id, 
            badges (name, image_url)
        )
    `)
    .eq('module_id', moduleId)
    .order('sort_order', { ascending: true })

  // 6. Ambil Progress Siswa
  const { data: progress } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', studentId)

  // 6.5. Ambil Enrollment dan Class Sessions
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .single()
  const enrollmentId = enrollment?.id

  const { data: sessions } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('enrollment_id', enrollmentId || '')

  // 7. Ambil Sertifikat (jika ada)
  const { data: certificate } = await supabase
    .from('certificates')
    .select('*')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .single()

  // 8. Ambil Final Review jika sudah diracik
  const { data: moduleReview } = await supabase
    .from('module_reviews')
    .select('*')
    .eq('enrollment_id', enrollmentId || '')
    .single()

  return (
    <>
      <Navbar role="teacher" username={teacherProfile?.username} photoUrl={teacherProfile?.photo_url} />
      <div className="page-wrapper">
        <Link href="/teacher" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          ← Kembali ke Dashboard
        </Link>

        {/* Info Siswa */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-success), var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>
            {student?.user_metadata?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="header" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              👤 Progress: {student?.user_metadata?.username}
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Mempelajari Modul: <strong>{module?.title}</strong></p>
          </div>
        </div>

        {/* Rincian Learning Path */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>📈 Learning Path & Badges</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Topik</th>
                  <th>Status Materi</th>
                  <th>Skor Kuis</th>
                  <th>Action Badge</th>
                  <th>Laporan AI Guru</th>
                </tr>
              </thead>
              <tbody>
                {topics?.map((topic, idx) => {
                  const topicProg = progress?.find(p => p.topic_id === topic.id)
                  const quiz = topic.quizzes ? topic.quizzes[0] : null
                  const badge = quiz?.badges
                  
                  // Session Logic
                  const session = sessions?.find(s => s.topic_id === topic.id)
                  const isJoined = session?.student_joined || false
                  const isReportSubmitted = session?.report_submitted || false

                  return (
                    <tr key={topic.id}>
                      <td style={{ width: '40px' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{topic.title}</div>
                      </td>
                      <td>
                        {topicProg?.completed ? (
                          <span className="chip chip-success">✅ Selesai</span>
                        ) : (
                          <span className="chip chip-muted">Belum</span>
                        )}
                      </td>
                      <td>
                        {topicProg?.quiz_score != null ? (
                          <span style={{ fontWeight: 700, color: topicProg.quiz_score >= (quiz?.passing_score || 0) ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {topicProg.quiz_score} / 100
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <ProgressControl 
                          studentId={studentId}
                          topicId={topic.id}
                          badgeId={quiz?.badge_id}
                          badgeName={badge?.name}
                          isBadgeEarned={topicProg?.badge_earned}
                        />
                      </td>
                      <td>
                        {enrollmentId && (
                           <AIEnhancedReporter 
                             enrollmentId={enrollmentId}
                             topicId={topic.id}
                             isJoined={isJoined}
                             isReportSubmitted={isReportSubmitted}
                           />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Penutupan Modul & Sertifikat */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>🎯 Penutupan Modul</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* The Grand PDF Review */}
            <div className="card" style={{ borderLeft: '4px solid #8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#8b5cf6' }}>The Grand PDF Progress Report</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Kompilasi ke-10 sesi dengan ulasan akhir AI & saran aktivitas orang tua. Mencegah komplain orang tua.
                </p>
              </div>
              <div>
                {moduleReview ? (
                   <a href={`/api/grand-pdf/${enrollmentId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                     ⬇️ Unduh PDF Laporan Akhir
                   </a>
                ) : enrollmentId ? (
                   <GrandPDFButton enrollmentId={enrollmentId} />
                ) : null}
              </div>
            </div>

            {/* Sertifikat Akhir Modul */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Sertifikat Lulus QR Code</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Keluarkan sertifikat validasi QR setelah siswa menempuh Ujian Akhir secara sempurna.
                </p>
              </div>
              {certificate ? (
                <div style={{ textAlign: 'right' }}>
                  <span className="chip chip-success" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>✅ Terbit: {certificate.certificate_number}</span>
                  <a href={`/api/certificate/${certificate.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>⬇️ Buka Sertifikat</a>
                </div>
              ) : (
                  <ProgressControl 
                      studentId={studentId}
                      moduleId={moduleId}
                      isCertificateIssued={false}
                      type="certificate"
                  />
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
