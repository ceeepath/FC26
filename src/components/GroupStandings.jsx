const GROUP_COLORS = [
  { border: '#c9960f', bg: '#1a1200', label: 'var(--gold)',  accent: '#c9960f' },
  { border: '#1a7a4a', bg: '#001a0e', label: '#4cdf8a',      accent: '#1a7a4a' },
  { border: '#1a4a9a', bg: '#00081a', label: '#6aaeff',      accent: '#1a4a9a' },
  { border: '#8a1a8a', bg: '#150015', label: '#e07ae0',      accent: '#8a1a8a' },
  { border: '#9a4a1a', bg: '#1a0800', label: '#f0a060',      accent: '#9a4a1a' },
  { border: '#1a7a7a', bg: '#001515', label: '#60e0e0',      accent: '#1a7a7a' },
  { border: '#6a1a1a', bg: '#180000', label: '#e06060',      accent: '#6a1a1a' },
  { border: '#4a6a1a', bg: '#0a1400', label: '#a0d060',      accent: '#4a6a1a' },
]

// Calculate standings for one group
function calcStandings(group, players, fixtures) {
  const groupFixtures = fixtures.filter(f => f.type === 'group' && f.groupId === group.id)
  const validIds = group.playerIds.filter(id => players.some(p => p.id === id))

  const rows = validIds.map(id => {
    const name = players.find(p => p.id === id)?.name ?? '???'
    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0

    groupFixtures.forEach(f => {
      if (!f.played) return
      if (f.homeId === id) {
        P++; GF += f.homeScore; GA += f.awayScore
        if (f.homeScore > f.awayScore) W++
        else if (f.homeScore === f.awayScore) D++
        else L++
      } else if (f.awayId === id) {
        P++; GF += f.awayScore; GA += f.homeScore
        if (f.awayScore > f.homeScore) W++
        else if (f.awayScore === f.homeScore) D++
        else L++
      }
    })

    return { id, name, P, W, D, L, GF, GA, GD: GF - GA, Pts: W * 3 + D }
  })

  // Sort: Pts → GD → GF → name
  rows.sort((a, b) =>
    b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name)
  )

  return rows
}

export default function GroupStandings({ players, groups, fixtures }) {
  const playedCount = fixtures.filter(f => f.type === 'group' && f.played).length
  const totalCount  = fixtures.filter(f => f.type === 'group').length

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          STANDINGS
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {playedCount === 0
            ? 'No results yet — standings will update as matches are played.'
            : `${playedCount} of ${totalCount} matches played · updates live as results are entered`}
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20,
        padding: '10px 16px', background: '#0a1a0a',
        border: '1px solid var(--green-border)', borderRadius: 8, fontSize: 12,
        color: 'var(--text-muted)',
      }}>
        <span><strong style={{ color: 'var(--text-primary)' }}>P</strong> Played</span>
        <span><strong style={{ color: '#4caf50' }}>W</strong> Won</span>
        <span><strong style={{ color: 'var(--gold)' }}>D</strong> Drawn</span>
        <span><strong style={{ color: 'var(--danger)' }}>L</strong> Lost</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>GF</strong> Goals For</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>GA</strong> Goals Against</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>GD</strong> Goal Diff</span>
        <span><strong style={{ color: 'var(--gold)' }}>Pts</strong> Points</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(76,175,80,0.25)', display: 'inline-block', border: '1px solid #4caf50' }} />
          Top 2 advance
        </span>
      </div>

      {/* One table per group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.map((group, gIdx) => {
          const color = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length]
          const rows  = calcStandings(group, players, fixtures)
          const totalGroupMatches  = fixtures.filter(f => f.type === 'group' && f.groupId === group.id).length
          const playedGroupMatches = fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.played).length

          return (
            <div key={group.id} style={{
              background: color.bg,
              border: `1px solid ${color.border}`,
              borderRadius: 12, overflow: 'hidden',
            }}>
              {/* Group header */}
              <div style={{
                padding: '12px 18px',
                borderBottom: `1px solid ${color.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: color.label }}>
                  {group.name}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {playedGroupMatches}/{totalGroupMatches} played
                </span>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${color.border}` }}>
                      <th style={thStyle('left', 40)}>#</th>
                      <th style={thStyle('left')}>Player</th>
                      <th style={thStyle()}>P</th>
                      <th style={{ ...thStyle(), color: '#4caf50' }}>W</th>
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
                      const advances = idx < 2
                      const isTop    = idx === 0
                      return (
                        <tr key={row.id} style={{
                          background: advances
                            ? isTop
                              ? 'rgba(76,175,80,0.12)'
                              : 'rgba(76,175,80,0.06)'
                            : 'transparent',
                          borderBottom: `1px solid ${color.border}40`,
                          borderLeft: advances ? '3px solid #4caf50' : '3px solid transparent',
                          transition: 'background 0.2s',
                        }}>
                          <td style={tdStyle('center')}>
                            <span style={{
                              fontFamily: 'Bebas Neue', fontSize: 15,
                              color: isTop ? 'var(--gold)' : advances ? '#4caf50' : 'var(--text-muted)',
                            }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td style={{ ...tdStyle('left'), fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {advances && (
                                <span style={{ fontSize: 11, color: '#4caf50', opacity: 0.8 }} title="Advances">
                                  {isTop ? '🥇' : '🥈'}
                                </span>
                              )}
                              {row.name}
                            </div>
                          </td>
                          <td style={tdStyle()}>{row.P}</td>
                          <td style={{ ...tdStyle(), color: '#4caf50', fontWeight: row.W > 0 ? 700 : 400 }}>{row.W}</td>
                          <td style={{ ...tdStyle(), color: row.D > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>{row.D}</td>
                          <td style={{ ...tdStyle(), color: row.L > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{row.L}</td>
                          <td style={tdStyle()}>{row.GF}</td>
                          <td style={tdStyle()}>{row.GA}</td>
                          <td style={{
                            ...tdStyle(),
                            color: row.GD > 0 ? '#4caf50' : row.GD < 0 ? 'var(--danger)' : 'var(--text-muted)',
                            fontWeight: row.GD !== 0 ? 700 : 400,
                          }}>
                            {row.GD > 0 ? `+${row.GD}` : row.GD}
                          </td>
                          <td style={{
                            ...tdStyle(),
                            fontFamily: 'Bebas Neue', fontSize: 18,
                            color: advances ? 'var(--gold)' : 'var(--text-primary)',
                          }}>
                            {row.Pts}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Advance note */}
              <div style={{
                padding: '8px 18px', borderTop: `1px solid ${color.border}40`,
                fontSize: 12, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: '#4caf50' }}>●</span>
                Top 2 advance to knockout stage
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function thStyle(align = 'center', minWidth) {
  return {
    padding: '10px 12px',
    textAlign: align,
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: 1,
    fontFamily: 'Barlow',
    minWidth: minWidth ?? 'auto',
    whiteSpace: 'nowrap',
  }
}

function tdStyle(align = 'center') {
  return {
    padding: '11px 12px',
    textAlign: align,
    fontSize: 14,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  }
}