import { createClient } from '@/utils/supabase/server'
import { syncProfilesFromAuthUsers } from '@/utils/supabase/admin'
import LogoutButton from '@/components/LogoutButton'
import { AddModuleForm, AddTopicForm } from './Forms'

export default async function AdminModulesPage() {
  const supabase = await createClient()
  await syncProfilesFromAuthUsers()

  // 1. Fetch Badges for topic dropdown
  const { data: badges } = await supabase
    .from('badges')
    .select('id, name')
    .order('name')

  // 2. Fetch existing modules
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <a href="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '0.5rem', display: 'inline-block' }}>← Back to Admin</a>
          <h1 className="header" style={{ marginBottom: 0 }}>📚 Modules Management</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Create modules and topics.</p>
        </div>
        <LogoutButton />
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '3rem' }}>
        <AddModuleForm />
        <AddTopicForm modules={modules || []} badges={badges || []} />
      </div>

      <div className="card">
        <h3>Existing Modules</h3>
        {modulesError ? (
           <p style={{ color: 'red' }}>Error loading modules: {modulesError.message}</p>
        ) : !modules || modules.length === 0 ? (
           <p style={{ color: 'var(--color-text-muted)' }}>No modules created yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {modules.map((m) => {
              return (
                <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       {m.thumbnail_url && <img src={m.thumbnail_url} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                       <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{m.title}</h4>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', margin: '0.4rem 0', fontSize: '0.9rem' }}>{m.description || 'No description'}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>
                      Passing Score: {m.passing_score}%
                    </p>
                  </div>
                  <a href={`/admin/modules/${m.id}`} className="btn btn-primary btn-sm">
                    ⚙️ Atur Konten
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
