'use client'

import { useState, useTransition } from 'react'
import { createUserAction } from './actions'

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

export default function CreateUserForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState({ success: false, error: '', message: '' })
  const [showMpin, setShowMpin] = useState(false)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createUserAction(null, formData)
      setState({
        success: result.success,
        error: result.error || '',
        message: result.message || ''
      })
    })
  }

  return (
    <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid var(--color-primary)' }}>
      <h3>Create New User</h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Provision a new Student or Teacher account using their WhatsApp number, Full Name, and MPIN.
      </p>
      
      {state.error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {state.error}
        </div>
      )}
      
      {state.success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {state.message}
        </div>
      )}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="full_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name</label>
          <input 
            type="text" 
            id="full_name" 
            name="full_name" 
            required 
            placeholder="e.g. John Doe"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label htmlFor="wa_number" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>WhatsApp Number</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select 
              name="country_code" 
              defaultValue="+62"
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', width: 'auto' }}
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input 
              type="text" 
              id="wa_number" 
              name="username" 
              required 
              placeholder="e.g. 8123456789"
              style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role</label>
          <select 
            id="role" 
            name="role" 
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff' }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div>
           <label htmlFor="mpin" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>MPIN (Password)</label>
           <div style={{ position: 'relative' }}>
             <input 
              type={showMpin ? 'text' : 'password'} 
              id="mpin" 
              name="mpin" 
              required 
              placeholder="Enter 6-digit MPIN"
              style={{ width: '100%', padding: '0.75rem', paddingRight: '3rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowMpin(!showMpin)}
              style={{ 
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: 0
              }}
              title={showMpin ? 'Hide MPIN' : 'Show MPIN'}
            >
              {showMpin ? '🙈' : '👁️'}
            </button>
           </div>
        </div>

        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {isPending ? 'Creating...' : '🚀 Create Account'}
        </button>
      </form>
    </div>
  )
}
