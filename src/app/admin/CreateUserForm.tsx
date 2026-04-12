'use client'

import { useState, useTransition } from 'react'
import { createUserAction } from './actions'

export default function CreateUserForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState({ success: false, error: '', message: '' })

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      // Pass null/undefined as prevState since we aren't using useActionState
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
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Provision a new Student or Teacher account using a Username and MPIN.</p>
      
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

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            required 
            placeholder="e.g. murid01"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
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
           <input 
            type="password" 
            id="mpin" 
            name="mpin" 
            required 
            placeholder="e.g. 123456"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>

        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {isPending ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
