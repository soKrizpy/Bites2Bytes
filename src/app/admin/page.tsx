import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import CreateUserForm from './CreateUserForm'

export default async function AdminDashboard() {
  const adminClient = createAdminClient()
  const supabase = await createClient()

  const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const allUsers = usersData?.users || []
  const teachers = allUsers.filter(u => u.user_metadata?.role === 'teacher')
  const students = allUsers.filter(u => u.user_metadata?.role === 'student')

  const { data: modules } = await supabase.from('modules').select('id')
  const { data: enrollments } = await supabase.from('enrollments').select('id')

  // Ambil profil admin yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  const username = user?.user_metadata?.username || 'Admin'

  return (
    <>
      <Navbar role="admin" username={username} />
      <div className="page-wrapper">
        <h1 className="header">👑 Dashboard Admin</h1>
        <p className="page-subtitle">Selamat datang, <strong>{username}</strong>! Kelola semua data platform di sini.</p>

        {/* Stats */}
        <div className="grid-auto" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
            <span className="stat-icon">🎓</span>
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">Total Siswa</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-accent)' }}>
            <span className="stat-icon">🍎</span>
            <span className="stat-value">{teachers.length}</span>
            <span className="stat-label">Total Guru</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-secondary)' }}>
            <span className="stat-icon">📚</span>
            <span className="stat-value">{modules?.length || 0}</span>
            <span className="stat-label">Total Modul</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--color-success)' }}>
            <span className="stat-icon">🔗</span>
            <span className="stat-value">{enrollments?.length || 0}</span>
            <span className="stat-label">Total Enrollment</span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="grid-auto" style={{ marginBottom: '2.5rem' }}>
          {[
            { href: '/admin/students', emoji: '🎓', title: 'Siswa', desc: 'Lihat & kelola data siswa', color: 'var(--color-primary)' },
            { href: '/admin/teachers', emoji: '🍎', title: 'Guru', desc: 'Lihat & kelola data guru', color: 'var(--color-accent)' },
            { href: '/admin/modules', emoji: '📚', title: 'Modul & Topik', desc: 'Buat modul, topik, kuis & ujian', color: 'var(--color-secondary)' },
            { href: '/admin/enrollments', emoji: '🔗', title: 'Enrollment', desc: 'Assign siswa & guru ke modul', color: 'var(--color-success)' },
            { href: '/admin/badges', emoji: '🏅', title: 'Badge', desc: 'Upload & kelola badge custom', color: '#8b5cf6' },
            { href: '/admin/payroll', emoji: '💰', title: 'Payroll Guru', desc: 'Bayar gaji & terbitkan slip gaji', color: '#f59e0b' },
          ].map(item => (
            <a key={item.href} href={item.href} className="card" style={{ textDecoration: 'none', borderLeft: `4px solid ${item.color}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
              <h3 style={{ color: item.color, marginBottom: '0.4rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
            </a>
          ))}
        </div>

        {/* Form Buat User */}
        <CreateUserForm />
      </div>
    </>
  )
}
