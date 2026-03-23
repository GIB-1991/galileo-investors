import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Search, PieChart, LogOut, Clock, FileText, Calculator } from 'lucide-react'
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
]

const SOCIAL = [
  { href:'https://t.me/GalileoMarket', label:'Telegram', color:'#229ED9', icon:(
    <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path d="M5.5 11.8L19 6.5L15.5 18L11.5 14L9 16.5V13L16 7.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/></svg>
  )},
  { href:'https://whatsapp.com/channel/0029VbCIpwPICVfgVBnTvD1R', label:'WhatsApp', color:'#25D366', icon:(
    <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366"/>
    <path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-3.4-1.3L6 17.5l1.3-2.5A5 5 0 0 1 7 12a5 5 0 0 1 5-5z" stroke="#fff" strokeWidth="1.3" fill="none"/>
    <path d="M9.5 10.5q.5-.5 1 0l.7 1.3q.2.4-.2.8l-.2.2q.7 1.2 2 1.4l.2-.2q.4-.4.8-.2l1.2.7q.5.5 0 1Q13.5 17 10.5 14 9 12 9.5 10.5z" fill="#fff"/></svg>
  )},
  { href:'https://facebook.com/', label:'Facebook', color:'#1877F2', icon:(
    <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/>
    <path d="M13.5 7H12Q10 7 10 9v1.5H8.5v2H10V18h2.5v-5.5H14l.5-2h-2V9.5q0-.5 1-.5z" fill="#fff"/></svg>
  )},
  { href:'https://x.com/gilileoB', label:'X / Twitter', color:'#111', icon:(
    <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#111"/>
    <path d="M7 7h3l2.5 3.5L15 7h2l-3.5 5L18 17h-3l-2.5-3.8L9.5 17H7.5l3.7-5.2z" fill="#fff"/></svg>
  )},
]

export default function AppShell({user, children}) {
  const location = useLocation()
  const navigate = useNavigate()
  const daysLeft = useTrialTimer(user)
  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--color-bg)',position:'relative',overflow:'hidden'}}>
      <CosmicBackground/>
      <header style={{background:'rgba(13,15,20,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(245,166,35,0.15)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1300,margin:'0 auto',padding:'0 1.5rem',height:72,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link to="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:12}}>
            <GalileoLogo size={64}/>
            <div>
              <div style={{fontWeight:800,fontSize:'1.05rem',color:'#f5a623',lineHeight:1.2}}>גלילאו</div>
              <div style={{fontSize:'.7rem',color:'rgba(245,166,35,0.6)',letterSpacing:'.14em',fontWeight:500}}>תצפיות שוק</div>
            </div>
          </Link>
          <nav style={{display:'flex',alignItems:'center',gap:2}}>
            {NAV.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:9,textDecoration:'none',fontSize:'.83rem',fontWeight:active?600:500,color:active?'#f5a623':'var(--color-text-secondary)',background:active?'rgba(245,166,35,0.1)':'transparent',border:active?'1px solid rgba(245,166,35,0.25)':'1px solid transparent',transition:'all 180ms'}}>
                  <Icon size={14}/>{item.label}
                </Link>
              )
            })}
          </nav>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            {SOCIAL.map(s=>(
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                style={{display:'flex',alignItems:'center',justifyContent:'center',width:30,height:30,borderRadius:'50%',transition:'transform 200ms,opacity 200ms',opacity:.8,flexShrink:0}}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.22)';e.currentTarget.style.opacity='1'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.opacity='.8'}}>
                {s.icon}
              </a>
            ))}
            <div style={{width:'1px',height:20,background:'rgba(255,255,255,0.1)',margin:'0 2px'}}/>
            {daysLeft <= 7 && (
              <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:20,padding:'4px 10px',fontSize:'.72rem',fontWeight:600,color:'#f5a623'}}>
                <Clock size={11}/>{daysLeft} ימים
              </div>
            )}
            <span style={{fontSize:'.78rem',color:'var(--color-text-muted)',background:'var(--color-surface)',padding:'4px 10px',borderRadius:8,border:'1px solid var(--color-border)'}}>
              {user?.email?.split('@')[0]}
            </span>
            <button onClick={handleSignOut} title="יציאה" style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center',padding:6,borderRadius:7,transition:'all 180ms'}}
              onMouseEnter={e=>e.currentTarget.style.color='#e05252'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}>
              <LogOut size={15}/>
            </button>
          </div>
        </div>
      </header>
      <main style={{flex:1,maxWidth:1300,margin:'0 auto',width:'100%',padding:'2rem 1.5rem',position:'relative',zIndex:1}}>
        {children}
      </main>
      <footer style={{borderTop:'1px solid rgba(245,166,35,0.1)',background:'rgba(13,15,20,0.88)',padding:'1.2rem 1.5rem',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:20,marginBottom:8,flexWrap:'wrap'}}>
          {SOCIAL.map(s=>(
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',gap:6,fontSize:'.78rem',color:'rgba(245,166,35,0.6)',textDecoration:'none',transition:'color 200ms'}}
              onMouseEnter={e=>e.currentTarget.style.color='#f5a623'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,166,35,0.6)'}>
              {s.icon}<span>{s.label}</span>
            </a>
          ))}
        </div>
        <p style={{margin:0,fontSize:'.72rem',color:'rgba(255,255,255,0.25)'}}>אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.</p>
      </footer>
    </div>
  )
}

function CosmicBackground() {
  const seed = (n) => ((n*9301+49297)%233280)/233280
  const stars = Array.from({length:90},(_,i)=>({
    x:seed(i*3)*100, y:seed(i*3+1)*100,
    r:0.4+seed(i*3+2)*1.6,
    op:0.18+seed(i*7)*0.7,
    c:i%7===0?'#f5a623':i%11===0?'#b0c8ff':i%17===0?'#ffd0a0':'#ffffff',
    dur:1.8+seed(i*13)*3.5
  }))
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      <svg style={{position:'absolute',width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="mw1" cx="18%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#f5a623" stopOpacity="0.045"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="mw2" cx="82%" cy="65%" r="48%">
            <stop offset="0%" stopColor="#5070b8" stopOpacity="0.04"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="mw3" cx="50%" cy="15%" r="40%">
            <stop offset="0%" stopColor="#a06030" stopOpacity="0.03"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="sat_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4a840" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#d4a840" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="jup_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c09050" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#c09050" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="sat_ring_g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8a050" stopOpacity="0"/>
            <stop offset="15%" stopColor="#d4b060" stopOpacity="0.55"/>
            <stop offset="50%" stopColor="#f0d070" stopOpacity="0.75"/>
            <stop offset="85%" stopColor="#d4b060" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#c8a050" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="sat_ring2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b89040" stopOpacity="0"/>
            <stop offset="20%" stopColor="#c8a050" stopOpacity="0.4"/>
            <stop offset="50%" stopColor="#d8b060" stopOpacity="0.55"/>
            <stop offset="80%" stopColor="#c8a050" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#b89040" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Milky Way glow bands */}
        <ellipse cx="18%" cy="38%" rx="42%" ry="75%" fill="url(#mw1)"/>
        <ellipse cx="82%" cy="65%" rx="38%" ry="68%" fill="url(#mw2)"/>
        <ellipse cx="50%" cy="15%" rx="32%" ry="48%" fill="url(#mw3)"/>

        {/* Twinkling stars */}
        {stars.map((s,i)=>(
          <circle key={i} cx={s.x+'%'} cy={s.y+'%'} r={s.r} fill={s.c} opacity={s.op}>
            <animate attributeName="opacity" values={s.op+';'+(s.op*0.12)+';'+s.op} dur={s.dur+'s'} repeatCount="indefinite"/>
          </circle>
        ))}

        {/* ===== SATURN — upper left ===== */}
        <g transform="translate(7%,16%)">
          {/* Outer glow */}
          <circle cx="0" cy="0" r="48" fill="url(#sat_glow)"/>
          {/* Ring behind planet (back half) */}
          <ellipse cx="0" cy="3" rx="52" ry="13" fill="url(#sat_ring_g)" opacity="0.55"/>
          <ellipse cx="0" cy="3" rx="40" ry="9" fill="url(#sat_ring2)" opacity="0.4"/>
          {/* Planet body */}
          <circle cx="0" cy="0" r="22" fill="#c8a060" opacity="0.65"/>
          <circle cx="0" cy="0" r="22" fill="none" stroke="#e8c070" strokeWidth="0.8" opacity="0.4"/>
          {/* Planet bands */}
          <path d="M-22,5 Q0,3 22,5" stroke="#a07030" strokeWidth="3.5" fill="none" opacity="0.45"/>
          <path d="M-21,-5 Q0,-6 21,-5" stroke="#b08040" strokeWidth="2" fill="none" opacity="0.35"/>
          <path d="M-18,10 Q0,9 18,10" stroke="#906020" strokeWidth="2" fill="none" opacity="0.3"/>
          <path d="M-18,-11 Q0,-12 18,-11" stroke="#c09848" strokeWidth="1.5" fill="none" opacity="0.28"/>
          {/* Highlight */}
          <ellipse cx="-6" cy="-7" rx="8" ry="5" fill="#f0d888" opacity="0.15"/>
          {/* Ring in front (front half) */}
          <path d="M-52,3 Q0,16 52,3" stroke="url(#sat_ring_g)" strokeWidth="8" fill="none" opacity="0.55"/>
          <path d="M-40,3 Q0,11 40,3" stroke="url(#sat_ring2)" strokeWidth="4" fill="none" opacity="0.4"/>
          {/* Moon */}
          <circle cx="62" cy="-18" r="5" fill="#d4c090" opacity="0.55"/>
          <circle cx="62" cy="-18" r="5" fill="none" stroke="#e8d0a0" strokeWidth="0.5" opacity="0.3"/>
        </g>

        {/* ===== JUPITER — lower right ===== */}
        <g transform="translate(91%,72%)">
          <circle cx="0" cy="0" r="42" fill="url(#jup_glow)"/>
          <circle cx="0" cy="0" r="26" fill="#c09858" opacity="0.55"/>
          <circle cx="0" cy="0" r="26" fill="none" stroke="#d4aa68" strokeWidth="0.8" opacity="0.3"/>
          {/* Jupiter bands */}
          <path d="M-26,-8 Q0,-6 26,-8" stroke="#a07838" strokeWidth="4" fill="none" opacity="0.5"/>
          <path d="M-26,0 Q0,2 26,0" stroke="#8a6028" strokeWidth="2.5" fill="none" opacity="0.45"/>
          <path d="M-26,8 Q0,6 26,8" stroke="#b08840" strokeWidth="3" fill="none" opacity="0.48"/>
          <path d="M-24,-15 Q0,-14 24,-15" stroke="#c0a050" strokeWidth="2" fill="none" opacity="0.32"/>
          <path d="M-22,14 Q0,13 22,14" stroke="#907030" strokeWidth="2" fill="none" opacity="0.3"/>
          {/* Great Red Spot */}
          <ellipse cx="9" cy="5" rx="7" ry="4" fill="#c04828" opacity="0.55"/>
          <ellipse cx="9" cy="5" rx="5" ry="2.5" fill="#d05030" opacity="0.4"/>
          {/* Highlight */}
          <ellipse cx="-7" cy="-8" rx="9" ry="6" fill="#f0d080" opacity="0.12"/>
          {/* Galilean moons */}
          <circle cx="-38" cy="-8" r="3.5" fill="#d0c090" opacity="0.5"/>
          <circle cx="-48" cy="4" r="2.5" fill="#c8b880" opacity="0.45"/>
          <circle cx="40" cy="-5" r="3" fill="#d4c898" opacity="0.48"/>
        </g>

        {/* ===== Small Mars — right side mid ===== */}
        <g transform="translate(96%,42%)">
          <circle cx="0" cy="0" r="18" fill="#c05830" opacity="0.25"/>
          <circle cx="0" cy="0" r="10" fill="#c05830" opacity="0.38"/>
          <circle cx="0" cy="0" r="10" fill="none" stroke="#d07040" strokeWidth="0.6" opacity="0.25"/>
          <path d="M-10,3 Q0,2 10,3" stroke="#a04020" strokeWidth="1.5" fill="none" opacity="0.3"/>
        </g>

        {/* ===== Constellation (top right) ===== */}
        <g opacity="0.38" fill="#b8d0ff">
          <circle cx="84%" cy="7%" r="2" opacity="0.9"/>
          <circle cx="88%" cy="10%" r="1.5" opacity="0.75"/>
          <circle cx="86%" cy="14%" r="2" opacity="0.85"/>
          <circle cx="91%" cy="13%" r="1.2" opacity="0.65"/>
          <circle cx="83%" cy="18%" r="1.8" opacity="0.8"/>
          <circle cx="89%" cy="19%" r="1" opacity="0.6"/>
          <line x1="84%" y1="7%" x2="88%" y2="10%" stroke="#b8d0ff" strokeWidth="0.5" opacity="0.35"/>
          <line x1="88%" y1="10%" x2="86%" y2="14%" stroke="#b8d0ff" strokeWidth="0.5" opacity="0.35"/>
          <line x1="86%" y1="14%" x2="91%" y2="13%" stroke="#b8d0ff" strokeWidth="0.5" opacity="0.3"/>
          <line x1="86%" y1="14%" x2="83%" y2="18%" stroke="#b8d0ff" strokeWidth="0.5" opacity="0.3"/>
          <line x1="83%" y1="18%" x2="89%" y2="19%" stroke="#b8d0ff" strokeWidth="0.5" opacity="0.25"/>
        </g>

        {/* ===== Shooting stars ===== */}
        <line x1="72%" y1="6%" x2="80%" y2="12%" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0;0.7;0;0" dur="6s" begin="1s" repeatCount="indefinite"/>
        </line>
        <line x1="28%" y1="4%" x2="36%" y2="9%" stroke="#f5a623" strokeWidth="1.2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0;0.55;0;0" dur="8s" begin="4s" repeatCount="indefinite"/>
        </line>
        <line x1="55%" y1="88%" x2="62%" y2="93%" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0;0.45;0;0" dur="7s" begin="9s" repeatCount="indefinite"/>
        </line>
      </svg>
    </div>
  )
}