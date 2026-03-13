import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⚡' },
  { id: 'players',   label: 'Players',     icon: '⚽' },
  { id: 'groups',    label: 'Groups',      icon: '📋' },
  { id: 'fixtures',  label: 'Fixtures',    icon: '📅' },
  { id: 'standings', label: 'Standings',   icon: '📊' },
  { id: 'knockout',  label: 'Knockout',    icon: '🏆' },
  { id: 'scorers',   label: 'Leaderboard', icon: '🏅' },
  { id: 'export',    label: 'Export',      icon: '📤' },
  { id: 'settings',  label: 'Settings',    icon: '⚙️', adminOnly: true },
]

export default function Sidebar({
  activeTab, onTabClick, isAdmin,
  onAdminClick, onLogout,
  mobileOpen, onMobileClose,
  tabs, // locked state comes from here
}) {
  // Build a map of locked/adminOnly state from the tabs array
  const tabMap = {}
  tabs.forEach(t => { tabMap[t.id] = t })

  function handleClick(item) {
    const tab = tabMap[item.id]
    if (!tab) return
    onTabClick(tab)
    onMobileClose()
  }

  const sidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(180deg, #070f07 0%, #040a04 100%)',
      borderRight: '1px solid #1a3a1a',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #0f2a0f',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a3a0a, #0a1f0a)',
            border: '2px solid var(--gold-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
            boxShadow: '0 0 10px rgba(245,197,24,0.15)',
          }}>⚽</div>
          <div>
            <div style={{
              fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: 3, lineHeight: 1,
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>EA26</div>
            <div style={{ fontSize: 9, color: '#4a6a4a', letterSpacing: 2 }}>TNC · FIFA PS5</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const tab = tabMap[item.id]
          if (!tab) return null
          const isActive   = activeTab === item.id
          const isLocked   = tab.locked
          const isAdminTab = tab.adminOnly && !isAdmin
          const disabled   = isLocked || isAdminTab

          return (
            <button key={item.id}
              onClick={() => handleClick(item)}
              disabled={disabled}
              title={isLocked ? 'Complete previous steps to unlock' : ''}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                border: isActive ? '1px solid rgba(245,197,24,0.2)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(245,197,24,0.1), rgba(245,197,24,0.04))'
                  : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.3 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!disabled && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              <span style={{
                fontFamily: 'Barlow', fontWeight: 700, fontSize: 13,
                color: isActive ? 'var(--gold)' : '#7a9a7a',
                letterSpacing: 0.3,
              }}>{item.label}</span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--gold)',
                  boxShadow: '0 0 6px var(--gold)',
                }} />
              )}
              {(isLocked || isAdminTab) && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#2a4a2a' }}>🔒</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Admin section */}
      <div style={{ padding: '12px 12px 16px', borderTop: '1px solid #0f2a0f' }}>
        {isAdmin ? (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8, marginBottom: 6,
              background: 'rgba(100,200,50,0.06)',
              border: '1px solid rgba(100,200,50,0.15)',
            }}>
              <span style={{ fontSize: 13 }}>🛡</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6ad46a', letterSpacing: 1 }}>ADMIN</span>
            </div>
            <button onClick={onLogout} style={{
              width: '100%', padding: '7px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid #1a2a1a',
              color: '#4a6a4a', fontSize: 12, fontFamily: 'Barlow', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a2a1a'; e.currentTarget.style.color = '#4a6a4a' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button onClick={onAdminClick} style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            background: 'transparent', border: '1px solid #1a3a1a',
            color: '#5a8a5a', fontSize: 12, fontFamily: 'Barlow', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s', letterSpacing: 0.5,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-dim)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a3a1a'; e.currentTarget.style.color = '#5a8a5a' }}
          >
            🔐 Admin Login
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 200, zIndex: 50,
        display: 'none',
      }} className="sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div onClick={onMobileClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 199, backdropFilter: 'blur(2px)',
          }} />
          <div style={{
            position: 'fixed', left: 0, top: 0, bottom: 0,
            width: 220, zIndex: 200,
            animation: 'slideInLeft 0.25s ease',
          }}>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}