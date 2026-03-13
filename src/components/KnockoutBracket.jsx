import { useState } from 'react'
import { generateId } from '../utils/storage'

// ── Shared helpers (mirror GroupStandings) ──────────────────────────────────

function calcStandings(group, players, fixtures) {
  const gf = fixtures.filter(f => f.type === 'group' && f.groupId === group.id)
  const ids = group.playerIds.filter(id => players.some(p => p.id === id))
  const rows = ids.map(id => {
    const name = players.find(p => p.id === id)?.name ?? '???'
    let P=0,W=0,D=0,L=0,GF=0,GA=0
    gf.forEach(f => {
      if (!f.played) return
      if (f.homeId===id){ P++;GF+=f.homeScore;GA+=f.awayScore; if(f.homeScore>f.awayScore)W++; else if(f.homeScore===f.awayScore)D++; else L++ }
      else if(f.awayId===id){ P++;GF+=f.awayScore;GA+=f.homeScore; if(f.awayScore>f.homeScore)W++; else if(f.awayScore===f.homeScore)D++; else L++ }
    })
    return { id, name, P, W, D, L, GF, GA, GD:GF-GA, Pts:W*3+D }
  })
  rows.sort((a,b)=>b.Pts-a.Pts||b.GD-a.GD||b.GF-a.GF||a.name.localeCompare(b.name))
  return rows
}

function getQualifiedPlayers(groups, players, fixtures, qualifierConfig) {
  const allData = groups.map(group => ({
    rows: calcStandings(group, players, fixtures),
    qualifiers: qualifierConfig?.perGroup?.[group.id] ?? 2,
  }))
  const direct = []
  allData.forEach(({ rows, qualifiers }) => rows.slice(0, qualifiers).forEach(r => direct.push(r)))
  const loserPool = []
  allData.forEach(({ rows, qualifiers }) => rows.slice(qualifiers).forEach(r => loserPool.push(r)))
  loserPool.sort((a,b)=>b.Pts-a.Pts||b.GD-a.GD||b.GF-a.GF||a.name.localeCompare(b.name))
  const wildcards = loserPool.slice(0, qualifierConfig?.bestLosers ?? 0)
  return [...direct, ...wildcards]
}

// ── Round helpers ───────────────────────────────────────────────────────────

function getRoundLabel(roundNum, totalRounds) {
  const f = totalRounds - roundNum
  if (f === 0) return 'FINAL'
  if (f === 1) return 'SEMI FINALS'
  if (f === 2) return 'QUARTER FINALS'
  if (f === 3) return 'ROUND OF 16'
  return `ROUND ${roundNum}`
}

function getLegCount(roundNum, totalRounds, fixtureConfig) {
  const f = totalRounds - roundNum
  if (f === 0) return fixtureConfig?.final  ?? 1
  if (f === 1) return fixtureConfig?.semi   ?? 1
  return               fixtureConfig?.quarter ?? 1
}

function getPairWinner(roundNum, pairIdx, allFixtures, legs) {
  const pf = allFixtures.filter(f => f.type==='knockout' && f.roundNum===roundNum && f.pairIdx===pairIdx)
  const leg1 = pf.find(f => f.leg===1)
  if (!leg1) return null
  if (leg1.isBye) return leg1.homeId
  if (leg1.manualWinnerId) return leg1.manualWinnerId
  if (legs === 1) {
    if (!leg1.played) return null
    if (leg1.homeScore > leg1.awayScore) return leg1.homeId
    if (leg1.awayScore > leg1.homeScore) return leg1.awayId
    return null
  } else {
    const leg2 = pf.find(f => f.leg===2)
    if (!leg1.played || !leg2?.played) return null
    const gP1 = (leg1.homeScore??0)+(leg2.awayScore??0)
    const gP2 = (leg1.awayScore??0)+(leg2.homeScore??0)
    if (gP1 > gP2) return leg1.homeId
    if (gP2 > gP1) return leg1.awayId
    return null
  }
}

function isRoundComplete(roundNum, allFixtures, totalRounds, fixtureConfig) {
  const rf = allFixtures.filter(f => f.type==='knockout' && f.roundNum===roundNum)
  if (!rf.length) return false
  const legs = getLegCount(roundNum, totalRounds, fixtureConfig)
  const pairs = [...new Set(rf.map(f=>f.pairIdx))]
  return pairs.every(pi => getPairWinner(roundNum, pi, allFixtures, legs) !== null)
}

// ── Inline score entry ──────────────────────────────────────────────────────

function ScoreEntry({ fixture, playerName, onSave, onCancel }) {
  const [home, setHome] = useState(fixture.played ? String(fixture.homeScore) : '')
  const [away, setAway] = useState(fixture.played ? String(fixture.awayScore) : '')
  const [err, setErr] = useState('')
  function handleSave() {
    const h = parseInt(home,10), a = parseInt(away,10)
    if (isNaN(h)||isNaN(a)||h<0||a<0) { setErr('Enter valid scores (0 or above).'); return }
    onSave(h,a)
  }
  return (
    <div style={{ padding:'12px 16px', background:'#0a1a0a', borderTop:'none', borderRadius:'0 0 10px 10px', border:'1px solid var(--gold)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <span style={{ flex:1, fontWeight:700, textAlign:'right', fontSize:14 }}>{playerName(fixture.homeId)}</span>
        <input type="number" min="0" value={home} autoFocus
          onChange={e=>{setHome(e.target.value);setErr('')}}
          style={{ width:60, textAlign:'center', fontSize:20, fontFamily:'Bebas Neue', padding:'6px 8px', color:'#111', background:'#fff', border:'1px solid var(--gold)', borderRadius:8 }} />
        <span style={{ fontFamily:'Bebas Neue', fontSize:18, color:'var(--text-muted)' }}>–</span>
        <input type="number" min="0" value={away}
          onChange={e=>{setAway(e.target.value);setErr('')}}
          style={{ width:60, textAlign:'center', fontSize:20, fontFamily:'Bebas Neue', padding:'6px 8px', color:'#111', background:'#fff', border:'1px solid var(--gold)', borderRadius:8 }} />
        <span style={{ flex:1, fontWeight:700, fontSize:14 }}>{playerName(fixture.awayId)}</span>
      </div>
      {err && <p style={{ color:'var(--danger)', fontSize:13, marginBottom:8 }}>⚠️ {err}</p>}
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn-gold" style={{ flex:1 }} onClick={handleSave}>✅ Save Result</button>
        <button className="btn-ghost" style={{ flex:1 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function KnockoutBracket({
  players, groups, fixtures, setFixtures,
  fixtureConfig, qualifierConfig,
  knockoutBracket, setKnockoutBracket,
  isAdmin, openResultEntry,
}) {
  const [selectedSeedIdx, setSelectedSeedIdx] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const qualified  = getQualifiedPlayers(groups, players, fixtures, qualifierConfig)
  const canEnter   = isAdmin || openResultEntry
  const canEdit    = isAdmin
  const locked     = knockoutBracket.locked ?? false
  const totalRounds = knockoutBracket.totalRounds ?? 0

  // Use stored seeding or fall back to qualification order
  const seeding = knockoutBracket.seeding?.length > 0
    ? knockoutBracket.seeding
    : qualified.map(q => q.id)

  function playerName(id) {
    if (!id || id==='BYE') return 'BYE'
    return players.find(p=>p.id===id)?.name ?? '???'
  }

  // ── Seeding swap ──
  function handleSeedClick(idx) {
    if (!isAdmin) return
    if (selectedSeedIdx === null) {
      setSelectedSeedIdx(idx)
    } else {
      if (selectedSeedIdx !== idx) {
        const s = [...seeding]
        ;[s[selectedSeedIdx], s[idx]] = [s[idx], s[selectedSeedIdx]]
        setKnockoutBracket(prev=>({...prev, seeding:s}))
      }
      setSelectedSeedIdx(null)
    }
  }

  function resetSeeding() {
    setKnockoutBracket(prev=>({...prev, seeding: qualified.map(q=>q.id)}))
    setSelectedSeedIdx(null)
  }

  // Pairs from seeding (sequential: 1&2, 3&4, …)
  const previewPairs = (() => {
    const padded = seeding.length%2===1 ? [...seeding,'BYE'] : [...seeding]
    const pairs = []
    for (let i=0; i<padded.length; i+=2) pairs.push({p1:padded[i], p2:padded[i+1]})
    return pairs
  })()

  // ── Lock bracket ──
  function handleLockBracket() {
    if (qualified.length < 2) { alert('At least 2 qualified players needed.'); return }
    if (!window.confirm('Lock bracket and generate Round 1 fixtures?')) return
    const eff = seeding.length>0 ? seeding : qualified.map(q=>q.id)
    const padded = eff.length%2===1 ? [...eff,'BYE'] : [...eff]
    const numPairs = padded.length/2
    const tRounds  = Math.ceil(Math.log2(padded.length))
    const legs = getLegCount(1, tRounds, fixtureConfig)
    const nonKO = fixtures.filter(f=>f.type!=='knockout')
    const r1 = []
    for (let pi=0; pi<numPairs; pi++) {
      const p1=padded[pi*2], p2=padded[pi*2+1]
      if (p2==='BYE') {
        r1.push({ id:generateId(), type:'knockout', roundNum:1, pairIdx:pi, leg:1,
          homeId:p1, awayId:'BYE', homeScore:null, awayScore:null,
          played:false, manualWinnerId:p1, isBye:true })
      } else {
        r1.push({ id:generateId(), type:'knockout', roundNum:1, pairIdx:pi, leg:1,
          homeId:p1, awayId:p2, homeScore:null, awayScore:null,
          played:false, manualWinnerId:null, isBye:false })
        if (legs===2) r1.push({ id:generateId(), type:'knockout', roundNum:1, pairIdx:pi, leg:2,
          homeId:p2, awayId:p1, homeScore:null, awayScore:null,
          played:false, manualWinnerId:null, isBye:false })
      }
    }
    setFixtures([...nonKO,...r1])
    setKnockoutBracket({ locked:true, seeding:eff, totalRounds:tRounds })
  }

  // ── Unlock/reset bracket ──
  function handleUnlock() {
    if (!window.confirm('Reset bracket? All knockout results will be deleted.')) return
    setFixtures(prev=>prev.filter(f=>f.type!=='knockout'))
    setKnockoutBracket({ locked:false, seeding:seeding, totalRounds:0 })
    setEditingId(null)
  }

  // ── Save score ──
  function handleSaveScore(fixtureId, homeScore, awayScore) {
    setFixtures(prev=>prev.map(f=> f.id===fixtureId ? {...f, homeScore, awayScore, played:true} : f))
    setEditingId(null)
  }

  // ── Pick manual winner (ET/Pens) ──
  function handlePickWinner(roundNum, pairIdx, winnerId) {
    setFixtures(prev=>prev.map(f=>
      f.type==='knockout' && f.roundNum===roundNum && f.pairIdx===pairIdx && f.leg===1
        ? {...f, manualWinnerId:winnerId} : f
    ))
  }

  // ── Generate next round ──
  function handleGenerateNext(completedRound) {
    const next = completedRound+1
    if (fixtures.some(f=>f.type==='knockout' && f.roundNum===next)) return
    const legs = getLegCount(completedRound, totalRounds, fixtureConfig)
    const pairs = [...new Set(fixtures.filter(f=>f.type==='knockout'&&f.roundNum===completedRound).map(f=>f.pairIdx))].sort((a,b)=>a-b)
    const winners = pairs.map(pi=>getPairWinner(completedRound,pi,fixtures,legs))
    const nextLegs = getLegCount(next, totalRounds, fixtureConfig)
    const newF = []
    for (let i=0; i<winners.length; i+=2) {
      const pi=i/2, p1=winners[i], p2=winners[i+1]??'BYE'
      if (p2==='BYE') {
        newF.push({ id:generateId(), type:'knockout', roundNum:next, pairIdx:pi, leg:1,
          homeId:p1, awayId:'BYE', homeScore:null, awayScore:null,
          played:false, manualWinnerId:p1, isBye:true })
      } else {
        newF.push({ id:generateId(), type:'knockout', roundNum:next, pairIdx:pi, leg:1,
          homeId:p1, awayId:p2, homeScore:null, awayScore:null,
          played:false, manualWinnerId:null, isBye:false })
        if (nextLegs===2) newF.push({ id:generateId(), type:'knockout', roundNum:next, pairIdx:pi, leg:2,
          homeId:p2, awayId:p1, homeScore:null, awayScore:null,
          played:false, manualWinnerId:null, isBye:false })
      }
    }
    setFixtures(prev=>[...prev,...newF])
  }

  // Champion
  const champion = (() => {
    if (!locked || !totalRounds) return null
    const finalExists = fixtures.some(f=>f.type==='knockout'&&f.roundNum===totalRounds)
    if (!finalExists) return null
    const finalLegs = getLegCount(totalRounds, totalRounds, fixtureConfig)
    return getPairWinner(totalRounds, 0, fixtures, finalLegs)
  })()

  const generatedRounds = locked
    ? [...new Set(fixtures.filter(f=>f.type==='knockout').map(f=>f.roundNum))].sort((a,b)=>a-b)
    : []

  // ── Fixture row ──
  function FixtureRow({ fixture, legLabel }) {
    const isEditing = editingId===fixture.id
    const clickable  = fixture.played ? canEdit : canEnter
    return (
      <div>
        <div
          onClick={()=>clickable && !isEditing && setEditingId(fixture.id)}
          style={{
            display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
            cursor:clickable&&!isEditing?'pointer':'default',
            background:isEditing?'#0d1d0d':'transparent',
            borderTop: legLabel==='Leg 2' ? '1px solid var(--green-border)' : 'none',
          }}
        >
          {legLabel && <span style={{ fontSize:11, color:'var(--text-muted)', minWidth:36, fontFamily:'Bebas Neue', letterSpacing:1 }}>{legLabel}</span>}
          <span style={{ flex:1, fontWeight:700, fontSize:14, textAlign:'right' }}>{playerName(fixture.homeId)}</span>
          <div style={{
            padding:'5px 12px', minWidth:64, textAlign:'center',
            background: fixture.played?'#1a2e00': canEnter?'#1a1400':'#0a140a',
            border:`1px solid ${fixture.played?'#3a6a00':'var(--green-border)'}`, borderRadius:6,
          }}>
            {fixture.played
              ? <span style={{ fontFamily:'Bebas Neue', fontSize:16, color:'#a0d060', letterSpacing:2 }}>{fixture.homeScore} – {fixture.awayScore}</span>
              : <span style={{ fontFamily:'Bebas Neue', fontSize:14, color:canEnter?'var(--gold)':'var(--text-muted)', letterSpacing:1 }}>VS</span>}
          </div>
          <span style={{ flex:1, fontWeight:700, fontSize:14 }}>{playerName(fixture.awayId)}</span>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {fixture.played && canEdit && <span style={{ fontSize:11, opacity:0.5 }}>✏️</span>}
            <span style={{ width:8, height:8, borderRadius:'50%', background:fixture.played?'#4caf50':'#3a3a3a' }} />
          </div>
        </div>
        {isEditing && (
          <ScoreEntry fixture={fixture} playerName={playerName}
            onSave={(h,a)=>handleSaveScore(fixture.id,h,a)}
            onCancel={()=>setEditingId(null)} />
        )}
      </div>
    )
  }

  // ── Match card ──
  function MatchCard({ roundNum, pairIdx }) {
    const pf   = fixtures.filter(f=>f.type==='knockout'&&f.roundNum===roundNum&&f.pairIdx===pairIdx)
    const leg1 = pf.find(f=>f.leg===1)
    const leg2 = pf.find(f=>f.leg===2)
    if (!leg1) return null
    const legs   = getLegCount(roundNum, totalRounds, fixtureConfig)
    const winner = getPairWinner(roundNum, pairIdx, fixtures, legs)
    const isBye  = leg1.isBye

    // Aggregate for 2-leg
    let aggP1=0, aggP2=0, aggDone=false, aggTied=false
    if (legs===2 && leg1.played && leg2?.played) {
      aggP1=(leg1.homeScore??0)+(leg2.awayScore??0)
      aggP2=(leg1.awayScore??0)+(leg2.homeScore??0)
      aggDone=true
      aggTied=aggP1===aggP2 && !leg1.manualWinnerId
    }
    const draw1Leg = legs===1 && leg1.played && leg1.homeScore===leg1.awayScore && !leg1.manualWinnerId
    const needsPick = (draw1Leg || aggTied) && !winner

    return (
      <div style={{
        background:'#0a1a0a',
        border:`1px solid ${winner?'#2a5a1a':'var(--green-border)'}`,
        borderRadius:12, overflow:'hidden', marginBottom:12,
      }}>
        {/* Card header */}
        <div style={{ padding:'8px 16px', borderBottom:'1px solid var(--green-border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#050e05' }}>
          <span style={{ fontFamily:'Bebas Neue', fontSize:12, letterSpacing:2, color:'var(--text-muted)' }}>
            MATCH {pairIdx+1}{legs===2?' · 2 LEGS':''}
          </span>
          {winner && (
            <span style={{ fontSize:12, fontWeight:700, color:'#4caf50' }}>
              ✅ {playerName(winner)} advances
            </span>
          )}
        </div>

        {isBye ? (
          <div style={{ padding:'18px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
            <strong style={{ color:'#4caf50' }}>{playerName(leg1.homeId)}</strong> advances — bye
          </div>
        ) : (
          <>
            <FixtureRow fixture={leg1} legLabel={legs===2?'LEG 1':''} />
            {legs===2 && leg2 && <FixtureRow fixture={leg2} legLabel="LEG 2" />}

            {/* Aggregate row */}
            {aggDone && (
              <div style={{ padding:'10px 16px', background:'#050e05', borderTop:'1px solid var(--green-border)', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                <span style={{ fontWeight:700, fontSize:13 }}>{playerName(leg1.homeId)}</span>
                <div style={{ padding:'4px 16px', background:'#1a2e00', border:'1px solid #3a6a1a', borderRadius:6 }}>
                  <span style={{ fontFamily:'Bebas Neue', fontSize:18, color:'#a0d060', letterSpacing:2 }}>{aggP1} – {aggP2}</span>
                </div>
                <span style={{ fontWeight:700, fontSize:13 }}>{playerName(leg1.awayId)}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:4 }}>AGG</span>
              </div>
            )}

            {/* Manual winner picker */}
            {needsPick && canEdit && (
              <div style={{ padding:'12px 16px', background:'#1a0a00', borderTop:'1px solid #5a3a00' }}>
                <p style={{ fontSize:13, color:'#f0a060', fontWeight:700, marginBottom:8 }}>
                  ⚖️ {aggTied?'Tied on aggregate':'Draw'} — Pick winner (ET / Penalties)
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  {[leg1.homeId, leg1.awayId].map(pid=>(
                    <button key={pid} className="btn-ghost" style={{ flex:1, fontSize:13 }}
                      onClick={()=>handlePickWinner(roundNum,pairIdx,pid)}>
                      {playerName(pid)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {needsPick && !canEdit && (
              <div style={{ padding:'10px 16px', background:'#1a0a00', borderTop:'1px solid #5a3a00', fontSize:13, color:'#f0a060', textAlign:'center' }}>
                ⚖️ {aggTied?'Tied on aggregate':'Draw'} — Waiting for admin to decide (ET / Penalties)
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="fade-up">

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Bebas Neue', fontSize:32, color:'var(--gold)', letterSpacing:2 }}>KNOCKOUT STAGE</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          {!locked
            ? `${qualified.length} player${qualified.length!==1?'s':''} qualified · Set seeding then lock bracket to begin.`
            : champion
              ? `🏆 Tournament complete!`
              : 'Knockout stage in progress · enter results to advance players.'}
        </p>
      </div>

      {/* Champion banner */}
      {champion && (
        <div style={{
          background:'linear-gradient(135deg, #2a1f00, #0f3a0f)',
          border:'2px solid var(--gold)', borderRadius:16,
          padding:'36px 24px', textAlign:'center', marginBottom:32,
        }}>
          <div style={{ fontSize:56, marginBottom:8 }}>🏆</div>
          <p style={{ fontFamily:'Bebas Neue', fontSize:13, letterSpacing:5, color:'var(--text-muted)', marginBottom:6 }}>
            EA26 TOURNAMENT CHAMPION
          </p>
          <p style={{ fontFamily:'Bebas Neue', fontSize:52, color:'var(--gold)', letterSpacing:4, lineHeight:1 }}>
            {playerName(champion)}
          </p>
          <p style={{ fontSize:14, color:'var(--text-muted)', marginTop:12 }}>
            Bragging rights secured. Until next time. 👑
          </p>
        </div>
      )}

      {/* ── PRE-LOCK: Seeding panel (admin) ── */}
      {!locked && isAdmin && (
        <div className="card" style={{ padding:20, marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'var(--gold)', marginBottom:4 }}>🎯 BRACKET SEEDING</p>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                {selectedSeedIdx!==null
                  ? `Seed ${selectedSeedIdx+1} selected — tap another to swap.`
                  : 'Tap two seeds to swap. Pairs: 1 & 2, 3 & 4…'}
              </p>
            </div>
            <button className="btn-ghost" style={{ fontSize:12 }} onClick={resetSeeding}>↺ Reset</button>
          </div>

          {qualified.length < 2 ? (
            <div style={{ padding:32, textAlign:'center' }}>
              <p style={{ color:'var(--text-muted)', fontSize:14 }}>No qualified players yet. Complete the group stage first.</p>
            </div>
          ) : (
            <>
              {/* Seed slots */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:8, marginBottom:20 }}>
                {seeding.map((playerId, idx) => {
                  const isPairStart = idx%2===0
                  const isSelected  = selectedSeedIdx===idx
                  return (
                    <div key={`${playerId}-${idx}`} onClick={()=>handleSeedClick(idx)} style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'10px 14px', borderRadius:8, cursor:'pointer',
                      background: isSelected?'#2a1f00':'#050e05',
                      border:`1px solid ${isSelected?'var(--gold)':'var(--green-border)'}`,
                      transition:'all 0.15s',
                    }}>
                      <span style={{ fontFamily:'Bebas Neue', fontSize:18, color:isSelected?'var(--gold)':'var(--text-muted)', minWidth:22 }}>
                        {idx+1}
                      </span>
                      <span style={{ fontWeight:700, fontSize:14, flex:1 }}>{playerName(playerId)}</span>
                      <span style={{ fontSize:10, color:'var(--text-muted)', opacity:0.5 }}>
                        {isPairStart ? '┐' : '┘'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Matchup preview */}
              <p style={{ fontFamily:'Bebas Neue', fontSize:12, letterSpacing:2, color:'var(--text-muted)', marginBottom:8 }}>
                ROUND 1 PREVIEW
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
                {previewPairs.map((pair,idx)=>(
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', background:'#050e05', borderRadius:8, border:'1px solid var(--green-border)' }}>
                    <span style={{ fontFamily:'Bebas Neue', fontSize:13, color:'var(--text-muted)', minWidth:20 }}>{idx+1}</span>
                    <span style={{ flex:1, textAlign:'right', fontWeight:600, fontSize:14 }}>{playerName(pair.p1)}</span>
                    <span style={{ fontFamily:'Bebas Neue', fontSize:12, color:'var(--gold)', padding:'3px 8px', border:'1px solid var(--gold-dim)', borderRadius:4 }}>VS</span>
                    <span style={{ flex:1, fontWeight:600, fontSize:14 }}>
                      {pair.p2==='BYE'
                        ? <em style={{ color:'var(--text-muted)' }}>BYE</em>
                        : playerName(pair.p2)}
                    </span>
                  </div>
                ))}
              </div>

              <button className="btn-gold" onClick={handleLockBracket}>
                🔒 Lock Bracket & Generate Fixtures
              </button>
            </>
          )}
        </div>
      )}

      {/* PRE-LOCK: non-admin waiting */}
      {!locked && !isAdmin && (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⏳</div>
          <p style={{ color:'var(--text-muted)', fontSize:15 }}>Bracket not set up yet. Check back soon.</p>
        </div>
      )}

      {/* ── LOCKED BRACKET: Rounds ── */}
      {locked && (
        <>
          {isAdmin && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
              <button className="btn-ghost" style={{ fontSize:12 }} onClick={handleUnlock}>
                🔓 Reset Bracket
              </button>
            </div>
          )}

          {generatedRounds.map(roundNum=>{
            const label       = getRoundLabel(roundNum, totalRounds)
            const legs        = getLegCount(roundNum, totalRounds, fixtureConfig)
            const rf          = fixtures.filter(f=>f.type==='knockout'&&f.roundNum===roundNum)
            const pairIndices = [...new Set(rf.map(f=>f.pairIdx))].sort((a,b)=>a-b)
            const roundDone   = isRoundComplete(roundNum, fixtures, totalRounds, fixtureConfig)
            const nextExists  = fixtures.some(f=>f.type==='knockout'&&f.roundNum===roundNum+1)
            const isFinal     = roundNum===totalRounds
            const decidedCount= pairIndices.filter(pi=>getPairWinner(roundNum,pi,fixtures,legs)!==null).length

            return (
              <div key={roundNum} style={{ marginBottom:36 }}>
                {/* Round header */}
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  marginBottom:16, paddingBottom:10,
                  borderBottom:`2px solid ${isFinal?'var(--gold)':'var(--green-border)'}`,
                }}>
                  <div>
                    <h3 style={{
                      fontFamily:'Bebas Neue', fontSize:28, letterSpacing:3, margin:0,
                      color:isFinal?'var(--gold)':'var(--text-primary)',
                    }}>
                      {isFinal?'🏆 ':''}{label}
                    </h3>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                      {legs===2?'2-legged · aggregate':'Single leg'} · {decidedCount}/{pairIndices.length} decided
                    </p>
                  </div>
                  {roundDone && !isFinal && !nextExists && isAdmin && (
                    <button className="btn-gold" onClick={()=>handleGenerateNext(roundNum)}>
                      {getRoundLabel(roundNum+1, totalRounds)} →
                    </button>
                  )}
                  {roundDone && (nextExists || isFinal) && (
                    <span style={{ fontSize:13, color:'#4caf50', fontWeight:700 }}>✅ Complete</span>
                  )}
                </div>

                {/* Match cards */}
                {pairIndices.map(pi=>(
                  <MatchCard key={pi} roundNum={roundNum} pairIdx={pi} />
                ))}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}