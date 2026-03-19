import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Search, PieChart, LogOut, Clock } from 'lucide-react'
import { signOut } from '../../services/supabase.js'
import { useTrialTimer } from '../../hooks/useAuth.js'
const NAV=[{path:'/dashboard',label:'לוח בקרה',icon:LayoutDashboard},{path:'/academy',label:'אקדמיה',icon:BookOpen},{path:'/screener',label:'סקרינר',icon:Search},{path:'/portfolio',label:'תיק השקעות',icon:PieChart}]
export default function AppShell({user,children}){
const location=useLocation();const navigate=useNavigate();const daysLeft=useTrialTimer(user)
const handleSignOut=async()=>{await signOut();navigate('/')}
return(<div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
<header style={{background:'white',borderBottom:'1px solid var(--color-border)',position:'sticky',top:0,zIndex:100}}>
<div style={{maxWidth:1200,margin:'0 auto',padding:'0 1.5rem',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<Link to="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
<div style={{width:32,height:32,background:'var(--color-text-primary)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'white',fontSize:16,fontWeight:700}}>G</span></div>
<span style={{fontWeight:700,fontSize:'1rem',color:'var(--color-text-primary)'}}>משקיעים עם גלילאו</span></Link>
<nav style={{display:'flex',alignItems:'center',gap:4}}>{NAV.map(item=>{const Icon=item.icon;const active=location.pathname===item.path;return(<Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,textDecoration:'none',fontSize:'.875rem',fontWeight:500,color:active?'var(--color-text-primary)':'var(--color-text-secondary)',background:active?'var(--color-bg)':'transparent'}}><Icon size={16}/>{item.label}</Link>)})}</nav>
<div style={{display:'flex',alignItems:'center',gap:12}}>
{daysLeft<=7&&<div style={{display:'flex',alignItems:'center',gap:6,background:daysLeft<=3?'#fef3c7':'var(--color-bg)',border:'1px solid '+(daysLeft<=3?'#fde68a':'var(--color-border)'),borderRadius:20,padding:'4px 12px',fontSize:'.8rem',fontWeight:500,color:daysLeft<=3?'#92400e':'var(--color-text-secondary)'}}><Clock size={13}/>{daysLeft} ימים נותרו</div>}
<span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{user?.email?.split('@')[0]}</span>
<button onClick={handleSignOut} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center'}}><LogOut size={16}/></button></div></div></header>
<main style={{flex:1,maxWidth:1200,margin:'0 auto',width:'100%',padding:'2rem 1.5rem'}}>{children}</main>
<footer style={{borderTop:'1px solid var(--color-border)',background:'white',padding:'1rem 1.5rem',textAlign:'center'}}>
<p style={{margin:0,fontSize:'.78rem',color:'var(--color-text-muted)'}}>אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.</p></footer></div>)}