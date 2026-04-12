import { login } from './actions'

export default async function LoginPage(props: { searchParams?: Promise<{ portal?: string }> }) {
  const searchParams = await props.searchParams;
  const portal = searchParams?.portal || '';
  const displayPortal = portal ? `${portal.charAt(0).toUpperCase()}${portal.slice(1)} Portal ` : '';

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
      <main style={{ textAlign: 'center', maxWidth: '400px', width: '100%', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 className="header" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
          Login to {displayPortal}
        </h1>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="identifier" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email or Username</label>
            <input 
              id="identifier" 
              name="identifier" 
              type="text" 
              placeholder="user@example.com / username123" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password or MPIN</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
          </div>
          <button formAction={login} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', fontSize: '1.125rem' }}>
            Sign In
          </button>
        </form>
        <div style={{ marginTop: '1.5rem' }}>
            <a href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Back to Portals</a>
        </div>
      </main>
    </div>
  )
}
