import { useState } from 'react'

export default function Settings({ settings, setSettings, onLogout, onResetAll }) {
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

  const messageColor = (msg) => msg.startsWith('✅') ? 'var(--card-green)' : 'var(--danger)'

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 34, color: 'var(--gold)', letterSpacing: 1.6, marginBottom: 24 }}>
        SETTINGS
      </h2>

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
          <p style={{ fontSize: 13, marginTop: 10, color: messageColor(minMsg) }}>
            {minMsg}
          </p>
        )}
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Result Entry Permissions</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          When enabled, anyone can enter scores from the group. When disabled, only admins can submit results.
        </p>

        <label style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 14, borderRadius: 14,
          border: '1px solid var(--border-soft)',
          background: 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
        }}>
          <div className="toggle">
            <input type="checkbox" checked={settings.openResultEntry} onChange={toggleOpenEntry} />
            <span className="toggle-slider" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Open Result Entry</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {settings.openResultEntry ? 'Enabled for all users' : 'Restricted to admins'}
            </div>
          </div>
        </label>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Change Admin Password</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
          Use a memorable password so only the organizers can change tournament settings.
        </p>

        <form onSubmit={changePassword} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          <input
            type="password"
            placeholder="New password"
            value={newPass}
            onChange={e => { setNewPass(e.target.value); setPassMsg('') }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPass}
            onChange={e => { setConfirmPass(e.target.value); setPassMsg('') }}
          />
          <div>
            <button type="submit" className="btn-gold">Update Password</button>
          </div>
        </form>

        {passMsg && (
          <p style={{ fontSize: 13, marginTop: 10, color: messageColor(passMsg) }}>
            {passMsg}
          </p>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Admin Session</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
          End the current admin session on this device.
        </p>
        <button className="btn-danger" onClick={onLogout}>Logout</button>
      </div>

      <div className="card" style={{ padding: 24, border: '1px solid rgba(179,92,92,0.25)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--danger)' }}>Reset Competition</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
          Wipe all data — players, groups, fixtures, results — and return to the format selection screen to start fresh. <strong style={{ color: 'var(--text-primary)' }}>This cannot be undone.</strong>
        </p>
        <button className="btn-danger" onClick={() => {
          if (window.confirm('Reset everything and start a new competition? All data will be deleted. This cannot be undone.')) {
            if (window.confirm('Are you absolutely sure? All players, groups, fixtures and results will be lost.')) {
              onResetAll?.()
            }
          }
        }}>
          🗑️ Reset Everything &amp; Start Over
        </button>
      </div>
    </div>
  )
}