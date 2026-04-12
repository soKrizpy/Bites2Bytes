'use client'

import { useState, useTransition } from 'react'
import { submitExamAction } from './actions'

interface Question {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  sort_order: number
}

interface ExamSectionProps {
  exam: {
    id: string
    title: string
    passing_score: number
  }
  questions: Question[]
  moduleId: string
  studentId: string
}

export default function ExamSection({ exam, questions, moduleId, studentId }: ExamSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ score: number; passed: boolean; error?: string } | null>(null)

  const handleSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    if (questions.length === 0) return

    const allAnswered = questions.every(q => answers[q.id])
    if (!allAnswered) {
      alert('Harap jawab semua pertanyaan ujian!')
      return
    }

    if (!confirm('Apakah kamu yakin ingin mengumpulkan ujian ini? Kamu tidak bisa mengulang jika sudah lulus.')) {
      return
    }

    // Hitung skor
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= exam.passing_score

    startTransition(async () => {
      const res = await submitExamAction({
        studentId,
        moduleId,
        examId: exam.id,
        score,
        passed,
      })

      if (res.success) {
        setResult({ score, passed })
        if (passed) {
             // Redirect atau refresh akan ditangani oleh revalidatePath di action
             // Namun untuk UX kita tunjukkan result dulu
        }
      } else {
        setResult({ score, passed, error: res.error })
      }
    })
  }

  if (result) {
    return (
      <div className="card animate-in" style={{ borderTop: `4px solid ${result.passed ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Hasil Ujian</h2>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: result.passed ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: '0.5rem' }}>
            {result.score}
          </div>
          
          {result.passed ? (
            <div className="alert alert-success">
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>🎉 SELAMAT! Kamu Lulus!</p>
              <p>Sertifikat kamu sedang diterbitkan. Silakan kembali ke Dashboard.</p>
              <a href="/student" className="btn btn-success" style={{ marginTop: '1.5rem' }}>Ke Dashboard →</a>
            </div>
          ) : (
            <div className="alert alert-error">
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>❌ Maaf, kamu belum lulus.</p>
              <p>Nilai minimum untuk lulus adalah <strong>{exam.passing_score}</strong>. Silakan pelajari kembali materi dan coba lagi nanti.</p>
              <button onClick={() => { setResult(null); setAnswers({}) }} className="btn btn-danger" style={{ marginTop: '1.5rem' }}>
                Coba Lagi 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const options = ['a', 'b', 'c', 'd'] as const
  const optionLabels = { a: 'A', b: 'B', c: 'C', d: 'D' }

  return (
    <div className="card animate-in">
      <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{exam.title}</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Total Soal: <strong>{questions.length}</strong> • Nilai Lulus: <strong>{exam.passing_score}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {questions.map((q, idx) => (
          <div key={q.id} className="form-group">
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '1rem' }}>
              {idx + 1}. {q.question}
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {options.map(opt => {
                const isSelected = answers[q.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(q.id, opt)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left', 
                        padding: '1rem',
                        borderRadius: '12px',
                        fontSize: '0.95rem'
                    }}
                  >
                    <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: isSelected ? 'white' : '#e2e8f0',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                        marginRight: '0.75rem',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                    }}>
                      {optionLabels[opt]}
                    </span>
                    {q[`option_${opt}` as keyof Question]}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Pastikan semua soal sudah terjawab sebelum mengumpulkan.
        </p>
        <button
          onClick={handleSubmit}
          disabled={isPending || Object.keys(answers).length < questions.length}
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '400px', padding: '1rem', fontSize: '1.1rem' }}
        >
          {isPending ? '⏳ Memproses...' : `🚀 Kumpulkan Ujian (${Object.keys(answers).length}/${questions.length})`}
        </button>
      </div>
    </div>
  )
}
