import { useState } from 'react'
import { generateId } from '../utils/storage'
import { CopyButton } from './WhatsAppExport'
import { exportKnockoutResults } from '../utils/whatsapp'

function BracketTree({ fixtures, knockoutBracket, players, fixtureConfig }) {
  const { totalRounds } = knockoutBracket
  if (!totalRounds) return null

  const CARD_W = 180
  const CARD_H = 72
  const SLOT_H = 96
  const CONN_W = 34
  const COL_GAP = 18
  const COL_W = CARD_W + CONN_W + COL_GAP
  const LABEL_H = 32

  const pName = id => {
    if (!id || id === 'BYE') return 'BYE'
    return players.find(p => p.id === id)?.name ?? '???'
  }

  const koFix = fixtures.filter(f => f.type === 'knockout')
  const roundNums = [...new Set(koFix.map(f => f.roundNum))].sort((a, b) => a - b)
  const rounds = roundNums.map(rn => ({
    rn,
    pairs: [...new Set(koFix.filter(f => f.roundNum === rn).map(f => f.pairIdx))].sort((a, b) => a - b),
  }))

  if (!rounds.length) return null

  const firstRoundPairs = rounds[0].pairs.length
  const totalH = firstRoundPairs * SLOT_H + LABEL_H + 24

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: 8 }}>
      <div style={{
        position: 'relative',
        height: totalH,
        minWidth: rounds.length * COL_W + 40,
        width: rounds.length * COL_W + 40,
      }}>
        {rounds.map(({ rn, pairs }, ri) => {
          const isLast = ri === rounds.length - 1
          const slotMult = Math.pow(2, ri)
          const slotH = SLOT_H * slotMult
          const x = ri * COL_W
          const legs = getLegCount(rn, totalRounds, fixtureConfig)

          return pairs.map((pairIdx, pi) => {
            const pf = koFix.filter(f => f.roundNum === rn && f.pairIdx === pairIdx)
            const leg1 = pf.find(f => f.leg === 1)
            if (!leg1) return null

            const winner = getPairWinner(rn, pairIdx, fixtures, legs)
            const isBye = leg1.isBye
            const yCenter = LABEL_H + pi * slotH + slotH / 2

            let homeScore = ''
            let awayScore = ''
            if (isBye) {
              homeScore = '—'
              awayScore = ''
            } else if (legs === 2) {
              const leg2 = pf.find(f => f.leg === 2)
              if (leg1.played && leg2?.played) {
                homeScore = String((leg1.homeScore ?? 0) + (leg2.awayScore ?? 0))
                awayScore = String((leg1.awayScore ?? 0) + (leg2.homeScore ?? 0))
              }
            } else if (leg1.played) {
              homeScore = String(leg1.homeScore ?? '')
              awayScore = String(leg1.awayScore ?? '')
            }

            const isTopOfPair = pi % 2 === 0
            const nextYCenter = LABEL_H + Math.floor(pi / 2) * slotH * 2 + slotH

            return (
              <div key={`${rn}-${pairIdx}`}>
                {pi === 0 && (
                  <div style={{
                    position: 'absolute', left: x, top: 0, width: CARD_W,
                    textAlign: 'center', fontFamily: 'Bebas Neue',
                    fontSize: 12, letterSpacing: 2.5,
                    color: rn === totalRounds ? 'var(--gold)' : 'var(--text-muted)',
                  }}>
                    {getRoundLabel(rn, totalRounds)}
                  </div>
                )}

                <div style={{
                  position: 'absolute',
                  left: x,
                  top: yCenter - CARD_H / 2,
                  width: CARD_W,
                  height: CARD_H,
                  background: winner
                    ? 'linear-gradient(135deg, rgba(245,197,24,0.12), rgba(8,24,8,0.95))'
                    : 'linear-gradient(135deg, rgba(14,34,14,0.95), rgba(6,13,6,0.98))',
                  border: `1px solid ${winner ? 'rgba(245,197,24,0.5)' : 'var(--green-border)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: winner ? '0 12px 28px rgba(245,197,24,0.10)' : '0 10px 24px rgba(0,0,0,0.18)',
                  backdropFilter: 'blur(6px)',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 12px', height: '50%',
                    background: winner === leg1.homeId ? 'rgba(245,197,24,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: winner === leg1.homeId ? 'var(--gold)' : homeScore ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>{pName(leg1.homeId)}</span>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#d7f26e', minWidth: 20, textAlign: 'right' }}>
                      {homeScore}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 12px', height: '50%',
                    background: winner === leg1.awayId ? 'rgba(245,197,24,0.08)' : 'transparent',
                  }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: winner === leg1.awayId ? 'var(--gold)' : awayScore ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>{isBye ? <em style={{ color: 'var(--text-muted)' }}>BYE</em> : pName(leg1.awayId)}</span>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#d7f26e', minWidth: 20, textAlign: 'right' }}>
                      {awayScore}
                    </span>
                  </div>
                </div>

                {!isLast && (
                  <>
                    <div style={{
                      position: 'absolute',
                      left: x + CARD_W,
                      top: yCenter - 1,
                      width: CONN_W,
                      height: 2,
                      background: winner ? 'rgba(245,197,24,0.45)' : 'rgba(83,120,83,0.35)',
                    }} />
                    {isTopOfPair ? (
                      <div style={{
                        position: 'absolute',
                        left: x + CARD_W + CONN_W - 1,
                        top: yCenter,
                        width: 2,
                        height: nextYCenter - yCenter,
                        background: 'rgba(83,120,83,0.35)',
                      }} />
                    ) : (
                      <>
                        <div style={{
                          position: 'absolute',
                          left: x + CARD_W + CONN_W - 1,
                          top: nextYCenter,
                          width: 2,
                          height: yCenter - nextYCenter,
                          background: 'rgba(83,120,83,0.35)',
                        }} />
                        <div style={{
                          position: 'absolute',
                          left: x + CARD_W + CONN_W - 1,
                          top: nextYCenter - 1,
                          width: COL_GAP + 1,
                          height: 2,
                          background: 'rgba(83,120,83,0.35)',
                        }} />
                      </>
                    )}
                  </>
                )}

                {isLast && winner && (
                  <div style={{
                    position: 'absolute',
                    left: x + CARD_W + 12,
                    top: yCenter - 10,
                    fontSize: 12,
                    color: 'var(--gold)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    🏆 {pName(winner)}
                  </div>
                )}
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}

function calcStandings(group, players, fixtures) {
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

function getQualifiedPlayers(groups, players, fixtures, qualifierConfig) {
  const allData = groups.map(group => ({
    groupId: group.id,
    groupName: group.name,
    rows: calcStandings(group, players, fixtures),
    qualifiers: qualifierConfig?.perGroup?.[group.id] ?? 2,
  }))
  const direct = []
  allData.forEach(({ groupId, groupName, rows, qualifiers }) =>
    rows.slice(0, qualifiers).forEach(r => direct.push({ ...r, groupId, groupName }))
  )
  const loserPool = []
  allData.forEach(({ groupId, groupName, rows, qualifiers }) =>
    rows.slice(qualifiers).forEach(r => loserPool.push({ ...r, groupId, groupName }))
  )
  loserPool.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name))
  const wildcards = loserPool.slice(0, qualifierConfig?.bestLosers ?? 0)
  return [...direct, ...wildcards]
}

// ── Anti-clash seeding ────────────────────────────────────────────────────────
// Spreads players so no two from the same group meet before the semis.
// Algorithm: fill bracket slots alternating between top and bottom half,
// rotating through groups so same-group players land far apart.
function antiClashSeed(qualified) {
  const n = qualified.length
  if (n < 2) return qualified.map(q => q.id)

  // Pad to next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(n)))
  const slots = Array(size).fill(null)

  // Group players by their group
  const byGroup = {}
  qualified.forEach(q => {
    if (!byGroup[q.groupId]) byGroup[q.groupId] = []
    byGroup[q.groupId].push(q)
  })

  // Build interleaved pool: rotate through groups taking one at a time
  // This ensures same-group players are maximally spread
  const groups = Object.values(byGroup)
  const pool = []
  let remaining = groups.map(g => [...g])
  while (remaining.some(g => g.length > 0)) {
    remaining.forEach(g => { if (g.length > 0) pool.push(g.shift()) })
  }

  // Place into bracket using "snake" pattern:
  // Fill top half slots forward, bottom half slots backward
  // This puts pool[0] vs pool[n-1], pool[1] vs pool[n-2] etc.
  // Guaranteeing top seeds face lower seeds and groups are split
  const half = size / 2
  const topSlots = []
  const botSlots = []
  for (let i = 0; i < half; i++) topSlots.push(i)
  for (let i = size - 1; i >= half; i--) botSlots.push(i)

  // Interleave: seed 1 → top[0], seed 2 → bot[0], seed 3 → top[1], seed 4 → bot[1]...
  pool.forEach((player, i) => {
    if (i % 2 === 0) slots[topSlots[Math.floor(i / 2)]] = player.id
    else slots[botSlots[Math.floor(i / 2)]] = player.id
  })

  // Return non-null slots (BYEs will be handled by the bracket generator)
  return slots.filter(s => s !== null)
}

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
  if (f === 0) return fixtureConfig?.final ?? 1
  if (f === 1) return fixtureConfig?.semi ?? 1
  return fixtureConfig?.quarter ?? 1
}

function getPairWinner(roundNum, pairIdx, allFixtures, legs) {
  const pf = allFixtures.filter(f => f.type === 'knockout' && f.roundNum === roundNum && f.pairIdx === pairIdx)
  const leg1 = pf.find(f => f.leg === 1)
  if (!leg1) return null
  if (leg1.isBye) return leg1.homeId
  if (leg1.manualWinnerId) return leg1.manualWinnerId
  if (legs === 1) {
    if (!leg1.played) return null
    if (leg1.homeScore > leg1.awayScore) return leg1.homeId
    if (leg1.awayScore > leg1.homeScore) return leg1.awayId
    return null
  }
  const leg2 = pf.find(f => f.leg === 2)
  if (!leg1.played || !leg2?.played) return null
  const gP1 = (leg1.homeScore ?? 0) + (leg2.awayScore ?? 0)
  const gP2 = (leg1.awayScore ?? 0) + (leg2.homeScore ?? 0)
  if (gP1 > gP2) return leg1.homeId
  if (gP2 > gP1) return leg1.awayId
  return null
}

function isRoundComplete(roundNum, allFixtures, totalRounds, fixtureConfig) {
  const rf = allFixtures.filter(f => f.type === 'knockout' && f.roundNum === roundNum)
  if (!rf.length) return false
  const legs = getLegCount(roundNum, totalRounds, fixtureConfig)
  const pairs = [...new Set(rf.map(f => f.pairIdx))]
  return pairs.every(pi => getPairWinner(roundNum, pi, allFixtures, legs) !== null)
}

function ScoreEntry({ fixture, playerName, onSave, onCancel }) {
  const [home, setHome] = useState(fixture.played ? String(fixture.homeScore) : '')
  const [away, setAway] = useState(fixture.played ? String(fixture.awayScore) : '')
  const [err, setErr] = useState('')

  function handleSave() {
    const h = parseInt(home, 10)
    const a = parseInt(away, 10)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setErr('Enter valid scores (0 or above).')
      return
    }
    onSave(h, a)
  }

  return (
    <div style={{
      padding: '14px 16px 16px',
      background: 'linear-gradient(180deg, rgba(8,24,8,0.98), rgba(5,14,5,0.98))',
      borderTop: '1px solid rgba(245,197,24,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, minWidth: 120, fontWeight: 700, textAlign: 'right', fontSize: 14 }}>{playerName(fixture.homeId)}</span>
        <input
          type="number"
          min="0"
          value={home}
          autoFocus
          onChange={e => { setHome(e.target.value); setErr('') }}
          style={{ width: 64, textAlign: 'center', fontSize: 22, fontFamily: 'Bebas Neue', padding: '7px 8px', color: '#111', background: '#fff', border: '1px solid var(--gold)', borderRadius: 10 }}
        />
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: 'var(--text-muted)' }}>–</span>
        <input
          type="number"
          min="0"
          value={away}
          onChange={e => { setAway(e.target.value); setErr('') }}
          style={{ width: 64, textAlign: 'center', fontSize: 22, fontFamily: 'Bebas Neue', padding: '7px 8px', color: '#111', background: '#fff', border: '1px solid var(--gold)', borderRadius: 10 }}
        />
        <span style={{ flex: 1, minWidth: 120, fontWeight: 700, fontSize: 14 }}>{playerName(fixture.awayId)}</span>
      </div>
      {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>⚠️ {err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-gold" style={{ flex: 1 }} onClick={handleSave}>✅ Save Result</button>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function KnockoutBracket({
  players, groups, fixtures, setFixtures,
  fixtureConfig, qualifierConfig,
  knockoutBracket, setKnockoutBracket,
  isAdmin, openResultEntry,
}) {
  const [selectedSeedIdx, setSelectedSeedIdx] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [bracketView, setBracketView] = useState('cards')

  const qualified = getQualifiedPlayers(groups, players, fixtures, qualifierConfig)
  const canEnter = isAdmin || openResultEntry
  const canEdit = isAdmin
  const locked = knockoutBracket.locked ?? false
  const totalRounds = knockoutBracket.totalRounds ?? 0
  const seeding = knockoutBracket.seeding?.length > 0 ? knockoutBracket.seeding : qualified.map(q => q.id)

  function playerName(id) {
    if (!id || id === 'BYE') return 'BYE'
    return players.find(p => p.id === id)?.name ?? '???'
  }

  function handleSeedClick(idx) {
    if (!isAdmin) return
    if (selectedSeedIdx === null) {
      setSelectedSeedIdx(idx)
      return
    }
    if (selectedSeedIdx !== idx) {
      const s = [...seeding]
      ;[s[selectedSeedIdx], s[idx]] = [s[idx], s[selectedSeedIdx]]
      setKnockoutBracket(prev => ({ ...prev, seeding: s }))
    }
    setSelectedSeedIdx(null)
  }

  function resetSeeding() {
    setKnockoutBracket(prev => ({ ...prev, seeding: qualified.map(q => q.id) }))
    setSelectedSeedIdx(null)
  }

  function applyAntiClash() {
    const arranged = antiClashSeed(qualified)
    setKnockoutBracket(prev => ({ ...prev, seeding: arranged }))
    setSelectedSeedIdx(null)
  }

  // Build a map of playerId → groupId for clash detection
  const playerGroupMap = {}
  qualified.forEach(q => { playerGroupMap[q.id] = q.groupId })

  // Check for Round 1 clashes (same group in same pair)
  const clashCount = previewPairs.filter(pair =>
    pair.p2 !== 'BYE' &&
    playerGroupMap[pair.p1] &&
    playerGroupMap[pair.p2] &&
    playerGroupMap[pair.p1] === playerGroupMap[pair.p2]
  ).length

  const previewPairs = (() => {
    const padded = seeding.length % 2 === 1 ? [...seeding, 'BYE'] : [...seeding]
    const pairs = []
    for (let i = 0; i < padded.length; i += 2) pairs.push({ p1: padded[i], p2: padded[i + 1] })
    return pairs
  })()

  function handleLockBracket() {
    if (qualified.length < 2) {
      alert('At least 2 qualified players needed.')
      return
    }
    if (!window.confirm('Lock bracket and generate Round 1 fixtures?')) return
    const eff = seeding.length > 0 ? seeding : qualified.map(q => q.id)
    const padded = eff.length % 2 === 1 ? [...eff, 'BYE'] : [...eff]
    const numPairs = padded.length / 2
    const tRounds = Math.ceil(Math.log2(padded.length))
    const legs = getLegCount(1, tRounds, fixtureConfig)
    const nonKO = fixtures.filter(f => f.type !== 'knockout')
    const r1 = []
    for (let pi = 0; pi < numPairs; pi++) {
      const p1 = padded[pi * 2]
      const p2 = padded[pi * 2 + 1]
      if (p2 === 'BYE') {
        r1.push({ id: generateId(), type: 'knockout', roundNum: 1, pairIdx: pi, leg: 1, homeId: p1, awayId: 'BYE', homeScore: null, awayScore: null, played: false, manualWinnerId: p1, isBye: true })
      } else {
        r1.push({ id: generateId(), type: 'knockout', roundNum: 1, pairIdx: pi, leg: 1, homeId: p1, awayId: p2, homeScore: null, awayScore: null, played: false, manualWinnerId: null, isBye: false })
        if (legs === 2) r1.push({ id: generateId(), type: 'knockout', roundNum: 1, pairIdx: pi, leg: 2, homeId: p2, awayId: p1, homeScore: null, awayScore: null, played: false, manualWinnerId: null, isBye: false })
      }
    }
    setFixtures([...nonKO, ...r1])
    setKnockoutBracket({ locked: true, seeding: eff, totalRounds: tRounds })
  }

  function handleUnlock() {
    if (!window.confirm('Reset bracket? All knockout results will be deleted.')) return
    setFixtures(prev => prev.filter(f => f.type !== 'knockout'))
    setKnockoutBracket({ locked: false, seeding, totalRounds: 0 })
    setEditingId(null)
  }

  function handleSaveScore(fixtureId, homeScore, awayScore) {
    setFixtures(prev => prev.map(f => f.id === fixtureId ? { ...f, homeScore, awayScore, played: true } : f))
    setEditingId(null)
  }

  function handlePickWinner(roundNum, pairIdx, winnerId) {
    setFixtures(prev => prev.map(f =>
      f.type === 'knockout' && f.roundNum === roundNum && f.pairIdx === pairIdx && f.leg === 1
        ? { ...f, manualWinnerId: winnerId }
        : f
    ))
  }

  function handleGenerateNext(completedRound) {
    const next = completedRound + 1
    if (fixtures.some(f => f.type === 'knockout' && f.roundNum === next)) return
    const legs = getLegCount(completedRound, totalRounds, fixtureConfig)
    const pairs = [...new Set(fixtures.filter(f => f.type === 'knockout' && f.roundNum === completedRound).map(f => f.pairIdx))].sort((a, b) => a - b)
    const winners = pairs.map(pi => getPairWinner(completedRound, pi, fixtures, legs))
    const nextLegs = getLegCount(next, totalRounds, fixtureConfig)
    const newF = []
    for (let i = 0; i < winners.length; i += 2) {
      const pi = i / 2
      const p1 = winners[i]
      const p2 = winners[i + 1] ?? 'BYE'
      if (p2 === 'BYE') {
        newF.push({ id: generateId(), type: 'knockout', roundNum: next, pairIdx: pi, leg: 1, homeId: p1, awayId: 'BYE', homeScore: null, awayScore: null, played: false, manualWinnerId: p1, isBye: true })
      } else {
        newF.push({ id: generateId(), type: 'knockout', roundNum: next, pairIdx: pi, leg: 1, homeId: p1, awayId: p2, homeScore: null, awayScore: null, played: false, manualWinnerId: null, isBye: false })
        if (nextLegs === 2) newF.push({ id: generateId(), type: 'knockout', roundNum: next, pairIdx: pi, leg: 2, homeId: p2, awayId: p1, homeScore: null, awayScore: null, played: false, manualWinnerId: null, isBye: false })
      }
    }
    setFixtures(prev => [...prev, ...newF])
  }

  const champion = (() => {
    if (!locked || !totalRounds) return null
    const finalExists = fixtures.some(f => f.type === 'knockout' && f.roundNum === totalRounds)
    if (!finalExists) return null
    const finalLegs = getLegCount(totalRounds, totalRounds, fixtureConfig)
    return getPairWinner(totalRounds, 0, fixtures, finalLegs)
  })()

  const generatedRounds = locked
    ? [...new Set(fixtures.filter(f => f.type === 'knockout').map(f => f.roundNum))].sort((a, b) => a - b)
    : []

  const knockoutFixtures = fixtures.filter(f => f.type === 'knockout')
  const playedKO = knockoutFixtures.filter(f => f.played).length
  const totalKO = knockoutFixtures.length
  const completedRounds = generatedRounds.filter(r => isRoundComplete(r, fixtures, totalRounds, fixtureConfig)).length
  const nextRoundLabel = locked && !champion
    ? getRoundLabel(Math.min((generatedRounds[generatedRounds.length - 1] ?? 1) + 1, totalRounds), totalRounds)
    : 'Champion crowned'

  function MetricCard({ label, value, hint }) {
    return (
      <div className="card" style={{ padding: 18, minHeight: 112, background: 'linear-gradient(180deg, rgba(8,24,8,0.95), rgba(5,14,5,0.98))' }}>
        <p style={{ fontFamily: 'Bebas Neue', fontSize: 12, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: 2, color: 'var(--gold)', lineHeight: 1 }}>{value}</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>{hint}</p>
      </div>
    )
  }

  function FixtureRow({ fixture, legLabel }) {
    const isEditing = editingId === fixture.id
    const clickable = fixture.played ? canEdit : canEnter
    return (
      <div>
        <div
          onClick={() => clickable && !isEditing && setEditingId(fixture.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px',
            cursor: clickable && !isEditing ? 'pointer' : 'default',
            background: isEditing ? 'rgba(245,197,24,0.05)' : 'transparent',
            borderTop: legLabel === 'LEG 2' ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}
        >
          {legLabel && <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 38, fontFamily: 'Bebas Neue', letterSpacing: 1.2 }}>{legLabel}</span>}
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{playerName(fixture.homeId)}</div>
            {playerGameId(fixture.homeId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(fixture.homeId)}</div>}
          </div>
          <div style={{
            padding: '6px 12px', minWidth: 74, textAlign: 'center', borderRadius: 8,
            background: fixture.played ? 'rgba(163, 217, 84, 0.10)' : canEnter ? 'rgba(245,197,24,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${fixture.played ? 'rgba(163,217,84,0.35)' : 'var(--green-border)'}`,
          }}>
            {fixture.played
              ? <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#d7f26e', letterSpacing: 2 }}>{fixture.homeScore} – {fixture.awayScore}</span>
              : <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: canEnter ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: 1 }}>VS</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{playerName(fixture.awayId)}</div>
            {playerGameId(fixture.awayId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(fixture.awayId)}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {fixture.played && canEdit && <span style={{ fontSize: 11, opacity: 0.45 }}>✏️</span>}
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: fixture.played ? '#8bd450' : 'rgba(255,255,255,0.18)' }} />
          </div>
        </div>
        {isEditing && (
          <ScoreEntry
            fixture={fixture}
            playerName={playerName}
            onSave={(h, a) => handleSaveScore(fixture.id, h, a)}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    )
  }

  function MatchCard({ roundNum, pairIdx }) {
    const pf = fixtures.filter(f => f.type === 'knockout' && f.roundNum === roundNum && f.pairIdx === pairIdx)
    const leg1 = pf.find(f => f.leg === 1)
    const leg2 = pf.find(f => f.leg === 2)
    if (!leg1) return null
    const legs = getLegCount(roundNum, totalRounds, fixtureConfig)
    const winner = getPairWinner(roundNum, pairIdx, fixtures, legs)
    const isBye = leg1.isBye

    let aggP1 = 0
    let aggP2 = 0
    let aggDone = false
    let aggTied = false
    if (legs === 2 && leg1.played && leg2?.played) {
      aggP1 = (leg1.homeScore ?? 0) + (leg2.awayScore ?? 0)
      aggP2 = (leg1.awayScore ?? 0) + (leg2.homeScore ?? 0)
      aggDone = true
      aggTied = aggP1 === aggP2 && !leg1.manualWinnerId
    }
    const draw1Leg = legs === 1 && leg1.played && leg1.homeScore === leg1.awayScore && !leg1.manualWinnerId
    const needsPick = (draw1Leg || aggTied) && !winner

    return (
      <div style={{
        background: 'linear-gradient(180deg, rgba(8,24,8,0.95), rgba(5,14,5,0.98))',
        border: `1px solid ${winner ? 'rgba(245,197,24,0.35)' : 'var(--green-border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 14,
        boxShadow: winner ? '0 10px 28px rgba(245,197,24,0.08)' : '0 10px 24px rgba(0,0,0,0.16)',
      }}>
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          background: 'rgba(0,0,0,0.16)',
        }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 12, letterSpacing: 2, color: 'var(--text-muted)' }}>
            TIE {pairIdx + 1}{legs === 2 ? ' · 2 LEGS' : ' · SINGLE LEG'}
          </span>
          {winner && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>🏁 {playerName(winner)} advances</span>}
        </div>

        {isBye ? (
          <div style={{ padding: '22px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            <strong style={{ color: 'var(--gold)' }}>{playerName(leg1.homeId)}</strong> advances automatically due to a bye.
          </div>
        ) : (
          <>
            <FixtureRow fixture={leg1} legLabel={legs === 2 ? 'LEG 1' : ''} />
            {legs === 2 && leg2 && <FixtureRow fixture={leg2} legLabel="LEG 2" />}

            {aggDone && (
              <div style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                flexWrap: 'wrap',
              }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{playerName(leg1.homeId)}</span>
                <div style={{ padding: '4px 16px', background: 'rgba(163,217,84,0.10)', border: '1px solid rgba(163,217,84,0.35)', borderRadius: 999 }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#d7f26e', letterSpacing: 2 }}>{aggP1} – {aggP2}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{playerName(leg1.awayId)}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AGGREGATE</span>
              </div>
            )}

            {needsPick && canEdit && (
              <div style={{ padding: '13px 16px', background: 'rgba(90,58,0,0.14)', borderTop: '1px solid rgba(245,197,24,0.18)' }}>
                <p style={{ fontSize: 13, color: '#f0c060', fontWeight: 700, marginBottom: 8 }}>
                  ⚖️ {aggTied ? 'Tied on aggregate' : 'Draw'} — choose winner after ET / penalties
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[leg1.homeId, leg1.awayId].map(pid => (
                    <button key={pid} className="btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => handlePickWinner(roundNum, pairIdx, pid)}>
                      {playerName(pid)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {needsPick && !canEdit && (
              <div style={{ padding: '11px 16px', background: 'rgba(90,58,0,0.14)', borderTop: '1px solid rgba(245,197,24,0.18)', fontSize: 13, color: '#f0c060', textAlign: 'center' }}>
                ⚖️ Waiting for admin to decide ET / penalties winner
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="fade-up">
      <div style={{
        padding: '24px',
        borderRadius: 22,
        marginBottom: 22,
        border: '1px solid rgba(245,197,24,0.18)',
        background: 'linear-gradient(135deg, rgba(14,34,14,0.98), rgba(7,16,7,0.98))',
        boxShadow: '0 18px 46px rgba(0,0,0,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(245,197,24,0.25)', background: 'rgba(245,197,24,0.07)', color: 'var(--gold)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              🏆 KO PHASE
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span>{locked ? 'Live bracket' : 'Setup mode'}</span>
            </div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 42, color: 'var(--text-primary)', letterSpacing: 2.5, lineHeight: 1, marginBottom: 8 }}>
              KNOCKOUT STAGE
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 760 }}>
              {!locked
                ? `${qualified.length} player${qualified.length !== 1 ? 's' : ''} qualified. Arrange seeding, review round-one ties, then lock the bracket.`
                : champion
                  ? `${playerName(champion)} has won the EA26 tournament. Review the completed bracket or copy the final results.`
                  : 'Knockout matches are underway. Enter results, resolve ties after ET/penalties, and generate the next round when ready.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {locked && <CopyButton text={exportKnockoutResults(players, fixtures, knockoutBracket, fixtureConfig)} label="📋 Copy Results" size="small" />}
            {locked && isAdmin && <button className="btn-ghost" style={{ fontSize: 12 }} onClick={handleUnlock}>🔓 Reset Bracket</button>}
          </div>
        </div>

        <div style={{
          marginTop: 16,
          height: 10,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width: `${locked && totalKO ? Math.round((playedKO / totalKO) * 100) : 0}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(245,197,24,0.8), rgba(163,217,84,0.8))',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{locked ? `${playedKO} of ${totalKO} knockout fixtures entered` : 'Bracket progress starts after lock'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{locked ? `Next milestone: ${nextRoundLabel}` : 'Next milestone: lock and generate Round 1'}</span>
        </div>
      </div>

      {champion && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42,31,0,0.98), rgba(15,58,15,0.98))',
          border: '2px solid var(--gold)',
          borderRadius: 22,
          padding: '34px 24px',
          textAlign: 'center',
          marginBottom: 24,
          boxShadow: '0 20px 48px rgba(245,197,24,0.10)',
        }}>
          <div style={{ fontSize: 58, marginBottom: 10 }}>🏆</div>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 5, color: 'var(--text-muted)', marginBottom: 8 }}>EA26 TOURNAMENT CHAMPION</p>
          <p className="gold-shimmer" style={{ fontFamily: 'Bebas Neue', fontSize: 56, letterSpacing: 4, lineHeight: 1 }}>{playerName(champion)}</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>Bragging rights secured. Crown locked in. 👑</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        <MetricCard label="QUALIFIED" value={qualified.length} hint="Players advancing from group stage" />
        <MetricCard label="ROUNDS LIVE" value={locked ? generatedRounds.length : 0} hint={locked ? `${completedRounds} completed so far` : 'Waiting for bracket lock'} />
        <MetricCard label="MATCHES LOGGED" value={locked ? `${playedKO}/${totalKO}` : '0/0'} hint={locked ? 'Knockout fixtures with entered scores' : 'No knockout fixtures yet'} />
        <MetricCard label="STATUS" value={champion ? 'DONE' : locked ? 'LIVE' : 'SETUP'} hint={champion ? 'Tournament winner decided' : locked ? 'Bracket currently active' : 'Arrange seeds before kickoff'} />
      </div>

      {!locked && isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 22, background: 'linear-gradient(180deg, rgba(8,24,8,0.95), rgba(5,14,5,0.98))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>🎯 BRACKET SEEDING</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {selectedSeedIdx !== null
                    ? `Seed ${selectedSeedIdx + 1} selected — click another seed to swap positions.`
                    : 'Tap two seed slots to swap them. Round 1 follows the visible order: 1 vs 2, 3 vs 4, and so on.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn-gold"
                  style={{ fontSize: 12 }}
                  onClick={applyAntiClash}
                  title="Automatically arrange seeds so same-group players can't meet before the semis"
                >
                  ⚡ Anti-Clash Draw
                </button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={resetSeeding}>↺ Reset</button>
              </div>
            </div>

            {qualified.length < 2 ? (
              <div style={{ padding: '34px 16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No qualified players yet. Finish the group stage to unlock the bracket.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10, marginBottom: 18 }}>
                  {seeding.map((playerId, idx) => {
                    const isSelected = selectedSeedIdx === idx
                    return (
                      <button
                        key={`${playerId}-${idx}`}
                        onClick={() => handleSeedClick(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 14, cursor: 'pointer', width: '100%',
                          background: isSelected ? 'rgba(245,197,24,0.10)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? 'rgba(245,197,24,0.6)' : 'var(--green-border)'}`,
                          color: 'inherit',
                        }}
                      >
                        <span style={{ width: 34, height: 34, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 19, color: isSelected ? 'var(--gold)' : 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {idx + 1}
                        </span>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{playerName(playerId)}</div>
                          {playerGameId(playerId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(playerId)}</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--green-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <p style={{ fontFamily: 'Bebas Neue', fontSize: 12, letterSpacing: 2, color: 'var(--text-muted)' }}>ROUND 1 PREVIEW</p>
                    {clashCount > 0 ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f0a060', background: 'rgba(240,160,96,0.10)', border: '1px solid rgba(240,160,96,0.28)', padding: '3px 9px', borderRadius: 999 }}>
                        ⚠️ {clashCount} same-group clash{clashCount !== 1 ? 'es' : ''}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--card-green)', background: 'rgba(93,143,106,0.10)', border: '1px solid rgba(93,143,106,0.22)', padding: '3px 9px', borderRadius: 999 }}>
                        ✓ No group clashes
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {previewPairs.map((pair, idx) => {
                      const isClash = pair.p2 !== 'BYE' && playerGroupMap[pair.p1] && playerGroupMap[pair.p2] && playerGroupMap[pair.p1] === playerGroupMap[pair.p2]
                      return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: isClash ? 'rgba(240,160,96,0.06)' : 'rgba(0,0,0,0.14)', borderRadius: 12, border: `1px solid ${isClash ? 'rgba(240,160,96,0.28)' : 'rgba(255,255,255,0.04)'}` }}>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, color: 'var(--text-muted)', minWidth: 24 }}>{idx + 1}</span>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{playerName(pair.p1)}</div>
                          {playerGameId(pair.p1) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(pair.p1)}</div>}
                        </div>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: 12, color: 'var(--gold)', padding: '4px 9px', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 999 }}>VS</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{pair.p2 === 'BYE' ? <em style={{ color: 'var(--text-muted)' }}>BYE</em> : playerName(pair.p2)}</div>
                          {pair.p2 !== 'BYE' && playerGameId(pair.p2) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(pair.p2)}</div>}
                        </div>
                      </div>
                    )})}  
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ padding: 22, background: 'linear-gradient(180deg, rgba(8,24,8,0.95), rgba(5,14,5,0.98))' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 6 }}>🧭 SETUP CHECKLIST</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Quick admin summary before you launch the knockout phase.</p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
              {[
                { ok: qualified.length >= 2, label: 'Enough qualifiers available' },
                { ok: seeding.length === qualified.length, label: 'All seed slots filled' },
                { ok: previewPairs.length > 0, label: 'Round 1 pairings visible' },
                { ok: true, label: 'Quarter / Semi / Final legs follow current settings' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 16 }}>{item.ok ? '✅' : '⚠️'}</span>
                  <span style={{ fontSize: 13, color: item.ok ? 'var(--text-primary)' : '#f0c060' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <button className="btn-gold" style={{ width: '100%' }} onClick={handleLockBracket} disabled={qualified.length < 2}>
              🔒 Lock Bracket & Generate Round 1
            </button>
          </div>
        </div>
      )}

      {!locked && !isAdmin && (
        <div className="card" style={{ padding: 42, textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⏳</div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>Knockout bracket not published yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>An admin still needs to finalize seeding and generate the first knockout ties.</p>
        </div>
      )}

      {locked && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'cards', label: '📋 Match Cards' },
                { id: 'bracket', label: '🌿 Bracket View' },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setBracketView(v.id)}
                  style={{
                    padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'Barlow', fontWeight: 700, fontSize: 12,
                    border: `1px solid ${bracketView === v.id ? 'rgba(245,197,24,0.55)' : 'var(--green-border)'}`,
                    background: bracketView === v.id ? 'rgba(245,197,24,0.10)' : 'rgba(255,255,255,0.02)',
                    color: bracketView === v.id ? 'var(--gold)' : 'var(--text-muted)',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {canEnter ? 'Tap a match to enter or edit results' : 'Viewing mode only'}
            </div>
          </div>

          {bracketView === 'bracket' && (
            <div className="card" style={{ padding: 22, marginBottom: 20, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(8,24,8,0.95), rgba(5,14,5,0.98))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>🌿 BRACKET OVERVIEW</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Visual map of the tournament path from opening ties to the final.</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch to Match Cards to enter results</span>
              </div>
              <BracketTree fixtures={fixtures} knockoutBracket={knockoutBracket} players={players} fixtureConfig={fixtureConfig} />
            </div>
          )}

          {bracketView === 'cards' && generatedRounds.map(roundNum => {
            const label = getRoundLabel(roundNum, totalRounds)
            const legs = getLegCount(roundNum, totalRounds, fixtureConfig)
            const rf = fixtures.filter(f => f.type === 'knockout' && f.roundNum === roundNum)
            const pairIndices = [...new Set(rf.map(f => f.pairIdx))].sort((a, b) => a - b)
            const roundDone = isRoundComplete(roundNum, fixtures, totalRounds, fixtureConfig)
            const nextExists = fixtures.some(f => f.type === 'knockout' && f.roundNum === roundNum + 1)
            const isFinal = roundNum === totalRounds
            const decidedCount = pairIndices.filter(pi => getPairWinner(roundNum, pi, fixtures, legs) !== null).length

            return (
              <div key={roundNum} style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 14, padding: '0 2px 10px', flexWrap: 'wrap', gap: 12,
                  borderBottom: `2px solid ${isFinal ? 'rgba(245,197,24,0.45)' : 'var(--green-border)'}`,
                }}>
                  <div>
                    <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 30, letterSpacing: 3, margin: 0, color: isFinal ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {isFinal ? '🏆 ' : ''}{label}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {legs === 2 ? 'Two legs · aggregate scoring' : 'Single-leg knockout'} · {decidedCount}/{pairIndices.length} ties decided
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {roundDone && !isFinal && !nextExists && isAdmin && (
                      <button className="btn-gold" onClick={() => handleGenerateNext(roundNum)}>
                        Generate {getRoundLabel(roundNum + 1, totalRounds)} →
                      </button>
                    )}
                    {roundDone && (nextExists || isFinal) && (
                      <span style={{ fontSize: 13, color: '#8bd450', fontWeight: 700 }}>✅ Complete</span>
                    )}
                  </div>
                </div>
                {pairIndices.map(pi => <MatchCard key={pi} roundNum={roundNum} pairIdx={pi} />)}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}