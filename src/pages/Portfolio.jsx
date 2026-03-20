import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle, Search, X, History, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { searchTicker, getStockQuote, formatMarketCap, getMarketCapCategory } from '../services/stockApi.js'
import { analyzePortfolio } from '../utils/thesisEngine.js'

const COLORS = ['#f5a623','#4f8ef7','#2dd87a','#a855f7','#f05252','#06b6d4','#fbbf24','#34d399','#818cf8','#fb7185']
const STORAGE_KEY = 'galileo_portfolio_v2'
const HISTORY_KEY = 'galileo_history_v1'

function loadPortfolio() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] } }
function savePortfolio(h) { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) }
function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] } }
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)) }

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (value < 5) return null
  return React.createElement('text', {x,y,fill:'white',textAnchor:'middle',dominantBaseline:'central',fontSize:11,fontWeight:600}, value.toFixed(0)+'%')
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState(loadPortfolio)
  const [history, setHistory] = useState(loadHistory)
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('portfolio')
  const [showAdd, setShowAdd] = useState(false)
  const [showSell, setShowSell] = useState(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSugg] = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState(null)
  const [shares, setShares] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [priceLoading, setPriceLoading] = useState(false)
  const [sellShares, setSellShares] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [sellPriceLoading, setSellPriceLoading] = useState(false)
  const debounceRef = useRef(null)

  const refreshPrices = async (h) => {
    const tickers = [...new Set((h||holdings).map(x=>x.ticker))]
    if (!tickers.length) return
    setLoading(true)
    const results = {}
    await Promise.all(tickers.map(async t => {
      try {
        const res = await fetch('/api/quote?ticker='+t)
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        if (meta) results[t] = meta.regularMarketPrice || 0
      } catch {}
    }))
    setPrices(results)
    setLoading(false)
  }

  useEffect(() => { refreshPrices(holdings) }, [])

  useEffect(() => {
    if (query.length < 1) { setSugg([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await searchTicker(query)
      setSugg(res.slice(0,8))
      setShowSugg(true)
    }, 300)
  }, [query])

  const handleSelectTicker = async (ticker, name) => {
    setSelectedTicker({ ticker, name })
    setQuery(ticker)
    setShowSugg(false)
    setSugg([])
    setPriceLoading(true)
    try {
      const res = await fetch('/api/quote?ticker='+ticker)
      const data = await res.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (price) setBuyPrice(price.toFixed(2))
    } catch {}
    setPriceLoading(false)
  }

  const addHolding = () => {
    if (!selectedTicker || !shares || !buyPrice) return
    const newH = { id: Date.now(), ticker: selectedTicker.ticker, name: selectedTicker.name, shares: parseFloat(shares), buyPrice: parseFloat(buyPrice) }
    const updated = [...holdings, newH]
    setHoldings(updated); savePortfolio(updated)
    const entry = { id: Date.now()+1, type: 'buy', ticker: newH.ticker, name: newH.name, shares: newH.shares, price: newH.buyPrice, date: new Date().toLocaleDateString('he-IL'), ts: Date.now() }
    const updH = [entry, ...history]
    setHistory(updH); saveHistory(updH)
    setQuery(''); setSelectedTicker(null); setShares(''); setBuyPrice(''); setShowAdd(false)
    refreshPrices(updated)
  }

  const removeHolding = (id) => {
    const updated = holdings.filter(h=>h.id!==id)
    setHoldings(updated); savePortfolio(updated)
  }

  const openSell = async (holding) => {
    setShowSell(holding)
    setSellShares(holding.shares.toString())
    setSellPriceLoading(true)
    try {
      const res = await fetch('/api/quote?ticker='+holding.ticker)
      const data = await res.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (price) setSellPrice(price.toFixed(2))
    } catch {}
    setSellPriceLoading(false)
  }

  const confirmSell = () => {
    if (!showSell || !sellShares || !sellPrice) return
    const soldShares = parseFloat(sellShares)
    const soldPrice = parseFloat(sellPrice)
    const entry = { id: Date.now(), type: 'sell', ticker: showSell.ticker, name: showSell.name, shares: soldShares, price: soldPrice, buyPrice: showSell.buyPrice, date: new Date().toLocaleDateString('he-IL'), ts: Date.now() }
    const updH = [entry, ...history]
    setHistory(updH); saveHistory(updH)
    let updated
    if (soldShares >= showSell.shares) { updated = holdings.filter(h=>h.id!==showSell.id) }
    else { updated = holdings.map(h=>h.id===showSell.id ? {...h, shares: h.shares - soldShares} : h) }
    setHoldings(updated); savePortfolio(updated)
    setShowSell(null); setSellShares(''); setSellPrice('')
    refreshPrices(updated)
  }

  const totalVal = holdings.reduce((s,h) => s + (prices[h.ticker]||h.buyPrice) * h.shares, 0)

  const enriched = holdings.map(h => {
    const cur = prices[h.ticker] || h.buyPrice
    const val = cur * h.shares
    const cost = h.buyPrice * h.shares
    const pnl = val - cost
    const pnlPct = cost ? (pnl/cost)*100 : 0
    const pct = totalVal ? (val/totalVal)*100 : 0
    return { ...h, cur, val, cost, pnl, pnlPct, pct }
  })

  const analysis = enriched.length > 0 ? analyzePortfolio(enriched.map(h => ({
    ticker: h.ticker, shares: h.shares, buyPrice: h.buyPrice,
    currentPrice: h.cur, marketCap: 0, beta: 1, shortFloat: 0, sharesFloat: 1e9
  }))) : []

  const pieData = enriched.map((h,i) => ({
    name: h.ticker, fullName: (h.name||h.ticker).substring(0,20),
    value: parseFloat(h.pct.toFixed(1)), color: COLORS[i % COLORS.length]
  })).filter(d=>d.value>0)

  const totalPnL = enriched.reduce((s,h)=>s+h.pnl,0)
  const totalCost = enriched.reduce((s,h)=>s+h.cost,0)
  const totalPnLPct = totalCost ? (totalPnL/totalCost)*100 : 0

  const fmtMoney = n => {
    const abs = Math.abs(n)
    const sign = n >= 0 ? '+' : '-'
    if (abs >= 1e6) return sign + '$' + (abs/1e6).toFixed(2) + 'M'
    if (abs >= 1e3) return sign + '$' + (abs/1e3).toFixed(1) + 'K'
    return sign + '$' + abs.toFixed(2)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:10,padding:'10px 14px',fontSize:'.82rem'}}>
      <div style={{fontWeight:700,color:'var(--color-accent)',marginBottom:4}}>{d.name}</div>
      <div style={{color:'var(--color-text-secondary)'}}>{d.fullName}</div>
      <div style={{fontWeight:600,marginTop:2}}>{d.value}%</div>
    </div>
  }

  return (
    <div>
      <div style={{marginBottom:'1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 4px',color:'var(--color-text-primary)'}}>תיק השקעות</h1>
          <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>מעקב, ניתוח ומסחר</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {['portfolio','history'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 16px',borderRadius:9,border:'1px solid',cursor:'pointer',fontFamily:'Heebo,sans-serif',fontWeight:600,fontSize:'.85rem',transition:'all 180ms',background:tab===t?'var(--color-accent)':'transparent',color:tab===t?'#0d0f14':'var(--color-text-secondary)',borderColor:tab===t?'var(--color-accent)':'var(--color-border2)'}}>{t==='portfolio'?'תיק':'היסטוריה'}</button>
          ))}
          {tab==='portfolio' && <button className='btn-primary' onClick={()=>setShowAdd(true)} style={{display:'flex',alignItems:'center',gap:6}}><Plus size={15}/> הוסף</button>}
        </div>
      </div>

      {tab==='portfolio' && <>
        {enriched.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
            {[['שווי תיק','$'+totalVal.toLocaleString('en-US',{maximumFractionDigits:0}),null],['רווח/הפסד',fmtMoney(totalPnL),totalPnL],['תשואה',(totalPnLPct>=0?'+':'')+totalPnLPct.toFixed(1)+'%',totalPnLPct],['פוזיציות',holdings.length+'',null]].map(([l,v,n])=>(
              <div key={l} className='card' style={{padding:'1rem'}}>
                <div style={{fontSize:'.72rem',color:'var(--color-text-muted)',marginBottom:4}}>{l}</div>
                <div style={{fontWeight:800,fontSize:'1.05rem',direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",color:n==null?'var(--color-text-primary)':n>=0?'var(--color-success)':'var(--color-danger)'}}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {enriched.length > 0 && (
          <div className='card' style={{marginBottom:'1.5rem',padding:'1.25rem'}}>
            <h3 style={{margin:'0 0 1rem',fontSize:'.9rem',fontWeight:700}}>חלוקת תיק</h3>
            <div style={{display:'flex',gap:'1.5rem',alignItems:'center',flexWrap:'wrap'}}>
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie data={pieData} cx='50%' cy='50%' outerRadius={95} innerRadius={45} dataKey='value' labelLine={false} label={renderLabel}>
                    {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{flex:1,minWidth:160}}>
                {pieData.map(d=>(
                  <div key={d.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                    <div style={{width:10,height:10,borderRadius:2,background:d.color,flexShrink:0}}/>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.8rem',color:'var(--color-accent)',minWidth:48}}>{d.name}</span>
                    <span style={{fontSize:'.78rem',color:'var(--color-text-secondary)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.fullName}</span>
                    <span style={{fontWeight:700,fontSize:'.8rem',direction:'ltr'}}>{d.value}%</span>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--color-border)',fontSize:'.75rem',color:'var(--color-text-muted)'}}>סה"כ: ${totalVal.toLocaleString('en-US',{maximumFractionDigits:0})}</div>
              </div>
            </div>
          </div>
        )}
        {analysis.length > 0 && (
          <div style={{marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>
            {analysis.map((a,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'.875rem 1rem',borderRadius:10,border:'1px solid',background:a.type==='danger'?'rgba(240,82,82,0.08)':a.type==='warning'?'rgba(245,166,35,0.08)':'rgba(45,216,122,0.08)',borderColor:a.type==='danger'?'rgba(240,82,82,0.25)':a.type==='warning'?'rgba(245,166,35,0.25)':'rgba(45,216,122,0.25)'}}><AlertTriangle size={14} style={{color:a.type==='danger'?'var(--color-danger)':a.type==='warning'?'var(--color-warning)':'var(--color-success)',flexShrink:0,marginTop:2}}/><span style={{fontSize:'.85rem',color:'var(--color-text-secondary)',lineHeight:1.5}}>{a.message}</span></div>
            ))}
          </div>
        )}
        {enriched.length > 0 ? (
          <div className='card' style={{padding:0,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.875rem'}}>
              <thead><tr style={{background:'var(--color-bg2)',borderBottom:'1px solid var(--color-border)'}}>
                {['Ticker','שם','מחיר','קנייה','מניות','שווי','P&L','%',''].map(h=>(<th key={h} style={{padding:'.7rem .875rem',textAlign:'right',fontWeight:600,fontSize:'.75rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>))}
              </tr></thead>
              <tbody>
                {enriched.map(h=>(
                  <tr key={h.id} style={{borderBottom:'1px solid var(--color-border)',transition:'background 150ms'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'.8rem .875rem'}}><span className='ticker-badge'>{h.ticker}</span></td>
                    <td style={{padding:'.8rem .875rem',color:'var(--color-text-secondary)',fontSize:'.8rem',maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',direction:'ltr'}}>{h.name||h.ticker}</td>
                    <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>${h.cur.toFixed(2)}</td>
                    <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-text-muted)',fontSize:'.8rem'}}>${h.buyPrice.toFixed(2)}</td>
                    <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>{h.shares}</td>
                    <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>${h.val.toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                    <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:h.pnl>=0?'var(--color-success)':'var(--color-danger)',fontWeight:600}}>{fmtMoney(h.pnl)}</td>
                    <td style={{padding:'.8rem .875rem'}}><span style={{color:h.pnlPct>=0?'var(--color-success)':'var(--color-danger)',fontWeight:600,direction:'ltr',display:'flex',alignItems:'center',gap:3}}>{h.pnlPct>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{Math.abs(h.pnlPct).toFixed(1)}%</span></td>
                    <td style={{padding:'.8rem .875rem'}}><div style={{display:'flex',gap:5}}>
                      <button onClick={()=>openSell(h)} style={{padding:'3px 10px',borderRadius:6,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.3)',cursor:'pointer',color:'var(--color-accent)',fontSize:'.75rem',fontWeight:700,fontFamily:'Heebo,sans-serif'}}>מכור</button>
                      <button onClick={()=>removeHolding(h.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:3}} onMouseEnter={e=>e.currentTarget.style.color='var(--color-danger)'} onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}><Trash2 size={13}/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}><div style={{fontSize:'3rem',marginBottom:'1rem'}}>📊</div><p style={{margin:'0 0 1rem'}}>התיק ריק. הוסף מניה ראשונה!</p><button className='btn-primary' onClick={()=>setShowAdd(true)} style={{display:'inline-flex',alignItems:'center',gap:6}}><Plus size={14}/> הוסף מניה</button></div>
        )}
      </>}

      {tab==='history' && (
        <div>
          {history.length === 0 ? (
            <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}><History size={40} style={{marginBottom:'1rem',opacity:.3}}/><p style={{margin:0}}>עדיין אין פעולות</p></div>
          ) : (
            <div className='card' style={{padding:0,overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.875rem'}}>
                <thead><tr style={{background:'var(--color-bg2)',borderBottom:'1px solid var(--color-border)'}}>
                  {['סוג','Ticker','שם','מניות','מחיר','שווי','רווח/הפסד','תאריך'].map(h=>(<th key={h} style={{padding:'.7rem .875rem',textAlign:'right',fontWeight:600,fontSize:'.75rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>))}
                </tr></thead>
                <tbody>
                  {history.map(h => {
                    const isSell = h.type==='sell'
                    const val = h.price * h.shares
                    const pnl = isSell ? (h.price-(h.buyPrice||0))*h.shares : null
                    return (
                      <tr key={h.id} style={{borderBottom:'1px solid var(--color-border)'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'.8rem .875rem'}}><span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,fontSize:'.72rem',fontWeight:700,background:isSell?'rgba(240,82,82,0.12)':'rgba(45,216,122,0.12)',color:isSell?'var(--color-danger)':'var(--color-success)'}}>{isSell?<ArrowUpCircle size={11}/>:<ArrowDownCircle size={11}/>}{isSell?'מכירה':'קנייה'}</span></td>
                        <td style={{padding:'.8rem .875rem'}}><span className='ticker-badge'>{h.ticker}</span></td>
                        <td style={{padding:'.8rem .875rem',color:'var(--color-text-secondary)',fontSize:'.8rem',direction:'ltr',maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.name||h.ticker}</td>
                        <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>{h.shares}</td>
                        <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>{'$'+h.price.toFixed(2)}</td>
                        <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{'$'+val.toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                        <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:pnl==null?'var(--color-text-muted)':pnl>=0?'var(--color-success)':'var(--color-danger)',fontWeight:pnl!=null?700:400}}>{pnl!=null?((pnl>=0?'+':'-')+'$'+Math.abs(pnl).toFixed(0)):'—'}</td>
                        <td style={{padding:'.8rem .875rem',color:'var(--color-text-muted)',fontSize:'.8rem'}}>{h.date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}>
          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'2rem',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h3 style={{margin:0,fontSize:'1rem',fontWeight:700}}>הוסף מניה</h3>
              <button onClick={()=>setShowAdd(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4}}><X size={17}/></button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div>
                <label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>חיפוש מניה</label>
                <div style={{position:'relative'}}>
                  <Search size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/>
                  <input className='input input-ticker' value={query} onChange={e=>{setQuery(e.target.value.toUpperCase());setSelectedTicker(null)}} onFocus={()=>suggestions.length>0&&setShowSugg(true)} onBlur={()=>setTimeout(()=>setShowSugg(false),200)} placeholder='AAPL, Tesla...' style={{paddingRight:34}} autoComplete='off'/>
                  {showSugg && suggestions.length > 0 && (
                    <div style={{position:'absolute',top:'calc(100% + 4px)',right:0,left:0,background:'var(--color-surface)',border:'1px solid var(--color-border2)',borderRadius:10,zIndex:200,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
                      {suggestions.map(s=>(
                        <div key={s.ticker} onMouseDown={()=>handleSelectTicker(s.ticker,s.name)} style={{padding:'.6rem 1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:10}} onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.8rem',color:'var(--color-accent)',minWidth:52}}>{s.ticker}</span>
                          <span style={{fontSize:'.8rem',color:'var(--color-text-secondary)'}}>{(s.name||'').substring(0,28)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedTicker && <div style={{marginTop:4,fontSize:'.75rem',color:'var(--color-success)'}}>✓ {selectedTicker.name}</div>}
              </div>
              <div>
                <label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מניות</label>
                <input className='input' type='number' min='0.001' step='any' value={shares} onChange={e=>setShares(e.target.value)} placeholder='10' style={{direction:'ltr'}}/>
              </div>
              <div>
                <label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מחיר קנייה ($) {priceLoading && <span style={{color:'var(--color-accent)',fontSize:'.72rem'}}>טוען...</span>}</label>
                <input className='input' type='number' min='0.01' step='any' value={buyPrice} onChange={e=>setBuyPrice(e.target.value)} placeholder='מחיר שוק' style={{direction:'ltr'}}/>
              </div>
              <button className='btn-accent' onClick={addHolding} disabled={!selectedTicker||!shares||!buyPrice} style={{opacity:(!selectedTicker||!shares||!buyPrice)?.5:1}}>הוסף לתיק</button>
            </div>
          </div>
        </div>
      )}

      {showSell && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={e=>{if(e.target===e.currentTarget)setShowSell(null)}}>
          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'2rem',width:'100%',maxWidth:380,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <h3 style={{margin:0,fontSize:'1rem',fontWeight:700}}>מכור <span className='ticker-badge'>{showSell.ticker}</span></h3>
              <button onClick={()=>setShowSell(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4}}><X size={17}/></button>
            </div>
            <div style={{background:'var(--color-bg2)',borderRadius:9,padding:'.75rem',marginBottom:'1rem',fontSize:'.82rem',color:'var(--color-text-muted)'}}>בתיק: <strong style={{color:'var(--color-text-primary)'}}>{showSell.shares} מניות</strong> קנויות ב-<strong style={{color:'var(--color-text-primary)',direction:'ltr',display:'inline-block'}}>{'$'+showSell.buyPrice.toFixed(2)}</strong></div>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מניות למכירה</label><input className='input' type='number' min='0.001' max={showSell.shares} step='any' value={sellShares} onChange={e=>setSellShares(e.target.value)} style={{direction:'ltr'}}/></div>
              <div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מחיר מכירה ($) {sellPriceLoading && <span style={{color:'var(--color-accent)',fontSize:'.72rem'}}>טוען...</span>}</label><input className='input' type='number' min='0.01' step='any' value={sellPrice} onChange={e=>setSellPrice(e.target.value)} style={{direction:'ltr'}}/></div>
              {sellShares && sellPrice && (() => {
                const pnl = (parseFloat(sellPrice)-showSell.buyPrice)*parseFloat(sellShares)
                return <div style={{background:pnl>=0?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.1)',borderRadius:9,padding:'.75rem',textAlign:'center',border:'1px solid',borderColor:pnl>=0?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.25)',fontSize:'.85rem'}}>רווח/הפסד: <strong style={{color:pnl>=0?'var(--color-success)':'var(--color-danger)',direction:'ltr',display:'inline-block'}}>{pnl>=0?'+':'-'}{'$'+Math.abs(pnl).toFixed(2)}</strong></div>
              })()}
              <button style={{background:'var(--color-danger)',color:'white',fontFamily:'Heebo,sans-serif',fontWeight:700,padding:'.8rem',fontSize:'.9rem',borderRadius:10,border:'none',cursor:'pointer',opacity:(!sellShares||!sellPrice)?.5:1}} disabled={!sellShares||!sellPrice} onClick={confirmSell}>אשר מכירה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}