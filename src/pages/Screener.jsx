import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react'
import { searchTicker, getStockQuote, formatMarketCap, getMarketCapCategory } from '../services/stockApi.js'

const CAP_COLORS = {'Mega Cap':'#dcfce7','Large Cap':'#dbeafe','Mid Cap':'#fef3c7','Small Cap':'#fee2e2','ETF':'#ede9fe','Unknown':'#f5f5f4'}
const CAP_TEXT   = {'Mega Cap':'#166534','Large Cap':'#1e40af','Mid Cap':'#92400e','Small Cap':'#991b1b','ETF':'#5b21b6','Unknown':'#555'}

export default function Screener() {
  const [query, setQuery]       = useState('')
  const [suggestions, setSugg]  = useState([])
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)
  const [showSugg, setShowSugg] = useState(false)
  const debounceRef = useRef(null)
  const inputRef    = useRef(null)

  // Autocomplete: search as user types
  useEffect(() => {
    if (query.length < 1) { setSugg([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await searchTicker(query)
      setSugg(res.slice(0, 8))
      setShowSugg(true)
    }, 280)
  }, [query])

  const handleSelect = async (ticker, name) => {
    setQuery(ticker)
    setShowSugg(false)
    setSugg([])
    setLoading(true)
    const data = await getStockQuote(ticker)
    setResults([{ ...data, name: name || data.name }])
    setLoading(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setShowSugg(false)
    setLoading(true)
    const data = await getStockQuote(query.toUpperCase())
    setResults([data])
    setLoading(false)
  }

  const fmt = (n, d=2) => n == null ? 'N/A' : Number(n).toFixed(d)
  const fmtV = (v) => !v ? 'N/A' : v >= 1e9 ? (v/1e9).toFixed(1)+'B' : v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : ''+v

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px',color:'var(--color-text-primary)'}}>סקרינר מניות</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>חפש כל מניה הנסחרת בארה"ב — נתונים בזמן אמת</p>
      </div>

      {/* Search with autocomplete */}
      <div style={{position:'relative',marginBottom:'1.5rem'}}>
        <form onSubmit={handleSearch} style={{display:'flex',gap:'.75rem'}}>
          <div style={{position:'relative',flex:1}}>
            <Search size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)',zIndex:1}}/>
            <input
              ref={inputRef}
              className="input input-ticker"
              value={query}
              onChange={e => setQuery(e.target.value.toUpperCase())}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 200)}
              placeholder="AAPL, TSLA, NVDA..."
              style={{paddingRight:36}}
              autoComplete="off"
            />
            {/* Autocomplete dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div style={{position:'absolute',top:'calc(100% + 4px)',right:0,left:0,background:'var(--color-surface)',border:'1px solid var(--color-border2)',borderRadius:10,zIndex:200,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
                {suggestions.map(s => (
                  <div key={s.ticker} onMouseDown={() => handleSelect(s.ticker, s.name)}
                    style={{padding:'.65rem 1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'background 150ms'}}
                    onMouseEnter={e => e.currentTarget.style.background='var(--color-bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.82rem',color:'var(--color-accent)',minWidth:60}}>{s.ticker}</span>
                      <span style={{fontSize:'.82rem',color:'var(--color-text-secondary)'}}>{(s.name||'').substring(0,35)}</span>
                    </div>
                    {s.changePct !== 0 && (
                      <span style={{fontSize:'.75rem',fontWeight:600,color:s.changePct>=0?'var(--color-success)':'var(--color-danger)',direction:'ltr'}}>
                        {s.changePct>=0?'+':''}{fmt(s.changePct)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading?'טוען...':'חיפוש'}</button>
        </form>
      </div>

      {/* Quick picks */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.5rem'}}>
        {['AAPL','MSFT','NVDA','AMZN','TSLA','META','GOOGL','JPM','QQQ','SPY'].map(t=>(
          <button key={t} onClick={() => handleSelect(t,'')}
            style={{padding:'4px 12px',borderRadius:6,background:'var(--color-surface)',border:'1px solid var(--color-border)',cursor:'pointer',fontSize:'.8rem',fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-accent)',transition:'all 180ms'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--color-accent)';e.currentTarget.style.background='rgba(245,166,35,0.08)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.background='var(--color-surface)'}}>
            {t}
          </button>
        ))}
      </div>

      {/* Results table */}
      {loading && <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>טוען נתונים...</div>}

      {!loading && results.length > 0 && (
        <div>
          <div className="card" style={{padding:0,overflow:'auto',marginBottom:'1rem'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.875rem'}}>
              <thead>
                <tr style={{background:'var(--color-bg2)',borderBottom:'1px solid var(--color-border)'}}>
                  {['Ticker','שם','מגזר','מחיר','שינוי','Market Cap','Volume','P/E','יעד'].map(h=>(
                    <th key={h} style={{padding:'.75rem 1rem',textAlign:'right',fontWeight:600,fontSize:'.78rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(s => {
                  const cat = getMarketCapCategory(s.marketCap)
                  return (
                    <tr key={s.ticker} onClick={()=>setSelected(selected?.ticker===s.ticker?null:s)}
                      style={{borderBottom:'1px solid var(--color-border)',cursor:'pointer',background:selected?.ticker===s.ticker?'var(--color-bg2)':'transparent',transition:'background 150ms'}}
                      onMouseEnter={e=>{ if(selected?.ticker!==s.ticker) e.currentTarget.style.background='rgba(255,255,255,0.02)' }}
                      onMouseLeave={e=>{ if(selected?.ticker!==s.ticker) e.currentTarget.style.background='transparent' }}>
                      <td style={{padding:'.875rem 1rem'}}><span className="ticker-badge">{s.ticker}</span></td>
                      <td style={{padding:'.875rem 1rem',fontWeight:500,direction:'ltr',whiteSpace:'nowrap',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</td>
                      <td style={{padding:'.875rem 1rem',color:'var(--color-text-secondary)',fontSize:'.8rem'}}>{s.sector||'—'}</td>
                      <td style={{padding:'.875rem 1rem',fontWeight:700,direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>${fmt(s.price)}</td>
                      <td style={{padding:'.875rem 1rem'}}>
                        <span style={{display:'flex',alignItems:'center',gap:4,color:s.changePct>=0?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontWeight:600}}>
                          {s.changePct>=0?<TrendingUp size={13}/>:<TrendingDown size={13}/>}{fmt(s.changePct)}%
                        </span>
                      </td>
                      <td style={{padding:'.875rem 1rem'}}>
                        <span style={{background:CAP_COLORS[cat]||'#f5f5f4',color:CAP_TEXT[cat]||'#555',padding:'2px 8px',borderRadius:6,fontSize:'.75rem',fontWeight:600}}>
                          {formatMarketCap(s.marketCap)}
                        </span>
                      </td>
                      <td style={{padding:'.875rem 1rem',direction:'ltr',color:'var(--color-text-secondary)',fontSize:'.8rem'}}>{fmtV(s.volume)}</td>
                      <td style={{padding:'.875rem 1rem',direction:'ltr',color:'var(--color-text-secondary)',fontSize:'.8rem'}}>{s.peRatio?fmt(s.peRatio,1):'—'}</td>
                      <td style={{padding:'.875rem 1rem',direction:'ltr',color:'var(--color-text-secondary)',fontSize:'.8rem'}}>{s.analystTarget?'$'+fmt(s.analystTarget):'—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Detail card */}
          {selected && (
            <div className="card" style={{background:'var(--color-bg2)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
                <h3 style={{margin:0,fontSize:'1rem',fontWeight:700}}>
                  <span className="ticker-badge" style={{marginLeft:8}}>{selected.ticker}</span>
                  {selected.name}
                </h3>
                <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4}}><X size={16}/></button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'1rem'}}>
                {[
                  ['מחיר','$'+fmt(selected.price)],
                  ['שינוי יומי',fmt(selected.changePct)+'%'],
                  ['Market Cap',formatMarketCap(selected.marketCap)],
                  ['Volume',fmtV(selected.volume)],
                  ['P/E Ratio',selected.peRatio?fmt(selected.peRatio,1):'N/A'],
                  ['יעד אנליסטים',selected.analystTarget?'$'+fmt(selected.analystTarget):'N/A'],
                  ['52W High',selected.fiftyTwoWeekHigh?'$'+fmt(selected.fiftyTwoWeekHigh):'N/A'],
                  ['52W Low',selected.fiftyTwoWeekLow?'$'+fmt(selected.fiftyTwoWeekLow):'N/A'],
                ].map(([l,v])=>(
                  <div key={l} style={{background:'var(--color-surface)',borderRadius:10,padding:'.875rem',border:'1px solid var(--color-border)'}}>
                    <div style={{fontSize:'.75rem',color:'var(--color-text-muted)',marginBottom:4}}>{l}</div>
                    <div style={{fontWeight:700,direction:'ltr',textAlign:'right',color:l==='שינוי יומי'?(selected.changePct>=0?'var(--color-success)':'var(--color-danger)'):'var(--color-text-primary)'}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)',fontSize:'.875rem'}}>
          התחל לכתוב ticker או שם חברה לחיפוש
        </div>
      )}
    </div>
  )
}