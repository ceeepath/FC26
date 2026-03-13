import { useState } from 'react'
import { generateId } from '../utils/storage'

export default function PlayerManagement({ players, setPlayers, isAdmin }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')

  function flash(msg) {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 2500)
  }

  function addPlayer(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      flash('⚠️ Player already exists!')
      return
    }
    setPlayers(prev => [...prev, { id: generateId(), name: trimmed }])
    setNewName('')
    flash(`✅ ${trimmed} added!`)
  }

  function startEdit(player) {
    setEditingId(player.id)
    setEditName(player.name)
  }

  function saveEdit(id) {
    const trimmed = editName.trim()
    if (!trimmed) return
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p))
    setEditingId(null)
    flash('✅ Name updated!')
  }

  function removePlayer(id, name) {
    if (!window.confirm(`Remove ${name} from the tournament?`)) return
    setPlayers(prev => prev.filter(p => p.id !== id))
    flash(`🗑️ ${name} removed.`)
  }

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-up">
      {/* Section Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          PLAYER ROSTER
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {players.length} player{players.length !== 1 ? 's' : ''} registered
          {players.length > 0 && players.length < 25 && (
            <span style={{ color: '#e07a30', marginLeft: 10 }}>
              · Need at least 25 to start
            </span>
          )}
          {players.length >= 25 && (
            <span style={{ color: '#4caf50', marginLeft: 10 }}>
              · ✓ Ready to group
            </span>
          )}
        </p>
      </div>

      {/* Add Player — admin only */}
      {isAdmin && (
        <form onSubmit={addPlayer} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Enter player name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap' }}>
            + ADD
          </button>
        </form>
      )}

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          background: '#0e2a0e',
          border: '1px solid var(--green-border)',
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: 16,
          fontSize: 14,
          color: '#a8d5a8'
        }}>
          {feedback}
        </div>
      )}

      {/* Search */}
      {players.length > 5 && (
        <input
          type="text"
          placeholder="🔍 Search players…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Player List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {players.length === 0
              ? 'No players yet. Add the first competitor!'
              : 'No players match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((player, idx) => (
            <div
              key={player.id}
              className="card"
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'border-color 0.2s',
              }}
            >
              {/* Number badge */}
              <span style={{
                fontFamily: 'Bebas Neue',
                fontSize: 18,
                color: 'var(--gold)',
                minWidth: 32,
                textAlign: 'center',
                opacity: 0.7
              }}>
                {String(players.indexOf(player) + 1).padStart(2, '0')}
              </span>

              {/* Name / Edit input */}
              {editingId === player.id && isAdmin ? (
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(player.id); if (e.key === 'Escape') setEditingId(null) }}
                  autoFocus
                  style={{ flex: 1, padding: '6px 10px', fontSize: 14 }}
                />
              ) : (
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>
                  {player.name}
                </span>
              )}

              {/* Actions — admin only */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingId === player.id ? (
                    <>
                      <button
                        className="btn-gold"
                        style={{ padding: '6px 14px', fontSize: 13 }}
                        onClick={() => saveEdit(player.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '6px 14px', fontSize: 13 }}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-ghost"
                        style={{ padding: '6px 14px', fontSize: 13 }}
                        onClick={() => startEdit(player)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => removePlayer(player.id, player.name)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
