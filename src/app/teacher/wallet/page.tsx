import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'

export default async function TeacherWalletPage() {
  const supabase = await createClient()

  // 1. Ambil Profil & User ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // 2. Ambil Semua Session milik Guru ini
  // Join: class_sessions -> enrollments -> modules & profiles(student)
  const { data: sessions, error } = await supabase
    .from('class_sessions')
    .select(`
      id, session_date, is_paid, report_submitted,
      enrollments!inner (
        teacher_id,
        modules (title),
        profiles!enrollments_student_id_fkey (full_name)
      )
    `)
    .eq('enrollments.teacher_id', user.id)

  if (error) console.error("Error fetching wallet data:", error.message)

  // 3. Kalkulasi Earning
  const RATE_PER_SESSION = 60000

  const validSessions = (sessions || []).filter(s => s.report_submitted)
  const pendingSessions = validSessions.filter(s => !s.is_paid)
  const paidSessions = validSessions.filter(s => s.is_paid)

  const pendingAmount = pendingSessions.length * RATE_PER_SESSION
  const paidAmount = paidSessions.length * RATE_PER_SESSION

  // 4. Ambil Riwayat Slip Gaji
  const { data: slips } = await supabase
    .from('payroll_slips')
    .select('*')
    .eq('teacher_id', user.id)
    .order('slip_date', { ascending: false })

  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar role="teacher" username={profile?.username} photoUrl={profile?.photo_url} />

      <div className="container" style={{ padding: '2rem' }}>
        <a href="/teacher" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>
          ← Dashboard Guru
        </a>

        {/* DOMPET HERO */}
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', background: 'linear-gradient(135deg, var(--color-success), #14b8a6)', color: 'white' }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.9 }}>
              Total Pendapatan Belum Cair
            </h1>
            <div style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1 }}>
              Rp {pendingAmount.toLocaleString('id-ID')}
            </div>
            <p style={{ marginTop: '1rem', opacity: 0.9 }}>
              Dari {pendingSessions.length} sesi kelas yang telah dilaporkan.
            </p>
          </div>
          <div style={{ textAlign: 'right', backgroundColor: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.8 }}>Total Sudah Dibayarkan</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>Rp {paidAmount.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="grid-2">
           {/* RIWAYAT MENGAJAR UNPAID */}
           <div className="bento-card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>⏱️ Kelas Pending Bayar</h2>
              {pendingSessions.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Tidak ada tagihan tertunda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingSessions.map(s => {
                    const en = s.enrollments as any
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                         <div>
                            <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{en.profiles?.full_name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{en.modules?.title} - {new Date(s.session_date).toLocaleDateString('id-ID')}</p>
                         </div>
                         <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>+Rp 60.000</div>
                      </div>
                    )
                  })}
                </div>
              )}
           </div>

           {/* SLIP GAJI */}
           <div className="bento-card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>🧾 Riwayat Slip Gaji</h2>
              {!slips || slips.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Belum ada slip gaji yang diterbitkan admin.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {slips.map(slip => (
                     <div key={slip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                         <div>
                            <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>Gaji Diterima</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(slip.slip_date).toLocaleDateString('id-ID')}</p>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.2rem' }}>Rp {slip.amount_paid.toLocaleString('id-ID')}</div>
                            {slip.slip_pdf_url && (
                               <a href={slip.slip_pdf_url} className="chip chip-success" style={{ textDecoration: 'none' }}>⬇️ Download</a>
                            )}
                         </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  )
}
