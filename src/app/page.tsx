export default function Home() {
  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        
        {/* Navbar */}
        <nav className="glass-panel animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', padding: '1rem 2rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
            Bites2<span style={{ color: 'var(--color-secondary)' }}>Bytes</span>
          </div>
          <div>
            <a href="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.6rem 1.8rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
              Login Portal
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div className="animate-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
              PENGALAMAN BELAJAR MASA DEPAN ✨
            </div>
            <h1 className="header animate-float" style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: '1.1', color: '#0f172a' }}>
              Master Logic & Coding with <span style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}>Bites2Bytes</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
              Platform gamifikasi tertutup yang didesain secara unik untuk anak. Belajar logika dan coding bareng mentor secara live, kumpulkan trophy, dan bangun masa depan!
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '5rem', flexWrap: 'wrap' }}>
              <a href="#how-it-works" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '0.8rem 2rem' }}>
                Lihat Cara Kerja 🚀
              </a>
              <a href="https://wa.me/6281313233149?text=Halo%20Bites2Bytes%2C%20saya%20ingin%20tanya%20seputar%20kursus%20programming!" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: '1.125rem', backgroundColor: '#25D366', color: 'white', padding: '0.8rem 2rem' }}>
                💬 Hubungi via WhatsApp
              </a>
            </div>
          </div>

          {/* How It Works - Bento Grid */}
          <h2 id="how-it-works" className="animate-in" style={{ animationDelay: '0.2s', fontSize: '2.5rem', color: '#0f172a', marginBottom: '2rem', fontWeight: 800 }}>
             Bagaimana Anak Anda Belajar? 🎮
          </h2>
          
          <div className="bento-grid animate-in" style={{ animationDelay: '0.3s', marginBottom: '5rem', textAlign: 'left' }}>
            <div className="bento-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 700 }}>1. Jadwal & Zoom</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                Anak cukup masuk ke dalam portal dan melihat Jadwal Peta Belajarnya. Klik "Join Zoom" untuk langsung terhubung dengan mentor 1-on-1.
              </p>
            </div>
            
            <div className="bento-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🕹️</div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 700 }}>2. Kuis Interaktif</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                Selesai kelas, anak menjawab Kuis pendek langsung di dalam portal untuk mengevaluasi pemahaman mereka akan logika barusan.
              </p>
            </div>

            <div className="bento-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏅</div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 700 }}>3. Unlock Badges</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                Skor kuis akan men-unlock Trophy Badge lucu yang dikumpulkan di layar mereka. Efek candu gamifikasi yang memotivasi anak belajar!
              </p>
            </div>

            <div className="bento-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--color-primary), #1e3a8a)', color: 'white', border: 'none' }}>
               <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem' }}>
                 <div style={{ flex: '1', minWidth: '300px' }}>
                   <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👨‍👩‍👦</div>
                   <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>4. The Parent Hub</h3>
                   <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: '1.6' }}>
                     Orang tua tidak perlu repot. Pantau langsung Rapor Harian anak di tab "Parent Hub". Di akhir modul ke-10, sistem AI kami akan memberikan <strong>Saran Aktivitas Harian</strong> berformat PDF untuk diterapkan di rumah!
                   </p>
                 </div>
               </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
