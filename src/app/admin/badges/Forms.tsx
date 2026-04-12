'use client'

import { useState, useTransition, useRef } from 'react'
import { createBadgeAction, deleteBadgeAction } from './actions'

export function AddBadgeForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState({ success: false, error: '', message: '' })
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createBadgeAction(formData)
      setState({ success: result.success, error: result.error || '', message: result.message || '' })
      if (result.success) {
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-accent)' }}>
      <h3>🏅 Buat Badge Baru</h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>Upload ikon untuk badge (PNG/GIF).</p>

      {state.error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{state.error}</div>}
      {state.success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{state.message}</div>}

      <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Nama Badge</label>
          <input type="text" name="name" required placeholder="Contoh: Bintang Python" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea name="description" rows={2} placeholder="Deskripsi singkat badge ini..." className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Gambar/Ikon (PNG, GIF, JPG)</label>
          <input type="file" name="image" accept="image/png,image/gif,image/jpeg" required className="form-control" />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
          {isPending ? '⏳ Mengupload...' : '🚀 Buat Badge'}
        </button>
      </form>
    </div>
  )
}

interface DeleteBadgeButtonProps {
  id: string
  imageUrl: string
}

export function DeleteBadgeButton({ id, imageUrl }: DeleteBadgeButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Hapus badge ini?')) return
    startTransition(async () => {
      await deleteBadgeAction(id, imageUrl)
    })
  }

  return (
    <button onClick={handleDelete} disabled={isPending} className="btn btn-danger btn-sm">
      {isPending ? '...' : '🗑️ Hapus'}
    </button>
  )
}
