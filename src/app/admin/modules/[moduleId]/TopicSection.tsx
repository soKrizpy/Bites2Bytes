'use client'

import { useState, useTransition } from 'react'
import { createQuizAction, addQuizQuestionAction, deleteQuizAction, deleteQuizQuestionAction } from '../detailActions'

interface TopicSectionProps {
  moduleId: string
  topics: any[]
  badges: any[]
}

export default function TopicSection({ moduleId, topics, badges }: TopicSectionProps) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>📖 Daftar Topik & Kuis</h3>
      
      {topics.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
          Belum ada topik di modul ini.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {topics.map((topic, idx) => {
          const quiz = topic.quizzes ? topic.quizzes[0] : null
          const isExpanded = activeTopicId === topic.id

          return (
            <div key={topic.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Header Topik */}
              <div 
                style={{ 
                  padding: '1rem 1.25rem', backgroundColor: '#f8fafc',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer' 
                }}
                onClick={() => setActiveTopicId(isExpanded ? null : topic.id)}
              >
                <div>
                  <span style={{ fontWeight: 700, marginRight: '0.75rem' }}>{idx + 1}.</span>
                  <span style={{ fontWeight: 600 }}>{topic.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {quiz ? (
                    <span className="chip chip-success">📝 Kuis: {quiz.title}</span>
                  ) : (
                    <span className="chip chip-muted">Belum ada Kuis</span>
                  )}
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Konten Detail Topik */}
              {isExpanded && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Materi Link</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {topic.drive_link && <a href={topic.drive_link} target="_blank" className="chip chip-info">Drive 🔗</a>}
                        {topic.canva_link && <a href={topic.canva_link} target="_blank" className="chip chip-info">Canva 🔗</a>}
                      </div>
                    </div>
                  </div>

                  {/* Bagian Kuis */}
                  <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                    {quiz ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '1rem' }}>📝 Kelola Kuis: {quiz.title}</h4>
                          <button 
                            onClick={(e) => { e.stopPropagation(); if (confirm('Hapus kuis?')) startTransition(async () => { await deleteQuizAction(quiz.id) }) }}
                            className="btn btn-danger btn-sm"
                          >
                            🗑️ Hapus Kuis
                          </button>
                        </div>

                        {/* List Questions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          <h5 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Daftar Pertanyaan:</h5>
                          {quiz.quiz_questions?.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Belum ada pertanyaan.</p>}
                          {quiz.quiz_questions?.map((q: any, qidx: number) => (
                            <div key={q.id} style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.875rem' }}>{qidx + 1}. {q.question}</span>
                              <button onClick={() => startTransition(async () => { await deleteQuizQuestionAction(q.id) })} className="btn btn-ghost btn-sm">✕</button>
                            </div>
                          ))}
                        </div>

                        {/* Form Tambah Question */}
                        <form action={async (fd) => { startTransition(async () => { await addQuizQuestionAction(fd) }) }} style={{ borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
                          <input type="hidden" name="quiz_id" value={quiz.id} />
                          <h5 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>➕ Tambah Pertanyaan:</h5>
                          <input name="question" placeholder="Pertanyaan" className="form-control" required style={{ marginBottom: '0.5rem' }} />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input name="option_a" placeholder="Opsi A" className="form-control" required />
                            <input name="option_b" placeholder="Opsi B" className="form-control" required />
                            <input name="option_c" placeholder="Opsi C" className="form-control" required />
                            <input name="option_d" placeholder="Opsi D" className="form-control" required />
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select name="correct_answer" className="form-control" required style={{ flex: 1 }}>
                              <option value="">-- Jawaban Benar --</option>
                              <option value="a">Opsi A</option>
                              <option value="b">Opsi B</option>
                              <option value="c">Opsi C</option>
                              <option value="d">Opsi D</option>
                            </select>
                            <button type="submit" disabled={isPending} className="btn btn-secondary btn-sm">
                              {isPending ? '...' : 'Tambah Soal'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      // Form Buat Kuis
                      <form action={async (fd) => { startTransition(async () => { await createQuizAction(fd) }) }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>➕ Buat Kuis untuk Topik ini</h4>
                        <input type="hidden" name="topic_id" value={topic.id} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <input name="title" placeholder="Judul Kuis" className="form-control" required />
                          <input name="passing_score" type="number" placeholder="Passing Score (0-100)" className="form-control" defaultValue="70" required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <select name="badge_id" className="form-control" style={{ flex: 1 }}>
                            <option value="">-- Pilih Hadiah Badge (Opsional) --</option>
                            {badges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                          <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                            {isPending ? '⏳' : 'Buat Kuis'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
