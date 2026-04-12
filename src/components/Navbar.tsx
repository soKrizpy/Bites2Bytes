import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

interface NavbarProps {
  role: 'admin' | 'teacher' | 'student'
  username?: string
  photoUrl?: string
}

const roleLabels = {
  admin: { emoji: '👑', label: 'Admin', color: 'var(--color-accent)', links: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/students', label: 'Siswa' },
    { href: '/admin/teachers', label: 'Guru' },
    { href: '/admin/modules', label: 'Modul' },
    { href: '/admin/enrollments', label: 'Enrollment' },
    { href: '/admin/badges', label: 'Badge' },
  ]},
  teacher: { emoji: '🍎', label: 'Guru', color: 'var(--color-primary)', links: [
    { href: '/teacher', label: 'Dashboard' },
    { href: '/teacher/profile', label: 'Profil Saya' },
  ]},
  student: { emoji: '🎓', label: 'Siswa', color: 'var(--color-success)', links: [
    { href: '/student', label: 'Dashboard' },
    { href: '/student/profile', label: 'Profil Saya' },
  ]},
}

export default function Navbar({ role, username, photoUrl }: NavbarProps) {
  const config = roleLabels[role]

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.25rem' }}>
            Bites2<span style={{ color: 'var(--color-secondary)' }}>Bytes</span>
          </span>
        </Link>
        <span className="navbar-role-badge" style={{ backgroundColor: config.color }}>
          {config.emoji} {config.label}
        </span>
      </div>

      <div className="navbar-links">
        {config.links.map(link => (
          <Link key={link.href} href={link.href} className="navbar-link">
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        {photoUrl ? (
          <img src={photoUrl} alt={username} className="navbar-avatar" />
        ) : (
          <div className="navbar-avatar-placeholder">
            {username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span className="navbar-username">{username}</span>
        <LogoutButton />
      </div>
    </nav>
  )
}
