import Avatar from './Avatar'

const STAT_CARDS = [
  { key: 'players', icon: '👥', label: 'PLAYERS REGISTERED', color: '#1a4a8a', glow: '#1a4a8a', text: '#6aaeff' },
  { key: 'groups',  icon: '📋', label: 'GROUPS',             color: '#1a5a2a', glow: '#1a5a2a', text: '#6adf8a' },
  { key: 'matches', icon: '⚽', label: 'MATCHES PLAYED',     color: '#7a3a08', glow: '#7a3a08', text: '#f0a060' },
  { key: 'stage',   icon: '🏆', label: 'CURRENT STAGE',      color: '#5a4a00', glow: '#5a4a00', text: '#F5C518' },
]

function StatCard({ icon, label, value, sub, color, glow, text }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}cc 0%, ${color}44 50%, rgba(6,14,6,0.95) 100%)`,
      border: `1px solid ${color}`,
      borderRadius: 14, padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 4px 24px ${glow}40, 0 1px 0 rgba(255,255,255,0.03) inset`,
    }}>
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow}50 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 40, color: text, lineHeight: 1, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: `${text}aa`, fontWeight: 700, letterSpacing: 1.5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: `${text}77`, marginTop: 5 }}>{sub}</div>}
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
      const mg=isHome?(f.homeScore??0):(f.awayScore??0)
      const tg=isHome?(f.awayScore??0):(f.homeScore??0)
      GF+=mg
      if (f.manualWinnerId) { if(f.manualWinnerId===player.id){W++;Pts+=3} else L++ }
      else { if(mg>tg){W++;Pts+=3} else if(mg===tg){D++;Pts+=1} else L++ }
    })
    return { ...player, MP, W, D, L, GF, Pts }
  }).filter(p=>p.MP>0).sort((a,b)=>b.Pts-a.Pts||b.GF-a.GF||a.name.localeCompare(b.name))
}

export default function Dashboard({ players, groups, fixtures, knockoutBracket, qualifierConfig }) {
  const totalGroupFix  = fixtures.filter(f => f.type === 'group').length
  const playedGroupFix = fixtures.filter(f => f.type === 'group' && f.played).length
  const totalKOFix     = fixtures.filter(f => f.type === 'knockout' && !f.isBye).length
  const playedKOFix    = fixtures.filter(f => f.type === 'knockout' && !f.isBye && f.played).length
  const totalFix  = totalGroupFix + totalKOFix
  const playedFix = playedGroupFix + playedKOFix

  const pName = id => players.find(p => p.id === id)?.name ?? '???'
  const board  = calcLeaderboard(players, fixtures).slice(0, 5)
  const upcoming = fixtures.filter(f => !f.played && !f.isBye).slice(0, 5)
  const recent   = fixtures.filter(f => f.played && !f.isBye).slice(-5).reverse()

  const knockoutLocked = knockoutBracket?.locked
  const allGroupDone   = totalGroupFix > 0 && playedGroupFix === totalGroupFix
  let stage = 'REGISTRATION'
  if (knockoutLocked && playedKOFix === totalKOFix && totalKOFix > 0) stage = 'COMPLETE 🏆'
  else if (knockoutLocked)   stage = 'KNOCKOUT'
  else if (allGroupDone)     stage = 'KO SETUP'
  else if (totalGroupFix > 0) stage = 'GROUP STAGE'
  else if (groups.length > 0) stage = 'GROUP SETUP'

  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣']

  return (
    <div className="fade-up">
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 4, lineHeight: 1, marginBottom: 4,
          background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), #ffe066)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>EA26 TOURNAMENT MANAGER</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 2 }}>TNC COMMUNITY · FIFA PS5 COMPETITION</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard {...STAT_CARDS[0]}
          value={players.length || '0'}
          sub={groups.length > 0 ? `in ${groups.length} group${groups.length!==1?'s':''}` : undefined}
        />
        <StatCard {...STAT_CARDS[1]}
          value={groups.length || '0'}
          sub={groups.length > 0 ? groups.map(g => `${g.name}: ${(g.playerIds||[]).length}`).join(', ') : undefined}
        />
        <StatCard {...STAT_CARDS[2]}
          value={totalFix > 0 ? `${playedFix}` : '0'}
          sub={totalFix > 0 ? `/ ${totalFix} total` : 'No fixtures yet'}
        />
        <StatCard {...STAT_CARDS[3]}
          value={stage}
        />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>

        {/* Upcoming / Recent matches */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '13px 18px', borderBottom: '1px solid rgba(40,80,40,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(26,60,10,0.5), transparent)',
          }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: 2, color: 'var(--gold)' }}>
              {upcoming.length > 0 ? 'UPCOMING MATCHES' : 'RECENT RESULTS'}
            </span>
            {totalFix > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {playedFix}/{totalFix}
              </span>
            )}
          </div>

          {totalFix === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📅</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No fixtures yet</p>
            </div>
          ) : (
            <div>
              {(upcoming.length > 0 ? upcoming : recent).map((f, i) => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 18px',
                  borderBottom: i < 4 ? '1px solid rgba(20,40,20,0.6)' : 'none',
                  transition: 'background 0.15s',
                }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 12, color: 'var(--text-muted)', minWidth: 16 }}>
                    {i+1}
                  </span>
                  <Avatar name={pName(f.homeId)} size={26} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pName(f.homeId)}
                  </span>
                  <div style={{
                    padding: '3px 10px', borderRadius: 6, minWidth: 52, textAlign: 'center',
                    background: f.played ? 'rgba(26,60,0,0.8)' : 'rgba(10,20,10,0.6)',
                    border: `1px solid ${f.played ? '#2a5a00' : '#1a3a1a'}`,
                  }}>
                    {f.played
                      ? <span style={{ fontFamily: 'Bebas Neue', fontSize: 15, color: '#a0df60', letterSpacing: 2 }}>{f.homeScore}–{f.awayScore}</span>
                      : <span style={{ fontFamily: 'Bebas Neue', fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>VS</span>
                    }
                  </div>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pName(f.awayId)}
                  </span>
                  <Avatar name={pName(f.awayId)} size={26} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '13px 18px', borderBottom: '1px solid rgba(40,80,40,0.4)',
            background: 'linear-gradient(90deg, rgba(60,40,0,0.5), transparent)',
          }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: 2, color: 'var(--gold)' }}>
              TOP PLAYERS
            </span>
          </div>

          {board.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🏅</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No results yet</p>
            </div>
          ) : (
            <div>
              {board.map((p, idx) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 18px',
                  borderBottom: idx < board.length-1 ? '1px solid rgba(20,40,20,0.6)' : 'none',
                  background: idx === 0 ? 'rgba(245,197,24,0.05)' : 'transparent',
                }}>
                  <span style={{ fontSize: idx < 3 ? 18 : 13, minWidth: 22, textAlign: 'center',
                    ...(idx >= 3 ? { fontFamily: 'Bebas Neue', color: 'var(--text-muted)' } : {})
                  }}>
                    {idx < 3 ? medals[idx] : `${idx+1}`}
                  </span>
                  <Avatar name={p.name} size={28} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: idx===0 ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: idx===0 ? 'var(--gold)' : '#8ab08a' }}>
                      {p.Pts}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 3 }}>pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Groups overview */}
      {groups.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '13px 18px', borderBottom: '1px solid rgba(40,80,40,0.4)',
            background: 'linear-gradient(90deg, rgba(10,40,26,0.6), transparent)',
          }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: 2, color: 'var(--gold)' }}>
              GROUPS OVERVIEW
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {groups.map((group, gi) => {
              const grpPlayed = fixtures.filter(f=>f.type==='group'&&f.groupId===group.id&&f.played).length
              const grpTotal  = fixtures.filter(f=>f.type==='group'&&f.groupId===group.id).length
              const grpPlayers = (group.playerIds||[]).filter(id => players.some(p=>p.id===id))
              const GROUP_COLORS = ['#1a4a8a','#1a6a3a','#6a1a3a','#4a1a6a','#6a4a1a','#1a5a5a','#5a2a1a','#3a5a1a']
              const accentCol = GROUP_COLORS[gi % GROUP_COLORS.length]
              return (
                <div key={group.id} style={{
                  padding: '14px 16px',
                  borderRight: '1px solid rgba(20,40,20,0.5)',
                  borderBottom: '1px solid rgba(20,40,20,0.5)',
                  background: `linear-gradient(135deg, ${accentCol}15, transparent)`,
                }}>
                  <div style={{
                    fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 2,
                    color: '#F5C518', marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    {group.name}
                    {grpTotal > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow' }}>
                        {grpPlayed}/{grpTotal}
                      </span>
                    )}
                  </div>
                  {grpPlayers.map(id => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      <Avatar name={pName(id)} size={22} />
                      <span style={{ fontSize: 12, color: '#b0c8b0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pName(id)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}