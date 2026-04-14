import { syncProfilesFromAuthUsers } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import MpinVisibilityCell from '@/components/MpinVisibilityCell'

export default async function AdminStudentsPage() {
  const supabase = await createClient()
  await syncProfilesFromAuthUsers()

  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, username, plain_mpin, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <a href="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '0.5rem', display: 'inline-block' }}>← Back to Admin</a>
          <h1 className="header" style={{ marginBottom: 0 }}>🎓 Students List</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Registered students in the system.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="card">
        {error ? (
          <p style={{ color: 'red' }}>Error loading students: {error.message}</p>
        ) : !students || students.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No students registered yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem' }}>Username</th>
                <th style={{ padding: '0.75rem' }}>MPIN</th>
                <th style={{ padding: '0.75rem' }}>Created At</th>
                <th style={{ padding: '0.75rem' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{st.username}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <MpinVisibilityCell value={st.plain_mpin} />
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(st.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{st.id.substring(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
