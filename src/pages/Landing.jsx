import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TrendingUp, Shield, BookOpen, BarChart2, ArrowLeft, Star, Users, Zap, Newspaper, ChevronLeft } from 'lucide-react'

const ROW1 = ['SPY','QQQ','AAPL','MSFT','NVDA','GOOG','AMZN','META','TSLA','BRK-B','JPM','V','WMT','AVGO','LLY']
const ROW2 = ['XOM','JNJ','PG','MA','HD','COST','MCD','CSCO','PEP','KO','UNH','CVX','TMO','ABT','CRM']

const FEATURES=[
  {icon:BookOpen,title:'אקדמיה',desc:'מושגים פיננסיים בעברית עם דוגמאות חזותיות',color:'var(--color-accent)',path:'/academy'},
  {icon:BarChart2,title:'סקרינר מניות',desc:'חיפוש וניתוח מניות עם נתונים מקצועיים',color:'var(--color-info)',path:'/screener'},
  {icon:TrendingUp,title:'בניית תיק',desc:'בנה תיק עם ויזואליזציה לפי מגזרים',color:'var(--color-success)',path:'/portfolio'},
  {icon:Shield,title:'מנוע התזה',desc:'ניתוח אוטומטי עם התראות על סיכונים',color:'#8E7CC3',path:'/portfolio'},
  {icon:Star,title:'משקיעים גדולים',desc:'עקוב אחרי פורטפוליו של המשקיעים המובילים',color:'var(--color-accent2)',path:'/superinvestors'},
]

const STATIC_NEWS=[
  {
    title:'NVDA מציגה צמיחה של 122% בהכנסות — מה הצפוי בדוח הבא?',
    source:'MarketWatch', time:'לפני שעה', tag:'NVDA',
    img:'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80',
    desc:'נוידיה ממשיכה לשבור שיאים עם ביקוש עצום לשבבי AI. הרבעון הבא צפוי להיות חזק אף יותר על רקע הסכמים חדשים עם ספקי ענן.'
  },
  {title:'הפד שומר על הריבית — שוק האג"ח מגיב בירידות',source:'Reuters',time:'לפני 2 שעות',tag:'מאקרו'},
  {title:'AAPL מכריזה על תוכנית רכישה עצמית בהיקף $110 מיליארד',source:'Bloomberg',time:'לפני 3 שעות',tag:'AAPL'},
  {title:'S&P 500 שובר שיא חדש — האם המומנטום יימשך?',source:'CNBC',time:'לפני 4 שעות',tag:'SPY'},
  {title:'META צופה הכנסות מפרסום דיגיטלי של $40B ברבעון',source:'WSJ',time:'לפני 5 שעות',tag:'META'},
]

function StarField(){
  const stars=Array.from({length:70},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,r:Math.random()*1.4+0.3,dur:Math.random()*4+3,delay:Math.random()*5,op:Math.random()*0.5+0.1}))
  const planets=[
    {x:8,y:18,r:3.5,color:'var(--color-accent)',dur:9},{x:82,y:30,r:2.2,color:'var(--color-info)',dur:12},
    {x:55,y:72,r:1.8,color:'#8E7CC3',dur:15},{x:20,y:65,r:2.8,color:'var(--color-success)',dur:10},
    {x:70,y:12,r:1.5,color:'var(--color-accent2)',dur:13},{x:42,y:85,r:2,color:'#4FA8C4',dur:11},
  ]
  return(
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      <svg width="100%" height="100%" style={{position:'absolute',inset:0}}>
        <defs>
          {planets.map((p,i)=>(
            <radialGradient key={i} id={`pg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.85"/>
              <stop offset="100%" stopColor={p.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>
        {stars.map(s=>(
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff" opacity={s.op}>
            <animate attributeName="opacity" values={`${s.op};${s.op*0.15};${s.op}`} dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {planets.map((p,i)=>(
          <g key={i}>
            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={p.r*7} fill={`url(#pg${i})`} opacity="0.45">
              <animateTransform attributeName="transform" type="translate" values="0,0;0,-7;0,0" dur={`${p.dur}s`} repeatCount="indefinite"/>
            </circle>
            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill={p.color} opacity="0.9">
              <animateTransform attributeName="transform" type="translate" values="0,0;0,-7;0,0" dur={`${p.dur}s`} repeatCount="indefinite"/>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  )
}

function TickerRow({tickers,direction='normal',prices}){
  const items=[...tickers,...tickers,...tickers]
  return(
    <div style={{overflow:'hidden',width:'100%',maskImage:'linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%)'}}>
      <div style={{display:'flex',gap:'2.5rem',width:'max-content',animation:`ticker${direction==='reverse'?'Rev':'Fwd'} 50s linear infinite`,willChange:'transform',padding:'0.1rem 0'}}>
        {items.map((t,i)=>{
          const d=prices[t]; const up=d?d.change>=0:null
          return(
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',fontSize:'0.77rem',fontWeight:600,whiteSpace:'nowrap',padding:'0.28rem 0.8rem',borderRadius:'100px',background:up===null?'rgba(255,255,255,0.05)':up?'rgba(22,163,74,0.12)':'rgba(220,38,38,0.12)',border:`1px solid ${up===null?'var(--color-border)':up?'rgba(22,163,74,0.22)':'rgba(220,38,38,0.22)'}`,color:up===null?'rgba(255,255,255,0.5)':up?'var(--color-success)':'var(--color-danger)',transition:'all .2s'}}>
              <span style={{color:'rgba(255,255,255,0.75)',fontWeight:700,letterSpacing:'0.04em'}}>{t}</span>
              {d&&<><span>{d.price}</span><span style={{fontSize:'0.7rem',opacity:0.85}}>{up?'▲':'▼'}{Math.abs(d.change).toFixed(2)}%</span></>}
              {!d&&<span style={{opacity:0.3}}>—</span>}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Landing(){
  const navigate=useNavigate()
  const [prices,setPrices]=useState({})
  const [modal,setModal]=useState(null)

  useEffect(()=>{
    const all=[...ROW1,...ROW2]
    const init={}
    all.forEach(t=>{
      const base={AAPL:{p:'$213.50',c:1.2},NVDA:{p:'$875.40',c:-1.4},MSFT:{p:'$415.30',c:0.8},TSLA:{p:'$248.90',c:2.3},AMZN:{p:'$185.20',c:1.3},META:{p:'$502.10',c:-0.6},GOOG:{p:'$175.80',c:0.4},SPY:{p:'$527.20',c:0.5},QQQ:{p:'$448.60',c:0.7},'BRK-B':{p:'$410.30',c:-0.2},JPM:{p:'$208.40',c:1.1},V:{p:'$280.50',c:0.9},WMT:{p:'$79.20',c:0.3},AVGO:{p:'$162.80',c:-0.8},LLY:{p:'$890.40',c:1.5},XOM:{p:'$118.30',c:-0.4},JNJ:{p:'$152.60',c:0.6},PG:{p:'$168.40',c:0.2},MA:{p:'$480.20',c:1.0},HD:{p:'$342.80',c:-0.5},COST:{p:'$892.10',c:2.1},MCD:{p:'$295.30',c:0.3},CSCO:{p:'$56.80',c:-0.7},PEP:{p:'$162.40',c:0.4},KO:{p:'$68.90',c:0.1},UNH:{p:'$510.80',c:-1.2},CVX:{p:'$158.30',c:-0.3},TMO:{p:'$528.60',c:0.8},ABT:{p:'$125.40',c:0.5},CRM:{p:'$298.70',c:-0.9}}
      if(base[t]) init[t]={price:base[t].p,change:base[t].c}
    })
    setPrices(init)
    all.slice(0,20).forEach(t=>{
      fetch('/api/quote?ticker='+t).then(r=>r.json()).then(d=>{
        if(d?.price) setPrices(prev=>({...prev,[t]:{price:'$'+d.price.toFixed(2),change:d.changePercent||0}}))
      }).catch(()=>{})
    })
  },[])

  return(
  <div style={{minHeight:'100vh',direction:'rtl',fontFamily:'Heebo, sans-serif',background:'#F4EEE9',color:'#1D1D1B'}}>
    <style>{`
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      .v-link{color:#1D1D1B;text-decoration:none;font-size:.95rem;font-weight:400;padding:8px 12px;border-radius:8px;transition:color .18s ease;cursor:pointer}
      .v-link:hover{color:#3764DD}
      .v-pill{transition:transform .18s ease, box-shadow .18s ease, background .18s ease}
      .v-pill:hover{transform:translateY(-1px)}
      .v-card{transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease}
      .v-card:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(29,29,27,0.08);border-color:rgba(29,29,27,0.16)}
      @media (max-width:760px){.v-nav{display:none}}
    `}</style>

    {/* ===== HEADER ===== */}
    <header style={{position:'sticky',top:0,zIndex:200,background:'#F4EEE9',borderBottom:'1px solid rgba(29,29,27,0.08)'}}>
      <div style={{maxWidth:1240,margin:'0 auto',height:76,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem'}}>
        <div style={{display:'flex',alignItems:'baseline',gap:10,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <span style={{fontFamily:"'Frank Ruhl Libre', serif",fontSize:'1.6rem',fontWeight:600,lineHeight:1}}>גלילאו</span>
          <span style={{fontSize:'.68rem',letterSpacing:'.16em',color:'#8B8B84',fontWeight:500}}>תצפיות שוק</span>
        </div>
        <nav className="v-nav" style={{display:'flex',alignItems:'center',gap:4}}>
          <span className="v-link" onClick={()=>navigate('/academy')}>אקדמיה</span>
          <span className="v-link" onClick={()=>navigate('/screener')}>סקרינר</span>
          <span className="v-link" onClick={()=>navigate('/articles')}>מאמרים</span>
          <span className="v-link" onClick={()=>navigate('/superinvestors')}>משקיעים גדולים</span>
          <span className="v-link" onClick={()=>navigate('/pricing')}>מסלולים</span>
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button className="v-pill" onClick={()=>navigate('/auth')} style={{background:'transparent',border:'1px solid rgba(29,29,27,0.25)',borderRadius:999,padding:'0.55rem 1.3rem',fontSize:'.9rem',fontWeight:500,color:'#1D1D1B',cursor:'pointer',fontFamily:'inherit'}}>כניסה</button>
          <button className="v-pill" onClick={()=>navigate('/auth')} style={{background:'#3764DD',border:'none',borderRadius:999,padding:'0.55rem 1.4rem',fontSize:'.9rem',fontWeight:500,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>הצטרף חינם</button>
        </div>
      </div>
    </header>

    {/* ===== HERO ===== */}
    <section style={{maxWidth:1240,margin:'0 auto',padding:'7rem 2rem 5rem',textAlign:'center',animation:'fadeUp .7s ease both'}}>
      <h1 style={{fontFamily:"'Frank Ruhl Libre', serif",fontSize:'clamp(2.8rem,6vw,4.6rem)',fontWeight:500,lineHeight:1.12,margin:'0 0 1.6rem',letterSpacing:'-0.01em'}}>
        השקע <span style={{color:'#3764DD'}}>חכם יותר</span>
        <br/>עם נתוני שוק אמיתיים
      </h1>
      <p style={{maxWidth:560,margin:'0 auto 2.6rem',fontSize:'1.15rem',fontWeight:300,lineHeight:1.75,color:'#55554F'}}>
        גישה למדדים בזמן אמת, ניתוח מניות מעמיק, מעקב תיק השקעות ואקדמיה פיננסית בעברית — הכל במקום אחד.
      </p>
      <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
        <button className="v-pill" onClick={()=>navigate('/auth')} style={{background:'#3764DD',border:'none',borderRadius:999,padding:'0.85rem 2.2rem',fontSize:'1rem',fontWeight:500,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>התחל בחינם</button>
        <button className="v-pill" onClick={()=>navigate('/dashboard')} style={{background:'transparent',border:'1px solid rgba(29,29,27,0.25)',borderRadius:999,padding:'0.85rem 2.2rem',fontSize:'1rem',fontWeight:500,color:'#1D1D1B',cursor:'pointer',fontFamily:'inherit'}}>צפה בדמו</button>
      </div>
      <div style={{marginTop:'2.2rem',fontSize:'.82rem',color:'#8B8B84'}}>נתוני שוק בזמן אמת ממקורות מוסדיים · ביטול בכל עת</div>
    </section>

    {/* ===== FEATURES ===== */}
    <section style={{maxWidth:1240,margin:'0 auto',padding:'3rem 2rem 6rem'}}>
      <h2 style={{fontFamily:"'Frank Ruhl Libre', serif",fontSize:'clamp(1.9rem,3.6vw,2.8rem)',fontWeight:500,textAlign:'center',margin:'0 0 .8rem'}}>
        כלים <span style={{color:'#3764DD'}}>מקצועיים</span> לכל משקיע
      </h2>
      <p style={{textAlign:'center',fontWeight:300,color:'#55554F',margin:'0 0 3rem'}}>כל מה שצריך כדי להשקיע בביטחון</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:18}}>
        {FEATURES.map(f=>{const Icon=f.icon; return(
          <div key={f.title} className="v-card" onClick={()=>navigate('/auth')} style={{background:'#FFFFFF',border:'1px solid rgba(29,29,27,0.10)',borderRadius:16,padding:'1.8rem 1.5rem',cursor:'pointer'}}>
            <div style={{width:44,height:44,borderRadius:12,background:'rgba(55,100,221,0.10)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,color:'#3764DD'}}><Icon size={20}/></div>
            <div style={{fontFamily:"'Frank Ruhl Libre', serif",fontSize:'1.15rem',fontWeight:600,marginBottom:6}}>{f.title}</div>
            <div style={{fontSize:'.9rem',fontWeight:300,lineHeight:1.65,color:'#55554F'}}>{f.desc}</div>
          </div>
        )})}
      </div>
    </section>

    {/* ===== CTA ===== */}
    <section style={{maxWidth:1240,margin:'0 auto',padding:'0 2rem 6rem'}}>
      <div style={{background:'#3764DD',borderRadius:24,padding:'4rem 2rem',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontFamily:"'Frank Ruhl Libre', serif",fontSize:'clamp(1.8rem,3.4vw,2.6rem)',fontWeight:500,margin:'0 0 .8rem'}}>מוכנים להתחיל?</h2>
        <p style={{fontWeight:300,opacity:.85,margin:'0 0 2rem'}}>הצטרפו למשקיעים שכבר עוקבים אחרי השוק עם גלילאו — 7 ימי ניסיון חינם.</p>
        <button className="v-pill" onClick={()=>navigate('/auth')} style={{background:'#fff',border:'none',borderRadius:999,padding:'0.85rem 2.4rem',fontSize:'1rem',fontWeight:600,color:'#3764DD',cursor:'pointer',fontFamily:'inherit'}}>פתח חשבון חינם</button>
      </div>
    </section>

    {/* ===== FOOTER ===== */}
    <footer style={{borderTop:'1px solid rgba(29,29,27,0.10)'}}>
      <div style={{maxWidth:1240,margin:'0 auto',padding:'2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <span style={{fontSize:'.8rem',color:'#8B8B84'}}>© {new Date().getFullYear()} גלילאו — תצפיות שוק</span>
        <div style={{display:'flex',gap:18}}>
          <span className="v-link" style={{fontSize:'.8rem',padding:0}} onClick={()=>navigate('/terms')}>תנאי שימוש</span>
          <span className="v-link" style={{fontSize:'.8rem',padding:0}} onClick={()=>navigate('/privacy')}>מדיניות פרטיות</span>
        </div>
        <span style={{fontSize:'.75rem',color:'#8B8B84'}}>המידע באתר אינו מהווה ייעוץ השקעות</span>
      </div>
    </footer>
  </div>
)
}
