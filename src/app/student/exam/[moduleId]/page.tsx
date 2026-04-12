import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ExamSection from './ExamSection'

interface PageProps {
  params: Promise<{ moduleId: string }>
}

export default async function StudentExamPage({ params }: PageProps) {
  const { moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profileData = await supabase.from('profiles').select('username, photo_url').eq('id', user.id).single()

  // Ambil data modul
  const { data: module } = await supabase
    .from('modules')
    .select('id, title')
    .eq('id', moduleId)
    .single()

  if (!module) return <div className="page-wrapper"><p>Modul tidak ditemukan.</p></div>

  // Ambil ujian untuk modul ini
  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, passing_score')
    .eq('module_id', moduleId)
    .single()

  if (!exam) {
    return (
      <>
        <Navbar role="student" username={profileData.data?.username} photoUrl={profileData.data?.photo_url} />
        <div className="page-wrapper">
          <Link href="/student" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>← Kembali</Link>
          <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</p>
            <h2>Ujian Belum Tersedia</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Gurumu belum membuat ujian untuk modul ini.</p>
          </div>
        </div>
      </>
    )
  }

  // Ambil soal ujian
  const { data: questions } = await supabase
    .from('exam_questions')
    .select('id, question, option_a, option_b, option_c, option_d, correct_answer, sort_order')
    .eq('exam_id', exam.id)
    .order('sort_order')

  // Cek apakah sudah punya sertifikat
  const { data: certificate } = await supabase
    .from('certificates')
    .select('id, exam_score, issued_at, certificate_number')
    .eq('student_id', user.id)
    .eq('module_id', moduleId)
    .single()

  return (
    <>
      <Navbar role="student" username={profileData.data?.username} photoUrl={profileData.data?.photo_url} />
      <div className="page-wrapper" style={{ maxWidth: '800px' }}>
        <Link href="/student" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          ← Kembali ke Dashboard
        </Link>

        <div style={{ marginBottom: '2rem' }}>
          <h1 className="header" style={{ fontSize: '1.75rem' }}>🎯 Ujian Akhir Modul</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{module.title}</p>
        </div>

        {certificate ? (
          // Sudah punya sertifikat
          <div className="card" style={{ textAlign: 'center', padding: '3rem', borderTop: '4px solid var(--color-secondary)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Selamat! Kamu sudah lulus!</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Skor ujian: <strong style={{ color: 'var(--color-success)', fontSize: '1.25rem' }}>{certificate.exam_score}</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              No. Sertifikat: {certificate.certificate_number}
            </p>
            <a href={`/api/certificate/${certificate.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              ⬇️ Unduh Sertifikat PDF
            </a>
          </div>
        ) : (
          <ExamSection
            exam={exam}
            questions={questions || []}
            moduleId={moduleId}
            studentId={user.id}
          />
        )}
      </div>
    </>
  )
}
