import { Bell, Search, CloudSun, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ title, subtitle }) {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'JD'

  return (
    <header style={{
      height: '60px',
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h1>
            {subtitle && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</span>}
          </div>
        )}
      </div>

      {/* Weather widget */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 10px',
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)',
      }}>
        <CloudSun size={14} style={{ color: 'var(--warning)' }} />
        <span>Paris · 14°C</span>
        <span style={{ color: 'var(--warning)', fontWeight: '500' }}>Pluie J+1</span>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '6px 12px', width: '220px',
      }}>
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input placeholder="Rechercher..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '100%' }} />
        <kbd style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>⌘K</kbd>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={theme === 'dark' ? 'Mode jour' : 'Mode nuit'}
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '7px',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <button style={{
        position: 'relative', background: 'var(--surface-1)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        padding: '7px', display: 'flex', alignItems: 'center',
        color: 'var(--text-secondary)', transition: 'all 0.15s', cursor: 'pointer',
      }}>
        <Bell size={16} />
        <span style={{ position: 'absolute', top: '4px', right: '4px', width: '7px', height: '7px', background: 'var(--brand)', borderRadius: '50%', border: '1.5px solid var(--background)' }} />
      </button>

      {/* Avatar + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '6px',
          background: 'var(--brand-muted)', border: '1px solid var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '600', color: 'var(--brand)', cursor: 'default',
        }}>
          {initials}
        </div>
        <button
          onClick={handleSignOut}
          title="Se déconnecter"
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--error)'; e.currentTarget.style.color = 'var(--error)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
