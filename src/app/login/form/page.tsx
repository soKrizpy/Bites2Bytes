'use client'

import { useState, use } from 'react'
import { login } from './actions'

const countryCodes = [
  { code: '+62', label: '🇮🇩 ID (+62)' },
  { code: '+60', label: '🇲🇾 MY (+60)' },
  { code: '+65', label: '🇸🇬 SG (+65)' },
  { code: '+66', label: '🇹🇭 TH (+66)' },
  { code: '+63', label: '🇵🇭 PH (+63)' },
  { code: '+84', label: '🇻🇳 VN (+84)' },
  { code: '+1', label: '🇺🇸 US (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
]

export default function LoginPage(props: { searchParams?: Promise<any> }) {
  const [identifierType, setIdentifierType] = useState<'wa' | 'email'>('wa')
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const portal = searchParams?.portal || '';
  const displayPortal = portal ? `${portal.charAt(0).toUpperCase()}${portal.slice(1)} Portal ` : '';

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
      <main style={{ textAlign: 'center', maxWidth: '400px', width: '100%', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 className="header" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
          Login to {displayPortal}
        </h1>

        {searchParams?.error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            {searchParams.error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setIdentifierType('wa')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', 
              backgroundColor: identifierType === 'wa' ? 'var(--color-primary)' : '#f1f5f9',
              color: identifierType === 'wa' ? 'white' : 'var(--color-text)',
              cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            WhatsApp
          </button>
          <button 
            onClick={() => setIdentifierType('email')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', 
              backgroundColor: identifierType === 'email' ? 'var(--color-primary)' : '#f1f5f9',
              color: identifierType === 'email' ? 'white' : 'var(--color-text)',
              cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            Email
          </button>
        </div>

        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="identifier" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {identifierType === 'wa' ? 'WhatsApp Number' : 'Email Address'}
            </label>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {identifierType === 'wa' && (
                <select 
                  name="country_code" 
                  defaultValue="+62"
                  style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', width: 'auto' }}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              )}
              <input 
                id="identifier" 
                name="identifier" 
                type={identifierType === 'wa' ? 'text' : 'email'} 
                placeholder={identifierType === 'wa' ? 'e.g. 8123456789' : 'user@example.com'} 
                required 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {identifierType === 'wa' ? 'MPIN' : 'Password'}
            </label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', fontSize: '1.125rem' }}>
            Sign In 🚀
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem' }}>
            <a href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Back to Portals</a>
        </div>
      </main>
    </div>
  )
}
