'use client'

import { useState } from 'react'

interface MpinVisibilityCellProps {
  value: string | null
}

export default function MpinVisibilityCell({ value }: MpinVisibilityCellProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Jika value null (data lawas), kita berikan teks fallback
  const fallbackText = "Not Recorded"
  const mpin = value || fallbackText
  const displayValue = isVisible ? mpin : '••••••••'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ 
        fontFamily: 'monospace', 
        color: !value && isVisible ? 'var(--color-text-muted)' : 'var(--color-danger)', 
        fontWeight: 'bold', 
        minWidth: '88px' 
      }}>
        {displayValue}
      </span>
      
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="btn btn-ghost btn-sm"
        aria-label={isVisible ? 'Sembunyikan MPIN' : 'Tampilkan MPIN'}
        title={isVisible ? 'Sembunyikan MPIN' : 'Tampilkan MPIN'}
        style={{ padding: '0.35rem 0.6rem', minWidth: '44px' }}
      >
        {isVisible ? '🙈' : '👁️'}
      </button>
    </div>
  )
}

