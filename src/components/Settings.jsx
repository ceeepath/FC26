import { useState } from 'react'

export default function Settings({ settings, setSettings, onLogout }) {
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState('')

  function changePassword(e) {
    e.preventDefault()
    if (newPass.length < 4) {
      setPassMsg('⚠️ Password must be at least 4 characters.')
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg('⚠️ Passwords do not match.')
      return
    }
    setSettings(s => ({ ...s, adminPassword: newPass }))
    setNewPass('')
    setConfirmPass('')
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
            <input
              type="checkbox"
              checked={settings.openResultEntry}
              onChange={toggleOpenEntry}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Change Admin Password</h3>
        <form onSubmit={changePassword}>
          <input
            type="password"
            placeholder="New password"
            value={newPass}
            onChange={e => { setNewPass(e.target.value); setPassMsg('') }}
            style={{ marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPass}
            onChange={e => { setConfirmPass(e.target.value); setPassMsg('') }}
            style={{ marginBottom: 12 }}
          />
          {passMsg && (
            <p style={{
              fontSize: 13,
              marginBottom: 12,
              color: passMsg.startsWith('✅') ? '#4caf50' : 'var(--danger)'
            }}>
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
        <button className="btn-danger" onClick={onLogout}>
          🔒 Logout
        </button>
      </div>
    </div>
  )
}
