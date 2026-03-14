import { useState, useEffect } from 'react'
import { CopyButton } from './WhatsAppExport'
import { exportLeaderboard } from '../utils/whatsapp'

const MEDAL = ['🥇', '🥈', '🥉']

function calcLeaderboard(players, fixtures) {
  const played = fixtures.filter(f => f.played && !f.isBye)

  return players
    .map(player => {
      let MP = 0, W = 0, D = 0, L = 0, GF = 0, Pts = 0

      played.forEach(f => {
        const isHome = f.homeId === player.id
        const isAway = f.awayId === player.id
        if (!isHome && !isAway) return

        MP++
        const myGoals = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0)
        const theirGoals = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0)
        GF += myGoals

        if (f.manualWinnerId) {
          if (f.manualWinnerId === player.id) { W++; Pts += 3 }
          else L++
        } else {
          if (myGoals > theirGoals) { W++; Pts += 3 }
          else if (myGoals === theirGoals) { D++; Pts += 1 }
          else L++
        }
      })

      const groupPlayed = played.filter(f => f.type === 'group')
      const knockPlayed = played.filter(f => f.type === 'knockout')

      const groupGoals = groupPlayed.reduce((s, f) =>
        s + (f.homeId === player.id ? (f.homeScore ?? 0) : f.awayId === player.id ? (f.awayScore ?? 0) : 0)
      , 0)

      const knockGoals = knockPlayed.reduce((s, f) =>
        s + (f.homeId === player.id ? (f.homeScore ?? 0) : f.awayId === player.id ? (f.awayScore ?? 0) : 0)
      , 0)

      const groupPts = groupPlayed.reduce((s, f) => {
        const isHome = f.homeId === player.id
        const isAway = f.awayId === player.id
        if (!isHome && !isAway) return s
        if (f.manualWinnerId) return s + (f.manualWinnerId === player.id ? 3 : 0)

        const mg = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0)
        const tg = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0)
        return s + (mg > tg ? 3 : mg === tg ? 1 : 0)
      }, 0)

      const knockPts = Pts - groupPts

      return { ...player, MP, W, D, L, GF, Pts, groupGoals, knockGoals, groupPts, knockPts }
    })
    .filter(p => p.MP > 0)
    .sort((a, b) => b.Pts - a.Pts || b.GF - a.GF || a.name.localeCompare(b.name))
}

function HeroStat({ label, value, sub, accent }) {
  return (
    <div className="card" style={{
      padding: 18,
      minHeight: 104,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'linear-gradient(180deg, rgba(7,26,7,0.95), rgba(5,16,5,0.98))',
      border: `1px solid ${accent ?? 'var(--green-border)'}`,
      boxShadow: accent ? `0 0 0 1px ${accent}20 inset, 0 12px 30px rgba(0,0,0,0.22)` : '0 12px 30px rgba(0,0,0,0.18)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.6 }}>{label}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 34, lineHeight: 1, letterSpacing: 1.2, color: accent ?? 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )
}

function PodiumCard({ player, index }) {
  const palettes = [
    { bg: 'linear-gradient(180deg,#2e2507,#120f03)', border: 'var(--gold)', glow: 'rgba(245,197,24,0.18)', text: 'var(--gold)' },
    { bg: 'linear-gradient(180deg,#18211a,#0a100c)', border: '#8fa29a', glow: 'rgba(160,174,168,0.16)', text: '#d7e0db' },
    { bg: 'linear-gradient(180deg,#24170d,#100907)', border: '#af7b42', glow: 'rgba(175,123,66,0.16)', text: '#d99a5e' },
  ]
  const palette = palettes[index] ?? palettes[2]

  return (
    <div className="card" style={{
      padding: 22,
      borderRadius: 18,
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      boxShadow: `0 18px 40px ${palette.glow}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: -30,
        right: -10,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${palette.glow}, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: index === 0 ? 44 : 34 }}>{MEDAL[index]}</div>
        <div style={{
          padding: '6px 10px',
          borderRadius: 999,
          border: `1px solid ${palette.border}`,
          fontSize: 11,
          letterSpacing: 1.4,
          color: palette.text,
          background: 'rgba(0,0,0,0.18)',
        }}>
          #{index + 1}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: index === 0 ? 28 : 22, letterSpacing: 1.4, color: palette.text, marginBottom: 6 }}>
          {player.name}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {player.W} wins · {player.D} draws · {player.L} losses
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: index === 0 ? 64 : 50, lineHeight: 0.95, color: palette.text }}>
          {player.Pts}
        </div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 15, color: 'var(--text-muted)', letterSpacing: 2 }}>
          PTS
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
        {[
          ['MP', player.MP, 'var(--text-primary)'],
          ['GF', player.GF, palette.text],
          ['GRP', player.groupPts, '#8fd38d'],
          ['KO', player.knockPts, '#7dc4ff'],
        ].map(([label, value, color]) => (
          <div key={label} style={{
            padding: '10px 8px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RaceCard({ player, index, maxPts, maxGoals }) {
  const ptsBar = maxPts > 0 ? (player.Pts / maxPts) * 100 : 0
  const goalsBar = maxGoals > 0 ? (player.GF / maxGoals) * 100 : 0
  const isTop = index === 0
  const isTopThree = index < 3

  return (
    <div className="card" style={{
      padding: 16,
      borderRadius: 16,
      border: isTop ? '1px solid var(--gold)' : '1px solid var(--green-border)',
      background: isTop
        ? 'linear-gradient(180deg, rgba(245,197,24,0.08), rgba(7,20,7,0.94))'
        : 'linear-gradient(180deg, rgba(7,20,7,0.94), rgba(4,13,4,0.98))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: 'grid',
          placeItems: 'center',
          background: isTopThree ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isTopThree ? 'var(--gold-dim)' : 'var(--green-border)'}`,
          fontFamily: 'Bebas Neue',
          fontSize: 18,
          color: isTopThree ? 'var(--gold)' : 'var(--text-primary)',
          flexShrink: 0,
        }}>
          {index < 3 ? MEDAL[index] : `#${index + 1}`}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: isTop ? 'var(--gold)' : 'var(--text-primary)', letterSpacing: 1 }}>
              {player.Pts}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>PTS</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 26, fontSize: 10, color: 'var(--gold)', letterSpacing: 1.2 }}>PTS</span>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${ptsBar}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 26, fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.2 }}>GF</span>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${goalsBar}%`, height: '100%', background: 'linear-gradient(90deg, #4f8f4f, #89c489)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {[
          ['MP', player.MP],
          ['W', player.W],
          ['D', player.D],
          ['L', player.L],
          ['GF', player.GF],
          ['KO', player.knockPts],
        ].map(([label, value]) => (
          <div key={label} style={{
            padding: '5px 8px',
            borderRadius: 999,
            fontSize: 11,
            color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>{value}</strong> {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function TableCell({ children, align = 'left', muted = false, strong = false, color }) {
  return (
    <td style={{
      padding: '14px 12px',
      textAlign: align,
      fontSize: 13,
      color: color ?? (muted ? 'var(--text-muted)' : 'var(--text-primary)'),
      fontWeight: strong ? 700 : 500,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </td>
  )
}

export default function Leaderboard({ players, fixtures }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const board = calcLeaderboard(players, fixtures)
  const played = fixtures.filter(f => f.played && !f.isBye)
  const groupPlayed = played.filter(f => f.type === 'group')
  const knockoutPlayed = played.filter(f => f.type === 'knockout')
  const top = board[0]
  const avgGoals = played.length ? (played.reduce((s, f) => s + (f.homeScore ?? 0) + (f.awayScore ?? 0), 0) / played.length).toFixed(1) : '0.0'
  const maxPts = top?.Pts ?? 0
  const maxGoals = Math.max(...board.map(p => p.GF), 0)

  return (
    <div className="fade-up">
      <div className="card" style={{
        padding: 24,
        marginBottom: 22,
        borderRadius: 22,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(9,32,9,0.98) 0%, rgba(4,14,4,0.98) 58%, rgba(36,30,8,0.95) 100%)',
        border: '1px solid rgba(245,197,24,0.18)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top right, rgba(245,197,24,0.14), transparent 30%), radial-gradient(circle at left center, rgba(89,164,89,0.14), transparent 24%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                marginBottom: 10,
                background: 'rgba(245,197,24,0.08)',
                border: '1px solid rgba(245,197,24,0.18)',
                fontSize: 11,
                letterSpacing: 1.4,
                color: 'var(--gold)',
              }}>
                🏅 OVERALL RACE
              </div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 42, lineHeight: 0.95, letterSpacing: 2, color: 'var(--gold)', marginBottom: 8 }}>
                LEADERBOARD
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 760 }}>
                {board.length === 0
                  ? 'No match results yet. Once scores start coming in, this screen turns into the live race table for the whole tournament.'
                  : `Ranked by total points across the tournament, with goals scored as the tiebreaker. Group and knockout contributions are shown separately.`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <CopyButton text={exportLeaderboard(players, fixtures)} label="📋 Copy Leaderboard" size="small" />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: 18,
          }}>
            <div style={{
              padding: 18,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 4 }}>CURRENT RACE LEADER</div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 30, letterSpacing: 1.4, color: 'var(--text-primary)' }}>
                    {top ? top.name : 'No Leader Yet'}
                  </div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(245,197,24,0.08)',
                  border: '1px solid rgba(245,197,24,0.18)',
                  fontSize: 12,
                  color: 'var(--gold)',
                }}>
                  {top ? `${top.Pts} pts · ${top.GF} goals` : 'Waiting for first result'}
                </div>
              </div>

              <div style={{
                height: 8,
                borderRadius: 999,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.06)',
                marginBottom: 12,
              }}>
                <div style={{
                  width: board.length ? '100%' : '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(245,197,24,0.5), rgba(245,197,24,1))',
                }} />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {board.slice(0, 3).map((p, idx) => (
                  <div key={p.id} style={{
                    padding: '8px 10px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    minWidth: 130,
                  }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{MEDAL[idx]} Rank {idx + 1}</div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.Pts} pts · {p.GF} GF</div>
                  </div>
                ))}
                {board.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Top positions will appear here once matches are recorded.
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: 18,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 10 }}>RANKING RULE</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  '1. Highest points',
                  '2. Goals scored tiebreaker',
                  '3. Alphabetical if still tied',
                ].map(rule => (
                  <div key={rule} style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                  }}>
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        <HeroStat label="PLAYED FIXTURES" value={played.length} sub="All completed matches" accent="var(--gold)" />
        <HeroStat label="GROUP MATCHES" value={groupPlayed.length} sub="Results from group stage" accent="#8fd38d" />
        <HeroStat label="KNOCKOUT MATCHES" value={knockoutPlayed.length} sub="Results from knockout stage" accent="#7dc4ff" />
        <HeroStat label="AVG GOALS" value={avgGoals} sub="Goals per played fixture" accent="#c5d7c5" />
      </div>

      {board.length === 0 ? (
        <div className="card" style={{ padding: 46, textAlign: 'center', borderRadius: 20 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🏅</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1.6, color: 'var(--gold)', marginBottom: 8 }}>
            LEADERBOARD WILL APPEAR HERE
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
            Enter results in the fixtures or knockout screen and this page will turn into your live tournament race table.
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 26,
          }}>
            {board.slice(0, 3).map((player, index) => (
              <PodiumCard key={player.id} player={player} index={index} />
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1.55fr',
            gap: 18,
            marginBottom: 24,
            alignItems: 'start',
          }}>
            <div className="card" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1.4, color: 'var(--gold)' }}>
                    THE RACE
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Live points bars for every player in the tournament.
                  </div>
                </div>
                <div style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid var(--green-border)',
                  background: 'rgba(255,255,255,0.03)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}>
                  {board.length} ranked
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {board.map((player, index) => (
                  <RaceCard
                    key={player.id}
                    player={player}
                    index={index}
                    maxPts={maxPts}
                    maxGoals={maxGoals}
                  />
                ))}
              </div>
            </div>

            <div className="card" style={{ overflow: 'hidden', borderRadius: 18 }}>
              <div style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--green-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))',
              }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1.4, color: 'var(--gold)' }}>
                    FULL TABLE
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Total performance across group and knockout fixtures.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    ['GRP', 'Group points/goals'],
                    ['KO', 'Knockout points/goals'],
                  ].map(([short, text]) => (
                    <div key={short} style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{short}</strong> {text}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--green-border)' }}>
                      {[
                        ['#', 'left'],
                        ['Player', 'left'],
                        ['MP', 'center'],
                        ['W', 'center'],
                        ['D', 'center'],
                        ['L', 'center'],
                        ['GF', 'center'],
                        ['GRP PTS', 'center'],
                        ['GRP GF', 'center'],
                        ['KO PTS', 'center'],
                        ['KO GF', 'center'],
                        ['TOTAL', 'center'],
                      ].map(([label, align]) => (
                        <th key={label} style={{
                          padding: '12px',
                          textAlign: align,
                          fontSize: 11,
                          letterSpacing: 1.4,
                          color: 'var(--text-muted)',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {board.map((player, index) => {
                      const isLeader = index === 0
                      return (
                        <tr key={player.id} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isLeader ? 'rgba(245,197,24,0.04)' : index % 2 ? 'rgba(255,255,255,0.015)' : 'transparent',
                        }}>
                          <TableCell>
                            {index < 3
                              ? <span style={{ fontSize: 18 }}>{MEDAL[index]}</span>
                              : <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: 'var(--text-muted)' }}>{index + 1}</span>}
                          </TableCell>

                          <TableCell strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: isLeader ? 'var(--gold)' : index < 3 ? '#8fd38d' : 'rgba(255,255,255,0.18)',
                                boxShadow: isLeader ? '0 0 10px rgba(245,197,24,0.45)' : 'none',
                              }} />
                              <span>{player.name}</span>
                            </div>
                          </TableCell>

                          <TableCell align="center" muted>{player.MP}</TableCell>
                          <TableCell align="center" color={player.W ? '#78d078' : 'var(--text-muted)'} strong={player.W > 0}>{player.W}</TableCell>
                          <TableCell align="center" color={player.D ? 'var(--gold)' : 'var(--text-muted)'}>{player.D}</TableCell>
                          <TableCell align="center" color={player.L ? 'var(--danger)' : 'var(--text-muted)'}>{player.L}</TableCell>
                          <TableCell align="center" strong>{player.GF}</TableCell>
                          <TableCell align="center" color="#8fd38d">{player.groupPts}</TableCell>
                          <TableCell align="center" color="#8fd38d">{player.groupGoals}</TableCell>
                          <TableCell align="center" color="#7dc4ff">{player.knockPts}</TableCell>
                          <TableCell align="center" color="#7dc4ff">{player.knockGoals}</TableCell>
                          <TableCell align="center" strong color={isLeader ? 'var(--gold)' : 'var(--text-primary)'}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1 }}>{player.Pts}</span>
                          </TableCell>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--green-border)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>
                <span>Wins = 3 points</span>
                <span>Draws = 1 point</span>
                <span>Losses = 0 points</span>
                <span style={{ marginLeft: 'auto' }}>Manual ET/Pens winner counts as a win</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}