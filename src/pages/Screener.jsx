import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, TrendingUp, TrendingDown, BarChart2, Activity, DollarSign, Globe, ChevronDown, X, Star, Clock, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'

const QUICK_PICKS = [
  { ticker:'AAPL', name:'Apple' },
  { ticker:'NVDA', name:'Nvidia' },
  { ticker:'TSLA', name:'Tesla' },
  { ticker:'MSFT', name:'Microsoft' },
  { ticker:'GOOGL', name:'Alphabet' },
  { ticker:'AMZN', name:'Amazon' },
  { ticker:'META', name:'Meta' },
  { ticker:'SPY', name:'S&P 500' },
  { ticker:'QQQ', name:'Nasdaq' },
  { ticker:'JPM', name:'JPMorgan' },
]

const PERIODS = [
  {label:'שבוע', value:'1wk', interval:'1d'},
  {label:'חודש', value:'1mo', interval:'1d'},
  {label:'3 חודשים', value:'3mo', interval:'1d'},
  {label:'שנה', value:'1y', interval:'1wk'},
  {label:'5 שנים', value:'5y', interval:'1mo'},
]

export default function Screener() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [quoteData, setQuoteData] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [period, setPeriod] = useState('3mo')
  const [showSugg, setShowSugg] = useState(false)
  const [error, setError] = useState(null)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Autocomplete
  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/search?q='+encodeURIComponent(query))
        const d = await r.json()
        setSuggestions((d.quotes||[]).slice(0,7))
        setShowSugg(true)
      } catch {}
    }, 280)
  }, [query])

  // Load chart when period changes
  useEffect(() => {
    if (selected) loadChart(selected.symbol, period)
  }, [period])

  async function loadStock(ticker) {
    setLoading(true); setError(null); setSuggestions([]); setShowSugg(false)
    try {
      const r = await fetch('/api/quote?ticker='+encodeURIComponent(ticker))
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      setSelected(d)
      setQuoteData(d)
      setQuery(d.symbol || ticker)
      await loadChart(d.symbol || ticker, period)
    } catch(e) { setError('שגיאה בטעינת נתונים') }
    setLoading(false)
  }

  async function loadChart(ticker, p) {
    setChartLoading(true)
    try {
      const per = PERIODS.find(x=>x.value===p) || PERIODS[2]
      const r = await fetch(`/api/quote?ticker=${ticker}&period=${per.value}&interval=${per.interval}`)
      const d = await r.json()
      const hist = d.history || d.chart || []
      if (hist.length > 1) {
        setChartData(hist.map(h=>({
          date: new Date(h.date||h.t*1000).toLocaleDateString('he-IL',{month:'short',day:'numeric'}),
          price: parseFloat((h.close||h.c||0).toFixed(2))
        })).filter(h=>h.price>0))
      }
    } catch {}
    setChartLoading(false)
  }

  const pct = quoteData ? parseFloat(quoteData.changePercent||0) : 0
  const isUp = pct >= 0
  const chartColor = isUp ? '#2dd87a' : '#e05252'
  const startPrice = chartData.length ? chartData[0].price : 0

  function fmt(n, prefix='$') {
    if (!n && n!==0) return 'N/A'
    const num = parseFloat(n)
    if (isNaN(num)) return 'N/A'
    if (Math.abs(num) >= 1e12) return prefix+(num/1e12).toFixed(2)+'T'
    if (Math.abs(num) >= 1e9) return prefix+(num/1e9).toFixed(2)+'B'
    if (Math.abs(num) >= 1e6) return prefix+(num/1e6).toFixed(2)+'M'
    return prefix+num.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  }

  const CustomTooltip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null
    return (
      <div style={{background:'rgba(13,15,22,0.95)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:8,padding:'8px 12px'}}>
        <p style={{margin:0,fontSize:'.75rem',color:'rgba(245,166,35,0.7)'}}>{label}</p>
        <p style={{margin:'2px 0 0',fontSize:'1rem',fontWeight:700,color:chartColor}}>${payload[0].value?.toFixed(2)}</p>
      </div>
    )
  }

  return (
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:800,margin:'0 0 8px',color:'var(--color-text-primary)'}}>סקרינר מניות</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'1rem'}}>חפש כל מניה בארה"ב — נתונים בזמן אמת</p>
      </div>

      {/* Big Search Bar */}
      <div style={{position:'relative',marginBottom:'1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',background:'var(--color-surface)',border:'2px solid '+(showSugg&&suggestions.length?'rgba(245,166,35,0.5)':'rgba(245,166,35,0.2)'),borderRadius:20,padding:'14px 24px',gap:14,transition:'border-color 200ms',boxShadow:'0 4px 24px rgba(0,0,0,0.15)'}}>
          <Search size={24} style={{color:'#f5a623',flexShrink:0}}/>
          <input
            ref={searchRef}
            value={query}
            onChange={e=>{setQuery(e.target.value);setShowSugg(true)}}
            onKeyDown={e=>{if(e.key==='Enter'&&query) loadStock(query.toUpperCase())}}
            onFocus={()=>suggestions.length&&setShowSugg(true)}
            placeholder="חפש מניה — AAPL, Tesla, Nvidia..."
            style={{flex:1,background:'none',border:'none',outline:'none',fontSize:'1.25rem',fontWeight:500,color:'var(--color-text-primary)',fontFamily:'inherit',direction:'ltr',textAlign:'left'}}
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button onClick={()=>{setQuery('');setSuggestions([]);setShowSugg(false);setSelected(null);setQuoteData(null);setChartData([]);searchRef.current?.focus()}}
              style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4,display:'flex'}}>
              <X size={18}/>
            </button>
          )}
          <button onClick={()=>query&&loadStock(query.toUpperCase())}
            style={{background:'linear-gradient(135deg,#f5a623,#e8901a)',border:'none',borderRadius:12,padding:'8px 20px',color:'#0d0f14',fontWeight:700,fontSize:'.9rem',cursor:'pointer',fontFamily:'inherit',flexShrink:0,transition:'opacity 200ms'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            חפש
          </button>
        </div>

        {/* Autocomplete */}
        {showSugg && suggestions.length > 0 && (
          <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,right:0,background:'var(--color-surface)',border:'1px solid rgba(245,166,35,0.25)',borderRadius:16,overflow:'hidden',zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            {suggestions.map((s,i)=>(
              <div key={i} onClick={()=>{setQuery(s.symbol);loadStock(s.symbol);}}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',cursor:'pointer',borderBottom:i<suggestions.length-1?'1px solid var(--color-border)':'none',transition:'background 150ms'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(245,166,35,0.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div>
                  <span style={{fontWeight:700,fontSize:'1rem',color:'var(--color-text-primary)'}}>{s.symbol}</span>
                  <span style={{marginRight:10,fontSize:'.88rem',color:'var(--color-text-muted)'}}>{s.shortname||s.longname||''}</span>
                </div>
                <span style={{fontSize:'.75rem',color:'rgba(245,166,35,0.6)',background:'rgba(245,166,35,0.08)',padding:'2px 8px',borderRadius:6}}>{s.exchDisp||s.exchange||''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick picks */}
      {!selected && (
        <div style={{marginBottom:'2rem'}}>
          <p style={{fontSize:'.8rem',fontWeight:600,color:'var(--color-text-muted)',marginBottom:10,textAlign:'center',letterSpacing:'.1em'}}>בחירות מהירות</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
            {QUICK_PICKS.map(q=>(
              <button key={q.ticker} onClick={()=>{setQuery(q.ticker);loadStock(q.ticker)}}
                style={{padding:'8px 16px',borderRadius:20,border:'1px solid var(--color-border)',background:'var(--color-surface)',color:'var(--color-text-secondary)',cursor:'pointer',fontFamily:'inherit',fontSize:'.85rem',fontWeight:500,transition:'all 180ms',display:'flex',alignItems:'center',gap:6}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(245,166,35,0.4)';e.currentTarget.style.color='#f5a623'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.color='var(--color-text-secondary)'}}>
                <span style={{fontWeight:700,fontFamily:'monospace'}}>{q.ticker}</span>
                <span style={{fontSize:'.78rem',opacity:.7}}>{q.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}>
          <div style={{width:40,height:40,border:'3px solid rgba(245,166,35,0.2)',borderTop:'3px solid #f5a623',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
          <p style={{margin:0,fontSize:'1rem'}}>טוען נתונים...</p>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{textAlign:'center',padding:'3rem',color:'#e05252',background:'rgba(224,82,82,0.08)',borderRadius:16,border:'1px solid rgba(224,82,82,0.2)'}}>
          <p style={{margin:0,fontSize:'1rem'}}>{error}</p>
        </div>
      )}

      {/* Stock Result */}
      {quoteData && !loading && (
        <div style={{animation:'fadeIn .3s ease'}}>
          <style>{'@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'}</style>

          {/* Hero card */}
          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:20,padding:'1.5rem 2rem',marginBottom:'1rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:12}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
                  <h2 style={{margin:0,fontSize:'2rem',fontWeight:800,fontFamily:'monospace',color:'#f5a623'}}>{quoteData.symbol}</h2>
                  {quoteData.exchange && <span style={{fontSize:'.75rem',background:'rgba(245,166,35,0.1)',color:'rgba(245,166,35,0.7)',padding:'3px 10px',borderRadius:8,border:'1px solid rgba(245,166,35,0.2)',fontWeight:600}}>{quoteData.exchange}</span>}
                </div>
                <p style={{margin:0,fontSize:'1.1rem',color:'var(--color-text-secondary)',fontWeight:500}}>{quoteData.name||quoteData.longName||''}</p>
              </div>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:'2.5rem',fontWeight:800,lineHeight:1,color:'var(--color-text-primary)'}}>${parseFloat(quoteData.price||0).toFixed(2)}</div>
                <div style={{marginTop:6,display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end'}}>
                  <span style={{display:'flex',alignItems:'center',gap:4,fontSize:'1.1rem',fontWeight:700,color:isUp?'#2dd87a':'#e05252'}}>
                    {isUp?<TrendingUp size={18}/>:<TrendingDown size={18}/>}
                    {isUp?'+':''}{pct.toFixed(2)}%
                  </span>
                  <span style={{fontSize:'.9rem',color:isUp?'#2dd87a':'#e05252'}}>{isUp?'+':''}${parseFloat(quoteData.change||0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div>
              <div style={{display:'flex',gap:6,marginBottom:'1rem',flexWrap:'wrap'}}>
                {PERIODS.map(p=>(
                  <button key={p.value} onClick={()=>setPeriod(p.value)}
                    style={{padding:'5px 14px',borderRadius:12,border:'1px solid '+(period===p.value?'rgba(245,166,35,0.5)':'var(--color-border)'),background:period===p.value?'rgba(245,166,35,0.12)':'transparent',color:period===p.value?'#f5a623':'var(--color-text-muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'.8rem',fontWeight:period===p.value?700:400,transition:'all 150ms'}}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{height:220,position:'relative'}}>
                {chartLoading && (
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.1)',borderRadius:12,zIndex:2}}>
                    <div style={{width:24,height:24,border:'2px solid rgba(245,166,35,0.3)',borderTop:'2px solid #f5a623',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                  </div>
                )}
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{top:4,right:4,bottom:0,left:4}}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{fontSize:10,fill:'var(--color-text-muted)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                      <YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'var(--color-text-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>'$'+v.toFixed(0)} width={55}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      {startPrice>0 && <ReferenceLine y={startPrice} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4"/>}
                      <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#chartGrad)" dot={false} activeDot={{r:4,fill:chartColor}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-muted)',fontSize:'.85rem',background:'rgba(245,166,35,0.03)',borderRadius:12,border:'1px dashed var(--color-border)'}}>
                    אין נתוני גרף זמינים
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1rem'}}>
            {/* Price stats */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'1rem',color:'#f5a623'}}>
                <BarChart2 size={16}/>
                <span style={{fontWeight:700,fontSize:'.85rem',letterSpacing:'.05em'}}>מחיר</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  ['פתיחה', fmt(quoteData.open)],
                  ['שיא יומי', fmt(quoteData.dayHigh||quoteData.high)],
                  ['שפל יומי', fmt(quoteData.dayLow||quoteData.low)],
                  ['שיא 52 שבועות', fmt(quoteData.fiftyTwoWeekHigh||quoteData.high52)],
                  ['שפל 52 שבועות', fmt(quoteData.fiftyTwoWeekLow||quoteData.low52)],
                ].map(([label,val])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{label}</span>
                    <span style={{fontSize:'.88rem',fontWeight:600,fontFamily:'monospace'}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fundamentals */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'1rem',color:'#f5a623'}}>
                <Activity size={16}/>
                <span style={{fontWeight:700,fontSize:'.85rem',letterSpacing:'.05em'}}>פונדמנטלס</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  ['שווי שוק', fmt(quoteData.marketCap,'')],
                  ['P/E Ratio', quoteData.trailingPE ? parseFloat(quoteData.trailingPE).toFixed(1) : 'N/A'],
                  ['EPS', quoteData.epsTrailingTwelveMonths ? '$'+parseFloat(quoteData.epsTrailingTwelveMonths).toFixed(2) : 'N/A'],
                  ['תשואת דיבידנד', quoteData.dividendYield ? (parseFloat(quoteData.dividendYield)*100).toFixed(2)+'%' : '0%'],
                  ['ממוצע 50 יום', fmt(quoteData.fiftyDayAverage)],
                ].map(([label,val])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{label}</span>
                    <span style={{fontSize:'.88rem',fontWeight:600,fontFamily:'monospace'}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'1rem',color:'#f5a623'}}>
                <DollarSign size={16}/>
                <span style={{fontWeight:700,fontSize:'.85rem',letterSpacing:'.05em'}}>מסחר</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  ['נפח מסחר', quoteData.volume ? parseInt(quoteData.volume).toLocaleString() : 'N/A'],
                  ['נפח ממוצע', quoteData.averageVolume ? parseInt(quoteData.averageVolume).toLocaleString() : 'N/A'],
                  ['ממוצע 200 יום', fmt(quoteData.twoHundredDayAverage)],
                  ['Beta', quoteData.beta ? parseFloat(quoteData.beta).toFixed(2) : 'N/A'],
                  ['מטבע', quoteData.currency || 'USD'],
                ].map(([label,val])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{label}</span>
                    <span style={{fontSize:'.88rem',fontWeight:600,fontFamily:'monospace'}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {quoteData.longBusinessSummary && (
            <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.75rem',color:'#f5a623'}}>
                <Globe size={16}/>
                <span style={{fontWeight:700,fontSize:'.85rem',letterSpacing:'.05em'}}>על החברה</span>
              </div>
              <p style={{margin:0,fontSize:'.85rem',color:'var(--color-text-secondary)',lineHeight:1.7}}>
                {quoteData.longBusinessSummary.length > 400
                  ? quoteData.longBusinessSummary.substring(0,400)+'...'
                  : quoteData.longBusinessSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selected && !loading && (
        <div style={{textAlign:'center',padding:'3rem 0',color:'var(--color-text-muted)'}}>
          <Search size={40} style={{opacity:.2,marginBottom:12}}/>
          <p style={{margin:0,fontSize:'.95rem'}}>הכנס סמל מניה או שם חברה לחיפוש</p>
        </div>
      )}
    </div>
  )
}