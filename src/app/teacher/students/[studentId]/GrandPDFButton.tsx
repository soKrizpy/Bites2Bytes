'use client'

import { useTransition, useState } from 'react'
import { generateGrandReviewAction } from '../../actions'

interface Props {
  enrollmentId: string
}

export default function GrandPDFButton({ enrollmentId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleGenerate = () => {
    if (!confirm('Akhiri modul ini dan mulai meracik the Grand PDF menggunakan AI berbasis keseluruhan laporan kelas?')) return
    
    startTransition(async () => {
       const res = await generateGrandReviewAction(enrollmentId)
       if (res.success) {
           setSuccess(true)
       } else {
           alert("Gagal: " + res.error)
       }
    })
  }

  if (success) {
      return (
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✅ Grand PDF Selesai Diracik!</span>
            <a href={`/api/grand-pdf/${enrollmentId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
               ⬇️ Unduh PDF Laporan Akhir
            </a>
         </div>
      )
  }

  return (
    <button onClick={handleGenerate} className="btn" style={{ backgroundColor: '#8b5cf6', color: 'white' }} disabled={isPending}>
      {isPending ? '⏳ AI Sedang Meracik PDF...' : '✨ Akhiri Modul & Racik Grand PDF'}
    </button>
  )
}
