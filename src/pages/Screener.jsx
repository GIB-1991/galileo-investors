import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, TrendingDown, X, Info } from 'lucide-react'
import { searchTicker, formatMarketCap, getMarketCapCategory } from '../services/stockApi.js'
import { analyzeStockForScreener } from '../utils/thesisEngine.js'

const TIPS = {
  price: 'מחיר המניה הנוכחי בשוק',
  change: 'שינוי אחוזי ביחס לסגירה הקודמת',
  marketCap: 'שווי שוק כולל. Mega Cap > $1T, Large Cap > $200B, Mid Cap > $10B',
  volume: 'נפח מסחר יומי — כמה מניות נסחרו היום',
  avgVolume: 'ממוצע נפח יומי ב-3 חודשים. גבוה מהממוצע = עניין חריג',
  pe: 'מכפיל רווח. מתחת 15 = זול, מעל 30 = יקר',
  forwardPE: 'מכפיל רווח על בסיס תחזיות לשנה הבאה',
  beta: 'תנודתיות ביחס ל-S&P500. Beta 1 = כמו השוק',
  target: 'יעד מחיר ממוצע של אנליסטים לשנה הבאה',
  week52: 'טווח מחיר ב-52 שבועות אחרונים',
  ma50: 'ממוצע נע 50 יום — מגמה קצרת טווח',
  ma200: 'ממוצע נע 200 יום — מגמה ארוכת טווח',
  shortFloat: 'אחוז מניות בשורט. מעל 10% = סיכון לסחיטת שורטיסטים',
}

function TT({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{position:'relative',display:'inline-flex',alignItems:'center',marginRight:4,cursor:'help'}}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <Info size={11} style={{color:'var(--color-text-muted)',opacity:.7}}/>
      {show && (
        <div style={{position:'absolute',bottom:'calc(100% + 6px)',left:'50%',transform:'translateX(-50%)',background:'#1a1d27',border:'1px solid var(--color-border2)',borderRadius:8,padding:'7px 10px',fontSize:'.75rem',color:'var(--color-text-secondary)',whiteSpace:'nowrap',zIndex:999,maxWidth:260,lineHeight:1.5,boxShadow:'0 4px 20px rgba(0,0,0,0.4)',pointerEvents:'none'}}>
          {text}
        </div>
      )}
    </span>
  )
}

function Row({ label, value, tip, color }) {
  if (value == null || value === '') return null
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <span style={{fontSize:'.78rem',color:'var(--color-text-muted)',display:'flex',alignItems:'center',gap:2}}>
        {TIPS[tip] && <TT text={TIPS[tip]}/>}{label}
      </span>
      <span style={{fontSize:'.82rem',fontWeight:600,direction:'ltr',color:color||'var(--color-text-primary)',fontFamily:"'IBM Plex Mono',monospace"}}>{value}</span>
    </div>
  )
}

export default function Screener() {
  const [query, setQuery] = useState('')
  const [suggestions, setSugg] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSugg, setShowSugg] = useState(false)
  const [tips, setTips] = useState([])
  const dRef = useRef(null)

  useEffect(() => {
    if (!query) { setSugg([]); return }
    clearTimeout(dRef.current)
    dRef.current = setTimeout(async () => {
      const r = await searchTicker(query)
      setSugg(r.slice(0,8)); setShowSugg(true)
    }, 280)
  }, [query])

  const pick = async (ticker, name) => {
    setQuery(ticker); setShowSugg(false); setSugg([])
    setLoading(true); setResult(null); setTips([])
    try {
      const res = await fetch('/api/quote?ticker='+ticker)
      const data = await res.json()
      const q = data?.chart?.result?.[0]
      if (!q) { setLoading(false); return }
      const m = q.meta
      const price = m.regularMarketPrice || 0
      const prev = m.previousClose || m.chartPreviousClose || price
      const changePct = prev ? ((price-prev)/prev)*100 : 0
      const stock = {
        ticker, name: name || m.longName || m.shortName || ticker,
        sector: m.sector || m.industry || '',
        industry: m.industry || '',
        price, changePct, change: price-prev,
        marketCap: m.marketCap || 0,
        volume: m.regularMarketVolume || 0,
        avgVolume: m.averageVolume || m.averageVolume10days || 0,
        beta: m.beta || null,
        peRatio: m.trailingPE || null,
        forwardPE: m.forwardPE || null,
        fiftyTwoWeekHigh: m.fiftyTwoWeekHigh || null,
        fiftyTwoWeekLow: m.fiftyTwoWeekLow || null,
        ma50: m.fiftyDayAverage || null,
        ma200: m.twoHundredDayAverage || null,
        analystTarget: m.targetMeanPrice || null,
        shortFloat: m.shortPercentOfFloat ? m.shortPercentOfFloat*100 : null,
      }
      setResult(stock)
      setTips(analyzeStockForScreener(stock))
    } catch(e) {}
    setLoading(false)
  }

  const fp = (n, d=2) => n==null ? null : '$'+Number(n).toFixed(d)
  const fv = v => !v ? null : v>=1e9?(v/1e9).toFixed(2)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':''+v
  const fx = (n, d=1) => n==null ? null : Number(n).toFixed(d)+'x'
  const fb = n => n==null ? null : Number(n).toFixed(2)

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px',color:'var(--color-text-primary)'}}>סקרינר מניות</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>חפש כל מניה הנסחרת בארה"ב — נתונים בזמן אמת</p>
      </div>
      <div style={{position:'relative',marginBottom:'1.25rem'}}>
        <div style={{position:'relative'}}>
          <Search size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)',zIndex:1}}/>
          <input className='input input-ticker' value={query}
            onChange={e=>{ setQuery(e.target.value.toUpperCase()); setResult(null) }}
            onFocus={()=>suggestions.length>0&&setShowSugg(true)}
            onBlur={()=>setTimeout(()=>setShowSugg(false),200)}
            placeholder='AAPL, Tesla, Nvidia...' style={{paddingRight:36}} autoComplete='off'/>
          {showSugg && suggestions.length>0 && (
            <div style={{position:'absolute',top:'calc(100% + 4px)',right:0,left:0,background:'var(--color-surface)',border:'1px solid var(--color-border2)',borderRadius:10,zIndex:200,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
              {suggestions.map(s=>(
                <div key={s.ticker} onMouseDown={()=>pick(s.ticker,s.name)}
                  style={{padding:'.65rem 1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.82rem',color:'var(--color-accent)',minWidth:58}}>{s.ticker}</span>
                    <span style={{fontSize:'.82rem',color:'var(--color-text-secondary)'}}>{(s.name||'').substring(0,35)}</span>
                  </div>
                  {s.changePct!==0 && <span style={{fontSize:'.75rem',fontWeight:600,color:s.changePct>=0?'var(--color-success)':'var(--color-danger)',direction:'ltr'}}>{s.changePct>=0?'+':''}{Number(s.changePct).toFixed(2)}%</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.5rem'}}>
        {['AAPL','MSFT','NVDA','AMZN','TSLA','META','GOOGL','JPM','QQQ','SPY'].map(t=>(
          <button key={t} onClick={()=>pick(t,'')}
            style={{padding:'4px 12px',borderRadius:6,background:'var(--color-surface)',border:'1px solid var(--color-border)',cursor:'pointer',fontSize:'.8rem',fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-accent)',transition:'all 180ms'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--color-accent)';e.currentTarget.style.background='rgba(245,166,35,0.08)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.background='var(--color-surface)'}}>
            {t}
          </button>
        ))}
      </div>
      {loading && <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>טוען נתונים...</div>}
      {!loading && result && (
        <div>
          {tips.length>0 && (
            <div style={{marginBottom:'1rem',display:'flex',flexDirection:'column',gap:6}}>
              {tips.map((tip,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderRadius:9,border:'1px solid',background:tip.color+'18',borderColor:tip.color+'40'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:tip.color,flexShrink:0}}/>
                  <span style={{fontSize:'.83rem',color:'var(--color-text-secondary)'}}>{tip.message}</span>
                </div>
              ))}
            </div>
          )}
          <div className='card' style={{marginBottom:'1rem',padding:'1.25rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <span className='ticker-badge' style={{fontSize:'.95rem',padding:'4px 14px'}}>{result.ticker}</span>
                  {result.sector && <span style={{fontSize:'.78rem',color:'var(--color-text-muted)',background:'var(--color-bg2)',padding:'3px 10px',borderRadius:8,border:'1px solid var(--color-border)'}}>{result.sector}</span>}
                </div>
                <h2 style={{margin:0,fontSize:'1.05rem',fontWeight:700,color:'var(--color-text-primary)',direction:'ltr'}}>{result.name}</h2>
                {result.industry && result.industry!==result.sector && <p style={{margin:'2px 0 0',fontSize:'.78rem',color:'var(--color-text-muted)',direction:'ltr'}}>{result.industry}</p>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'1.8rem',fontWeight:800,direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-text-primary)'}}>${result.price.toFixed(2)}</div>
                <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
                  {result.changePct>=0 ? <TrendingUp size={14} style={{color:'var(--color-success)'}}/> : <TrendingDown size={14} style={{color:'var(--color-danger)'}}/>}
                  <span style={{fontWeight:700,direction:'ltr',color:result.changePct>=0?'var(--color-success)':'var(--color-danger)',fontFamily:"'IBM Plex Mono',monospace"}}>{result.changePct>=0?'+':''}{result.changePct.toFixed(2)}%</span>
                </div>
                <div style={{fontSize:'.75rem',color:'var(--color-text-muted)',marginTop:2}}>{formatMarketCap(result.marketCap)} · {getMarketCapCategory(result.marketCap)}</div>
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1rem'}}>
            <div className='card' style={{padding:'1rem 1.25rem'}}>
              <h4 style={{margin:'0 0 .75rem',fontSize:'.82rem',fontWeight:700,color:'var(--color-accent)',textTransform:'uppercase',letterSpacing:'.06em'}}>מסחר</h4>
              <Row label='מחיר' value={fp(result.price)} tip='price'/>
              <Row label='שינוי' value={(result.changePct>=0?'+':'')+result.changePct.toFixed(2)+'%'} tip='change' color={result.changePct>=0?'var(--color-success)':'var(--color-danger)'}/>
              <Row label='Market Cap' value={formatMarketCap(result.marketCap)} tip='marketCap'/>
              <Row label='Volume' value={fv(result.volume)} tip='volume'/>
              <Row label='Avg Volume (3M)' value={fv(result.avgVolume)} tip='avgVolume'/>
            </div>
            <div className='card' style={{padding:'1rem 1.25rem'}}>
              <h4 style={{margin:'0 0 .75rem',fontSize:'.82rem',fontWeight:700,color:'var(--color-accent)',textTransform:'uppercase',letterSpacing:'.06em'}}>תמחור</h4>
              <Row label='P/E Trailing' value={fx(result.peRatio)} tip='pe'/>
              <Row label='P/E Forward' value={fx(result.forwardPE)} tip='forwardPE'/>
              <Row label='Beta' value={fb(result.beta)} tip='beta'/>
              <Row label='יעד אנליסטים' value={fp(result.analystTarget)} tip='target' color='var(--color-accent)'/>
            </div>
            <div className='card' style={{padding:'1rem 1.25rem'}}>
              <h4 style={{margin:'0 0 .75rem',fontSize:'.82rem',fontWeight:700,color:'var(--color-accent)',textTransform:'uppercase',letterSpacing:'.06em'}}>טווח & היסטוריה</h4>
              <Row label='52W High' value={fp(result.fiftyTwoWeekHigh)} tip='week52' color='var(--color-success)'/>
              <Row label='52W Low' value={fp(result.fiftyTwoWeekLow)} tip='week52' color='var(--color-danger)'/>
              <Row label='MA 50' value={fp(result.ma50)} tip='ma50'/>
              <Row label='MA 200' value={fp(result.ma200)} tip='ma200'/>
              <Row label='Short Float' value={result.shortFloat!=null?result.shortFloat.toFixed(1)+'%':null} tip='shortFloat' color={result.shortFloat>10?'var(--color-danger)':null}/>
            </div>
          </div>
        </div>
      )}
      {!loading && !result && (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)',fontSize:'.875rem'}}>התחל לכתוב ticker או שם חברה לחיפוש</div>
      )}
    </div>
  )
}