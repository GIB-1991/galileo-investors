import { useNavigate } from 'react-router-dom'
import { TrendingUp, Shield, BookOpen, BarChart2, ArrowLeft } from 'lucide-react'
const FEATURES=[{icon:BookOpen,title:'אקדמיה',desc:'מושגים פיננסיים בעברית עם דוגמאות חזותיות'},{icon:BarChart2,title:'סקרינר מניות',desc:'חיפוש וניתוח מניות עם נתונים מקצועיים'},{icon:BarChart2,title:'בניית תיק',desc:'בנה תיק עם ויזואליזציה לפי מגזרים'},{icon:Shield,title:'מנוע התזה',desc:'ניתוח אוטומטי עם התראות על סיכונים'}]
export default function Landing(){
const navigate=useNavigate()
return(<div style={{minHeight:'100vh',direction:'rtl',fontFamily:'Heebo,sans-serif'}}>
<header style={{background:'white',borderBottom:'1px solid var(--color-border)',padding:'0 2rem',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
<div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:32,height:32,background:'var(--color-text-primary)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'white',fontSize:16,fontWeight:700}}>G</span></div><span style={{fontWeight:700,fontSize:'1rem'}}>משקיעים עם גלילאו</span></div>
<div style={{display:'flex',gap:8}}><button className="btn-secondary" onClick={()=>navigate('/auth')}>כניסה</button><button className="btn-primary" onClick={()=>navigate('/auth?mode=signup')}>התחל בחינם</button></div></header>
<section style={{background:'white',padding:'5rem 2rem 4rem',textAlign:'center'}}>
<div style={{maxWidth:680,margin:'0 auto'}}>
<div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--color-accent-light)',color:'var(--color-accent)',borderRadius:20,padding:'4px 14px',fontSize:'.82rem',fontWeight:600,marginBottom:'1.5rem'}}><TrendingUp size={13}/>חודש ניסיון חינם — ללא כרטיס אשראי</div>
<h1 style={{fontSize:'clamp(2rem,5vw,3rem)',fontWeight:700,lineHeight:1.2,margin:'0 0 1.25rem'}}>כלים, ידע ובניית תיק השקעות חכם</h1>
<p style={{fontSize:'1.1rem',color:'var(--color-text-secondary)',margin:'0 0 2rem',lineHeight:1.7}}>מבוסס על תזת ההשקעות של גלילאו — גישה מקצועית לשוק ההון</p>
<div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
<button className="btn-accent" onClick={()=>navigate('/auth?mode=signup')} style={{display:'flex',alignItems:'center',gap:8}}>התחל ניסיון חינם<ArrowLeft size={18}/></button>
<button className="btn-secondary" onClick={()=>navigate('/auth')}>כבר יש לי חשבון</button></div></div></section>
<section style={{padding:'4rem 2rem',maxWidth:1000,margin:'0 auto'}}>
<h2 style={{textAlign:'center',fontSize:'1.5rem',fontWeight:700,marginBottom:'2.5rem'}}>מה תמצאו בפלטפורמה</h2>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.25rem'}}>
{FEATURES.map(({icon:Icon,title,desc})=>(<div key={title} className="card" style={{textAlign:'center'}}>
<div style={{width:44,height:44,background:'var(--color-bg)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',color:'var(--color-accent)'}}><Icon size={22}/></div>
<h3 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 .5rem'}}>{title}</h3>
<p style={{fontSize:'.875rem',color:'var(--color-text-secondary)',margin:0,lineHeight:1.6}}>{desc}</p></div>))}</div></section>
<section style={{background:'var(--color-text-primary)',padding:'3.5rem 2rem',textAlign:'center'}}>
<h2 style={{color:'white',fontSize:'1.6rem',fontWeight:700,margin:'0 0 1rem'}}>מוכנים להתחיל?</h2>
<p style={{color:'rgba(255,255,255,.7)',margin:'0 0 1.75rem',fontSize:'.95rem'}}>חודש ניסיון מלא — ללא התחייבות</p>
<button className="btn-accent" onClick={()=>navigate('/auth?mode=signup')}>פתח חשבון חינם עכשיו</button></section>
<footer style={{borderTop:'1px solid var(--color-border)',padding:'1.25rem 2rem',textAlign:'center'}}>
<p style={{margin:0,fontSize:'.78rem',color:'var(--color-text-muted)'}}>אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.</p></footer></div>)}