'use client'

import { useActionState, useState, useMemo } from 'react'
import { createEnrollmentAction } from './actions'

interface Props {
  teachers: { id: string; username: string }[]
  students: { id: string; username: string }[]
  modules: { id: string; title: string }[]
  teacherModules: { teacher_id: string; module_id: string }[]
}

const initialState = { success: false, message: '', error: '' }

export default function EnrollmentForm({ teachers, students, modules, teacherModules }: Props) {
  const [state, formAction, pending] = useActionState(createEnrollmentAction, initialState)
  const [selectedModuleId, setSelectedModuleId] = useState('')

  // Filter teachers based on selected module
  const filteredTeachers = useMemo(() => {
    if (!selectedModuleId) return teachers
    const assignedTeacherIds = teacherModules
      .filter(tm => tm.module_id === selectedModuleId)
      .map(tm => tm.teacher_id)
    
    // If no teachers are assigned to this specific module yet, show all to prevent blocking
    if (assignedTeacherIds.length === 0) return teachers

    return teachers.filter(t => assignedTeacherIds.includes(t.id))
  }, [selectedModuleId, teachers, teacherModules])

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-success)' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>Buat Kelas Baru</h2>
      
      {state.success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          ✅ {state.message}
        </div>
      )}
      {state.error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
           ❌ {state.error}
        </div>
      )}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div className="form-control">
          <label className="label">Pilih Modul Belajar 📚</label>
          <select 
            name="module_id" 
            className="input" 
            required 
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
          >
            <option value="">-- Pilih Modul --</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">Pilih Guru 🍎</label>
          <select name="teacher_id" className="input" required>
            <option value="">-- Pilih Guru --</option>
            {filteredTeachers.map(t => (
              <option key={t.id} value={t.id}>@{t.username}</option>
            ))}
          </select>
          {selectedModuleId && filteredTeachers.length < teachers.length && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
              💡 Menampilkan guru yang ditugaskan untuk modul ini.
            </p>
          )}
        </div>

        <div className="form-control">
          <label className="label">Pilih Siswa 🎓</label>
          <select name="student_id" className="input" required>
            <option value="">-- Pilih Siswa --</option>
            {students.map(s => <option key={s.id} value={s.id}>@{s.username}</option>)}
          </select>
        </div>

        <div className="form-control">
          <label className="label">Default Zoom Link (Opsional)</label>
          <input type="url" name="zoom_link" className="input" placeholder="https://zoom.us/j/..." />
        </div>

        <button type="submit" className="btn btn-primary" disabled={pending} style={{ marginTop: '0.5rem' }}>
          {pending ? 'Menyimpan...' : 'Ciptakan Kelas 🚀'}
        </button>
      </form>
    </div>
  )
}
