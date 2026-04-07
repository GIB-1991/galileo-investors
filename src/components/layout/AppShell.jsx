import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {Star,  LayoutDashboard, BookOpen, Search, PieChart, LogOut, Clock, FileText, Calculator, Sun, Moon, Shield } from 'lucide-react'
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
  const daysLeft = useTrialTimer(user)
  const handleSignOut = async () => { await signOut(); navigate('/') }

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('galileo-theme') !== 'light'
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
              <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:20,padding:'4px 10px',fontSize:'.72rem',fontWeight:600,color:'#f5a623'}}>
                <Clock size={11}/>{daysLeft} ימים
              </div>
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
  const opacity = darkMode ? 1 : 0.4
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden',opacity}}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="sat_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4a840" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#d4a840" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="sat_body" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f0d080"/>
            <stop offset="40%" stopColor="#c8a040"/>
            <stop offset="100%" stopColor="#7a5010"/>
          </radialGradient>
          <linearGradient id="sat_ring_a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8a050" stopOpacity="0"/>
            <stop offset="18%" stopColor="#e8c060" stopOpacity="0.7"/>
            <stop offset="50%" stopColor="#f8d878" stopOpacity="0.85"/>
            <stop offset="82%" stopColor="#e8c060" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#c8a050" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="sat_ring_b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b09040" stopOpacity="0"/>
            <stop offset="20%" stopColor="#d0a850" stopOpacity="0.5"/>
            <stop offset="50%" stopColor="#e0b860" stopOpacity="0.65"/>
            <stop offset="80%" stopColor="#d0a850" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#b09040" stopOpacity="0"/>
          </linearGradient>
          <radialGradient id="jup_body" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8c880"/>
            <stop offset="40%" stopColor="#c09048"/>
            <stop offset="100%" stopColor="#6a4010"/>
          </radialGradient>
          <radialGradient id="jup_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c09050" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#c09050" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="mars_body" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e88060"/>
            <stop offset="45%" stopColor="#c05030"/>
            <stop offset="100%" stopColor="#6a2010"/>
          </radialGradient>
        </defs>

        
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {Star,  LayoutDashboard, BookOpen, Search, PieChart, LogOut, Clock, FileText, Calculator, Sun, Moon, Shield } from 'lucide-react'
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
