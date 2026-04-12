'use client'

import { useState, useTransition } from 'react'
import { updateZoomLinkFromTeacherAction } from './actions'

interface ZoomLinkFormProps {
  enrollmentId: string
  currentZoomLink: string
}

export default function ZoomLinkForm({ enrollmentId, currentZoomLink }: ZoomLinkFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [zoomLink, setZoomLink] = useState(currentZoomLink)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      await updateZoomLinkFromTeacherAction(enrollmentId, zoomLink)
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  if (!isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {zoomLink ? (
          <a href={zoomLink} target="_blank" rel="noopener noreferrer"
             className="btn btn-success btn-sm">
            📹 Join Zoom
          </a>
        ) : (
          <span className="chip chip-muted">Belum ada link</span>
        )}
        <button onClick={() => setIsEditing(true)} className="btn btn-ghost btn-sm">
          {saved ? '✅' : '✏️'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
      <input
        type="url"
        value={zoomLink}
        onChange={e => setZoomLink(e.target.value)}
        placeholder="https://zoom.us/j/..."
        className="form-control"
        style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
        autoFocus
      />
      <button onClick={handleSave} disabled={isPending} className="btn btn-primary btn-sm">
        {isPending ? '⏳' : '💾'}
      </button>
      <button onClick={() => { setIsEditing(false); setZoomLink(currentZoomLink) }} className="btn btn-ghost btn-sm">✕</button>
    </div>
  )
}
