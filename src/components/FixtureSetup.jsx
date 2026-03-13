import { generateId } from '../utils/storage'

const STAGES = [
  { key: 'group',   label: 'Group Stage',   icon: '📋' },
  { key: 'quarter', label: 'Quarter Finals', icon: '⚔️' },
  { key: 'semi',    label: 'Semi Finals',    icon: '🔥' },
  { key: 'final',   label: 'Final',          icon: '🏆' },
]

// Generate all round-robin pairs for a list of IDs
function roundRobin(ids) {
  const pairs = []
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      pairs.push([ids[i], ids[j]])
  return pairs
}

export default function FixtureSetup({
  players, groups, fixtures, setFixtures,
  fixtureConfig, setFixtureConfig, isAdmin
}) {
  const fixturesGenerated = fixtures.length > 0

  function setLeg(stage, value) {
    setFixtureConfig(prev => ({ ...prev, [stage]: value }))
  }

  function generateGroupFixtures() {
    if (!window.confirm(
      fixturesGenerated
        ? 'This will DELETE all existing fixtures and regenerate. Any entered results will be lost. Continue?'
        : 'Generate group stage fixtures now?'
    )) return

    const newFixtures = []

    groups.forEach(group => {
      // Filter to only valid player IDs, then shuffle for random fixture order
      const validIds = group.playerIds.filter(id => players.some(p => p.id === id)).sort(() => Math.random() - 0.5)
      const pairs = roundRobin(validIds)
      const legs = fixtureConfig.group === 2 ? 2 : 1

      pairs.forEach((pair, pairIdx) => {
        // Leg 1
        newFixtures.push({
          id: generateId(),
          type: 'group',
          groupId: group.id,
          leg: 1,
          homeId: pair[0],
          awayId: pair[1],
          homeScore: null,
          awayScore: null,
          played: false,
          pairIdx,
        })
        // Leg 2 — reverse home/away
        if (legs === 2) {
          newFixtures.push({
            id: generateId(),
            type: 'group',
            groupId: group.id,
            leg: 2,
            homeId: pair[1],
            awayId: pair[0],
            homeScore: null,
            awayScore: null,
            played: false,
            pairIdx,
          })
        }
      })
    })

    setFixtures(newFixtures)
  }

  function resetFixtures() {
    if (!window.confirm('Reset ALL fixtures? This cannot be undone.')) return
    setFixtures([])
  }

  // Group fixtures by groupId
  const fixturesByGroup = groups.map(group => ({
    group,
    fixtures: fixtures.filter(f => f.type === 'group' && f.groupId === group.id),
  }))

  const GROUP_COLORS = [
    { border: '#c9960f', bg: '#1a1200', label: 'var(--gold)' },
    { border: '#1a7a4a', bg: '#001a0e', label: '#4cdf8a' },
    { border: '#1a4a9a', bg: '#00081a', label: '#6aaeff' },
    { border: '#8a1a8a', bg: '#150015', label: '#e07ae0' },
    { border: '#9a4a1a', bg: '#1a0800', label: '#f0a060' },
    { border: '#1a7a7a', bg: '#001515', label: '#60e0e0' },
    { border: '#6a1a1a', bg: '#180000', label: '#e06060' },
    { border: '#4a6a1a', bg: '#0a1400', label: '#a0d060' },
  ]

  function playerName(id) {
    return players.find(p => p.id === id)?.name ?? '???'
  }

  // Count stats for summary
  const totalFixtures = fixtures.filter(f => f.type === 'group').length
  const playedFixtures = fixtures.filter(f => f.type === 'group' && f.played).length

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          FIXTURES
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {fixturesGenerated
            ? `${totalFixtures} group stage fixture${totalFixtures !== 1 ? 's' : ''} · ${playedFixtures} played · ${totalFixtures - playedFixtures} remaining`
            : 'Configure legs per stage then generate fixtures.'}
        </p>
      </div>

      {/* ── Leg Configuration ── */}
      {isAdmin && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
            🎛️ LEG CONFIGURATION
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
            Set 1 or 2 legs for each stage. In a 2-leg fixture, each pair plays home <em>and</em> away — doubling the number of matches.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {STAGES.map(stage => (
              <div key={stage.key} style={{
                background: '#050e05',
                border: '1px solid var(--green-border)',
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{stage.icon}</span> {stage.label}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2].map(n => (
                    <button
                      key={n}
                      onClick={() => setLeg(stage.key, n)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: `1px solid ${fixtureConfig[stage.key] === n ? 'var(--gold)' : 'var(--green-border)'}`,
                        background: fixtureConfig[stage.key] === n ? '#2a1f00' : 'transparent',
                        color: fixtureConfig[stage.key] === n ? 'var(--gold)' : 'var(--text-muted)',
                        fontFamily: 'Bebas Neue',
                        fontSize: 18,
                        letterSpacing: 1,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                  {fixtureConfig[stage.key] === 2 ? '2 legs · home & away' : '1 leg · single match'}
                </p>
              </div>
            ))}
          </div>

          {/* Matches preview */}
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#0a1a0a',
            borderRadius: 8,
            border: '1px solid var(--green-border)',
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              📊 <strong style={{ color: 'var(--text-primary)' }}>Group stage preview:</strong>{' '}
              {groups.map(g => {
                const n = g.playerIds.filter(id => players.some(p => p.id === id)).length
                const pairs = (n * (n - 1)) / 2
                const matches = pairs * fixtureConfig.group
                return `${g.name}: ${matches} match${matches !== 1 ? 'es' : ''}`
              }).join(' · ') || 'No groups yet'}
            </p>
          </div>

          {/* Generate / Reset buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn-gold" onClick={generateGroupFixtures}>
              {fixturesGenerated ? '🔄 Regenerate Fixtures' : '⚽ Generate Group Fixtures'}
            </button>
            {fixturesGenerated && (
              <button className="btn-danger" style={{ padding: '10px 18px' }} onClick={resetFixtures}>
                🗑️ Reset All Fixtures
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Fixture List ── */}
      {!fixturesGenerated ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {isAdmin
              ? 'Configure legs above then click Generate Group Fixtures.'
              : 'Fixtures have not been generated yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {fixturesByGroup.map(({ group, fixtures: gFixtures }) => {
            if (gFixtures.length === 0) return null
            const color = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length]
            const legs = fixtureConfig.group

            // Group fixtures by leg if 2 legs
            const leg1 = gFixtures.filter(f => f.leg === 1)
            const leg2 = gFixtures.filter(f => f.leg === 2)

            return (
              <div key={group.id} style={{
                background: color.bg,
                border: `1px solid ${color.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {/* Group header */}
                <div style={{
                  padding: '12px 18px',
                  borderBottom: `1px solid ${color.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: color.label }}>
                    {group.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {gFixtures.length} fixture{gFixtures.length !== 1 ? 's' : ''}
                    {legs === 2 ? ' · 2 legs' : ' · 1 leg'}
                  </span>
                </div>

                <div style={{ padding: '12px 18px' }}>
                  {legs === 2 ? (
                    <>
                      <FixtureLegBlock label="🏠 LEG 1" fixtures={leg1} playerName={playerName} color={color} />
                      <div style={{ height: 12 }} />
                      <FixtureLegBlock label="✈️ LEG 2" fixtures={leg2} playerName={playerName} color={color} />
                    </>
                  ) : (
                    <FixtureLegBlock label="" fixtures={leg1} playerName={playerName} color={color} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FixtureLegBlock({ label, fixtures, playerName, color }) {
  return (
    <div>
      {label && (
        <p style={{
          fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 2,
          color: color.label, marginBottom: 8, opacity: 0.8
        }}>
          {label}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fixtures.map((fixture, idx) => (
          <div key={fixture.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 8,
            border: `1px solid ${color.border}30`,
          }}>
            {/* Match number */}
            <span style={{
              fontFamily: 'Bebas Neue', fontSize: 13,
              color: color.label, opacity: 0.5, minWidth: 24
            }}>
              {String(idx + 1).padStart(2, '0')}
            </span>

            {/* Home player */}
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14, textAlign: 'right' }}>
              {playerName(fixture.homeId)}
            </span>

            {/* Score / VS badge */}
            <div style={{
              padding: '4px 12px',
              background: fixture.played ? '#1a2e00' : '#0a140a',
              border: `1px solid ${fixture.played ? '#3a6a00' : color.border}`,
              borderRadius: 6,
              minWidth: 60,
              textAlign: 'center',
            }}>
              {fixture.played ? (
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, color: fixture.played ? '#a0d060' : 'var(--text-muted)', letterSpacing: 2 }}>
                  {fixture.homeScore} – {fixture.awayScore}
                </span>
              ) : (
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: 'var(--text-muted)', letterSpacing: 2 }}>
                  VS
                </span>
              )}
            </div>

            {/* Away player */}
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
              {playerName(fixture.awayId)}
            </span>

            {/* Status dot */}
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: fixture.played ? '#4caf50' : '#3a3a3a',
            }} title={fixture.played ? 'Played' : 'Pending'} />
          </div>
        ))}
      </div>
    </div>
  )
}