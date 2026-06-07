import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {Star, Sparkles, LayoutDashboard, BookOpen, Search, PieChart, LogOut, Clock, FileText, Calculator, Sun, Moon, Shield } from 'lucide-react'
import { signOut } from '../../services/supabase.js'
import { useTrialTimer } from '../../hooks/useAuth.js'
import GalileoLogo from '../GalileoLogo.jsx'
const NAV = [
{path:'/dashboard', label:'לוח בקרה', icon:LayoutDashboard},
{path:'/screener', label:'סקרינר', icon:Search},
{path:'/portfolio', label:'תיק השקעות', icon:PieChart},
{path:'/calculator', label:'מחשבון', icon:Calculator},
{path:'/academy', label:'אקדמיה', icon:BookOpen},
{path:'/articles', label:'מאמרים', icon:FileText},
{path:'/superinvestors', label:'המשקיעים הגדולים', icon:Star},
{path:'/pricing', label:'מסלולים', icon:Sparkles},
]

const SOCIAL = [
{ href:'https://t.me/GalileoMarket', label:'Telegram', icon:(
<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#229ED9"/>
<path d="M5.5 11.8L19 6.5L15.5 18L11.5 14L9 16.5V13L16 7.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/></svg>
)},
{ href:'https://whatsapp.com/channel/0029VbCIpwPICVfgVBnTvD1R', label:'WhatsApp', icon:(
<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366"/>
<path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-3.4-1.3L6 17.5l1.3-2.5A5 5 0 0 1 7 12a5 5 0 0 1 5-5z" stroke="#fff" strokeWidth="1.3" fill="none"/>
<path d="M9.5 10.5q.5-.5 1 0l.7 1.3q.2.4-.2.8l-.2.2q.7 1.2 2 1.4l.2-.2q.4-.4.8-.2l1.2.7q.5.5 0 1Q13.5 17 10.5 14 9 12 9.5 10.5z" fill="#fff"/></svg>
)},
{ href:'https://www.facebook.com/profile.php?id=61582895521906', label:'Facebook', icon:(
<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/>
<path d="M13.5 7H12Q10 7 10 9v1.5H8.5v2H10V18h2.5v-5.5H14l.5-2h-2V9.5q0-.5 1-.5z" fill="#fff"/></svg>
)},
{ href:'https://x.com/gilileoB', label:'X', icon:(
<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#111"/>
<path d="M7 7h3l2.5 3.5L15 7h2l-3.5 5L18 17h-3l-2.5-3.8L9.5 17H7.5l3.7-5.2z" fill="#fff"/></svg>
)},
]

export default function AppShell({user, children}) {
const location = useLocation()
const navigate = useNavigate()
const { daysLeft, plan, isAdmin } = useTrialTimer(user)
const handleSignOut = async () => { await signOut(); navigate('/') }

const [darkMode, setDarkMode] = useState(() => {
const _t=localStorage.getItem('galileo-theme'); if(!_t){localStorage.setItem('galileo-theme','dark')} return _t!=='light'
})

useEffect(() => {
if (darkMode) {
document.body.classList.remove('light-mode')
localStorage.setItem('galileo-theme', 'dark')
} else {
document.body.classList.add('light-mode')
localStorage.setItem('galileo-theme', 'light')
}
}, [darkMode])

const headerBg = darkMode
? 'rgba(8,12,20,0.92)'
: 'rgba(240,235,220,0.92)'

return (
<div style={{minHeight:'100vh',display:'flex',flexDirection:'column',position:'relative',zIndex:1}}>
{/* Planets SVG - fixed, always visible */}
<PlanetsLayer darkMode={darkMode}/>

<header style={{background:headerBg,backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(245,166,35,0.18)',position:'sticky',top:0,zIndex:100}}>
<div style={{maxWidth:1300,margin:'0 auto',padding:'0 1.5rem',height:72,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
<Link to="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:12}}>
<GalileoLogo size={64}/>
<div>
<div style={{fontWeight:800,fontSize:'1.05rem',color:'#f5a623',lineHeight:1.2}}>גלילאו</div>
<div style={{fontSize:'.7rem',color:'rgba(245,166,35,0.65)',letterSpacing:'.14em',fontWeight:500}}>תצפיות שוק</div>
</div>
</Link>

<nav style={{display:'flex',alignItems:'center',gap:2}}>
{NAV.map(item => {
const Icon = item.icon
const active = location.pathname === item.path
return (
<Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:9,textDecoration:'none',fontSize:'.83rem',fontWeight:active?600:500,color:active?'#f5a623':'var(--color-text-secondary)',background:active?'rgba(245,166,35,0.12)':'transparent',border:active?'1px solid rgba(245,166,35,0.28)':'1px solid transparent',transition:'all 180ms'}}>
<Icon size={14}/>{item.label}
</Link>
)
})}
</nav>

<div style={{display:'flex',alignItems:'center',gap:7}}>
{SOCIAL.map(s=>(
<a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
style={{display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,borderRadius:'50%',transition:'transform 200ms,opacity 200ms',opacity:.82,flexShrink:0}}
onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.22)';e.currentTarget.style.opacity='1'}}
onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.opacity='.82'}}>
{s.icon}
</a>
))}

<div style={{width:'1px',height:20,background:'rgba(245,166,35,0.2)',margin:'0 2px'}}/>

{/* Dark/Light mode button */}
<button
onClick={()=>setDarkMode(d=>!d)}
title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:20,border:'1px solid rgba(245,166,35,0.3)',background:darkMode?'rgba(245,166,35,0.1)':'rgba(245,166,35,0.15)',cursor:'pointer',color:'#f5a623',fontSize:'.75rem',fontWeight:600,transition:'all 200ms',fontFamily:'inherit'}}
onMouseEnter={e=>e.currentTarget.style.background='rgba(245,166,35,0.25)'}
onMouseLeave={e=>e.currentTarget.style.background=darkMode?'rgba(245,166,35,0.1)':'rgba(245,166,35,0.15)'}>
{darkMode ? <Sun size={13}/> : <Moon size={13}/>}
{darkMode ? 'בהיר' : 'כהה'}
</button>
{user?.email === 'gilbitan2000@gmail.com' && (
<a href="/admin"
style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,border:'1px solid rgba(245,166,35,0.4)',background:'rgba(245,166,35,0.15)',color:'#f5a623',textDecoration:'none',fontSize:'.75rem',fontWeight:700,flexShrink:0}}
onMouseEnter={e=>e.currentTarget.style.background='rgba(245,166,35,0.3)'}
onMouseLeave={e=>e.currentTarget.style.background='rgba(245,166,35,0.15)'}>
<Shield size={12}/> ניהול
</a>
)}

{daysLeft <= 7 && (
<Link to="/pricing" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:5,background: isAdmin?'rgba(168,85,247,0.12)':plan==='monthly'||plan==='yearly'?'rgba(45,216,122,0.12)':daysLeft<=2?'rgba(240,82,82,0.12)':'rgba(245,166,35,0.1)',border:'1px solid '+(isAdmin?'rgba(168,85,247,0.35)':plan==='monthly'||plan==='yearly'?'rgba(45,216,122,0.35)':daysLeft<=2?'rgba(240,82,82,0.35)':'rgba(245,166,35,0.3)'),borderRadius:20,padding:'4px 10px',fontSize:'.72rem',fontWeight:600,color:isAdmin?'#a855f7':plan==='monthly'||plan==='yearly'?'#2dd87a':daysLeft<=2?'#f05252':'#f5a623'}}>
<Clock size={11}/>{isAdmin?'ניהול':plan==='monthly'?'מנוי חודשי':plan==='yearly'?'מנוי שנתי':daysLeft>0?(daysLeft+' ימי ניסיון'):'הניסיון הסתיים'}
</Link>
)}
<span style={{fontSize:'.78rem',color:'var(--color-text-secondary)',background:'var(--color-surface)',padding:'4px 10px',borderRadius:8,border:'1px solid var(--color-border)'}}>
{user?.email?.split('@')[0]}
</span>
<button onClick={handleSignOut} title="יציאה" style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',display:'flex',alignItems:'center',padding:6,borderRadius:7,transition:'all 180ms'}}
onMouseEnter={e=>e.currentTarget.style.color='#e05252'}
onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-secondary)'}>
<LogOut size={15}/>
</button>
</div>
</div>
</header>

<main style={{flex:1,maxWidth:1300,margin:'0 auto',width:'100%',padding:'2rem 1.5rem',position:'relative',zIndex:1}}>
{children}
</main>

<footer style={{borderTop:'1px solid rgba(245,166,35,0.12)',background:darkMode?'rgba(8,12,20,0.88)':'rgba(240,235,220,0.88)',padding:'1.2rem 1.5rem',textAlign:'center',position:'relative',zIndex:1}}>
<div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:20,marginBottom:8,flexWrap:'wrap'}}>
{SOCIAL.map(s=>(
<a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
style={{display:'flex',alignItems:'center',gap:6,fontSize:'.78rem',color:'rgba(245,166,35,0.65)',textDecoration:'none',transition:'color 200ms'}}
onMouseEnter={e=>e.currentTarget.style.color='#f5a623'}
onMouseLeave={e=>e.currentTarget.style.color='rgba(245,166,35,0.65)'}>
{s.icon}<span>{s.label}</span>
</a>
))}
</div>
<p style={{margin:0,fontSize:'.72rem',color:'rgba(150,150,180,0.5)'}}>אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.</p>
</footer>
</div>
)
}

function PlanetsLayer({ darkMode }) {
const opacity = darkMode ? 1 : 0.85
return (
<div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden',opacity}}>
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="sat_glow" cx="50%" cy="50%" r="50%">
<stop offset="0%" stopColor="#d4a840" stopOpacity="0.35"/>
<stop offset="100%" stopColor="#d4a840" stopOpacity="0"/>
</radialGradient>
<radialGradient id="sat_body" cx="38%" cy="35%" r="65%">
<stop offset="0%" stopColor="#f0d080"/>
<stop offset="40%" stopColor="#c8a040"/>
<stop offset="100%" stopColor="#7a5010"/>
</radialGradient>
<linearGradient id="sat_ring_a" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stopColor="#c8a050" stopOpacity="0"/>
<stop offset="18%" stopColor="#e8c060" stopOpacity="0.8"/>
<stop offset="50%" stopColor="#f8d878" stopOpacity="0.95"/>
<stop offset="82%" stopColor="#e8c060" stopOpacity="0.8"/>
<stop offset="100%" stopColor="#c8a050" stopOpacity="0"/>
</linearGradient>
<linearGradient id="sat_ring_b" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stopColor="#b09040" stopOpacity="0"/>
<stop offset="20%" stopColor="#d0a850" stopOpacity="0.6"/>
<stop offset="50%" stopColor="#e0b860" stopOpacity="0.75"/>
<stop offset="80%" stopColor="#d0a850" stopOpacity="0.6"/>
<stop offset="100%" stopColor="#b09040" stopOpacity="0"/>
</linearGradient>
<radialGradient id="jup_body" cx="38%" cy="35%" r="65%">
<stop offset="0%" stopColor="#e8c880"/>
<stop offset="40%" stopColor="#c09048"/>
<stop offset="100%" stopColor="#6a4010"/>
</radialGradient>
<radialGradient id="jup_glow" cx="50%" cy="50%" r="50%">
<stop offset="0%" stopColor="#c09050" stopOpacity="0.32"/>
<stop offset="100%" stopColor="#c09050" stopOpacity="0"/>
</radialGradient>
<radialGradient id="mars_body" cx="38%" cy="35%" r="65%">
<stop offset="0%" stopColor="#e88060"/>
<stop offset="45%" stopColor="#c05030"/>
<stop offset="100%" stopColor="#6a2010"/>
</radialGradient>
<radialGradient id="nep_body" cx="38%" cy="35%" r="65%">
<stop offset="0%" stopColor="#7fb0f0"/>
<stop offset="45%" stopColor="#3a6ec0"/>
<stop offset="100%" stopColor="#10204a"/>
</radialGradient>
<radialGradient id="nep_glow" cx="50%" cy="50%" r="50%">
<stop offset="0%" stopColor="#4a7ad0" stopOpacity="0.3"/>
<stop offset="100%" stopColor="#4a7ad0" stopOpacity="0"/>
</radialGradient>
</defs>

{/* ===== SATURN — top left, slow drift + ring tilt ===== */}
<g transform="translate(220,180)">
<animateTransform attributeName="transform" type="translate" values="220,180; 250,205; 220,180" dur="26s" repeatCount="indefinite" additive="sum"/>
<g>
<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="120s" repeatCount="indefinite"/>
<circle cx="0" cy="0" r="60" fill="url(#sat_glow)"/>
<ellipse cx="0" cy="5" rx="72" ry="18" fill="url(#sat_ring_b)" opacity="0.7"/>
<ellipse cx="0" cy="5" rx="55" ry="13" fill="url(#sat_ring_a)" opacity="0.8"/>
<circle cx="0" cy="0" r="30" fill="url(#sat_body)"/>
<path d="M-30,6 Q0,4 30,6" stroke="#a07828" strokeWidth="4" fill="none" opacity="0.5"/>
<path d="M-28,-6 Q0,-7 28,-6" stroke="#b08838" strokeWidth="2.5" fill="none" opacity="0.4"/>
<path d="M-25,12 Q0,11 25,12" stroke="#906020" strokeWidth="2" fill="none" opacity="0.35"/>
<ellipse cx="-7" cy="-9" rx="10" ry="6" fill="#fff8e0" opacity="0.18"/>
<path d="M-72,5 Q0,24 72,5" fill="none" stroke="url(#sat_ring_a)" strokeWidth="11" opacity="0.8"/>
<path d="M-55,5 Q0,17 55,5" fill="none" stroke="url(#sat_ring_b)" strokeWidth="5" opacity="0.6"/>
</g>
</g>

{/* ===== JUPITER — bottom right, spins + floats ===== */}
<g transform="translate(1150,560)">
<animateTransform attributeName="transform" type="translate" values="1150,560; 1115,535; 1150,560" dur="32s" repeatCount="indefinite" additive="sum"/>
<g>
<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="90s" repeatCount="indefinite"/>
<circle cx="0" cy="0" r="78" fill="url(#jup_glow)"/>
<circle cx="0" cy="0" r="44" fill="url(#jup_body)"/>
<circle cx="0" cy="0" r="44" fill="none" stroke="#d4aa58" strokeWidth="0.8" opacity="0.3"/>
<path d="M-44,-13 Q0,-10 44,-13" stroke="#a07830" strokeWidth="6" fill="none" opacity="0.55"/>
<path d="M-44,0 Q0,3 44,0" stroke="#8a6020" strokeWidth="4" fill="none" opacity="0.5"/>
<path d="M-44,13 Q0,10 44,13" stroke="#b08838" strokeWidth="5" fill="none" opacity="0.52"/>
<path d="M-41,-23 Q0,-22 41,-23" stroke="#c0a048" strokeWidth="3" fill="none" opacity="0.38"/>
<ellipse cx="14" cy="8" rx="11" ry="6" fill="#c04020" opacity="0.6"/>
<ellipse cx="14" cy="8" rx="7" ry="4" fill="#d05030" opacity="0.45"/>
<ellipse cx="-11" cy="-13" rx="14" ry="9" fill="#f8e898" opacity="0.14"/>
</g>
<g>
<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite"/>
<circle cx="-66" cy="0" r="5" fill="#d8c888" opacity="0.7"/>
</g>
<g>
<animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="28s" repeatCount="indefinite"/>
<circle cx="80" cy="0" r="4" fill="#d4c890" opacity="0.6"/>
</g>
</g>

{/* ===== MARS — upper right, gentle bob ===== */}
<g transform="translate(1050,200)">
<animateTransform attributeName="transform" type="translate" values="1050,200; 1075,225; 1050,200" dur="22s" repeatCount="indefinite" additive="sum"/>
<g>
<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/>
<circle cx="0" cy="0" r="40" fill="url(#jup_glow)" opacity="0.6"/>
<circle cx="0" cy="0" r="20" fill="url(#mars_body)"/>
<circle cx="0" cy="0" r="20" fill="none" stroke="#d06040" strokeWidth="0.6" opacity="0.3"/>
<path d="M-20,5 Q0,4 20,5" stroke="#a03820" strokeWidth="2.5" fill="none" opacity="0.4"/>
<path d="M-17,-5 Q0,-6 17,-5" stroke="#b84830" strokeWidth="2" fill="none" opacity="0.35"/>
<ellipse cx="-5" cy="-5" rx="7" ry="4" fill="#fff0e8" opacity="0.18"/>
</g>
</g>

{/* ===== NEPTUNE — mid left, slow float ===== */}
<g transform="translate(360,560)">
<animateTransform attributeName="transform" type="translate" values="360,560; 335,585; 360,560" dur="28s" repeatCount="indefinite" additive="sum"/>
<g>
<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="100s" repeatCount="indefinite"/>
<circle cx="0" cy="0" r="48" fill="url(#nep_glow)"/>
<circle cx="0" cy="0" r="24" fill="url(#nep_body)"/>
<path d="M-24,6 Q0,4 24,6" stroke="#2a5090" strokeWidth="2.5" fill="none" opacity="0.45"/>
<path d="M-21,-7 Q0,-8 21,-7" stroke="#5a8ad0" strokeWidth="2" fill="none" opacity="0.35"/>
<ellipse cx="-6" cy="-7" rx="8" ry="5" fill="#cfe4ff" opacity="0.2"/>
</g>
</g>

{/* ===== Constellation — top right ===== */}
<g opacity="0.5">
<circle cx="88%" cy="8%" r="2.5" fill="#c8d8ff"/>
<circle cx="91%" cy="12%" r="2" fill="#c8d8ff"/>
<circle cx="87%" cy="16%" r="2.5" fill="#c8d8ff"/>
<circle cx="93%" cy="15%" r="1.6" fill="#c8d8ff"/>
<circle cx="85%" cy="20%" r="2" fill="#c8d8ff"/>
<circle cx="90%" cy="21%" r="1.4" fill="#c8d8ff"/>
<line x1="88%" y1="8%" x2="91%" y2="12%" stroke="#c8d8ff" strokeWidth="0.6" opacity="0.4"/>
<line x1="91%" y1="12%" x2="87%" y2="16%" stroke="#c8d8ff" strokeWidth="0.6" opacity="0.4"/>
<line x1="87%" y1="16%" x2="93%" y2="15%" stroke="#c8d8ff" strokeWidth="0.6" opacity="0.35"/>
<line x1="87%" y1="16%" x2="85%" y2="20%" stroke="#c8d8ff" strokeWidth="0.6" opacity="0.35"/>
<line x1="85%" y1="20%" x2="90%" y2="21%" stroke="#c8d8ff" strokeWidth="0.6" opacity="0.3"/>
</g>

{/* ===== Shooting stars ===== */}
<line x1="72%" y1="6%" x2="80%" y2="12%" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round">
<animate attributeName="opacity" values="0;0;0.8;0.4;0" dur="5s" begin="2s" repeatCount="indefinite"/>
</line>
<line x1="28%" y1="4%" x2="37%" y2="10%" stroke="#f5a623" strokeWidth="1.4" strokeLinecap="round">
<animate attributeName="opacity" values="0;0;0.65;0.3;0" dur="7s" begin="5.5s" repeatCount="indefinite"/>
</line>
<line x1="55%" y1="90%" x2="63%" y2="95%" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round">
<animate attributeName="opacity" values="0;0;0.55;0.2;0" dur="6s" begin="10s" repeatCount="indefinite"/>
</line>
</svg>
</div>
)
}
