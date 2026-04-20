import { useState, useEffect, useRef, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle, Search, X, History, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import { searchTicker } from '../services/stockApi.js'
import { analyzePortfolio, checkStockAlerts } from '../utils/thesisEngine.js'
import { supabase } from '../services/supabase.js'
import { loadHoldingsFromDB, saveHoldingToDB, updateHoldingInDB, deleteHoldingFromDB, loadHistoryFromDB, saveTradeHistoryToDB } from '../services/portfolioDb.js'

const COLORS = ['#f5a623','#4f8ef7','#2dd87a','#a855f7','#f05252','#06b6d4','#fbbf24','#34d399','#818cf8','#fb7185']

export default function Portfolio() {
  const [holdings, setHoldings] = useState([])
  const [history, setHistory] = useState([])
  const [prices, setPrices] = useState({})
  const [sectorMap, setSectorMap] = useState({})
  const [dbLoading, setDbLoading] = useState(true)
  const [tab, setTab] = useState('portfolio')
  const [showAdd, setShowAdd] = useState(false)
  const [showSell, setShowSell] = useState(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSugg] = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const [sel, setSel] = useState(null)
  const [shares, setShares] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [priceLoading, setPriceLoading] = useState(false)
  const [addAlerts, setAddAlerts] = useState([])
  const [finvizData, setFinvizData] = useState(null)
  const [sellShares, setSellShares] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [sellPriceLoading, setSellPriceLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const dRef = useRef(null)

  // Load from Supabase on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      Promise.all([
        loadHoldingsFromDB(user.id),
        loadHistoryFromDB(user.id)
      ]).then(([h, hist]) => {
        setHoldings(h)
        setHistory(hist)
        setDbLoading(false)
        if (h.length > 0) refreshPrices(h)
      })
    })
  }, [])

  const refreshPrices = async (h) => {
    const tickers = [...new Set((h||holdings).map(x=>x.ticker))]
    if (!tickers.length) return
    const r = {}
    await Promise.all(tickers.map(async t => {
      try {
        const res = await fetch('/api/quote?ticker='+t)
        const d = await res.json()
        const p = d?.chart?.result?.[0]?.meta?.regularMarketPrice
        if (p) r[t] = p
      } catch(e) {}
    }))
    setPrices(r)
  }

  useEffect(() => {
    if (!query) { setSugg([]); return }
    clearTimeout(dRef.current)
    dRef.current = setTimeout(async () => {
      const r = await searchTicker(query)
      setSugg(r.slice(0,8)); setShowSugg(true)
    }, 300)
  }, [query])

  // Fetch sectors from Finviz for all holdings
  useEffect(()=>{
    if(!holdings.length) return
    holdings.forEach(h=>{
      fetch('/api/finviz?ticker='+h.ticker)
        .then(r=>r.json())
        .then(fv=>{ if(fv?.sector) setSectorMap(prev=>({...prev,[h.ticker]:fv.sector})) })
        .catch(()=>{})
    })
  }, [holdings.map(h=>h.ticker).join(',')])

  const pickTicker = async (ticker, name) => {
    setSel({ ticker, name }); setQuery(ticker)
    setShowSugg(false); setSugg([])
    setPriceLoading(true)
    try {
      const res = await fetch('/api/quote?ticker='+ticker)
      const d = await res.json()
      const p = d?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (p) setBuyPrice(p.toFixed(2))
    } catch(e) {}
    setPriceLoading(false)
    fetch('/api/finviz?ticker='+ticker).then(r=>r.json()).then(fv=>{
      setFinvizData(fv)
      const st={ticker,name,price:parseFloat(buyPrice)||0,beta:fv.beta,shortFloat:fv.shortFloat,avgVolume:fv.avgVolume,marketCap:fv.marketCap||0}
      setAddAlerts(checkStockAlerts(st,holdings,0,0))
    }).catch(()=>{})
  }

  // Re-run alerts when shares or price changes
  const recomputeAlerts = (sh, bp) => {
    if (!sel || !finvizData) return
    const enrichedStock={...sel, beta:finvizData.beta, shortFloat:finvizData.shortFloat, avgVolume:finvizData.avgVolume, marketCap:finvizData.marketCap||sel.marketCap}
    setAddAlerts(checkStockAlerts(enrichedStock, holdings, parseFloat(sh)||0, parseFloat(bp)||0))
  }

    const addHolding = async () => {
    if (!sel||!shares||!buyPrice||!userId) return
    const newShares = parseFloat(shares)
    const newBuyPrice = parseFloat(buyPrice)
    // Check if ticker already exists — merge instead of creating new row
    const existing = holdings.find(h => h.ticker === sel.ticker)
    let upd
    let saveTicker, saveName, saveShares, savePrice
    if (existing) {
      const mergedShares = existing.shares + newShares
      await updateHoldingInDB(existing.id, mergedShares)
      upd = holdings.map(h => h.id === existing.id ? {...h, shares: mergedShares} : h)
      setHoldings(upd)
      saveTicker=existing.ticker; saveName=existing.name; saveShares=newShares; savePrice=newBuyPrice
    } else {
      const holding = { ticker:sel.ticker, name:sel.name, shares:newShares, buyPrice:newBuyPrice }
      const saved = await saveHoldingToDB(userId, holding)
      if (!saved) return
      upd = [...holdings, saved]
      setHoldings(upd)
      saveTicker=saved.ticker; saveName=saved.name; saveShares=saved.shares; savePrice=saved.buyPrice
    }
    // Save trade history
    const entry = { type:'buy', ticker:saveTicker, name:saveName, shares:saveShares, price:savePrice, buyPrice:null, date:new Date().toLocaleDateString('he-IL') }
    await saveTradeHistoryToDB(userId, entry)
    const newHist = await loadHistoryFromDB(userId)
    setHistory(newHist)
    setQuery(''); setSel(null); setShares(''); setBuyPrice(''); setShowAdd(false); setAddAlerts([]); setFinvizData(null); setAddAlerts([]); setFinvizData(null)
    refreshPrices(upd)
  }

  const removeHolding = async (id) => {
    await deleteHoldingFromDB(id)
    const upd = holdings.filter(h=>h.id!==id)
    setHoldings(upd)
  }

  const openSell = async (holding) => {
    setShowSell(holding); setSellShares(holding.shares.toString())
    setSellPriceLoading(true)
    try {
      const res = await fetch('/api/quote?ticker='+holding.ticker)
      const d = await res.json()
      const p = d?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (p) setSellPrice(p.toFixed(2))
    } catch(e) {}
    setSellPriceLoading(false)
  }

  const confirmSell = async () => {
    if (!showSell||!sellShares||!sellPrice||!userId) return
    const ss = parseFloat(sellShares), sp = parseFloat(sellPrice)
    // Save sell to history
    await saveTradeHistoryToDB(userId, { type:'sell', ticker:showSell.ticker, name:showSell.name, shares:ss, price:sp, buyPrice:showSell.buyPrice, date:new Date().toLocaleDateString('he-IL') })
    // Update or delete holding
    if (ss >= showSell.shares) {
      await deleteHoldingFromDB(showSell.id)
      setHoldings(holdings.filter(h=>h.id!==showSell.id))
    } else {
      const newShares = showSell.shares - ss
      await updateHoldingInDB(showSell.id, newShares)
      setHoldings(holdings.map(h=>h.id===showSell.id?{...h,shares:newShares}:h))
    }
    const newHist = await loadHistoryFromDB(userId)
    setHistory(newHist)
    setShowSell(null); setSellShares(''); setSellPrice('')
  }
  const totalVal = holdings.reduce((s,h)=>s+(prices[h.ticker]||h.buyPrice)*h.shares,0)
  const enriched = holdings.map(h=>{
    const cur=prices[h.ticker]||h.buyPrice, val=cur*h.shares, cost=h.buyPrice*h.shares
    const pnl=val-cost, pnlPct=cost?(pnl/cost)*100:0, pct=totalVal?(val/totalVal)*100:0
    return {...h,cur,val,cost,pnl,pnlPct,pct}
  })
  const tips = enriched.length>0 ? analyzePortfolio(enriched.map(h=>({ticker:h.ticker,shares:h.shares,buyPrice:h.buyPrice,currentPrice:h.cur,marketCap:0,beta:1,shortFloat:0,sharesFloat:1e9}))) : []
  const pieData = enriched.map((h,i)=>({name:h.ticker,fullName:(h.name||h.ticker).substring(0,18),value:parseFloat(h.pct.toFixed(1)),color:COLORS[i%COLORS.length]})).filter(d=>d.value>0)
  // Sector pie data
  const sectorColors=['#f5a623','#4f8ef7','#2dd87a','#a855f7','#f05252','#14b8a6','#f97316','#8b5cf6','#06b6d4','#ec4899']
  const sectorPieData=useMemo(()=>{
      const totalV=holdings.reduce((s,h)=>s+(prices[h.ticker]||h.buyPrice||0)*h.shares,0)
      if(!totalV) return []
      const map={}
      holdings.forEach(h=>{
        const sec=sectorMap[h.ticker]; if(!sec) return
        map[sec]=(map[sec]||0)+(prices[h.ticker]||h.buyPrice||0)*h.shares
      })
      return Object.entries(map).map(([name,value],i)=>({
        name,value:parseFloat(value.toFixed(2)),
        pct:((value/totalV)*100).toFixed(1),
        color:sectorColors[i%sectorColors.length]
      })).sort((a,b)=>b.value-a.value)
  },[holdings,prices,sectorMap])

  const totalPnL = enriched.reduce((s,h)=>s+h.pnl,0)
  const totalCost = enriched.reduce((s,h)=>s+h.cost,0)
  const totalPnLPct = totalCost?(totalPnL/totalCost)*100:0
  const fm = (n) => { const a=Math.abs(n),sg=n>=0?'+':'-'; if(a>=1e6) return sg+'$'+(a/1e6).toFixed(2)+'M'; if(a>=1e3) return sg+'$'+(a/1e3).toFixed(1)+'K'; return sg+'$'+a.toFixed(2) }
  const CT = ({ active, payload }) => {
    if (!active||!payload?.length) return null
    const d = payload[0].payload
    return <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:9,padding:'8px 12px',fontSize:'.8rem'}}><div style={{fontWeight:700,color:'var(--color-accent)'}}>{d.name}</div><div style={{color:'var(--color-text-secondary)',fontSize:'.75rem'}}>{d.fullName}</div><div style={{fontWeight:600}}>{d.value}%</div></div>
  }

  if (dbLoading) return (
    <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}>
      <RefreshCw size={24} style={{marginBottom:'1rem',opacity:.5,animation:'spin 1s linear infinite'}}/>
      <p style={{margin:0}}>טוען תיק מהענן...</p>
    </div>
  )

  return (
    <div>
      <div style={{marginBottom:'1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 4px'}}>תיק השקעות</h1><p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>מעקב, ניתוח ומסחר · שמור בענן ☁️</p></div>
        <div style={{display:'flex',gap:8}}>
          {['portfolio','history'].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{padding:'7px 16px',borderRadius:9,border:'1px solid',cursor:'pointer',fontFamily:'Heebo,sans-serif',fontWeight:600,fontSize:'.85rem',background:tab===t?'var(--color-accent)':'transparent',color:tab===t?'#0d0f14':'var(--color-text-secondary)',borderColor:tab===t?'var(--color-accent)':'var(--color-border2)'}}>{t==='portfolio'?'תיק':'היסטוריה'}</button>))}
          {tab==='portfolio'&&<button onClick={()=>setShowAdd(true)} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#f5a623 0%,#e8941a 100%)',color:'#fff',border:'none',borderRadius:'0.6rem',padding:'0.55rem 1.1rem',fontSize:'0.9rem',fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px rgba(245,166,35,0.35)',transition:'transform .15s,box-shadow .15s',direction:'rtl'}} onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.boxShadow='0 4px 14px rgba(245,166,35,0.5)'}} onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(245,166,35,0.35)'}}><Plus size={16}/> הוסף מניה</button>}
          <button onClick={()=>refreshPrices()} title="רענן מחירים" style={{background:'none',border:'1px solid var(--color-border)',borderRadius:9,cursor:'pointer',color:'var(--color-text-muted)',padding:'7px 10px',display:'flex',alignItems:'center'}}><RefreshCw size={14}/></button>
        </div>
      </div>      {tab==='portfolio' && (<div>
        {enriched.length>0&&(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
          {[['שווי תיק','$'+totalVal.toLocaleString('en-US',{maximumFractionDigits:0}),null],['רווח/הפסד',fm(totalPnL),totalPnL],['תשואה',(totalPnLPct>=0?'+':'')+totalPnLPct.toFixed(1)+'%',totalPnLPct],['פוזיציות',''+holdings.length,null]].map(([l,v,n])=>(<div key={l} className="card" style={{padding:'1rem'}}><div style={{fontSize:'.72rem',color:'var(--color-text-muted)',marginBottom:4}}>{l}</div><div style={{fontWeight:800,fontSize:'1.05rem',direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",color:n==null?'var(--color-text-primary)':n>=0?'var(--color-success)':'var(--color-danger)'}}>{v}</div></div>))}
        </div>)}
        {pieData.length>0&&(<div className="card" style={{marginBottom:'1.5rem',padding:'1.25rem'}}><h3 style={{margin:'0 0 1rem',fontSize:'.9rem',fontWeight:700}}>חלוקת תיק</h3><div style={{display:'flex',gap:'1.5rem',alignItems:'center',flexWrap:'wrap'}}><ResponsiveContainer width={200} height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value">{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip content={<CT/>}/></PieChart></ResponsiveContainer><div style={{flex:1,minWidth:160}}>{pieData.map(d=>(<div key={d.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}><div style={{width:10,height:10,borderRadius:2,background:d.color,flexShrink:0}}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.8rem',color:'var(--color-accent)',minWidth:48}}>{d.name}</span><span style={{fontSize:'.78rem',color:'var(--color-text-secondary)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.fullName}</span><span style={{fontWeight:700,fontSize:'.8rem',direction:'ltr'}}>{d.value}%</span></div>))}</div></div></div>)}
        {(()=>{ const hasSectors=sectorPieData&&sectorPieData.length>0; const displayData=hasSectors?sectorPieData:[{name:'טוען סקטורים...',value:1,color:'#d1d5db',pct:'0'}]; return (<div style={{background:'var(--color-surface)',borderRadius:'1rem',padding:'1.25rem',marginBottom:'1.5rem'}}>
          <h3 style={{margin:'0 0 1rem',fontSize:'.9rem',fontWeight:700,color:'var(--color-text)'}}>חלוקה לפי סקטורים</h3>
          <div style={{display:'flex',gap:'1.5rem',alignItems:'center',flexWrap:'wrap',direction:'ltr'}}>
            <div style={{width:200,height:200,flexShrink:0}}>
              <ResponsiveContainer width="100%" height="100%"><PieChart>
                <Pie data={displayData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value">
                  {displayData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.length) return null
                  const d=payload[0].payload
                  return(<div style={{background:'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:8,padding:'8px 12px',fontSize:'.82rem',direction:'rtl'}}><div style={{fontWeight:700}}>{d.name}</div><div>{d.pct}%</div></div>)
                }}/>
              </PieChart></ResponsiveContainer>
            </div>
            <div style={{flex:1,minWidth:140}}>{displayData.map(d=>(<div key={d.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div style={{width:10,height:10,borderRadius:2,background:d.color,flexShrink:0}}/>
              <span style={{fontSize:'.82rem',flex:1,color:'var(--color-text)'}}>{d.name}</span>
              <span style={{fontSize:'.82rem',fontWeight:700,color:'var(--color-text-muted)',minWidth:42,textAlign:'left'}}>{d.pct}%</span>
            </div>))}</div>
          </div>
        </div>)})()}
        {tips.length>0&&(<div style={{marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>{tips.map((a,i)=>(<div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'.875rem 1rem',borderRadius:10,border:'1px solid',background:a.type==='danger'?'rgba(240,82,82,0.08)':a.type==='warning'?'rgba(245,166,35,0.08)':'rgba(45,216,122,0.08)',borderColor:a.type==='danger'?'rgba(240,82,82,0.25)':a.type==='warning'?'rgba(245,166,35,0.25)':'rgba(45,216,122,0.25)'}}><AlertTriangle size={14} style={{color:a.type==='danger'?'var(--color-danger)':a.type==='warning'?'var(--color-warning)':'var(--color-success)',flexShrink:0,marginTop:2}}/><span style={{fontSize:'.9rem',color:'#ffffff',fontWeight:'700',lineHeight:1.4}}>{a.message}</span></div>))}</div>)}
        {enriched.length>0 ? (
          <div className="card" style={{padding:0,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.875rem'}}>
              <thead><tr style={{background:'var(--color-bg2)',borderBottom:'1px solid var(--color-border)'}}>{['Ticker','שם','מחיר','קנייה','מניות','שווי','P&L','%',''].map(h=>(<th key={h} style={{padding:'.7rem .875rem',textAlign:'right',fontWeight:600,fontSize:'.75rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>))}</tr></thead>
              <tbody>{enriched.map(row=>(
                <tr key={row.id} style={{borderBottom:'1px solid var(--color-border)'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'.8rem .875rem'}}><span className="ticker-badge">{row.ticker}</span></td>
                  <td style={{padding:'.8rem .875rem',color:'var(--color-text-secondary)',fontSize:'.8rem',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',direction:'ltr'}}>{row.name||row.ticker}</td>
                  <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>${row.cur.toFixed(2)}</td>
                  <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-text-muted)',fontSize:'.8rem'}}>${row.buyPrice.toFixed(2)}</td>
                  <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>{row.shares}</td>
                  <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>${row.val.toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                  <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:row.pnl>=0?'var(--color-success)':'var(--color-danger)',fontWeight:600}}>{fm(row.pnl)}</td>
                  <td style={{padding:'.8rem .875rem'}}><span style={{color:row.pnlPct>=0?'var(--color-success)':'var(--color-danger)',fontWeight:600,direction:'ltr',display:'flex',alignItems:'center',gap:3}}>{row.pnlPct>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{Math.abs(row.pnlPct).toFixed(1)}%</span></td>
                  <td style={{padding:'.8rem .875rem'}}><div style={{display:'flex',gap:5}}>
                    <button onClick={()=>openSell(row)} style={{padding:'3px 10px',borderRadius:6,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.3)',cursor:'pointer',color:'var(--color-accent)',fontSize:'.75rem',fontWeight:700,fontFamily:'Heebo,sans-serif'}}>מכור</button>
                    <button onClick={()=>removeHolding(row.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:3}} onMouseEnter={e=>e.currentTarget.style.color='var(--color-danger)'} onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}><Trash2 size={13}/></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}><div style={{fontSize:'3rem',marginBottom:'1rem'}}>📊</div><p style={{margin:'0 0 1rem'}}>התיק ריק. הוסף מניה ראשונה!</p><button className="btn-primary" onClick={()=>setShowAdd(true)} style={{display:'inline-flex',alignItems:'center',gap:6}}><Plus size={14}/> הוסף מניה</button></div>
        )}
      </div>)}      {tab==='history' && (history.length===0 ? (
        <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}><History size={40} style={{marginBottom:'1rem',opacity:.3}}/><p style={{margin:0}}>עדיין אין פעולות</p></div>
      ) : (
        <div className="card" style={{padding:0,overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.875rem'}}>
            <thead><tr style={{background:'var(--color-bg2)',borderBottom:'1px solid var(--color-border)'}}>{['סוג','Ticker','שם','מניות','מחיר','שווי','רווח/הפסד','תאריך'].map(h=>(<th key={h} style={{padding:'.7rem .875rem',textAlign:'right',fontWeight:600,fontSize:'.75rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>))}</tr></thead>
            <tbody>{history.map(item=>{
              const isSell=item.type==='sell', val=item.price*item.shares, pnl=isSell?(item.price-(item.buyPrice||0))*item.shares:null
              return (<tr key={item.id} style={{borderBottom:'1px solid var(--color-border)'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'.8rem .875rem'}}><span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,fontSize:'.72rem',fontWeight:700,background:isSell?'rgba(240,82,82,0.12)':'rgba(45,216,122,0.12)',color:isSell?'var(--color-danger)':'var(--color-success)'}}>{isSell?<ArrowUpCircle size={11}/>:<ArrowDownCircle size={11}/>}{isSell?'מכירה':'קנייה'}</span></td>
                <td style={{padding:'.8rem .875rem'}}><span className="ticker-badge">{item.ticker}</span></td>
                <td style={{padding:'.8rem .875rem',color:'var(--color-text-secondary)',fontSize:'.8rem',direction:'ltr',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name||item.ticker}</td>
                <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>{item.shares}</td>
                <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>{'$'+item.price.toFixed(2)}</td>
                <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{'$'+val.toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                <td style={{padding:'.8rem .875rem',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace",color:pnl==null?'var(--color-text-muted)':pnl>=0?'var(--color-success)':'var(--color-danger)',fontWeight:pnl!=null?700:400}}>{pnl!=null?((pnl>=0?'+':'-')+'$'+Math.abs(pnl).toFixed(0)):'—'}</td>
                <td style={{padding:'.8rem .875rem',color:'var(--color-text-muted)',fontSize:'.8rem'}}>{item.date}</td>
              </tr>)
            })}</tbody>
          </table>
        </div>
      ))}

              
      {showAdd&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={()=>setShowAdd(false)}><div onClick={e=>e.stopPropagation()} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'2rem',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}><h3 style={{margin:0,fontWeight:700}}>הוסף מניה</h3><button onClick={()=>setShowAdd(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)'}}><X size={17}/></button></div><div style={{display:'flex',flexDirection:'column',gap:'1rem',overflowY:'auto',maxHeight:'90vh'}}><div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>חיפוש מניה</label><div style={{position:'relative'}}><Search size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/><input className="input input-ticker" value={query} onChange={e=>{setQuery(e.target.value.toUpperCase());setSel(null)}} onFocus={()=>suggestions.length>0&&setShowSugg(true)} onBlur={()=>setTimeout(()=>setShowSugg(false),200)} placeholder="AAPL, Tesla..." style={{paddingRight:34}} autoComplete="off"/>{showSugg&&suggestions.length>0&&(<div style={{position:'absolute',top:'calc(100% + 4px)',right:0,left:0,background:'var(--color-surface)',border:'1px solid var(--color-border2)',borderRadius:10,zIndex:200,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>{suggestions.map(s=>(<div key={s.ticker} onMouseDown={()=>pickTicker(s.ticker,s.name)} style={{padding:'.6rem 1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:10}} onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.8rem',color:'var(--color-accent)',minWidth:52}}>{s.ticker}</span><span style={{fontSize:'.8rem',color:'var(--color-text-secondary)'}}>{(s.name||'').substring(0,28)}</span></div>))}</div>)}</div>{sel&&<div style={{marginTop:4,fontSize:'.75rem',color:'var(--color-success)'}}>&#10003; {sel.name}</div>}</div><div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מניות</label><input className="input" type="number" value={shares} onChange={e=>{setShares(e.target.value);recomputeAlerts(e.target.value,buyPrice)}} onBlur={e=>recomputeAlerts(e.target.value,buyPrice)} placeholder="10" style={{direction:'ltr'}}/></div><div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מחיר קנייה ($) {priceLoading&&<span style={{color:'var(--color-accent)',fontSize:'.72rem'}}>טוען...</span>}</label><input className="input" type="number" value={buyPrice} onChange={e=>{setBuyPrice(e.target.value);recomputeAlerts(shares,e.target.value)}} onBlur={e=>recomputeAlerts(shares,e.target.value)} placeholder="מחיר שוק" style={{direction:'ltr'}}/></div>{addAlerts.length>0&&(<div style={{marginBottom:"1rem",padding:".6rem .8rem",borderRadius:".5rem",background:"#dc2626"}}>{addAlerts.map((a,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:".4rem",marginBottom:i<addAlerts.length-1?".25rem":0}}><span>{a.type==="danger"?"🔴":"🟡"}</span><span style={{fontSize:".8rem",color:"#ffffff",fontWeight:"600"}}>{a.message}</span></div>))}</div>)}<button className="btn-accent" onClick={addHolding} disabled={!sel||!shares||!buyPrice} style={{opacity:(!sel||!shares||!buyPrice)?0.5:1}}>הוסף לתיק</button></div></div></div>)}

      {showSell&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={e=>{if(e.target===e.currentTarget)setShowSell(null)}}><div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'2rem',width:'100%',maxWidth:380,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}><h3 style={{margin:0,fontWeight:700}}>מכור <span className="ticker-badge">{showSell.ticker}</span></h3><button onClick={()=>setShowSell(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)'}}><X size={17}/></button></div><div style={{background:'var(--color-bg2)',borderRadius:9,padding:'.75rem',marginBottom:'1rem',fontSize:'.82rem',color:'var(--color-text-muted)'}}>בתיק: <strong style={{color:'var(--color-text-primary)'}}>{showSell.shares} מניות</strong> ב-<strong style={{color:'var(--color-text-primary)',direction:'ltr',display:'inline-block'}}>{'$'+showSell.buyPrice.toFixed(2)}</strong></div><div style={{display:'flex',flexDirection:'column',gap:'1rem'}}><div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מניות למכירה</label><input className="input" type="number" max={showSell.shares} value={sellShares} onChange={e=>setSellShares(e.target.value)} style={{direction:'ltr'}}/></div><div><label style={{fontSize:'.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>מחיר מכירה ($) {sellPriceLoading&&<span style={{color:'var(--color-accent)',fontSize:'.72rem'}}>טוען...</span>}</label><input className="input" type="number" value={sellPrice} onChange={e=>setSellPrice(e.target.value)} style={{direction:'ltr'}}/></div>{sellShares&&sellPrice&&<SellPnL sp={parseFloat(sellPrice)} bp={showSell.buyPrice} ss={parseFloat(sellShares)}/>}<button style={{background:'var(--color-danger)',color:'white',fontFamily:'Heebo,sans-serif',fontWeight:700,padding:'.8rem',fontSize:'.9rem',borderRadius:10,border:'none',cursor:'pointer',opacity:(!sellShares||!sellPrice)?0.5:1}} disabled={!sellShares||!sellPrice} onClick={confirmSell}>אשר מכירה</button></div></div></div>)}
    </div>
  )
}

function SellPnL({ sp, bp, ss }) {
  const p = (sp - bp) * ss
  return (<div style={{background:p>=0?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.1)',borderRadius:9,padding:'.75rem',textAlign:'center',border:'1px solid',borderColor:p>=0?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.25)',fontSize:'.85rem'}}>רווח/הפסד: <strong style={{color:p>=0?'var(--color-success)':'var(--color-danger)',direction:'ltr',display:'inline-block'}}>{p>=0?'+':'-'}{'$'+Math.abs(p).toFixed(2)}</strong></div>)
}