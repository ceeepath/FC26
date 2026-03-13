import { useState } from 'react'

const GROUP_COLORS = [
  { border: '#c9960f', bg: '#1a1200', label: 'var(--gold)' },
  { border: '#1a7a4a', bg: '#001a0e', label: '#4cdf8a' },
  { border: '#1a4a9a', bg: '#00081a', label: '#6aaeff' },
  { border: '#8a1a8a', bg: '#150015', label: '#e07ae0' },
  { border: '#9a4a1a', bg: '#1a0800', label: '#f0a060' },
  { border: '#1a7a7a', bg: '#001515', label: '#60e0e0' },
  { border: '#6a1a1a', bg: '#180000', label: '#e06060' },
  { border: '#4a6a1a', bg: '#0a1400', label: '#a0d060' },
]

export default function GroupSetup({ players, groups, setGroups, groupsLocked, setGroupsLocked, isAdmin }) {
  const [newGroupName, setNewGroupName] = useState('')
  const [feedback, setFeedback] = useState({ msg: '', ok: true })
  const [playersPerGroup, setPlayersPerGroup] = useState(4)
  const [checkedPlayers, setCheckedPlayers] = useState(new Set())
  const [targetGroup, setTargetGroup] = useState('')

  function flash(msg, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback({ msg: '', ok: true }), 2800)
  }

  const assignedPlayerIds = new Set(groups.flatMap(g => g.playerIds))
  const unassignedPlayers = players.filter(p => !assignedPlayerIds.has(p.id))
  const allAssigned = unassignedPlayers.length === 0 && players.length > 0

  function addGroup(e) {
    e.preventDefault()
    const name = newGroupName.trim() || `Group ${String.fromCharCode(65 + groups.length)}`
    if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
      flash('⚠️ A group with that name already exists.', false); return
    }
    setGroups(prev => [...prev, { id: `grp_${Date.now()}`, name, playerIds: [], colorIdx: prev.length }])
    setNewGroupName('')
    flash(`✅ ${name} created!`)
  }

  function handleAutoAssign() {
    if (players.length === 0) { flash('⚠️ No players to assign.', false); return }
    const ppg = parseInt(playersPerGroup, 10)
    if (isNaN(ppg) || ppg < 2) { flash('⚠️ Players per group must be at least 2.', false); return }
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
    if (checkedPlayers.size === 0) { flash('⚠️ No players selected.', false); return }
    if (!targetGroup) { flash('⚠️ Please select a target group.', false); return }
    setGroups(prev => prev.map(g =>
      g.id === targetGroup
        ? { ...g, playerIds: [...g.playerIds, ...Array.from(checkedPlayers)] }
        : g
    ))
    const groupName = groups.find(g => g.id === targetGroup)?.name
    flash(`✅ ${checkedPlayers.size} player${checkedPlayers.size !== 1 ? 's' : ''} assigned to ${groupName}!`)
    setCheckedPlayers(new Set())
    setTargetGroup('')
  }

  function removePlayerFromGroup(groupId, playerId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, playerIds: g.playerIds.filter(id => id !== playerId) } : g
    ))
  }

  function removeGroup(groupId) {
    const group = groups.find(g => g.id === groupId)
    if (!window.confirm(`Remove "${group.name}" and unassign all its players?`)) return
    setGroups(prev => prev.filter(g => g.id !== groupId))
  }

  function handleLock() {
    if (unassignedPlayers.length > 0) { flash(`⚠️ ${unassignedPlayers.length} player(s) still unassigned.`, false); return }
    if (groups.length === 0) { flash('⚠️ No groups created yet.', false); return }
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
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: 'Barlow',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          GROUP SETUP
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {players.length} players · {groups.length} group{groups.length !== 1 ? 's' : ''} · {unassignedPlayers.length} unassigned
        </p>
      </div>

      {groupsLocked && (
        <div style={{
          background: '#0a1f0a', border: '1px solid #2a5a2a', borderLeft: '3px solid #4caf50',
          borderRadius: 10, padding: '12px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
              <p style={{ fontWeight: 700, color: '#4caf50', fontSize: 14 }}>Groups are locked</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Fixtures can now be generated.</p>
            </div>
          </div>
          {isAdmin && (
            <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={handleUnlock}>
              Unlock
            </button>
          )}
        </div>
      )}

      {feedback.msg && (
        <div style={{
          background: feedback.ok ? '#0e2a0e' : '#2a0e0e',
          border: `1px solid ${feedback.ok ? 'var(--green-border)' : '#5a2020'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: 14, color: feedback.ok ? '#a8d5a8' : '#e08080'
        }}>
          {feedback.msg}
        </div>
      )}

      {!groupsLocked && isAdmin && (
        <>
          {/* Auto-Assign */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
              🎲 AUTO-ASSIGN PLAYERS TO GROUPS
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Set how many players per group. The app will randomly shuffle all {players.length} players and create the groups automatically.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>Players per group:</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={playersPerGroup}
                  onChange={e => setPlayersPerGroup(e.target.value)}
                  style={{ width: 70 }}
                />
              </div>
              {players.length > 0 && !isNaN(parseInt(playersPerGroup)) && parseInt(playersPerGroup) >= 2 && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  → {Math.ceil(players.length / parseInt(playersPerGroup))} group{Math.ceil(players.length / parseInt(playersPerGroup)) !== 1 ? 's' : ''}
                </span>
              )}
              <button className="btn-gold" style={{ whiteSpace: 'nowrap' }} onClick={handleAutoAssign}>
                🎲 Auto-Assign
              </button>
            </div>
          </div>

          {/* Create Group Manually */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--gold)' }}>
              ➕ CREATE A GROUP MANUALLY
            </p>
            <form onSubmit={addGroup} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder={`Group ${String.fromCharCode(65 + groups.length)} (leave blank for auto-name)`}
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap' }}>
                + GROUP
              </button>
            </form>
          </div>

          {/* Bulk Assign with Checkboxes */}
          {groups.length > 0 && unassignedPlayers.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
                ✅ ASSIGN PLAYERS TO GROUP
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                Check one or more players, pick a group, then click Assign.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={checkedPlayers.size === unassignedPlayers.length && unassignedPlayers.length > 0}
                    onChange={toggleCheckAll}
                    style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }}
                  />
                  Select all ({unassignedPlayers.length})
                </label>

                <select
                  value={targetGroup}
                  onChange={e => setTargetGroup(e.target.value)}
                  style={{ ...selectStyle, flex: 1, minWidth: 160 }}
                >
                  <option value="">Select target group…</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.playerIds.length} players)</option>
                  ))}
                </select>

                <button
                  className="btn-gold"
                  style={{ whiteSpace: 'nowrap', opacity: checkedPlayers.size === 0 || !targetGroup ? 0.45 : 1 }}
                  onClick={bulkAssign}
                >
                  Assign {checkedPlayers.size > 0 ? `(${checkedPlayers.size})` : ''} →
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 6,
                maxHeight: 260,
                overflowY: 'auto',
                padding: '2px 0',
              }}>
                {unassignedPlayers.map(p => (
                  <label key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    background: checkedPlayers.has(p.id) ? '#0f2a0f' : '#050e05',
                    border: `1px solid ${checkedPlayers.has(p.id) ? '#2a6a2a' : 'var(--green-border)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s',
                    userSelect: 'none',
                  }}>
                    <input
                      type="checkbox"
                      checked={checkedPlayers.has(p.id)}
                      onChange={() => toggleCheck(p.id)}
                      style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {groups.length > 0 && unassignedPlayers.length === 0 && (
            <div style={{
              background: '#0a1f0a', border: '1px solid #2a5a2a',
              borderRadius: 10, padding: '12px 18px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <p style={{ fontWeight: 600, color: '#4caf50', fontSize: 14 }}>All players have been assigned to groups!</p>
            </div>
          )}
        </>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No groups yet. Use auto-assign or create one manually above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          {groups.map(group => {
            const color = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length]
            const groupPlayers = group.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean)
            return (
              <div key={group.id} style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2, color: color.label }}>
                    {group.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{groupPlayers.length} player{groupPlayers.length !== 1 ? 's' : ''}</span>
                    {isAdmin && !groupsLocked && (
                      <button className="btn-danger" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => removeGroup(group.id)}>🗑️</button>
                    )}
                  </div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  {groupPlayers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', padding: '6px 0' }}>No players yet</p>
                  ) : (
                    groupPlayers.map((player, idx) => (
                      <div key={player.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 0', borderBottom: idx < groupPlayers.length - 1 ? `1px solid ${color.border}40` : 'none'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: color.label, fontFamily: 'Bebas Neue', fontSize: 14, opacity: 0.7 }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{player.name}</span>
                        </span>
                        {isAdmin && !groupsLocked && (
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px', lineHeight: 1 }}
                            onClick={() => removePlayerFromGroup(group.id, player.id)}
                            title="Unassign player"
                          >✕</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lock button */}
      {isAdmin && !groupsLocked && groups.length > 0 && (
        <div style={{
          background: allAssigned ? '#0a1f0a' : '#1a1000',
          border: `1px solid ${allAssigned ? '#2a5a2a' : '#3a2a00'}`,
          borderRadius: 10, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: allAssigned ? '#4caf50' : '#e07a30' }}>
              {allAssigned ? '✅ All players assigned — ready to lock!' : `⚠️ ${unassignedPlayers.length} player(s) unassigned`}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Locking groups enables fixture generation in the next step.
            </p>
          </div>
          <button className="btn-gold" style={{ opacity: allAssigned ? 1 : 0.5 }} onClick={handleLock}>
            🔒 LOCK GROUPS
          </button>
        </div>
      )}
    </div>
  )
}