import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const fmt = (n) => { const abs = Math.round(Math.abs(n)); const s = abs.toLocaleString('en-US'); return (n < 0 ? '-' : '') + '\u20AA' + s }
const fmtShort = (n) => {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(0) + 'K'
  return Math.round(n).toString()
}

function calcCompound(initial, monthly, rate, years, mgmtFee, depositFee) {
  const r = rate / 100 / 12
  const mf = mgmtFee / 100 / 12
  let balance = initial
  let totalDeposits = initial
  let totalFees = 0
  const yearly = []

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      const dep = monthly * (1 - depositFee / 100)
      balance += dep
      totalDeposits += monthly
      totalFees += monthly * (depositFee / 100)
      balance = balance * (1 + r) - balance * mf
      totalFees += balance * mf / (1 + r - mf)
    }
    yearly.push({
      year: y,
      deposits: Math.round(totalDeposits),
      interest: Math.round(Math.max(0, balance - totalDeposits)),
      balance: Math.round(balance),
      fees: Math.round(totalFees),
    })
  }
  return yearly
}

export default function Calculator() {
  const [initial, setInitial] = useState(10000)
  const [monthly, setMonthly] = useState(1000)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(20)
  const [mgmtFee, setMgmtFee] = useState(0)
  const [depositFee, setDepositFee] = useState(0)

  const data = useMemo(() => calcCompound(initial, monthly, rate, years, mgmtFee, depositFee), [initial, monthly, rate, years, mgmtFee, depositFee])
  const last = data[data.length - 1] || {}
  const totalInterest = (last.balance || 0) - (last.deposits || 0)
  const totalFees = last.fees || 0

  const compareRates = [rate - 2, rate, rate + 2].filter(r => r > 0)
  const compareData = compareRates.map(r => {
    const d = calcCompound(initial, monthly, r, years, mgmtFee, depositFee)
    return { rate: r, final: d[d.length-1]?.balance || 0 }
  })
  const baseline = compareData.find(d => d.rate === rate)?.final || 1

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:10,padding:'10px 14px',fontSize:'.8rem',direction:'rtl'}}>
        <div style={{fontWeight:700,marginBottom:6}}>שנה {label}</div>
        {payload.map((p,i) => (
          <div key={i} style={{color:p.color,marginBottom:2}}>{p.name}: {fmt(p.value)}</div>
        ))}
      </div>
    )
  }

  const inp = (label, value, setter, min, max, step, suffix, hint) => (
    <div style={{marginBottom:'1.25rem'}}>
      <label style={{display:'block',fontSize:'.88rem',fontWeight:600,color:'var(--color-text-primary)',marginBottom:6}}>{label}</label>
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {suffix === 'ils' && <span style={{position:'absolute',right:10,color:'var(--color-text-muted)',fontSize:'.85rem',fontWeight:600}}>₪</span>}
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={e => setter(parseFloat(e.target.value)||0)}
          style={{width:'100%',padding:suffix==='ils'?'10px 32px 10px 10px':'10px 10px 10px 32px',borderRadius:10,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontSize:'1rem',fontFamily:"'IBM Plex Mono',monospace",outline:'none',direction:'ltr',textAlign:'right'}}
        />
        {suffix === '%' && <span style={{position:'absolute',left:10,color:'var(--color-text-muted)',fontSize:'.85rem'}}>%</span>}
      </div>
      {hint && <p style={{margin:'4px 0 0',fontSize:'.75rem',color:'var(--color-text-muted)'}}>{hint}</p>}
    </div>
  )

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px'}}>מחשבון ריבית דריבית</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>חשב כיצד ההשקעה שלך תצמח לאורך זמן</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:'1.5rem',alignItems:'start'}}>

        {/* Left: inputs */}
        <div className="card" style={{padding:'1.5rem'}}>
          <h3 style={{margin:'0 0 1.25rem',fontSize:'.95rem',fontWeight:700,color:'var(--color-text-primary)',fontSize:'1rem',letterSpacing:'.01em'}}>פרטי ההשקעה</h3>
          {inp('השקעה ראשונית', initial, setInitial, 0, 10000000, 1000, 'ils', 'הסכום שאיתו אתה מתחיל היום')}
          {inp('הפקדה חודשית', monthly, setMonthly, 0, 100000, 100, 'ils', 'כמה אתה מתכנן להפקיד כל חודש')}
          {inp('ריבית שנתית', rate, setRate, 0, 50, 0.5, '%', 'תשואה שנתית צפויה על ההשקעה')}
          {inp('תקופת השקעה (שנים)', years, setYears, 1, 50, 1, 'years', 'כמה שנים אתה מתכנן להשקיע')}

          <div style={{borderTop:'1px solid var(--color-border)',paddingTop:'1.25rem',marginTop:'.25rem'}}>
            <h3 style={{margin:'0 0 1rem',fontSize:'.85rem',fontWeight:700,color:'var(--color-text-secondary)',fontSize:'.88rem'}}>דמי ניהול (אופציונלי)</h3>
            {inp('דמי ניהול שנתיים', mgmtFee, setMgmtFee, 0, 5, 0.1, '%', 'אחוז הנגבה שנתית מהיתרה')}
            {inp('עמלת הפקדה', depositFee, setDepositFee, 0, 5, 0.1, '%', 'אחוז המנוכה מכל הפקדה')}
          </div>
        </div>

        {/* Right: results */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

          {/* Summary */}
          <div className="card" style={{padding:'1.25rem'}}>
            <h3 style={{margin:'0 0 1rem',fontSize:'1rem',fontWeight:800,color:'var(--color-text-primary)'}}>סיכום ההשקעה</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                ['סך הפקדות', fmt(last.deposits||0), null],
                ['סך ריבית', fmt(Math.max(0,totalInterest)), 'var(--color-success)'],
                ['דמי ניהול', fmt(totalFees), totalFees>0?'var(--color-danger)':null],
                ['סכום סופי', fmt(last.balance||0), 'var(--color-accent)'],
              ].map(([label, val, color]) => (
                <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",color:color||'var(--color-text-primary)',fontSize:'.95rem'}}>{val}</span>
                  <span style={{fontSize:'.82rem',color:'var(--color-text-muted)'}}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rate comparison */}
          <div className="card" style={{padding:'1.25rem'}}>
            <h3 style={{margin:'0 0 .5rem',fontSize:'1rem',fontWeight:800,color:'var(--color-text-primary)'}}>השפעת שיעור הריבית</h3>
            <p style={{fontSize:'.78rem',color:'var(--color-text-muted)',margin:'0 0 1rem'}}>השוואה בין שיעורי ריבית שונים</p>
            <div style={{display:'flex',gap:12}}>
              {compareData.map(d => {
                const isCurrent = d.rate === rate
                const diff = d.final - baseline
                return (
                  <div key={d.rate} style={{flex:1,padding:'12px',borderRadius:12,background:isCurrent?'rgba(79,142,247,0.12)':'var(--color-bg2)',border:'1px solid '+(isCurrent?'rgba(79,142,247,0.35)':'var(--color-border)'),textAlign:'center'}}>
                    <div style={{fontSize:'1rem',fontWeight:800,color:'var(--color-text-primary)',marginBottom:6}}>{d.rate}%{isCurrent?' (נוכחי)':''}</div>
                    <div style={{fontSize:'1.15rem',fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>₪{Math.round(d.final).toLocaleString('en-US')}</div>
                    {!isCurrent && <div style={{fontSize:'.75rem',color:diff>0?'var(--color-success)':'var(--color-danger)',marginTop:3}}>{diff>0?'+':''}{fmt(diff)}</div>}
                    {isCurrent && <div style={{fontSize:'.72rem',color:'var(--color-accent)',marginTop:3}}>בסיס</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="card" style={{padding:'1.25rem'}}>
            <h3 style={{margin:'0 0 .5rem',fontSize:'1rem',fontWeight:800,color:'var(--color-text-primary)'}}>גרף צמיחה</h3>
            <p style={{fontSize:'.78rem',color:'var(--color-text-muted)',margin:'0 0 1rem'}}>עבר עם העכבר מעל העמודות לפרטים</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} margin={{top:4,right:4,left:0,bottom:0}} barCategoryGap="20%">
                <XAxis dataKey="year" tick={{fontSize:11,fill:'var(--color-text-muted)'}} tickLine={false} axisLine={false}/>
                <YAxis tickFormatter={v => '₪'+Math.round(v).toLocaleString('en-US')} tick={{fontSize:10,fill:'var(--color-text-muted)'}} tickLine={false} axisLine={false} width={58}/>
                <Tooltip content={<CT/>}/>
                <Legend wrapperStyle={{fontSize:'.78rem',paddingTop:8}} formatter={v => v==='deposits'?'סך הפקדות':'ריבית'}/>
                <Bar dataKey="deposits" name="deposits" stackId="a" fill="#4f8ef7" radius={[0,0,0,0]}/>
                <Bar dataKey="interest" name="interest" stackId="a" fill="#2dd87a" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="card" style={{padding:0,overflowX:'auto'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--color-border)'}}>
              <h3 style={{margin:0,fontSize:'1rem',fontWeight:800,color:'var(--color-text-primary)'}}>תחזית לפי שנה</h3>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.82rem'}}>
              <thead>
                <tr style={{background:'var(--color-bg2)'}}>
                  {['שנה','סך הפקדות','דמי ניהול','סך ריבית','יתרה כוללת','רווח שנתי'].map(h => (
                    <th key={h} style={{padding:'.65rem 1rem',textAlign:'right',fontWeight:600,fontSize:'.75rem',color:'var(--color-text-muted)',borderBottom:'1px solid var(--color-border)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const annualEarnings = i > 0 ? row.balance - data[i-1].balance : row.balance - initial
                  return (
                    <tr key={row.year} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'.65rem 1rem',fontWeight:600}}>{row.year}</td>
                      <td style={{padding:'.65rem 1rem',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',textAlign:'right'}}>{fmt(row.deposits)}</td>
                      <td style={{padding:'.65rem 1rem',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',textAlign:'right',color:row.fees>0?'var(--color-danger)':'var(--color-text-muted)'}}>{fmt(row.fees)}</td>
                      <td style={{padding:'.65rem 1rem',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',textAlign:'right',color:'var(--color-success)'}}>{fmt(Math.max(0,row.interest))}</td>
                      <td style={{padding:'.65rem 1rem',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',textAlign:'right',fontWeight:700}}>{fmt(row.balance)}</td>
                      <td style={{padding:'.65rem 1rem',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',textAlign:'right',color:'var(--color-accent)'}}>{fmt(annualEarnings)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}