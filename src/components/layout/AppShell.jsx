import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Search, PieChart, LogOut, Clock, FileText, Calculator } from 'lucide-react'
import { signOut } from '../../services/supabase.js'
import { useTrialTimer } from '../../hooks/useAuth.js'

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
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--color-bg)'}}>
      <header style={{background:'rgba(13,15,20,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid var(--color-border)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1300,margin:'0 auto',padding:'0 1.5rem',height:62,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link to="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,background:'linear-gradient(135deg,#f5a623,#e8871a)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 14px rgba(245,166,35,0.35)'}}>
              <span style={{color:'#0d0f14',fontSize:17,fontWeight:800}}>G</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'.88rem',color:'var(--color-text-primary)'}}>משקיעים עם גלילאו</div>
              <div style={{fontSize:'.6rem',color:'var(--color-accent)',letterSpacing:'.12em',fontWeight:600,opacity:.8}}>GALILEO INVESTORS</div>
            </div>
          </Link>
          <nav style={{display:'flex',alignItems:'center',gap:2}}>
            {NAV.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:9,textDecoration:'none',fontSize:'.83rem',fontWeight:active?600:500,color:active?'var(--color-accent)':'var(--color-text-secondary)',background:active?'rgba(245,166,35,0.1)':'transparent',border:active?'1px solid rgba(245,166,35,0.2)':'1px solid transparent',transition:'all 180ms'}}>
                  <Icon size={14}/>{item.label}
                </Link>
              )
            })}
          </nav>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {daysLeft <= 7 && (
              <div style={{display:'flex',alignItems:'center',gap:6,background:daysLeft<=3?'rgba(245,166,35,0.12)':'var(--color-surface)',border:'1px solid '+(daysLeft<=3?'rgba(245,166,35,0.35)':'var(--color-border2)'),borderRadius:20,padding:'4px 12px',fontSize:'.75rem',fontWeight:600,color:daysLeft<=3?'var(--color-accent)':'var(--color-text-secondary)'}}>
                <Clock size={12}/> {daysLeft} ימים נותרו
              </div>
            )}
            <span style={{fontSize:'.78rem',color:'var(--color-text-muted)',background:'var(--color-surface)',padding:'4px 10px',borderRadius:8,border:'1px solid var(--color-border)'}}>
              {user?.email?.split('@')[0]}
            </span>
            <button onClick={handleSignOut} title="יציאה" style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center',padding:6,borderRadius:7,transition:'all 180ms'}}
              onMouseEnter={e=>e.currentTarget.style.color='var(--color-danger)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}>
              <LogOut size={15}/>
            </button>
          </div>
        </div>
      </header>
      <main style={{flex:1,maxWidth:1300,margin:'0 auto',width:'100%',padding:'2rem 1.5rem'}}>
        {children}
      </main>
      <footer style={{borderTop:'1px solid var(--color-border)',background:'var(--color-bg2)',padding:'1rem 1.5rem',textAlign:'center'}}>
        <p style={{margin:0,fontSize:'.75rem',color:'var(--color-text-muted)'}}>
          אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון.
        </p>
      </footer>
    </div>
  )
}