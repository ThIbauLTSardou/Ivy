export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight,
  disabled,
  onClick,
  style,
  type = 'button',
}) {
  const sizes = {
    sm: { padding: '5px 10px', fontSize: '13px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '10px 20px', fontSize: '15px' },
  }
  const s = sizes[size] || sizes.md

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    ...s,
  }

  const variants = {
    primary: {
      background: 'var(--brand)',
      color: '#000',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: '#ef444422',
      color: 'var(--error)',
      border: '1px solid #ef444444',
    },
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = 'var(--brand-hover)'
        if (variant === 'secondary') { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }
        if (variant === 'ghost') e.currentTarget.style.background = 'var(--surface-2)'
      }}
      onMouseLeave={e => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = 'var(--brand)'
        if (variant === 'secondary') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-strong)' }
        if (variant === 'ghost') e.currentTarget.style.background = 'transparent'
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <iconRight size={14} />}
    </button>
  )
}
