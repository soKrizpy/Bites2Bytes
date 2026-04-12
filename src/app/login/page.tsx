export default function LoginSelection() {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <main style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="header animate-float" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
          Welcome Back to <span style={{ color: 'var(--color-secondary)' }}>Bites2Bytes</span> 🚀
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
          Please select your portal to log in.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login/form?portal=student" className="btn btn-primary" style={{ fontSize: '1.125rem' }}>
            Student Portal
          </a>
          <a href="/login/form?portal=teacher" className="btn btn-secondary" style={{ fontSize: '1.125rem' }}>
            Teacher Portal
          </a>
        </div>
        
        <div style={{ marginTop: '3rem' }}>
            <a href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Back to Home</a>
        </div>
      </main>
    </div>
  );
}
