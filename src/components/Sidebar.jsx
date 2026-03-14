const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⚡', hint: 'Overview + progress' },
  { id: 'players',   label: 'Players',     icon: '⚽', hint: 'Register competitors' },
  { id: 'groups',    label: 'Groups',      icon: '📋', hint: 'Create and assign groups' },
  { id: 'fixtures',  label: 'Fixtures',    icon: '📅', hint: 'Generate and enter scores' },
  { id: 'standings', label: 'Standings',   icon: '📊', hint: 'Qualification race' },
  { id: 'knockout',  label: 'Knockout',    icon: '🏆', hint: 'Bracket + champion' },
  { id: 'scorers',   label: 'Leaderboard', icon: '🏅', hint: 'Overall tournament race' },
  { id: 'export',    label: 'Export',      icon: '📤', hint: 'WhatsApp share center' },
  { id: 'settings',  label: 'Settings',    icon: '⚙️', adminOnly: true, hint: 'Admin controls' },
]

function StageDot({ done, current, locked }) {
  const bg = current
    ? 'var(--gold)'
    : done
      ? '#68d168'
      : locked
        ? 'rgba(255,255,255,0.10)'
        : 'rgba(255,255,255,0.18)'

  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: bg,
        boxShadow: current ? '0 0 14px rgba(245,197,24,0.55)' : done ? '0 0 10px rgba(104,209,104,0.22)' : 'none',
        flexShrink: 0,
      }}
    />
  )
}

export default function Sidebar({
  activeTab, onTabClick, isAdmin,
  onAdminClick, onLogout,
  mobileOpen, onMobileClose,
  tabs,
  stats,
}) {
  const tabMap = {}
  tabs.forEach(t => { tabMap[t.id] = t })

  function handleClick(item) {
    const tab = tabMap[item.id]
    if (!tab) return
    onTabClick(tab)
    onMobileClose?.()
  }

  const progressSteps = [
    { key: 'players',  label: 'Players',   done: (stats?.players ?? 0) > 0, current: activeTab === 'players' },
    { key: 'groups',   label: 'Groups',    done: !!stats?.groupsLocked, current: activeTab === 'groups' },
    { key: 'fixtures', label: 'Fixtures',  done: !!stats?.fixturesGenerated, current: activeTab === 'fixtures' },
    { key: 'knockout', label: 'Knockout',  done: !!stats?.knockoutStarted, current: activeTab === 'knockout' },
  ]

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(180deg, rgba(7,18,7,0.98) 0%, rgba(3,9,3,1) 100%)',
      borderRight: '1px solid rgba(245,197,24,0.10)',
      boxShadow: '24px 0 48px rgba(0,0,0,0.18)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at top left, rgba(245,197,24,0.08), transparent 26%), radial-gradient(circle at bottom center, rgba(76,175,80,0.08), transparent 22%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          padding: '22px 18px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(245,197,24,0.18), rgba(245,197,24,0.04))',
              border: '1px solid rgba(245,197,24,0.22)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 20,
              boxShadow: '0 0 18px rgba(245,197,24,0.08)',
              flexShrink: 0,
            }}>
              ⚽
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'Bebas Neue',
                fontSize: 22,
                lineHeight: 0.95,
                letterSpacing: 3,
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                EA26
              </div>
              <div style={{ fontSize: 10, color: '#6f876f', letterSpacing: 2.2, marginTop: 2 }}>
                TNC · FIFA PS5
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#6f876f', letterSpacing: 1.6, marginBottom: 3 }}>
                CURRENT PHASE
              </div>
              <div style={{
                fontFamily: 'Bebas Neue',
                fontSize: 18,
                letterSpacing: 1.4,
                color: 'var(--text-primary)',
              }}>
                {stats?.phase ?? 'Setup'}
              </div>
            </div>

            <div style={{
              padding: '5px 9px',
              borderRadius: 999,
              border: '1px solid rgba(245,197,24,0.16)',
              background: 'rgba(245,197,24,0.08)',
              color: 'var(--gold)',
              fontSize: 10,
              letterSpacing: 1.3,
              whiteSpace: 'nowrap',
            }}>
              {stats?.players ?? 0} players
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: '#6f876f', letterSpacing: 1.8, padding: '0 10px 8px' }}>NAVIGATION</div>

          {NAV_ITEMS.map(item => {
            const tab = tabMap[item.id]
            if (!tab) return null

            const isActive = activeTab === item.id
            const isLocked = !!tab.locked
            const isAdminTab = !!tab.adminOnly && !isAdmin
            const disabled = isLocked || isAdminTab

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                disabled={disabled}
                title={isLocked ? 'Complete previous steps to unlock' : item.hint}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 12px',
                  borderRadius: 16,
                  marginBottom: 6,
                  border: isActive ? '1px solid rgba(245,197,24,0.22)' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(245,197,24,0.12), rgba(255,255,255,0.03))'
                    : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.38 : 1,
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!disabled && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.035)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: isActive ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${isActive ? 'rgba(245,197,24,0.18)' : 'rgba(255,255,255,0.05)'}`,
                  flexShrink: 0,
                  fontSize: 16,
                }}>
                  {item.icon}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontFamily: 'Barlow',
                    fontWeight: 700,
                    fontSize: 13,
                    color: isActive ? 'var(--gold)' : 'var(--text-primary)',
                    letterSpacing: 0.2,
                    marginBottom: 2,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: isActive ? '#c4b584' : '#6f876f',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {isAdminTab ? 'Admin access required' : isLocked ? 'Locked for now' : item.hint}
                  </div>
                </div>

                {isActive && (
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    boxShadow: '0 0 10px rgba(245,197,24,0.55)',
                    flexShrink: 0,
                  }} />
                )}

                {!isActive && (isLocked || isAdminTab) && (
                  <span style={{ fontSize: 11, color: '#466546', flexShrink: 0 }}>🔒</span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {isAdmin ? (
            <div style={{
              padding: 14,
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(76,175,80,0.10), rgba(76,175,80,0.04))',
              border: '1px solid rgba(76,175,80,0.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 16,
                }}>
                  🛡
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#7fd37f', letterSpacing: 1.5 }}>ADMIN MODE</div>
                  <div style={{ fontSize: 12, color: '#bce6bc', fontWeight: 700 }}>Unlocked controls are active</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: '1px solid rgba(224,82,82,0.20)',
                  color: '#d58787',
                  fontSize: 12,
                  fontFamily: 'Barlow',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(224,82,82,0.45)'
                  e.currentTarget.style.background = 'rgba(224,82,82,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(224,82,82,0.20)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{
              padding: 14,
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(245,197,24,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(245,197,24,0.12)',
            }}>
              <div style={{ fontSize: 11, color: '#d2bc75', letterSpacing: 1.5, marginBottom: 6 }}>ADMIN ACCESS</div>
              <div style={{ fontSize: 12, color: '#9aae9a', marginBottom: 12 }}>
                Login to unlock settings and protected tournament actions.
              </div>

              <button
                onClick={onAdminClick}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(245,197,24,0.08)',
                  border: '1px solid rgba(245,197,24,0.18)',
                  color: 'var(--gold)',
                  fontSize: 12,
                  fontFamily: 'Barlow',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: 0.3,
                }}
              >
                🔐 Admin Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 276,
          zIndex: 70,
          display: 'block',
        }}
      >
        {sidebarContent}
      </div>

      {mobileOpen && (
        <>
          <div
            onClick={onMobileClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.62)',
              zIndex: 199,
              backdropFilter: 'blur(6px)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: 286,
              maxWidth: '86vw',
              zIndex: 200,
              animation: 'slideInLeft 0.25s ease',
            }}
          >
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
