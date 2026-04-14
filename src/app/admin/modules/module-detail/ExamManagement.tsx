'use client'

import { useTransition } from 'react'
import {
  addExamQuestionAction,
  createExamAction,
  deleteExamQuestionAction,
} from '../detailActions'

interface ExamQuestion {
  id: string
  question: string
  correct_answer: string
}

interface ExamData {
  id: string
  title: string
  passing_score: number
  exam_questions?: ExamQuestion[]
}

interface ExamManagementProps {
  moduleId: string
  exam: ExamData | null
}

export default function ExamManagement({ moduleId, exam }: ExamManagementProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-accent)' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Ujian Akhir Modul</h3>

      {exam ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{exam.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Passing Score: <strong>{exam.passing_score}%</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Soal Ujian ({exam.exam_questions?.length || 0})</h5>
            {exam.exam_questions?.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                Belum ada soal ujian.
              </p>
            )}
            {exam.exam_questions?.map((question, idx) => (
              <div
                key={question.id}
                style={{
                  padding: '0.8rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{idx + 1}. {question.question}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                    Jawaban Benar: {question.correct_answer.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Hapus soal ini?')) {
                      startTransition(async () => {
                        await deleteExamQuestionAction(question.id, moduleId)
                      })
                    }
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: '1.25rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Tambah Soal Ujian:</h5>
            <form
              action={async (formData) => {
                startTransition(async () => {
                  await addExamQuestionAction(formData)
                })
              }}
            >
              <input type="hidden" name="module_id" value={moduleId} />
              <input type="hidden" name="exam_id" value={exam.id} />
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <textarea name="question" placeholder="Pertanyaan ujian..." className="form-control" rows={2} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input name="option_a" placeholder="Opsi A" className="form-control" required style={{ fontSize: '0.85rem' }} />
                <input name="option_b" placeholder="Opsi B" className="form-control" required style={{ fontSize: '0.85rem' }} />
                <input name="option_c" placeholder="Opsi C" className="form-control" required style={{ fontSize: '0.85rem' }} />
                <input name="option_d" placeholder="Opsi D" className="form-control" required style={{ fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select name="correct_answer" className="form-control" required style={{ flex: 1, fontSize: '0.85rem' }}>
                  <option value="">-- Jawaban --</option>
                  <option value="a">Opsi A</option>
                  <option value="b">Opsi B</option>
                  <option value="c">Opsi C</option>
                  <option value="d">Opsi D</option>
                </select>
                <button type="submit" disabled={isPending} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem' }}>
                  {isPending ? '...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <form
          action={async (formData) => {
            startTransition(async () => {
              await createExamAction(formData)
            })
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Modul ini belum memiliki ujian akhir. Buat sekarang untuk mengaktifkan fitur sertifikat.
          </p>
          <input type="hidden" name="module_id" value={moduleId} />
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Judul Ujian</label>
            <input name="title" defaultValue="Ujian Akhir Modul" className="form-control" required />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Passing Score (%)</label>
            <input name="passing_score" type="number" defaultValue="75" className="form-control" required />
          </div>
          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
            {isPending ? 'Membuat...' : 'Buat Ujian Sekarang'}
          </button>
        </form>
      )}
    </div>
  )
}
