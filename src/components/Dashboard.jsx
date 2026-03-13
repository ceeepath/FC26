function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a1a0a, #060e06)',
      border: `1px solid ${color ?? '#1a3a1a'}`,
      borderRadius: 14, padding: '20px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow bg */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${color ?? '#1a3a1a'}30 0%, transparent 70%)`,
      }} />
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 38, color: color ?? 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color ?? 'var(--text-muted)', marginTop: 4, opacity: 0.7 }}>{sub}</div>}
    </div>
  )
}

function calcLeaderboard(players, fixtures) {
  const played = fixtures.filter(f => f.played && !f.isBye)
  return players.map(player => {
    let W=0,D=0,L=0,GF=0,Pts=0,MP=0
    played.forEach(f => {
      const isHome=f.homeId===player.id, isAway=f.awayId===player.id
      if (!isHome&&!isAway) return
      MP++
      const mg=isHome?(f.homeScore??0):(f.awayScore??0), tg=isHome?(f.awayScore??0):(f.homeScore??0)
      GF+=mg
      if (f.manualWinnerId) { if(f.manualWinnerId===player.id){W++;Pts+=3} else L++ }
      else { if(mg>tg){W++;Pts+=3} else if(mg===tg){D++;Pts+=1} else L++ }
    })
    return { ...player, MP, W, D, L, GF, Pts }
  }).filter(p=>p.MP>0).sort((a,b)=>b.Pts-a.Pts||b.GF-a.GF||a.name.localeCompare(b.name))
}

export default function Dashboard({ players, groups, fixtures, knockoutBracket, qualifierConfig }) {
  const totalGroupFixtures  = fixtures.filter(f => f.type === 'group').length
  const playedGroupFixtures = fixtures.filter(f => f.type === 'group' && f.played).length
  const totalKOFixtures     = fixtures.filter(f => f.type === 'knockout' && !f.isBye).length
  const playedKOFixtures    = fixtures.filter(f => f.type === 'knockout' && !f.isBye && f.played).length
  const totalFixtures  = totalGroupFixtures + totalKOFixtures
  const playedFixtures = playedGroupFixtures + playedKOFixtures

  const unplayed = fixtures.filter(f => !f.played && !f.isBye).slice(0, 5)
  const board    = calcLeaderboard(players, fixtures).slice(0, 5)

  const pName = id => players.find(p=>p.id===id)?.name ?? '???'

  // Phase label
  const knockoutLocked = knockoutBracket?.locked
  const allGroupDone   = totalGroupFixtures > 0 && playedGroupFixtures === totalGroupFixtures
  let phase = 'REGISTRATION'
  if      (knockoutLocked && playedKOFixtures === totalKOFixtures && totalKOFixtures > 0) phase = 'COMPLETE'
  else if (knockoutLocked)    phase = 'KNOCKOUT'
  else if (allGroupDone)      phase = 'KNOCKOUT SETUP'
  else if (totalGroupFixtures > 0) phase = 'GROUP STAGE'
  else if (groups.length > 0) phase = 'GROUP SETUP'

  const phaseColors = {
    'REGISTRATION': '#4a6a4a',
    'GROUP SETUP':  '#6a6a00',
    'GROUP STAGE':  '#4a8a4a',
    'KNOCKOUT SETUP': '#8a7a00',
    'KNOCKOUT':     '#c9960f',
    'COMPLETE':     '#F5C518',
  }
  const phaseColor = phaseColors[phase] ?? '#4a6a4a'

  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣']

  return (
    <div className="fade-up">
      {/* Tournament name + phase badge */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 3, lineHeight: 1, marginBottom: 4,
            background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), #ffe066)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            EA26 TOURNAMENT
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>TNC Community · FIFA PS5 Competition</p>
        </div>
        <div style={{
          padding: '8px 18px', borderRadius: 20,
          background: `${phaseColor}18`,
          border: `1px solid ${phaseColor}50`,
          fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: 3,
          color: phaseColor,
        }}>
          {phase}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard icon="👥" label="PLAYERS" value={players.length} color="#4a8a6a"
          sub={groups.length > 0 ? `${groups.length} group${groups.length!==1?'s':''}` : 'Not grouped yet'} />
        <StatCard icon="📋" label="GROUPS" value={groups.length || '—'} color="#4a6a9a"
          sub={groups.length > 0 ? `${groups.map(g=>g.playerIds?.length??0).join(' · ')} players` : 'No groups yet'} />
        <StatCard icon="⚽" label="MATCHES" value={playedFixtures || '—'}
          color="#8a7a20"
          sub={totalFixtures > 0 ? `of ${totalFixtures} total` : 'No fixtures yet'} />
        {knockoutLocked && (
          <StatCard icon="🏆" label="KO STAGE" value={playedKOFixtures}
            color="var(--gold-dim)"
            sub={`of ${totalKOFixtures} KO matches`} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>

        {/* Upcoming / recent matches */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)' }}>
              {unplayed.length > 0 ? 'UPCOMING MATCHES' : 'RECENT RESULTS'}
            </span>
            {totalFixtures > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {playedFixtures}/{totalFixtures} played
              </span>
            )}
          </div>

          {unplayed.length === 0 && fixtures.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
              No fixtures generated yet
            </div>
          ) : unplayed.length === 0 ? (
            // Show recent results instead
            <div style={{ padding: '0' }}>
              {fixtures.filter(f => f.played && !f.isBye).slice(-5).reverse().map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderBottom: '1px solid #0a1a0a',
                }}>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13, textAlign: 'right' }}>{pName(f.homeId)}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: '#1a2e00', border: '1px solid #2a5a00',
                    fontFamily: 'Bebas Neue', fontSize: 16, color: '#a0d060', letterSpacing: 2,
                  }}>{f.homeScore}–{f.awayScore}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{pName(f.awayId)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {unplayed.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderBottom: '1px solid #0a1a0a',
                }}>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13, textAlign: 'right', color: '#c0d0c0' }}>{pName(f.homeId)}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: '#0a1a0a', border: '1px solid #1a3a1a',
                    fontFamily: 'Bebas Neue', fontSize: 14, color: 'var(--text-muted)', letterSpacing: 2,
                  }}>VS</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#c0d0c0' }}>{pName(f.awayId)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini leaderboard */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--green-border)' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)' }}>
              LEADERBOARD
            </span>
          </div>

          {board.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏅</div>
              No results yet
            </div>
          ) : (
            <div>
              {board.map((p, idx) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 18px', borderBottom: '1px solid #0a1a0a',
                  background: idx === 0 ? 'rgba(245,197,24,0.04)' : 'transparent',
                }}>
                  <span style={{ fontSize: idx < 3 ? 18 : 14, minWidth: 24, textAlign: 'center',
                    ...(idx >= 3 ? { fontFamily: 'Bebas Neue', color: 'var(--text-muted)' } : {})
                  }}>
                    {idx < 3 ? medals[idx] : `${idx+1}`}
                  </span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: idx===0?'var(--gold)':'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: idx===0?'var(--gold)':'var(--text-primary)' }}>
                      {p.Pts}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Groups overview */}
      {groups.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--green-border)' }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)' }}>
                GROUPS
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 0 }}>
              {groups.map(group => {
                const groupPlayed  = fixtures.filter(f=>f.type==='group'&&f.groupId===group.id&&f.played).length
                const groupTotal   = fixtures.filter(f=>f.type==='group'&&f.groupId===group.id).length
                const groupPlayers = group.playerIds?.filter(id=>players.some(p=>p.id===id)) ?? []
                return (
                  <div key={group.id} style={{ padding: '14px 16px', borderRight: '1px solid #0f1f0f', borderBottom: '1px solid #0f1f0f' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: 2, color: 'var(--gold-dim)', marginBottom: 8 }}>
                      {group.name}
                    </div>
                    {groupPlayers.map(id => (
                      <div key={id} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2a5a2a', flexShrink: 0 }} />
                        {pName(id)}
                      </div>
                    ))}
                    {groupTotal > 0 && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#3a6a3a' }}>
                        {groupPlayed}/{groupTotal} played
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}