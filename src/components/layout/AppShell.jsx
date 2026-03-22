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
  { href:'https://t.me/', label:'Telegram', color:'#229ED9',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path d="M5 11.5L19 6.5L15.5 18L11.5 14.5L9 17V13.5L16 7.5" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/></svg> },
  { href:'https://wa.me/', label:'WhatsApp', color:'#25D366',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-3.4-1.3L6 17.5l1.3-2.5A5 5 0 0 1 7 12a5 5 0 0 1 5-5z" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M9.5 10.5q.5-.5 1 0l.7 1.2q.2.4-.2.8l-.2.2q.7 1.2 2 1.4l.2-.2q.4-.4.8-.2l1.2.7q.5.5 0 1Q13.5 17 10.5 14 9 12 9.5 10.5z" fill="#fff"/></svg> },
  { href:'https://facebook.com/', label:'Facebook', color:'#1877F2',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M13.5 7H12Q10 7 10 9v1.5H8.5v2H10V18h2.5v-5.5H14l.5-2h-2V9.5q0-.5 1-.5z" fill="#fff"/></svg> },
  { href:'https://x.com/', label:'X', color:'#000',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#111"/><path d="M7 7h3l2.5 3.5L15 7h2l-3.5 5L18 17h-3l-2.5-3.8L9.5 17H7.5l3.7-5.2z" fill="#fff"/></svg> },
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
              <div style={{fontWeight:800,fontSize:'1.05rem',color:'#f5a623',letterSpacing:'.01em',lineHeight:1.2}}>גלילאו</div>
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
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {SOCIAL.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                style={{display:'flex',alignItems:'center',justifyContent:'center',width:28,height:28,borderRadius:'50%',transition:'transform 200ms',flexShrink:0}}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                {s.icon}
              </a>
            ))}
            <div style={{width:'1px',height:20,background:'rgba(255,255,255,0.1)',margin:'0 4px'}}/>
            {daysLeft <= 7 && (
              <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:20,padding:'4px 10px',fontSize:'.72rem',fontWeight:600,color:'#f5a623'}}>
                <Clock size={11}/> {daysLeft} ימים
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
      <footer style={{borderTop:'1px solid rgba(245,166,35,0.1)',background:'rgba(13,15,20,0.85)',padding:'1rem 1.5rem',textAlign:'center',position:'relative',zIndex:1}}>
        <p style={{margin:0,fontSize:'.75rem',color:'var(--color-text-muted)'}}>
          אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.
        </p>
      </footer>
    </div>
  )
}

function CosmicBackground() {
  const stars = [
    {x:4,y:8,r:1.2,op:.7,c:'#f5a623'},{x:12,y:3,r:.9,op:.55,c:'#fff'},
    {x:22,y:14,r:1,op:.45,c:'#fff'},{x:8,y:28,r:.8,op:.4,c:'#f5a623'},
    {x:3,y:48,r:1.3,op:.35,c:'#fff'},{x:18,y:62,r:.9,op:.38,c:'#fff'},
    {x:7,y:78,r:1.1,op:.42,c:'#f5a623'},{x:15,y:90,r:.8,op:.32,c:'#fff'},
    {x:96,y:5,r:1.2,op:.65,c:'#f5a623'},{x:88,y:18,r:.9,op:.5,c:'#fff'},
    {x:93,y:32,r:1.1,op:.45,c:'#fff'},{x:97,y:52,r:.8,op:.4,c:'#f5a623'},
    {x:91,y:68,r:1,op:.38,c:'#fff'},{x:95,y:82,r:.9,op:.35,c:'#fff'},
    {x:86,y:92,r:1.2,op:.42,c:'#f5a623'},
    {x:32,y:2,r:.9,op:.5,c:'#fff'},{x:50,y:1,r:1,op:.55,c:'#fff'},
    {x:68,y:3,r:.8,op:.48,c:'#fff'},{x:40,y:97,r:.9,op:.32,c:'#fff'},
    {x:60,y:98,r:1,op:.35,c:'#fff'}
  ]
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
      {/* Milky Way subtle arc */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="mw1" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#f5a623" stopOpacity="0.025"/>
            <stop offset="60%" stopColor="#a06040" stopOpacity="0.012"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="mw2" cx="75%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#4060a0" stopOpacity="0.03"/>
            <stop offset="70%" stopColor="#203060" stopOpacity="0.01"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* Milky way glow bands */}
        <ellipse cx="30%" cy="50%" rx="35%" ry="80%" fill="url(#mw1)"/>
        <ellipse cx="75%" cy="45%" rx="28%" ry="65%" fill="url(#mw2)"/>
        {/* Scattered micro-stars via SVG */}
        {[
          [8,15],[15,42],[25,67],[35,25],[45,80],[55,12],[65,55],[75,30],
          [82,70],[90,20],[10,88],[20,35],[30,90],[50,45],[70,85],[85,50],
          [5,60],[42,18],[58,72],[72,10],[88,88],[14,72],[62,38],[38,55],
          [78,60],[22,8],[48,92],[68,22]
        ].map(([x,y],i)=>(
          <circle key={i} cx={x+'%'} cy={y+'%'} r={i%3===0?1.1:0.7}
            fill={i%5===0?'#f5a623':'#ffffff'}
            opacity={0.15+((i*7)%20)*0.012}/>
        ))}
      </svg>
      {/* Twinkling stars (positioned %) */}
      {stars.map((s,i)=>(
        <div key={i} style={{
          position:'absolute',
          left:s.x+'%',top:s.y+'%',
          width:s.r*2+'px',height:s.r*2+'px',
          borderRadius:'50%',background:s.c,opacity:s.op,
          animationName:'tw',animationDuration:(2.5+i*0.28)+'s',
          animationTimingFunction:'ease-in-out',animationIterationCount:'infinite',
          animationDirection:'alternate'
        }}/>
      ))}
      <style>{'@keyframes tw{0%{opacity:var(--o,.5);transform:scale(1)}100%{opacity:.08;transform:scale(0.6)}}'}</style>
    </div>
  )
}