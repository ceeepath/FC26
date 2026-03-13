import { useState } from 'react'
import { CopyButton } from './WhatsAppExport'
import { exportGroupStandings } from '../utils/whatsapp'

const GROUP_COLORS = [
  { border: '#c9960f', bg: '#1a1200', label: 'var(--gold)',  },
  { border: '#1a7a4a', bg: '#001a0e', label: '#4cdf8a',      },
  { border: '#1a4a9a', bg: '#00081a', label: '#6aaeff',      },
  { border: '#8a1a8a', bg: '#150015', label: '#e07ae0',      },
  { border: '#9a4a1a', bg: '#1a0800', label: '#f0a060',      },
  { border: '#1a7a7a', bg: '#001515', label: '#60e0e0',      },
  { border: '#6a1a1a', bg: '#180000', label: '#e06060',      },
  { border: '#4a6a1a', bg: '#0a1400', label: '#a0d060',      },
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

  rows.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name))
  return rows
}

function thStyle(align = 'center') {
  return {
    padding: '10px 12px', textAlign: align, fontSize: 12,
    fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1,
    fontFamily: 'Barlow', whiteSpace: 'nowrap',
  }
}
function tdStyle(align = 'center') {
  return { padding: '11px 12px', textAlign: align, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap' }
}

// Spinner control for qualifier count
function CountStepper({ value, min, max, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        style={{
          width: 28, height: 28, borderRadius: 6, border: '1px solid var(--green-border)',
          background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (disabled || value <= min) ? 0.3 : 1,
        }}
      >−</button>
      <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: 'var(--gold)', minWidth: 20, textAlign: 'center' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        style={{
          width: 28, height: 28, borderRadius: 6, border: '1px solid var(--green-border)',
          background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (disabled || value >= max) ? 0.3 : 1,
        }}
      >+</button>
    </div>
  )
}

export default function GroupStandings({ players, groups, fixtures, qualifierConfig, setQualifierConfig, isAdmin }) {
  const playedCount = fixtures.filter(f => f.type === 'group' && f.played).length
  const totalCount  = fixtures.filter(f => f.type === 'group').length

  // Per-group qualifier count — default 2
  function getQualifiers(groupId) {
    return qualifierConfig.perGroup?.[groupId] ?? 2
  }
  function setQualifiers(groupId, val) {
    setQualifierConfig(prev => ({
      ...prev,
      perGroup: { ...prev.perGroup, [groupId]: val }
    }))
  }
  const bestLosers = qualifierConfig.bestLosers ?? 0
  function setBestLosers(val) {
    setQualifierConfig(prev => ({ ...prev, bestLosers: val }))
  }

  // Build standings per group
  const allGroupData = groups.map((group, gIdx) => ({
    group,
    color: GROUP_COLORS[group.colorIdx % GROUP_COLORS.length],
    rows: calcStandings(group, players, fixtures),
    qualifiers: getQualifiers(group.id),
  }))

  // Collect losers — players outside each group's qualifier spots
  const loserPool = []
  allGroupData.forEach(({ group, rows, qualifiers, color }) => {
    rows.slice(qualifiers).forEach(row => {
      loserPool.push({ ...row, groupName: group.name, color })
    })
  })
  loserPool.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name))
  const wildcardAdvancers = bestLosers > 0 ? loserPool.slice(0, bestLosers) : []

  // Total advancing count
  const totalQualifiers = allGroupData.reduce((sum, g) => sum + g.qualifiers, 0) + wildcardAdvancers.length

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>STANDINGS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {playedCount === 0
              ? 'No results yet — standings will update as matches are played.'
              : `${playedCount} of ${totalCount} matches played · updates live as results are entered`}
          </p>
        </div>
        <CopyButton text={exportGroupStandings(groups, players, fixtures, qualifierConfig)} label="📋 Copy" size="small" />
      </div>

      {/* ── Admin qualifier config ── */}
      {isAdmin && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
            🎯 QUALIFICATION SETTINGS
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Set how many players advance from each group. Then optionally add wildcard spots for the best losers across all groups.
          </p>

          {/* Per group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {allGroupData.map(({ group, color, rows, qualifiers }) => (
              <div key={group.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: color.bg, border: `1px solid ${color.border}`, borderRadius: 10,
              }}>
                <div>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: color.label }}>
                    {group.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {rows.length} player{rows.length !== 1 ? 's' : ''} · top {qualifiers} advance directly
                  </p>
                </div>
                <CountStepper
                  value={qualifiers}
                  min={1}
                  max={Math.max(1, rows.length - 1)}
                  onChange={val => setQualifiers(group.id, val)}
                />
              </div>
            ))}
          </div>

          {/* Best losers */}
          <div style={{
            padding: '14px 16px',
            background: '#0d0d1a', border: '1px solid #2a2a5a', borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#9a9aff', marginBottom: 4 }}>
                  🃏 Best Losers (Wildcard)
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {bestLosers === 0
                    ? 'No wildcards — set above 0 to enable.'
                    : `Best ${bestLosers} player${bestLosers !== 1 ? 's' : ''} outside qualification spots advance as wildcards.`}
                </p>
              </div>
              <CountStepper
                value={bestLosers}
                min={0}
                max={loserPool.length}
                onChange={setBestLosers}
              />
            </div>

            {/* Preview who currently gets wildcard */}
            {bestLosers > 0 && loserPool.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {loserPool.map((p, i) => {
                  const isIn = i < bestLosers
                  return (
                    <span key={p.id} style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: isIn ? 'rgba(120,120,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isIn ? '#5a5aaa' : '#2a2a3a'}`,
                      color: isIn ? '#9a9aff' : 'var(--text-muted)',
                    }}>
                      {isIn ? '🃏 ' : ''}{p.name}
                      <span style={{ opacity: 0.6, marginLeft: 4 }}>({p.groupName})</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: '#0a1a0a', borderRadius: 8, border: '1px solid var(--green-border)',
            fontSize: 13, color: 'var(--text-muted)',
          }}>
            📊 <strong style={{ color: 'var(--text-primary)' }}>{totalQualifiers}</strong> players will advance to the knockout stage
            {' '}({allGroupData.reduce((s, g) => s + g.qualifiers, 0)} direct + {wildcardAdvancers.length} wildcard{wildcardAdvancers.length !== 1 ? 's' : ''})
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20,
        padding: '10px 16px', background: '#0a1a0a',
        border: '1px solid var(--green-border)', borderRadius: 8,
        fontSize: 12, color: 'var(--text-muted)',
      }}>
        {[
          ['P', 'var(--text-primary)', 'Played'],
          ['W', '#4caf50', 'Won'],
          ['D', 'var(--gold)', 'Drawn'],
          ['L', 'var(--danger)', 'Lost'],
          ['GF', 'var(--text-primary)', 'Goals For'],
          ['GA', 'var(--text-primary)', 'Goals Against'],
          ['GD', 'var(--text-primary)', 'Goal Diff'],
          ['Pts', 'var(--gold)', 'Points'],
        ].map(([key, color, label]) => (
          <span key={key}><strong style={{ color }}>{key}</strong> {label}</span>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(76,175,80,0.25)', display: 'inline-block', border: '1px solid #4caf50' }} />
          Direct qualifier
          {bestLosers > 0 && (
            <>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(120,120,255,0.2)', display: 'inline-block', border: '1px solid #5a5aaa', marginLeft: 8 }} />
              Wildcard
            </>
          )}
        </span>
      </div>

      {/* ── Group tables ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {allGroupData.map(({ group, color, rows, qualifiers }) => {
          const played = fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.played).length
          const total  = fixtures.filter(f => f.type === 'group' && f.groupId === group.id).length

          return (
            <div key={group.id} style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '12px 18px', borderBottom: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: color.label }}>{group.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{played}/{total} played</span>
                  {!isAdmin && (
                    <span style={{ fontSize: 12, color: '#4caf50' }}>Top {qualifiers} advance</span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${color.border}` }}>
                      <th style={thStyle('left')}>#</th>
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
                      const isDirect   = idx < qualifiers
                      const isWildcard = !isDirect && wildcardAdvancers.some(w => w.id === row.id)
                      const isFirst    = idx === 0

                      return (
                        <tr key={row.id} style={{
                          background: isDirect
                            ? isFirst ? 'rgba(76,175,80,0.13)' : 'rgba(76,175,80,0.07)'
                            : isWildcard ? 'rgba(120,120,255,0.08)' : 'transparent',
                          borderBottom: `1px solid ${color.border}40`,
                          borderLeft: isDirect
                            ? '3px solid #4caf50'
                            : isWildcard ? '3px solid #5a5aaa' : '3px solid transparent',
                        }}>
                          <td style={tdStyle('left')}>
                            <span style={{
                              fontFamily: 'Bebas Neue', fontSize: 15,
                              color: isFirst ? 'var(--gold)' : isDirect ? '#4caf50' : 'var(--text-muted)',
                            }}>{idx + 1}</span>
                          </td>
                          <td style={{ ...tdStyle('left'), fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isDirect && <span title="Direct qualifier">{isFirst ? '🥇' : idx === 1 ? '🥈' : '✅'}</span>}
                              {isWildcard && <span title="Wildcard">🃏</span>}
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
                          <td style={{ ...tdStyle(), fontFamily: 'Bebas Neue', fontSize: 18, color: isDirect || isWildcard ? 'var(--gold)' : 'var(--text-primary)' }}>
                            {row.Pts}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '8px 18px', borderTop: `1px solid ${color.border}40`, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                <span><span style={{ color: '#4caf50' }}>●</span> Top {qualifiers} advance directly</span>
                {bestLosers > 0 && <span><span style={{ color: '#5a5aaa' }}>●</span> Best loser may qualify as wildcard</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Best losers table ── */}
      {bestLosers > 0 && loserPool.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: '#9a9aff', letterSpacing: 2, marginBottom: 6 }}>
            🃏 BEST LOSERS — WILDCARD RACE
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Top {bestLosers} from this list advance as wildcards. Ranked by Pts → Goal Difference → Goals For.
          </p>

          <div style={{ background: '#0d0d1a', border: '1px solid #2a2a5a', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a5a' }}>
                    <th style={thStyle('left')}>#</th>
                    <th style={thStyle('left')}>Player</th>
                    <th style={{ ...thStyle('left'), color: 'var(--text-muted)' }}>Group</th>
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
                  {loserPool.map((row, idx) => {
                    const isIn = idx < bestLosers
                    return (
                      <tr key={row.id} style={{
                        background: isIn ? 'rgba(120,120,255,0.1)' : 'transparent',
                        borderBottom: '1px solid #1a1a3a',
                        borderLeft: isIn ? '3px solid #5a5aaa' : '3px solid transparent',
                      }}>
                        <td style={tdStyle('left')}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 15, color: isIn ? '#9a9aff' : 'var(--text-muted)' }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ ...tdStyle('left'), fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isIn && <span>🃏</span>}
                            {row.name}
                          </div>
                        </td>
                        <td style={{ ...tdStyle('left') }}>
                          <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: `${row.color.border}30`, color: row.color.label, border: `1px solid ${row.color.border}50` }}>
                            {row.groupName}
                          </span>
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
                        <td style={{ ...tdStyle(), fontFamily: 'Bebas Neue', fontSize: 18, color: isIn ? '#9a9aff' : 'var(--text-primary)' }}>
                          {row.Pts}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 18px', borderTop: '1px solid #2a2a5a', fontSize: 12, color: '#5a5aaa' }}>
              🃏 Highlighted rows advance as wildcards · {loserPool.length - bestLosers} player{loserPool.length - bestLosers !== 1 ? 's' : ''} eliminated
            </div>
          </div>
        </div>
      )}
    </div>
  )
}