import { useState } from 'react'

export default function AdminLogin({ onLogin, onClose, correctPassword }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (password === correctPassword) {
      onLogin()
      onClose()
    } else {
      setError('Wrong password. Try again.')
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(3,20,3,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className={`card fade-up ${shake ? 'shake' : ''}`}
        style={{ width: '100%', maxWidth: 380, padding: 32 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Lock Icon */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>🔐</span>
        </div>

        <h2 style={{
          fontFamily: 'Bebas Neue',
          fontSize: 28,
          color: 'var(--gold)',
          textAlign: 'center',
          letterSpacing: 2,
          marginBottom: 6
        }}>
          ADMIN ACCESS
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Enter the admin password to continue
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            autoFocus
            style={{ marginBottom: 12 }}
          />
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
              ⚠️ {error}
            </p>
          )}
          <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: 4 }}>
            UNLOCK
          </button>
        </form>

        <button
          className="btn-ghost"
          style={{ width: '100%', marginTop: 10 }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  )
}
