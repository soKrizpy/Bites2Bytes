'use client'

import { useState, useTransition } from 'react'
import { assignModuleToTeacherAction, unassignModuleFromTeacherAction } from '../actions'

interface Props {
  teacherId: string
  assignedModules: { id: string, title: string }[]
  allModules: { id: string, title: string }[]
}

export default function ModuleAssignment({ teacherId, assignedModules, allModules }: Props) {
  const [isPending, startTransition] = useTransition()
  const [selectedModuleId, setSelectedModuleId] = useState('')

  const handleAssign = () => {
    if (!selectedModuleId) return
    startTransition(async () => {
      await assignModuleToTeacherAction(teacherId, selectedModuleId)
      setSelectedModuleId('')
    })
  }

  const handleUnassign = (moduleId: string) => {
    if (!confirm('Lepaskan modul dari guru ini?')) return
    startTransition(async () => {
      await unassignModuleFromTeacherAction(teacherId, moduleId)
    })
  }

  // Filter out already assigned modules from the dropdown
  const availableModules = allModules.filter(m => !assignedModules.some(am => am.id === m.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {assignedModules.length === 0 ? (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Belum ada modul.</span>
        ) : (
          assignedModules.map(m => (
            <span key={m.id} className="chip chip-info" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              {m.title}
              <button 
                onClick={() => handleUnassign(m.id)}
                disabled={isPending}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.9rem', color: 'inherit' }}
                title="Hapus"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
        <select 
          value={selectedModuleId}
          onChange={(e) => setSelectedModuleId(e.target.value)}
          disabled={isPending || availableModules.length === 0}
          style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem', backgroundColor: '#fff', flex: 1 }}
        >
          <option value="">+ Assign Modul</option>
          {availableModules.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        <button 
          onClick={handleAssign}
          disabled={isPending || !selectedModuleId}
          className="btn btn-primary"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
        >
          {isPending ? '...' : 'Add'}
        </button>
      </div>
    </div>
  )
}
