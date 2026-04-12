'use client'

import { useState, useTransition } from 'react'

interface Props {
  enrollmentId: string
  topicId: string
  isJoined: boolean
  isReportSubmitted: boolean
}

export default function AIEnhancedReporter({ enrollmentId, topicId, isJoined, isReportSubmitted }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [rawNotes, setRawNotes] = useState('')

  if (!isJoined) {
    return <span className="chip chip-muted" title="Siswa belum Join Zoom. Tida bisa membuat laporan.">🔒 Tunggu Siswa Hadir</span>
  }

  if (isReportSubmitted) {
    return <span className="chip chip-success">✅ Berhasil Dilaporkan</span>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawNotes.trim()) return

    startTransition(async () => {
      // Panggil Server Action untuk memproses ke Gemini
      const { submitAIReportAction } = await import('../../actions')
      const res = await submitAIReportAction(enrollmentId, topicId, rawNotes)
      
      if (res.success) {
        setShowModal(false)
        // Refresh page natively through action revalidatePath
      } else {
        alert("Error: " + res.error)
      }
    })
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
        🤖 Tulis Rapot AI
      </button>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>🤖 AI Teacher Assistant</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
               Tulis catatan mentah (poin-poin) tentang perkembangan siswa hari ini. AI Gemini akan mengubahnya menjadi paragraf laporan profesional untuk dikirim ke Parent Hub.
               <br/><br/>
               <em style={{ color: 'var(--color-accent)' }}>Catatan: Mengirim laporan ini akan memicu Perekaman Gaji (Rp 60.000) untuk Anda secara otomatis.</em>
            </p>

            <form onSubmit={handleSubmit}>
              <textarea 
                className="input" 
                rows={5} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', marginBottom: '1rem', fontFamily: 'inherit' }}
                placeholder="Contoh: Siswa aktif bertanya, ngerjain logic if-else pinter tapi agak lambat ngetiknya, perlu latihan typing..."
                value={rawNotes}
                onChange={e => setRawNotes(e.target.value)}
                required
                disabled={isPending}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={isPending}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isPending || !rawNotes.trim()}>
                  {isPending ? '✨ AI sedang memproses...' : 'Kirim & Dapatkan Gaji 💰'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
