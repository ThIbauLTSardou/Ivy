import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, HardHat, FileText, Calendar,
  Package, Mic, Brain, BarChart3, Settings, Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Chantiers', icon: HardHat, path: '/chantiers' },
  { label: 'Devis', icon: FileText, path: '/devis' },
  { label: 'Calendrier', icon: Calendar, path: '/calendrier' },
  { label: 'Stock & Matériaux', icon: Package, path: '/stock' },
]

const aiItems = [
  { label: 'Ivy Voice', icon: Mic, path: '/ivy-voice', badge: 'IA' },
  { label: 'Vision Devis', icon: Brain, path: '/vision-devis', badge: 'IA' },
  { label: 'Relances', icon: Zap, path: '/relances', badge: 'IA' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const w = collapsed ? 64 : 240

  return (
    <aside className="app-sidebar" style={{
      width: w,
      minHeight: '100vh',
      background: 'var(--surface-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 18px' : '0 18px',
        borderBottom: '1px solid var(--border)',
        gap: '10px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          background: 'var(--brand)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '14px',
          color: '#000',
          letterSpacing: '-0.03em',
          flexShrink: 0,
        }}>I</div>

        {!collapsed && (
          <>
            <span style={{
              fontWeight: '700',
              fontSize: '16px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}>Ivy</span>
            <span style={{
              fontSize: '11px',
              fontWeight: '500',
              color: 'var(--brand)',
              background: 'var(--brand-muted)',
              border: '1px solid #3ecf8e33',
              padding: '1px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}>BTP</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && <SectionLabel label="Navigation" />}
        {navItems.map(item => <NavItem key={item.path} {...item} collapsed={collapsed} />)}

        {!collapsed && <SectionLabel label="Intelligence IA" style={{ marginTop: '20px' }} />}
        {collapsed && <div style={{ height: '12px' }} />}
        {aiItems.map(item => <NavItem key={item.path} {...item} collapsed={collapsed} />)}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <NavItem label="Paramètres" icon={Settings} path="/settings" collapsed={collapsed} />
        {!collapsed && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'var(--brand-muted)',
            border: '1px solid #3ecf8e33',
            borderRadius: '6px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--brand)', marginBottom: '2px' }}>
              Plan Pro
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              3 utilisateurs · 12 chantiers
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

function SectionLabel({ label, style }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: '500',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      padding: '4px 12px 8px',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {label}
    </div>
  )
}

function NavItem({ label, icon: Icon, path, badge, collapsed }) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '10px',
        padding: collapsed ? '9px 0' : '8px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        fontWeight: '500',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--surface-2)' : 'transparent',
        border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
        marginBottom: '2px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      })}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge && (
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          color: 'var(--brand)',
          background: 'var(--brand-muted)',
          border: '1px solid #3ecf8e33',
          padding: '1px 5px',
          borderRadius: '3px',
        }}>{badge}</span>
      )}
    </NavLink>
  )
}
