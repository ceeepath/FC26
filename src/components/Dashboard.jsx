import { useState, useEffect } from 'react'
// ── Color helper — replaces color-mix() for Safari < 15.4 compatibility ──
const CSS_VAR_MAP = {
  'var(--gold)':        '#d4af37',
  'var(--gold-dim)':    '#b8962e',
  'var(--card-green)':  '#5d8f6a',
  'var(--card-blue)':   '#6d8ca6',
  'var(--card-orange)': '#a67943',
  'var(--card-teal)':   '#5a8c86',
  'var(--card-purple)': '#7f6e9e',
  'var(--text-muted)':  '#8f978f',
}

function withAlpha(color, alpha) {
  const hex = CSS_VAR_MAP[color] ?? color
  // Parse hex → r,g,b
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getPhaseData({ groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures }) {
  const allGroupDone = totalGroupFixtures > 0 && playedGroupFixtures === totalGroupFixtures

  if (knockoutLocked && playedKOFixtures === totalKOFixtures && totalKOFixtures > 0) {
    return { label: 'COMPLETE', color: 'var(--gold)', blurb: 'Tournament finished. Crown your champion.' }
  }
  if (knockoutLocked) {
    return { label: 'KNOCKOUT', color: 'var(--gold-dim)', blurb: 'Bracket is live. Advance toward the final.' }
  }
  if (allGroupDone) {
    return { label: 'KNOCKOUT SETUP', color: 'var(--card-orange)', blurb: 'Group stage is done. Seed the bracket next.' }
  }
  if (totalGroupFixtures > 0) {
    return { label: 'GROUP STAGE', color: 'var(--card-green)', blurb: 'Results are coming in. Tables update live.' }
  }
  if (groups.length > 0) {
    return { label: 'GROUP SETUP', color: 'var(--card-blue)', blurb: 'Groups are ready. Generate fixtures when set.' }
  }
  return { label: 'REGISTRATION', color: 'var(--text-muted)', blurb: 'Add players to kick off the tournament.' }
}

function getNextStep({ players, groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures }) {
  if (players.length === 0) return 'Add players to start building the tournament.'
  if (groups.length === 0) return 'Create or auto-assign groups for all registered players.'
  if (totalGroupFixtures === 0) return 'Generate group fixtures to begin match scheduling.'
  if (playedGroupFixtures < totalGroupFixtures) return 'Enter remaining group results to complete the standings.'
  if (!knockoutLocked) return 'Lock in qualifiers and generate the knockout bracket.'
  if (playedKOFixtures < totalKOFixtures) return 'Continue entering knockout results until a champion emerges.'
  return 'Everything is done. Export results and celebrate the winner.'
}

function pName(players, id) {
  if (!id || id === 'BYE') return 'BYE'
  return players.find(p => p.id === id)?.name ?? '???'
}

function pGameId(players, id) {
  if (!id || id === 'BYE') return ''
  return players.find(p => p.id === id)?.gameId ?? ''
}

function panelStyle(extra = {}) {
  return {
    background: 'linear-gradient(180deg, rgba(16,29,23,0.94), rgba(10,19,15,0.98))',
    border: '1px solid var(--border-soft)',
    borderRadius: 18,
    boxShadow: 'var(--shadow-card)',
    ...extra,
  }
}

function SectionHeader({ title, meta }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border-soft)',
    }}>
      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, letterSpacing: 1.6, color: 'var(--gold)' }}>
        {title}
      </span>
      {meta ? <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta}</span> : null}
    </div>
  )
}

function StatCard({ icon, label, value, sub, accent = 'var(--gold)' }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        borderRadius: 18,
        background: `linear-gradient(180deg, ${withAlpha(accent, 0.10)}, rgba(16,29,23,0.96))`,
        border: `1px solid ${withAlpha(accent, 0.35)}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5 }}>{label}</div>
        <div style={{
          width: 38, height: 38, borderRadius: 14,
          display: 'grid', placeItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-soft)',
          fontSize: 18,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 42, lineHeight: 0.95, color: 'var(--text-primary)', marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>

      <div style={{
        marginTop: 18,
        height: 3,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
      }} />
    </div>
  )
}

function miniBoard(players, fixtures) {
  const played = fixtures.filter(f => f.played && !f.isBye)
  return players
    .map(player => {
      let Pts = 0, W = 0, D = 0, L = 0, GF = 0
      played.forEach(f => {
        const isHome = f.homeId === player.id
        const isAway = f.awayId === player.id
        if (!isHome && !isAway) return
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
      return { ...player, Pts, W, D, L, GF }
    })
    .filter(p => p.Pts > 0 || p.GF > 0)
    .sort((a, b) => b.Pts - a.Pts || b.GF - a.GF || a.name.localeCompare(b.name))
    .slice(0, 3)
}

export default function Dashboard({ players, groups, fixtures, knockoutBracket, qualifierConfig }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const groupFixtures = fixtures.filter(f => f.type === 'group')
  const knockoutFixtures = fixtures.filter(f => f.type === 'knockout')
  const playedGroupFixtures = groupFixtures.filter(f => f.played).length
  const totalGroupFixtures = groupFixtures.length
  const playedKOFixtures = knockoutFixtures.filter(f => f.played).length
  const totalKOFixtures = knockoutFixtures.length
  const playedFixtures = fixtures.filter(f => f.played && !f.isBye).length
  const knockoutLocked = !!knockoutBracket?.locked

  const qualifiedCount =
    Object.values(qualifierConfig?.perGroup ?? {}).reduce((sum, n) => sum + (Number(n) || 0), 0) +
    (qualifierConfig?.bestLosers ?? 0)

  const phase = getPhaseData({ groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures })
  const nextStep = getNextStep({ players, groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures })

  const totalPossible = totalGroupFixtures + totalKOFixtures
  const completion = totalPossible > 0 ? Math.round(((playedGroupFixtures + playedKOFixtures) / totalPossible) * 100) : 0

  const topBoard = miniBoard(players, fixtures)

  // Upcoming: show the first incomplete matchday across all groups
  const upcoming = (() => {
    const groupFix = fixtures.filter(f => f.type === 'group' && !f.isBye)
    if (!groupFix.length) return fixtures.filter(f => f.type === 'knockout' && !f.played && !f.isBye).slice(0, 4)

    const legs = groupFix.some(f => f.leg === 2) ? 2 : 1
    const groupBuckets = groups.map(group => {
      const all = groupFix.filter(f => f.groupId === group.id)
      const n = group.playerIds?.length ?? 4
      const perDay = Math.max(1, Math.floor(n / 2))
      const pairIdxs = [...new Set(all.map(f => f.pairIdx))].sort((a, b) => a - b)
      const buckets = []
      for (let i = 0; i < pairIdxs.length; i += perDay) buckets.push(pairIdxs.slice(i, i + perDay))
      return { group, all, buckets }
    })
    const maxDays = Math.max(...groupBuckets.map(b => b.buckets.length), 0)

    for (let dayIdx = 0; dayIdx < maxDays; dayIdx++) {
      for (let leg = 1; leg <= legs; leg++) {
        const dayFixtures = groupBuckets.flatMap(({ all, buckets }) => {
          const chunk = buckets[dayIdx]
          if (!chunk) return []
          return chunk.map(pairIdx => all.find(f => f.pairIdx === pairIdx && f.leg === leg)).filter(Boolean)
        })
        if (dayFixtures.some(f => !f.played)) return dayFixtures
      }
    }
    return []
  })()

  // Label for which matchday is shown
  const upcomingLabel = (() => {
    const groupFix = fixtures.filter(f => f.type === 'group' && !f.isBye)
    if (!groupFix.length || !upcoming.length) return 'UPCOMING MATCHES'
    const legs = groupFix.some(f => f.leg === 2) ? 2 : 1
    const f0 = upcoming[0]
    const groupBuckets = groups.map(group => {
      const all = groupFix.filter(fx => fx.groupId === group.id)
      const n = group.playerIds?.length ?? 4
      const perDay = Math.max(1, Math.floor(n / 2))
      const pairIdxs = [...new Set(all.map(fx => fx.pairIdx))].sort((a, b) => a - b)
      const buckets = []
      for (let i = 0; i < pairIdxs.length; i += perDay) buckets.push(pairIdxs.slice(i, i + perDay))
      return { groupId: group.id, buckets }
    })
    const gb = groupBuckets.find(b => b.groupId === f0.groupId)
    if (!gb) return 'UPCOMING MATCHES'
    const dayIdx = gb.buckets.findIndex(chunk => chunk.includes(f0.pairIdx))
    if (dayIdx === -1) return 'UPCOMING MATCHES'
    return legs === 2
      ? `MATCHDAY ${dayIdx + 1} · LEG ${f0.leg}`
      : `MATCHDAY ${dayIdx + 1}`
  })()

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{
        ...panelStyle(),
        padding: 24,
        background: `
          radial-gradient(circle at top right, ${withAlpha(phase.color, 0.18)} 0%, transparent 30%),
          radial-gradient(circle at bottom left, rgba(212,175,55,0.06) 0%, transparent 25%),
          linear-gradient(135deg, rgba(13,24,19,0.98), rgba(7,17,12,0.98))
        `,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 0.7fr)', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{
                padding: '7px 14px', borderRadius: 999,
                border: `1px solid ${withAlpha(phase.color, 0.40)}`,
                background: withAlpha(phase.color, 0.12),
                fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: 1.8, fontSize: 14, color: phase.color,
              }}>
                {phase.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{phase.blurb}</div>
            </div>

            <h1 style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 46, lineHeight: 0.95, letterSpacing: 1.8,
              marginBottom: 8,
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--text-secondary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              EA26 TOURNAMENT DASHBOARD
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.6 }}>
              TNC Community · FIFA PS5 Competition. Track registrations, group progress, standings, fixtures,
              and the road to the championship from one control center.
            </p>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px, 0.9fr)', gap: 16 }}>
              <div style={{
                borderRadius: 16, padding: '16px 18px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-soft)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, letterSpacing: 1.5, color: 'var(--gold)' }}>TOURNAMENT PROGRESS</span>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>{completion}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{
                    width: `${completion}%`, height: '100%', borderRadius: 999,
                    background: 'linear-gradient(90deg, var(--card-green), var(--gold))',
                  }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                  {[
                    ['Players', players.length],
                    ['Groups', groups.length],
                    ['Played', playedFixtures],
                    ['Qualify', qualifiedCount],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                borderRadius: 16, padding: '16px 18px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-soft)',
              }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, letterSpacing: 1.5, color: 'var(--gold)', marginBottom: 10 }}>NEXT STEP</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{nextStep}</p>
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <SectionHeader title="TOURNAMENT SNAPSHOT" meta={`${playedFixtures}/${totalPossible || 0} played`} />
            <div style={{ padding: 18, display: 'grid', gap: 14 }}>
              {[
                ['Registration', `${players.length} players added`, players.length > 0],
                ['Groups', `${groups.length} groups configured`, groups.length > 0],
                ['Group Stage', `${playedGroupFixtures}/${totalGroupFixtures} matches complete`, totalGroupFixtures > 0],
                ['Knockout', `${playedKOFixtures}/${totalKOFixtures} matches complete`, totalKOFixtures > 0],
              ].map(([title, meta, ok]) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    background: ok ? 'rgba(93,143,106,0.14)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${ok ? 'rgba(93,143,106,0.22)' : 'var(--border-soft)'}`,
                    color: ok ? 'var(--card-green)' : 'var(--text-muted)',
                    fontSize: 13,
                    flexShrink: 0,
                  }}>
                    {ok ? '✓' : '•'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <StatCard icon="👥" label="PLAYERS" value={players.length} sub={`${groups.length} groups created`} accent="var(--card-green)" />
        <StatCard icon="📋" label="GROUPS" value={groups.length} sub={`${qualifiedCount} slots to knockout`} accent="var(--card-blue)" />
        <StatCard icon="⚽" label="MATCHES" value={fixtures.length} sub={`${playedFixtures} played so far`} accent="var(--card-orange)" />
        <StatCard icon="🏆" label="CURRENT PHASE" value={phase.label} sub={phase.blurb} accent="var(--gold)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr', gap: 18 }}>
        <div style={{ ...panelStyle(), overflow: 'hidden' }}>
          <SectionHeader title={upcomingLabel} meta={`${playedFixtures}/${fixtures.length} played`} />
          <div style={{ padding: 8 }}>
            {upcoming.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No upcoming fixtures right now.</div>
            ) : upcoming.map(f => (
              <div key={f.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: 12,
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ justifySelf: 'end', textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{pName(players, f.homeId)}</div>
                  {pGameId(players, f.homeId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{pGameId(players, f.homeId)}</div>}
                </div>
                <div style={{
                  minWidth: 66,
                  padding: '6px 12px',
                  textAlign: 'center',
                  borderRadius: 10,
                  border: '1px solid var(--border-soft)',
                  background: 'rgba(255,255,255,0.02)',
                  fontFamily: 'Barlow Condensed',
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: 'var(--text-muted)',
                }}>
                  VS
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{pName(players, f.awayId)}</div>
                  {pGameId(players, f.awayId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{pGameId(players, f.awayId)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panelStyle(), overflow: 'hidden' }}>
          <SectionHeader title="LEADERBOARD" meta="Points · Wins · Form" />
          <div style={{ padding: 16, display: 'grid', gap: 16 }}>
            {topBoard.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Leaderboard will fill once results are entered.</div>
            ) : topBoard.map((p, idx) => {
              const medals = ['🥇', '🥈', '🥉']
              const maxPts = topBoard[0]?.Pts || 1
              return (
                <div key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{medals[idx] ?? '•'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                        {p.gameId && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{p.gameId}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: idx === 0 ? 'var(--gold)' : 'var(--text-primary)' }}>
                        {p.Pts}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>pts</span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${(p.Pts / maxPts) * 100}%`,
                      height: '100%',
                      background: idx === 0 ? 'linear-gradient(90deg, var(--gold-dim), var(--gold))' : `linear-gradient(90deg, var(--card-green), ${withAlpha('var(--card-green)', 0.6)})`,
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                    {p.W}W · {p.D}D · {p.L}L
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}