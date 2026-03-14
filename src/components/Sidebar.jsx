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

function tone(kind = 'neutral') {
  const map = {
    gold: {
      color: 'var(--gold)',
      bg: 'rgba(212,175,55,0.08)',
      border: 'rgba(212,175,55,0.18)',
      glow: 'rgba(212,175,55,0.12)',
    },
    green: {
      color: 'var(--card-green)',
      bg: 'rgba(93,143,106,0.12)',
      border: 'rgba(93,143,106,0.20)',
      glow: 'rgba(93,143,106,0.12)',
    },
    danger: {
      color: 'var(--danger)',
      bg: 'rgba(179,92,92,0.08)',
      border: 'rgba(179,92,92,0.18)',
      glow: 'rgba(179,92,92,0.10)',
    },
    neutral: {
      color: 'var(--text-secondary)',
      bg: 'rgba(255,255,255,0.03)',
      border: 'var(--border-soft)',
      glow: 'transparent',
    },
  }
  return map[kind] ?? map.neutral
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

  const phaseTone = activeTab === 'knockout' ? tone('gold') : tone('neutral')

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(180deg, rgba(10,19,15,0.98) 0%, rgba(7,17,12,1) 100%)',
      borderRight: '1px solid var(--border-soft)',
      boxShadow: '24px 0 48px rgba(0,0,0,0.18)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at top left, var(--gold-glow), transparent 28%), radial-gradient(circle at bottom center, rgba(93,143,106,0.08), transparent 24%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          padding: '22px 18px 14px',
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(255,255,255,0.02))',
              border: '1px solid rgba(212,175,55,0.18)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 20,
              boxShadow: '0 0 18px rgba(212,175,55,0.06)',
              flexShrink: 0,
            }}>
              ⚽
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'Barlow Condensed',
                fontWeight: 700,
                fontSize: 24,
                lineHeight: 0.95,
                letterSpacing: 2.6,
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                EA26
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2.2, marginTop: 2 }}>
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
            border: '1px solid var(--border-soft)',
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.6, marginBottom: 3 }}>
                CURRENT PHASE
              </div>
              <div style={{
                fontFamily: 'Barlow Condensed',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1.2,
                color: 'var(--text-primary)',
              }}>
                {stats?.phase ?? 'Setup'}
              </div>
            </div>

            <div style={{
              padding: '5px 9px',
              borderRadius: 999,
              border: `1px solid ${phaseTone.border}`,
              background: phaseTone.bg,
              color: phaseTone.color,
              fontSize: 10,
              letterSpacing: 1.3,
              whiteSpace: 'nowrap',
            }}>
              {stats?.players ?? 0} players
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.8, padding: '0 10px 8px' }}>NAVIGATION</div>

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
                  border: isActive ? '1px solid rgba(212,175,55,0.20)' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(212,175,55,0.08), rgba(255,255,255,0.03))'
                    : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.38 : 1,
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!disabled && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
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
                  background: isActive ? 'rgba(212,175,55,0.10)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(212,175,55,0.18)' : 'var(--border-soft)'}`,
                  flexShrink: 0,
                  fontSize: 16,
                }}>
                  {item.icon}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
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
                    color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)',
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
                    boxShadow: '0 0 8px rgba(212,175,55,0.35)',
                    flexShrink: 0,
                  }} />
                )}

                {!isActive && (isLocked || isAdminTab) && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>🔒</span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid var(--border-soft)' }}>
          {isAdmin ? (
            <div style={{
              padding: 14,
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(93,143,106,0.10), rgba(255,255,255,0.02))',
              border: '1px solid rgba(93,143,106,0.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-soft)',
                  fontSize: 16,
                }}>
                  🛡
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--card-green)', letterSpacing: 1.5 }}>ADMIN MODE</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>Unlocked controls are active</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: '1px solid rgba(179,92,92,0.20)',
                  color: 'var(--danger)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(179,92,92,0.34)'
                  e.currentTarget.style.background = 'rgba(179,92,92,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(179,92,92,0.20)'
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
              background: 'linear-gradient(180deg, rgba(212,175,55,0.05), rgba(255,255,255,0.02))',
              border: '1px solid rgba(212,175,55,0.14)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1.5, marginBottom: 6 }}>ADMIN ACCESS</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Login to unlock settings and protected tournament actions.
              </div>

              <button
                onClick={onAdminClick}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.18)',
                  color: 'var(--gold)',
                  fontSize: 12,
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
