import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'

export default function Placeholder({ title, desc, icon: Icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title={title} />
      <main style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '480px' }}>
          {Icon && <Icon size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />}
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {desc || 'Cette section est en cours de développement.'}
          </p>
        </Card>
      </main>
    </div>
  )
}
