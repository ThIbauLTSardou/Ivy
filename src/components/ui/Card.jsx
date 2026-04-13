export default function Card({ children, style, hoverable = false, glow = false, onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      {...rest}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        transition: 'border-color 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: glow ? '0 0 30px var(--brand-muted), 0 0 60px #3ecf8e11' : 'none',
        ...style,
      }}
      onMouseEnter={hoverable ? e => e.currentTarget.style.borderColor = 'var(--border-strong)' : undefined}
      onMouseLeave={hoverable ? e => e.currentTarget.style.borderColor = 'var(--border)' : undefined}
    >
      {children}
    </div>
  )
}
