import { useState } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { searchTicker, formatMarketCap, getMarketCapCategory } from '../services/stockApi.js'
const CAP_COLORS={'Mega Cap':'#dcfce7','Large Cap':'#dbeafe','Mid Cap':'#fef3c7','Small Cap':'#fee2e2','ETF':'#ede9fe'}
export default function Screener(){
const [query,setQuery]=useState('');const [results,setResults]=useState([]);const [loading,setLoading]=useState(false);const [selected,setSelected]=useState(null)
const handleSearch=async(e)=>{e.preventDefault();if(!query.trim())return;setLoading(true);const data=await searchTicker(query);setResults(data);setLoading(false)}
const fmt=(n,d=2)=>n==null?'N/A':n.toFixed(d)
const fmtV=(v)=>!v?'N/A':v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':''+v
return(<div>
<div style={{marginBottom:'2rem'}}><h1 style={{fontSize:'1.5rem',fontWeight:700,margin:'0 0 6px'}}>סקרינר מניות</h1><p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>חפש Ticker וקבל נתונים פיננסיים מפורטים</p></div>
<form onSubmit={handleSearch} style={{display:'flex',gap:'.75rem',marginBottom:'1.5rem'}}>
<div style={{position:'relative',flex:1}}><Search size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/><input className="input input-ticker" value={query} onChange={e=>setQuery(e.target.value.toUpperCase())} placeholder="AAPL, MSFT, NVDA..." style={{paddingRight:36}}/></div>
<button className="btn-primary" type="submit" disabled={loading}>{loading?'מחפש...':'חיפוש'}</button></form>
<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.5rem'}}>{['AAPL','MSFT','NVDA','AMZN','TSLA','QQQ','SPY'].map(t=>(<button key={t} onClick={()=>{setQuery(t);searchTicker(t).then(setResults)}} style={{padding:'4px 12px',borderRadius:6,background:'white',border:'1px solid var(--color-border)',cursor:'pointer',fontSize:'.8rem',fontWeight:600,fontFamily:'monospace'}}>{t}</button>))}</div>
{results.length>0&&<div className="card" style={{padding:0,overflow:'auto'}}>
<table style={{width:'100%',borderCollapse:'collapse',fontSize:'.875rem'}}>
<thead><tr style={{background:'var(--color-bg)',borderBottom:'1px solid var(--color-border)'}}>{['Ticker','שם','מגזר','מחיר','שינוי','Market Cap','Beta','Short Float','Volume','יעד'].map(h=>(<th key={h} style={{padding:'.75rem 1rem',textAlign:'right',fontWeight:600,fontSize:'.78rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>))}</tr></thead>
<tbody>{results.map(s=>{const cat=getMarketCapCategory(s.marketCap);return(<tr key={s.ticker} onClick={()=>setSelected(selected?.ticker===s.ticker?null:s)} style={{borderBottom:'1px solid var(--color-border)',cursor:'pointer',background:selected?.ticker===s.ticker?'var(--color-bg)':'white'}}>
<td style={{padding:'.875rem 1rem'}}><span className="ticker-badge">{s.ticker}</span></td>
<td style={{padding:'.875rem 1rem',fontWeight:500,direction:'ltr',whiteSpace:'nowrap'}}>{s.name}</td>
<td style={{padding:'.875rem 1rem',color:'var(--color-text-secondary)'}}>{s.sector}</td>
<td style={{padding:'.875rem 1rem',fontWeight:600,direction:'ltr'}}>${fmt(s.price)}</td>
<td style={{padding:'.875rem 1rem'}}><span style={{display:'flex',alignItems:'center',gap:4,color:s.changePct>=0?'var(--color-success)':'var(--color-danger)',direction:'ltr'}}>{s.changePct>=0?<TrendingUp size={13}/>:<TrendingDown size={13}/>}{fmt(s.changePct)}%</span></td>
<td style={{padding:'.875rem 1rem'}}><span style={{background:CAP_COLORS[cat],padding:'2px 8px',borderRadius:6,fontSize:'.78rem',fontWeight:500}}>{formatMarketCap(s.marketCap)}</span></td>
<td style={{padding:'.875rem 1rem',direction:'ltr'}}>{fmt(s.beta)}</td>
<td style={{padding:'.875rem 1rem',direction:'ltr',color:s.shortFloat>0.10?'var(--color-danger)':'inherit'}}>{s.shortFloat?(s.shortFloat*100).toFixed(1)+'%':'N/A'}</td>
<td style={{padding:'.875rem 1rem',direction:'ltr'}}>{fmtV(s.volume)}</td>
<td style={{padding:'.875rem 1rem',direction:'ltr',color:'var(--color-text-secondary)'}}>{s.analystTarget?'$'+s.analystTarget:'N/A'}</td></tr>)})}</tbody></table></div>}
{selected&&<div className="card" style={{marginTop:'1rem'}}><h3 style={{margin:'0 0 1rem',fontSize:'1rem',fontWeight:600}}>פירוט: <span className="ltr-term">{selected.ticker}</span></h3>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem'}}>{[['מחיר','$'+fmt(selected.price)],['יעד אנליסטים',selected.analystTarget?'$'+selected.analystTarget:'N/A'],['Market Cap',formatMarketCap(selected.marketCap)],['Beta',fmt(selected.beta)],['P/E',selected.peRatio?fmt(selected.peRatio):'N/A'],['מגזר',selected.sector]].map(([l,v])=>(<div key={l} style={{background:'var(--color-bg)',borderRadius:8,padding:'.875rem'}}><div style={{fontSize:'.78rem',color:'var(--color-text-muted)',marginBottom:4}}>{l}</div><div style={{fontWeight:600,direction:'ltr',textAlign:'right'}}>{v}</div></div>))}</div></div>}
{results.length===0&&!loading&&<div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)',fontSize:'.875rem'}}>חפש Ticker כדי לראות נתונים</div>}</div>)}