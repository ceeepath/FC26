import { CopyButton } from './WhatsAppExport'
import { exportGroupStandings } from '../utils/whatsapp'

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

function calcStandings(group, players, fixtures) {
  const groupFixtures = fixtures.filter(f => f.type === 'group' && f.groupId === group.id)
  const validIds = group.playerIds.filter(id => players.some(p => p.id === id))

  const rows = validIds.map(id => {
    const name = players.find(p => p.id === id)?.name ?? '???'
    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0

    groupFixtures.forEach(f => {
      if (!f.played) return
      if (f.homeId === id) {
        P += 1
        GF += f.homeScore
        GA += f.awayScore
        if (f.homeScore > f.awayScore) W += 1
        else if (f.homeScore === f.awayScore) D += 1
        else L += 1
      } else if (f.awayId === id) {
        P += 1
        GF += f.awayScore
        GA += f.homeScore
        if (f.awayScore > f.homeScore) W += 1
        else if (f.awayScore === f.homeScore) D += 1
        else L += 1
      }
    })

    const gameId = players.find(p => p.id === id)?.gameId ?? ''
    return { id, name, gameId, P, W, D, L, GF, GA, GD: GF - GA, Pts: W * 3 + D }
  })

  rows.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name))
  return rows
}

function thStyle(align = 'center') {
  return {
    padding: '11px 12px',
    textAlign: align,
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: 1.1,
    fontFamily: 'Barlow',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  }
}

function tdStyle(align = 'center') {
  return {
    padding: '12px 12px',
    textAlign: align,
    fontSize: 14,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  }
}

function CountStepper({ value, min, max, onChange, disabled }) {
  const btnStyle = {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid var(--green-border)',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        style={{ ...btnStyle, opacity: disabled || value <= min ? 0.35 : 1 }}
      >−</button>
      <div style={{
        minWidth: 44,
        height: 34,
        borderRadius: 10,
        border: '1px solid var(--gold-dim)',
        background: 'rgba(255,215,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Bebas Neue',
        fontSize: 22,
        color: 'var(--gold)',
        letterSpacing: 1,
      }}>
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        style={{ ...btnStyle, opacity: disabled || value >= max ? 0.35 : 1 }}
      >+</button>
    </div>
  )
}

function StatCard({ label, value, sub, accent = 'var(--gold)' }) {
  return (
    <div style={{
      flex: '1 1 180px',
      minWidth: 170,
      padding: 18,
      borderRadius: 16,
      border: '1px solid var(--green-border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 34, color: accent, letterSpacing: 1.5, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>
    </div>
  )
}

export default function GroupStandings({ players, groups, fixtures, qualifierConfig, setQualifierConfig, isAdmin, isLeague }) {
  // In league mode, treat all players as one group
  const effectiveGroups = isLeague
    ? [{ id: 'league', name: 'League Table', colorIdx: 0, playerIds: players.map(p => p.id) }]
    : groups

  const groupFixtures = fixtures.filter(f => f.type === 'group')
  const playedCount = groupFixtures.filter(f => f.played).length
  const totalCount = groupFixtures.length
  const remainingCount = Math.max(0, totalCount - playedCount)
  const completionPct = totalCount ? Math.round((playedCount / totalCount) * 100) : 0

  function getQualifiers(groupId) {
    return qualifierConfig.perGroup?.[groupId] ?? 2
  }

  function setQualifiers(groupId, val) {
    setQualifierConfig(prev => ({
      ...prev,
      perGroup: { ...prev.perGroup, [groupId]: val },
    }))
  }

  const bestLosers = qualifierConfig.bestLosers ?? 0
  function setBestLosers(val) {
    setQualifierConfig(prev => ({ ...prev, bestLosers: val }))
  }

  const allGroupData = effectiveGroups.map(group => ({
    group,
    color: GROUP_COLORS[group.colorIdx % GROUP_COLORS.length],
    rows: calcStandings(group, players, fixtures),
    qualifiers: getQualifiers(group.id),
  }))

  const loserPool = []
  allGroupData.forEach(({ group, rows, qualifiers, color }) => {
    rows.slice(qualifiers).forEach(row => loserPool.push({ ...row, groupName: group.name, color }))
  })
  loserPool.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name))

  const wildcardAdvancers = bestLosers > 0 ? loserPool.slice(0, bestLosers) : []
  const directQualifierCount = allGroupData.reduce((sum, g) => sum + g.qualifiers, 0)
  const totalQualifiers = directQualifierCount + wildcardAdvancers.length
  const completedGroups = allGroupData.filter(({ group }) => {
    const total = fixtures.filter(f => f.type === 'group' && f.groupId === group.id).length
    const played = fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.played).length
    return total > 0 && total === played
  }).length

  return (
    <div className="fade-up">
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 22,
        border: '1px solid var(--green-border)',
        padding: 24,
        marginBottom: 24,
        background: 'radial-gradient(circle at top right, rgba(255,215,0,0.15), transparent 24%), linear-gradient(135deg, rgba(2,20,6,0.98), rgba(8,28,12,0.94) 55%, rgba(24,16,0,0.92))',
        boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.22), transparent 68%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
              marginBottom: 14,
              border: '1px solid rgba(255,215,0,0.28)',
              background: 'rgba(255,215,0,0.08)',
              color: 'var(--gold)',
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              📊 Live table center
            </div>

            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 2.5, color: 'var(--gold)', lineHeight: 1, marginBottom: 10 }}>
              {isLeague ? 'League Table' : 'Group Standings'}
            </h2>
            <p style={{ color: 'var(--text-primary)', fontSize: 15, maxWidth: 650, lineHeight: 1.6, marginBottom: 18 }}>
              {isLeague
                ? 'Full league standings — everyone plays everyone. Final table position decides the champion. Rankings update automatically from match results.'
                : 'Track every group like a proper tournament table. Rankings update automatically from match results, while qualification slots and wildcard spots give you a clean path into the knockout stage.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              {!isLeague && (
                <>
                  <span style={{
                    padding: '8px 12px', borderRadius: 999,
                    border: '1px solid rgba(76,175,80,0.25)',
                    background: 'rgba(76,175,80,0.08)', color: '#7ee08a', fontSize: 12, fontWeight: 700,
                  }}>
                    ✅ Direct qualifiers highlighted
                  </span>
                  {bestLosers > 0 && (
                    <span style={{
                      padding: '8px 12px', borderRadius: 999,
                      border: '1px solid rgba(120,120,255,0.28)',
                      background: 'rgba(120,120,255,0.08)', color: '#a8a8ff', fontSize: 12, fontWeight: 700,
                    }}>
                      🃏 Wildcard race active
                    </span>
                  )}
                  <span style={{
                    padding: '8px 12px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700,
                  }}>
                    {groups.length} group{groups.length !== 1 ? 's' : ''} in play
                  </span>
                </>
              )}
              {isLeague && (
                <span style={{
                  padding: '8px 12px', borderRadius: 999,
                  border: '1px solid rgba(109,140,166,0.28)',
                  background: 'rgba(109,140,166,0.08)', color: 'var(--card-blue)', fontSize: 12, fontWeight: 700,
                }}>
                  🏅 {players.length} players · full round robin
                </span>
              )}
            </div>

            <div style={{ maxWidth: 720 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>{isLeague ? 'League progress' : 'Group stage progress'}</span>
                <span>{playedCount}/{totalCount} matches played</span>
              </div>
              <div style={{ height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                  width: `${completionPct}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #4cdf8a, var(--gold))',
                  boxShadow: '0 0 22px rgba(255,215,0,0.25)',
                }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
            {!isLeague && (
            <div style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(255,215,0,0.18)',
              background: 'rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 8 }}>
                Qualification summary
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', lineHeight: 1, letterSpacing: 1.4 }}>
                {totalQualifiers}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                {directQualifierCount} direct + {wildcardAdvancers.length} wildcard
              </div>
            </div>
            )}

            <CopyButton text={exportGroupStandings(groups, players, fixtures, qualifierConfig)} label="📋 Copy Standings" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Matches played" value={playedCount} sub={`${remainingCount} remaining`} />
        <StatCard label="Completion" value={`${completionPct}%`} sub={totalCount ? 'Based on entered results' : 'No fixtures yet'} accent="#7ee08a" />
        {!isLeague && <StatCard label="Groups settled" value={completedGroups} sub={`${groups.length - completedGroups} still active`} accent="#6aaeff" />}
        {!isLeague && <StatCard label="Wildcard spots" value={bestLosers} sub={bestLosers ? 'Extra qualification enabled' : 'No wildcards set'} accent="#a8a8ff" />}
      </div>

      {isAdmin && !isLeague && (
        <div className="card" style={{ padding: 22, marginBottom: 24, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--gold)', letterSpacing: 1.6, marginBottom: 6 }}>
                Qualification Control Room
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 760, lineHeight: 1.6 }}>
                Set how many players advance directly from each group, then decide whether you want extra wildcard slots for the best losers across the whole tournament.
              </p>
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 14, border: '1px solid var(--green-border)', background: 'rgba(255,255,255,0.03)',
              fontSize: 12, color: 'var(--text-muted)'
            }}>
              Knockout field preview: <strong style={{ color: 'var(--text-primary)' }}>{totalQualifiers}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
            {allGroupData.map(({ group, color, rows, qualifiers }) => (
              <div key={group.id} style={{
                padding: 16,
                borderRadius: 16,
                background: `linear-gradient(180deg, ${color.bg}, rgba(255,255,255,0.02))`,
                border: `1px solid ${color.border}`,
                boxShadow: `inset 0 1px 0 ${color.border}20`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1.8, color: color.label }}>{group.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {rows.length} player{rows.length !== 1 ? 's' : ''} · top {qualifiers} advance
                    </div>
                  </div>
                  <CountStepper
                    value={qualifiers}
                    min={1}
                    max={Math.max(1, rows.length - 1)}
                    onChange={val => setQualifiers(group.id, val)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: 16,
            borderRadius: 16,
            border: '1px solid #2f2f66',
            background: 'linear-gradient(180deg, rgba(16,16,42,0.9), rgba(10,10,28,0.96))',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1.4, color: '#a8a8ff', marginBottom: 6 }}>
                  Best Losers / Wildcards
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 760 }}>
                  Use this when you want extra qualifiers outside the fixed group slots. The table ranks them by points, then goal difference, then goals scored.
                </p>
              </div>
              <CountStepper value={bestLosers} min={0} max={loserPool.length} onChange={setBestLosers} />
            </div>

            {bestLosers > 0 && loserPool.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {loserPool.map((p, i) => {
                  const isIn = i < bestLosers
                  return (
                    <span key={`${p.id}_${i}`} style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      border: `1px solid ${isIn ? '#6b6bff' : '#2b2b45'}`,
                      background: isIn ? 'rgba(120,120,255,0.15)' : 'rgba(255,255,255,0.03)',
                      color: isIn ? '#c9c9ff' : 'var(--text-muted)',
                    }}>
                      {isIn ? '🃏 ' : ''}{p.name}
                      <span style={{ opacity: 0.75 }}> · {p.groupName}</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22,
        padding: '14px 16px', borderRadius: 16, border: '1px solid var(--green-border)', background: 'rgba(255,255,255,0.03)',
        color: 'var(--text-muted)', fontSize: 12,
      }}>
        <span><strong style={{ color: 'var(--text-primary)' }}>P</strong> Played</span>
        <span><strong style={{ color: '#7ee08a' }}>W</strong> Wins</span>
        <span><strong style={{ color: 'var(--gold)' }}>D</strong> Draws</span>
        <span><strong style={{ color: 'var(--danger)' }}>L</strong> Losses</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>GF</strong> Goals For</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>GA</strong> Goals Against</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>GD</strong> Goal Difference</span>
        <span><strong style={{ color: 'var(--gold)' }}>Pts</strong> Points</span>
        <span style={{ marginLeft: 'auto' }}>Ranking order: <strong style={{ color: 'var(--text-primary)' }}>Pts → GD → GF</strong></span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {allGroupData.map(({ group, color, rows, qualifiers }) => {
          const played = fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.played).length
          const total = fixtures.filter(f => f.type === 'group' && f.groupId === group.id).length

          return (
            <div key={group.id} style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${color.border}`,
              background: `linear-gradient(180deg, ${color.bg}, rgba(0,0,0,0.12))`,
              boxShadow: `0 12px 26px rgba(0,0,0,0.18), inset 0 1px 0 ${color.border}25`,
            }}>
              <div style={{
                padding: '16px 18px',
                borderBottom: `1px solid ${color.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: 2, color: color.label }}>{group.name}</span>
                    <span style={{
                      padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      border: `1px solid ${color.border}70`, background: `${color.border}18`, color: color.label,
                    }}>
                      {played}/{total} played
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Top {qualifiers} advance directly{bestLosers > 0 ? ' · wildcard race also active' : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '7px 12px', borderRadius: 999,
                    border: '1px solid rgba(76,175,80,0.28)', background: 'rgba(76,175,80,0.10)', color: '#7ee08a', fontSize: 12, fontWeight: 700,
                  }}>
                    ✅ Direct spots: {qualifiers}
                  </span>
                  {bestLosers > 0 && (
                    <span style={{
                      padding: '7px 12px', borderRadius: 999,
                      border: '1px solid rgba(120,120,255,0.28)', background: 'rgba(120,120,255,0.10)', color: '#c5c5ff', fontSize: 12, fontWeight: 700,
                    }}>
                      🃏 Wildcard watch
                    </span>
                  )}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${color.border}` }}>
                      <th style={thStyle('left')}>#</th>
                      <th style={thStyle('left')}>Player</th>
                      <th style={thStyle()}>P</th>
                      <th style={{ ...thStyle(), color: '#7ee08a' }}>W</th>
                      <th style={{ ...thStyle(), color: 'var(--gold)' }}>D</th>
                      <th style={{ ...thStyle(), color: 'var(--danger)' }}>L</th>
                      <th style={thStyle()}>GF</th>
                      <th style={thStyle()}>GA</th>
                      <th style={thStyle()}>GD</th>
                      <th style={{ ...thStyle(), color: 'var(--gold)' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isDirect = idx < qualifiers
                      const isWildcard = !isDirect && wildcardAdvancers.some(w => w.id === row.id)
                      const isLeader = idx === 0

                      return (
                        <tr key={row.id} style={{
                          background: isDirect
                            ? isLeader ? 'rgba(255,215,0,0.08)' : 'rgba(76,175,80,0.08)'
                            : isWildcard ? 'rgba(120,120,255,0.08)' : 'transparent',
                          borderBottom: `1px solid ${color.border}40`,
                          borderLeft: isDirect ? '4px solid #4caf50' : isWildcard ? '4px solid #6b6bff' : '4px solid transparent',
                        }}>
                          <td style={tdStyle('left')}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: isLeader ? 'var(--gold)' : isDirect ? '#7ee08a' : 'var(--text-muted)' }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td style={{ ...tdStyle('left'), fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                background: isLeader ? 'rgba(255,215,0,0.14)' : isDirect ? 'rgba(76,175,80,0.14)' : isWildcard ? 'rgba(120,120,255,0.14)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${isLeader ? 'rgba(255,215,0,0.32)' : isDirect ? 'rgba(76,175,80,0.28)' : isWildcard ? 'rgba(120,120,255,0.32)' : 'rgba(255,255,255,0.08)'}`,
                                fontSize: 13,
                              }}>
                                {isLeader ? '👑' : isDirect ? '✅' : isWildcard ? '🃏' : '•'}
                              </span>
                              <div>
                                <span style={{ fontWeight: 700 }}>{row.name}</span>
                                {row.gameId && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{row.gameId}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={tdStyle()}>{row.P}</td>
                          <td style={{ ...tdStyle(), color: '#7ee08a', fontWeight: row.W ? 700 : 400 }}>{row.W}</td>
                          <td style={{ ...tdStyle(), color: row.D ? 'var(--gold)' : 'var(--text-muted)' }}>{row.D}</td>
                          <td style={{ ...tdStyle(), color: row.L ? 'var(--danger)' : 'var(--text-muted)' }}>{row.L}</td>
                          <td style={tdStyle()}>{row.GF}</td>
                          <td style={tdStyle()}>{row.GA}</td>
                          <td style={{
                            ...tdStyle(),
                            color: row.GD > 0 ? '#7ee08a' : row.GD < 0 ? 'var(--danger)' : 'var(--text-muted)',
                            fontWeight: row.GD !== 0 ? 700 : 400,
                          }}>
                            {row.GD > 0 ? `+${row.GD}` : row.GD}
                          </td>
                          <td style={{ ...tdStyle(), fontFamily: 'Bebas Neue', fontSize: 22, color: isDirect || isWildcard ? 'var(--gold)' : 'var(--text-primary)' }}>
                            {row.Pts}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{
                padding: '12px 18px',
                borderTop: `1px solid ${color.border}40`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>
                <span><span style={{ color: '#7ee08a' }}>●</span> Highlighted green rows qualify directly</span>
                {bestLosers > 0 && <span><span style={{ color: '#a8a8ff' }}>●</span> Purple rows stay alive in the wildcard race</span>}
              </div>
            </div>
          )
        })}
      </div>

      {!isLeague && bestLosers > 0 && loserPool.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#b6b6ff', letterSpacing: 2, marginBottom: 6 }}>
              Wildcard Race
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              The top {bestLosers} player{bestLosers !== 1 ? 's' : ''} below qualify as best losers. Tie-break order remains points, goal difference, then goals for.
            </p>
          </div>

          <div style={{
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #30306a',
            background: 'linear-gradient(180deg, rgba(14,14,42,0.98), rgba(9,9,24,0.98))',
            boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30306a' }}>
                    <th style={thStyle('left')}>#</th>
                    <th style={thStyle('left')}>Player</th>
                    <th style={thStyle('left')}>Group</th>
                    <th style={thStyle()}>P</th>
                    <th style={{ ...thStyle(), color: '#7ee08a' }}>W</th>
                    <th style={{ ...thStyle(), color: 'var(--gold)' }}>D</th>
                    <th style={{ ...thStyle(), color: 'var(--danger)' }}>L</th>
                    <th style={thStyle()}>GF</th>
                    <th style={thStyle()}>GA</th>
                    <th style={thStyle()}>GD</th>
                    <th style={{ ...thStyle(), color: '#b6b6ff' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {loserPool.map((row, idx) => {
                    const isIn = idx < bestLosers
                    return (
                      <tr key={`${row.id}_wild_${idx}`} style={{
                        background: isIn ? 'rgba(120,120,255,0.11)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        borderLeft: isIn ? '4px solid #7d7dff' : '4px solid transparent',
                      }}>
                        <td style={tdStyle('left')}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: isIn ? '#d0d0ff' : 'var(--text-muted)' }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ ...tdStyle('left'), fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isIn && <span>🃏</span>}
                            <div>
                              <div style={{ fontWeight: 700 }}>{row.name}</div>
                              {row.gameId && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{row.gameId}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle('left')}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', padding: '4px 9px', borderRadius: 999,
                            background: `${row.color.border}20`, border: `1px solid ${row.color.border}60`, color: row.color.label, fontSize: 12, fontWeight: 700,
                          }}>
                            {row.groupName}
                          </span>
                        </td>
                        <td style={tdStyle()}>{row.P}</td>
                        <td style={{ ...tdStyle(), color: '#7ee08a', fontWeight: row.W ? 700 : 400 }}>{row.W}</td>
                        <td style={{ ...tdStyle(), color: row.D ? 'var(--gold)' : 'var(--text-muted)' }}>{row.D}</td>
                        <td style={{ ...tdStyle(), color: row.L ? 'var(--danger)' : 'var(--text-muted)' }}>{row.L}</td>
                        <td style={tdStyle()}>{row.GF}</td>
                        <td style={tdStyle()}>{row.GA}</td>
                        <td style={{
                          ...tdStyle(),
                          color: row.GD > 0 ? '#7ee08a' : row.GD < 0 ? 'var(--danger)' : 'var(--text-muted)',
                          fontWeight: row.GD !== 0 ? 700 : 400,
                        }}>
                          {row.GD > 0 ? `+${row.GD}` : row.GD}
                        </td>
                        <td style={{ ...tdStyle(), fontFamily: 'Bebas Neue', fontSize: 22, color: isIn ? '#d0d0ff' : 'var(--text-primary)' }}>
                          {row.Pts}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid #30306a',
              color: '#b6b6ff',
              fontSize: 12,
            }}>
              Highlighted rows currently claim the wildcard slots.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}