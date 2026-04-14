'use client'

import { useState, useTransition } from 'react'
import { repairSupabaseAction } from './actions'

export default function SupabaseRepairCard() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{
    success: boolean
    error: string
    message: string
    syncedCount?: number
    buckets?: string[]
  }>({
    success: false,
    error: '',
    message: '',
  })

  const handleRepair = () => {
    startTransition(async () => {
      const result = await repairSupabaseAction()
      setState({
        success: result.success,
        error: result.error || '',
        message: result.message || '',
        syncedCount: result.syncedCount,
        buckets: result.buckets,
      })
    })
  }

  return (
    <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid #0f766e' }}>
      <h3>Repair Supabase</h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Jalankan sinkronisasi `profiles` dari auth users dan siapkan bucket `profile-pictures` serta `badges`.
      </p>

      {state.error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {state.error}
        </div>
      )}

      {state.success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
          <div>{state.message}</div>
          {typeof state.syncedCount === 'number' && (
            <div style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>Profiles disinkronkan: {state.syncedCount}</div>
          )}
          {state.buckets && state.buckets.length > 0 && (
            <div style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>Buckets: {state.buckets.join(', ')}</div>
          )}
        </div>
      )}

      <button type="button" onClick={handleRepair} disabled={isPending} className="btn btn-primary">
        {isPending ? 'Memperbaiki...' : 'Repair Supabase Sekarang'}
      </button>
    </div>
  )
}
