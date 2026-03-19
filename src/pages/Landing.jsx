import { useNavigate } from 'react-router-dom'
import { TrendingUp, Shield, BookOpen, BarChart2, ArrowLeft, Star } from 'lucide-react'

const FEATURES=[
  {icon:BookOpen,title:'אקדמיה',desc:'מושגים פיננסיים בעברית עם דוגמאות חזותיות',color:'#f5a623'},
  {icon:BarChart2,title:'סקרינר מניות',desc:'חיפוש וניתוח מניות עם נתונים מקצועיים',color:'#4f8ef7'},
  {icon:TrendingUp,title:'בניית תיק',desc:'בנה תיק עם ויזואליזציה לפי מגזרים',color:'#2dd87a'},
  {icon:Shield,title:'מנוע התזה',desc:'ניתוח אוטומטי עם התראות על סיכונים',color:'#a855f7'},
]

const TICKERS = [
  {t:'AAPL',p:'$189.50',c:'+1.2%',up:true},
  {t:'NVDA',p:'$875.40',c:'-1.4%',up:false},
  {t:'MSFT',p:'$415.30',c:'+0.8%',up:true},
  {t:'TSLA',p:'$248.90',c:'+2.3%',up:true},
  {t:'AMZN',p:'$185.20',c:'+1.3%',up:true},
  {t:'META',p:'$502.10',c:'-0.6%',up:false},
]

export default function Landing(){
  const navigate=useNavigate()
  return(
    <div style={{minHeight:'100vh',direction:'rtl',fontFamily:'Heebo,sans-serif',background:'var(--color-bg)',overflowX:'hidden'}}>
      
      {/* Ambient background */}
      <div style={{position:'fixed',top:0,right:0,width:600,height:600,background:'radial-gradient(circle,rgba(245,166,35,0.06) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'fixed',bottom:0,left:0,width:500,height:500,background:'radial-gradient(circle,rgba(79,142,247,0.06) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:100,background:'rgba(13,15,20,0.85)',backdropFilter:'blur(20px)',borderBottom:'1px solid var(--color-border)',padding:'0 2rem'}}>
        <div style={{maxWidth:1200,margin:'0 auto',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,background:'linear-gradient(135deg,#f5a623,#e8871a)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 16px rgba(245,166,35,0.4)'}}>
              <span style={{color:'#0d0f14',fontSize:18,fontWeight:800}}>G</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'0.95rem',color:'var(--color-text-primary)'}}>משקיעים עם גלילאו</div>
              <div style={{fontSize:'0.65rem',color:'var(--color-accent)',letterSpacing:'0.1em',fontWeight:600}}>GALILEO INVESTORS</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn-secondary" onClick={()=>navigate('/auth')} style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem'}}>כניסה</button>
            <button className="btn-primary" onClick={()=>navigate('/auth?mode=signup')} style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem'}}>התחל בחינם</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{position:'relative',zIndex:1,padding:'5rem 2rem 4rem',textAlign:'center',maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.25)',color:'var(--color-accent)',borderRadius:20,padding:'5px 16px',fontSize:'0.8rem',fontWeight:600,marginBottom:'2rem',backdropFilter:'blur(8px)'}}>
          <Star size={12} fill="currentColor"/>
          חודש ניסיון חינם — ללא כרטיס אשראי
        </div>
        <h1 style={{fontSize:'clamp(2.2rem,5vw,3.5rem)',fontWeight:800,lineHeight:1.15,margin:'0 0 1.5rem',background:'linear-gradient(135deg,#f0f2f8 30%,#9aa0b8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          כלים, ידע ובניית<br/>תיק השקעות חכם
        </h1>
        <p style={{fontSize:'1.1rem',color:'var(--color-text-secondary)',margin:'0 0 2.5rem',lineHeight:1.8,maxWidth:580,marginLeft:'auto',marginRight:'auto'}}>
          מבוסס על תזת ההשקעות של גלילאו — גישה מקצועית לשוק ההון לכל משקיע
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button className="btn-accent" onClick={()=>navigate('/auth?mode=signup')} style={{display:'flex',alignItems:'center',gap:8,fontSize:'1rem'}}>
            התחל ניסיון חינם <ArrowLeft size={18}/>
          </button>
          <button className="btn-secondary" onClick={()=>navigate('/auth')}>כבר יש לי חשבון</button>
        </div>
      </section>

      {/* Live ticker strip */}
      <div style={{position:'relative',zIndex:1,background:'var(--color-surface)',borderTop:'1px solid var(--color-border)',borderBottom:'1px solid var(--color-border)',padding:'0.875rem 2rem',overflow:'hidden'}}>
        <div style={{display:'flex',gap:'2.5rem',justifyContent:'center',flexWrap:'wrap'}}>
          {TICKERS.map(t=>(
            <div key={t.t} style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'0.82rem',color:'var(--color-accent)',letterSpacing:'0.05em'}}>{t.t}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.82rem',color:'var(--color-text-primary)',fontWeight:600,direction:'ltr'}}>{t.p}</span>
              <span style={{fontSize:'0.75rem',fontWeight:700,direction:'ltr',color:t.up?'var(--color-success)':'var(--color-danger)'}}>{t.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{position:'relative',zIndex:1,padding:'4rem 2rem',maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h2 style={{fontSize:'1.8rem',fontWeight:700,margin:'0 0 0.75rem',color:'var(--color-text-primary)'}}>מה תמצאו בפלטפורמה</h2>
          <p style={{color:'var(--color-text-secondary)',margin:0,fontSize:'0.95rem'}}>ארבעה מודולים שיהפכו אותך למשקיע חכם יותר</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1.25rem'}}>
          {FEATURES.map(({icon:Icon,title,desc,color})=>(
            <div key={title} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.5rem',transition:'all 250ms',cursor:'default'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=color+'44';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 32px ${color}18`}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
              <div style={{width:48,height:48,background:color+'18',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.1rem',border:`1px solid ${color}30`}}>
                <Icon size={22} style={{color}}/>
              </div>
              <h3 style={{fontSize:'1rem',fontWeight:700,margin:'0 0 0.5rem',color:'var(--color-text-primary)'}}>{title}</h3>
              <p style={{fontSize:'0.875rem',color:'var(--color-text-secondary)',margin:0,lineHeight:1.65}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{position:'relative',zIndex:1,padding:'3rem 2rem',maxWidth:800,margin:'0 auto'}}>
        <div style={{background:'var(--color-surface)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:16,padding:'2.5rem',boxShadow:'0 0 40px rgba(245,166,35,0.08)',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'2rem',textAlign:'center'}}>
          {[['12+','מושגי השקעה'],['Real-time','נתוני מניות'],['100%','בעברית'],['חינם','לחודש ראשון']].map(([v,l])=>(
            <div key={l}>
              <div style={{fontSize:'1.6rem',fontWeight:800,color:'var(--color-accent)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
              <div style={{fontSize:'0.8rem',color:'var(--color-text-secondary)'}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{position:'relative',zIndex:1,padding:'4rem 2rem 5rem',textAlign:'center'}}>
        <div style={{background:'linear-gradient(135deg,rgba(245,166,35,0.08) 0%,rgba(79,142,247,0.06) 100%)',border:'1px solid rgba(245,166,35,0.15)',borderRadius:20,padding:'3.5rem 2rem',maxWidth:640,margin:'0 auto'}}>
          <h2 style={{fontSize:'1.8rem',fontWeight:800,margin:'0 0 1rem',color:'var(--color-text-primary)'}}>מוכנים להתחיל?</h2>
          <p style={{color:'var(--color-text-secondary)',margin:'0 0 2rem',fontSize:'0.95rem',lineHeight:1.7}}>חודש ניסיון מלא — ללא התחייבות וללא כרטיס אשראי</p>
          <button className="btn-accent" onClick={()=>navigate('/auth?mode=signup')} style={{fontSize:'1rem'}}>
            פתח חשבון חינם עכשיו
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{position:'relative',zIndex:1,borderTop:'1px solid var(--color-border)',padding:'1.5rem 2rem',textAlign:'center',background:'var(--color-bg2)'}}>
        <p style={{margin:0,fontSize:'0.78rem',color:'var(--color-text-muted)'}}>
          אין לראות במידע המוצג באתר המלצה לפעולות בשוק ההון. © 2026 משקיעים עם גלילאו
        </p>
      </footer>
    </div>
  )
}