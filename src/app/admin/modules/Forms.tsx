'use client'

import { useState, useTransition } from 'react'
import { createModuleAction, createTopicAction } from './actions'

export function AddModuleForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState({ success: false, error: '', message: '' })

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createModuleAction(formData)
      setState({ success: result.success, error: result.error || '', message: result.message || '' })
    })
  }

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-primary)' }}>
      <h3>Create New Module</h3>
      
      {state.error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{state.error}</div>}
      {state.success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{state.message}</div>}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
          <input type="text" name="title" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
          <textarea name="description" rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Thumbnail Image</label>
          <input type="file" name="thumbnail" accept="image/*" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Min. Score for Exam (%)</label>
          <input type="number" name="passing_score" defaultValue="80" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? 'Creating...' : 'Create Module'}
        </button>
      </form>
    </div>
  )
}

export function AddTopicForm({ modules, badges }: { modules: any[], badges: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState({ success: false, error: '', message: '' })

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createTopicAction(formData)
      setState({ success: result.success, error: result.error || '', message: result.message || '' })
    })
  }

  if (modules.length === 0) return null;

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-secondary)' }}>
      <h3>Add Topic to Module</h3>
      
      {state.error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{state.error}</div>}
      {state.success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{state.message}</div>}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Module</label>
          <select name="module_id" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
            <option value="">-- Select Module --</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Topic Title</label>
          <input type="text" name="title" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Min. Score (%)</label>
            <input type="number" name="passing_score" defaultValue="80" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Badge Reward</label>
            <select name="badge_id" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
              <option value="">-- No Badge --</option>
              {badges.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Link Google Drive (View Mode)</label>
          <input type="url" name="drive_link" placeholder="https://drive.google.com/..." className="form-control" />
        </div>
        <div>
          <label className="form-label">Link Canva (View Mode)</label>
          <input type="url" name="canva_link" placeholder="https://www.canva.com/..." className="form-control" />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-secondary">
          {isPending ? 'Adding...' : 'Add Topic'}
        </button>
      </form>
    </div>
  )
}
