'use client'

import { useTransition, useState } from 'react'
import { processPayrollAction } from './actions'

interface Props {
  teacherId: string
  amount: number
  sessionCount: number
}

export default function PayrollControl({ teacherId, amount, sessionCount }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handlePay = () => {
    if (!confirm(`Tandai sebagai DIBAYAR untuk ${sessionCount} sesi (Total: Rp ${amount.toLocaleString('id-ID')})?`)) return

    startTransition(async () => {
       const res = await processPayrollAction(teacherId, amount, sessionCount)
       if (res.success) {
           setSuccess(true)
       } else {
           alert("Gagal: " + res.error)
       }
    })
  }

  if (success) {
      return <button className="btn btn-success" style={{ width: '100%' }} disabled>✅ Sukses Dibayar</button>
  }

  return (
    <button className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '0.8rem' }} onClick={handlePay} disabled={isPending}>
       {isPending ? '⏳ Memproses Server...' : `💸 Pay & Terbitkan Slip`}
    </button>
  )
}
