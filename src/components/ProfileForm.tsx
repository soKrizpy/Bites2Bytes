'use client'

import { useState, useTransition, useRef } from 'react'
import { updateProfileAction, updatePhotoAction } from '@/app/profile/actions'

interface ProfileFormProps {
  profile: {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    photo_url?: string | null // Keep for internal usage if needed but use avatar_url
    avatar_url: string | null
    role: string
  }
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isUploadPending, startUploadTransition] = useTransition()
  const [state, setState] = useState({ success: false, error: '', message: '' })
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.avatar_url || profile.photo_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      setState({ success: result.success, error: result.error || '', message: result.message || '' })
    })
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview lokal
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload ke server
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('userId', profile.id)

    startUploadTransition(async () => {
      const result = await updatePhotoAction(formData)
      if (!result.success) {
        setState({ success: false, error: result.error || 'Gagal upload foto', message: '' })
      } else {
        setState({ success: true, error: '', message: 'Foto profil berhasil diperbarui!' })
      }
    })
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>✏️ Edit Profil</h2>

      {/* Foto Profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div
          style={{
            width: '100px', height: '100px', borderRadius: '50%',
            overflow: 'hidden', border: '3px solid var(--color-primary)',
            cursor: 'pointer', position: 'relative', flexShrink: 0,
            backgroundColor: 'var(--color-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Foto Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {profile.username?.[0]?.toUpperCase()}
            </span>
          )}
          <div style={{
            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
            borderRadius: '50%',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
              {isUploadPending ? '⏳' : '📷 Ganti'}
            </span>
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>@{profile.username}</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Klik foto untuk mengubah</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Format: JPG, PNG, GIF (maks. 2MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />
      </div>

      {state.error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {state.error}
        </div>
      )}
      {state.success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {state.message}
        </div>
      )}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nama Lengkap</label>
          <input
            type="text" name="full_name"
            defaultValue={profile.full_name || ''}
            placeholder="Masukkan nama lengkap"
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Bio Singkat</label>
          <textarea
            name="bio" rows={3}
            defaultValue={profile.bio || ''}
            placeholder="Ceritakan sedikit tentang dirimu..."
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          {isPending ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}
