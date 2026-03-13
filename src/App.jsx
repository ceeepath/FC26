import { useState, useEffect } from 'react'
import PlayerManagement from './components/PlayerManagement'
import GroupSetup from './components/GroupSetup'
import FixtureSetup from './components/FixtureSetup'
import GroupStandings from './components/GroupStandings'
import KnockoutBracket from './components/KnockoutBracket'
import TopScorers from './components/TopScorers'
import Settings from './components/Settings'
import AdminLogin from './components/AdminLogin'
import { load, save, KEYS } from './utils/storage'

const DEFAULT_SETTINGS      = { adminPassword:'ea26admin', openResultEntry:false, minPlayers:1 }
const DEFAULT_FIXTURE_CONFIG = { group:1, quarter:1, semi:1, final:1 }
const DEFAULT_KNOCKOUT       = { locked:false, seeding:[], totalRounds:0 }

export default function App() {
  const [players,         setPlayers]         = useState(()=>load(KEYS.PLAYERS,[]))
  const [groups,          setGroups]           = useState(()=>load(KEYS.GROUPS,[]))
  const [groupsLocked,    setGroupsLocked]     = useState(()=>load(KEYS.GROUPS_LOCKED,false))
  const [fixtures,        setFixtures]         = useState(()=>load(KEYS.FIXTURES,[]))
  const [fixtureConfig,   setFixtureConfig]    = useState(()=>load(KEYS.FIXTURE_CONFIG,DEFAULT_FIXTURE_CONFIG))
  const [fixturesLocked,  setFixturesLocked]   = useState(()=>load(KEYS.FIXTURES_LOCKED,false))
  const [qualifierConfig, setQualifierConfig]  = useState(()=>load(KEYS.QUALIFIER_CONFIG,{perGroup:{},bestLosers:0}))
  const [knockoutBracket, setKnockoutBracket]  = useState(()=>load(KEYS.KNOCKOUT_BRACKET,DEFAULT_KNOCKOUT))
  const [settings,        setSettings]         = useState(()=>load(KEYS.SETTINGS,DEFAULT_SETTINGS))
  const [isAdmin,         setIsAdmin]          = useState(false)
  const [showLogin,       setShowLogin]        = useState(false)
  const [activeTab,       setActiveTab]        = useState('players')

  useEffect(()=>{ save(KEYS.PLAYERS,         players)         },[players])
  useEffect(()=>{ save(KEYS.GROUPS,          groups)          },[groups])
  useEffect(()=>{ save(KEYS.GROUPS_LOCKED,   groupsLocked)    },[groupsLocked])
  useEffect(()=>{ save(KEYS.FIXTURES,        fixtures)        },[fixtures])
  useEffect(()=>{ save(KEYS.FIXTURE_CONFIG,  fixtureConfig)   },[fixtureConfig])
  useEffect(()=>{ save(KEYS.FIXTURES_LOCKED, fixturesLocked)  },[fixturesLocked])
  useEffect(()=>{ save(KEYS.QUALIFIER_CONFIG,qualifierConfig) },[qualifierConfig])
  useEffect(()=>{ save(KEYS.KNOCKOUT_BRACKET,knockoutBracket) },[knockoutBracket])
  useEffect(()=>{ save(KEYS.SETTINGS,        settings)        },[settings])

  const fixturesGenerated = fixtures.length > 0

  const TABS = [
    { id:'players',   label:'⚽ Players' },
    { id:'groups',    label:'📋 Groups' },
    { id:'fixtures',  label:'📅 Fixtures',  locked:!groupsLocked },
    { id:'standings', label:'📊 Standings', locked:!fixturesGenerated },
    { id:'knockout',  label:'🏆 Knockout',  locked:!fixturesGenerated },
    { id:'scorers',   label:'🔥 Scorers',   locked:!fixturesGenerated },
    { id:'settings',  label:'⚙️ Settings',  adminOnly:true },
  ]

  function handleTabClick(tab) {
    if (tab.adminOnly && !isAdmin) { setShowLogin(true); return }
    if (tab.locked) return
    setActiveTab(tab.id)
  }

  function handleAdminLogin() { setIsAdmin(true); setActiveTab('settings') }
  function handleLogout()     { setIsAdmin(false); setActiveTab('players') }

  // Phase banner logic
  const playedCount = fixtures.filter(f=>f.type==='group'&&f.played).length
  const totalCount  = fixtures.filter(f=>f.type==='group').length
  const allGroupDone = fixturesGenerated && playedCount===totalCount && totalCount>0
  const knockoutLocked = knockoutBracket.locked

  let phaseIcon='🏆', phaseTitle='PHASE 1 — PLAYER REGISTRATION'
  let phaseDesc='Add all players before assigning groups.'
  if (knockoutLocked) {
    phaseIcon='🏆'; phaseTitle='PHASE 5 — KNOCKOUT STAGE'
    phaseDesc='Knockout bracket is live. May the best player win.'
  } else if (allGroupDone) {
    phaseIcon='🏆'; phaseTitle='PHASE 4 — KNOCKOUT SETUP'
    phaseDesc='Group stage complete. Set up the knockout bracket.'
  } else if (fixturesGenerated) {
    phaseIcon='⚽'; phaseTitle='PHASE 3 — MATCH RESULTS'
    phaseDesc='Enter match results to update the standings.'
  } else if (groupsLocked) {
    phaseIcon='📅'; phaseTitle='PHASE 2B — FIXTURE GENERATION'
    phaseDesc='Configure legs and generate your group stage fixtures.'
  } else if (groups.length>0) {
    phaseIcon='📋'; phaseTitle='PHASE 2 — GROUP SETUP'
    phaseDesc='Assign all players to groups, then lock to proceed.'
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <header style={{
        borderBottom:'1px solid var(--green-border)',
        background:'rgba(8,24,8,0.95)',
        backdropFilter:'blur(10px)',
        position:'sticky', top:0, zIndex:10,
      }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', border:'2px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚽</div>
              <div>
                <div style={{ fontFamily:'Bebas Neue', fontSize:22, letterSpacing:3, lineHeight:1, color:'var(--gold)' }}>EA26 TOURNAMENT</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:2 }}>TNC · FIFA PS5</div>
              </div>
            </div>
            {isAdmin ? (
              <span style={{ background:'#1a2e0a', border:'1px solid #3a6a1a', color:'#8fd46a', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20, letterSpacing:1 }}>🛡 ADMIN</span>
            ) : (
              <button className="btn-ghost" style={{ fontSize:13, padding:'7px 16px' }} onClick={()=>setShowLogin(true)}>🔐 Admin Login</button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:2, overflowX:'auto', paddingBottom:0 }}>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>handleTabClick(tab)}
                title={tab.locked?'Complete previous steps to unlock':''}
                style={{
                  background:'none', border:'none', whiteSpace:'nowrap',
                  cursor:tab.locked?'not-allowed':'pointer',
                  padding:'10px 14px', fontSize:13, fontWeight:600, fontFamily:'Barlow',
                  color:tab.locked?'#3a4a3a':activeTab===tab.id?'var(--gold)':'var(--text-muted)',
                  borderBottom:activeTab===tab.id?'2px solid var(--gold)':'2px solid transparent',
                  transition:'color 0.2s, border-color 0.2s',
                  position:'relative', bottom:-1,
                  opacity:tab.locked?0.4:1,
                }}>
                {tab.label}
                {tab.adminOnly && !isAdmin && <span style={{ marginLeft:4, fontSize:11 }}>🔒</span>}
                {tab.locked && <span style={{ marginLeft:4, fontSize:11 }}>🔒</span>}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ flex:1, maxWidth:900, width:'100%', margin:'0 auto', padding:'32px 20px' }}>
        {/* Phase banner */}
        <div style={{
          background:'linear-gradient(135deg, #0a2a0a, #0f3a0f)',
          border:'1px solid var(--green-border)', borderLeft:'3px solid var(--gold)',
          borderRadius:10, padding:'12px 18px', marginBottom:28,
          display:'flex', alignItems:'center', gap:12,
        }}>
          <span style={{ fontSize:20 }}>{phaseIcon}</span>
          <div>
            <p style={{ fontFamily:'Bebas Neue', fontSize:16, letterSpacing:2, color:'var(--gold)' }}>{phaseTitle}</p>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>{phaseDesc}</p>
          </div>
        </div>

        {activeTab==='players' && (
          <PlayerManagement players={players} setPlayers={setPlayers} isAdmin={isAdmin} minPlayers={settings.minPlayers??1} />
        )}
        {activeTab==='groups' && (
          <GroupSetup players={players} groups={groups} setGroups={setGroups}
            groupsLocked={groupsLocked} setGroupsLocked={setGroupsLocked} isAdmin={isAdmin} />
        )}
        {activeTab==='fixtures' && (
          <FixtureSetup
            players={players} groups={groups}
            fixtures={fixtures} setFixtures={setFixtures}
            fixtureConfig={fixtureConfig} setFixtureConfig={setFixtureConfig}
            fixturesLocked={fixturesLocked} setFixturesLocked={setFixturesLocked}
            openResultEntry={settings.openResultEntry}
            isAdmin={isAdmin}
          />
        )}
        {activeTab==='standings' && (
          <GroupStandings
            players={players} groups={groups} fixtures={fixtures}
            qualifierConfig={qualifierConfig} setQualifierConfig={setQualifierConfig}
            isAdmin={isAdmin}
          />
        )}
        {activeTab==='knockout' && (
          <KnockoutBracket
            players={players} groups={groups}
            fixtures={fixtures} setFixtures={setFixtures}
            fixtureConfig={fixtureConfig} qualifierConfig={qualifierConfig}
            knockoutBracket={knockoutBracket} setKnockoutBracket={setKnockoutBracket}
            openResultEntry={settings.openResultEntry}
            isAdmin={isAdmin}
          />
        )}
        {activeTab==='scorers' && (
          <TopScorers players={players} fixtures={fixtures} />
        )}
        {activeTab==='settings' && isAdmin && (
          <Settings settings={settings} setSettings={setSettings} onLogout={handleLogout} />
        )}
      </main>

      <footer style={{ textAlign:'center', padding:'20px', color:'var(--text-muted)', fontSize:12, borderTop:'1px solid var(--green-border)', letterSpacing:1 }}>
        EA26 TOURNAMENT · TNC · FIFA PS5 ⚽
      </footer>

      {showLogin && (
        <AdminLogin correctPassword={settings.adminPassword} onLogin={handleAdminLogin} onClose={()=>setShowLogin(false)} />
      )}
    </div>
  )
}