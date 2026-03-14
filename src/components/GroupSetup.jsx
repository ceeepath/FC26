import { useState, useEffect, useRef } from 'react'

const GROUP_COLORS = [
  { border: '#c9960f', bg: '#1a1200', label: 'var(--gold)', glow: 'rgba(201, 150, 15, 0.22)' },
  { border: '#1a7a4a', bg: '#001a0e', label: '#4cdf8a', glow: 'rgba(76, 223, 138, 0.2)' },
  { border: '#1a4a9a', bg: '#00081a', label: '#6aaeff', glow: 'rgba(106, 174, 255, 0.2)' },
  { border: '#8a1a8a', bg: '#150015', label: '#e07ae0', glow: 'rgba(224, 122, 224, 0.18)' },
  { border: '#9a4a1a', bg: '#1a0800', label: '#f0a060', glow: 'rgba(240, 160, 96, 0.18)' },
  { border: '#1a7a7a', bg: '#001515', label: '#60e0e0', glow: 'rgba(96, 224, 224, 0.18)' },
  { border: '#6a1a1a', bg: '#180000', label: '#e06060', glow: 'rgba(224, 96, 96, 0.18)' },
  { border: '#4a6a1a', bg: '#0a1400', label: '#a0d060', glow: 'rgba(160, 208, 96, 0.18)' },
]

function panelStyle(extra = {}) {
  return {
    background: 'linear-gradient(180deg, rgba(8,18,8,0.98), rgba(5,11,5,0.98))',
    border: '1px solid var(--green-border)',
    borderRadius: 18,
    boxShadow: 'var(--shadow-card)',
    ...extra,
  }
}

function SectionHeader({ title, meta, action }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '16px 18px',
      borderBottom: '1px solid #102010',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 2, color: 'var(--gold)' }}>{title}</div>
        {meta ? <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{meta}</div> : null}
      </div>
      {action || null}
    </div>
  )
}

function MetricPill({ label, value, accent = 'var(--gold)' }) {
  return (
    <div style={{
      minWidth: 126,
      padding: '12px 14px',
      borderRadius: 16,
      border: `1px solid ${accent}30`,
      background: `linear-gradient(180deg, ${accent}14, rgba(0,0,0,0))`,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.2, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--text-primary)', marginTop: 8 }}>{value}</div>
    </div>
  )
}

function PlayerChip({ checked, name, onToggle, disabled = false }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px',
      background: checked ? 'linear-gradient(180deg, #102810, #0a180a)' : '#050e05',
      border: `1px solid ${checked ? '#2f7a2f' : 'var(--green-border)'}`,
      borderRadius: 12,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
      userSelect: 'none',
      opacity: disabled ? 0.55 : 1,
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0 }}
      />
      <span style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {name}
      </span>
    </label>
  )
}

function GroupCard({ group, players, groupsLocked, isAdmin, onRemoveGroup, onRemovePlayer, onDraw, isDrawing, unassignedCount }) {
  const color = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length]
  const groupPlayers = group.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean)

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 18,
      background: `linear-gradient(180deg, ${color.bg}, rgba(4,8,4,0.98))`,
      border: `1px solid ${color.border}`,
      boxShadow: `0 18px 40px -26px ${color.glow}`,
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at top right, ${color.glow} 0%, transparent 36%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        padding: '14px 16px',
        borderBottom: `1px solid ${color.border}55`,
        background: `linear-gradient(90deg, ${color.glow}, transparent)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 2, color: color.label }}>{group.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {groupPlayers.length} player{groupPlayers.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color.label, boxShadow: `0 0 16px ${color.glow}` }} />
            {isAdmin && !groupsLocked ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {onDraw && (
                  <button
                    onClick={() => onDraw(group.id)}
                    disabled={isDrawing}
                    style={{
                      padding: '5px 10px', fontSize: 12, borderRadius: 8,
                      border: `1px solid ${color.border}`,
                      background: isDrawing ? `${color.glow}` : `${color.border}22`,
                      color: color.label,
                      cursor: isDrawing ? 'not-allowed' : 'pointer',
                      fontWeight: 700, letterSpacing: 0.5,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isDrawing ? '⏳ Drawing…' : '🎲 Draw'}
                  </button>
                )}
                <button className="btn-danger" style={{ padding: '5px 9px', fontSize: 12 }} onClick={() => onRemoveGroup(group.id)}>
                  🗑
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', padding: '12px 16px 14px' }}>
        {groupPlayers.length === 0 ? (
          <div style={{
            border: `1px dashed ${color.border}66`,
            borderRadius: 12,
            padding: '18px 12px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
          }}>
            No players assigned yet
          </div>
        ) : groupPlayers.map((player, idx) => (
          <div key={player.id} className="fade-up" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 0',
            borderBottom: idx === groupPlayers.length - 1 ? 'none' : `1px solid ${color.border}28`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: color.label,
                border: `1px solid ${color.border}`,
                background: `${color.glow}`,
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {player.name}
                </div>
                {player.gameId && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {player.gameId}
                  </div>
                )}
              </div>
            </div>
            {isAdmin && !groupsLocked ? (
              <button
                onClick={() => onRemovePlayer(group.id, player.id)}
                title="Unassign player"
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: `1px solid ${color.border}66`,
                  background: '#081108', color: 'var(--text-muted)',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                ✕
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GroupSetup({ players, groups, setGroups, groupsLocked, setGroupsLocked, isAdmin }) {
  const [newGroupName, setNewGroupName] = useState('')
  const [feedback, setFeedback] = useState({ msg: '', ok: true })
  const [playersPerGroup, setPlayersPerGroup] = useState(4)
  const [checkedPlayers, setCheckedPlayers] = useState(new Set())
  const [targetGroup, setTargetGroup] = useState('')
  const [drawingGroupId, setDrawingGroupId] = useState(null)  // group currently being drawn into
  const drawTimeouts = useRef([])

  function flash(msg, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback({ msg: '', ok: true }), 2800)
  }

  const assignedPlayerIds = new Set(groups.flatMap(g => g.playerIds))
  const unassignedPlayers = players.filter(p => !assignedPlayerIds.has(p.id))
  const allAssigned = unassignedPlayers.length === 0 && players.length > 0
  const expectedGroups = !isNaN(parseInt(playersPerGroup, 10)) && parseInt(playersPerGroup, 10) >= 2
    ? Math.ceil(players.length / parseInt(playersPerGroup, 10))
    : 0

  function addGroup(e) {
    e.preventDefault()
    const name = newGroupName.trim() || `Group ${String.fromCharCode(65 + groups.length)}`
    if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
      flash('⚠️ A group with that name already exists.', false)
      return
    }
    setGroups(prev => [...prev, { id: `grp_${Date.now()}`, name, playerIds: [], colorIdx: prev.length }])
    setNewGroupName('')
    flash(`✅ ${name} created!`)
  }

  function handleAutoAssign() {
    if (players.length === 0) {
      flash('⚠️ No players to assign.', false)
      return
    }

    const ppg = parseInt(playersPerGroup, 10)
    if (isNaN(ppg) || ppg < 2) {
      flash('⚠️ Players per group must be at least 2.', false)
      return
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const numGroups = Math.ceil(shuffled.length / ppg)
    const newGroups = []

    for (let i = 0; i < numGroups; i++) {
      const letter = String.fromCharCode(65 + i)
      const slice = shuffled.slice(i * ppg, i * ppg + ppg)
      newGroups.push({
        id: `grp_${Date.now()}_${i}`,
        name: `Group ${letter}`,
        playerIds: slice.map(p => p.id),
        colorIdx: i,
      })
    }

    if (!window.confirm(`This will clear all existing groups and randomly create ${numGroups} group${numGroups !== 1 ? 's' : ''} of ~${ppg} players. Continue?`)) return

    setGroups(newGroups)
    setCheckedPlayers(new Set())
    setTargetGroup('')
    flash(`✅ ${numGroups} groups created and ${shuffled.length} players assigned randomly!`)
  }

  function toggleCheck(playerId) {
    setCheckedPlayers(prev => {
      const next = new Set(prev)
      next.has(playerId) ? next.delete(playerId) : next.add(playerId)
      return next
    })
  }

  function toggleCheckAll() {
    if (checkedPlayers.size === unassignedPlayers.length) {
      setCheckedPlayers(new Set())
    } else {
      setCheckedPlayers(new Set(unassignedPlayers.map(p => p.id)))
    }
  }

  function bulkAssign() {
    if (checkedPlayers.size === 0) {
      flash('⚠️ No players selected.', false)
      return
    }
    if (!targetGroup) {
      flash('⚠️ Please select a target group.', false)
      return
    }

    setGroups(prev => prev.map(g => (
      g.id === targetGroup
        ? { ...g, playerIds: [...g.playerIds, ...Array.from(checkedPlayers)] }
        : g
    )))

    const groupName = groups.find(g => g.id === targetGroup)?.name
    flash(`✅ ${checkedPlayers.size} player${checkedPlayers.size !== 1 ? 's' : ''} assigned to ${groupName}!`)
    setCheckedPlayers(new Set())
    setTargetGroup('')
  }

  function drawGroup(groupId) {
    const ppg = parseInt(playersPerGroup, 10)
    if (isNaN(ppg) || ppg < 2) {
      flash('⚠️ Set players per group (min 2) before drawing.', false)
      return
    }

    // Current unassigned at draw time
    const currentAssigned = new Set(groups.flatMap(g => g.playerIds))
    const pool = players.filter(p => !currentAssigned.has(p.id))

    if (pool.length === 0) {
      flash('⚠️ No unassigned players left to draw from.', false)
      return
    }

    const count = Math.min(ppg, pool.length)
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const drawn = shuffled.slice(0, count).map(p => p.id)

    // Clear any in-progress draw
    drawTimeouts.current.forEach(t => clearTimeout(t))
    drawTimeouts.current = []

    // Set drawing state
    setDrawingGroupId(groupId)

    // Remove all drawn players from the group first (reset), then add one by one
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, playerIds: [] } : g
    ))

    // Add players one by one with delay
    drawn.forEach((playerId, i) => {
      const t = setTimeout(() => {
        setGroups(prev => prev.map(g =>
          g.id === groupId ? { ...g, playerIds: [...g.playerIds, playerId] } : g
        ))
        // On last player, clear drawing state
        if (i === drawn.length - 1) {
          const endT = setTimeout(() => {
            setDrawingGroupId(null)
            flash(`✅ ${drawn.length} players drawn into ${groups.find(g => g.id === groupId)?.name}!`)
          }, 400)
          drawTimeouts.current.push(endT)
        }
      }, i * 1000)
      drawTimeouts.current.push(t)
    })
  }

  function removePlayerFromGroup(groupId, playerId) {
    setGroups(prev => prev.map(g => (
      g.id === groupId ? { ...g, playerIds: g.playerIds.filter(id => id !== playerId) } : g
    )))
  }

  function removeGroup(groupId) {
    const group = groups.find(g => g.id === groupId)
    if (!group) return
    if (!window.confirm(`Remove "${group.name}" and unassign all its players?`)) return
    setGroups(prev => prev.filter(g => g.id !== groupId))
  }

  function handleLock() {
    if (unassignedPlayers.length > 0) {
      flash(`⚠️ ${unassignedPlayers.length} player(s) still unassigned.`, false)
      return
    }
    if (groups.length === 0) {
      flash('⚠️ No groups created yet.', false)
      return
    }
    if (!window.confirm('Lock groups? This cannot be undone once the tournament starts.')) return
    setGroupsLocked(true)
    flash('🔒 Groups locked! Ready to generate fixtures.')
  }

  function handleUnlock() {
    if (!window.confirm('Unlock groups? This will allow changes but may affect existing fixtures.')) return
    setGroupsLocked(false)
  }

  const selectStyle = {
    background: '#050e05',
    border: '1px solid var(--green-border)',
    color: 'var(--text-primary)',
    borderRadius: 12,
    padding: '11px 14px',
    fontFamily: 'Barlow',
    fontSize: 14,
    outline: 'none',
  }

  const inputStyle = {
    width: '100%',
    background: '#050e05',
    border: '1px solid var(--green-border)',
    color: 'var(--text-primary)',
    borderRadius: 12,
    padding: '11px 14px',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div className="fade-up">
      <div style={{ ...panelStyle({ padding: 22, marginBottom: 18, overflow: 'hidden', position: 'relative' }) }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at top right, rgba(201,150,15,0.12) 0%, transparent 34%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, border: '1px solid #2a3a12', background: 'rgba(201,150,15,0.08)', marginBottom: 14 }}>
              <span style={{ fontSize: 12 }}>📋</span>
              <span style={{ fontSize: 11, letterSpacing: 1.3, fontWeight: 700, color: 'var(--gold)' }}>GROUP STAGE SETUP</span>
            </div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 34, color: 'var(--text-primary)', letterSpacing: 2, marginBottom: 8 }}>
              Build the tournament groups
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.65, maxWidth: 520 }}>
              Create groups manually or auto-assign players randomly, then review every group card before locking the stage and moving on to fixtures.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
            <MetricPill label="PLAYERS" value={players.length} />
            <MetricPill label="GROUPS" value={groups.length} accent="#4cdf8a" />
            <MetricPill label="UNASSIGNED" value={unassignedPlayers.length} accent={unassignedPlayers.length === 0 ? '#4cdf8a' : '#f0a060'} />
          </div>
        </div>
      </div>

      {feedback.msg ? (
        <div style={{
          ...panelStyle({
            padding: '12px 16px',
            marginBottom: 16,
            borderColor: feedback.ok ? '#2d5a2d' : '#5a2020',
            background: feedback.ok
              ? 'linear-gradient(180deg, rgba(10,31,10,0.98), rgba(6,14,6,0.98))'
              : 'linear-gradient(180deg, rgba(40,14,14,0.98), rgba(18,8,8,0.98))',
          }),
          color: feedback.ok ? '#a8d5a8' : '#f0a0a0',
          fontSize: 14,
        }}>
          {feedback.msg}
        </div>
      ) : null}

      {groupsLocked ? (
        <div style={{
          ...panelStyle({
            marginBottom: 18,
            padding: '16px 18px',
            borderColor: '#2d5a2d',
            background: 'linear-gradient(180deg, rgba(10,31,10,0.98), rgba(6,14,6,0.98))',
          }),
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, border: '1px solid #2d5a2d', background: 'rgba(76,175,80,0.12)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
              🔒
            </div>
            <div>
              <div style={{ color: '#7ed27e', fontWeight: 700, fontSize: 14 }}>Groups are locked and ready</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>The next step is fixture generation.</div>
            </div>
          </div>
          {isAdmin ? <button className="btn-ghost" onClick={handleUnlock}>Unlock Groups</button> : null}
        </div>
      ) : null}

      {!groupsLocked && isAdmin ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 16, marginBottom: 18 }}>
          <div style={panelStyle()}>
            <SectionHeader title="AUTO ASSIGN" meta="Shuffle every player and create balanced groups instantly" />
            <div style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 14 }}>
                <MetricPill label="TOTAL PLAYERS" value={players.length} accent="#6aaeff" />
                <MetricPill label="PLAYERS / GROUP" value={playersPerGroup} accent="#f0a060" />
                <MetricPill label="EST. GROUPS" value={expectedGroups || 0} accent="#4cdf8a" />
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 180, flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>PLAYERS PER GROUP</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={playersPerGroup}
                    onChange={e => setPlayersPerGroup(e.target.value)}
                    style={{ ...inputStyle, width: 110 }}
                  />
                </div>
                <button className="btn-gold" onClick={handleAutoAssign} style={{ whiteSpace: 'nowrap' }}>
                  🎲 Auto-Assign Players
                </button>
              </div>
            </div>
          </div>

          <div style={panelStyle()}>
            <SectionHeader title="CREATE GROUP" meta="Add a group manually before assigning players" />
            <form onSubmit={addGroup} style={{ padding: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>GROUP NAME</label>
              <input
                type="text"
                placeholder={`Group ${String.fromCharCode(65 + groups.length)} (leave blank for auto-name)`}
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                style={{ ...inputStyle, marginBottom: 14 }}
              />
              <button type="submit" className="btn-gold" style={{ width: '100%' }}>
                + Create Group
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {!groupsLocked && isAdmin && groups.length > 0 ? (
        <div style={{ ...panelStyle(), marginBottom: 18 }}>
          <SectionHeader
            title="ASSIGN PLAYERS"
            meta="Select unassigned players and drop them into any group"
            action={(
              <button className="btn-ghost" onClick={toggleCheckAll} style={{ padding: '8px 12px', fontSize: 12 }}>
                {checkedPlayers.size === unassignedPlayers.length && unassignedPlayers.length > 0 ? 'Clear All' : 'Select All'}
              </button>
            )}
          />

          <div style={{ padding: 18 }}>
            {unassignedPlayers.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap', marginBottom: 16 }}>
                  <div style={{ minWidth: 220, flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>TARGET GROUP</label>
                    <select value={targetGroup} onChange={e => setTargetGroup(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                      <option value="">Choose a group</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <button className="btn-gold" onClick={bulkAssign} style={{ opacity: checkedPlayers.size === 0 || !targetGroup ? 0.5 : 1 }}>
                    Assign Selected {checkedPlayers.size > 0 ? `(${checkedPlayers.size})` : ''}
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: 8,
                  maxHeight: 320,
                  overflowY: 'auto',
                  paddingRight: 4,
                }}>
                  {unassignedPlayers.map(player => (
                    <PlayerChip
                      key={player.id}
                      checked={checkedPlayers.has(player.id)}
                      name={player.name}
                      onToggle={() => toggleCheck(player.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                borderRadius: 14,
                border: '1px solid #2d5a2d',
                background: 'linear-gradient(180deg, rgba(10,31,10,0.98), rgba(6,14,6,0.98))',
                padding: '18px 16px',
                color: '#7ed27e',
                fontWeight: 700,
                fontSize: 14,
              }}>
                ✅ All players have been assigned to groups.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!groupsLocked && isAdmin && groups.length > 0 && (
        <div style={{ ...panelStyle({ padding: '14px 18px', marginBottom: 18 }), display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>DRAW SIZE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Players per group</label>
            <input
              type="number"
              min="2"
              max="20"
              value={playersPerGroup}
              onChange={e => setPlayersPerGroup(e.target.value)}
              style={{ width: 70, padding: '6px 10px', borderRadius: 8, background: '#050e05', border: '1px solid var(--green-border)', color: 'var(--text-primary)', fontSize: 14, textAlign: 'center' }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {unassignedPlayers.length} player{unassignedPlayers.length !== 1 ? 's' : ''} in pool · click 🎲 Draw on any group card
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div style={{ ...panelStyle({ padding: 42, textAlign: 'center' }) }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 2, color: 'var(--gold)', marginBottom: 6 }}>No groups yet</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
            Start by auto-assigning players or create your first group manually.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))', gap: 16, marginBottom: 18 }}>
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              players={players}
              groupsLocked={groupsLocked}
              isAdmin={isAdmin}
              onRemoveGroup={removeGroup}
              onRemovePlayer={removePlayerFromGroup}
              onDraw={drawGroup}
              isDrawing={drawingGroupId === group.id}
              unassignedCount={unassignedPlayers.length}
            />
          ))}
        </div>
      )}

      {!groupsLocked && isAdmin && groups.length > 0 ? (
        <div style={{
          ...panelStyle({
            padding: '16px 18px',
            borderColor: allAssigned ? '#2d5a2d' : '#5a4a20',
            background: allAssigned
              ? 'linear-gradient(180deg, rgba(10,31,10,0.98), rgba(6,14,6,0.98))'
              : 'linear-gradient(180deg, rgba(32,24,8,0.98), rgba(18,12,4,0.98))',
          }),
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ color: allAssigned ? '#7ed27e' : '#f0b060', fontWeight: 700, fontSize: 14 }}>
              {allAssigned ? '✅ All players assigned — groups can now be locked.' : `⚠️ ${unassignedPlayers.length} player(s) still need a group.`}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              Locking groups enables fixture generation in the next stage.
            </div>
          </div>
          <button className="btn-gold" onClick={handleLock} style={{ opacity: allAssigned ? 1 : 0.5 }}>
            🔒 Lock Groups
          </button>
        </div>
      ) : null}
    </div>
  )
}