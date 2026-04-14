import { createClient } from '@/utils/supabase/server'
import { syncProfilesFromAuthUsers } from '@/utils/supabase/admin'
import Navbar from '@/components/Navbar'
import PayrollControl from './PayrollControl'

export default async function AdminPayrollPage() {
  const supabase = await createClient()
  await syncProfilesFromAuthUsers()

  // Ambil Admin User
  const { data: { user } } = await supabase.auth.getUser()
  const adminName = user?.user_metadata?.username || 'Admin'

  // Ambil daftar guru
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('role', 'teacher')
    .order('username')

  // Ambil semua session untuk menghitung Unpaid (is_paid = false && report_submitted = true)
  const { data: sessions } = await supabase
    .from('class_sessions')
    .select(`
      id, is_paid, report_submitted,
      enrollments!inner (teacher_id)
    `)
    .eq('report_submitted', true)
    .eq('is_paid', false)

  const RATE_PER_SESSION = 60000

  // Proses Data Guru
  const payrollData = (teachers || []).map((teacher) => {
    const teacherSessions = (sessions || []).filter((session) => {
      const enrollment = session.enrollments as { teacher_id?: string } | null
      return enrollment?.teacher_id === teacher.id
    })
    const pendingAmount = teacherSessions.length * RATE_PER_SESSION
    return {
      teacherId: teacher.id,
      teacherName: teacher.username || 'Unknown',
      pendingSessionsCount: teacherSessions.length,
      pendingAmount
    }
  }).sort((a, b) => b.pendingAmount - a.pendingAmount) // Urutkan dari yang gajinya terbanyak

  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar role="admin" username={adminName} />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <a href="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block', fontWeight: 600 }}>← Kembali ke Dashboard</a>
        
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
           <h1 className="header" style={{ marginBottom: '0.5rem' }}>💰 Payroll & Keuangan Guru</h1>
           <p style={{ color: 'var(--color-text-muted)' }}>Setiap sesi kelas yang telah diselesaikan (ditandai dengan Pengiriman Laporan AI) bernilai Rp 60.000. Bayar guru dengan satu klik.</p>
        </div>

        <div className="grid-auto">
          {payrollData.length === 0 || payrollData.every(p => p.pendingAmount === 0) ? (
            <div className="bento-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', filter: 'grayscale(1)', opacity: 0.5, marginBottom: '1rem' }}>💸</div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Semua tagihan lunas!</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>Belum ada guru yang memiliki saldo tertunda.</p>
            </div>
          ) : (
            payrollData.filter(p => p.pendingAmount > 0).map(p => (
              <div key={p.teacherId} className="bento-card" style={{ borderTop: '4px solid var(--color-success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-success), var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>
                    {p.teacherName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>@{p.teacherName}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{p.pendingSessionsCount} Sesi Menunggu</p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                   <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOTAL TAGIHAN</div>
                   <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>Rp {p.pendingAmount.toLocaleString('id-ID')}</div>
                </div>

                <PayrollControl teacherId={p.teacherId} amount={p.pendingAmount} sessionCount={p.pendingSessionsCount} />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
