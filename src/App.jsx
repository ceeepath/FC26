import { useState, useEffect, useRef } from 'react'
import PlayerManagement from './components/PlayerManagement'
import GroupSetup from './components/GroupSetup'
import FixtureSetup from './components/FixtureSetup'
import GroupStandings from './components/GroupStandings'
import KnockoutBracket from './components/KnockoutBracket'
import Leaderboard from './components/LeaderBoard'
import WhatsAppExport from './components/WhatsAppExport'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import FormatSetup from './components/FormatSetup'
import Settings from './components/Settings'
import AdminLogin from './components/AdminLogin'
import { loadAll, save, removeAll, KEYS } from './utils/storage'

const DEFAULT_SETTINGS       = { adminPassword: 'ea26admin', openResultEntry: false, minPlayers: 1 }
const DEFAULT_FIXTURE_CONFIG = { group: 1, quarter: 1, semi: 1, final: 1 }
const DEFAULT_KNOCKOUT       = { locked: false, seeding: [], totalRounds: 0 }

function getPhaseLabel({ players, groupsLocked, fixturesGenerated, knockoutBracket }) {
  if ((knockoutBracket?.seeding?.length ?? 0) > 0 || knockoutBracket?.locked) return 'Knockout'
  if (fixturesGenerated) return 'Group Stage'
  if (groupsLocked) return 'Fixtures'
  if ((players?.length ?? 0) > 0) return 'Setup'
  return 'Registration'
}

function TopBadge({ children, tone = 'gold' }) {
  const tones = {
    gold:  { color: 'var(--gold)',       bg: 'rgba(212,175,55,0.08)',  border: 'rgba(212,175,55,0.18)'  },
    green: { color: 'var(--card-green)', bg: 'rgba(93,143,106,0.12)', border: 'rgba(93,143,106,0.18)' },
    blue:  { color: 'var(--card-blue)',  bg: 'rgba(109,140,166,0.12)',border: 'rgba(109,140,166,0.18)' },
  }
  const palette = tones[tone] ?? tones.gold
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 10px', borderRadius: 999,
      fontSize: 11, letterSpacing: 1.4,
      color: palette.color, background: palette.bg,
      border: `1px solid ${palette.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ error }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', gap: 20,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        border: '3px solid rgba(212,175,55,0.15)',
        borderTop: '3px solid var(--gold)',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Barlow Condensed', fontSize: 18, color: 'var(--gold)', letterSpacing: 2 }}>
          {error ? 'CONNECTION ERROR' : 'LOADING TOURNAMENT'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          {error ? error : 'Fetching latest data…'}
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  // ── Loading state ──────────────────────────────────────────────────────────
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(null)

  // ── Tournament state ───────────────────────────────────────────────────────
  const [players,          setPlayers]         = useState([])
  const [groups,           setGroups]          = useState([])
  const [groupsLocked,     setGroupsLocked]    = useState(false)
  const [fixtures,         setFixtures]        = useState([])
  const [fixtureConfig,    setFixtureConfig]   = useState(DEFAULT_FIXTURE_CONFIG)
  const [fixturesLocked,   setFixturesLocked]  = useState(false)
  const [qualifierConfig,  setQualifierConfig] = useState({ perGroup: {}, bestLosers: 0 })
  const [knockoutBracket,  setKnockoutBracket] = useState(DEFAULT_KNOCKOUT)
  const [tournamentFormat, setTournamentFormat]= useState(null)
  const [settings,         setSettings]        = useState(DEFAULT_SETTINGS)

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [showLogin,  setShowLogin]  = useState(false)
  const [activeTab,  setActiveTab]  = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile,   setIsMobile]   = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // ── Initial data load from Supabase ───────────────────────────────────────
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    loadAll().then(data => {
      if (data[KEYS.PLAYERS])          setPlayers(data[KEYS.PLAYERS])
      if (data[KEYS.GROUPS])           setGroups(data[KEYS.GROUPS])
      if (data[KEYS.GROUPS_LOCKED]    !== undefined) setGroupsLocked(data[KEYS.GROUPS_LOCKED])
      if (data[KEYS.FIXTURES])         setFixtures(data[KEYS.FIXTURES])
      if (data[KEYS.FIXTURE_CONFIG])   setFixtureConfig(data[KEYS.FIXTURE_CONFIG])
      if (data[KEYS.FIXTURES_LOCKED]  !== undefined) setFixturesLocked(data[KEYS.FIXTURES_LOCKED])
      if (data[KEYS.QUALIFIER_CONFIG]) setQualifierConfig(data[KEYS.QUALIFIER_CONFIG])
      if (data[KEYS.KNOCKOUT_BRACKET]) setKnockoutBracket(data[KEYS.KNOCKOUT_BRACKET])
      if (data[KEYS.TOURNAMENT_FORMAT] !== undefined) setTournamentFormat(data[KEYS.TOURNAMENT_FORMAT])
      if (data[KEYS.SETTINGS])         setSettings({ ...DEFAULT_SETTINGS, ...data[KEYS.SETTINGS] })
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load from Supabase:', err)
      setLoadError('Could not connect to the database. Check your connection and try again.')
      setLoading(false)
    })
  }, [])

  // ── Skip saves until initial load is done ────────────────────────────────
  const ready = !loading && !loadError

  // ── Persist to Supabase whenever state changes ────────────────────────────
  useEffect(() => { if (ready) save(KEYS.PLAYERS,          players)         }, [players,          ready])
  useEffect(() => { if (ready) save(KEYS.GROUPS,           groups)          }, [groups,           ready])
  useEffect(() => { if (ready) save(KEYS.GROUPS_LOCKED,    groupsLocked)    }, [groupsLocked,     ready])
  useEffect(() => { if (ready) save(KEYS.FIXTURES,         fixtures)        }, [fixtures,         ready])
  useEffect(() => { if (ready) save(KEYS.FIXTURE_CONFIG,   fixtureConfig)   }, [fixtureConfig,    ready])
  useEffect(() => { if (ready) save(KEYS.FIXTURES_LOCKED,  fixturesLocked)  }, [fixturesLocked,   ready])
  useEffect(() => { if (ready) save(KEYS.QUALIFIER_CONFIG, qualifierConfig) }, [qualifierConfig,  ready])
  useEffect(() => { if (ready) save(KEYS.KNOCKOUT_BRACKET, knockoutBracket) }, [knockoutBracket,  ready])
  useEffect(() => { if (ready) save(KEYS.TOURNAMENT_FORMAT,tournamentFormat)}, [tournamentFormat, ready])
  useEffect(() => { if (ready) save(KEYS.SETTINGS,         settings)        }, [settings,         ready])

  // ── Loading / error screens ───────────────────────────────────────────────
  if (loading || loadError) {
    return <LoadingScreen error={loadError} />
  }

  // ── Format gate ───────────────────────────────────────────────────────────
  if (!tournamentFormat) {
    return <FormatSetup onSelect={fmt => setTournamentFormat(fmt)} />
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const fixturesGenerated = fixtures.length > 0
  const playedFixtures    = fixtures.filter(f => f.played && !f.isBye).length
  const knockoutStarted   = fixtures.some(f => f.type === 'knockout')
  const isLeague          = tournamentFormat === 'league'
  const phaseLabel        = getPhaseLabel({ players, groupsLocked, fixturesGenerated, knockoutBracket })

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = isLeague ? [
    { id: 'dashboard', label: 'Dashboard',    icon: '⚡' },
    { id: 'players',   label: 'Players',      icon: '⚽' },
    { id: 'fixtures',  label: 'Fixtures',     icon: '📅', locked: players.length < 2 },
    { id: 'standings', label: 'League Table', icon: '📊', locked: !fixturesGenerated },
    { id: 'scorers',   label: 'Leaderboard',  icon: '🏅', locked: !fixturesGenerated },
    { id: 'export',    label: 'Export',       icon: '📤', locked: !fixturesGenerated },
    { id: 'settings',  label: 'Settings',     icon: '⚙️', adminOnly: true },
  ] : [
    { id: 'dashboard', label: 'Dashboard',    icon: '⚡' },
    { id: 'players',   label: 'Players',      icon: '⚽' },
    { id: 'groups',    label: 'Groups',       icon: '📋' },
    { id: 'fixtures',  label: 'Fixtures',     icon: '📅', locked: !groupsLocked },
    { id: 'standings', label: 'Standings',    icon: '📊', locked: !fixturesGenerated },
    { id: 'knockout',  label: 'Knockout',     icon: '🏆', locked: !fixturesGenerated },
    { id: 'scorers',   label: 'Leaderboard',  icon: '🏅', locked: !fixturesGenerated },
    { id: 'export',    label: 'Export',       icon: '📤', locked: !fixturesGenerated },
    { id: 'settings',  label: 'Settings',     icon: '⚙️', adminOnly: true },
  ]

  const activeMeta = TABS.find(t => t.id === activeTab) ?? TABS[0]

  function handleTabClick(tab) {
    if (tab.adminOnly && !isAdmin) { setShowLogin(true); return }
    if (tab.locked) return
    setActiveTab(tab.id)
  }

  function handleAdminLogin() {
    setIsAdmin(true)
    setActiveTab('settings')
    setShowLogin(false)
  }

  function handleLogout() {
    setIsAdmin(false)
    setActiveTab('dashboard')
  }

  async function handleResetAll() {
    await removeAll()
    setPlayers([])
    setGroups([])
    setGroupsLocked(false)
    setFixtures([])
    setFixtureConfig(DEFAULT_FIXTURE_CONFIG)
    setFixturesLocked(false)
    setQualifierConfig({ perGroup: {}, bestLosers: 0 })
    setKnockoutBracket(DEFAULT_KNOCKOUT)
    setTournamentFormat(null)
    setIsAdmin(false)
    setActiveTab('dashboard')
  }

  const sidebarStats = {
    phase: phaseLabel,
    players: players.length,
    groups: groups.length,
    playedFixtures,
    groupsLocked,
    fixturesGenerated,
    knockoutStarted,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>

      {/* Sidebar */}
      {!isMobile && (
        <Sidebar
          tabs={TABS} activeTab={activeTab}
          onTabClick={handleTabClick} isAdmin={isAdmin}
          onAdminClick={() => setShowLogin(true)} onLogout={handleLogout}
          mobileOpen={false} onMobileClose={() => {}}
          stats={sidebarStats}
        />
      )}
      {isMobile && (
        <Sidebar
          tabs={TABS} activeTab={activeTab}
          onTabClick={handleTabClick} isAdmin={isAdmin}
          onAdminClick={() => setShowLogin(true)} onLogout={handleLogout}
          mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
          stats={sidebarStats}
        />
      )}

      {/* Main */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, marginLeft: isMobile ? 0 : 276,
      }}>
        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 60,
          backdropFilter: 'blur(12px)',
          background: 'linear-gradient(180deg, rgba(7,17,12,0.88), rgba(7,17,12,0.74))',
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <div style={{
            maxWidth: 1240, margin: '0 auto',
            padding: isMobile ? '12px 16px' : '14px 24px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              {isMobile && (
                <button onClick={() => setMobileOpen(true)} style={{
                  width: 40, height: 40, borderRadius: 12,
                  border: '1px solid var(--border-soft)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer', flexShrink: 0,
                }}>☰</button>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <div style={{
                    fontFamily: 'Barlow Condensed', fontWeight: 700,
                    fontSize: isMobile ? 24 : 30, lineHeight: 0.95,
                    letterSpacing: 1.6, color: 'var(--gold)',
                  }}>
                    {activeMeta.label}
                  </div>
                  <TopBadge tone="gold">{phaseLabel}</TopBadge>
                  {isAdmin && <TopBadge tone="green">🛡 Admin</TopBadge>}
                  {settings.openResultEntry && <TopBadge tone="blue">🔓 Open Entry</TopBadge>}
                  {isLeague && <TopBadge tone="blue">📊 League</TopBadge>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>{players.length} players</span>
                  {!isLeague && <span>{groups.length} groups</span>}
                  <span>{playedFixtures} played</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {!isAdmin ? (
                <button onClick={() => setShowLogin(true)} style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)',
                  color: 'var(--gold)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>🔐 Admin Login</button>
              ) : (
                <button onClick={handleLogout} style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(179,92,92,0.08)', border: '1px solid rgba(179,92,92,0.18)',
                  color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>Logout</button>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: isMobile ? '18px 14px 24px' : '26px 24px 30px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%' }}>

            {activeTab === 'dashboard' && (
              <Dashboard
                players={players} groups={groups} fixtures={fixtures}
                knockoutBracket={knockoutBracket} qualifierConfig={qualifierConfig}
              />
            )}
            {activeTab === 'players' && (
              <PlayerManagement
                players={players} setPlayers={setPlayers}
                isAdmin={isAdmin} minPlayers={settings.minPlayers ?? 1}
              />
            )}
            {!isLeague && activeTab === 'groups' && (
              <GroupSetup
                players={players} groups={groups} setGroups={setGroups}
                groupsLocked={groupsLocked} setGroupsLocked={setGroupsLocked}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'fixtures' && (
              <FixtureSetup
                players={players} groups={groups}
                fixtures={fixtures} setFixtures={setFixtures}
                fixtureConfig={fixtureConfig} setFixtureConfig={setFixtureConfig}
                fixturesLocked={fixturesLocked} setFixturesLocked={setFixturesLocked}
                openResultEntry={settings.openResultEntry}
                isAdmin={isAdmin} isLeague={isLeague}
              />
            )}
            {activeTab === 'standings' && (
              <GroupStandings
                players={players} groups={groups} fixtures={fixtures}
                qualifierConfig={qualifierConfig} setQualifierConfig={setQualifierConfig}
                isAdmin={isAdmin} isLeague={isLeague}
              />
            )}
            {!isLeague && activeTab === 'knockout' && (
              <KnockoutBracket
                players={players} groups={groups}
                fixtures={fixtures} setFixtures={setFixtures}
                fixtureConfig={fixtureConfig} qualifierConfig={qualifierConfig}
                knockoutBracket={knockoutBracket} setKnockoutBracket={setKnockoutBracket}
                openResultEntry={settings.openResultEntry} isAdmin={isAdmin}
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
              <Settings
                settings={settings} setSettings={setSettings}
                onLogout={handleLogout} onResetAll={handleResetAll}
              />
            )}

          </div>
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-soft)',
          background: 'linear-gradient(180deg, rgba(10,19,15,0.92), rgba(7,17,12,0.96))',
        }}>
          <div style={{
            maxWidth: 1240, margin: '0 auto',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1.4,
          }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>
              EA26 TOURNAMENT MANAGER
            </span>
            <span>TNC · FIFA PS5 · {isLeague ? 'League' : 'Tournament'} format</span>
          </div>
        </footer>
      </div>

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