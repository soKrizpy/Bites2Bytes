export default function Home() {
  return (
    <div className="bg-pattern" style={{ minHeight: '100vh', paddingBottom: '4rem', overflowX: 'hidden' }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(255,255,255,0) 70%)', zIndex: -1, borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(255,255,255,0) 70%)', zIndex: -1, borderRadius: '50%' }}></div>

      <div className="container" style={{ paddingTop: '1.5rem', position: 'relative' }}>
        
        {/* Navbar */}
        <nav className="glass-panel animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5rem', padding: '1rem 2rem', borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)' }}>
              B2B
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
              Bites2<span style={{ color: 'var(--color-secondary)' }}>Bytes</span>
            </div>
          </div>
          <div>
            <a href="/login" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.7rem 2rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', borderRadius: 'var(--radius-full)' }}>
               Portals Log In
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div className="animate-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2rem', letterSpacing: '0.5px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span> PENGALAMAN BELAJAR MASA DEPAN 
            </div>
            <h1 className="animate-float" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', marginBottom: '1.5rem', lineHeight: '1.1', color: '#0f172a', fontWeight: 900, letterSpacing: '-2px' }}>
              Master Logic & Coding<br />
              with <span style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', display: 'inline-block', position: 'relative' }}>
                Bites2Bytes
                <svg style={{ position: 'absolute', bottom: '-10px', left: 0, width: '100%', height: '12px' }} viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="var(--color-secondary)" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>
            <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'var(--color-text-muted)', marginBottom: '3.5rem', maxWidth: '750px', margin: '0 auto 3.5rem', lineHeight: '1.6', fontWeight: 500 }}>
              Platform masa depan terdepan! Gamifikasi mendalam dirancang secara unik untuk mengasah pola pikir komputasional anak Anda. Belajar langsung dengan mentor secara live!
            </p>
            
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginBottom: '6rem', flexWrap: 'wrap' }}>
              <a href="#how-it-works" className="btn" style={{ fontSize: '1.15rem', padding: '1rem 2.5rem', backgroundColor: '#0f172a', color: 'white', border: '2px solid #0f172a', transition: 'all 0.3s ease' }}>
                Jelajahi Fitur 🚀
              </a>
              <a href="https://wa.me/6281313233149?text=Halo%20Bites2Bytes%2C%20saya%20ingin%20tanya%20seputar%20kursus%20programming!" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: '1.15rem', backgroundColor: 'transparent', color: '#0f172a', border: '2px solid #e2e8f0', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#25D366', fontSize: '1.4rem' }}>💬</span> Konsultasi Gratis
              </a>
            </div>
          </div>

          {/* How It Works - Bento Grid */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 id="how-it-works" className="animate-in" style={{ animationDelay: '0.2s', fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
               Ekosistem Belajar Bites2Bytes 🎮
            </h2>
            <p className="animate-in" style={{ animationDelay: '0.3s', color: 'var(--color-text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
               Kami menggabungkan instruktur langsung, gamifikasi, dan pemantauan AI dalam satu hub inovatif.
            </p>
          </div>
          
          <div className="bento-grid animate-in" style={{ animationDelay: '0.4s', marginBottom: '5rem', textAlign: 'left' }}>
            
            {/* Feature 1 */}
            <div className="bento-card" style={{ gridColumn: 'span 2', gridRow: 'span 1', background: 'linear-gradient(135deg, rgba(238,242,255,0.7), rgba(224,231,255,0.7))', border: '1px solid rgba(199,210,254,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'white', fontSize: '2rem', marginBottom: '1.25rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    📅
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a', fontWeight: 800, marginBottom: '0.75rem' }}>Live Mentoring via Zoom</h3>
                  <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.7', fontWeight: 500 }}>
                    Sekali klik, anak Anda langsung terhubung ke sesi Zoom 1-on-1 dengan mentor profesional. Tidak ada aplikasi ribet! Jadwal akan muncul secara otomatis di dalam portal The Learning Dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bento-card" style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fef3c7', fontSize: '2rem', marginBottom: '1.25rem', color: '#d97706' }}>
                🕹️
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text)', fontWeight: 800, marginBottom: '0.75rem' }}>Instant Quizzes</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1em', lineHeight: '1.7' }}>
                Pemahaman diukur secara real-time tepat setelah kelas dengan interaktif gamifikasi tanpa tekanan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bento-card" style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fee2e2', fontSize: '2rem', marginBottom: '1.25rem' }}>
                🏅
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text)', fontWeight: 800, marginBottom: '0.75rem' }}>Trophy Badges</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.7' }}>
                Rasa pencapaian yang memotivasi! Kumpulkan lencana virtual eksklusif seiring selesainya modul belajar berkualitas tinggi.
              </p>
            </div>

            {/* Feature 4 (Full Width) */}
            <div className="bento-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
               {/* Background Deco */}
               <div style={{ position: 'absolute', right: '-10%', top: '-50%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
               
               <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem', position: 'relative', zIndex: 1, padding: '1rem' }}>
                 <div style={{ flex: '1', minWidth: '300px' }}>
                   <div style={{ display: 'inline-flex', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#93c5fd' }}>
                     FITUR EKSKLUSIF
                   </div>
                   <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>The Parent Hub <span style={{ fontSize: '2rem' }}>👨‍👩‍👦</span></h3>
                   <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '2rem' }}>
                     Anda tetap memegang kendali tanpa merasa terbebani. Pantau langsung Rapor Harian anak dengan data transparan dari portal terpisah. Di akhir modul, kami menghasilkan <strong>AI-driven Summary & Offline Activity Guide</strong> spesial untuk Anda.
                   </p>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                       <span style={{ color: '#22c55e' }}>✓</span> Real-time Progress
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                       <span style={{ color: '#22c55e' }}>✓</span> Auto-Generated PDF
                     </div>
                   </div>
                 </div>
                 
                 <div style={{ flex: '0.8', minWidth: '250px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', backdropFilter: 'blur(10px)' }}>
                   <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', width: '40%', borderRadius: '6px' }}></div>
                   <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', width: '80%', borderRadius: '6px', marginBottom: '1rem' }}></div>
                   <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '50%', border: '2px solid white' }}></div>
                      <div style={{ width: '40px', height: '40px', background: 'var(--color-secondary)', borderRadius: '50%', border: '2px solid white', marginLeft: '-20px' }}></div>
                      <div style={{ width: '40px', height: '40px', background: 'var(--color-accent)', borderRadius: '50%', border: '2px solid white', marginLeft: '-20px' }}></div>
                   </div>
                   <div style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
                      AI Report Ready Download 📄
                   </div>
                 </div>
               </div>
            </div>
            
          </div>
          
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '3rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
             &copy; {new Date().getFullYear()} Bites2Bytes. Premium Coding Experience For Kids.
          </div>

        </main>
      </div>
    </div>
  );
}
