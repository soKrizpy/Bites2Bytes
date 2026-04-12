'use client'

import { useState, useTransition } from 'react'
import { submitQuizAction } from './actions'

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

interface QuizSectionProps {
  quiz: {
    id: string
    title: string
    passing_score: number
    badge_id: string | null
    badges?: { name: string; image_url: string } | null
  }
  questions: Question[]
  topicId: string
  studentId: string
  existingProgress: {
    completed: boolean
    quiz_score: number | null
    badge_earned: boolean
    badge_id: string | null
  } | null
}

export default function QuizSection({ quiz, questions, topicId, studentId, existingProgress }: QuizSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean; badgeEarned: boolean } | null>(
    existingProgress?.quiz_score != null
      ? { score: existingProgress.quiz_score, passed: existingProgress.badge_earned, badgeEarned: existingProgress.badge_earned }
      : null
  )
  const [isPending, startTransition] = useTransition()
  const [showQuiz, setShowQuiz] = useState(!existingProgress?.completed)

  const handleSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    const allAnswered = questions.every(q => answers[q.id])
    if (!allAnswered) {
      alert('Harap jawab semua pertanyaan terlebih dahulu!')
      return
    }

    // Hitung skor lokal
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= quiz.passing_score

    startTransition(async () => {
      await submitQuizAction({
        studentId,
        topicId,
        quizId: quiz.id,
        score,
        passed,
        badgeId: passed && quiz.badge_id ? quiz.badge_id : null,
      })
      setResult({ score, passed, badgeEarned: passed && !!quiz.badge_id })
      setShowQuiz(false)
    })
  }

  const options = ['a', 'b', 'c', 'd'] as const
  const optionLabels = { a: 'A', b: 'B', c: 'C', d: 'D' }

  // Tampilan hasil kuis sebelumnya (sudah dikerjakan)
  if (!showQuiz && result) {
    return (
      <div className="card" style={{ borderTop: `4px solid ${result.passed ? 'var(--color-success)' : 'var(--color-accent)'}` }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>📝 {quiz.title}</h2>
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: result.passed ? 'var(--color-success)' : 'var(--color-accent)', marginBottom: '0.5rem' }}>
            {result.score}
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            {result.passed ? '🎉 Lulus! Nilai kamu melewati batas minimum.' : `Belum lulus. Nilai minimum: ${quiz.passing_score}`}
          </p>

          {result.badgeEarned && (quiz as any).badges && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1.5rem', background: '#fefce8', borderRadius: '12px', border: '2px solid var(--color-secondary)' }}>
              <p style={{ fontWeight: 700, color: '#854d0e' }}>🏅 Kamu mendapatkan badge!</p>
              <img src={(quiz as any).badges.image_url} alt={(quiz as any).badges.name} className="badge-img badge-earned" style={{ width: '80px', height: '80px' }} />
              <p style={{ fontWeight: 600 }}>{(quiz as any).badges.name}</p>
            </div>
          )}

          {!result.passed && (
            <button onClick={() => { setShowQuiz(true); setAnswers({}) }} className="btn btn-secondary">
              🔄 Coba Lagi
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📝 {quiz.title}</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="chip chip-info">Nilai minimum: {quiz.passing_score}</span>
          {quiz.badge_id && (quiz as any).badges && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <img src={(quiz as any).badges.image_url} alt={(quiz as any).badges.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Hadiah: {(quiz as any).badges.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Soal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2rem' }}>
        {questions.map((q, idx) => (
          <div key={q.id}>
            <p style={{ fontWeight: 600, marginBottom: '0.875rem', lineHeight: 1.5 }}>
              {idx + 1}. {q.question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map(opt => {
                const optText = q[`option_${opt}` as keyof Question] as string
                const isSelected = answers[q.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(q.id, opt)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      backgroundColor: isSelected ? 'var(--color-primary)' : '#f1f5f9',
                      color: isSelected ? 'white' : 'var(--color-text)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#ddd',
                      fontWeight: 700, fontSize: '0.8rem',
                    }}>
                      {optionLabels[opt]}
                    </span>
                    {optText}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Progress indikator */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
          <span>Pertanyaan terjawab</span>
          <span>{Object.keys(answers).length}/{questions.length}</span>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending || Object.keys(answers).length < questions.length}
        className="btn btn-primary"
        style={{ width: '100%', padding: '0.875rem' }}
      >
        {isPending ? '⏳ Menilai jawaban...' : `🎯 Kumpulkan Jawaban (${Object.keys(answers).length}/${questions.length})`}
      </button>
    </div>
  )
}
