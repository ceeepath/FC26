import { useState } from 'react'
import { generateId } from '../utils/storage'

const STAGES = [
  { key: 'group',   label: 'Group Stage',   icon: '📋' },
  { key: 'quarter', label: 'Quarter Finals', icon: '⚔️' },
  { key: 'semi',    label: 'Semi Finals',    icon: '🔥' },
  { key: 'final',   label: 'Final',          icon: '🏆' },
]

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

function roundRobin(ids) {
  const pairs = []
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      pairs.push([ids[i], ids[j]])
  return pairs
}

export default function FixtureSetup({
  players, groups, fixtures, setFixtures,
  fixtureConfig, setFixtureConfig,
  fixturesLocked, setFixturesLocked,
  isAdmin
}) {
  const [view, setView] = useState('group')

  const fixturesGenerated = fixtures.length > 0
  const totalFixtures = fixtures.filter(f => f.type === 'group').length
  const playedFixtures = fixtures.filter(f => f.type === 'group' && f.played).length
  const allPlayed = fixturesGenerated && playedFixtures === totalFixtures

  function playerName(id) {
    return players.find(p => p.id === id)?.name ?? '???'
  }

  function setLeg(stage, value) {
    setFixtureConfig(prev => ({ ...prev, [stage]: value }))
  }

  function generateGroupFixtures() {
    const resultsEntered = fixtures.filter(f => f.played).length
    const msg = resultsEntered > 0
      ? `⚠️ ${resultsEntered} result${resultsEntered !== 1 ? 's have' : ' has'} already been entered. Regenerating will delete them. Continue?`
      : 'Generate group stage fixtures now?'
    if (!window.confirm(msg)) return

    const newFixtures = []
    groups.forEach(group => {
      const validIds = group.playerIds.filter(id => players.some(p => p.id === id))
      const pairs = roundRobin(validIds).sort(() => Math.random() - 0.5)
      const legs = fixtureConfig.group === 2 ? 2 : 1

      pairs.forEach((pair, pairIdx) => {
        newFixtures.push({
          id: generateId(), type: 'group', groupId: group.id,
          leg: 1, homeId: pair[0], awayId: pair[1],
          homeScore: null, awayScore: null, played: false, pairIdx,
        })
        if (legs === 2) {
          newFixtures.push({
            id: generateId(), type: 'group', groupId: group.id,
            leg: 2, homeId: pair[1], awayId: pair[0],
            homeScore: null, awayScore: null, played: false, pairIdx,
          })
        }
      })
    })

    setFixtures(newFixtures)
    setFixturesLocked(false)
  }

  function resetFixtures() {
    if (!window.confirm('Reset ALL fixtures? This cannot be undone.')) return
    setFixtures([])
    setFixturesLocked(false)
  }

  function handleLock() {
    if (!window.confirm('Lock fixtures? Regeneration will be disabled. Score entry will still work normally.')) return
    setFixturesLocked(true)
  }

  function handleUnlock() {
    if (!window.confirm('Unlock fixtures? This will allow regeneration again.')) return
    setFixturesLocked(false)
  }

  const fixturesByGroup = groups.map(group => ({
    group,
    color: GROUP_COLORS[group.colorIdx % GROUP_COLORS.length],
    leg1: fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.leg === 1),
    leg2: fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.leg === 2),
    all:  fixtures.filter(f => f.type === 'group' && f.groupId === group.id),
  }))

  const maxFixturesPerGroup = Math.max(0, ...fixturesByGroup.map(g => g.all.length))
  const rounds = Array.from({ length: maxFixturesPerGroup }, (_, roundIdx) => ({
    roundNum: roundIdx + 1,
    matches: fixturesByGroup
      .map(({ group, color, all }) => ({
        group, color, fixture: all[roundIdx] ?? null
      }))
      .filter(m => m.fixture !== null),
  }))

  return (
    <div className="fade-up">
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

      {fixturesLocked && (
        <div style={{
          background: '#0a1f0a', border: '1px solid #2a5a2a', borderLeft: '3px solid #4caf50',
          borderRadius: 10, padding: '12px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
              <p style={{ fontWeight: 700, color: '#4caf50', fontSize: 14 }}>Fixtures are locked</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Regeneration is disabled. Score entry is still open.</p>
            </div>
          </div>
          {isAdmin && (
            <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={handleUnlock}>
              Unlock
            </button>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
            🎛️ LEG CONFIGURATION
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
            Set 1 or 2 legs for each stage. 2 legs means each pair plays home <em>and</em> away.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {STAGES.map(stage => (
              <div key={stage.key} style={{
                background: '#050e05', border: '1px solid var(--green-border)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{stage.icon}</span> {stage.label}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2].map(n => (
                    <button key={n} onClick={() => setLeg(stage.key, n)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      border: `1px solid ${fixtureConfig[stage.key] === n ? 'var(--gold)' : 'var(--green-border)'}`,
                      background: fixtureConfig[stage.key] === n ? '#2a1f00' : 'transparent',
                      color: fixtureConfig[stage.key] === n ? 'var(--gold)' : 'var(--text-muted)',
                      fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
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

          <div style={{ marginTop: 16, padding: '12px 16px', background: '#0a1a0a', borderRadius: 8, border: '1px solid var(--green-border)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              📊 <strong style={{ color: 'var(--text-primary)' }}>Group stage preview:</strong>{' '}
              {groups.map(g => {
                const n = g.playerIds.filter(id => players.some(p => p.id === id)).length
                const matches = ((n * (n - 1)) / 2) * fixtureConfig.group
                return `${g.name}: ${matches} match${matches !== 1 ? 'es' : ''}`
              }).join(' · ') || 'No groups yet'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {!fixturesLocked && (
              <>
                <button className="btn-gold" onClick={generateGroupFixtures}>
                  {fixturesGenerated ? '🔄 Regenerate Fixtures' : '⚽ Generate Group Fixtures'}
                </button>
                {fixturesGenerated && (
                  <button className="btn-danger" style={{ padding: '10px 18px' }} onClick={resetFixtures}>
                    🗑️ Reset All Fixtures
                  </button>
                )}
              </>
            )}
            {fixturesGenerated && !fixturesLocked && (
              <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={handleLock}>
                🔒 Lock Fixtures
              </button>
            )}
            {allPlayed && (
              <span style={{
                background: '#0a1f0a', border: '1px solid #2a5a2a', color: '#4caf50',
                fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 8,
              }}>
                ✅ Group Stage Complete
              </span>
            )}
          </div>
        </div>
      )}

      {fixturesGenerated && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'group', label: '📋 By Group' },
            { id: 'round', label: '🔄 By Round' },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'Barlow', fontWeight: 700, fontSize: 13,
              border: `1px solid ${view === v.id ? 'var(--gold)' : 'var(--green-border)'}`,
              background: view === v.id ? '#2a1f00' : 'transparent',
              color: view === v.id ? 'var(--gold)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      {!fixturesGenerated && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {isAdmin ? 'Configure legs above then click Generate Group Fixtures.' : 'Fixtures have not been generated yet.'}
          </p>
        </div>
      )}

      {fixturesGenerated && view === 'group' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {fixturesByGroup.map(({ group, color, leg1, leg2, all }) => {
            if (all.length === 0) return null
            const legs = fixtureConfig.group
            return (
              <div key={group.id} style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: color.label }}>{group.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {all.length} fixture{all.length !== 1 ? 's' : ''} · {legs === 2 ? '2 legs' : '1 leg'}
                  </span>
                </div>
                <div style={{ padding: '12px 18px' }}>
                  {legs === 2 ? (
                    <>
                      <FixtureBlock label="🏠 LEG 1" fixtures={leg1} playerName={playerName} color={color} />
                      <div style={{ height: 12 }} />
                      <FixtureBlock label="✈️ LEG 2" fixtures={leg2} playerName={playerName} color={color} />
                    </>
                  ) : (
                    <FixtureBlock label="" fixtures={all} playerName={playerName} color={color} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {fixturesGenerated && view === 'round' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {rounds.map(({ roundNum, matches }) => (
            <div key={roundNum} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '12px 18px', borderBottom: '1px solid var(--green-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: 'var(--gold)' }}>
                  ROUND {roundNum}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {matches.filter(m => m.fixture.played).length}/{matches.length} played
                </span>
              </div>
              <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matches.map(({ group, color, fixture }) => (
                  <div key={fixture.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: color.bg, border: `1px solid ${color.border}`, borderRadius: 8,
                  }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 1, color: color.label, minWidth: 72, opacity: 0.85 }}>
                      {group.name}
                      {fixtureConfig.group === 2 && (
                        <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.6 }}>L{fixture.leg}</span>
                      )}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14, textAlign: 'right' }}>
                      {playerName(fixture.homeId)}
                    </span>
                    <div style={{
                      padding: '4px 12px', minWidth: 60, textAlign: 'center',
                      background: fixture.played ? '#1a2e00' : '#0a140a',
                      border: `1px solid ${fixture.played ? '#3a6a00' : color.border}`, borderRadius: 6,
                    }}>
                      {fixture.played
                        ? <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, color: '#a0d060', letterSpacing: 2 }}>{fixture.homeScore} – {fixture.awayScore}</span>
                        : <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: 'var(--text-muted)', letterSpacing: 2 }}>VS</span>
                      }
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
                      {playerName(fixture.awayId)}
                    </span>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: fixture.played ? '#4caf50' : '#3a3a3a',
                    }} title={fixture.played ? 'Played' : 'Pending'} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FixtureBlock({ label, fixtures, playerName, color }) {
  return (
    <div>
      {label && (
        <p style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 2, color: color.label, marginBottom: 8, opacity: 0.8 }}>
          {label}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fixtures.map((fixture, idx) => (
          <div key={fixture.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', background: 'rgba(0,0,0,0.25)',
            borderRadius: 8, border: `1px solid ${color.border}30`,
          }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 13, color: color.label, opacity: 0.5, minWidth: 24 }}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14, textAlign: 'right' }}>
              {playerName(fixture.homeId)}
            </span>
            <div style={{
              padding: '4px 12px', minWidth: 60, textAlign: 'center',
              background: fixture.played ? '#1a2e00' : '#0a140a',
              border: `1px solid ${fixture.played ? '#3a6a00' : color.border}`, borderRadius: 6,
            }}>
              {fixture.played
                ? <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, color: '#a0d060', letterSpacing: 2 }}>{fixture.homeScore} – {fixture.awayScore}</span>
                : <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: 'var(--text-muted)', letterSpacing: 2 }}>VS</span>
              }
            </div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
              {playerName(fixture.awayId)}
            </span>
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