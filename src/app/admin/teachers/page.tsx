import { syncProfilesFromAuthUsers } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import MpinVisibilityCell from '@/components/MpinVisibilityCell'
import ModuleAssignment from './ModuleAssignment'

export default async function AdminTeachersPage() {
  const supabase = await createClient()
  await syncProfilesFromAuthUsers()

  // 1. Ambil data guru
  const { data: teachers, error } = await supabase
    .from('profiles')
    .select('id, username, plain_mpin, created_at')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })

  // 2. Ambil semua modul (untuk dropdown assignment)
  const { data: allModules } = await supabase
    .from('modules')
    .select('id, title')
    .order('title')

  // 3. Ambil semua assignment teacher-module
  const { data: assignments } = await supabase
    .from('teacher_modules')
    .select('teacher_id, module_id, modules(id, title)')

  // Map assignments to teachers
  const teachersWithModules = (teachers || []).map(tc => {
    const teacherAssignments = (assignments || [])
      .filter(a => a.teacher_id === tc.id)
      .map(a => (a.modules as any))
      .filter(Boolean)
    
    return { ...tc, assignedModules: teacherAssignments }
  })

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <a href="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '0.5rem', display: 'inline-block' }}>← Back to Admin</a>
          <h1 className="header" style={{ marginBottom: 0 }}>🍎 Teachers List</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Registered teachers & assigned modules.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="card">
        {error ? (
          <p style={{ color: 'red' }}>Error loading teachers: {error.message}</p>
        ) : !teachers || teachers.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No teachers registered yet.</p>
        ) : (
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem' }}>Username</th>
                  <th style={{ padding: '0.75rem' }}>MPIN</th>
                  <th style={{ padding: '0.75rem', width: '300px' }}>Assigned Modules</th>
                  <th style={{ padding: '0.75rem' }}>ID & Join Date</th>
                </tr>
              </thead>
              <tbody>
                {teachersWithModules.map((tc) => (
                  <tr key={tc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{tc.username}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <MpinVisibilityCell value={tc.plain_mpin} />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <ModuleAssignment 
                        teacherId={tc.id} 
                        assignedModules={tc.assignedModules} 
                        allModules={allModules || []} 
                      />
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600 }}>ID: {tc.id.substring(0, 8)}...</div>
                      <div>Join: {new Date(tc.created_at).toLocaleDateString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
