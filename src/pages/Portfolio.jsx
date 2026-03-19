import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { usePortfolioStore } from '../store/portfolioStore.js'
import { analyzePortfolio, getPortfolioStats } from '../utils/thesisEngine.js'
import { useToast } from '../components/alerts/ToastSystem.jsx'
const COLORS={'Technology':'#6366f1','Consumer Discretionary':'#f59e0b','Communication Services':'#10b981','Financials':'#3b82f6','Healthcare':'#ec4899','ETF':'#8b5cf6','Energy':'#f97316','Unknown':'#94a3b8'}
const fmtCur=(n)=>n?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n):'$0'
export default function Portfolio({user}){
const {holdings,stockData,loading,addHolding,removeHolding,loadPortfolio}=usePortfolioStore()
const {addToast}=useToast()
const [ticker,setTicker]=useState('');const [shares,setShares]=useState('');const [buyPrice,setBuyPrice]=useState('');const [adding,setAdding]=useState(false);const [showForm,setShowForm]=useState(false)
useEffect(()=>{if(user)loadPortfolio(user.id)},[user])
const stats=getPortfolioStats(holdings,stockData)
const outerData=holdings.map(h=>({name:h.ticker,value:h.currentValue||0,weight:stats.totalValue>0?((h.currentValue||0)/stats.totalValue)*100:0,sector:stockData[h.ticker]?.sector||'Unknown'})).filter(d=>d.value>0)
const innerData=stats.sectors.filter(s=>s.value>0)
const handleAdd=async(e)=>{e.preventDefault();if(!ticker||!shares||!buyPrice)return;setAdding(true)
const {error}=await addHolding(user.id,ticker,parseFloat(shares),parseFloat(buyPrice))
if(error){addToast({type:'danger',title:'שגיאה',message:error})}
else{const {holdings:h,stockData:sd}=usePortfolioStore.getState();const alerts=analyzePortfolio(h,sd);alerts.filter(a=>a.ticker===ticker.toUpperCase()).forEach(a=>addToast({type:a.type,title:a.title,message:a.message,duration:7000}));setTicker('');setShares('');setBuyPrice('');setShowForm(false);addToast({type:'success',title:'נוסף',message:ticker.toUpperCase()+' נוסף לתיק'})}
setAdding(false)}
const handleRemove=async(id,t)=>{await removeHolding(id);addToast({type:'info',title:'הוסר',message:t+' הוסר'})}
const alerts=analyzePortfolio(holdings,stockData)
return(<div>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem'}}>
<div><h1 style={{fontSize:'1.5rem',fontWeight:700,margin:'0 0 4px'}}>תיק השקעות</h1><p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>בנה ונהל את הפורטפוליו שלך</p></div>
<button className="btn-primary" onClick={()=>setShowForm(!showForm)} style={{display:'flex',alignItems:'center',gap:6}}><Plus size={16}/>הוסף מניה</button></div>
{showForm&&<div className="card" style={{marginBottom:'1.5rem',background:'var(--color-bg)'}}>
<h3 style={{margin:'0 0 1rem',fontSize:'.95rem',fontWeight:600}}>הוספת פוזיציה</h3>
<form onSubmit={handleAdd} style={{display:'flex',gap:'.75rem',flexWrap:'wrap',alignItems:'flex-end'}}>
<div><label style={{fontSize:'.78rem',fontWeight:500,display:'block',marginBottom:4}}>Ticker</label><input className="input input-ticker" value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="AAPL" style={{width:100}} required/></div>
<div><label style={{fontSize:'.78rem',fontWeight:500,display:'block',marginBottom:4}}>מניות</label><input className="input" type="number" value={shares} onChange={e=>setShares(e.target.value)} placeholder="10" style={{width:110}} min="0.001" step="any" required/></div>
<div><label style={{fontSize:'.78rem',fontWeight:500,display:'block',marginBottom:4}}>מחיר קנייה ($)</label><input className="input" type="number" value={buyPrice} onChange={e=>setBuyPrice(e.target.value)} placeholder="150" style={{width:120}} min="0.01" step="any" required/></div>
<button className="btn-primary" type="submit" disabled={adding}>{adding?'מוסיף...':'הוסף'}</button>
<button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>ביטול</button></form></div>}
{alerts.length>0&&<div style={{marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:8}}>{alerts.slice(0,3).map((a,i)=>(<div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'.875rem 1rem',borderRadius:10,border:'1px solid',background:a.type==='danger'?'#fef2f2':'#fffbeb',borderColor:a.type==='danger'?'#fecaca':'#fde68a',color:a.type==='danger'?'#991b1b':'#92400e',fontSize:'.875rem'}}><AlertTriangle size={16} style={{flexShrink:0,marginTop:1}}/><div><div style={{fontWeight:600,marginBottom:2}}>{a.title}</div><div style={{opacity:.85,fontSize:'.82rem'}}>{a.message}</div></div></div>))}</div>}
{loading?<div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>טוען תיק...</div>:
holdings.length===0?<div className="card" style={{textAlign:'center',padding:'4rem 2rem'}}><h3 style={{margin:'0 0 .5rem',fontWeight:600}}>התיק ריק</h3><p style={{color:'var(--color-text-muted)',fontSize:'.875rem',margin:'0 0 1.5rem'}}>הוסף את המניה הראשונה</p><button className="btn-primary" onClick={()=>setShowForm(true)} style={{display:'inline-flex',alignItems:'center',gap:6}}><Plus size={16}/>הוסף מניה</button></div>:
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
<div style={{gridColumn:'1 / -1',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem'}}>
{[['שווי תיק',fmtCur(stats.totalValue)],['עלות',fmtCur(stats.totalCost)],['רווח/הפסד',fmtCur(stats.totalPnl)],['תשואה',stats.totalPnlPct.toFixed(2)+'%']].map(([l,v])=>(<div key={l} className="card" style={{padding:'1rem'}}><div style={{fontSize:'.78rem',color:'var(--color-text-muted)',marginBottom:4}}>{l}</div><div style={{fontSize:'1.1rem',fontWeight:700,direction:'ltr',textAlign:'right',color:l==='רווח/הפסד'?(stats.totalPnl>=0?'var(--color-success)':'var(--color-danger)'):'inherit'}}>{v}</div></div>))}</div>
<div className="card"><h3 style={{margin:'0 0 1rem',fontSize:'.95rem',fontWeight:600}}>פיזור התיק</h3>
{outerData.length>0?<ResponsiveContainer width="100%" height={260}><PieChart><Pie data={innerData} cx="50%" cy="50%" outerRadius={55} dataKey="value">{innerData.map((e,i)=>(<Cell key={i} fill={COLORS[e.name]||'#94a3b8'} opacity={0.7}/>))}</Pie><Pie data={outerData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} dataKey="value" nameKey="name" label={({name,weight})=>name+' '+weight.toFixed(0)+'%'} labelLine={false} fontSize={10}>{outerData.map((e,i)=>(<Cell key={i} fill={COLORS[e.sector]||'#94a3b8'}/>))}</Pie><Tooltip formatter={(v)=>fmtCur(v)}/></PieChart></ResponsiveContainer>:<div style={{height:260,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-muted)'}}>אין נתונים</div>}</div>
<div className="card" style={{padding:0,overflow:'hidden'}}><div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--color-border)'}}><h3 style={{margin:0,fontSize:'.95rem',fontWeight:600}}>פוזיציות ({holdings.length})</h3></div>
{holdings.map(h=>{const pnl=(h.currentValue||0)-(h.totalCost||0);const pnlPct=h.totalCost>0?(pnl/h.totalCost)*100:0;const w=stats.totalValue>0?((h.currentValue||0)/stats.totalValue)*100:0
return(<div key={h.id} style={{padding:'.875rem 1.25rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',gap:'.75rem'}}>
<div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}><span className="ticker-badge">{h.ticker}</span><span style={{fontSize:'.78rem',color:'var(--color-text-muted)'}}>{h.shares} מניות</span><span style={{fontSize:'.78rem',color:'var(--color-text-muted)',marginRight:'auto'}}>{w.toFixed(1)}%</span></div>
<div style={{display:'flex',gap:12,fontSize:'.82rem'}}><span style={{color:'var(--color-text-secondary)',direction:'ltr'}}>עלות: ${h.buy_price?.toFixed(2)}</span><span style={{color:'var(--color-text-secondary)',direction:'ltr'}}>כעת: ${(h.currentPrice||0).toFixed(2)}</span><span style={{color:pnl>=0?'var(--color-success)':'var(--color-danger)',fontWeight:500,display:'flex',alignItems:'center',gap:3,direction:'ltr'}}>{pnl>=0?<TrendingUp size={12}/>:<TrendingDown size={12}/>}{pnlPct.toFixed(2)}%</span></div></div>
<div style={{fontWeight:600,direction:'ltr',fontSize:'.875rem'}}>{fmtCur(h.currentValue)}</div>
<button onClick={()=>handleRemove(h.id,h.ticker)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:4}}><Trash2 size={14}/></button></div>)})}</div></div>}</div>)}