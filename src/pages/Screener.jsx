import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, TrendingDown, BarChart2, Activity, DollarSign, Globe, X, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const QUICK = [
  {t:'AAPL',n:'Apple'},{t:'NVDA',n:'Nvidia'},{t:'TSLA',n:'Tesla'},
  {t:'MSFT',n:'Microsoft'},{t:'GOOGL',n:'Alphabet'},{t:'AMZN',n:'Amazon'},
  {t:'META',n:'Meta'},{t:'SPY',n:'S&P 500'},{t:'QQQ',n:'Nasdaq'},{t:'JPM',n:'JPMorgan'},
]

const PERIODS = [
  {label:'יום',range:'1d',interval:'5m'},
  {label:'שבוע',range:'5d',interval:'1d'},
  {label:'חודש',range:'1mo',interval:'1d'},
  {label:'3 חודשים',range:'3mo',interval:'1d'},
  {label:'שנה',range:'1y',interval:'1wk'},
]

function fmtNum(n,pre='$'){
  const v=parseFloat(n);
  if(!n&&n!==0||isNaN(v)) return 'N/A';
  if(Math.abs(v)>=1e12) return pre+(v/1e12).toFixed(2)+'T';
  if(Math.abs(v)>=1e9)  return pre+(v/1e9).toFixed(2)+'B';
  if(Math.abs(v)>=1e6)  return pre+(v/1e6).toFixed(2)+'M';
  if(Math.abs(v)>=1e3)  return pre+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  return pre+v.toFixed(2);
}

function fmtVol(n){
  const v=parseFloat(n);
  if(!v||isNaN(v)) return 'N/A';
  if(v>=1e9) return (v/1e9).toFixed(2)+'B';
  if(v>=1e6) return (v/1e6).toFixed(2)+'M';
  if(v>=1e3) return (v/1e3).toFixed(0)+'K';
  return v.toFixed(0);
}

export default function Screener() {
  const [query, setQuery]       = useState('')
  const [sugg, setSugg]         = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const [stock, setStock]       = useState(null)   // meta object
  const [chart, setChart]       = useState([])
  const [period, setPeriod]     = useState('3mo')
  const [loading, setLoading]   = useState(false)
  const [chartLoad, setChartLoad] = useState(false)
  const [err, setErr]           = useState(null)
  const debRef  = useRef(null)
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  // Close suggestions on outside click
  useEffect(()=>{
    const handler = e => { if(wrapRef.current && !wrapRef.current.contains(e.target)) setShowSugg(false) }
    document.addEventListener('mousedown', handler)
    return ()=>document.removeEventListener('mousedown', handler)
  },[])

  // Autocomplete debounce
  useEffect(()=>{
    if(!query||query.length<1){setSugg([]);return}
    clearTimeout(debRef.current)
    debRef.current = setTimeout(async()=>{
      try {
        const r = await fetch('/api/search?q='+encodeURIComponent(query))
        const d = await r.json()
        setSugg((d.quotes||[]).filter(q=>q.symbol&&q.quoteType!=='OPTION').slice(0,7))
        setShowSugg(true)
      } catch {}
    }, 250)
  },[query])

  // Reload chart on period change
  useEffect(()=>{ if(stock) loadChart(stock.symbol, period) },[period])

  async function loadStock(ticker) {
    setLoading(true); setErr(null); setShowSugg(false); setSugg([])
    try {
      const r = await fetch('/api/quote?ticker='+encodeURIComponent(ticker)+'&range=3mo&interval=1d')
      const d = await r.json()
      const result = d.chart?.result?.[0]
      if(!result) { setErr('לא נמצאו נתונים עבור '+ticker); setLoading(false); return }
      const meta = result.meta
      const ts   = result.timestamp || []
      const quotes= result.indicators?.quote?.[0] || {}
      // Build chart data from this call
      const pts = ts.map((t,i)=>({
        date: new Date(t*1000).toLocaleDateString('he-IL',{month:'short',day:'numeric'}),
        price: parseFloat((quotes.close?.[i]||0).toFixed(2))
      })).filter(p=>p.price>0)
      setChart(pts)
      setStock(meta)
      setQuery(meta.symbol)
      setPeriod('3mo')
    } catch(e){ setErr('שגיאה: '+e.message) }
    setLoading(false)
  }

  async function loadChart(ticker, p) {
    setChartLoad(true)
    const per = PERIODS.find(x=>x.range===p)||PERIODS[2]
    try {
      const r = await fetch(`/api/quote?ticker=${encodeURIComponent(ticker)}&range=${per.range}&interval=${per.interval}`)
      const d = await r.json()
      const result = d.chart?.result?.[0]
      if(!result){setChartLoad(false);return}
      const ts = result.timestamp||[]
      const closes = result.indicators?.quote?.[0]?.close||[]
      const pts = ts.map((t,i)=>({
        date: new Date(t*1000).toLocaleDateString('he-IL',{
          month:'short',day:'numeric',
          ...(per.range==='1d'?{hour:'2-digit',minute:'2-digit'}:{})
        }),
        price: parseFloat((closes[i]||0).toFixed(2))
      })).filter(p=>p.price>0)
      setChart(pts)
    } catch {}
    setChartLoad(false)
  }

  function clearSearch(){
    setQuery(''); setSugg([]); setShowSugg(false)
    setStock(null); setChart([]); setErr(null)
    inputRef.current?.focus()
  }

  const price   = stock?.regularMarketPrice || 0
  const prevClose= stock?.chartPreviousClose || price
  const change  = price - prevClose
  const changePct= prevClose ? (change/prevClose)*100 : 0
  const isUp    = change >= 0
  const color   = isUp ? '#2dd87a' : '#e05252'
  const startPx = chart[0]?.price || 0

  const Tip = ({active,payload,label})=>{
    if(!active||!payload?.length) return null
    return (
      <div style={{background:'rgba(8,12,22,0.95)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:8,padding:'8px 12px',backdropFilter:'blur(8px)'}}>
        <p style={{margin:0,fontSize:'.72rem',color:'rgba(245,166,35,.65)'}}>{label}</p>
        <p style={{margin:'2px 0 0',fontSize:'1rem',fontWeight:700,color,fontFamily:'monospace'}}>${payload[0].value?.toFixed(2)}</p>
      </div>
    )
  }

  const StatRow = ({label,val})=>(
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
      <span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{label}</span>
      <span style={{fontSize:'.875rem',fontWeight:600,fontFamily:'monospace',color:'var(--color-text-primary)'}}>{val}</span>
    </div>
  )

  return (
    <div style={{maxWidth:1100,margin:'0 auto'}}>

      {/* ── Header ── */}
      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:800,margin:'0 0 6px'}}>סקרינר מניות</h1>
        <p style={{color:'var(--color-text-muted)',margin:0}}>חפש כל מניה בארה"ב — נתונים בזמן אמת</p>
      </div>

      {/* ── Search bar ── */}
      <div ref={wrapRef} style={{position:'relative',marginBottom:'1.5rem'}}>
        <div style={{
          display:'flex',alignItems:'center',gap:12,
          background:'var(--color-surface)',
          border:'2px solid '+(showSugg&&sugg.length?'rgba(245,166,35,.55)':'rgba(245,166,35,.2)'),
          borderRadius:18,padding:'12px 20px',
          boxShadow:'0 6px 30px rgba(0,0,0,.18)',
          transition:'border-color 200ms'
        }}>
          <Search size={22} style={{color:'#f5a623',flexShrink:0}}/>
          <input
            ref={inputRef}
            value={query}
            onChange={e=>{setQuery(e.target.value);setShowSugg(true)}}
            onKeyDown={e=>{if(e.key==='Enter'&&query.trim()) loadStock(query.trim().toUpperCase()); if(e.key==='Escape') setShowSugg(false)}}
            onFocus={()=>sugg.length&&setShowSugg(true)}
            placeholder="חפש מניה — AAPL, Tesla, Nvidia..."
            style={{flex:1,background:'none',border:'none',outline:'none',fontSize:'1.2rem',fontWeight:500,color:'var(--color-text-primary)',fontFamily:'inherit',direction:'ltr',textAlign:'left',minWidth:0}}
            autoComplete="off" spellCheck="false"
          />
          {query && <button onClick={clearSearch} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4,display:'flex',flexShrink:0,borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color='#e05252'} onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}><X size={18}/></button>}
          <button onClick={()=>query.trim()&&loadStock(query.trim().toUpperCase())}
            style={{background:'linear-gradient(135deg,#f5a623,#e8901a)',border:'none',borderRadius:12,padding:'9px 22px',color:'#0d0f14',fontWeight:700,fontSize:'.95rem',cursor:'pointer',fontFamily:'inherit',flexShrink:0,transition:'opacity 200ms'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.82'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            חפש
          </button>
        </div>

        {/* Suggestions */}
        {showSugg && sugg.length>0 && (
          <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--color-surface)',border:'1px solid rgba(245,166,35,.22)',borderRadius:14,zIndex:200,boxShadow:'0 12px 40px rgba(0,0,0,.25)',overflow:'hidden'}}>
            {sugg.map((s,i)=>(
              <div key={i}
                onMouseDown={e=>{e.preventDefault(); setQuery(s.symbol); loadStock(s.symbol)}}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 18px',cursor:'pointer',borderBottom:i<sugg.length-1?'1px solid var(--color-border)':'none',transition:'background 120ms'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(245,166,35,.07)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontWeight:700,fontSize:'.98rem',color:'#f5a623',fontFamily:'monospace',minWidth:56}}>{s.symbol}</span>
                  <span style={{fontSize:'.86rem',color:'var(--color-text-secondary)'}}>{s.shortname||s.longname||''}</span>
                </div>
                <span style={{fontSize:'.72rem',color:'rgba(245,166,35,.55)',background:'rgba(245,166,35,.08)',padding:'2px 8px',borderRadius:6,flexShrink:0}}>{s.exchDisp||s.exchange||''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick picks ── */}
      {!stock && !loading && (
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
          <div style={{textAlign:'center',padding:'2rem 0',color:'var(--color-text-muted)',opacity:.45}}>
            <Search size={36} style={{marginBottom:10}}/>
            <p style={{margin:0,fontSize:'.9rem'}}>הכנס סמל מניה או שם חברה</p>
          </div>
        </>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{textAlign:'center',padding:'5rem 0'}}>
          <div style={{width:44,height:44,border:'3px solid rgba(245,166,35,.2)',borderTop:'3px solid #f5a623',borderRadius:'50%',animation:'spin .75s linear infinite',margin:'0 auto 16px'}}/>
          <p style={{color:'var(--color-text-muted)',margin:0}}>טוען נתונים...</p>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )}

      {/* ── Error ── */}
      {err && !loading && (
        <div style={{textAlign:'center',padding:'2.5rem',background:'rgba(224,82,82,.07)',border:'1px solid rgba(224,82,82,.2)',borderRadius:14,color:'#e05252'}}>
          <p style={{margin:0}}>{err}</p>
        </div>
      )}

      {/* ── Stock card ── */}
      {stock && !loading && (
        <div style={{animation:'fadeUp .3s ease'}}>
          <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'}</style>

          {/* Hero */}
          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:20,padding:'1.5rem 1.75rem',marginBottom:'1rem'}}>
            
            {/* Top row: name + price */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:'1.25rem'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <h2 style={{margin:0,fontSize:'2rem',fontWeight:800,fontFamily:'monospace',color:'#f5a623',lineHeight:1}}>{stock.symbol}</h2>
                  {stock.exchangeName && <span style={{fontSize:'.72rem',background:'rgba(245,166,35,.1)',color:'rgba(245,166,35,.7)',padding:'3px 9px',borderRadius:7,border:'1px solid rgba(245,166,35,.2)',fontWeight:600}}>{stock.fullExchangeName||stock.exchangeName}</span>}
                </div>
                <p style={{margin:0,fontSize:'1.05rem',color:'var(--color-text-secondary)',fontWeight:500}}>{stock.longName||stock.shortName||''}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'2.6rem',fontWeight:800,lineHeight:1,fontFamily:'monospace'}}>${price.toFixed(2)}</div>
                <div style={{marginTop:6,display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end'}}>
                  <span style={{display:'flex',alignItems:'center',gap:4,fontSize:'1.1rem',fontWeight:700,color}}>
                    {isUp?<TrendingUp size={16}/>:<TrendingDown size={16}/>}
                    {isUp?'+':''}{change.toFixed(2)} ({isUp?'+':''}{changePct.toFixed(2)}%)
                  </span>
                </div>
                <p style={{margin:'4px 0 0',fontSize:'.75rem',color:'var(--color-text-muted)'}}>
                  סגירה קודמת: ${prevClose.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Period selector */}
            <div style={{display:'flex',gap:6,marginBottom:'0.9rem',flexWrap:'wrap'}}>
              {PERIODS.map(p=>(
                <button key={p.range} onClick={()=>setPeriod(p.range)}
                  style={{padding:'5px 14px',borderRadius:10,border:'1px solid '+(period===p.range?'rgba(245,166,35,.5)':'var(--color-border)'),background:period===p.range?'rgba(245,166,35,.13)':'transparent',color:period===p.range?'#f5a623':'var(--color-text-muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'.82rem',fontWeight:period===p.range?700:400,transition:'all 150ms'}}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div style={{height:230,position:'relative',borderRadius:12,overflow:'hidden'}}>
              {chartLoad && (
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.12)',zIndex:2}}>
                  <div style={{width:26,height:26,border:'2px solid rgba(245,166,35,.25)',borderTop:'2px solid #f5a623',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                </div>
              )}
              {chart.length>1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{top:6,right:2,bottom:0,left:2}}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={color} stopOpacity={0.28}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{fontSize:10,fill:'var(--color-text-muted)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                    <YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'var(--color-text-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>'$'+v.toFixed(0)} width={58}/>
                    <Tooltip content={<Tip/>} cursor={{stroke:'rgba(245,166,35,.3)',strokeWidth:1}}/>
                    {startPx>0&&<ReferenceLine y={startPx} stroke="rgba(255,255,255,.1)" strokeDasharray="4 4"/>}
                    <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2.2} fill="url(#cg)" dot={false} activeDot={{r:4,fill:color,strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-muted)',fontSize:'.85rem',border:'1px dashed var(--color-border)',borderRadius:12}}>
                  <Clock size={16} style={{marginLeft:8,opacity:.5}}/> אין נתוני גרף
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1rem',marginBottom:'1rem'}}>

            {/* Price card */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.9rem'}}>
                <BarChart2 size={16} style={{color:'#f5a623'}}/>
                <span style={{fontWeight:700,fontSize:'.82rem',color:'#f5a623',letterSpacing:'.05em'}}>נתוני מחיר</span>
              </div>
              <StatRow label="פתיחה"            val={fmtNum(stock.regularMarketOpen||stock.chartPreviousClose)}/>
              <StatRow label="שיא יומי"         val={fmtNum(stock.regularMarketDayHigh)}/>
              <StatRow label="שפל יומי"         val={fmtNum(stock.regularMarketDayLow)}/>
              <StatRow label="שיא 52 שבועות"   val={fmtNum(stock.fiftyTwoWeekHigh)}/>
              <StatRow label="שפל 52 שבועות"   val={fmtNum(stock.fiftyTwoWeekLow)}/>
            </div>

            {/* Volume card */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.9rem'}}>
                <Activity size={16} style={{color:'#f5a623'}}/>
                <span style={{fontWeight:700,fontSize:'.82rem',color:'#f5a623',letterSpacing:'.05em'}}>מסחר</span>
              </div>
              <StatRow label="נפח מסחר היום"   val={fmtVol(stock.regularMarketVolume)}/>
              <StatRow label="ממוצע 3 חודשים"  val={fmtVol(stock.averageDailyVolume3Month||stock.averageVolume3Month)}/>
              <StatRow label="ממוצע 10 ימים"   val={fmtVol(stock.averageDailyVolume10Day||stock.averageVolume10Day)}/>
              <StatRow label="מטבע"             val={stock.currency||'USD'}/>
              <StatRow label="בורסה"            val={stock.fullExchangeName||stock.exchangeName||'N/A'}/>
            </div>

            {/* Range card */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.9rem'}}>
                <DollarSign size={16} style={{color:'#f5a623'}}/>
                <span style={{fontWeight:700,fontSize:'.82rem',color:'#f5a623',letterSpacing:'.05em'}}>טווח</span>
              </div>
              {(()=>{
                const hi=stock.fiftyTwoWeekHigh||0, lo=stock.fiftyTwoWeekLow||0, cur=price
                const pct=hi>lo?((cur-lo)/(hi-lo))*100:50
                return (
                  <>
                    <StatRow label="מחיר נוכחי" val={fmtNum(price)}/>
                    <div style={{margin:'10px 0'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'.72rem',color:'var(--color-text-muted)',marginBottom:5}}>
                        <span>{fmtNum(lo)}</span>
                        <span style={{fontWeight:600,color:'rgba(245,166,35,.7)'}}>52W Range</span>
                        <span>{fmtNum(hi)}</span>
                      </div>
                      <div style={{height:6,background:'rgba(255,255,255,.08)',borderRadius:3,position:'relative'}}>
                        <div style={{position:'absolute',top:0,left:0,width:pct+'%',height:'100%',background:'linear-gradient(90deg,#e05252,#f5a623,#2dd87a)',borderRadius:3,transition:'width 400ms ease'}}/>
                        <div style={{position:'absolute',top:'50%',left:pct+'%',transform:'translate(-50%,-50%)',width:10,height:10,borderRadius:'50%',background:'#fff',boxShadow:'0 0 6px rgba(0,0,0,.4)'}}/>
                      </div>
                    </div>
                    <StatRow label="קצה שנה" val={(()=>{
                      const yr=chart.find(c=>c)?.price||price
                      const d=((price-yr)/yr*100)
                      return <span style={{color:d>=0?'#2dd87a':'#e05252'}}>{d>=0?'+':''}{d.toFixed(2)}%</span>
                    })()}/>
                    <StatRow label="ממוצע 200 יום" val={fmtNum(stock.twoHundredDayAverage)}/>
                    <StatRow label="ממוצע 50 יום"  val={fmtNum(stock.fiftyDayAverage)}/>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}