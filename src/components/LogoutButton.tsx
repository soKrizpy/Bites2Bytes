'use client'

import { logoutAction } from '@/app/auth/actions'

export default function LogoutButton() {
  return (
    <button 
      onClick={() => logoutAction()} 
      className="btn" 
      style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
    >
      Log Out
    </button>
  )
}
