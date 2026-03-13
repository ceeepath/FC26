import { useState, useRef } from 'react'
import { generateId } from '../utils/storage'

export default function PlayerManagement({ players, setPlayers, isAdmin, minPlayers }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState({ msg: '', ok: true })

  // Bulk import state
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
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
    setPlayers(prev => [...prev, { id: generateId(), name: trimmed }])
    setNewName('')
    flash(`✅ ${trimmed} added!`)
  }

  function startEdit(player) { setEditingId(player.id); setEditName(player.name) }

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

  // ── Bulk Import ──
  function parseNames(text) {
    return text
      .split(/[\n,]+/)           // split by newline or comma
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  function handleImportTextChange(text) {
    setImportText(text)
    setImportPreview(parseNames(text))
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      setImportText(text)
      setImportPreview(parseNames(text))
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    const existing = new Set(players.map(p => p.name.toLowerCase()))
    let added = 0, skipped = 0
    const newPlayers = []
    for (const name of importPreview) {
      if (existing.has(name.toLowerCase())) { skipped++; continue }
      newPlayers.push({ id: generateId(), name })
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
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          PLAYER ROSTER
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {players.length} player{players.length !== 1 ? 's' : ''} registered
          {min > 1 && remaining > 0 && (
            <span style={{ color: '#e07a30', marginLeft: 10 }}>
              · Need {remaining} more to start
            </span>
          )}
          {min > 1 && players.length >= min && (
            <span style={{ color: '#4caf50', marginLeft: 10 }}>· ✓ Ready to group</span>
          )}
        </p>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <>
          {/* Single add */}
          <form onSubmit={addPlayer} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Enter player name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap' }}>+ ADD</button>
          </form>

          {/* Import toggle */}
          <button
            className="btn-ghost"
            style={{ width: '100%', marginBottom: 20, fontSize: 14 }}
            onClick={() => { setShowImport(v => !v); setImportText(''); setImportPreview([]) }}
          >
            {showImport ? '✕ Close Import' : '📥 Bulk Import Players'}
          </button>

          {/* Import panel */}
          {showImport && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>
                BULK IMPORT
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                Paste names below (one per line or comma-separated), or upload a <code style={{ color: 'var(--gold)' }}>.txt</code> / <code style={{ color: 'var(--gold)' }}>.csv</code> file.
              </p>

              {/* File upload */}
              <div
                style={{
                  border: '1px dashed var(--green-border)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  background: '#050e05',
                }}
                onClick={() => fileRef.current?.click()}
              >
                <span style={{ fontSize: 22 }}>📄</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Click to upload a file</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>.txt or .csv — one name per line</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.csv"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>— or paste manually —</p>

              {/* Paste area */}
              <textarea
                value={importText}
                onChange={e => handleImportTextChange(e.target.value)}
                placeholder={"Tunde\nChinedu\nMoses\nDavid\n..."}
                rows={6}
                style={{
                  width: '100%',
                  background: '#050e05',
                  border: '1px solid var(--green-border)',
                  color: 'var(--text-primary)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: 14,
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: 12,
                }}
              />

              {/* Preview */}
              {importPreview.length > 0 && (
                <div style={{
                  background: '#0a1f0a',
                  border: '1px solid #2a4a2a',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 14,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4caf50', marginBottom: 8 }}>
                    Preview — {importPreview.length} name{importPreview.length !== 1 ? 's' : ''} detected
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {importPreview.slice(0, 30).map((name, i) => (
                      <span key={i} style={{
                        background: '#0f2a0f',
                        border: '1px solid #2a5a2a',
                        color: '#a8d5a8',
                        borderRadius: 16,
                        padding: '3px 10px',
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        {name}
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

      {/* Feedback */}
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

      {/* Player list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {players.length === 0 ? 'No players yet. Add the first competitor!' : 'No players match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((player) => (
            <div key={player.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: 'var(--gold)', minWidth: 32, textAlign: 'center', opacity: 0.7 }}>
                {String(players.indexOf(player) + 1).padStart(2, '0')}
              </span>

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
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{player.name}</span>
              )}

              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingId === player.id ? (
                    <>
                      <button className="btn-gold" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => saveEdit(player.id)}>Save</button>
                      <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => startEdit(player)}>✏️ Edit</button>
                      <button className="btn-danger" onClick={() => removePlayer(player.id, player.name)}>🗑️</button>
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
