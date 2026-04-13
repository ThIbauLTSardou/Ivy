import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      {/* Bouton toggle en dehors de la sidebar pour ne jamais être masqué */}
      <button
        className="app-layout-toggle"
        onClick={() => setCollapsed(v => !v)}
        style={{
          position: 'fixed',
          top: '16px',
          left: sidebarWidth - 14,
          zIndex: 100,
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-strong)',
          borderRadius: '6px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'left 0.2s ease, background 0.15s, color 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        title={collapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>
      <div className="app-content" style={{ marginLeft: sidebarWidth, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'margin-left 0.2s ease' }}>
        <Outlet />
      </div>
    </div>
  )
}
