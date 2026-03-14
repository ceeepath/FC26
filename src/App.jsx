import { useState, useEffect } from 'react'
import PlayerManagement from './components/PlayerManagement'
import GroupSetup from './components/GroupSetup'
import FixtureSetup from './components/FixtureSetup'
import GroupStandings from './components/GroupStandings'
import KnockoutBracket from './components/KnockoutBracket'
import Leaderboard from './components/LeaderBoard'
import WhatsAppExport from './components/WhatsAppExport'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import AdminLogin from './components/AdminLogin'
import { load, save, KEYS } from './utils/storage'

const DEFAULT_SETTINGS = { adminPassword: 'ea26admin', openResultEntry: false, minPlayers: 1 }
const DEFAULT_FIXTURE_CONFIG = { group: 1, quarter: 1, semi: 1, final: 1 }
const DEFAULT_KNOCKOUT = { locked: false, seeding: [], totalRounds: 0 }

function getPhaseLabel({ players, groupsLocked, fixturesGenerated, knockoutBracket }) {
  if ((knockoutBracket?.seeding?.length ?? 0) > 0 || knockoutBracket?.locked) return 'Knockout'
  if (fixturesGenerated) return 'Group Stage'
  if (groupsLocked) return 'Fixtures'
  if ((players?.length ?? 0) > 0) return 'Setup'
  return 'Registration'
}

function TopBadge({ children, tone = 'gold' }) {
  const tones = {
    gold: { color: 'var(--gold)', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.18)' },
    green: { color: 'var(--card-green)', bg: 'rgba(93,143,106,0.12)', border: 'rgba(93,143,106,0.18)' },
    blue: { color: 'var(--card-blue)', bg: 'rgba(109,140,166,0.12)', border: 'rgba(109,140,166,0.18)' },
  }
  const palette = tones[tone] ?? tones.gold

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 11,
        letterSpacing: 1.4,
        color: palette.color,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export default function App() {
  const [players, setPlayers] = useState(() => load(KEYS.PLAYERS, []))
  const [groups, setGroups] = useState(() => load(KEYS.GROUPS, []))
  const [groupsLocked, setGroupsLocked] = useState(() => load(KEYS.GROUPS_LOCKED, false))
  const [fixtures, setFixtures] = useState(() => load(KEYS.FIXTURES, []))
  const [fixtureConfig, setFixtureConfig] = useState(() => load(KEYS.FIXTURE_CONFIG, DEFAULT_FIXTURE_CONFIG))
  const [fixturesLocked, setFixturesLocked] = useState(() => load(KEYS.FIXTURES_LOCKED, false))
  const [qualifierConfig, setQualifierConfig] = useState(() => load(KEYS.QUALIFIER_CONFIG, { perGroup: {}, bestLosers: 0 }))
  const [knockoutBracket, setKnockoutBracket] = useState(() => load(KEYS.KNOCKOUT_BRACKET, DEFAULT_KNOCKOUT))
  const [settings, setSettings] = useState(() => load(KEYS.SETTINGS, DEFAULT_SETTINGS))
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => { save(KEYS.PLAYERS, players) }, [players])
  useEffect(() => { save(KEYS.GROUPS, groups) }, [groups])
  useEffect(() => { save(KEYS.GROUPS_LOCKED, groupsLocked) }, [groupsLocked])
  useEffect(() => { save(KEYS.FIXTURES, fixtures) }, [fixtures])
  useEffect(() => { save(KEYS.FIXTURE_CONFIG, fixtureConfig) }, [fixtureConfig])
  useEffect(() => { save(KEYS.FIXTURES_LOCKED, fixturesLocked) }, [fixturesLocked])
  useEffect(() => { save(KEYS.QUALIFIER_CONFIG, qualifierConfig) }, [qualifierConfig])
  useEffect(() => { save(KEYS.KNOCKOUT_BRACKET, knockoutBracket) }, [knockoutBracket])
  useEffect(() => { save(KEYS.SETTINGS, settings) }, [settings])

  const fixturesGenerated = fixtures.length > 0
  const playedFixtures = fixtures.filter(f => f.played && !f.isBye).length
  const knockoutStarted = fixtures.some(f => f.type === 'knockout')
  const phaseLabel = getPhaseLabel({ players, groupsLocked, fixturesGenerated, knockoutBracket })

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
    { id: 'players', label: 'Players', icon: '⚽' },
    { id: 'groups', label: 'Groups', icon: '📋' },
    { id: 'fixtures', label: 'Fixtures', icon: '📅', locked: !groupsLocked },
    { id: 'standings', label: 'Standings', icon: '📊', locked: !fixturesGenerated },
    { id: 'knockout', label: 'Knockout', icon: '🏆', locked: !fixturesGenerated },
    { id: 'scorers', label: 'Leaderboard', icon: '🏅', locked: !fixturesGenerated },
    { id: 'export', label: 'Export', icon: '📤', locked: !fixturesGenerated },
    { id: 'settings', label: 'Settings', icon: '⚙️', adminOnly: true },
  ]

  const activeMeta = TABS.find(t => t.id === activeTab) ?? TABS[0]

  function handleTabClick(tab) {
    if (tab.adminOnly && !isAdmin) {
      setShowLogin(true)
      return
    }
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
      {!isMobile && (
        <Sidebar
          tabs={TABS}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          isAdmin={isAdmin}
          onAdminClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          mobileOpen={false}
          onMobileClose={() => {}}
          stats={sidebarStats}
        />
      )}

      {isMobile && (
        <Sidebar
          tabs={TABS}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          isAdmin={isAdmin}
          onAdminClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          stats={sidebarStats}
        />
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isMobile ? 0 : 276,
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 60,
            backdropFilter: 'blur(12px)',
            background: 'linear-gradient(180deg, rgba(7,17,12,0.88), rgba(7,17,12,0.74))',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              padding: isMobile ? '12px 16px' : '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              {isMobile && (
                <button
                  onClick={() => setMobileOpen(true)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: '1px solid var(--border-soft)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-primary)',
                    fontSize: 18,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  ☰
                </button>
              )}

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <div
                    style={{
                      fontFamily: 'Barlow Condensed',
                      fontWeight: 700,
                      fontSize: isMobile ? 24 : 30,
                      lineHeight: 0.95,
                      letterSpacing: 1.6,
                      color: 'var(--gold)',
                    }}
                  >
                    {activeMeta.label}
                  </div>

                  <TopBadge tone="gold">{phaseLabel}</TopBadge>
                  {isAdmin && <TopBadge tone="green">🛡 Admin</TopBadge>}
                  {settings.openResultEntry && <TopBadge tone="blue">🔓 Open Result Entry</TopBadge>}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{players.length} players</span>
                  <span>{groups.length} groups</span>
                  <span>{playedFixtures} played matches</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {!isAdmin ? (
                <button
                  onClick={() => setShowLogin(true)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.18)',
                    color: 'var(--gold)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🔐 Admin Login
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(179,92,92,0.08)',
                    border: '1px solid rgba(179,92,92,0.18)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? '18px 14px 24px' : '26px 24px 30px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%' }}>
            {activeTab === 'dashboard' && (
              <Dashboard
                players={players}
                groups={groups}
                fixtures={fixtures}
                knockoutBracket={knockoutBracket}
                qualifierConfig={qualifierConfig}
              />
            )}

            {activeTab === 'players' && (
              <PlayerManagement
                players={players}
                setPlayers={setPlayers}
                isAdmin={isAdmin}
                minPlayers={settings.minPlayers ?? 1}
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

            {activeTab === 'fixtures' && (
              <FixtureSetup
                players={players}
                groups={groups}
                fixtures={fixtures}
                setFixtures={setFixtures}
                fixtureConfig={fixtureConfig}
                setFixtureConfig={setFixtureConfig}
                fixturesLocked={fixturesLocked}
                setFixturesLocked={setFixturesLocked}
                openResultEntry={settings.openResultEntry}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'standings' && (
              <GroupStandings
                players={players}
                groups={groups}
                fixtures={fixtures}
                qualifierConfig={qualifierConfig}
                setQualifierConfig={setQualifierConfig}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'knockout' && (
              <KnockoutBracket
                players={players}
                groups={groups}
                fixtures={fixtures}
                setFixtures={setFixtures}
                fixtureConfig={fixtureConfig}
                qualifierConfig={qualifierConfig}
                knockoutBracket={knockoutBracket}
                setKnockoutBracket={setKnockoutBracket}
                openResultEntry={settings.openResultEntry}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'scorers' && (
              <Leaderboard players={players} fixtures={fixtures} />
            )}

            {activeTab === 'export' && (
              <WhatsAppExport
                players={players}
                groups={groups}
                fixtures={fixtures}
                fixtureConfig={fixtureConfig}
                qualifierConfig={qualifierConfig}
                knockoutBracket={knockoutBracket}
              />
            )}

            {activeTab === 'settings' && isAdmin && (
              <Settings
                settings={settings}
                setSettings={setSettings}
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>

        <footer
          style={{
            borderTop: '1px solid var(--border-soft)',
            background: 'linear-gradient(180deg, rgba(10,19,15,0.92), rgba(7,17,12,0.96))',
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              color: 'var(--text-muted)',
              fontSize: 11,
              letterSpacing: 1.4,
            }}
          >
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>
              EA26 TOURNAMENT MANAGER
            </span>
            <span>TNC · FIFA PS5 · Local-first tournament app</span>
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
