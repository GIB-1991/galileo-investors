import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw } from 'lucide-react'
import { getMockNews } from '../services/stockApi.js'
const MARKET=[{name:'S&P 500',value:'6,775.50',change:'+0.29%',up:true},{name:'Nasdaq 100',value:'25,047.75',change:'+0.13%',up:true},{name:'Gold',value:'$5,015',change:'+0.14%',up:true},{name:'USD/ILS',value:'3.68',change:'-0.22%',up:false}]
const CAT_COLORS={'מאקרו':'#dbeafe','טכנולוגיה':'#ede9fe','שוק':'#dcfce7','סחורות':'#fef3c7'}
export default function Dashboard({user}){
const [news,setNews]=useState([]);const [loading,setLoading]=useState(true)
useEffect(()=>{setTimeout(()=>{setNews(getMockNews());setLoading(false)},600)},[])
const name=user?.email?.split('@')[0]||'משקיע'
return(<div>
<div style={{marginBottom:'2rem'}}><h1 style={{fontSize:'1.5rem',fontWeight:700,margin:'0 0 4px'}}>שלום, {name}</h1><p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>{new Date().toLocaleDateString('he-IL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
{MARKET.map(m=>(<div key={m.name} className="card" style={{padding:'1rem'}}><div style={{fontSize:'.78rem',color:'var(--color-text-muted)',marginBottom:4}}>{m.name}</div><div style={{fontSize:'1.1rem',fontWeight:700,direction:'ltr',textAlign:'right'}}>{m.value}</div><div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end',marginTop:4}}>{m.up?<TrendingUp size={13} style={{color:'var(--color-success)'}}/>:<TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}<span style={{fontSize:'.8rem',fontWeight:500,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr'}}>{m.change}</span></div></div>))}</div>
<div className="card" style={{padding:0,overflow:'hidden'}}>
<div style={{padding:'1.25rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<h2 style={{fontSize:'1rem',fontWeight:600,margin:0}}>חדשות פיננסיות</h2>
<button onClick={()=>{setLoading(true);setTimeout(()=>setLoading(false),600)}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center',gap:4,fontSize:'.78rem'}}><RefreshCw size={13}/>עדכן</button></div>
{loading?<div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-muted)',fontSize:'.875rem'}}>טוען חדשות...</div>:
<div>{news.map((item,i)=>(<div key={item.id} style={{padding:'1rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem'}}>
<div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><span style={{fontSize:'.72rem',fontWeight:600,background:CAT_COLORS[item.category]||'#f5f5f4',padding:'2px 8px',borderRadius:10}}>{item.category}</span><span style={{fontSize:'.72rem',color:'var(--color-text-muted)'}}>{item.source}</span><span style={{fontSize:'.72rem',color:'var(--color-text-muted)'}}>· {item.time}</span></div>
<p style={{margin:0,fontSize:'.9rem',fontWeight:500,lineHeight:1.5,direction:'ltr',textAlign:'left'}}>{item.title}</p></div>
<ExternalLink size={14} style={{color:'var(--color-text-muted)',flexShrink:0,marginTop:2}}/></div>))}</div>}</div>
<p style={{fontSize:'.75rem',color:'var(--color-text-muted)',textAlign:'center',marginTop:'1.5rem'}}>הנתונים מוצגים לצורך מידע בלבד. שעות מסחר: ראשון–חמישי 16:30–23:00 (שעון ישראל)</p></div>)}