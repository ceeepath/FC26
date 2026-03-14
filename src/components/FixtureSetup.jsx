import { useMemo, useState, useEffect } from 'react'
import { generateId } from '../utils/storage'

const STAGES = [
  { key: 'group', label: 'Group Stage', icon: '📋', hint: 'Round-robin fixtures inside each group' },
  { key: 'quarter', label: 'Quarter Finals', icon: '⚔️', hint: 'First knockout round' },
  { key: 'semi', label: 'Semi Finals', icon: '🔥', hint: 'Last four battle it out' },
  { key: 'final', label: 'Final', icon: '🏆', hint: 'Championship match' },
]

const GROUP_COLORS = [
  { border: '#c9960f', bg: 'rgba(201,150,15,0.08)', label: 'var(--gold)', glow: 'rgba(201,150,15,0.16)' },
  { border: '#1a7a4a', bg: 'rgba(26,122,74,0.10)', label: '#4cdf8a', glow: 'rgba(76,223,138,0.16)' },
  { border: '#1a4a9a', bg: 'rgba(26,74,154,0.10)', label: '#6aaeff', glow: 'rgba(106,174,255,0.16)' },
  { border: '#8a1a8a', bg: 'rgba(138,26,138,0.10)', label: '#e07ae0', glow: 'rgba(224,122,224,0.16)' },
  { border: '#9a4a1a', bg: 'rgba(154,74,26,0.10)', label: '#f0a060', glow: 'rgba(240,160,96,0.16)' },
  { border: '#1a7a7a', bg: 'rgba(26,122,122,0.10)', label: '#60e0e0', glow: 'rgba(96,224,224,0.16)' },
  { border: '#6a1a1a', bg: 'rgba(106,26,26,0.10)', label: '#e06060', glow: 'rgba(224,96,96,0.16)' },
  { border: '#4a6a1a', bg: 'rgba(74,106,26,0.10)', label: '#a0d060', glow: 'rgba(160,208,96,0.16)' },
]

function roundRobin(ids) {
  const pairs = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]])
  }
  return pairs
}

function StatCard({ label, value, sub, accent = 'var(--gold)' }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      padding: '18px 18px 16px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
    }}>
      <div style={{ position: 'absolute', inset: '0 auto auto 0', width: 72, height: 72, borderRadius: '50%', background: `${accent}18`, filter: 'blur(6px)', transform: 'translate(-18px,-18px)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, position: 'relative' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, position: 'relative' }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 34, color: 'var(--text-primary)', letterSpacing: 1 }}>{value}</span>
      </div>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, position: 'relative' }}>{sub}</p>}
    </div>
  )
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {eyebrow && <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{eyebrow}</p>}
      <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: 1.5, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</h3>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{sub}</p>}
    </div>
  )
}

function ScoreEntry({ fixture, playerName, onSave, onCancel }) {
  const [home, setHome] = useState(fixture.played ? String(fixture.homeScore) : '')
  const [away, setAway] = useState(fixture.played ? String(fixture.awayScore) : '')
  const [err, setErr] = useState('')

  function handleSave() {
    const h = parseInt(home, 10)
    const a = parseInt(away, 10)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setErr('Enter valid scores from 0 upward.')
      return
    }
    onSave(h, a)
  }

  return (
    <div style={{
      marginTop: 0,
      padding: 16,
      background: 'linear-gradient(180deg, rgba(255,215,0,0.07), rgba(0,0,0,0.18))',
      border: '1px solid rgba(255,215,0,0.25)',
      borderTop: 'none',
      borderRadius: '0 0 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div>
        <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: 'var(--gold)', letterSpacing: 1.4 }}>ENTER RESULT</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tap save once both scores are entered.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <span style={{ fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{playerName(fixture.homeId)}</span>
          <input
            type="number"
            min="0"
            value={home}
            onChange={e => { setHome(e.target.value); setErr('') }}
            autoFocus
            style={{ width: 82, textAlign: 'center', fontSize: 24, fontFamily: 'Bebas Neue', padding: '10px 8px', color: '#111', background: '#fff', border: '1px solid rgba(255,215,0,0.5)', borderRadius: 12 }}
          />
        </div>

        <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-muted)', marginTop: 24 }}>—</span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{playerName(fixture.awayId)}</span>
          <input
            type="number"
            min="0"
            value={away}
            onChange={e => { setAway(e.target.value); setErr('') }}
            style={{ width: 82, textAlign: 'center', fontSize: 24, fontFamily: 'Bebas Neue', padding: '10px 8px', color: '#111', background: '#fff', border: '1px solid rgba(255,215,0,0.5)', borderRadius: 12 }}
          />
        </div>
      </div>

      {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>⚠️ {err}</p>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-gold" style={{ flex: '1 1 180px' }} onClick={handleSave}>✅ Save Result</button>
        <button className="btn-ghost" style={{ flex: '1 1 140px' }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function FixtureCard({ fixture, idx, groupName, color, playerName, playerGameId, canEnter, canEdit, editingId, onEdit, onSave, onCancel, legLabel }) {
  const isEditing = editingId === fixture.id
  const clickable = fixture.played ? canEdit : canEnter

  return (
    <div>
      <div
        onClick={() => clickable && onEdit(fixture.id)}
        style={{
          background: isEditing ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
          border: isEditing ? '1px solid rgba(255,215,0,0.35)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: isEditing ? '16px 16px 0 0' : 16,
          padding: '14px 16px',
          cursor: clickable ? 'pointer' : 'default',
          transition: 'all 0.18s ease',
          boxShadow: isEditing ? `0 12px 30px ${color.glow}` : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 12, letterSpacing: 1.4, color: color.label }}>{groupName}</span>
            {legLabel && <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)' }}>{legLabel}</span>}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Match {String(idx + 1).padStart(2, '0')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {fixture.played && canEdit && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>✏️ Edit</span>}
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: fixture.played ? '#63db70' : '#515151' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{playerName(fixture.homeId)}</div>
            {playerGameId(fixture.homeId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(fixture.homeId)}</div>}
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Home</div>
          </div>

          <div style={{
            minWidth: 86,
            textAlign: 'center',
            padding: '8px 12px',
            borderRadius: 14,
            border: `1px solid ${fixture.played ? 'rgba(99,219,112,0.35)' : 'rgba(255,215,0,0.18)'}`,
            background: fixture.played ? 'rgba(88,150,62,0.12)' : 'rgba(255,215,0,0.06)',
          }}>
            {fixture.played ? (
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1.2, color: 'var(--text-primary)' }}>
                {fixture.homeScore} - {fixture.awayScore}
              </span>
            ) : (
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1.6, color: clickable ? 'var(--gold)' : 'var(--text-muted)' }}>VS</span>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{playerName(fixture.awayId)}</div>
            {playerGameId(fixture.awayId) && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{playerGameId(fixture.awayId)}</div>}
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Away</div>
          </div>
        </div>
      </div>

      {isEditing && (
        <ScoreEntry fixture={fixture} playerName={playerName} onSave={(h, a) => onSave(fixture.id, h, a)} onCancel={onCancel} />
      )}
    </div>
  )
}

function EmptyBlock({ icon, title, sub }) {
  return (
    <div className="card" style={{ padding: 36, textAlign: 'center' }}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1.3, color: 'var(--text-primary)' }}>{title}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '6px auto 0' }}>{sub}</p>
    </div>
  )
}

export default function FixtureSetup({
  players, groups, fixtures, setFixtures,
  fixtureConfig, setFixtureConfig,
  fixturesLocked, setFixturesLocked,
  openResultEntry, isAdmin, isLeague,
}) {
  const [view, setView] = useState('group')
  const [editingId, setEditingId] = useState(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const groupFixtures = fixtures.filter(f => f.type === 'group')
  const fixturesGenerated = groupFixtures.length > 0
  const totalFixtures = groupFixtures.length
  const playedFixtures = groupFixtures.filter(f => f.played).length
  const pendingFixtures = totalFixtures - playedFixtures
  const allPlayed = fixturesGenerated && playedFixtures === totalFixtures

  const canEnter = isAdmin || openResultEntry
  const canEdit = isAdmin

  function playerName(id) {
    return players.find(p => p.id === id)?.name ?? '???'
  }
  function playerGameId(id) {
    return players.find(p => p.id === id)?.gameId ?? ''
  }

  function setLeg(stage, value) {
    setFixtureConfig(prev => ({ ...prev, [stage]: value }))
  }

  function handleSave(fixtureId, homeScore, awayScore) {
    setFixtures(prev => prev.map(f => (f.id === fixtureId ? { ...f, homeScore, awayScore, played: true } : f)))
    setEditingId(null)
  }

  function handleEdit(id) {
    setEditingId(prev => (prev === id ? null : id))
  }

  function handleCancel() {
    setEditingId(null)
  }

  function generateGroupFixtures() {
    const resultsEntered = fixtures.filter(f => f.played).length
    const label = isLeague ? 'league' : 'group stage'
    const msg = resultsEntered > 0
      ? `⚠️ ${resultsEntered} result${resultsEntered !== 1 ? 's have' : ' has'} already been entered. Regenerating will delete them. Continue?`
      : `Generate ${label} fixtures now?`
    if (!window.confirm(msg)) return

    const newFixtures = []
    const legs = fixtureConfig.group === 2 ? 2 : 1

    if (isLeague) {
      // League: all players in one pool, no groups
      const pairs = roundRobin(players.map(p => p.id)).sort(() => Math.random() - 0.5)
      pairs.forEach((pair, pairIdx) => {
        newFixtures.push({
          id: generateId(), type: 'group', groupId: 'league',
          leg: 1, homeId: pair[0], awayId: pair[1],
          homeScore: null, awayScore: null, played: false, pairIdx,
        })
        if (legs === 2) {
          newFixtures.push({
            id: generateId(), type: 'group', groupId: 'league',
            leg: 2, homeId: pair[1], awayId: pair[0],
            homeScore: null, awayScore: null, played: false, pairIdx,
          })
        }
      })
    } else {
      groups.forEach(group => {
        const validIds = group.playerIds.filter(id => players.some(p => p.id === id))
        const pairs = roundRobin(validIds).sort(() => Math.random() - 0.5)
        pairs.forEach((pair, pairIdx) => {
          newFixtures.push({
            id: generateId(), type: 'group', groupId: group.id,
            leg: 1, homeId: pair[0], awayId: pair[1],
            homeScore: null, awayScore: null, played: false, pairIdx,
          })
          if (legs === 2) {
            newFixtures.push({
              id: generateId(), type: 'group', groupId: group.id,
              leg: 2, homeId: pair[1], awayId: pair[0],
              homeScore: null, awayScore: null, played: false, pairIdx,
            })
          }
        })
      })
    }

    setFixtures(newFixtures)
    setFixturesLocked(false)
    setEditingId(null)
  }

  function resetFixtures() {
    if (!window.confirm('Reset ALL fixtures? This cannot be undone.')) return
    setFixtures([])
    setFixturesLocked(false)
    setEditingId(null)
  }

  function handleLock() {
    if (!window.confirm('Lock fixtures? Regeneration will be disabled. Score entry will still work normally.')) return
    setFixturesLocked(true)
  }

  function handleUnlock() {
    if (!window.confirm('Unlock fixtures? This will allow regeneration again.')) return
    setFixturesLocked(false)
  }

  // In league mode, treat all players as a single "group"
  const effectiveGroups = isLeague
    ? [{ id: 'league', name: 'League', colorIdx: 0, playerIds: players.map(p => p.id) }]
    : groups

  const fixturesByGroup = useMemo(() => effectiveGroups.map(group => ({
    group,
    color: GROUP_COLORS[group.colorIdx % GROUP_COLORS.length],
    leg1: groupFixtures.filter(f => f.groupId === group.id && f.leg === 1),
    leg2: groupFixtures.filter(f => f.groupId === group.id && f.leg === 2),
    all: groupFixtures.filter(f => f.groupId === group.id),
  })), [effectiveGroups, groupFixtures])

  const maxPerGroup = Math.max(0, ...fixturesByGroup.map(g => g.all.length))
  const rounds = Array.from({ length: maxPerGroup }, (_, i) => ({
    roundNum: i + 1,
    matches: fixturesByGroup
      .map(({ group, color, all }) => ({ group, color, fixture: all[i] ?? null }))
      .filter(m => m.fixture !== null),
  }))

  const generatedGroups = fixturesByGroup.filter(g => g.all.length > 0).length
  const progressPct = totalFixtures ? Math.round((playedFixtures / totalFixtures) * 100) : 0
  const previewSummary = effectiveGroups.map(g => {
    const n = isLeague
      ? players.length
      : g.playerIds.filter(id => players.some(p => p.id === id)).length
    const matches = ((n * (n - 1)) / 2) * (fixtureConfig.group === 2 ? 2 : 1)
    return { name: g.name, players: n, matches }
  })

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 28,
        padding: '26px 24px',
        background: 'radial-gradient(circle at top right, rgba(255,215,0,0.16), transparent 24%), linear-gradient(135deg, rgba(8,20,8,0.96), rgba(6,12,8,0.98))',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', filter: 'blur(18px)' }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.45fr) minmax(300px, 0.9fr)', gap: 18 }}>
          <div>
            <p style={{ color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{isLeague ? 'League · Fixtures & Results' : 'Stage 03 · Fixtures & Results'}</p>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 42, letterSpacing: 2, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 10 }}>{isLeague ? 'LEAGUE MATCH CENTER' : 'MATCH CONTROL CENTER'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 620, lineHeight: 1.6 }}>
              {isLeague
                ? 'Set the number of legs, generate the full league schedule, and enter scores as matches are played.'
                : 'Set the number of legs, generate the full group schedule, and enter scores in a cleaner matchday-style layout.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 18 }}>
              <StatCard label="Total Fixtures" value={fixturesGenerated ? totalFixtures : '—'} sub={fixturesGenerated ? `${generatedGroups} groups active` : 'Not generated yet'} />
              <StatCard label="Played" value={fixturesGenerated ? playedFixtures : '—'} sub={fixturesGenerated ? `${progressPct}% complete` : 'No results yet'} accent="#63db70" />
              <StatCard label="Pending" value={fixturesGenerated ? pendingFixtures : '—'} sub={fixturesGenerated ? `${Math.max(0, rounds.length)} round views` : 'Awaiting generation'} accent="#6aaeff" />
              <StatCard label="Entry Mode" value={canEnter ? 'OPEN' : 'ADMIN'} sub={canEdit ? 'Admins can edit results' : 'Results locked to admins'} accent={canEnter ? '#63db70' : '#f0a060'} />
            </div>
          </div>

          <div style={{
            borderRadius: 22,
            padding: 18,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.08)',
            alignSelf: 'stretch',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1.4, color: 'var(--gold)' }}>Group Stage Progress</p>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), #76dc6f)' }} />
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: '12px 14px', borderRadius: 16, background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4 }}>Fixture Status</p>
                <p style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{fixturesGenerated ? (fixturesLocked ? 'Locked for safe progression' : 'Ready for edits and regeneration') : 'Waiting for generation'}</p>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 16, background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4 }}>Action Note</p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                  {fixturesGenerated
                    ? (allPlayed ? 'Every group match has a score. You are ready for standings and knockout setup.' : 'Tap any match card below to record the latest scoreline.')
                    : 'Choose your leg setup below, then generate the schedule.'}
                </p>
              </div>
              {fixturesGenerated && (
                <div style={{ padding: '12px 14px', borderRadius: 16, background: canEnter ? 'rgba(76,223,138,0.08)' : 'rgba(224,96,96,0.08)', border: `1px solid ${canEnter ? 'rgba(76,223,138,0.20)' : 'rgba(224,96,96,0.20)'}` }}>
                  <p style={{ color: canEnter ? '#76dc6f' : '#f08c8c', fontWeight: 700, fontSize: 13 }}>
                    {isAdmin ? '🛡 Admin controls are active.' : openResultEntry ? '🟢 Public result entry is active.' : '🔒 Only admins can enter scores right now.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {fixturesLocked && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(76,175,80,0.12), rgba(76,175,80,0.04))',
          border: '1px solid rgba(76,175,80,0.28)',
          borderLeft: '4px solid #4caf50',
          borderRadius: 18,
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ color: '#63db70', fontWeight: 700, fontSize: 14 }}>Fixtures are locked</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Regeneration is disabled so the schedule stays stable. Result entry still works.</p>
          </div>
          {isAdmin && <button className="btn-ghost" onClick={handleUnlock}>Unlock Fixtures</button>}
        </div>
      )}

      <section className="card" style={{ padding: 22 }}>
        <SectionTitle eyebrow="Setup" title="Leg Configuration & Generation" sub="Control how many times each pairing meets before you lock the schedule." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {STAGES.map(stage => (
            <div key={stage.key} style={{
              borderRadius: 18,
              padding: 16,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1.2, color: 'var(--text-primary)' }}>{stage.icon} {stage.label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stage.hint}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[1, 2].map(n => {
                  const active = fixtureConfig[stage.key] === n
                  return (
                    <button
                      key={n}
                      onClick={() => setLeg(stage.key, n)}
                      style={{
                        padding: '10px 0',
                        borderRadius: 12,
                        border: `1px solid ${active ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(255,215,0,0.12)' : 'rgba(0,0,0,0.12)',
                        color: active ? 'var(--gold)' : 'var(--text-muted)',
                        fontFamily: 'Bebas Neue',
                        fontSize: 22,
                        letterSpacing: 1.2,
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 10 }}>
                {fixtureConfig[stage.key] === 2 ? 'Two legs — home and away.' : 'Single leg — one match only.'}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16,
          borderRadius: 18,
          padding: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1.2, color: 'var(--gold)' }}>Fixture Preview</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Estimated match count per group based on current players and selected legs.</p>
            </div>
            {allPlayed && <span style={{ alignSelf: 'flex-start', background: 'rgba(76,175,80,0.12)', color: '#63db70', border: '1px solid rgba(76,175,80,0.24)', padding: '8px 12px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>✅ Group Stage Complete</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {previewSummary.length > 0 ? previewSummary.map(g => (
              <div key={g.name} style={{ borderRadius: 14, padding: 12, background: 'rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: 'var(--text-primary)', letterSpacing: 1.1 }}>{g.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{g.players} player{g.players !== 1 ? 's' : ''}</p>
                <p style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 700, marginTop: 6 }}>{g.matches} match{g.matches !== 1 ? 'es' : ''}</p>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No groups created yet.</div>
            )}
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              {!fixturesLocked && (
                <>
                  <button className="btn-gold" onClick={generateGroupFixtures}>
                    {fixturesGenerated ? '🔄 Regenerate Fixtures' : '⚽ Generate Group Fixtures'}
                  </button>
                  {fixturesGenerated && <button className="btn-danger" onClick={resetFixtures}>🗑️ Reset All Fixtures</button>}
                </>
              )}
              {fixturesGenerated && !fixturesLocked && <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={handleLock}>🔒 Lock Fixtures</button>}
            </div>
          )}
        </div>
      </section>

      {fixturesGenerated ? (
        <>
          <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SectionTitle eyebrow="Schedule Views" title="Browse Fixtures" sub="Switch between per-group cards and a unified round view." />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'group', label: '📋 By Group' },
                { id: 'round', label: '🔄 By Round' },
              ].map(v => {
                const active = view === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => { setView(v.id); setEditingId(null) }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 999,
                      border: `1px solid ${active ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.08)'}`,
                      background: active ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.02)',
                      color: active ? 'var(--gold)' : 'var(--text-muted)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {v.label}
                  </button>
                )
              })}
            </div>
          </section>

          {view === 'group' && (
            <div style={{ display: 'grid', gap: 18 }}>
              {fixturesByGroup.map(({ group, color, leg1, leg2, all }) => {
                if (all.length === 0) return null
                const played = all.filter(f => f.played).length
                return (
                  <section key={group.id} style={{
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `1px solid ${color.border}55`,
                    background: `linear-gradient(180deg, ${color.bg}, rgba(0,0,0,0.18))`,
                    boxShadow: `0 16px 40px ${color.glow}`,
                  }}>
                    <div style={{
                      padding: '16px 18px',
                      borderBottom: `1px solid ${color.border}45`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}>
                      <div>
                        <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1.6, color: color.label }}>{group.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{group.playerIds.length} competitor{group.playerIds.length !== 1 ? 's' : ''} in this group</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 12, border: '1px solid rgba(255,255,255,0.08)' }}>{played}/{all.length} played</span>
                        <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: color.label, fontSize: 12, border: `1px solid ${color.border}55` }}>{fixtureConfig.group === 2 ? '2 legs enabled' : '1 leg enabled'}</span>
                      </div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 16 }}>
                      {fixtureConfig.group === 2 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                          <div>
                            <p style={{ color: color.label, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>🏠 Leg 1</p>
                            <div style={{ display: 'grid', gap: 10 }}>
                              {leg1.map((fixture, idx) => (
                                <FixtureCard
                                  key={fixture.id}
                                  fixture={fixture}
                                  idx={idx}
                                  groupName={group.name}
                                  color={color}
                                  playerName={playerName}
                                  playerGameId={playerGameId}
                                  canEnter={canEnter}
                                  canEdit={canEdit}
                                  editingId={editingId}
                                  onEdit={handleEdit}
                                  onSave={handleSave}
                                  onCancel={handleCancel}
                                  legLabel="Leg 1"
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p style={{ color: color.label, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>✈️ Leg 2</p>
                            <div style={{ display: 'grid', gap: 10 }}>
                              {leg2.map((fixture, idx) => (
                                <FixtureCard
                                  key={fixture.id}
                                  fixture={fixture}
                                  idx={idx}
                                  groupName={group.name}
                                  color={color}
                                  playerName={playerName}
                                  playerGameId={playerGameId}
                                  canEnter={canEnter}
                                  canEdit={canEdit}
                                  editingId={editingId}
                                  onEdit={handleEdit}
                                  onSave={handleSave}
                                  onCancel={handleCancel}
                                  legLabel="Leg 2"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {all.map((fixture, idx) => (
                            <FixtureCard
                              key={fixture.id}
                              fixture={fixture}
                              idx={idx}
                              groupName={group.name}
                              color={color}
                              playerName={playerName}
                              playerGameId={playerGameId}
                              canEnter={canEnter}
                              canEdit={canEdit}
                              editingId={editingId}
                              onEdit={handleEdit}
                              onSave={handleSave}
                              onCancel={handleCancel}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          {view === 'round' && (
            <div style={{ display: 'grid', gap: 18 }}>
              {rounds.map(({ roundNum, matches }) => (
                <section key={roundNum} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div>
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1.5, color: 'var(--gold)' }}>ROUND {roundNum}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Across all active groups</p>
                    </div>
                    <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: 12 }}>
                      {matches.filter(m => m.fixture.played).length}/{matches.length} played
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {matches.map(({ group, color, fixture }, idx) => (
                      <FixtureCard
                        key={fixture.id}
                        fixture={fixture}
                        idx={idx}
                        groupName={group.name}
                        color={color}
                        playerName={playerName}
                        playerGameId={playerGameId}
                        canEnter={canEnter}
                        canEdit={canEdit}
                        editingId={editingId}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        legLabel={fixtureConfig.group === 2 ? `Leg ${fixture.leg}` : ''}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyBlock
          icon="📅"
          title="No Fixtures Yet"
          sub={isAdmin ? 'Use the setup panel above to generate the full group schedule.' : 'Fixtures have not been generated by an admin yet.'}
        />
      )}
    </div>
  )
}