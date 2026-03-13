import { useState, useEffect } from 'react'
import PlayerManagement from './components/PlayerManagement'
import GroupSetup from './components/GroupSetup'
import Settings from './components/Settings'
import AdminLogin from './components/AdminLogin'
import { load, save, KEYS } from './utils/storage'

const DEFAULT_SETTINGS = {
  adminPassword: 'ea26admin',
  openResultEntry: false,
}

const TABS = [
  { id: 'players', label: '⚽ Players' },
  { id: 'groups', label: '📋 Groups' },
  { id: 'settings', label: '⚙️ Settings', adminOnly: true },
]

export default function App() {
  const [players, setPlayers] = useState(() => load(KEYS.PLAYERS, []))
  const [groups, setGroups] = useState(() => load(KEYS.GROUPS, []))
  const [groupsLocked, setGroupsLocked] = useState(() => load(KEYS.GROUPS_LOCKED, false))
  const [settings, setSettings] = useState(() => load(KEYS.SETTINGS, DEFAULT_SETTINGS))
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState('players')

  // Persist state
  useEffect(() => { save(KEYS.PLAYERS, players) }, [players])
  useEffect(() => { save(KEYS.GROUPS, groups) }, [groups])
  useEffect(() => { save(KEYS.GROUPS_LOCKED, groupsLocked) }, [groupsLocked])
  useEffect(() => { save(KEYS.SETTINGS, settings) }, [settings])

  function handleTabClick(tab) {
    if (tab.adminOnly && !isAdmin) {
      setShowLogin(true)
      return
    }
    setActiveTab(tab.id)
  }

  function handleAdminLogin() {
    setIsAdmin(true)
    setActiveTab('settings')
  }

  function handleLogout() {
    setIsAdmin(false)
    setActiveTab('players')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--green-border)',
        background: 'rgba(8,24,8,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38,
                borderRadius: '50%',
                border: '2px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                ⚽
              </div>
              <div>
                <div style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 22,
                  letterSpacing: 3,
                  lineHeight: 1,
                  color: 'var(--gold)'
                }}>
                  EA26 TOURNAMENT
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2 }}>
                  TNC · FIFA PS5
                </div>
              </div>
            </div>

            {/* Admin badge / Login */}
            {isAdmin ? (
              <span style={{
                background: '#1a2e0a',
                border: '1px solid #3a6a1a',
                color: '#8fd46a',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 20,
                letterSpacing: 1
              }}>
                🛡 ADMIN
              </span>
            ) : (
              <button
                className="btn-ghost"
                style={{ fontSize: 13, padding: '7px 16px' }}
                onClick={() => setShowLogin(true)}
              >
                🔐 Admin Login
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Barlow',
                  color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'color 0.2s, border-color 0.2s',
                  position: 'relative',
                  bottom: -1,
                }}
              >
                {tab.label}
                {tab.adminOnly && !isAdmin && (
                  <span style={{ marginLeft: 4, fontSize: 11 }}>🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: 800, width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        {/* Phase banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0a2a0a, #0f3a0f)',
          border: '1px solid var(--green-border)',
          borderLeft: '3px solid var(--gold)',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 20 }}>
            {groupsLocked ? '🏁' : groups.length > 0 ? '📋' : '🏆'}
          </span>
          <div>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)' }}>
              {groupsLocked
                ? 'PHASE 3 — FIXTURES'
                : groups.length > 0
                ? 'PHASE 2 — GROUP SETUP'
                : 'PHASE 1 — PLAYER REGISTRATION'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {groupsLocked
                ? 'Groups are locked. Fixture generation coming next.'
                : groups.length > 0
                ? 'Assign all players to groups, then lock to proceed.'
                : 'Add all players before assigning groups. Groups setup comes next.'}
            </p>
          </div>
        </div>

        {activeTab === 'players' && (
          <PlayerManagement
            players={players}
            setPlayers={setPlayers}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'groups' && (
          <GroupSetup
            players={players}
            groups={groups}
            setGroups={setGroups}
            groupsLocked={groupsLocked}
            setGroupsLocked={setGroupsLocked}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'settings' && isAdmin && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-muted)',
        fontSize: 12,
        borderTop: '1px solid var(--green-border)',
        letterSpacing: 1
      }}>
        EA26 TOURNAMENT · TNC · FIFA PS5 ⚽
      </footer>

      {/* ── Admin Login Modal ── */}
      {showLogin && (
        <AdminLogin
          correctPassword={settings.adminPassword}
          onLogin={handleAdminLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  )
}
