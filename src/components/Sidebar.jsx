const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⚡' },
  { id: 'players',   label: 'Players',     icon: '👥' },
  { id: 'groups',    label: 'Groups',      icon: '📋' },
  { id: 'fixtures',  label: 'Fixtures',    icon: '📅' },
  { id: 'standings', label: 'Standings',   icon: '📊' },
  { id: 'knockout',  label: 'Knockout',    icon: '🏆' },
  { id: 'scorers',   label: 'Leaderboard', icon: '🏅' },
  { id: 'export',    label: 'Export',      icon: '📤' },
  { id: 'settings',  label: 'Settings',    icon: '⚙️', adminOnly: true },
]

function SidebarContent({ activeTab, tabs, onTabClick, isAdmin, onAdminClick, onLogout, onClose }) {
  const tabMap = {}
  tabs.forEach(t => { tabMap[t.id] = t })

  function handleClick(item) {
    const tab = tabMap[item.id]
    if (!tab) return
    onTabClick(tab)
    if (onClose) onClose()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #060d06 0%, #030803 100%)',
      borderRight: '1px solid rgba(30,60,30,0.6)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid rgba(30,60,30,0.5)',
        background: 'linear-gradient(180deg, rgba(26,60,10,0.3), transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a4a0a, #0a2a04)',
            border: '2px solid rgba(245,197,24,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
            boxShadow: '0 0 16px rgba(245,197,24,0.15)',
          }}>⚽</div>
          <div>
            <div style={{
              fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 3, lineHeight: 1.1,
              background: 'linear-gradient(135deg, #c9960f, #F5C518, #ffe066)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>EA26</div>
            <div style={{ fontSize: 9, color: '#3a5a3a', letterSpacing: 2, marginTop: 1 }}>TOURNAMENT MGR</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const tab = tabMap[item.id]
          if (!tab) return null
          const isActive   = activeTab === item.id
          const isLocked   = tab.locked
          const isAdminTab = tab.adminOnly && !isAdmin
          const disabled   = isLocked || isAdminTab

          return (
            <button key={item.id}
              onClick={() => !disabled && handleClick(item)}
              title={isLocked ? 'Complete previous steps to unlock' : ''}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 1,
                border: isActive
                  ? '1px solid rgba(245,197,24,0.25)'
                  : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(245,197,24,0.12), rgba(245,197,24,0.04))'
                  : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.28 : 1,
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!disabled && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Active bar */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: 'var(--gold)',
                  boxShadow: '0 0 8px var(--gold)',
                }} />
              )}
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
              <span style={{
                fontFamily: 'Barlow', fontWeight: 700, fontSize: 12,
                color: isActive ? 'var(--gold)' : '#6a8a6a',
                letterSpacing: 0.4,
              }}>{item.label}</span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)',
                }} />
              )}
              {(isLocked || isAdminTab) && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#2a4a2a' }}>🔒</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider + Admin */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(20,40,20,0.5)' }}>
        {isAdmin ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 8, marginBottom: 6,
              background: 'rgba(80,180,40,0.08)',
              border: '1px solid rgba(80,180,40,0.2)',
            }}>
              <span style={{ fontSize: 12 }}>🛡</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6ad46a', letterSpacing: 1 }}>ADMIN MODE</span>
            </div>
            <button onClick={onLogout} style={{
              width: '100%', padding: '7px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid rgba(224,82,82,0.15)',
              color: '#6a4a4a', fontSize: 11, fontFamily: 'Barlow', fontWeight: 700,
              cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(224,82,82,0.15)'; e.currentTarget.style.color = '#6a4a4a' }}
            >
              Logout
            </button>
          </>
        ) : (
          <button onClick={onAdminClick} style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            background: 'transparent', border: '1px solid rgba(40,80,40,0.5)',
            color: '#4a7a4a', fontSize: 11, fontFamily: 'Barlow', fontWeight: 700,
            cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.4)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(40,80,40,0.5)'; e.currentTarget.style.color = '#4a7a4a' }}
          >
            🔐 Admin Login
          </button>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({
  activeTab, onTabClick, isAdmin, onAdminClick, onLogout,
  mobileOpen, onMobileClose, tabs,
}) {
  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div onClick={onMobileClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 199, backdropFilter: 'blur(3px)',
        }} />
      )}

      {/* Drawer (used for both desktop fixed + mobile slide-in) */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: 200, zIndex: 200,
          animation: 'slideInLeft 0.22s cubic-bezier(0.2, 0, 0, 1)',
        }}>
          <SidebarContent
            activeTab={activeTab} tabs={tabs}
            onTabClick={onTabClick} isAdmin={isAdmin}
            onAdminClick={onAdminClick} onLogout={onLogout}
            onClose={onMobileClose}
          />
        </div>
      )}

      {/* Desktop fixed sidebar — rendered via a portal-like div in App.jsx */}
    </>
  )
}

export { SidebarContent }