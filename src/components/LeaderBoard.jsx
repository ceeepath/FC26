const MEDAL = ['🥇', '🥈', '🥉']

function calcLeaderboard(players, fixtures) {
  const played = fixtures.filter(f => f.played && !f.isBye)

  return players
    .map(player => {
      let MP=0, W=0, D=0, L=0, GF=0, Pts=0

      played.forEach(f => {
        const isHome = f.homeId === player.id
        const isAway = f.awayId === player.id
        if (!isHome && !isAway) return

        MP++
        const myGoals    = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0)
        const theirGoals = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0)
        GF += myGoals

        // Manual winner (ET/Pens) — counts as win/loss, no draw
        if (f.manualWinnerId) {
          if (f.manualWinnerId === player.id) { W++; Pts += 3 }
          else L++
        } else {
          if (myGoals > theirGoals)      { W++; Pts += 3 }
          else if (myGoals === theirGoals) { D++; Pts += 1 }
          else                             { L++ }
        }
      })

      // Split by stage
      const groupPlayed  = played.filter(f => f.type === 'group')
      const knockPlayed  = played.filter(f => f.type === 'knockout')

      const groupGoals   = groupPlayed.reduce((s,f) => s + (f.homeId===player.id ? (f.homeScore??0) : f.awayId===player.id ? (f.awayScore??0) : 0), 0)
      const knockGoals   = knockPlayed.reduce((s,f) => s + (f.homeId===player.id ? (f.homeScore??0) : f.awayId===player.id ? (f.awayScore??0) : 0), 0)
      const groupPts     = groupPlayed.reduce((s,f) => {
        const isHome = f.homeId===player.id, isAway = f.awayId===player.id
        if (!isHome && !isAway) return s
        if (f.manualWinnerId) return s + (f.manualWinnerId===player.id ? 3 : 0)
        const mg = isHome?(f.homeScore??0):(f.awayScore??0), tg = isHome?(f.awayScore??0):(f.homeScore??0)
        return s + (mg>tg?3:mg===tg?1:0)
      }, 0)
      const knockPts = Pts - groupPts

      return { ...player, MP, W, D, L, GF, Pts, groupGoals, knockGoals, groupPts, knockPts }
    })
    .filter(p => p.MP > 0)
    .sort((a,b) => b.Pts - a.Pts || b.GF - a.GF || a.name.localeCompare(b.name))
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign:'center', minWidth:40 }}>
      <div style={{ fontFamily:'Bebas Neue', fontSize:20, color: color ?? 'var(--text-primary)', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:1, marginTop:2 }}>{label}</div>
    </div>
  )
}

export default function Leaderboard({ players, fixtures }) {
  const board   = calcLeaderboard(players, fixtures)
  const played  = fixtures.filter(f => f.played && !f.isBye).length
  const topPts  = board[0]?.Pts  ?? 0
  const topGoals= board[0]?.GF   ?? 0

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Bebas Neue', fontSize:32, color:'var(--gold)', letterSpacing:2 }}>LEADERBOARD</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          {played === 0
            ? 'No matches played yet.'
            : `Ranked by total points across all ${played} played match${played!==1?'es':''}. Goals scored as tiebreaker.`}
        </p>
      </div>

      {board.length === 0 ? (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏅</div>
          <p style={{ color:'var(--text-muted)', fontSize:15 }}>
            No results yet. Enter match results to see the leaderboard.
          </p>
        </div>
      ) : (
        <>
          {/* ── Top 3 Podium ── */}
          {board.length >= 2 && (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(board.length,3)}, 1fr)`, gap:12, marginBottom:32 }}>
              {board.slice(0,3).map((p, idx) => {
                const colors = [
                  { bg:'linear-gradient(160deg,#2a1f00,#0f0c00)', border:'var(--gold)',   label:'var(--gold)'  },
                  { bg:'linear-gradient(160deg,#1c1c1c,#0a0a0a)', border:'#888',          label:'#cccccc'      },
                  { bg:'linear-gradient(160deg,#1a0e00,#0d0700)', border:'#a06030',       label:'#c08040'      },
                ]
                const c = colors[idx]
                return (
                  <div key={p.id} style={{
                    background:c.bg, border:`2px solid ${c.border}`,
                    borderRadius:16, padding:'24px 16px', textAlign:'center',
                    position:'relative',
                  }}>
                    <div style={{ fontSize: idx===0?44:34, marginBottom:6 }}>{MEDAL[idx]}</div>
                    <p style={{ fontFamily:'Bebas Neue', fontSize:idx===0?20:16, letterSpacing:1, color:c.label, marginBottom:10 }}>
                      {p.name}
                    </p>
                    {/* Points big */}
                    <div style={{ marginBottom:8 }}>
                      <span style={{ fontFamily:'Bebas Neue', fontSize:idx===0?56:44, color:c.label, lineHeight:1 }}>{p.Pts}</span>
                      <span style={{ fontFamily:'Bebas Neue', fontSize:14, color:'var(--text-muted)', marginLeft:6, letterSpacing:2 }}>PTS</span>
                    </div>
                    {/* Mini stats */}
                    <div style={{ display:'flex', justifyContent:'center', gap:16, borderTop:`1px solid ${c.border}40`, paddingTop:10, marginTop:4 }}>
                      <StatPill label="W"  value={p.W}  color="#4caf50" />
                      <StatPill label="D"  value={p.D}  color="var(--gold)" />
                      <StatPill label="L"  value={p.L}  color="var(--danger)" />
                      <StatPill label="GF" value={p.GF} color={c.label} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Full Table ── */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--green-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'Bebas Neue', fontSize:16, letterSpacing:2, color:'var(--gold)' }}>FULL STANDINGS</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>Pts · Goals · W · D · L</span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--green-border)' }}>
                    {[
                      { h:'#',    align:'left'   },
                      { h:'Player', align:'left' },
                      { h:'MP',   align:'center' },
                      { h:'W',    align:'center', color:'#4caf50'       },
                      { h:'D',    align:'center', color:'var(--gold)'   },
                      { h:'L',    align:'center', color:'var(--danger)' },
                      { h:'GF',   align:'center' },
                      { h:'Pts',  align:'center', color:'var(--gold)'   },
                    ].map(col => (
                      <th key={col.h} style={{
                        padding:'10px 14px', textAlign:col.align,
                        fontSize:12, fontWeight:700, letterSpacing:1,
                        color: col.color ?? 'var(--text-muted)',
                        fontFamily:'Barlow', whiteSpace:'nowrap',
                      }}>{col.h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {board.map((p, idx) => {
                    const ptsBar  = topPts  > 0 ? (p.Pts  / topPts)  * 100 : 0
                    const goalBar = topGoals> 0 ? (p.GF   / topGoals) * 100 : 0
                    const isTop   = idx === 0
                    const medal   = idx < 3 ? MEDAL[idx] : null

                    return (
                      <tr key={p.id} style={{
                        borderBottom:'1px solid var(--green-border)',
                        background: isTop ? 'rgba(245,197,24,0.04)' : 'transparent',
                      }}>
                        {/* Rank */}
                        <td style={{ padding:'12px 14px', width:40 }}>
                          {medal
                            ? <span style={{ fontSize:18 }}>{medal}</span>
                            : <span style={{ fontFamily:'Bebas Neue', fontSize:15, color:'var(--text-muted)' }}>{idx+1}</span>}
                        </td>

                        {/* Name + bars */}
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{p.name}</div>
                          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                            {/* Pts bar */}
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:10, color:'var(--gold)', width:20, textAlign:'right', letterSpacing:1 }}>PTS</span>
                              <div style={{ flex:1, maxWidth:120, height:4, borderRadius:2, background:'var(--green-border)' }}>
                                <div style={{ height:'100%', borderRadius:2, width:`${ptsBar}%`, background:'var(--gold)', transition:'width 0.4s' }} />
                              </div>
                            </div>
                            {/* Goals bar */}
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:10, color:'var(--text-muted)', width:20, textAlign:'right', letterSpacing:1 }}>GF</span>
                              <div style={{ flex:1, maxWidth:120, height:4, borderRadius:2, background:'var(--green-border)' }}>
                                <div style={{ height:'100%', borderRadius:2, width:`${goalBar}%`, background:'var(--text-muted)', transition:'width 0.4s' }} />
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* MP */}
                        <td style={{ padding:'12px 14px', textAlign:'center', fontSize:14, color:'var(--text-muted)' }}>{p.MP}</td>

                        {/* W */}
                        <td style={{ padding:'12px 14px', textAlign:'center', fontSize:14, fontWeight:p.W>0?700:400, color:p.W>0?'#4caf50':'var(--text-muted)' }}>{p.W}</td>

                        {/* D */}
                        <td style={{ padding:'12px 14px', textAlign:'center', fontSize:14, color:p.D>0?'var(--gold)':'var(--text-muted)' }}>{p.D}</td>

                        {/* L */}
                        <td style={{ padding:'12px 14px', textAlign:'center', fontSize:14, color:p.L>0?'var(--danger)':'var(--text-muted)' }}>{p.L}</td>

                        {/* GF */}
                        <td style={{ padding:'12px 14px', textAlign:'center', fontSize:14 }}>{p.GF}</td>

                        {/* Pts */}
                        <td style={{ padding:'12px 14px', textAlign:'center' }}>
                          <span style={{ fontFamily:'Bebas Neue', fontSize:22, color:isTop?'var(--gold)':'var(--text-primary)' }}>{p.Pts}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer legend */}
            <div style={{ padding:'10px 18px', borderTop:'1px solid var(--green-border)', fontSize:12, color:'var(--text-muted)', display:'flex', gap:16, flexWrap:'wrap' }}>
              <span>Win = 3pts</span>
              <span>Draw = 1pt</span>
              <span>Loss = 0pts</span>
              <span style={{ marginLeft:'auto' }}>ET/Pens winner counts as a win</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}