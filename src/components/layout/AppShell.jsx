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

export default function AppShell({user, children}) {
  const location = useLocation()
  const navigate = useNavigate()
  const daysLeft = useTrialTimer(user)
  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--color-bg)',position:'relative',overflow:'hidden'}}>
      <StarField/>
      <header style={{background:'rgba(13,15,20,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(245,166,35,0.15)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1300,margin:'0 auto',padding:'0 1.5rem',height:66,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link to="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10}}>
            <GalileoLogo size={46}/>
            <div>
              <div style={{fontWeight:800,fontSize:'.95rem',color:'#f5a623',letterSpacing:'.01em'}}>גלילאו</div>
              <div style={{fontSize:'.65rem',color:'rgba(245,166,35,0.55)',letterSpacing:'.15em',fontWeight:500}}>תצפיות שוק</div>
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
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {daysLeft <= 7 && (
              <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:20,padding:'4px 12px',fontSize:'.75rem',fontWeight:600,color:'#f5a623'}}>
                <Clock size={12}/> {daysLeft} ימים
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
      <footer style={{borderTop:'1px solid rgba(245,166,35,0.1)',background:'rgba(13,15,20,0.8)',padding:'1rem 1.5rem',textAlign:'center',position:'relative',zIndex:1}}>
        <p style={{margin:0,fontSize:'.75rem',color:'var(--color-text-muted)'}}>
          אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.
        </p>
      </footer>
    </div>
  )
}

function StarField() {
  const stars = [
    {x:'8%',y:'12%',r:1.5,op:0.7,color:'#f5a623'},
    {x:'15%',y:'28%',r:1,op:0.5,color:'#fff'},
    {x:'3%',y:'45%',r:1.2,op:0.4,color:'#fff'},
    {x:'22%',y:'8%',r:1,op:0.6,color:'#fff'},
    {x:'92%',y:'15%',r:1.5,op:0.65,color:'#f5a623'},
    {x:'88%',y:'35%',r:1,op:0.45,color:'#fff'},
    {x:'96%',y:'55%',r:1.2,op:0.5,color:'#fff'},
    {x:'78%',y:'6%',r:1,op:0.55,color:'#f5a623'},
    {x:'5%',y:'72%',r:1,op:0.35,color:'#fff'},
    {x:'18%',y:'88%',r:1.3,op:0.4,color:'#fff'},
    {x:'85%',y:'80%',r:1,op:0.38,color:'#fff'},
    {x:'93%',y:'92%',r:1.5,op:0.45,color:'#f5a623'},
    {x:'35%',y:'4%',r:1,op:0.5,color:'#fff'},
    {x:'65%',y:'3%',r:1.2,op:0.55,color:'#fff'},
    {x:'50%',y:'96%',r:1,op:0.35,color:'#fff'},
  ]
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      {stars.map((s,i) => (
        <div key={i} style={{
          position:'absolute',left:s.x,top:s.y,
          width:s.r*2,height:s.r*2,borderRadius:'50%',
          background:s.color,opacity:s.op,
          animation:'twinkle '+(2.5+i*0.3)+'s ease-in-out infinite alternate'
        }}/>
      ))}
      <style>{`
        @keyframes twinkle {
          0%{opacity:var(--op,0.5);transform:scale(1)}
          100%{opacity:calc(var(--op,0.5)*0.3);transform:scale(0.7)}
        }
        .card { background: var(--color-surface); border: 1px solid rgba(245,166,35,0.1); border-radius: 14px; }
        .card:hover { border-color: rgba(245,166,35,0.2); }
      `}</style>
    </div>
  )
}