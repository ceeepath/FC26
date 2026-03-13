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
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [targetGroup, setTargetGroup] = useState('')
  const [feedback, setFeedback] = useState('')

  function flash(msg) {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 2500)
  }

  // Players not yet assigned to any group
  const assignedPlayerIds = new Set(groups.flatMap(g => g.playerIds))
  const unassignedPlayers = players.filter(p => !assignedPlayerIds.has(p.id))

  function addGroup(e) {
    e.preventDefault()
    const name = newGroupName.trim() || `Group ${String.fromCharCode(65 + groups.length)}`
    if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
      flash('⚠️ A group with that name already exists.')
      return
    }
    const colorIdx = groups.length % GROUP_COLORS.length
    setGroups(prev => [...prev, {
      id: `grp_${Date.now()}`,
      name,
      playerIds: [],
      colorIdx
    }])
    setNewGroupName('')
    flash(`✅ ${name} created!`)
  }

  function assignPlayer(e) {
    e.preventDefault()
    if (!selectedPlayer || !targetGroup) return
    setGroups(prev => prev.map(g =>
      g.id === targetGroup
        ? { ...g, playerIds: [...g.playerIds, selectedPlayer] }
        : g
    ))
    setSelectedPlayer('')
    const playerName = players.find(p => p.id === selectedPlayer)?.name
    const groupName = groups.find(g => g.id === targetGroup)?.name
    flash(`✅ ${playerName} → ${groupName}`)
  }

  function removePlayerFromGroup(groupId, playerId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, playerIds: g.playerIds.filter(id => id !== playerId) }
        : g
    ))
  }

  function removeGroup(groupId) {
    const group = groups.find(g => g.id === groupId)
    if (!window.confirm(`Remove "${group.name}" and unassign all its players?`)) return
    setGroups(prev => prev.filter(g => g.id !== groupId))
  }

  function handleLock() {
    if (unassignedPlayers.length > 0) {
      flash(`⚠️ ${unassignedPlayers.length} player(s) still unassigned. Assign everyone before locking.`)
      return
    }
    if (groups.length === 0) {
      flash('⚠️ No groups created yet.')
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

  const allAssigned = unassignedPlayers.length === 0 && players.length > 0

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          GROUP SETUP
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {players.length} players · {groups.length} group{groups.length !== 1 ? 's' : ''} · {unassignedPlayers.length} unassigned
        </p>
      </div>

      {/* Locked banner */}
      {groupsLocked && (
        <div style={{
          background: '#0a1f0a',
          border: '1px solid #2a5a2a',
          borderLeft: '3px solid #4caf50',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
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

      {/* Feedback */}
      {feedback && (
        <div style={{
          background: '#0e2a0e', border: '1px solid var(--green-border)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: 14, color: '#a8d5a8'
        }}>
          {feedback}
        </div>
      )}

      {!groupsLocked && isAdmin && (
        <>
          {/* Create Group */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--gold)' }}>
              CREATE GROUP
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

          {/* Assign Player */}
          {groups.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--gold)' }}>
                ASSIGN PLAYER TO GROUP
              </p>
              {unassignedPlayers.length === 0 ? (
                <p style={{ color: '#4caf50', fontSize: 14 }}>✅ All players have been assigned!</p>
              ) : (
                <form onSubmit={assignPlayer} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <select
                    value={selectedPlayer}
                    onChange={e => setSelectedPlayer(e.target.value)}
                    style={{
                      flex: 1, minWidth: 160,
                      background: '#050e05',
                      border: '1px solid var(--green-border)',
                      color: selectedPlayer ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderRadius: 8, padding: '10px 14px',
                      fontFamily: 'Barlow', fontSize: 15, outline: 'none',
                    }}
                    required
                  >
                    <option value="">Select player…</option>
                    {unassignedPlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={targetGroup}
                    onChange={e => setTargetGroup(e.target.value)}
                    style={{
                      flex: 1, minWidth: 140,
                      background: '#050e05',
                      border: '1px solid var(--green-border)',
                      color: targetGroup ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderRadius: 8, padding: '10px 14px',
                      fontFamily: 'Barlow', fontSize: 15, outline: 'none',
                    }}
                    required
                  >
                    <option value="">Select group…</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.playerIds.length} players)</option>
                    ))}
                  </select>
                  <button type="submit" className="btn-gold">Assign →</button>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            No groups yet. Create your first group above.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {groups.map(group => {
            const color = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length]
            const groupPlayers = group.playerIds
              .map(id => players.find(p => p.id === id))
              .filter(Boolean)

            return (
              <div key={group.id} style={{
                background: color.bg,
                border: `1px solid ${color.border}`,
                borderRadius: 12,
                overflow: 'hidden'
              }}>
                {/* Group header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${color.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: 20,
                    letterSpacing: 2,
                    color: color.label
                  }}>
                    {group.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {groupPlayers.length} player{groupPlayers.length !== 1 ? 's' : ''}
                    </span>
                    {isAdmin && !groupsLocked && (
                      <button
                        className="btn-danger"
                        style={{ padding: '3px 8px', fontSize: 12 }}
                        onClick={() => removeGroup(group.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Player list */}
                <div style={{ padding: '10px 16px' }}>
                  {groupPlayers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', padding: '6px 0' }}>
                      No players yet
                    </p>
                  ) : (
                    groupPlayers.map((player, idx) => (
                      <div key={player.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 0',
                        borderBottom: idx < groupPlayers.length - 1 ? `1px solid ${color.border}40` : 'none'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: color.label, fontFamily: 'Bebas Neue', fontSize: 14, opacity: 0.7 }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{player.name}</span>
                        </span>
                        {isAdmin && !groupsLocked && (
                          <button
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px',
                              lineHeight: 1, transition: 'color 0.2s'
                            }}
                            onClick={() => removePlayerFromGroup(group.id, player.id)}
                            title="Unassign player"
                          >
                            ✕
                          </button>
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

      {/* Unassigned Players chip list */}
      {unassignedPlayers.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#e07a30', marginBottom: 12 }}>
            ⏳ {unassignedPlayers.length} UNASSIGNED PLAYER{unassignedPlayers.length !== 1 ? 'S' : ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {unassignedPlayers.map(p => (
              <span key={p.id} style={{
                background: '#1a1000',
                border: '1px solid #3a2a00',
                color: '#e0b060',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 600
              }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lock button */}
      {isAdmin && !groupsLocked && groups.length > 0 && (
        <div style={{
          background: allAssigned ? '#0a1f0a' : '#1a1000',
          border: `1px solid ${allAssigned ? '#2a5a2a' : '#3a2a00'}`,
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: allAssigned ? '#4caf50' : '#e07a30' }}>
              {allAssigned ? '✅ All players assigned — ready to lock!' : `⚠️ ${unassignedPlayers.length} player(s) unassigned`}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Locking groups enables fixture generation in the next step.
            </p>
          </div>
          <button
            className="btn-gold"
            style={{ opacity: allAssigned ? 1 : 0.5 }}
            onClick={handleLock}
          >
            🔒 LOCK GROUPS
          </button>
        </div>
      )}
    </div>
  )
}
