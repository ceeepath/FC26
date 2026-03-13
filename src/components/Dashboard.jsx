function countQualified(groups, qualifierConfig) {
  const direct = groups.reduce(
    (sum, group) => sum + (qualifierConfig?.perGroup?.[group.id] ?? 2),
    0,
  )
  return direct + (qualifierConfig?.bestLosers ?? 0)
}

function calcLeaderboard(players, fixtures) {
  const played = fixtures.filter(f => f.played && !f.isBye)
  return players
    .map(player => {
      let W = 0, D = 0, L = 0, GF = 0, Pts = 0, MP = 0
      played.forEach(f => {
        const isHome = f.homeId === player.id
        const isAway = f.awayId === player.id
        if (!isHome && !isAway) return
        MP++
        const myGoals = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0)
        const theirGoals = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0)
        GF += myGoals
        if (f.manualWinnerId) {
          if (f.manualWinnerId === player.id) { W++; Pts += 3 }
          else L++
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
}

function getPhaseData({ groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures }) {
  const allGroupDone = totalGroupFixtures > 0 && playedGroupFixtures === totalGroupFixtures

  if (knockoutLocked && playedKOFixtures === totalKOFixtures && totalKOFixtures > 0) {
    return { label: 'COMPLETE', color: '#F5C518', blurb: 'Tournament finished. Crown your champion.' }
  }
  if (knockoutLocked) {
    return { label: 'KNOCKOUT', color: '#c9960f', blurb: 'Bracket is live. Advance toward the final.' }
  }
  if (allGroupDone) {
    return { label: 'KNOCKOUT SETUP', color: '#8a7a00', blurb: 'Group stage is done. Seed the bracket next.' }
  }
  if (totalGroupFixtures > 0) {
    return { label: 'GROUP STAGE', color: '#4caf50', blurb: 'Results are coming in. Tables update live.' }
  }
  if (groups.length > 0) {
    return { label: 'GROUP SETUP', color: '#6aaeff', blurb: 'Groups are ready. Generate fixtures when set.' }
  }
  return { label: 'REGISTRATION', color: '#7a9a7a', blurb: 'Add players to kick off the tournament.' }
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

function panelStyle(extra = {}) {
  return {
    background: 'linear-gradient(180deg, rgba(8,18,8,0.98), rgba(5,11,5,0.98))',
    border: '1px solid var(--green-border)',
    borderRadius: 18,
    boxShadow: 'var(--shadow-card)',
    ...extra,
  }
}

function SectionHeader({ title, meta }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '16px 18px', borderBottom: '1px solid #102010',
    }}>
      <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 2, color: 'var(--gold)' }}>
        {title}
      </span>
      {meta ? <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta}</span> : null}
    </div>
  )
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', minHeight: 126,
      borderRadius: 18,
      background: 'linear-gradient(160deg, rgba(10,24,10,0.98), rgba(6,12,6,0.98))',
      border: `1px solid ${accent}55`,
      boxShadow: 'var(--shadow-card)',
      padding: 18,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at top right, ${accent}22 0%, transparent 42%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1.2 }}>{label}</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 44, lineHeight: 1, color: 'var(--text-primary)', marginTop: 10 }}>
            {value}
          </div>
          {sub ? <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div> : null}
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${accent}18`, border: `1px solid ${accent}44`,
          display: 'grid', placeItems: 'center', fontSize: 20,
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 18, right: 18, bottom: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: 999,
      }} />
    </div>
  )
}

function MatchRow({ left, middle, right, pending = false }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center',
      padding: '12px 18px', borderBottom: '1px solid #0d1d0d',
    }}>
      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: pending ? '#d8e2d8' : 'var(--text-primary)' }}>{left}</div>
      <div style={{
        minWidth: 72, textAlign: 'center', borderRadius: 8,
        padding: '4px 10px', border: `1px solid ${pending ? '#2a3a2a' : '#2a5a00'}`,
        background: pending ? '#081208' : '#1a2e00',
        fontFamily: 'Bebas Neue', fontSize: 16,
        color: pending ? 'var(--text-muted)' : '#a0d060',
        letterSpacing: 1.5,
      }}>
        {middle}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: pending ? '#d8e2d8' : 'var(--text-primary)' }}>{right}</div>
    </div>
  )
}

function LeaderRow({ rank, player, topPts }) {
  const medals = ['🥇', '🥈', '🥉']
  const width = topPts > 0 ? Math.max(10, Math.round((player.Pts / topPts) * 100)) : 10
  return (
    <div style={{ padding: '12px 18px', borderBottom: '1px solid #0d1d0d' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ minWidth: 28, textAlign: 'center', fontSize: rank < 3 ? 18 : 15, color: rank >= 3 ? 'var(--text-muted)' : undefined }}>
          {rank < 3 ? medals[rank] : rank + 1}
        </div>
        <div style={{ flex: 1, fontWeight: 700, color: rank === 0 ? 'var(--gold)' : 'var(--text-primary)' }}>{player.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: rank === 0 ? 'var(--gold)' : 'var(--text-primary)' }}>{player.Pts}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>pts</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
        <div style={{ height: 6, borderRadius: 999, background: '#102010', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${width}%`, borderRadius: 999,
            background: rank === 0
              ? 'linear-gradient(90deg, var(--gold-dim), var(--gold))'
              : 'linear-gradient(90deg, #295529, #4c8f4c)',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {player.W}W · {player.D}D · {player.L}L
        </div>
      </div>
    </div>
  )
}

function GroupCard({ group, players, fixtures, qualifierConfig }) {
  const groupPlayers = (group.playerIds ?? []).filter(id => players.some(p => p.id === id))
  const groupTotal = fixtures.filter(f => f.type === 'group' && f.groupId === group.id).length
  const groupPlayed = fixtures.filter(f => f.type === 'group' && f.groupId === group.id && f.played).length
  const qualifiers = qualifierConfig?.perGroup?.[group.id] ?? 2
  const progress = groupTotal > 0 ? Math.round((groupPlayed / groupTotal) * 100) : 0

  const colorMap = ['#c9960f', '#4cdf8a', '#6aaeff', '#e07ae0', '#f0a060', '#60e0e0', '#e06060', '#a0d060']
  const accent = colorMap[group.colorIdx % colorMap.length]

  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(9,18,9,0.96), rgba(5,11,5,0.96))',
      border: `1px solid ${accent}44`,
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${accent}33`,
        background: `linear-gradient(90deg, ${accent}22, transparent)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 2, color: accent }}>{group.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top {qualifiers}</div>
        </div>
        <div style={{ marginTop: 10, height: 5, borderRadius: 999, background: '#102010', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        </div>
      </div>

      <div style={{ padding: '10px 16px 12px' }}>
        {groupPlayers.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No players assigned yet</div>
        ) : (
          groupPlayers.map((id, index) => (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, padding: '8px 0', borderBottom: index === groupPlayers.length - 1 ? 'none' : '1px solid #0d1d0d',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${accent}20`, border: `1px solid ${accent}44`, display: 'grid', placeItems: 'center', fontSize: 11, color: accent, fontWeight: 700 }}>
                  {index + 1}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{pName(players, id)}</span>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: index < qualifiers ? '#4caf50' : '#e05252', boxShadow: index < qualifiers ? '0 0 8px rgba(76,175,80,0.35)' : 'none' }} />
            </div>
          ))
        )}

        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          {groupTotal > 0 ? `${groupPlayed}/${groupTotal} matches played` : 'Fixtures not generated yet'}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ players, groups, fixtures, knockoutBracket, qualifierConfig }) {
  const totalGroupFixtures = fixtures.filter(f => f.type === 'group').length
  const playedGroupFixtures = fixtures.filter(f => f.type === 'group' && f.played).length
  const totalKOFixtures = fixtures.filter(f => f.type === 'knockout' && !f.isBye).length
  const playedKOFixtures = fixtures.filter(f => f.type === 'knockout' && !f.isBye && f.played).length
  const totalFixtures = totalGroupFixtures + totalKOFixtures
  const playedFixtures = playedGroupFixtures + playedKOFixtures
  const knockoutLocked = knockoutBracket?.locked

  const unplayed = fixtures.filter(f => !f.played && !f.isBye).slice(0, 5)
  const recent = fixtures.filter(f => f.played && !f.isBye).slice(-5).reverse()
  const board = calcLeaderboard(players, fixtures).slice(0, 5)
  const topPts = board[0]?.Pts ?? 0
  const qualifiedCount = countQualified(groups, qualifierConfig)
  const phase = getPhaseData({ groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures })
  const nextStep = getNextStep({ players, groups, totalGroupFixtures, playedGroupFixtures, knockoutLocked, totalKOFixtures, playedKOFixtures })
  const completion = totalFixtures > 0 ? Math.round((playedFixtures / totalFixtures) * 100) : 0

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{
        ...panelStyle(),
        padding: 24,
        background: `
          radial-gradient(circle at top right, ${phase.color}22 0%, transparent 30%),
          radial-gradient(circle at bottom left, rgba(245,197,24,0.08) 0%, transparent 25%),
          linear-gradient(135deg, rgba(8,18,8,0.98), rgba(4,10,4,0.98))
        `,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 0.7fr)', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{
                padding: '7px 14px', borderRadius: 999,
                border: `1px solid ${phase.color}55`, background: `${phase.color}12`,
                fontFamily: 'Bebas Neue', letterSpacing: 2, fontSize: 14, color: phase.color,
              }}>
                {phase.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{phase.blurb}</div>
            </div>

            <h1 style={{
              fontFamily: 'Bebas Neue', fontSize: 44, lineHeight: 0.95, letterSpacing: 2.5,
              marginBottom: 8,
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), #ffe066)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              EA26 TOURNAMENT DASHBOARD
            </h1>
            <p style={{ fontSize: 14, color: '#c9d6c9', maxWidth: 700, lineHeight: 1.6 }}>
              TNC Community · FIFA PS5 Competition. Track registrations, group progress, standings, fixtures,
              and the road to the championship from one control center.
            </p>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px, 0.9fr)', gap: 16 }}>
              <div style={{
                borderRadius: 16, padding: '16px 18px', background: 'rgba(3,12,3,0.72)', border: '1px solid #143014',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)' }}>TOURNAMENT PROGRESS</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: 'var(--text-primary)' }}>{completion}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: '#102010', overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{
                    width: `${completion}%`, height: '100%', borderRadius: 999,
                    background: 'linear-gradient(90deg, #2f7c2f, var(--gold))',
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
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)' }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                borderRadius: 16, padding: '16px 18px', background: 'rgba(3,12,3,0.72)', border: '1px solid #143014',
              }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)', marginBottom: 10 }}>NEXT STEP</div>
                <p style={{ fontSize: 13, color: '#c9d6c9', lineHeight: 1.6 }}>{nextStep}</p>
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(6,14,6,0.96), rgba(4,9,4,0.96))',
            border: '1px solid #173317',
            boxShadow: 'var(--shadow-card)',
          }}>
            <SectionHeader title="TOURNAMENT SNAPSHOT" meta={totalFixtures > 0 ? `${playedFixtures}/${totalFixtures} played` : 'Waiting for fixtures'} />
            <div style={{ padding: 18, display: 'grid', gap: 14 }}>
              {[
                ['Registration', players.length > 0 ? `${players.length} players added` : 'No players yet'],
                ['Groups', groups.length > 0 ? `${groups.length} group${groups.length !== 1 ? 's' : ''} configured` : 'Groups not created'],
                ['Group Stage', totalGroupFixtures > 0 ? `${playedGroupFixtures}/${totalGroupFixtures} matches complete` : 'Fixtures not generated'],
                ['Knockout', knockoutLocked ? `${playedKOFixtures}/${totalKOFixtures} matches complete` : 'Bracket not started'],
              ].map(([label, value], idx) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    background: idx <= 1 || (idx === 2 && totalGroupFixtures > 0) || (idx === 3 && knockoutLocked)
                      ? 'rgba(76,175,80,0.16)'
                      : 'rgba(255,255,255,0.04)',
                    border: idx <= 1 || (idx === 2 && totalGroupFixtures > 0) || (idx === 3 && knockoutLocked)
                      ? '1px solid rgba(76,175,80,0.28)'
                      : '1px solid rgba(255,255,255,0.06)',
                    color: idx <= 1 || (idx === 2 && totalGroupFixtures > 0) || (idx === 3 && knockoutLocked)
                      ? '#78d278'
                      : 'var(--text-muted)',
                    fontSize: 12,
                  }}>
                    {idx <= 1 || (idx === 2 && totalGroupFixtures > 0) || (idx === 3 && knockoutLocked) ? '✓' : '•'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon="👥" label="PLAYERS" value={players.length} sub={players.length ? `${groups.length} group${groups.length !== 1 ? 's' : ''} created` : 'Build your roster'} accent="#4cdf8a" />
        <StatCard icon="📋" label="GROUPS" value={groups.length || '—'} sub={groups.length ? `${qualifiedCount} slots to knockout` : 'No groups yet'} accent="#6aaeff" />
        <StatCard icon="⚽" label="MATCHES" value={totalFixtures || '—'} sub={totalFixtures ? `${playedFixtures} played so far` : 'Awaiting fixtures'} accent="#f0a060" />
        <StatCard icon="🏆" label="CURRENT PHASE" value={phase.label.replace(' ', '\u00A0')} sub={phase.blurb} accent={phase.color} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)', gap: 20 }}>
        <div style={panelStyle({ overflow: 'hidden' })}>
          <SectionHeader title={unplayed.length > 0 ? 'UPCOMING MATCHES' : 'RECENT RESULTS'} meta={totalFixtures > 0 ? `${playedFixtures}/${totalFixtures} played` : ''} />
          {fixtures.length === 0 ? (
            <div style={{ padding: 34, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📅</div>
              No fixtures generated yet
            </div>
          ) : unplayed.length > 0 ? (
            <div>
              {unplayed.map(f => (
                <MatchRow
                  key={f.id}
                  left={pName(players, f.homeId)}
                  middle="VS"
                  right={pName(players, f.awayId)}
                  pending
                />
              ))}
            </div>
          ) : (
            <div>
              {recent.map(f => (
                <MatchRow
                  key={f.id}
                  left={pName(players, f.homeId)}
                  middle={`${f.homeScore} - ${f.awayScore}`}
                  right={pName(players, f.awayId)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={panelStyle({ overflow: 'hidden' })}>
          <SectionHeader title="LEADERBOARD" meta={board.length > 0 ? 'Points · Wins · Form' : ''} />
          {board.length === 0 ? (
            <div style={{ padding: 34, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🏅</div>
              No results yet
            </div>
          ) : (
            <div>
              {board.map((player, index) => (
                <LeaderRow key={player.id} rank={index} player={player} topPts={topPts} />
              ))}
            </div>
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 2, color: 'var(--gold)' }}>GROUPS OVERVIEW</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>World-Cup style cards for quick tournament scanning.</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{groups.length} group{groups.length !== 1 ? 's' : ''} configured</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                players={players}
                fixtures={fixtures}
                qualifierConfig={qualifierConfig}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
