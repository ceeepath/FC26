import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import {
  exportGroupStandings, exportResultsByRound, exportQualifiers,
  exportKnockoutResults, exportLeaderboard, exportFixtures, exportFixturesByRound
} from '../utils/whatsapp'

// ── Shared actions ────────────────────────────────────────────────────────

export function CopyButton({ text, label = '📋 Copy', size = 'normal' }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const small = size === 'small'

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: small ? '7px 12px' : '10px 16px',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'Barlow',
        fontWeight: 700,
        fontSize: small ? 12 : 13,
        background: copied ? 'rgba(76,175,80,0.14)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${copied ? '#4caf50' : 'var(--green-border)'}`,
        color: copied ? '#87d387' : 'var(--text-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✅ Copied!' : label}
    </button>
  )
}

function ImageButton({ targetRef, filename, size = 'normal' }) {
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!targetRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#031403',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Image export failed', e)
    }
    setSaving(false)
  }

  const small = size === 'small'

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      style={{
        padding: small ? '7px 12px' : '10px 16px',
        borderRadius: 12,
        cursor: saving ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'Barlow',
        fontWeight: 700,
        fontSize: small ? 12 : 13,
        background: saving ? 'rgba(245,197,24,0.08)' : 'rgba(245,197,24,0.06)',
        border: '1px solid rgba(245,197,24,0.22)',
        color: 'var(--gold)',
        whiteSpace: 'nowrap',
        opacity: saving ? 0.78 : 1,
      }}
    >
      {saving ? '⏳ Saving…' : '📸 Save Image'}
    </button>
  )
}

// ── Shared visual blocks ──────────────────────────────────────────────────

function HeroMetric({ label, value, sub, accent = 'var(--gold)' }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        borderRadius: 18,
        background: 'linear-gradient(180deg, rgba(8,25,8,0.96), rgba(4,13,4,0.98))',
        border: `1px solid ${accent}25`,
        boxShadow: `0 0 0 1px ${accent}12 inset, 0 12px 28px rgba(0,0,0,0.18)`,
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 34, lineHeight: 1, color: accent, letterSpacing: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>
    </div>
  )
}

function CaptureShell({ children, title, subtitle, badge = 'EA26 EXPORT' }) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #041104, #020902)',
        padding: 24,
        fontFamily: 'Barlow, sans-serif',
        minWidth: 420,
        color: '#eef5ee',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid rgba(245,197,24,0.24)',
          paddingBottom: 16,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 999,
            background: 'rgba(245,197,24,0.08)',
            border: '1px solid rgba(245,197,24,0.18)',
            fontSize: 11,
            letterSpacing: 1.6,
            color: '#F5C518',
            marginBottom: 10,
          }}
        >
          {badge}
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: '#F5C518', letterSpacing: 2.5 }}>
          EA26 TOURNAMENT
        </div>
        <div style={{ fontSize: 11, color: '#8aa28a', letterSpacing: 3, marginTop: 2 }}>TNC · FIFA PS5</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#f0f4f0', letterSpacing: 2, marginTop: 12 }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 13, color: '#95a995', marginTop: 4 }}>{subtitle}</div>}
      </div>

      {children}

      <div
        style={{
          marginTop: 18,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 11,
          color: '#527052',
          letterSpacing: 1,
          textAlign: 'right',
        }}
      >
        Shared from EA26 Tournament Manager
      </div>
    </div>
  )
}

function SectionChip({ children, color = '#F5C518', bg = 'rgba(245,197,24,0.10)' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 10,
        letterSpacing: 1.4,
        color,
        background: bg,
        border: `1px solid ${color}22`,
      }}
    >
      {children}
    </span>
  )
}

function pName(players, id) {
  return players.find(p => p.id === id)?.name ?? '???'
}

// ── Capture cards ─────────────────────────────────────────────────────────

function StandingsCard({ groups, players, fixtures, qualifierConfig }) {
  function calcRows(group) {
    const gf = fixtures.filter(f => f.type === 'group' && f.groupId === group.id)
    const ids = group.playerIds.filter(id => players.some(p => p.id === id))
    const rows = ids.map(id => {
      const name = players.find(p => p.id === id)?.name ?? '???'
      let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0
      gf.forEach(f => {
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

  const colors = ['#c9960f', '#31a86b', '#348ce2', '#b35ee2', '#e28c34', '#49b4b4']
  const played = fixtures.filter(f => f.type === 'group' && f.played).length
  const total = fixtures.filter(f => f.type === 'group').length

  return (
    <CaptureShell title="GROUP STANDINGS" subtitle={`${played} of ${total} group matches played`} badge="📊 STANDINGS">
      <div style={{ display: 'grid', gap: 18 }}>
        {groups.map((group, gi) => {
          const rows = calcRows(group)
          const q = qualifierConfig?.perGroup?.[group.id] ?? 2
          const color = colors[(group.colorIdx ?? gi) % colors.length]
          return (
            <div key={group.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, color, letterSpacing: 1.6 }}>{group.name}</div>
                <SectionChip color={color} bg={`${color}16`}>{q} direct qualifier{q !== 1 ? 's' : ''}</SectionChip>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['#', 'Player', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h, i) => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: i <= 1 ? 'left' : 'center', color: '#8fa58f', fontWeight: 700, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: idx < q ? 'rgba(76,175,80,0.08)' : 'transparent',
                    }}>
                      <td style={{ padding: '9px 10px', color: idx === 0 ? '#F5C518' : idx < q ? '#68d168' : '#8fa58f', fontFamily: 'Bebas Neue', fontSize: 18 }}>{idx + 1}</td>
                      <td style={{ padding: '9px 10px', fontWeight: 700 }}>{idx < q ? '✅ ' : ''}{r.name}</td>
                      {[r.P, r.W, r.D, r.L, r.GF, r.GA, r.GD > 0 ? `+${r.GD}` : r.GD, r.Pts].map((v, i) => (
                        <td key={i} style={{
                          padding: '9px 10px',
                          textAlign: 'center',
                          color: i === 7 ? '#F5C518' : '#eef5ee',
                          fontFamily: i === 7 ? 'Bebas Neue' : 'inherit',
                          fontSize: i === 7 ? 18 : 13,
                        }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </CaptureShell>
  )
}

function LeaderboardCard({ players, fixtures }) {
  const played = fixtures.filter(f => f.played && !f.isBye)
  const board = players
    .map(player => {
      let MP = 0, W = 0, D = 0, L = 0, GF = 0, Pts = 0
      played.forEach(f => {
        const isHome = f.homeId === player.id
        const isAway = f.awayId === player.id
        if (!isHome && !isAway) return
        MP++
        const myGoals = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0)
        const theirGoals = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0)
        GF += myGoals
        if (f.manualWinnerId) {
          if (f.manualWinnerId === player.id) { W++; Pts += 3 } else L++
        } else {
          if (myGoals > theirGoals) { W++; Pts += 3 }
          else if (myGoals === theirGoals) { D++; Pts += 1 }
          else L++
        }
      })
      return { ...player, MP, W, D, L, GF, Pts }
    })
    .filter(p => p.MP > 0)
    .sort((a, b) => b.Pts - a.Pts || b.GF - a.GF || a.name.localeCompare(b.name))

  const medals = ['🥇', '🥈', '🥉']
  const topPts = board[0]?.Pts ?? 1

  return (
    <CaptureShell title="OVERALL LEADERBOARD" subtitle={`${played.length} completed matches`} badge="🏅 LEADERBOARD">
      <div style={{ display: 'grid', gap: 14 }}>
        {board.map((p, idx) => {
          const barW = Math.round((p.Pts / topPts) * 100)
          return (
            <div key={p.id} style={{
              display: 'grid',
              gridTemplateColumns: '56px minmax(0, 1fr) 90px',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: 16,
              border: idx === 0 ? '1px solid rgba(245,197,24,0.22)' : '1px solid rgba(255,255,255,0.06)',
              background: idx === 0
                ? 'linear-gradient(180deg, rgba(245,197,24,0.08), rgba(255,255,255,0.02))'
                : 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontSize: idx < 3 ? 28 : 18, textAlign: 'center', color: '#F5C518', fontFamily: idx < 3 ? 'inherit' : 'Bebas Neue' }}>
                {medals[idx] ?? idx + 1}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#8fa58f' }}>{p.W}W · {p.D}D · {p.L}L</div>
                </div>
                <div style={{ height: 5, borderRadius: 999, overflow: 'hidden', background: '#143014' }}>
                  <div style={{ width: `${barW}%`, height: '100%', background: idx === 0 ? '#F5C518' : '#4d8c4d' }} />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 30, lineHeight: 1, color: idx === 0 ? '#F5C518' : '#f0f4f0' }}>{p.Pts}</div>
                <div style={{ fontSize: 11, color: '#8fa58f' }}>{p.GF} GF</div>
              </div>
            </div>
          )
        })}
      </div>
    </CaptureShell>
  )
}

// Build matchday rounds using circle method (same logic as FixtureSetup)
function buildMatchdays(groups, fixtures, fixtureConfig) {
  const groupFix = fixtures.filter(f => f.type === 'group')
  const legs = fixtureConfig?.group === 2 ? 2 : 1

  const groupBuckets = groups.map(group => {
    const all = groupFix.filter(f => f.groupId === group.id)
    const n = group.playerIds?.length ?? 4
    const perDay = Math.max(1, Math.floor(n / 2))
    const pairIdxs = [...new Set(all.map(f => f.pairIdx))].sort((a, b) => a - b)
    const buckets = []
    for (let i = 0; i < pairIdxs.length; i += perDay) {
      buckets.push(pairIdxs.slice(i, i + perDay))
    }
    return { group, all, buckets }
  })

  const maxDays = Math.max(...groupBuckets.map(b => b.buckets.length), 0)
  const rounds = []

  for (let dayIdx = 0; dayIdx < maxDays; dayIdx++) {
    for (let leg = 1; leg <= legs; leg++) {
      const matches = []
      groupBuckets.forEach(({ group, all, buckets }) => {
        const chunk = buckets[dayIdx]
        if (!chunk) return
        chunk.forEach(pairIdx => {
          const f = all.find(fx => fx.pairIdx === pairIdx && fx.leg === leg)
          if (f) matches.push({ group, f })
        })
      })
      if (matches.length > 0) {
        const label = legs === 2
          ? `MATCHDAY ${dayIdx + 1} · LEG ${leg}`
          : `MATCHDAY ${dayIdx + 1}`
        rounds.push({ label, dayIdx, leg, matches })
      }
    }
  }
  return rounds
}

function RoundCard({ round, players, fixtureConfig }) {
  const { label, matches } = round
  const playedInRound = matches.filter(x => x.f.played).length

  return (
    <CaptureShell
      title={`${label} RESULTS`}
      subtitle={`${playedInRound} of ${matches.length} results entered`}
      badge="⚽ ROUND RESULTS"
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {matches.map(({ group, f }) => {
          const legLabel = fixtureConfig?.group === 2 ? ` · Leg ${f.leg}` : ''
          return (
            <div key={f.id} style={{
              display: 'grid',
              gridTemplateColumns: '72px minmax(0, 1fr) 76px minmax(0, 1fr)',
              gap: 10,
              alignItems: 'center',
              padding: 12,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontSize: 11, color: '#8fa58f' }}>{group.name}{legLabel}</div>
              <div style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pName(players, f.homeId)}</div>
              <div style={{
                padding: '7px 10px',
                textAlign: 'center',
                borderRadius: 10,
                background: f.played ? 'rgba(245,197,24,0.08)' : '#081808',
                border: `1px solid ${f.played ? 'rgba(245,197,24,0.18)' : 'rgba(255,255,255,0.06)'}`,
                fontFamily: f.played ? 'Bebas Neue' : 'Barlow',
                fontSize: f.played ? 20 : 11,
                color: f.played ? '#F5C518' : '#5f7a5f',
                letterSpacing: f.played ? 1.2 : 0.3,
              }}>
                {f.played ? `${f.homeScore}–${f.awayScore}` : 'vs'}
              </div>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pName(players, f.awayId)}</div>
            </div>
          )
        })}
      </div>
    </CaptureShell>
  )
}

function PerRoundResults({ groups, players, fixtures, fixtureConfig }) {
  const rounds = buildMatchdays(groups, fixtures, fixtureConfig)
  const roundRefs = Array.from({ length: rounds.length }, () => useRef(null))

  if (rounds.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: 12 }}>No fixtures yet.</p>
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {rounds.map((round, rIdx) => (
        <div key={rIdx}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <ImageButton targetRef={roundRefs[rIdx]} filename={`ea26-matchday-${rIdx + 1}`} size="small" />
          </div>
          <div ref={roundRefs[rIdx]}>
            <RoundCard round={round} players={players} fixtureConfig={fixtureConfig} />
          </div>
        </div>
      ))}
    </div>
  )
}

function QualifiersCard({ groups, players, fixtures, qualifierConfig }) {
  function calcRows(group) {
    const gf = fixtures.filter(f => f.type === 'group' && f.groupId === group.id)
    const ids = group.playerIds.filter(id => players.some(p => p.id === id))
    const rows = ids.map(id => {
      const name = players.find(p => p.id === id)?.name ?? '???'
      let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0
      gf.forEach(f => {
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

  const direct = []
  const loserPool = []

  groups.forEach(group => {
    const rows = calcRows(group)
    const q = qualifierConfig?.perGroup?.[group.id] ?? 2
    rows.slice(0, q).forEach((r, i) => direct.push({ ...r, groupName: group.name, rank: i + 1 }))
    rows.slice(q).forEach(r => loserPool.push({ ...r, groupName: group.name }))
  })

  loserPool.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name))
  const wildcards = loserPool.slice(0, qualifierConfig?.bestLosers ?? 0)

  return (
    <CaptureShell
      title="QUALIFIERS"
      subtitle={`${direct.length + wildcards.length} total players advancing`}
      badge="✅ QUALIFIERS"
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div>
          <div style={{ marginBottom: 10 }}><SectionChip>DIRECT QUALIFIERS</SectionChip></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {direct.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 14,
                background: 'rgba(76,175,80,0.10)',
                border: '1px solid rgba(76,175,80,0.16)',
              }}>
                <span style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '✅'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#74cf74' }}>{p.groupName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {wildcards.length > 0 && (
          <div>
            <div style={{ marginBottom: 10 }}><SectionChip color="#91a8ff" bg="rgba(120,120,255,0.10)">🃏 WILDCARDS</SectionChip></div>
            <div style={{ display: 'grid', gap: 10 }}>
              {wildcards.map(p => (
                <div key={p.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'rgba(120,120,255,0.10)',
                  border: '1px solid rgba(120,120,255,0.18)',
                }}>
                  <span style={{ fontSize: 16 }}>🃏</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#aeb8ff' }}>{p.groupName} · {p.Pts} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CaptureShell>
  )
}

// ── Export section card ───────────────────────────────────────────────────

function ExportSection({ icon, title, description, text, children, filename, multiImage, tone }) {
  const [preview, setPreview] = useState(false)
  const imgRef = useRef(null)

  const tones = {
    gold: { border: 'rgba(245,197,24,0.16)', glow: 'rgba(245,197,24,0.08)', chip: 'var(--gold)' },
    green: { border: 'rgba(76,175,80,0.16)', glow: 'rgba(76,175,80,0.06)', chip: '#7fd37f' },
    blue: { border: 'rgba(93,167,255,0.18)', glow: 'rgba(93,167,255,0.07)', chip: '#86c7ff' },
  }
  const palette = tones[tone] ?? tones.gold

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderRadius: 20,
        border: `1px solid ${palette.border}`,
        boxShadow: `0 18px 40px ${palette.glow}`,
        background: 'linear-gradient(180deg, rgba(7,20,7,0.96), rgba(4,12,4,0.98))',
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          borderBottom: preview ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            display: 'grid',
            placeItems: 'center',
            fontSize: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            {icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1.3, color: 'var(--gold)', margin: 0 }}>{title}</p>
              <span style={{
                fontSize: 10,
                letterSpacing: 1.5,
                color: palette.chip,
                border: `1px solid ${palette.chip}25`,
                background: `${palette.chip}12`,
                borderRadius: 999,
                padding: '4px 8px',
              }}>
                SHARE READY
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setPreview(v => !v)}
            style={{
              padding: '7px 12px',
              borderRadius: 12,
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--green-border)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'Barlow',
              fontWeight: 700,
            }}
          >
            {preview ? 'Hide Preview' : 'Preview'}
          </button>
          {children && !multiImage && <ImageButton targetRef={imgRef} filename={filename} />}
          <CopyButton text={text} label="📋 Copy Text" />
        </div>
      </div>

      {preview && (
        <div style={{ padding: '16px 20px 20px', background: 'rgba(1,7,1,0.72)' }}>
          {children ? (
            multiImage ? (
              <div>{children}</div>
            ) : (
              <div ref={imgRef} style={{ display: 'inline-block', minWidth: 400, maxWidth: '100%' }}>
                {children}
              </div>
            )
          ) : (
            <pre style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              maxHeight: 360,
              overflowY: 'auto',
              padding: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#020902',
            }}>
              {text}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}


function FixturesByRoundCard({ groups, players, fixtures, fixtureConfig }) {
  const rounds = buildMatchdays(groups, fixtures, fixtureConfig)
  const roundRefs = Array.from({ length: rounds.length }, () => useRef(null))

  if (rounds.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: 12 }}>No fixtures yet.</p>
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {rounds.map((round, rIdx) => (
        <div key={rIdx}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <ImageButton targetRef={roundRefs[rIdx]} filename={`ea26-fixtures-matchday-${rIdx + 1}`} size="small" />
          </div>
          <div ref={roundRefs[rIdx]}>
            <CaptureShell
              title={`${round.label} FIXTURES`}
              subtitle={`${round.matches.length} matches scheduled`}
              badge="📅 MATCHDAY FIXTURES"
            >
              <div style={{ display: 'grid', gap: 12 }}>
                {round.matches.map(({ group, f }, i) => (
                  <div key={f.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '72px minmax(0, 1fr) 76px minmax(0, 1fr)',
                    gap: 10,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ fontSize: 11, color: '#8fa58f' }}>{group.name}</div>
                    <div style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pName(players, f.homeId)}</div>
                    <div style={{
                      padding: '7px 10px', textAlign: 'center', borderRadius: 10,
                      background: '#081808', border: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: 'Barlow', fontSize: 11, color: '#5f7a5f', letterSpacing: 0.3,
                    }}>vs</div>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pName(players, f.awayId)}</div>
                  </div>
                ))}
              </div>
            </CaptureShell>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main export page ──────────────────────────────────────────────────────

export default function WhatsAppExport({
  players, groups, fixtures, fixtureConfig,
  qualifierConfig, knockoutBracket,
}) {
  const fullText = [
    exportFixtures(groups, players, fixtures, fixtureConfig),
    exportResultsByRound(groups, players, fixtures, fixtureConfig),
    exportGroupStandings(groups, players, fixtures, qualifierConfig),
    exportQualifiers(groups, players, fixtures, qualifierConfig),
    exportKnockoutResults(players, fixtures, knockoutBracket, fixtureConfig),
    exportLeaderboard(players, fixtures),
  ].join('\n\n' + '═'.repeat(32) + '\n\n')

  const groupFixtures = fixtures.filter(f => f.type === 'group')
  const playedFixtures = fixtures.filter(f => f.played && !f.isBye)
  const roundsCount = useMemo(() => {
    const counts = groups.map(g => groupFixtures.filter(f => f.groupId === g.id).length)
    return Math.max(...counts, 0)
  }, [groups, groupFixtures])

  const exports = [
    {
      icon: '📅',
      title: 'FIXTURES',
      filename: 'ea26-fixtures',
      description: 'All group stage fixtures by group and leg.',
      text: exportFixtures(groups, players, fixtures, fixtureConfig),
      card: null,
      tone: 'gold',
    },
    {
      icon: '📅',
      title: 'FIXTURES BY MATCHDAY',
      filename: 'ea26-fixtures-by-matchday',
      description: 'All fixtures grouped by matchday — one image per matchday, perfect for announcing upcoming games.',
      text: exportFixturesByRound(groups, players, fixtures, fixtureConfig),
      card: <FixturesByRoundCard groups={groups} players={players} fixtures={fixtures} fixtureConfig={fixtureConfig} />,
      multiImage: true,
      tone: 'blue',
    },
    {
      icon: '⚽',
      title: 'MATCH RESULTS BY ROUND',
      filename: 'ea26-results',
      description: 'One image per round — each group result bundled for quick WhatsApp updates.',
      text: exportResultsByRound(groups, players, fixtures, fixtureConfig),
      card: <PerRoundResults groups={groups} players={players} fixtures={fixtures} fixtureConfig={fixtureConfig} />,
      multiImage: true,
      tone: 'green',
    },
    {
      icon: '📊',
      title: 'GROUP STANDINGS',
      filename: 'ea26-standings',
      description: 'Full standings table for every group with qualifier highlighting.',
      text: exportGroupStandings(groups, players, fixtures, qualifierConfig),
      card: <StandingsCard groups={groups} players={players} fixtures={fixtures} qualifierConfig={qualifierConfig} />,
      tone: 'blue',
    },
    {
      icon: '✅',
      title: 'QUALIFIER LIST',
      filename: 'ea26-qualifiers',
      description: 'Direct qualifiers plus wildcard spots in one clean share card.',
      text: exportQualifiers(groups, players, fixtures, qualifierConfig),
      card: <QualifiersCard groups={groups} players={players} fixtures={fixtures} qualifierConfig={qualifierConfig} />,
      tone: 'green',
    },
    {
      icon: '🏆',
      title: 'KNOCKOUT RESULTS',
      filename: 'ea26-knockout',
      description: 'All knockout round results and who advanced.',
      text: exportKnockoutResults(players, fixtures, knockoutBracket, fixtureConfig),
      card: null,
      tone: 'gold',
    },
    {
      icon: '🏅',
      title: 'OVERALL LEADERBOARD',
      filename: 'ea26-leaderboard',
      description: 'Overall rankings by total points and goals scored.',
      text: exportLeaderboard(players, fixtures),
      card: <LeaderboardCard players={players} fixtures={fixtures} />,
      tone: 'blue',
    },
  ]

  return (
    <div className="fade-up">
      <div
        className="card"
        style={{
          padding: 24,
          marginBottom: 22,
          borderRadius: 22,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(9,32,9,0.98) 0%, rgba(4,14,4,0.98) 58%, rgba(36,30,8,0.95) 100%)',
          border: '1px solid rgba(245,197,24,0.18)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top right, rgba(245,197,24,0.14), transparent 30%), radial-gradient(circle at left center, rgba(89,164,89,0.14), transparent 24%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                marginBottom: 10,
                background: 'rgba(245,197,24,0.08)',
                border: '1px solid rgba(245,197,24,0.18)',
                fontSize: 11,
                letterSpacing: 1.4,
                color: 'var(--gold)',
              }}>
                📤 WHATSAPP SHARE CENTER
              </div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 42, lineHeight: 0.95, letterSpacing: 2, color: 'var(--gold)', marginBottom: 8 }}>
                EXPORT HUB
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 760 }}>
                Generate polished share cards for WhatsApp, or copy plain-text versions as backup. This page turns your tournament data into quick updates the group can actually enjoy reading.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <CopyButton text={fullText} label="📦 Copy Full Report" />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 18,
          }}>
            <div style={{
              padding: 18,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 6 }}>EXPORT MODE</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1.4, color: 'var(--text-primary)', marginBottom: 8 }}>
                IMAGE + TEXT
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Use image cards for presentation and plain text as fallback when speed matters.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <SectionChip>📸 Save PNG</SectionChip>
                <SectionChip color="#8fd38d" bg="rgba(143,211,141,0.10)">📋 Copy text</SectionChip>
                <SectionChip color="#86c7ff" bg="rgba(134,199,255,0.10)">📱 WhatsApp ready</SectionChip>
              </div>
            </div>

            <div style={{
              padding: 18,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 10 }}>QUICK GUIDE</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  'Preview the card',
                  'Save image or copy text',
                  'Paste straight into WhatsApp',
                ].map(step => (
                  <div key={step} style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        <HeroMetric label="EXPORT SECTIONS" value={exports.length} sub="Fixtures, results, standings, qualifiers, knockout, leaderboard" accent="var(--gold)" />
        <HeroMetric label="GROUPS" value={groups.length} sub="Grouped content ready for share cards" accent="#8fd38d" />
        <HeroMetric label="PLAYED MATCHES" value={playedFixtures.length} sub="Completed fixtures available for reporting" accent="#86c7ff" />
        <HeroMetric label="ROUND CARDS" value={roundsCount} sub="Potential per-round result images" accent="#c9d5c9" />
      </div>

      <div className="card" style={{
        padding: 18,
        marginBottom: 24,
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1.4, color: 'var(--gold)' }}>FULL TOURNAMENT REPORT</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Copy all sections at once as one long text update for fast posting.
          </div>
        </div>
        <CopyButton text={fullText} label="📋 Copy Full Report" />
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {exports.map(section => (
          <ExportSection
            key={section.title}
            icon={section.icon}
            title={section.title}
            description={section.description}
            text={section.text}
            filename={section.filename}
            multiImage={section.multiImage}
            tone={section.tone}
          >
            {section.card}
          </ExportSection>
        ))}
      </div>
    </div>
  )
}