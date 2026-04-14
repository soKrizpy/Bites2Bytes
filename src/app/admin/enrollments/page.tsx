import { createClient } from '@/utils/supabase/server'
import { syncProfilesFromAuthUsers } from '@/utils/supabase/admin'
import EnrollmentForm from './EnrollmentForm'
import Navbar from '@/components/Navbar'

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient()
  await syncProfilesFromAuthUsers()

  // 1. Ambil data guru & siswa
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, role')

  const allUsers = profiles || []
  const teachers = allUsers
    .filter((user) => user.role === 'teacher')
    .map((teacher) => ({ id: teacher.id, username: teacher.username }))
  
  const students = allUsers
    .filter((user) => user.role === 'student')
    .map((student) => ({ id: student.id, username: student.username }))

  // 2. Ambil data modul
  const { data: modules } = await supabase.from('modules').select('id, title').order('created_at', { ascending: false })

  // 3. Ambil data enrollments 
  const { data: enrollments } = await supabase.from('enrollments').select(`
    id, teacher_id, student_id, zoom_link, enrolled_at,
    modules(id, title)
  `).order('enrolled_at', { ascending: false })

  // Ambil profil admin
  const { data: { user } } = await supabase.auth.getUser()
  const adminName = user?.user_metadata?.username || 'Admin'

  const getUsername = (id: string) => allUsers.find((user) => user.id === id)?.username || 'Unknown'

  return (
    <>
      <Navbar role="admin" username={adminName} />
      
      <div className="page-wrapper glass-panel">
        <a href="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block', fontWeight: 600 }}>← Kembali ke Dashboard</a>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Kolom Kiri: Tabel Enrollment Saat Ini */}
          <div style={{ flex: '2', minWidth: '350px' }}>
             <div className="card" style={{ padding: '1.5rem' }}>
                <h1 className="header" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>🔗 Manajemen Kelas</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Daftar kelas yang sedang berjalan.</p>
                
                {(!enrollments || enrollments.length === 0) ? (
                   <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Belum ada kelas yang terdaftar.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="table" style={{ width: '100%', fontSize: '0.9rem' }}>
                      <thead>
                        <tr>
                          <th>Guru</th>
                          <th>Siswa</th>
                          <th>Modul</th>
                          <th>Zoom Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((en: any) => (
                          <tr key={en.id}>
                            <td style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>@{getUsername(en.teacher_id)}</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>@{getUsername(en.student_id)}</td>
                            <td>{en.modules?.title}</td>
                            <td>
                              {en.zoom_link ? (
                                <a href={en.zoom_link} target="_blank" rel="noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>Link</a>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
          </div>

          {/* Kolom Kanan: Form Buat Enrollment */}
          <div style={{ flex: '1', minWidth: '300px' }}>
             <EnrollmentForm teachers={teachers} students={students} modules={modules || []} />
          </div>

        </div>
      </div>
    </>
  )
}
