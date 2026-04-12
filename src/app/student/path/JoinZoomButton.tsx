'use client'

import { joinZoomAction } from '../actions'

interface Props {
  enrollmentId: string
  topicId: string
  zoomLink: string
}

export default function JoinZoomButton({ enrollmentId, topicId, zoomLink }: Props) {
  const handleJoin = async () => {
    // Log attendance
    await joinZoomAction(enrollmentId, topicId)
    // Open zoom
    window.open(zoomLink, '_blank')
  }

  return (
    <button onClick={handleJoin} className="btn" style={{ backgroundColor: '#4f46e5', color: 'white' }}>
      📹 Join Zoom (Absen Sah!)
    </button>
  )
}
