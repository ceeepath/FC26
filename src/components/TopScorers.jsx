const MEDAL = ['🥇', '🥈', '🥉']

function calcTopScorers(players, fixtures) {
  const played = fixtures.filter(f => f.played)

  return players
    .map(player => {
      let goals = 0
      let matches = 0

      played.forEach(f => {
        if (f.homeId === player.id) {
          goals += f.homeScore ?? 0
          matches++
        } else if (f.awayId === player.id && !f.isBye) {
          goals += f.awayScore ?? 0
          matches++
        }
      })

      const groupGoals = played
        .filter(f => f.type === 'group')
        .reduce((sum, f) => {
          if (f.homeId === player.id) return sum + (f.homeScore ?? 0)
          if (f.awayId === player.id) return sum + (f.awayScore ?? 0)
          return sum
        }, 0)

      const knockoutGoals = played
        .filter(f => f.type === 'knockout' && !f.isBye)
        .reduce((sum, f) => {
          if (f.homeId === player.id) return sum + (f.homeScore ?? 0)
          if (f.awayId === player.id) return sum + (f.awayScore ?? 0)
          return sum
        }, 0)

      return { ...player, goals, matches, groupGoals, knockoutGoals }
    })
    .filter(p => p.matches > 0)
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
}

export default function TopScorers({ players, fixtures }) {
  const scorers = calcTopScorers(players, fixtures)
  const played  = fixtures.filter(f => f.played).length
  const topGoals = scorers[0]?.goals ?? 0

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)', letterSpacing: 2 }}>
          TOP SCORERS
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {played === 0
            ? 'No matches played yet.'
            : `Ranked by total goals across all ${played} played match${played !== 1 ? 'es' : ''}.`}
        </p>
      </div>

      {scorers.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            No goals recorded yet. Enter match results to see the leaderboard.
          </p>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {scorers.length >= 2 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: scorers.length >= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: 12, marginBottom: 28,
            }}>
              {scorers.slice(0, 3).map((p, idx) => (
                <div key={p.id} style={{
                  background: idx === 0
                    ? 'linear-gradient(135deg, #2a1f00, #1a1200)'
                    : idx === 1
                      ? 'linear-gradient(135deg, #1a1a1a, #0f0f0f)'
                      : 'linear-gradient(135deg, #1a0f00, #120a00)',
                  border: `1px solid ${idx === 0 ? 'var(--gold)' : idx === 1 ? '#888' : '#a06030'}`,
                  borderRadius: 14, padding: '20px 16px',
                  textAlign: 'center',
                  order: idx === 1 ? -1 : idx === 0 ? 0 : 1,
                }}>
                  <div style={{ fontSize: idx === 0 ? 40 : 32, marginBottom: 6 }}>{MEDAL[idx]}</div>
                  <p style={{
                    fontFamily: 'Bebas Neue', fontSize: idx === 0 ? 18 : 15,
                    letterSpacing: 1, marginBottom: 4,
                    color: idx === 0 ? 'var(--gold)' : idx === 1 ? '#ccc' : '#c08040',
                  }}>
                    {p.name}
                  </p>
                  <p style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: idx === 0 ? 52 : 40,
                    color: idx === 0 ? 'var(--gold)' : idx === 1 ? '#ccc' : '#c08040',
                    lineHeight: 1, marginBottom: 4,
                  }}>
                    {p.goals}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
                    GOAL{p.goals !== 1 ? 'S' : ''}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {p.matches} match{p.matches !== 1 ? 'es' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Full table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--green-border)' }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2, color: 'var(--gold)' }}>
                FULL LEADERBOARD
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--green-border)' }}>
                    {['#', 'Player', 'MP', 'Group', 'KO', 'Total'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: i <= 1 ? 'left' : 'center',
                        fontSize: 12, fontWeight: 700, color: i === 5 ? 'var(--gold)' : 'var(--text-muted)',
                        letterSpacing: 1, fontFamily: 'Barlow', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((p, idx) => {
                    const isTop   = idx === 0
                    const barPct  = topGoals > 0 ? (p.goals / topGoals) * 100 : 0

                    return (
                      <tr key={p.id} style={{
                        borderBottom: '1px solid var(--green-border)',
                        background: isTop ? 'rgba(245,197,24,0.05)' : 'transparent',
                      }}>
                        {/* Rank */}
                        <td style={{ padding: '12px 14px', textAlign: 'left', width: 40 }}>
                          {idx < 3
                            ? <span style={{ fontSize: 18 }}>{MEDAL[idx]}</span>
                            : <span style={{ fontFamily: 'Bebas Neue', fontSize: 15, color: 'var(--text-muted)' }}>{idx + 1}</span>
                          }
                        </td>

                        {/* Name + bar */}
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                          {/* Goal bar */}
                          <div style={{ height: 4, borderRadius: 2, background: 'var(--green-border)', width: '100%', maxWidth: 160 }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              width: `${barPct}%`,
                              background: isTop ? 'var(--gold)' : 'var(--text-muted)',
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </td>

                        {/* Matches played */}
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                          {p.matches}
                        </td>

                        {/* Group goals */}
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 14 }}>
                          {p.groupGoals > 0
                            ? <span style={{ color: 'var(--text-primary)' }}>{p.groupGoals}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>

                        {/* Knockout goals */}
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: 14 }}>
                          {p.knockoutGoals > 0
                            ? <span style={{ color: '#f0a060' }}>{p.knockoutGoals}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>

                        {/* Total — bold */}
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span style={{
                            fontFamily: 'Bebas Neue', fontSize: 22,
                            color: isTop ? 'var(--gold)' : 'var(--text-primary)',
                          }}>
                            {p.goals}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}