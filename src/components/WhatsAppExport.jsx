import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import {
  exportGroupStandings, exportResultsByRound, exportQualifiers,
  exportKnockoutResults, exportLeaderboard, exportFixtures
} from '../utils/whatsapp'

// ── Shared copy button ────────────────────────────────────────────────────

export function CopyButton({ text, label = '📋 Copy', size = 'normal' }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  const small = size === 'small'
  return (
    <button onClick={handleCopy} style={{
      padding: small ? '6px 12px' : '10px 18px',
      borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
      fontFamily: 'Barlow', fontWeight: 700, fontSize: small ? 12 : 13,
      background: copied ? '#1a3a1a' : 'transparent',
      border: `1px solid ${copied ? '#4caf50' : 'var(--green-border)'}`,
      color: copied ? '#4caf50' : 'var(--text-muted)',
      whiteSpace: 'nowrap',
    }}>
      {copied ? '✅ Copied!' : label}
    </button>
  )
}

// ── Image capture button ──────────────────────────────────────────────────

function ImageButton({ targetRef, filename, size = 'normal' }) {
  const [saving, setSaving] = useState(false)
  async function handleSave() {
    if (!targetRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#031403',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Image export failed', e)
    }
    setSaving(false)
  }
  const small = size === 'small'
  return (
    <button onClick={handleSave} disabled={saving} style={{
      padding: small ? '6px 12px' : '10px 18px',
      borderRadius: 8, cursor: saving ? 'wait' : 'pointer', transition: 'all 0.2s',
      fontFamily: 'Barlow', fontWeight: 700, fontSize: small ? 12 : 13,
      background: saving ? '#1a1f00' : 'transparent',
      border: `1px solid ${saving ? 'var(--gold-dim)' : 'var(--gold-dim)'}`,
      color: saving ? 'var(--gold)' : 'var(--gold)',
      whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1,
    }}>
      {saving ? '⏳ Saving…' : '📸 Save Image'}
    </button>
  )
}

// ── Styled image cards (what gets captured) ───────────────────────────────

function CardWrapper({ children, title, subtitle }) {
  return (
    <div style={{
      background: '#031403',
      padding: 24,
      fontFamily: 'Barlow, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #c9960f' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#F5C518', letterSpacing: 3 }}>
          EA26 TOURNAMENT
        </div>
        <div style={{ fontSize: 11, color: '#8a9a8a', letterSpacing: 3, marginTop: 2 }}>TNC · FIFA PS5</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#f0f0f0', letterSpacing: 2, marginTop: 10 }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 13, color: '#8a9a8a', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {children}
      {/* Footer */}
      <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #1a3a1a', fontSize: 11, color: '#4a6a4a', letterSpacing: 1, textAlign: 'right' }}>
        tncfc26.netlify.app
      </div>
    </div>
  )
}

function StandingsCard({ groups, players, fixtures, qualifierConfig }) {
  function calcRows(group) {
    const gf = fixtures.filter(f => f.type === 'group' && f.groupId === group.id)
    const ids = group.playerIds.filter(id => players.some(p => p.id === id))
    const rows = ids.map(id => {
      const name = players.find(p => p.id === id)?.name ?? '???'
      let P=0,W=0,D=0,L=0,GF=0,GA=0
      gf.forEach(f => {
        if (!f.played) return
        if (f.homeId===id){ P++;GF+=f.homeScore;GA+=f.awayScore; if(f.homeScore>f.awayScore)W++; else if(f.homeScore===f.awayScore)D++; else L++ }
        else if(f.awayId===id){ P++;GF+=f.awayScore;GA+=f.homeScore; if(f.awayScore>f.homeScore)W++; else if(f.awayScore===f.homeScore)D++; else L++ }
      })
      return { id, name, P, W, D, L, GF, GA, GD:GF-GA, Pts:W*3+D }
    })
    rows.sort((a,b)=>b.Pts-a.Pts||b.GD-a.GD||b.GF-a.GF||a.name.localeCompare(b.name))
    return rows
  }

  const GROUP_COLORS = [
    '#c9960f','#1a7a4a','#1a4a9a','#8a1a8a','#9a4a1a','#1a7a7a','#6a1a1a','#4a6a1a'
  ]

  const played = fixtures.filter(f=>f.type==='group'&&f.played).length
  const total  = fixtures.filter(f=>f.type==='group').length

  return (
    <CardWrapper title="GROUP STANDINGS" subtitle={`${played} of ${total} matches played`}>
      {groups.map((group, gi) => {
        const rows = calcRows(group)
        const q    = qualifierConfig?.perGroup?.[group.id] ?? 2
        const col  = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length]
        return (
          <div key={group.id} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:16, color:col, letterSpacing:2, marginBottom:8 }}>
              {group.name}
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${col}40` }}>
                  {['#','Player','P','W','D','L','GF','GA','GD','Pts'].map((h,i)=>(
                    <th key={h} style={{ padding:'4px 8px', textAlign:i<=1?'left':'center', color:'#8a9a8a', fontWeight:700, fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,idx)=>(
                  <tr key={r.id} style={{
                    background: idx<q ? 'rgba(76,175,80,0.1)' : 'transparent',
                    borderBottom:`1px solid #1a3a1a`,
                    borderLeft: idx<q ? '2px solid #4caf50' : '2px solid transparent',
                  }}>
                    <td style={{ padding:'6px 8px', color:idx===0?'#F5C518':idx<q?'#4caf50':'#8a9a8a', fontFamily:'Bebas Neue, sans-serif', fontSize:14 }}>{idx+1}</td>
                    <td style={{ padding:'6px 8px', fontWeight:700, color:'#f0f0f0' }}>
                      {idx<q?'✅ ':''}{r.name}
                    </td>
                    {[r.P,r.W,r.D,r.L,r.GF,r.GA,r.GD>0?`+${r.GD}`:r.GD,r.Pts].map((v,i)=>(
                      <td key={i} style={{ padding:'6px 8px', textAlign:'center', color: i===7?'#F5C518':i===1&&v>0?'#4caf50':i===3&&v>0?'#e05252':'#f0f0f0', fontFamily:i===7?'Bebas Neue, sans-serif':'inherit', fontSize:i===7?16:13, fontWeight:i===7?700:400 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </CardWrapper>
  )
}

function LeaderboardCard({ players, fixtures }) {
  const played = fixtures.filter(f=>f.played&&!f.isBye)
  const board  = players.map(player => {
    let MP=0,W=0,D=0,L=0,GF=0,Pts=0
    played.forEach(f=>{
      const isHome=f.homeId===player.id,isAway=f.awayId===player.id
      if(!isHome&&!isAway)return
      MP++
      const mg=isHome?(f.homeScore??0):(f.awayScore??0),tg=isHome?(f.awayScore??0):(f.homeScore??0)
      GF+=mg
      if(f.manualWinnerId){if(f.manualWinnerId===player.id){W++;Pts+=3}else L++}
      else{if(mg>tg){W++;Pts+=3}else if(mg===tg){D++;Pts+=1}else L++}
    })
    return{...player,MP,W,D,L,GF,Pts}
  }).filter(p=>p.MP>0).sort((a,b)=>b.Pts-a.Pts||b.GF-a.GF||a.name.localeCompare(b.name))

  const medals=['🥇','🥈','🥉']
  const topPts = board[0]?.Pts ?? 1

  return (
    <CardWrapper title="OVERALL LEADERBOARD" subtitle={`${played.length} matches played`}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #1a3a1a' }}>
            {['#','Player','MP','W','D','L','GF','Pts'].map((h,i)=>(
              <th key={h} style={{ padding:'6px 10px', textAlign:i<=1?'left':'center', color: i===7?'#F5C518':'#8a9a8a', fontSize:11, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {board.map((p,idx)=>{
            const barW = Math.round((p.Pts/topPts)*100)
            return (
              <tr key={p.id} style={{ borderBottom:'1px solid #0f2a0f', background:idx===0?'rgba(245,197,24,0.05)':'transparent' }}>
                <td style={{ padding:'8px 10px', fontSize:18 }}>{medals[idx]??<span style={{fontFamily:'Bebas Neue,sans-serif',color:'#8a9a8a'}}>{idx+1}</span>}</td>
                <td style={{ padding:'8px 10px' }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'#f0f0f0', marginBottom:3 }}>{p.name}</div>
                  <div style={{ height:3, borderRadius:2, background:'#1a3a1a', width:100 }}>
                    <div style={{ height:'100%', borderRadius:2, width:`${barW}%`, background:idx===0?'#F5C518':'#4a6a4a' }} />
                  </div>
                </td>
                <td style={{ padding:'8px 10px', textAlign:'center', color:'#8a9a8a', fontSize:13 }}>{p.MP}</td>
                <td style={{ padding:'8px 10px', textAlign:'center', color:p.W>0?'#4caf50':'#8a9a8a', fontWeight:p.W>0?700:400, fontSize:13 }}>{p.W}</td>
                <td style={{ padding:'8px 10px', textAlign:'center', color:p.D>0?'#F5C518':'#8a9a8a', fontSize:13 }}>{p.D}</td>
                <td style={{ padding:'8px 10px', textAlign:'center', color:p.L>0?'#e05252':'#8a9a8a', fontSize:13 }}>{p.L}</td>
                <td style={{ padding:'8px 10px', textAlign:'center', fontSize:13 }}>{p.GF}</td>
                <td style={{ padding:'8px 10px', textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:idx===0?'#F5C518':'#f0f0f0' }}>{p.Pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </CardWrapper>
  )
}

function RoundCard({ rIdx, groups, players, fixtures, fixtureConfig }) {
  const groupFix = fixtures.filter(f => f.type === 'group')
  const byGroup  = groups.map(g => ({ group: g, all: groupFix.filter(f => f.groupId === g.id) }))
  const pName    = id => players.find(p => p.id === id)?.name ?? '???'
  const roundFixtures = byGroup.map(({ group, all }) => ({ group, f: all[rIdx] ?? null })).filter(x => x.f)
  const playedInRound = roundFixtures.filter(x => x.f.played).length

  return (
    <CardWrapper
      title={`ROUND ${rIdx + 1} RESULTS`}
      subtitle={`${playedInRound} of ${roundFixtures.length} matches played`}
    >
      {roundFixtures.map(({ group, f }) => {
        const leg = fixtureConfig?.group === 2 ? ` L${f.leg}` : ''
        return (
          <div key={f.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid #0f1f0f' }}>
            <span style={{ fontSize:11, color:'#8a9a8a', minWidth:72 }}>{group.name}{leg}</span>
            <span style={{ flex:1, textAlign:'right', fontWeight:700, color:'#f0f0f0', fontSize:13 }}>{pName(f.homeId)}</span>
            <div style={{ padding:'4px 12px', background:f.played?'#1a2e00':'#0a1a0a', border:`1px solid ${f.played?'#3a6a00':'#1a3a1a'}`, borderRadius:4, minWidth:52, textAlign:'center' }}>
              {f.played
                ? <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, color:'#a0d060', letterSpacing:1 }}>{f.homeScore}–{f.awayScore}</span>
                : <span style={{ fontSize:11, color:'#4a6a4a' }}>vs</span>}
            </div>
            <span style={{ flex:1, fontWeight:700, color:'#f0f0f0', fontSize:13 }}>{pName(f.awayId)}</span>
          </div>
        )
      })}
    </CardWrapper>
  )
}

function PerRoundResults({ groups, players, fixtures, fixtureConfig }) {
  const groupFix = fixtures.filter(f => f.type === 'group')
  const byGroup  = groups.map(g => ({ all: groupFix.filter(f => f.groupId === g.id) }))
  const maxR     = Math.max(...byGroup.map(g => g.all.length), 0)
  const roundRefs = Array.from({ length: maxR }, () => useRef(null))

  if (maxR === 0) return <p style={{ color:'#8a9a8a', padding:16 }}>No fixtures yet.</p>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {Array.from({ length: maxR }, (_, rIdx) => (
        <div key={rIdx}>
          {/* Per-round save button */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:6 }}>
            <ImageButton targetRef={roundRefs[rIdx]} filename={`ea26-round-${rIdx+1}`} size="small" />
          </div>
          <div ref={roundRefs[rIdx]}>
            <RoundCard rIdx={rIdx} groups={groups} players={players} fixtures={fixtures} fixtureConfig={fixtureConfig} />
          </div>
        </div>
      ))}
    </div>
  )
}

function QualifiersCard({ groups, players, fixtures, qualifierConfig }) {
  function calcRows(group) {
    const gf=fixtures.filter(f=>f.type==='group'&&f.groupId===group.id)
    const ids=group.playerIds.filter(id=>players.some(p=>p.id===id))
    const rows=ids.map(id=>{
      const name=players.find(p=>p.id===id)?.name??'???'
      let P=0,W=0,D=0,L=0,GF=0,GA=0
      gf.forEach(f=>{
        if(!f.played)return
        if(f.homeId===id){P++;GF+=f.homeScore;GA+=f.awayScore;if(f.homeScore>f.awayScore)W++;else if(f.homeScore===f.awayScore)D++;else L++}
        else if(f.awayId===id){P++;GF+=f.awayScore;GA+=f.homeScore;if(f.awayScore>f.homeScore)W++;else if(f.awayScore===f.homeScore)D++;else L++}
      })
      return{id,name,P,W,D,L,GF,GA,GD:GF-GA,Pts:W*3+D}
    })
    rows.sort((a,b)=>b.Pts-a.Pts||b.GD-a.GD||b.GF-a.GF||a.name.localeCompare(b.name))
    return rows
  }
  const direct=[]
  const loserPool=[]
  groups.forEach(group=>{
    const rows=calcRows(group), q=qualifierConfig?.perGroup?.[group.id]??2
    rows.slice(0,q).forEach((r,i)=>direct.push({...r,groupName:group.name,rank:i+1}))
    rows.slice(q).forEach(r=>loserPool.push({...r,groupName:group.name}))
  })
  loserPool.sort((a,b)=>b.Pts-a.Pts||b.GD-a.GD||b.GF-a.GF||a.name.localeCompare(b.name))
  const wildcards=loserPool.slice(0,qualifierConfig?.bestLosers??0)

  return (
    <CardWrapper title="QUALIFIERS" subtitle={`${direct.length+wildcards.length} players advance to knockout stage`}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:'#8a9a8a', letterSpacing:2, marginBottom:10, fontWeight:700 }}>DIRECT QUALIFIERS</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {direct.map((p,i)=>(
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'rgba(76,175,80,0.1)', border:'1px solid #2a5a2a', borderRadius:8 }}>
              <span style={{ fontSize:16 }}>{i===0?'🥇':i===1?'🥈':'✅'}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#f0f0f0' }}>{p.name}</div>
                <div style={{ fontSize:11, color:'#4caf50' }}>{p.groupName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {wildcards.length>0&&(
        <div>
          <div style={{ fontSize:12, color:'#8a9a8a', letterSpacing:2, marginBottom:10, fontWeight:700 }}>🃏 WILDCARDS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {wildcards.map((p,i)=>(
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'rgba(120,120,255,0.1)', border:'1px solid #2a2a6a', borderRadius:8 }}>
                <span style={{ fontSize:14 }}>🃏</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#f0f0f0' }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'#9a9aff' }}>{p.groupName} · {p.Pts}pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardWrapper>
  )
}

// ── Export card wrapper ───────────────────────────────────────────────────

function ExportCard({ icon, title, description, text, children, filename, multiImage }) {
  const [preview, setPreview] = useState(false)
  const imgRef = useRef(null)

  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      {/* Header row */}
      <div style={{ padding:'16px 20px', borderBottom: preview?'1px solid var(--green-border)':'none', display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:28 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:'Bebas Neue', fontSize:18, letterSpacing:1, color:'var(--gold)', marginBottom:2 }}>{title}</p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>{description}</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', justifyContent:'flex-end' }}>
          <button onClick={()=>setPreview(v=>!v)} style={{
            padding:'6px 12px', borderRadius:8, cursor:'pointer',
            background:'transparent', border:'1px solid var(--green-border)',
            color:'var(--text-muted)', fontSize:12, fontFamily:'Barlow', fontWeight:700,
          }}>
            {preview?'Hide':'Preview'}
          </button>
          {children && !multiImage && <ImageButton targetRef={imgRef} filename={filename} />}
          <CopyButton text={text} label="📋 Text" />
        </div>
      </div>

      {/* Preview pane */}
      {preview && (
        <div style={{ padding:'16px 20px', background:'#020902' }}>
          {children ? (
            multiImage ? (
              // Multi-image: render as-is (each round has its own button)
              <div>{children}</div>
            ) : (
              <div ref={imgRef} style={{ display:'inline-block', minWidth:400, maxWidth:'100%' }}>
                {children}
              </div>
            )
          ) : (
            <pre style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-primary)', lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0, maxHeight:320, overflowY:'auto' }}>
              {text}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main export page ──────────────────────────────────────────────────────

export default function WhatsAppExport({
  players, groups, fixtures, fixtureConfig,
  qualifierConfig, knockoutBracket,
}) {
  const fullText = [
    exportFixtures(groups, players, fixtures, fixtureConfig),
    exportResultsByRound(groups, players, fixtures, fixtureConfig),
    exportGroupStandings(groups, players, fixtures, qualifierConfig),
    exportQualifiers(groups, players, fixtures, qualifierConfig),
    exportKnockoutResults(players, fixtures, knockoutBracket, fixtureConfig),
    exportLeaderboard(players, fixtures),
  ].join('\n\n' + '═'.repeat(32) + '\n\n')

  const exports = [
    {
      icon: '📅', title: 'FIXTURES', filename: 'ea26-fixtures',
      description: 'All group stage fixtures by group and leg.',
      text: exportFixtures(groups, players, fixtures, fixtureConfig),
      card: null,
    },
    {
      icon: '⚽', title: 'MATCH RESULTS BY ROUND', filename: 'ea26-results',
      description: 'One image per round — each group\'s result side by side.',
      text: exportResultsByRound(groups, players, fixtures, fixtureConfig),
      card: <PerRoundResults groups={groups} players={players} fixtures={fixtures} fixtureConfig={fixtureConfig} />,
      multiImage: true,
    },
    {
      icon: '📊', title: 'GROUP STANDINGS', filename: 'ea26-standings',
      description: 'Full standings table for every group.',
      text: exportGroupStandings(groups, players, fixtures, qualifierConfig),
      card: <StandingsCard groups={groups} players={players} fixtures={fixtures} qualifierConfig={qualifierConfig} />,
    },
    {
      icon: '✅', title: 'QUALIFIER LIST', filename: 'ea26-qualifiers',
      description: 'Who advanced — direct qualifiers + wildcards.',
      text: exportQualifiers(groups, players, fixtures, qualifierConfig),
      card: <QualifiersCard groups={groups} players={players} fixtures={fixtures} qualifierConfig={qualifierConfig} />,
    },
    {
      icon: '🏆', title: 'KNOCKOUT RESULTS', filename: 'ea26-knockout',
      description: 'All knockout round results and who advanced.',
      text: exportKnockoutResults(players, fixtures, knockoutBracket, fixtureConfig),
      card: null,
    },
    {
      icon: '🏅', title: 'OVERALL LEADERBOARD', filename: 'ea26-leaderboard',
      description: 'Overall rankings by total points and goals.',
      text: exportLeaderboard(players, fixtures),
      card: <LeaderboardCard players={players} fixtures={fixtures} />,
    },
  ]

  return (
    <div className="fade-up">
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Bebas Neue', fontSize:32, color:'var(--gold)', letterSpacing:2 }}>EXPORT</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          📸 Save Image — downloads a styled PNG to share in WhatsApp.
          &nbsp;&nbsp;📋 Text — copies plain text as backup.
        </p>
      </div>

      {/* Full report text copy */}
      <div style={{
        background:'linear-gradient(135deg,#1a1f00,#0f1400)',
        border:'1px solid var(--gold-dim)', borderRadius:12,
        padding:'18px 20px', marginBottom:28,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap',
      }}>
        <div>
          <p style={{ fontFamily:'Bebas Neue', fontSize:18, color:'var(--gold)', letterSpacing:1, marginBottom:2 }}>📦 FULL TOURNAMENT REPORT</p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Copy all sections as text in one go.</p>
        </div>
        <CopyButton text={fullText} label="📋 Copy Full Report" />
      </div>

      {/* Individual cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {exports.map(e => (
          <ExportCard key={e.title} icon={e.icon} title={e.title}
            description={e.description} text={e.text}
            filename={e.filename} multiImage={e.multiImage}>
            {e.card}
          </ExportCard>
        ))}
      </div>

      <div style={{ marginTop:24, padding:'12px 16px', background:'#0a1a0a', border:'1px solid var(--green-border)', borderRadius:8, fontSize:13, color:'var(--text-muted)' }}>
        💡 Click <strong style={{color:'var(--text-primary)'}}>Preview</strong> first to see how it looks, then <strong style={{color:'var(--gold)'}}>📸 Save Image</strong> to download as PNG.
      </div>
    </div>
  )
}