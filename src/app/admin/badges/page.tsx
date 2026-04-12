import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { AddBadgeForm, DeleteBadgeButton } from './Forms'

export default async function AdminBadgesPage() {
  const supabase = await createClient()

  // Ambil semua badge
  const { data: badges, error: badgeError } = await supabase
    .from('badges')
    .select('id, name, description, image_url, created_at')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar role="admin" />
      <div className="page-wrapper">
        <div style={{ marginBottom: '0.5rem' }}>
          <a href="/admin" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>← Kembali ke Dashboard</a>
        </div>
        <h1 className="header">🏅 Manajemen Badge</h1>
        <p className="page-subtitle">Upload ikon badge (PNG/GIF) untuk diberikan kepada siswa yang lulus kuis.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem', alignItems: 'start' }}>
          {/* Form */}
          <AddBadgeForm />

          {/* Tabel Badge */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem' }}>📋 Daftar Badge ({badges?.length || 0})</h3>
            
            {badgeError ? (
                <div className="alert alert-error">{badgeError.message}</div>
            ) : !badges || badges.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada badge.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Ikon</th>
                      <th>Nama</th>
                      <th>Deskripsi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badges.map(b => (
                      <tr key={b.id}>
                        <td>
                          <img src={b.image_url} alt={b.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                        </td>
                        <td style={{ fontWeight: 700 }}>{b.name}</td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{b.description || '-'}</td>
                        <td>
                          <DeleteBadgeButton id={b.id} imageUrl={b.image_url} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
