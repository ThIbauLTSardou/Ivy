export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default:  { bg: 'var(--surface-2)',  color: 'var(--text-secondary)', border: 'var(--border)' },
    green:    { bg: 'var(--brand-muted)', color: 'var(--brand)',         border: '#3ecf8e44' },
    warning:  { bg: '#f59e0b22',          color: 'var(--warning)',        border: '#f59e0b44' },
    error:    { bg: '#ef444422',          color: 'var(--error)',          border: '#ef444444' },
    info:     { bg: '#3b82f622',          color: 'var(--info)',           border: '#3b82f644' },
  }
  const v = variants[variant] || variants.default
  const fontSize = size === 'sm' ? '11px' : '12px'
  const padding = size === 'sm' ? '1px 5px' : '2px 8px'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize,
      fontWeight: '500',
      padding,
      borderRadius: '4px',
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
