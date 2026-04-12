'use client'

import { useState, useTransition } from 'react'
import { giveBadgeAction, issueCertificateAction } from '../../actions'

interface ProgressControlProps {
  studentId: string
  topicId?: string
  badgeId?: string
  badgeName?: string
  moduleId?: string
  isBadgeEarned?: boolean
  isCertificateIssued?: boolean
  type?: 'badge' | 'certificate'
}

export default function ProgressControl({ 
    studentId, topicId, badgeId, badgeName, moduleId, isBadgeEarned, isCertificateIssued, type = 'badge' 
}: ProgressControlProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const handleGiveBadge = () => {
    if (!badgeId || !topicId) return
    if (!confirm(`Berikan badge "${badgeName}" secara manual kepada siswa?`)) return
    
    startTransition(async () => {
      const res = await giveBadgeAction(studentId, topicId, badgeId)
      if (res.success) setMessage('Badge Berhasil!')
    })
  }

  const handleIssueCertificate = () => {
    if (!moduleId) return
    const scoreStr = prompt('Masukkan skor ujian siswa (0-100):', '85')
    if (scoreStr === null) return
    const score = parseInt(scoreStr)
    if (isNaN(score)) return alert('Skor tidak valid.')

    if (!confirm(`Terbitkan sertifikat sekarang?`)) return

    startTransition(async () => {
      const res = await issueCertificateAction(studentId, moduleId, score)
      if (res.success) setMessage('Sertifikat Terbit!')
      else alert(res.error)
    })
  }

  if (type === 'certificate') {
    return (
      <button 
        onClick={handleIssueCertificate} 
        disabled={isPending || isCertificateIssued} 
        className="btn btn-secondary"
      >
        {isPending ? '⏳ Memproses...' : message || '📜 Terbitkan Sertifikat'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {badgeId && !isBadgeEarned && (
        <button 
            onClick={handleGiveBadge} 
            disabled={isPending} 
            className="btn btn-ghost btn-sm"
            title="Berikan Badge Manual"
        >
          {isPending ? '⏳' : '🏅 Berikan Badge'}
        </button>
      )}
      {message && <span style={{ color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 600 }}>{message}</span>}
    </div>
  )
}
