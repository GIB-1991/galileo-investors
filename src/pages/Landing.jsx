import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { TrendingUp, Shield, BookOpen, BarChart2, ArrowLeft, Star, Users, Zap, Newspaper } from 'lucide-react'

const ROW1 = ['SPY','QQQ','AAPL','MSFT','NVDA','GOOG','AMZN','META','TSLA','BRK-B','JPM','V','WMT','AVGO','LLY']
const ROW2 = ['XOM','JNJ','PG','MA','HD','COST','MCD','CSCO','PEP','KO','UNH','CVX','TMO','ABT','CRM']

const FEATURES=[
  {icon:BookOpen,title:'אקדמיה',desc:'מושגים פיננסיים בעברית עם דוגמאות חזותיות',color:'#f5a623'},
  {icon:BarChart2,title:'סקרינר מניות',desc:'חיפוש וניתוח מניות עם נתונים מקצועיים',color:'#4f8ef7'},
  {icon:TrendingUp,title:'בניית תיק',desc:'בנה תיק עם ויזואליזציה לפי מגזרים',color:'#2dd87a'},
  {icon:Shield,title:'מנוע התזה',desc:'ניתוח אוטומטי עם התראות על סיכונים',color:'#a855f7'},
]

const STATIC_NEWS=[
  {title:'NVDA מציגה צמיחה של 122% בהכנסות — מה הצפוי בדוח הבא?',source:'MarketWatch',time:'לפני שעה',tag:'NVDA'},
  {title:'הפד שומר על הריבית — שוק האג"ח מגיב בירידות',source:'Reuters',time:'לפני 2 שעות',tag:'מאקרו'},
  {title:'AAPL מכריזה על תוכנית רכישה עצמית בהיקף $110 מיליארד',source:'Bloomberg',time:'לפני 3 שעות',tag:'AAPL'},
  {title:'S&P 500 שובר שיא חדש — האם המומנטום יימשך?',source:'CNBC',time:'לפני 4 שעות',tag:'SPY'},
  {title:'META צופה הכנסות מפרסום דיגיטלי של $40B ברבעון',source:'WSJ',time:'לפני 5 שעות',tag:'META'},
  {title:'וול סטריט ממליצה: 5 מניות לצפות ב-2025',source:'Seeking Alpha',time:'לפני 6 שעות',tag:'מניות'},
]

// Stars component — animated floating stars & planets
function StarField(){
  const stars=Array.from({length:60},(_,i)=>({
    id:i,
    x:Math.random()*100,
    y:Math.random()*100,
    r:Math.random()*1.5+0.3,
    dur:Math.random()*4+3,
    delay:Math.random()*5,
    opacity:Math.random()*0.5+0.1,
  }))
  const planets=[
    {x:15,y:20,r:3,color:'#f5a623',glow:'rgba(245,166,35,0.3)',dur:8},
    {x:80,y:35,r:2,color:'#4f8ef7',glow:'rgba(79,142,247,0.25)',dur:11},
    {x:60,y:75,r:1.5,color:'#a855f7',glow:'rgba(168,85,247,0.2)',dur:14},
    {x:25,y:65,r:2.5,color:'#2dd87a',glow:'rgba(45,216,122,0.2)',dur:9},
  ]
  return(
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      <svg width="100%" height="100%" style={{position:'absolute',inset:0}}>
        <defs>
          {planets.map((p,i)=>(
            <radialGradient key={i} id={`pg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={p.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>
        {stars.map(s=>(
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff" opacity={s.opacity}>
            <animate attributeName="opacity" values={`${s.opacity};${s.opacity*0.2};${s.opacity}`} dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {planets.map((p,i)=>(
          <g key={i}>
            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={p.r*6} fill={`url(#pg${i})`} opacity="0.5">
              <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur={`${p.dur}s`} repeatCount="indefinite"/>
            </circle>
            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill={p.color} opacity="0.85">
              <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur={`${p.dur}s`} repeatCount="indefinite"/>
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
    <div style={{overflow:'hidden',width:'100%',maskImage:'linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)'}}>
      <div style={{display:'flex',gap:'2rem',width:'max-content',animation:`ticker${direction==='reverse'?'Rev':'Fwd'} 45s linear infinite`,willChange:'transform'}}>
        {items.map((t,i)=>{
          const d=prices[t]
          const up=d?d.change>=0:null
          return(
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'0.45rem',fontSize:'0.76rem',fontWeight:600,whiteSpace:'nowrap',padding:'0.3rem 0.75rem',borderRadius:'100px',background:up===null?'rgba(255,255,255,0.04)':up?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)',border:`1px solid ${up===null?'rgba(255,255,255,0.08)':up?'rgba(22,163,74,0.2)':'rgba(220,38,38,0.2)'}`,color:up===null?'rgba(255,255,255,0.45)':up?'#4ade80':'#f87171'}}>
              <span style={{color:'rgba(255,255,255,0.7)',fontWeight:700,letterSpacing:'0.03em'}}>{t}</span>
              {d&&<><span>{d.price}</span><span style={{opacity:0.85}}>{up?'▲':'▼'}{Math.abs(d.change).toFixed(2)}%</span></>}
              {!d&&<span style={{opacity:0.35}}>—</span>}
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
  const [news,setNews]=useState(STATIC_NEWS)

  useEffect(()=>{
    const all=[...ROW1,...ROW2]
    const init={}
    all.forEach(t=>{
      const vals=[
        {t:'AAPL',p:'$213.50',c:1.2},{t:'NVDA',p:'$875.40',c:-1.4},{t:'MSFT',p:'$415.30',c:0.8},
        {t:'TSLA',p:'$248.90',c:2.3},{t:'AMZN',p:'$185.20',c:1.3},{t:'META',p:'$502.10',c:-0.6},
        {t:'GOOG',p:'$175.80',c:0.4},{t:'SPY',p:'$527.20',c:0.5},{t:'QQQ',p:'$448.60',c:0.7},
        {t:'BRK-B',p:'$410.30',c:-0.2},{t:'JPM',p:'$208.40',c:1.1},{t:'V',p:'$280.50',c:0.9},
        {t:'WMT',p:'$79.20',c:0.3},{t:'AVGO',p:'$162.80',c:-0.8},{t:'LLY',p:'$890.40',c:1.5},
        {t:'XOM',p:'$118.30',c:-0.4},{t:'JNJ',p:'$152.60',c:0.6},{t:'PG',p:'$168.40',c:0.2},
        {t:'MA',p:'$480.20',c:1.0},{t:'HD',p:'$342.80',c:-0.5},{t:'COST',p:'$892.10',c:2.1},
        {t:'MCD',p:'$295.30',c:0.3},{t:'CSCO',p:'$56.80',c:-0.7},{t:'PEP',p:'$162.40',c:0.4},
        {t:'KO',p:'$68.90',c:0.1},{t:'UNH',p:'$510.80',c:-1.2},{t:'CVX',p:'$158.30',c:-0.3},
        {t:'TMO',p:'$528.60',c:0.8},{t:'ABT',p:'$125.40',c:0.5},{t:'CRM',p:'$298.70',c:-0.9},
      ].find(v=>v.t===t)
      if(vals) init[t]={price:vals.p,change:vals.c}
    })
    setPrices(init)
    all.slice(0,20).forEach(t=>{
      fetch('/api/quote?ticker='+t).then(r=>r.json()).then(d=>{
        if(d?.price) setPrices(prev=>({...prev,[t]:{price:'$'+d.price.toFixed(2),change:d.changePercent||0}}))
      }).catch(()=>{})
    })
  },[])

  return(
    <div style={{minHeight:'100vh',direction:'rtl',fontFamily:'Heebo,sans-serif',background:'#0a0b0f',color:'#fff',overflow:'hidden'}}>
      <style>{`
        @keyframes tickerFwd{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
        @keyframes tickerRev{0%{transform:translateX(-33.333%)}100%{transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .hero-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,166,35,0.4)!important}
        .hero-btn{transition:all .2s ease}
        .sec-btn:hover{background:rgba(255,255,255,0.08)!important}
        .sec-btn{transition:all .2s ease}
        .feat-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,0.12)!important}
        .feat-card{transition:all .25s ease}
        .news-card:hover{background:rgba(255,255,255,0.06)!important;border-color:rgba(255,255,255,0.1)!important}
        .news-card{transition:all .2s ease}
      `}</style>

      <StarField/>

      {/* Ambient glows */}
      <div style={{position:'fixed',top:-200,right:-200,width:700,height:700,background:'radial-gradient(circle,rgba(245,166,35,0.12) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'fixed',bottom:-200,left:-200,width:600,height:600,background:'radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:100,background:'rgba(10,11,15,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,background:'linear-gradient(135deg,#f5a623,#e8871a)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#0a0b0f',fontSize:18,fontWeight:800}}>G</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'0.95rem',color:'#fff'}}>משקיעים עם גלילאו</div>
              <div style={{fontSize:'0.6rem',color:'#f5a623',letterSpacing:'0.12em',fontWeight:600,textTransform:'uppercase',opacity:0.8}}>MARKET INTELLIGENCE</div>
            </div>
          </div>
          <div style={{display:'flex',gap:'0.75rem'}}>
            <button className="sec-btn" onClick={()=>navigate('/auth')} style={{padding:'0.5rem 1.25rem',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',cursor:'pointer',fontSize:'0.85rem',fontWeight:500}}>כניסה</button>
            <button className="hero-btn" onClick={()=>navigate('/auth')} style={{padding:'0.5rem 1.25rem',borderRadius:8,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#0a0b0f',cursor:'pointer',fontSize:'0.85rem',fontWeight:700}}>הצטרף חינם</button>
          </div>
        </div>
      </header>

      {/* Ticker Row 1 */}
      <div style={{padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)',position:'relative',zIndex:1}}>
        <TickerRow tickers={ROW1} direction="normal" prices={prices}/>
      </div>

      {/* Hero */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'5rem 2rem 4rem',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'0.35rem 1rem',borderRadius:100,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.25)',color:'#f5a623',fontSize:'0.78rem',fontWeight:600,marginBottom:'2rem',animation:'fadeUp 0.6s ease both'}}>
          <Zap size={12}/> פלטפורמת ההשקעות המובילה לישראלים
        </div>
        <h1 style={{fontSize:'clamp(2.2rem,5vw,3.8rem)',fontWeight:800,lineHeight:1.15,margin:'0 0 1.5rem',animation:'fadeUp 0.6s ease 0.1s both',letterSpacing:'-0.02em'}}>
          השקע <span style={{background:'linear-gradient(135deg,#f5a623,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>חכם יותר</span><br/>עם נתוני שוק אמיתיים
        </h1>
        <p style={{fontSize:'1.1rem',color:'rgba(255,255,255,0.55)',maxWidth:560,margin:'0 auto 2.5rem',lineHeight:1.7,animation:'fadeUp 0.6s ease 0.2s both'}}>
          גישה למדדים בזמן אמת, ניתוח מניות מעמיק, מעקב תיק השקעות ואקדמיה פיננסית בעברית — הכל במקום אחד.
        </p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',animation:'fadeUp 0.6s ease 0.3s both'}}>
          <button className="hero-btn" onClick={()=>navigate('/auth')} style={{display:'flex',alignItems:'center',gap:8,padding:'0.8rem 2rem',borderRadius:10,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#0a0b0f',cursor:'pointer',fontSize:'0.95rem',fontWeight:700,boxShadow:'0 4px 20px rgba(245,166,35,0.3)'}}>
            התחל בחינם <ArrowLeft size={16}/>
          </button>
          <button className="sec-btn" onClick={()=>navigate('/dashboard')} style={{display:'flex',alignItems:'center',gap:8,padding:'0.8rem 2rem',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.85)',cursor:'pointer',fontSize:'0.95rem',fontWeight:600}}>
            צפה בדמו
          </button>
        </div>
        <div style={{marginTop:'2.5rem',display:'flex',justifyContent:'center',alignItems:'center',gap:'0.5rem',animation:'fadeUp 0.6s ease 0.4s both',opacity:0.45,fontSize:'0.8rem'}}>
          <Users size={13}/> נתוני שוק בזמן אמת ממקורות מוסדיים
          <span style={{margin:'0 0.5rem'}}>·</span>
          <Star size={13}/> גלילאו 2025
        </div>
      </section>

      {/* Ticker Row 2 — reversed */}
      <div style={{padding:'0.75rem 0',borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)',position:'relative',zIndex:1}}>
        <TickerRow tickers={ROW2} direction="reverse" prices={prices}/>
      </div>

      {/* Features */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'5rem 2rem 3rem',position:'relative',zIndex:1}}>
        <h2 style={{textAlign:'center',fontSize:'1.8rem',fontWeight:700,marginBottom:'0.75rem',letterSpacing:'-0.01em'}}>כלים מקצועיים לכל משקיע</h2>
        <p style={{textAlign:'center',color:'rgba(255,255,255,0.45)',marginBottom:'3rem',fontSize:'0.95rem'}}>כל מה שצריך כדי להשקיע בביטחון</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1.25rem'}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat-card" style={{padding:'1.75rem',borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer'}} onClick={()=>navigate('/dashboard')}>
              <div style={{width:44,height:44,borderRadius:12,background:f.color+'20',border:`1px solid ${f.color}40`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                <f.icon size={20} color={f.color}/>
              </div>
              <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'0.5rem'}}>{f.title}</div>
              <div style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.45)',lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* News Feed */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'1rem 2rem 5rem',position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1.5rem'}}>
          <Newspaper size={18} color='#f5a623'/>
          <h2 style={{fontSize:'1.3rem',fontWeight:700,margin:0}}>חדשות שוק</h2>
          <span style={{marginRight:'auto',fontSize:'0.75rem',color:'rgba(255,255,255,0.35)'}}>מתעדכן בזמן אמת</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'0.85rem'}}>
          {news.map((item,i)=>(
            <div key={i} className="news-card" onClick={()=>navigate('/articles')} style={{padding:'1rem 1.25rem',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',cursor:'pointer',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.25rem'}}>
                <span style={{fontSize:'0.68rem',fontWeight:700,padding:'0.2rem 0.6rem',borderRadius:100,background:'rgba(245,166,35,0.12)',color:'#f5a623',border:'1px solid rgba(245,166,35,0.2)'}}>{item.tag}</span>
                <span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.3)',marginRight:'auto'}}>{item.time}</span>
              </div>
              <div style={{fontSize:'0.88rem',fontWeight:500,color:'rgba(255,255,255,0.85)',lineHeight:1.5}}>{item.title}</div>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.3)'}}>{item.source}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:'1.5rem'}}>
          <button className="sec-btn" onClick={()=>navigate('/articles')} style={{padding:'0.6rem 1.5rem',borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:'0.85rem'}}>
            כל החדשות ←
          </button>
        </div>
      </section>

      {/* CTA */}
      <section style={{textAlign:'center',padding:'2rem 2rem 6rem',position:'relative',zIndex:1}}>
        <div style={{maxWidth:600,margin:'0 auto',padding:'3rem',borderRadius:24,background:'linear-gradient(135deg,rgba(245,166,35,0.08),rgba(79,142,247,0.08))',border:'1px solid rgba(245,166,35,0.15)'}}>
          <h2 style={{fontSize:'1.7rem',fontWeight:700,marginBottom:'1rem'}}>מוכן להתחיל?</h2>
          <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'2rem',lineHeight:1.6}}>הצטרף למשקיעים שכבר משתמשים בגלילאו לקבלת החלטות מושכלות</p>
          <button className="hero-btn" onClick={()=>navigate('/auth')} style={{padding:'0.85rem 2.5rem',borderRadius:10,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#0a0b0f',cursor:'pointer',fontSize:'1rem',fontWeight:700,boxShadow:'0 4px 20px rgba(245,166,35,0.3)'}}>
            התחל בחינם ←
          </button>
        </div>
      </section>
    </div>
  )
}