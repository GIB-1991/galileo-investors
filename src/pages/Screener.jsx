import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, TrendingDown, BarChart2, Activity, DollarSign, Globe, X, Target, Users } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const QUICK = [
  {t:'SPY',n:'S&P 500'},{t:'META',n:'Meta'},{t:'AMZN',n:'Amazon'},
  {t:'GOOGL',n:'Alphabet'},{t:'MSFT',n:'Microsoft'},{t:'TSLA',n:'Tesla'},
  {t:'NVDA',n:'Nvidia'},{t:'AAPL',n:'Apple'},{t:'JPM',n:'JPMorgan'},{t:'QQQ',n:'Nasdaq'},
]

const PERIODS = [
  {label:'5 שנים', range:'5y',  interval:'1mo'},
  {label:'שנה',    range:'1y',  interval:'1wk'},
  {label:'6 חודשים',range:'6mo',interval:'1d'},
  {label:'3 חודשים',range:'3mo',interval:'1d'},
  {label:'חודש',   range:'1mo', interval:'1d'},
  {label:'שבוע',   range:'5d',  interval:'1h'},
  {label:'יום',    range:'1d',  interval:'5m'},
]

const ETF_LIST = ['SPY','QQQ','IVV','VTI','VOO','DIA','GLD','SLV','TLT','IEF','LQD','EEM','VEA','IEFA','IWM','MDY','IJH','IJR','ARKK','ARKG','ARKW','ARKF','ARKQ','SOXX','SMH','XLK','XLF','XLE','XLV','XLP','XLU','XLI','XLB','XLY','XLRE','VNQ','BND','AGG','HYG']

function getCapInfo(mc, qt, sym) {
  // safe ETF check
                  const isETF = qt==='ETF' || qt==='MUTUALFUND' || ETF_LIST.indexOf(String(sym||""))>=0
  if (isETF) return { label:'קרן סל / ETF', tooltip:"קרנות סל גדולות המורכבות ממניות רבות (S&P 500, נאסדק ועוד) — ניתן להחזיק ללא הגבלת חשיפה", pct:"אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): עד 100%", color:'#60a5fa', bg:'rgba(96,165,250,.15)', border:'rgba(96,165,250,.35)' }
  if (!mc) return null
  if (mc >= 1e12) return { label:'מגה קאפ', tooltip:"מגה קאפ: שווי שוק מעל טריליון דולר ($1T+). לדוגמה: Apple, Microsoft, Nvidia, Alphabet", pct:"אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 20%", color:'#2dd87a', bg:'rgba(45,216,122,.13)', border:'rgba(45,216,122,.35)' }
  if (mc >= 5e10) return { label:'לארג׳ קאפ', tooltip:"לארג קאפ: שווי שוק עד 500 מיליארד דולר. חברות גדולות ויציבות כגון JPMorgan, Visa, Mastercard", pct:"אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 10%", color:'#f5a623', bg:'rgba(245,166,35,.13)', border:'rgba(245,166,35,.35)' }
  if (mc >= 1e10) return { label:'סמול קאפ', tooltip:"סמול קאפ: שווי שוק עד 100 מיליארד דולר. מניות צמיחה עם פוטנציאל גבוה וסיכון מוגבר", pct:"אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 5%", color:'#fb923c', bg:'rgba(251,146,60,.13)', border:'rgba(251,146,60,.35)' }
  return { label:'מיקרו קאפ', tooltip:"מיקרו קאפ: שווי שוק של עשרות מיליארדי דולר ומטה. מניות ספקולטיביות עם סיכון גבוה — נדרשת זהירות מיוחדת", pct:"אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 3-4%", color:'#e05252', bg:'rgba(224,82,82,.13)', border:'rgba(224,82,82,.35)' }
}

function fmtN(n, pre='$') {
  const v = parseFloat(n); if (!n && n !== 0 || isNaN(v)) return 'N/A'
  if (Math.abs(v) >= 1e12) return pre+(v/1e12).toFixed(2)+'T'
  if (Math.abs(v) >= 1e9)  return pre+(v/1e9).toFixed(2)+'B'
  if (Math.abs(v) >= 1e6)  return pre+(v/1e6).toFixed(2)+'M'
  if (Math.abs(v) >= 1e3)  return pre+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return pre+v.toFixed(2)
}
function fmtVol(n) {
  const v = parseFloat(n); if (!v||isNaN(v)) return 'N/A'
  if (v>=1e9) return (v/1e9).toFixed(2)+'B'
  if (v>=1e6) return (v/1e6).toFixed(1)+'M'
  if (v>=1e3) return (v/1e3).toFixed(0)+'K'
  return v.toFixed(0)
}
function fmtPct(n) { const v=parseFloat(n); return isNaN(v)?'N/A':(v*100).toFixed(2)+'%' }

export default function Screener() {
  const [query,    setQuery]    = useState('')
  const [sugg,     setSugg]     = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const [stock,    setStock]    = useState(null)
  const [chart,    setChart]    = useState([])
  const [period,   setPeriod]   = useState('3mo')
  const [loading,  setLoading]  = useState(false)
  const [chartLoad,setChartLoad]= useState(false)
  const [err,      setErr]      = useState(null)
  const [rangeReturn, setRangeReturn] = useState(null)
  const debRef  = useRef(null)
  const inputRef= useRef(null)
  const wrapRef = useRef(null)

  useEffect(()=>{
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSugg(false) }
    document.addEventListener('mousedown', h)
    return ()=>document.removeEventListener('mousedown', h)
  },[])

  useEffect(()=>{
    if (!query||query.length<1){setSugg([]);return}
    clearTimeout(debRef.current)
    debRef.current = setTimeout(async()=>{
      try {
        const r = await fetch('/api/search?q='+encodeURIComponent(query))
        const d = await r.json()
        setSugg((d.quotes||[]).filter(q=>q.symbol&&q.quoteType!=='OPTION').slice(0,7))
        setShowSugg(true)
      } catch {}
    }, 260)
  },[query])

  useEffect(()=>{ if (stock) loadChart(stock.symbol, period) },[period])

  function calcReturn(pts) {
    if (pts.length < 2) return null
    const fp = pts.find(x=>x.price)?.price
    const lp = [...pts].reverse().find(x=>x.price)?.price
    return fp && lp && fp > 0 ? (lp - fp) / fp : null
  }

  async function loadStock(ticker) {
    setLoading(true); setErr(null); setShowSugg(false); setSugg([])
    try {
      const r = await fetch('/api/quote?ticker='+encodeURIComponent(ticker)+'&range=3mo&interval=1d')
      const d = await r.json()
      const result = d.chart?.result?.[0]
      if (!result) { setErr('לא נמצאו נתונים עבור '+ticker); setLoading(false); return }
      const meta = result.meta
      const ts   = result.timestamp || []
      const closes = result.indicators?.quote?.[0]?.close || []
      const pts = ts.map((t,i)=>({
        date: new Date(t*1000).toLocaleDateString('he-IL',{month:'short',day:'numeric'}),
        price: closes[i] ? parseFloat(closes[i].toFixed(2)) : null
      })).filter(p=>p.price)
      setChart(pts)
      setRangeReturn(calcReturn(pts))
      setStock(meta)
      setQuery(meta.symbol)
      setPeriod('3mo')
    } catch(e) { setErr('שגיאה: '+e.message) }
    setLoading(false)
  }

  async function loadChart(ticker, p) {
    setChartLoad(true)
    const per = PERIODS.find(x=>x.range===p) || PERIODS[3]
    try {
      const r = await fetch('/api/quote?ticker='+encodeURIComponent(ticker)+'&range='+per.range+'&interval='+per.interval)
      const d = await r.json()
      const result = d.chart?.result?.[0]
      if (!result) { setChartLoad(false); return }
      const ts   = result.timestamp || []
      const closes = result.indicators?.quote?.[0]?.close || []
      const isIntra = per.range==='1d'||per.range==='5d'
      const pts = ts.map((t,i)=>({
        date: new Date(t*1000).toLocaleDateString('he-IL',{month:'short',day:'numeric',...(isIntra?{hour:'2-digit',minute:'2-digit'}:{})}),
        price: closes[i] ? parseFloat(closes[i].toFixed(2)) : null
      })).filter(p=>p.price)
      setChart(pts)
      setRangeReturn(calcReturn(pts))
    } catch {}
    setChartLoad(false)
  }

  function clearAll() {
    setQuery(''); setSugg([]); setShowSugg(false)
    setStock(null); setChart([]); setErr(null); setRangeReturn(null)
    inputRef.current?.focus()
  }

  const price    = parseFloat(stock?.regularMarketPrice || 0)
  const prev     = parseFloat(stock?.chartPreviousClose || price)
  const dayChange= stock?.regularMarketChange ?? (price - prev)
  const dayPct   = stock?.regularMarketChangePercent ?? (prev ? (price-prev)/prev : 0)
  const isUp     = dayChange >= 0
  const rngUp    = (rangeReturn ?? 0) >= 0
  const chartColor = rngUp ? '#2dd87a' : '#e05252'
  const nowUTC=new Date(),dayUTC=nowUTC.getUTCDay(),hUTC=nowUTC.getUTCHours()*60+nowUTC.getUTCMinutes()
  const marketOpen=dayUTC>=1&&dayUTC<=5&&hUTC>=810&&hUTC<1200
  const displayReturn=marketOpen?changePct:rangeReturn
  const displayLabel=marketOpen?'יומי':(PERIODS.find(p=>p.range===period)?.label||period)
  const mc=stock?.marketCap,qt=stock?.quoteType,sym=stock?.symbol||''
  const isETF=qt==='ETF'||qt==='MUTUALFUND'||(sym && ETF_LIST.indexOf(String(sym||""))>=0)
  let capLabel=null,capColor='#f5a623',capBg='rgba(245,166,35,.12)',capBorder='rgba(245,166,35,.3)',capIcon='',capMax=null
  if(isETF){capLabel='קרן סל / ETF';capColor='#60a5fa';capBg='rgba(96,165,250,.12)';capBorder='rgba(96,165,250,.3)';capIcon='📊';capMax='ניתן להחזיק עד 100%'}
  else if(mc>=1e12){capLabel='מגה קאפ';capColor='#2dd87a';capBg='rgba(45,216,122,.12)';capBorder='rgba(45,216,122,.3)';capIcon='🟢';capMax='אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 20%'}
  else if(mc>=5e10){capLabel='לארג׳ קאפ';capColor='#f5a623';capBg='rgba(245,166,35,.12)';capBorder='rgba(245,166,35,.3)';capIcon='🟡';capMax='אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 10%'}
  else if(mc>=1e10){capLabel='סמול קאפ';capColor='#fb923c';capBg='rgba(251,146,60,.12)';capBorder='rgba(251,146,60,.3)';capIcon='🟠';capMax='אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 5%'}
  else if(mc){capLabel='מיקרו קאפ';capColor='#e05252';capBg='rgba(224,82,82,.12)';capBorder='rgba(224,82,82,.3)';capIcon='🔴';capMax='אחוז החשיפה המקס' (לפי תזת המסחר של גלילאו): 3-4%'}
  const startPx  = chart[0]?.price || 0
  const capInfo  = stock ? getCapInfo(stock.marketCap, stock.quoteType, stock.symbol) : null

  const Tip = ({active,payload,label})=>{
    if (!active||!payload?.length) return null
    return (
      <div style={{background:'rgba(8,12,22,.95)',border:'1px solid rgba(245,166,35,.3)',borderRadius:8,padding:'8px 12px'}}>
        <p style={{margin:0,fontSize:'.72rem',color:'rgba(245,166,35,.6)'}}>{label}</p>
        <p style={{margin:'2px 0 0',fontSize:'1rem',fontWeight:700,color:chartColor,fontFamily:'monospace'}}>${payload[0].value?.toFixed(2)}</p>
      </div>
    )
  }

  const Row = ({label,val,color:c})=> val&&val!=='N/A' ? (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
      <span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{label}</span>
      <span style={{fontSize:'.875rem',fontWeight:600,fontFamily:'monospace',color:c||'var(--color-text-primary)'}}>{val}</span>
    </div>
  ) : null

  return (
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      {/* Title */}
      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:800,margin:'0 0 6px'}}>סקרינר מניות</h1>
        <p style={{color:'var(--color-text-muted)',margin:0}}>חפש כל מניה בארה"ב — נתונים בזמן אמת</p>
      </div>

      {/* ── 1. Search bar ── */}
      <div ref={wrapRef} style={{position:'relative',marginBottom:'1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,background:'var(--color-surface)',border:'2px solid '+(showSugg&&sugg.length?'rgba(245,166,35,.55)':'rgba(245,166,35,.2)'),borderRadius:18,padding:'12px 20px',boxShadow:'0 6px 30px rgba(0,0,0,.18)',transition:'border-color 200ms'}}>
          <Search size={22} style={{color:'#f5a623',flexShrink:0}}/>
          <input ref={inputRef} value={query}
            onChange={e=>{setQuery(e.target.value);setShowSugg(true)}}
            onKeyDown={e=>{if(e.key==='Enter'&&query.trim()) loadStock(query.trim().toUpperCase()); if(e.key==='Escape') setShowSugg(false)}}
            onFocus={()=>sugg.length&&setShowSugg(true)}
            placeholder="חפש מניה — AAPL, Tesla, Nvidia..."
            style={{flex:1,background:'none',border:'none',outline:'none',fontSize:'1.2rem',fontWeight:500,color:'var(--color-text-primary)',fontFamily:'inherit',direction:'ltr',textAlign:'left',minWidth:0}}
            autoComplete="off" spellCheck="false"/>
          {query&&<button onClick={clearAll} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4,display:'flex',borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color='#e05252'} onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}><X size={18}/></button>}
          <button onClick={()=>query.trim()&&loadStock(query.trim().toUpperCase())}
            style={{background:'linear-gradient(135deg,#f5a623,#e8901a)',border:'none',borderRadius:12,padding:'9px 22px',color:'#0d0f14',fontWeight:700,fontSize:'.95rem',cursor:'pointer',fontFamily:'inherit',flexShrink:0}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>חפש</button>
        </div>
        {showSugg&&sugg.length>0&&(
          <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--color-surface)',border:'1px solid rgba(245,166,35,.22)',borderRadius:14,zIndex:200,boxShadow:'0 12px 40px rgba(0,0,0,.25)',overflow:'hidden'}}>
            {sugg.map((s,i)=>(
              <div key={i} onMouseDown={e=>{e.preventDefault();setQuery(s.symbol);loadStock(s.symbol)}}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 18px',cursor:'pointer',borderBottom:i<sugg.length-1?'1px solid var(--color-border)':'none',transition:'background 120ms'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(245,166,35,.07)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontWeight:700,fontSize:'.98rem',color:'#f5a623',fontFamily:'monospace',minWidth:56}}>{s.symbol}</span>
                  <span style={{fontSize:'.86rem',color:'var(--color-text-secondary)'}}>{s.shortname||s.longname||''}</span>
                </div>
                <span style={{fontSize:'.72rem',color:'rgba(245,166,35,.55)',background:'rgba(245,166,35,.08)',padding:'2px 8px',borderRadius:6,flexShrink:0}}>{s.exchDisp||''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick picks */}
      {!stock&&!loading&&(
        <>
          <p style={{textAlign:'center',fontSize:'.78rem',fontWeight:600,color:'var(--color-text-muted)',letterSpacing:'.1em',marginBottom:10}}>בחירות מהירות</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:'2.5rem'}}>
            {QUICK.map(q=>(
              <button key={q.t} onClick={()=>{setQuery(q.t);loadStock(q.t)}}
                style={{padding:'8px 16px',borderRadius:20,border:'1px solid var(--color-border)',background:'var(--color-surface)',cursor:'pointer',fontFamily:'inherit',fontSize:'.84rem',display:'flex',alignItems:'center',gap:7,transition:'all 180ms',color:'var(--color-text-secondary)'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(245,166,35,.45)';e.currentTarget.style.color='#f5a623'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.color='var(--color-text-secondary)'}}>
                <span style={{fontWeight:700,fontFamily:'monospace',fontSize:'.82rem'}}>{q.t}</span>
                <span style={{opacity:.65}}>{q.n}</span>
              </button>
            ))}
          </div>
          <div style={{textAlign:'center',padding:'2rem 0',color:'var(--color-text-muted)',opacity:.4}}>
            <Search size={36} style={{marginBottom:10}}/>
            <p style={{margin:0,fontSize:'.9rem'}}>הכנס סמל מניה או שם חברה</p>
          </div>
        </>
      )}

      {loading&&(
        <div style={{textAlign:'center',padding:'5rem 0'}}>
          <div style={{width:44,height:44,border:'3px solid rgba(245,166,35,.2)',borderTop:'3px solid #f5a623',borderRadius:'50%',animation:'spin .75s linear infinite',margin:'0 auto 16px'}}/>
          <p style={{color:'var(--color-text-muted)',margin:0}}>טוען נתונים...</p>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )}

      {err&&!loading&&(
        <div style={{textAlign:'center',padding:'2.5rem',background:'rgba(224,82,82,.07)',border:'1px solid rgba(224,82,82,.2)',borderRadius:14,color:'#e05252'}}>
          <p style={{margin:0}}>{err}</p>
        </div>
      )}

      {/* ── Stock Card ── */}
      {stock&&!loading&&(
        <div style={{animation:'fadeUp .3s ease'}}>
          <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'}</style>

          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:20,padding:'1.5rem 1.75rem',marginBottom:'1rem'}}>

            {/* ── Top row: price (left) + identity (right) ── */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:'1.25rem'}}>

              {/* LEFT: price + daily change */}
              <div>
                <div style={{fontSize:'2.6rem',fontWeight:800,lineHeight:1,fontFamily:'monospace'}}>${price.toFixed(2)}</div>
                {/* ── 8. Daily live return ── */}
                <div style={{marginTop:6,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{
                    fontSize:'1.05rem',fontWeight:700,
                    color: dayChange===0&&dayPct===0 ? 'var(--color-text-muted)' : (isUp?'#2dd87a':'#e05252')
                  }}>
                    {dayChange===0&&dayPct===0 ? 'המסחר טרם נפתח' : ((isUp?'+':'')+dayChange.toFixed(2)+' ('+((isUp?'+':'')+( dayPct*100).toFixed(2))+'%)')}
                  </span>
                </div>
              </div>

              {/* RIGHT: ticker, exchange, name, cap warning */}
              <div style={{textAlign:'right'}}>
                {/* ── 2. Ticker + exchange ── */}
                <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'flex-end',marginBottom:4}}>
                  {stock.exchangeName&&<span style={{fontSize:'.72rem',background:'rgba(245,166,35,.1)',color:'rgba(245,166,35,.7)',padding:'3px 9px',borderRadius:7,border:'1px solid rgba(245,166,35,.2)',fontWeight:600}}>{stock.fullExchangeName||stock.exchangeName}</span>}
                  <h2 style={{margin:0,fontSize:'2rem',fontWeight:800,fontFamily:'monospace',color:'#f5a623',lineHeight:1}}>{stock.symbol}</h2>
                </div>
                {/* ── 3. Company name ── */}
                <p style={{margin:0,fontSize:'1.05rem',color:'var(--color-text-secondary)',fontWeight:500}}>{stock.longName||stock.shortName||''}</p>
                {/* ── 4. Cap warning ── */}
                {capInfo&&(
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:7,justifyContent:'flex-end',flexWrap:'wrap'}}>
                    <span
                        title={capInfo.tooltip||''}
                        style={{fontSize:'.78rem',fontWeight:700,color:capInfo.color,background:capInfo.bg,border:'1px solid '+capInfo.border,padding:'3px 12px',borderRadius:20,cursor:capInfo.tooltip?'help':'default'}}>
                        {capInfo.label}{capInfo.tooltip&&<span style={{fontSize:'.7rem',opacity:.7,marginLeft:2}}>(i)</span>}
                      </span>
                    <span style={{fontSize:'.73rem',color:'var(--color-text-muted)',lineHeight:1.4}}>⚠️ {capInfo.pct}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Period selector + range return (right) ── */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.9rem',flexWrap:'wrap',gap:8}}>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {PERIODS.map(p=>(
                  <button key={p.range} onClick={()=>setPeriod(p.range)}
                    style={{padding:'5px 14px',borderRadius:10,border:'1px solid '+(period===p.range?'rgba(245,166,35,.5)':'var(--color-border)'),background:period===p.range?'rgba(245,166,35,.13)':'transparent',color:period===p.range?'#f5a623':'var(--color-text-muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'.82rem',fontWeight:period===p.range?700:400,transition:'all 150ms'}}>
                    {p.label}
                  </button>
                ))}
              </div>
              {/* ── 5. Range return (right side) ── */}
              {rangeReturn!==null&&(
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:'.78rem',color:'var(--color-text-muted)'}}>{PERIODS.find(p=>p.range===period)?.label||period}:</span>
                  <span style={{fontSize:'1rem',fontWeight:800,fontFamily:'monospace',color:rngUp?'#2dd87a':'#e05252',background:rngUp?'rgba(45,216,122,.12)':'rgba(224,82,82,.12)',border:'1px solid '+(rngUp?'rgba(45,216,122,.3)':'rgba(224,82,82,.3)'),padding:'3px 14px',borderRadius:20}}>
                    {(rngUp?'+':'')+( rangeReturn*100).toFixed(2)+'%'}
                  </span>
                </div>
              )}
            </div>

            {/* ── 6. Chart ── */}
            <div style={{height:230,position:'relative',borderRadius:12,overflow:'hidden'}}>
              {chartLoad&&(
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.12)',zIndex:2}}>
                  <div style={{width:26,height:26,border:'2px solid rgba(245,166,35,.25)',borderTop:'2px solid #f5a623',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                </div>
              )}
              {chart.length>1?(
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{top:6,right:2,bottom:0,left:2}}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={chartColor} stopOpacity={0.28}/>
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{fontSize:10,fill:'var(--color-text-muted)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                    <YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'var(--color-text-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>'$'+v.toFixed(0)} width={58}/>
                    <Tooltip content={<Tip/>} cursor={{stroke:'rgba(245,166,35,.3)',strokeWidth:1}}/>
                    {startPx>0&&<ReferenceLine y={startPx} stroke="rgba(255,255,255,.1)" strokeDasharray="4 4"/>}
                    <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2.2} fill="url(#cg)" dot={false} activeDot={{r:4,fill:chartColor,strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-muted)',fontSize:'.85rem',border:'1px dashed var(--color-border)',borderRadius:12}}>
                  אין נתוני גרף
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom cards ── */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1rem'}}>

            {/* ── Card 1: Price data ── */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <p style={{margin:'0 0 .9rem',fontWeight:700,fontSize:'.82rem',color:'#f5a623',letterSpacing:'.05em'}}>נתוני מחיר</p>
              <Row label="פתיחה"           val={fmtN(stock.regularMarketOpen)}/>
              <Row label="שיא יומי"        val={fmtN(stock.regularMarketDayHigh)}/>
              <Row label="שפל יומי"        val={fmtN(stock.regularMarketDayLow)}/>
              <Row label="שיא 52 שבועות"  val={fmtN(stock.fiftyTwoWeekHigh)}/>
              <Row label="שפל 52 שבועות"  val={fmtN(stock.fiftyTwoWeekLow)}/>
              <Row label="ממוצע 50 יום"   val={fmtN(stock.fiftyDayAverage)}/>
              <Row label="ממוצע 200 יום"  val={fmtN(stock.twoHundredDayAverage)}/>
              {/* 52W Range bar */}
              {stock.fiftyTwoWeekHigh&&stock.fiftyTwoWeekLow&&(()=>{
                const hi=stock.fiftyTwoWeekHigh,lo=stock.fiftyTwoWeekLow
                const pct=Math.min(100,Math.max(0,((price-lo)/(hi-lo))*100))
                return(
                  <div style={{marginTop:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'var(--color-text-muted)',marginBottom:5}}>
                      <span>{fmtN(lo)}</span><span style={{color:'rgba(245,166,35,.7)',fontWeight:600}}>52W Range</span><span>{fmtN(hi)}</span>
                    </div>
                    <div style={{height:6,background:'rgba(255,255,255,.08)',borderRadius:3,position:'relative'}}>
                      <div style={{position:'absolute',top:0,left:0,width:pct+'%',height:'100%',background:'linear-gradient(90deg,#e05252,#f5a623,#2dd87a)',borderRadius:3}}/>
                      <div style={{position:'absolute',top:'50%',left:pct+'%',transform:'translate(-50%,-50%)',width:10,height:10,borderRadius:'50%',background:'#fff',boxShadow:'0 0 5px rgba(0,0,0,.4)'}}/>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* ── Card 2: Fundamentals ── */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <p style={{margin:'0 0 .9rem',fontWeight:700,fontSize:'.82rem',color:'#f5a623',letterSpacing:'.05em'}}>פונדמנטלס</p>
              <Row label="שווי שוק"         val={fmtN(stock.marketCap,'')}/>
              <Row label="P/E Ratio"         val={stock.trailingPE?parseFloat(stock.trailingPE).toFixed(1):'N/A'}/>
              <Row label="P/E Forward"       val={stock.forwardPE?parseFloat(stock.forwardPE).toFixed(1):'N/A'}/>
              <Row label="EPS"               val={fmtN(stock.trailingEps)}/>
              <Row label="Beta"              val={stock.beta?parseFloat(stock.beta).toFixed(2):'N/A'}/>
              <Row label="מניות צפות"       val={fmtVol(stock.sharesOutstanding)}/>
              <Row label="אחוז שורט"        val={stock.shortRatio?parseFloat(stock.shortRatio).toFixed(1)+'%':'N/A'}/>
              <Row label="נפח ממוצע"        val={fmtVol(stock.averageVolume)}/>
              <Row label="נפח מסחר היום"   val={fmtVol(stock.regularMarketVolume)} color={(() => {
                const v = parseFloat(stock.regularMarketVolume), a = parseFloat(stock.averageVolume)
                return (!v||!a) ? 'var(--color-text-primary)' : v > a*1.5 ? '#2dd87a' : v < a*0.5 ? '#e05252' : 'var(--color-text-primary)'
              })()}/>
              <Row label="דיבידנד"          val={stock.dividendYield && parseFloat(stock.dividendYield) > 0 ? (parseFloat(stock.dividendYield)*100).toFixed(2)+'%' : 'לא'}/>
              {stock.dividendRate&&parseFloat(stock.dividendRate)>0&&<Row label="דיבידנד לשנה"   val={fmtN(stock.dividendRate)}/>}
              <Row label="יעד אנליסטים"    val={fmtN(stock.targetMeanPrice)} color="#f5a623"/>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}