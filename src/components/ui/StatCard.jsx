import Badge from './Badge'

export default function StatCard({ label, value, delta, deltaLabel, icon: Icon, accent }) {
  const positive = delta > 0
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</span>
        {Icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: accent ? 'var(--brand-muted)' : 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={16} style={{ color: accent ? 'var(--brand)' : 'var(--text-muted)' }} />
          </div>
        )}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {value}
      </div>
      {delta !== undefined && (
        <Badge variant={positive ? 'green' : 'error'}>
          {positive ? '↑' : '↓'} {Math.abs(delta)}% {deltaLabel || 'vs mois dernier'}
        </Badge>
      )}
    </div>
  )
}
