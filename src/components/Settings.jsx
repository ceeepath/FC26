import { useState } from 'react'

export default function Settings({ settings, setSettings, onLogout }) {
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [minInput, setMinInput] = useState(String(settings.minPlayers ?? 1))
  const [minMsg, setMinMsg] = useState('')

  function saveMinPlayers(e) {
    e.preventDefault()
    const val = parseInt(minInput, 10)
    if (isNaN(val) || val < 2) { setMinMsg('⚠️ Must be at least 2 players.'); return }
    if (val > 128) { setMinMsg('⚠️ That seems too high. Max is 128.'); return }
    setSettings(s => ({ ...s, minPlayers: val }))
    setMinMsg('✅ Minimum updated!')
    setTimeout(() => setMinMsg(''), 3000)
  }

  function changePassword(e) {
    e.preventDefault()
    if (newPass.length < 4) { setPassMsg('⚠️ Password must be at least 4 characters.'); return }
    if (newPass !== confirmPass) { setPassMsg('⚠️ Passwords do not match.'); return }
    setSettings(s => ({ ...s, adminPassword: newPass }))
    setNewPass(''); setConfirmPass('')
    setPassMsg('✅ Password updated successfully!')
    setTimeout(() => setPassMsg(''), 3000)
  }

  function toggleOpenEntry() {
    setSettings(s => ({ ...s, openResultEntry: !s.openResultEntry }))
  }

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2, marginBottom: 24 }}>
        SETTINGS
      </h2>

      {/* Min Players */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Minimum Players to Start</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
          The roster must hit this number before the tournament can begin. Currently set to{' '}
          <strong style={{ color: 'var(--gold)' }}>{settings.minPlayers ?? 1}</strong>.
        </p>
        <form onSubmit={saveMinPlayers} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <input
            type="number"
            min="2"
            max="128"
            value={minInput}
            onChange={e => { setMinInput(e.target.value); setMinMsg('') }}
            style={{ width: 100 }}
          />
          <button type="submit" className="btn-gold">Save</button>
        </form>
        {minMsg && (
          <p style={{ fontSize: 13, marginTop: 10, color: minMsg.startsWith('✅') ? '#4caf50' : 'var(--danger)' }}>
            {minMsg}
          </p>
        )}
      </div>

      {/* Result Entry Access */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Open Result Entry</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {settings.openResultEntry
                ? '🔓 Anyone with the link can enter match results.'
                : '🔒 Only admins can enter match results.'}
            </p>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.openResultEntry} onChange={toggleOpenEntry} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Change Admin Password</h3>
        <form onSubmit={changePassword}>
          <input type="password" placeholder="New password" value={newPass}
            onChange={e => { setNewPass(e.target.value); setPassMsg('') }} style={{ marginBottom: 10 }} />
          <input type="password" placeholder="Confirm new password" value={confirmPass}
            onChange={e => { setConfirmPass(e.target.value); setPassMsg('') }} style={{ marginBottom: 12 }} />
          {passMsg && (
            <p style={{ fontSize: 13, marginBottom: 12, color: passMsg.startsWith('✅') ? '#4caf50' : 'var(--danger)' }}>
              {passMsg}
            </p>
          )}
          <button type="submit" className="btn-gold">Update Password</button>
        </form>
      </div>

      {/* Logout */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Session</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          You are currently logged in as admin. Logging out will restrict access to admin-only features.
        </p>
        <button className="btn-danger" onClick={onLogout}>🔒 Logout</button>
      </div>
    </div>
  )
}
