import { useState, useEffect } from 'react'
import PlayerManagement from './components/PlayerManagement'
import GroupSetup from './components/GroupSetup'
import FixtureSetup from './components/FixtureSetup'
import GroupStandings from './components/GroupStandings'
import KnockoutBracket from './components/KnockoutBracket'
import Leaderboard from './components/LeaderBoard'
import WhatsAppExport from './components/WhatsAppExport'
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
  const [activeTab,       setActiveTab]      = useState('players')

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
  function handleLogout()     { setIsAdmin(false); setActiveTab('players') }

  const playedCount    = fixtures.filter(f => f.type === 'group' && f.played).length
  const totalCount     = fixtures.filter(f => f.type === 'group').length
  const allGroupDone   = fixturesGenerated && playedCount === totalCount && totalCount > 0
  const knockoutLocked = knockoutBracket.locked

  let phaseIcon = '⚽', phaseLabel = 'REGISTRATION', phaseDesc = 'Add all players before assigning groups.'
  if (knockoutLocked) {
    phaseIcon = '🏆'; phaseLabel = 'KNOCKOUT'; phaseDesc = 'Knockout bracket is live.'
  } else if (allGroupDone) {
    phaseIcon = '🏆'; phaseLabel = 'KNOCKOUT SETUP'; phaseDesc = 'Group stage complete — set up the bracket.'
  } else if (fixturesGenerated) {
    phaseIcon = '⚽'; phaseLabel = 'MATCH DAY'; phaseDesc = 'Enter results to update standings.'
  } else if (groupsLocked) {
    phaseIcon = '📅'; phaseLabel = 'FIXTURES'; phaseDesc = 'Generate your group stage fixtures.'
  } else if (groups.length > 0) {
    phaseIcon = '📋'; phaseLabel = 'GROUP SETUP'; phaseDesc = 'Assign all players then lock groups.'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(180deg, #0a1f0a 0%, #050e05 100%)',
        borderBottom: '1px solid #1e3e1e',
        boxShadow: '0 2px 20px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03) inset',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a3a0a, #0a1f0a)',
                border: '2px solid var(--gold-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
                boxShadow: '0 0 12px rgba(245,197,24,0.2)',
              }}>⚽</div>
              <div>
                <div style={{
                  fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 4,
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), #ffe066)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>EA26 TOURNAMENT</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 3, marginTop: 1 }}>TNC · FIFA PS5</div>
              </div>
            </div>

            {/* Phase pill + admin */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Phase pill — hidden on very small screens */}
              <div className="hide-mobile" style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(245,197,24,0.07)',
                border: '1px solid rgba(245,197,24,0.2)',
                borderRadius: 20, padding: '5px 12px',
              }}>
                <span style={{ fontSize: 13 }}>{phaseIcon}</span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 2, color: 'var(--gold)', opacity: 0.9 }}>
                  {phaseLabel}
                </span>
              </div>

              {isAdmin ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #1a3a0a, #0f2a07)',
                  border: '1px solid #3a7a1a', color: '#8fd46a',
                  fontSize: 12, fontWeight: 700, padding: '6px 14px',
                  borderRadius: 20, letterSpacing: 1,
                  boxShadow: '0 0 12px rgba(100,200,50,0.1)',
                }}>
                  🛡 ADMIN
                </div>
              ) : (
                <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20 }}
                  onClick={() => setShowLogin(true)}>
                  🔐 Login
                </button>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <div className="tabs-scroll" style={{
            display: 'flex', gap: 0,
            overflowX: 'auto', paddingBottom: 0,
            marginLeft: -4, marginRight: -4,
          }}>
            {TABS.map(tab => {
              const isActive  = activeTab === tab.id
              const isLocked  = tab.locked
              const isAdmin_  = tab.adminOnly && !isAdmin
              const disabled  = isLocked || isAdmin_
              return (
                <button key={tab.id} onClick={() => handleTabClick(tab)}
                  title={isLocked ? 'Complete previous steps to unlock' : ''}
                  style={{
                    background: 'none', border: 'none', whiteSpace: 'nowrap',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    padding: '10px 14px',
                    fontSize: 12, fontWeight: 700, fontFamily: 'Barlow',
                    letterSpacing: 0.5,
                    color: disabled ? '#2a4a2a'
                      : isActive  ? 'var(--gold)'
                      : 'var(--text-muted)',
                    borderBottom: isActive
                      ? '2px solid var(--gold)'
                      : '2px solid transparent',
                    transition: 'color 0.15s, border-color 0.15s',
                    position: 'relative', bottom: -1,
                    opacity: disabled ? 0.35 : 1,
                    flexShrink: 0,
                  }}>
                  <span style={{ marginRight: 5 }}>{tab.icon}</span>
                  {tab.label}
                  {isAdmin_ && <span style={{ marginLeft: 4, fontSize: 10 }}>🔒</span>}
                  {isLocked && <span style={{ marginLeft: 4, fontSize: 10 }}>🔒</span>}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: 960, width: '100%', margin: '0 auto', padding: '24px 16px' }}>

        {/* Phase banner — compact strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(90deg, rgba(26,60,10,0.8), rgba(10,30,10,0.4))',
          border: '1px solid #1e3e1e',
          borderLeft: '3px solid var(--gold-dim)',
          borderRadius: 10, padding: '10px 16px',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{phaseIcon}</span>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: 2, color: 'var(--gold)' }}>
              {phaseLabel}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 10 }}>{phaseDesc}</span>
          </div>
        </div>

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

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '16px 20px',
        color: '#2a4a2a', fontSize: 11,
        borderTop: '1px solid #0f1f0f',
        letterSpacing: 2, fontFamily: 'Bebas Neue',
      }}>
        EA26 TOURNAMENT · TNC · FIFA PS5
      </footer>

      {showLogin && (
        <AdminLogin correctPassword={settings.adminPassword} onLogin={handleAdminLogin} onClose={() => setShowLogin(false)} />
      )}
    </div>
  )
}