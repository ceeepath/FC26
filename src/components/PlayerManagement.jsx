import { useState, useRef } from 'react'
import { generateId } from '../utils/storage'

export default function PlayerManagement({ players, setPlayers, isAdmin, minPlayers }) {
  const [newName,    setNewName]    = useState('')
  const [newGameId,  setNewGameId]  = useState('')
  const [editingId,  setEditingId]  = useState(null)
  const [editName,   setEditName]   = useState('')
  const [editGameId, setEditGameId] = useState('')
  const [search,     setSearch]     = useState('')
  const [feedback,   setFeedback]   = useState({ msg: '', ok: true })

  const [selected,      setSelected]      = useState(new Set())
  const [showImport,    setShowImport]    = useState(false)
  const [importText,    setImportText]    = useState('')
  const [importPreview, setImportPreview] = useState([])
  const fileRef = useRef(null)

  const min = minPlayers ?? 1

  function flash(msg, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback({ msg: '', ok: true }), 2800)
  }

  function addPlayer(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      flash('⚠️ Player already exists!', false); return
    }
    setPlayers(prev => [...prev, { id: generateId(), name: trimmed, gameId: newGameId.trim() }])
    setNewName('')
    setNewGameId('')
    flash(`✅ ${trimmed} added!`)
  }

  function startEdit(player) {
    setEditingId(player.id)
    setEditName(player.name)
    setEditGameId(player.gameId ?? '')
  }

  function saveEdit(id) {
    const trimmed = editName.trim()
    if (!trimmed) return
    setPlayers(prev => prev.map(p =>
      p.id === id ? { ...p, name: trimmed, gameId: editGameId.trim() } : p
    ))
    setEditingId(null)
    flash('✅ Player updated!')
  }

  function removePlayer(id, name) {
    if (!window.confirm(`Remove ${name} from the tournament?`)) return
    setPlayers(prev => prev.filter(p => p.id !== id))
    flash(`🗑️ ${name} removed.`)
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(p => p.id)))
    }
  }

  function deleteSelected() {
    if (selected.size === 0) return
    if (!window.confirm(`Delete ${selected.size} player${selected.size !== 1 ? 's' : ''}? This cannot be undone.`)) return
    setPlayers(prev => prev.filter(p => !selected.has(p.id)))
    flash(`🗑️ ${selected.size} player${selected.size !== 1 ? 's' : ''} removed.`)
    setSelected(new Set())
  }

  function parseLines(text) {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(s => s.trim())
        return { name: parts[0], gameId: parts[1] ?? '' }
      })
      .filter(p => p.name.length > 0)
  }

  function handleImportTextChange(text) {
    setImportText(text)
    setImportPreview(parseLines(text))
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      setImportText(text)
      setImportPreview(parseLines(text))
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    const existing = new Set(players.map(p => p.name.toLowerCase()))
    let added = 0, skipped = 0
    const newPlayers = []
    for (const { name, gameId } of importPreview) {
      if (existing.has(name.toLowerCase())) { skipped++; continue }
      newPlayers.push({ id: generateId(), name, gameId: gameId ?? '' })
      existing.add(name.toLowerCase())
      added++
    }
    setPlayers(prev => [...prev, ...newPlayers])
    setShowImport(false)
    setImportText('')
    setImportPreview([])
    if (fileRef.current) fileRef.current.value = ''
    flash(`✅ ${added} player${added !== 1 ? 's' : ''} imported${skipped ? `, ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped` : ''}!`)
  }

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const remaining = min - players.length

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          PLAYER ROSTER
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {players.length} player{players.length !== 1 ? 's' : ''} registered
          {min > 1 && remaining > 0 && (
            <span style={{ color: '#e07a30', marginLeft: 10 }}>· Need {remaining} more to start</span>
          )}
          {min > 1 && players.length >= min && (
            <span style={{ color: '#4caf50', marginLeft: 10 }}>· ✓ Ready to group</span>
          )}
        </p>
      </div>

      {isAdmin && (
        <>
          <form onSubmit={addPlayer} style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Player name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ flex: '2 1 140px' }}
            />
            <input
              type="text"
              placeholder="Game ID (optional)"
              value={newGameId}
              onChange={e => setNewGameId(e.target.value)}
              style={{ flex: '1 1 120px' }}
            />
            <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap' }}>+ ADD</button>
          </form>

          <button
            className="btn-ghost"
            style={{ width: '100%', marginBottom: 20, fontSize: 14 }}
            onClick={() => { setShowImport(v => !v); setImportText(''); setImportPreview([]) }}
          >
            {showImport ? '✕ Close Import' : '📥 Bulk Import Players'}
          </button>

          {showImport && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>BULK IMPORT</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                One player per line. Optionally include Game ID after a comma —{' '}
                <code style={{ color: 'var(--gold)' }}>Name, GameID</code>
              </p>

              <div
                style={{
                  border: '1px dashed var(--green-border)', borderRadius: 8,
                  padding: '14px 16px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', background: '#050e05',
                }}
                onClick={() => fileRef.current?.click()}
              >
                <span style={{ fontSize: 22 }}>📄</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Click to upload a file</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>.txt or .csv — one player per line</p>
                </div>
                <input ref={fileRef} type="file" accept=".txt,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>— or paste manually —</p>

              <textarea
                value={importText}
                onChange={e => handleImportTextChange(e.target.value)}
                placeholder={"Tunde, PSN_Tunde\nChinedu\nMoses, EA_Moses99\nDavid\n..."}
                rows={6}
                style={{
                  width: '100%', background: '#050e05',
                  border: '1px solid var(--green-border)',
                  color: 'var(--text-primary)', borderRadius: 8,
                  padding: '10px 14px', fontSize: 14,
                  resize: 'vertical', outline: 'none', marginBottom: 12,
                }}
              />

              {importPreview.length > 0 && (
                <div style={{
                  background: '#0a1f0a', border: '1px solid #2a4a2a',
                  borderRadius: 8, padding: '12px 14px', marginBottom: 14,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4caf50', marginBottom: 8 }}>
                    Preview — {importPreview.length} player{importPreview.length !== 1 ? 's' : ''} detected
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {importPreview.slice(0, 30).map((p, i) => (
                      <span key={i} style={{
                        background: '#0f2a0f', border: '1px solid #2a5a2a',
                        color: '#a8d5a8', borderRadius: 16,
                        padding: '3px 10px', fontSize: 13, fontWeight: 600,
                      }}>
                        {p.name}
                        {p.gameId && <span style={{ opacity: 0.65, marginLeft: 5 }}>· {p.gameId}</span>}
                      </span>
                    ))}
                    {importPreview.length > 30 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>
                        +{importPreview.length - 30} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-gold"
                  disabled={importPreview.length === 0}
                  style={{ opacity: importPreview.length === 0 ? 0.4 : 1 }}
                  onClick={confirmImport}
                >
                  ✅ Import {importPreview.length > 0 ? `${importPreview.length} Players` : ''}
                </button>
                <button className="btn-ghost" onClick={() => { setImportText(''); setImportPreview([]); if (fileRef.current) fileRef.current.value = '' }}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {feedback.msg && (
        <div style={{
          background: feedback.ok ? '#0e2a0e' : '#2a0e0e',
          border: `1px solid ${feedback.ok ? 'var(--green-border)' : '#5a2020'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: 14, color: feedback.ok ? '#a8d5a8' : '#e08080',
        }}>
          {feedback.msg}
        </div>
      )}

      {players.length > 5 && (
        <input
          type="text"
          placeholder="🔍 Search players…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Bulk select toolbar — admin only, shown when there are players */}
      {isAdmin && filtered.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 8, flexWrap: 'wrap',
        }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === filtered.length}
              ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < filtered.length }}
              onChange={toggleSelectAll}
              style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            {selected.size === 0
              ? 'Select all'
              : `${selected.size} selected`}
          </label>

          {selected.size > 0 && (
            <button
              className="btn-danger"
              style={{ padding: '5px 14px', fontSize: 13 }}
              onClick={deleteSelected}
            >
              🗑️ Delete {selected.size}
            </button>
          )}

          {selected.size > 0 && (
            <button
              className="btn-ghost"
              style={{ padding: '5px 12px', fontSize: 13 }}
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {players.length === 0 ? 'No players yet. Add the first competitor!' : 'No players match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((player) => (
            <div key={player.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: 'var(--green-card)',
              border: '1px solid var(--green-border)',
              borderRadius: 10,
              transition: 'border-color 0.15s, background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a5a2a'; e.currentTarget.style.background = '#0a1a0a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--green-border)'; e.currentTarget.style.background = 'var(--green-card)' }}
            >
              {isAdmin && (
                <input
                  type="checkbox"
                  checked={selected.has(player.id)}
                  onChange={() => toggleSelect(player.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
                />
              )}
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, color: 'var(--gold-dim)', minWidth: 28, textAlign: 'center', opacity: 0.8 }}>
                {String(players.indexOf(player) + 1).padStart(2, '0')}
              </span>

              {editingId === player.id && isAdmin ? (
                <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(player.id); if (e.key === 'Escape') setEditingId(null) }}
                    autoFocus
                    placeholder="Name"
                    style={{ flex: '2 1 120px', padding: '5px 10px', fontSize: 14 }}
                  />
                  <input
                    type="text"
                    value={editGameId}
                    onChange={e => setEditGameId(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(player.id); if (e.key === 'Escape') setEditingId(null) }}
                    placeholder="Game ID (optional)"
                    style={{ flex: '1 1 100px', padding: '5px 10px', fontSize: 14 }}
                  />
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{player.name}</div>
                  {player.gameId && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{player.gameId}</div>
                  )}
                </div>
              )}

              {isAdmin && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {editingId === player.id ? (
                    <>
                      <button className="btn-gold" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => saveEdit(player.id)}>Save</button>
                      <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startEdit(player)}>✏️</button>
                      <button className="btn-danger" style={{ padding: '5px 10px' }} onClick={() => removePlayer(player.id, player.name)}>🗑️</button>
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