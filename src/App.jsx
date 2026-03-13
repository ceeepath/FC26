import { useState, useEffect } from 'react'
import PlayerManagement from './components/PlayerManagement'
import GroupSetup from './components/GroupSetup'
import FixtureSetup from './components/FixtureSetup'
import GroupStandings from './components/GroupStandings'
import KnockoutBracket from './components/KnockoutBracket'
import Leaderboard from './components/Leaderboard'
import WhatsAppExport from './components/WhatsAppExport'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import AdminLogin from './components/AdminLogin'
import { load, save, KEYS } from './utils/storage'

const DEFAULT_SETTINGS       = { adminPassword: 'ea26admin', openResultEntry: false, minPlayers: 1 }
const DEFAULT_FIXTURE_CONFIG = { group: 1, quarter: 1, semi: 1, final: 1 }
const DEFAULT_KNOCKOUT       = { locked: false, seeding: [], totalRounds: 0 }

export default function App() {
  const [players,         setPlayers]        = useState(() => load(KEYS.PLAYERS, []))
  const [groups,          setGroups]         = useState(() => load(KEYS.GROUPS, []))
  const [groupsLocked,    setGroupsLocked]   = useState(() => load(KEYS.GROUPS_LOCKED, false))
  const [fixtures,        setFixtures]       = useState(() => load(KEYS.FIXTURES, []))
  const [fixtureConfig,   setFixtureConfig]  = useState(() => load(KEYS.FIXTURE_CONFIG, DEFAULT_FIXTURE_CONFIG))
  const [fixturesLocked,  setFixturesLocked] = useState(() => load(KEYS.FIXTURES_LOCKED, false))
  const [qualifierConfig, setQualifierConfig]= useState(() => load(KEYS.QUALIFIER_CONFIG, { perGroup: {}, bestLosers: 0 }))
  const [knockoutBracket, setKnockoutBracket]= useState(() => load(KEYS.KNOCKOUT_BRACKET, DEFAULT_KNOCKOUT))
  const [settings,        setSettings]       = useState(() => load(KEYS.SETTINGS, DEFAULT_SETTINGS))
  const [isAdmin,         setIsAdmin]        = useState(false)
  const [showLogin,       setShowLogin]      = useState(false)
  const [activeTab,       setActiveTab]      = useState('dashboard')
  const [mobileOpen,      setMobileOpen]     = useState(false)
  const [isMobile,        setIsMobile]       = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => { save(KEYS.PLAYERS,          players)         }, [players])
  useEffect(() => { save(KEYS.GROUPS,           groups)          }, [groups])
  useEffect(() => { save(KEYS.GROUPS_LOCKED,    groupsLocked)    }, [groupsLocked])
  useEffect(() => { save(KEYS.FIXTURES,         fixtures)        }, [fixtures])
  useEffect(() => { save(KEYS.FIXTURE_CONFIG,   fixtureConfig)   }, [fixtureConfig])
  useEffect(() => { save(KEYS.FIXTURES_LOCKED,  fixturesLocked)  }, [fixturesLocked])
  useEffect(() => { save(KEYS.QUALIFIER_CONFIG, qualifierConfig) }, [qualifierConfig])
  useEffect(() => { save(KEYS.KNOCKOUT_BRACKET, knockoutBracket) }, [knockoutBracket])
  useEffect(() => { save(KEYS.SETTINGS,         settings)        }, [settings])

  const fixturesGenerated = fixtures.length > 0

  const TABS = [
    { id: 'dashboard', label: 'Dashboard',   icon: '⚡' },
    { id: 'players',   label: 'Players',     icon: '⚽' },
    { id: 'groups',    label: 'Groups',      icon: '📋' },
    { id: 'fixtures',  label: 'Fixtures',    icon: '📅', locked: !groupsLocked },
    { id: 'standings', label: 'Standings',   icon: '📊', locked: !fixturesGenerated },
    { id: 'knockout',  label: 'Knockout',    icon: '🏆', locked: !fixturesGenerated },
    { id: 'scorers',   label: 'Leaderboard', icon: '🏅', locked: !fixturesGenerated },
    { id: 'export',    label: 'Export',      icon: '📤', locked: !fixturesGenerated },
    { id: 'settings',  label: 'Settings',    icon: '⚙️', adminOnly: true },
  ]

  function handleTabClick(tab) {
    if (tab.adminOnly && !isAdmin) { setShowLogin(true); return }
    if (tab.locked) return
    setActiveTab(tab.id)
  }

  function handleAdminLogin() { setIsAdmin(true); setActiveTab('settings') }
  function handleLogout()     { setIsAdmin(false); setActiveTab('dashboard') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      {!isMobile && (
        <div style={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: 200, zIndex: 50,
        }}>
          <Sidebar
            tabs={TABS} activeTab={activeTab}
            onTabClick={handleTabClick}
            isAdmin={isAdmin}
            onAdminClick={() => setShowLogin(true)}
            onLogout={handleLogout}
            mobileOpen={false}
            onMobileClose={() => {}}
          />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <Sidebar
          tabs={TABS} activeTab={activeTab}
          onTabClick={handleTabClick}
          isAdmin={isAdmin}
          onAdminClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content area ── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        minWidth: 0,
        marginLeft: isMobile ? 0 : 200,
      }}>

        {/* Mobile top bar — hidden on desktop */}
        {isMobile && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 54,
          background: 'linear-gradient(180deg, #080f08, #040a04)',
          borderBottom: '1px solid #0f2a0f',
          position: 'sticky', top: 0, zIndex: 90,
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 8px', borderRadius: 6, color: 'var(--text-muted)',
              fontSize: 18, lineHeight: 1,
            }}
          >
            ☰
          </button>

          {/* Logo center */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>⚽</span>
            <span style={{
              fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 3,
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>EA26</span>
          </div>

          {/* Admin badge or login */}
          {isAdmin
            ? <span style={{ fontSize: 11, fontWeight: 700, color: '#6ad46a', letterSpacing: 1 }}>🛡 ADMIN</span>
            : <button onClick={() => setShowLogin(true)} style={{
                background: 'none', border: '1px solid #1a3a1a', borderRadius: 6,
                color: '#5a8a5a', fontSize: 11, fontWeight: 700, padding: '4px 8px', cursor: 'pointer',
              }}>Login</button>
          }
        </div>
        )}

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              players={players} groups={groups} fixtures={fixtures}
              knockoutBracket={knockoutBracket} qualifierConfig={qualifierConfig}
            />
          )}
          {activeTab === 'players' && (
            <PlayerManagement players={players} setPlayers={setPlayers} isAdmin={isAdmin} minPlayers={settings.minPlayers ?? 1} />
          )}
          {activeTab === 'groups' && (
            <GroupSetup players={players} groups={groups} setGroups={setGroups}
              groupsLocked={groupsLocked} setGroupsLocked={setGroupsLocked} isAdmin={isAdmin} />
          )}
          {activeTab === 'fixtures' && (
            <FixtureSetup
              players={players} groups={groups}
              fixtures={fixtures} setFixtures={setFixtures}
              fixtureConfig={fixtureConfig} setFixtureConfig={setFixtureConfig}
              fixturesLocked={fixturesLocked} setFixturesLocked={setFixturesLocked}
              openResultEntry={settings.openResultEntry}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'standings' && (
            <GroupStandings
              players={players} groups={groups} fixtures={fixtures}
              qualifierConfig={qualifierConfig} setQualifierConfig={setQualifierConfig}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'knockout' && (
            <KnockoutBracket
              players={players} groups={groups}
              fixtures={fixtures} setFixtures={setFixtures}
              fixtureConfig={fixtureConfig} qualifierConfig={qualifierConfig}
              knockoutBracket={knockoutBracket} setKnockoutBracket={setKnockoutBracket}
              openResultEntry={settings.openResultEntry}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'scorers' && (
            <Leaderboard players={players} fixtures={fixtures} />
          )}
          {activeTab === 'export' && (
            <WhatsAppExport
              players={players} groups={groups}
              fixtures={fixtures} fixtureConfig={fixtureConfig}
              qualifierConfig={qualifierConfig} knockoutBracket={knockoutBracket}
            />
          )}
          {activeTab === 'settings' && isAdmin && (
            <Settings settings={settings} setSettings={setSettings} onLogout={handleLogout} />
          )}
        </main>

        <footer style={{
          textAlign: 'center', padding: '14px 20px',
          color: '#1a3a1a', fontSize: 11,
          borderTop: '1px solid #0a1a0a',
          letterSpacing: 2, fontFamily: 'Bebas Neue',
        }}>
          EA26 TOURNAMENT · TNC · FIFA PS5
        </footer>
      </div>

      {showLogin && (
        <AdminLogin correctPassword={settings.adminPassword} onLogin={handleAdminLogin} onClose={() => setShowLogin(false)} />
      )}
    </div>
  )
}