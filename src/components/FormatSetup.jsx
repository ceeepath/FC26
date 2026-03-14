export default function FormatSetup({ onSelect }) {
  const formats = [
    {
      id: 'tournament',
      icon: '🏆',
      title: 'TOURNAMENT',
      subtitle: 'Group Stage + Knockout',
      description: 'Players are split into groups for a round-robin group stage. Top players from each group advance to a knockout bracket — Quarter Finals, Semi Finals, and a Final to crown the champion.',
      features: ['Group stage with standings', 'Qualification & wildcards', 'Knockout bracket', 'Champion ceremony'],
      accent: 'var(--gold)',
      accentRgb: '212,175,55',
    },
    {
      id: 'league',
      icon: '📊',
      title: 'LEAGUE',
      subtitle: 'Full Round Robin',
      description: 'All players compete against each other in a full round robin — everyone plays everyone. Final league standings determine the winner. No groups, no knockouts, just pure points.',
      features: ['Everyone plays everyone', 'Full standings table', 'Points-based champion', 'No elimination rounds'],
      accent: 'var(--card-blue)',
      accentRgb: '109,140,166',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--bg-main)',
    }}>
      <div style={{ width: '100%', maxWidth: 760 }} className="fade-up">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 42,
            letterSpacing: 2, lineHeight: 1, marginBottom: 10,
            background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            EA26 TOURNAMENT MANAGER
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', letterSpacing: 1 }}>
            TNC · FIFA PS5
          </p>
          <div style={{ marginTop: 20, padding: '10px 20px', display: 'inline-block', borderRadius: 999, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Choose your competition format to get started. <strong style={{ color: 'var(--text-primary)' }}>This cannot be changed later.</strong>
            </p>
          </div>
        </div>

        {/* Format cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
          {formats.map(f => (
            <div
              key={f.id}
              onClick={() => {
                if (window.confirm(`Start a ${f.title} competition? This format cannot be changed once selected.`)) {
                  onSelect(f.id)
                }
              }}
              style={{
                borderRadius: 20, padding: 24, cursor: 'pointer',
                background: `linear-gradient(160deg, rgba(${f.accentRgb},0.08), rgba(16,29,23,0.97))`,
                border: `1px solid rgba(${f.accentRgb},0.25)`,
                boxShadow: `0 8px 32px rgba(${f.accentRgb},0.08)`,
                transition: 'all 0.2s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 16px 48px rgba(${f.accentRgb},0.18)`
                e.currentTarget.style.borderColor = `rgba(${f.accentRgb},0.5)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(${f.accentRgb},0.08)`
                e.currentTarget.style.borderColor = `rgba(${f.accentRgb},0.25)`
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 120, height: 120, borderRadius: '50%',
                background: `radial-gradient(circle, rgba(${f.accentRgb},0.15), transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0,
                  background: `rgba(${f.accentRgb},0.12)`,
                  border: `1px solid rgba(${f.accentRgb},0.25)`,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Barlow Condensed', fontWeight: 700,
                    fontSize: 26, letterSpacing: 2, color: f.accent, lineHeight: 1,
                  }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, letterSpacing: 0.5 }}>
                    {f.subtitle}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 18 }}>
                {f.description}
              </p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
                {f.features.map(feat => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.accent, flexShrink: 0, opacity: 0.8 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                width: '100%', padding: '11px 0', borderRadius: 12, textAlign: 'center',
                background: `rgba(${f.accentRgb},0.12)`,
                border: `1px solid rgba(${f.accentRgb},0.3)`,
                fontFamily: 'Barlow Condensed', fontWeight: 700,
                fontSize: 15, letterSpacing: 1.5, color: f.accent,
              }}>
                SELECT {f.title} →
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          You can start a new competition with a different format by resetting all data in Settings.
        </p>
      </div>
    </div>
  )
}