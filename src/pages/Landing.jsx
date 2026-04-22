import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TrendingUp, Shield, BookOpen, BarChart2, ArrowLeft, Star, Users, Zap, Newspaper, ChevronLeft } from 'lucide-react'

const ROW1 = ['SPY','QQQ','AAPL','MSFT','NVDA','GOOG','AMZN','META','TSLA','BRK-B','JPM','V','WMT','AVGO','LLY']
const ROW2 = ['XOM','JNJ','PG','MA','HD','COST','MCD','CSCO','PEP','KO','UNH','CVX','TMO','ABT','CRM']

const FEATURES=[
  {icon:BookOpen,title:'אקדמיה',desc:'מושגים פיננסיים בעברית עם דוגמאות חזותיות',color:'#f5a623',path:'/academy'},
  {icon:BarChart2,title:'סקרינר מניות',desc:'חיפוש וניתוח מניות עם נתונים מקצועיים',color:'#4f8ef7',path:'/screener'},
  {icon:TrendingUp,title:'בניית תיק',desc:'בנה תיק עם ויזואליזציה לפי מגזרים',color:'#2dd87a',path:'/portfolio'},
  {icon:Shield,title:'מנוע התזה',desc:'ניתוח אוטומטי עם התראות על סיכונים',color:'#a855f7',path:'/portfolio'},
  {icon:Star,title:'משקיעים גדולים',desc:'עקוב אחרי פורטפוליו של המשקיעים המובילים',color:'#f97316',path:'/superinvestors'},
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
    {x:8,y:18,r:3.5,color:'#f5a623',dur:9},{x:82,y:30,r:2.2,color:'#4f8ef7',dur:12},
    {x:55,y:72,r:1.8,color:'#a855f7',dur:15},{x:20,y:65,r:2.8,color:'#2dd87a',dur:10},
    {x:70,y:12,r:1.5,color:'#f97316',dur:13},{x:42,y:85,r:2,color:'#06b6d4',dur:11},
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
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',fontSize:'0.77rem',fontWeight:600,whiteSpace:'nowrap',padding:'0.28rem 0.8rem',borderRadius:'100px',background:up===null?'rgba(255,255,255,0.05)':up?'rgba(22,163,74,0.12)':'rgba(220,38,38,0.12)',border:`1px solid ${up===null?'rgba(255,255,255,0.08)':up?'rgba(22,163,74,0.22)':'rgba(220,38,38,0.22)'}`,color:up===null?'rgba(255,255,255,0.5)':up?'#4ade80':'#f87171',transition:'all .2s'}}>
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
    <div style={{minHeight:'100vh',direction:'rtl',fontFamily:'Heebo,sans-serif',background:'#080b14',color:'#fff',overflow:'hidden'}}>
      <style>{`
        @keyframes tickerFwd{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
        @keyframes tickerRev{0%{transform:translateX(-33.333%)}100%{transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .g-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(245,166,35,0.45)!important}
        .g-btn{transition:all .2s ease}
        .g-sec:hover{background:rgba(255,255,255,0.07)!important}
        .g-sec{transition:all .2s ease}
        .feat:hover{transform:translateY(-4px);border-color:rgba(255,255,255,0.14)!important;box-shadow:0 8px 32px rgba(0,0,0,0.5)!important}
        .feat{transition:all .25s ease}
        .news-sm:hover{background:rgba(255,255,255,0.05)!important;border-color:rgba(255,255,255,0.1)!important;transform:translateX(-3px)}
        .news-sm{transition:all .2s ease}
      `}</style>

      <StarField/>
      <div style={{position:'fixed',top:-250,right:-250,width:700,height:700,background:'radial-gradient(circle,rgba(245,166,35,0.1) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'fixed',bottom:-200,left:-200,width:600,height:600,background:'radial-gradient(circle,rgba(79,142,247,0.08) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      {/* === HEADER === */}
      <header style={{position:'sticky',top:0,zIndex:200,background:'rgba(8,11,20,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',height:62,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,background:'linear-gradient(135deg,#f5a623,#e8871a)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 10px rgba(245,166,35,0.3)'}}>
              <span style={{color:'#080b14',fontSize:17,fontWeight:800}}>G</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'0.92rem',color:'#fff',lineHeight:1.2}}>משקיעים עם גלילאו</div>
              <div style={{fontSize:'0.58rem',color:'#f5a623',letterSpacing:'0.14em',fontWeight:600,textTransform:'uppercase',opacity:0.75}}>MARKET INTELLIGENCE</div>
            </div>
          </div>
          <nav style={{display:'flex',alignItems:'center',gap:4}}>
            {[['אקדמיה','/academy'],['סקרינר','/screener'],['מאמרים','/articles'],['משקיעים גדולים','/superinvestors']].map(([label,path])=>(
              <button key={path} className="g-sec" onClick={()=>navigate(path)} style={{padding:'0.4rem 0.85rem',borderRadius:7,background:'transparent',border:'none',color:'rgba(255,255,255,0.65)',cursor:'pointer',fontSize:'0.82rem',fontWeight:500}}>
                {label}
              </button>
            ))}
          </nav>
          <div style={{display:'flex',gap:'0.6rem'}}>
            <button className="g-sec" onClick={()=>navigate('/auth')} style={{padding:'0.45rem 1.1rem',borderRadius:7,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',cursor:'pointer',fontSize:'0.82rem',fontWeight:500}}>כניסה</button>
            <button className="g-btn" onClick={()=>navigate('/auth')} style={{padding:'0.45rem 1.1rem',borderRadius:7,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#080b14',cursor:'pointer',fontSize:'0.82rem',fontWeight:700,boxShadow:'0 2px 12px rgba(245,166,35,0.3)'}}>הצטרף חינם</button>
          </div>
        </div>
      </header>

      {/* === TICKER ROW 1 === */}
      <div style={{padding:'0.6rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)',position:'relative',zIndex:1,background:'rgba(8,11,20,0.5)'}}>
        <TickerRow tickers={ROW1} direction="normal" prices={prices}/>
      </div>

      {/* === HERO === */}
      <section style={{maxWidth:1280,margin:'0 auto',padding:'4.5rem 2rem 3.5rem',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'0.3rem 0.9rem',borderRadius:100,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.25)',color:'#f5a623',fontSize:'0.75rem',fontWeight:600,marginBottom:'1.75rem',animation:'fadeUp 0.5s ease both'}}>
          <Zap size={11}/> פלטפורמת ההשקעות המובילה לישראלים
        </div>
        <h1 style={{fontSize:'clamp(2rem,4.5vw,3.6rem)',fontWeight:800,lineHeight:1.15,margin:'0 0 1.25rem',animation:'fadeUp 0.5s ease 0.1s both',letterSpacing:'-0.025em'}}>
          השקע <span style={{background:'linear-gradient(135deg,#f5a623,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>חכם יותר</span><br/>עם נתוני שוק אמיתיים
        </h1>
        <p style={{fontSize:'1.05rem',color:'rgba(255,255,255,0.52)',maxWidth:520,margin:'0 auto 2.25rem',lineHeight:1.7,animation:'fadeUp 0.5s ease 0.2s both'}}>
          גישה למדדים בזמן אמת, ניתוח מניות מעמיק, מעקב תיק השקעות ואקדמיה פיננסית בעברית — הכל במקום אחד.
        </p>
        <div style={{display:'flex',gap:'0.85rem',justifyContent:'center',flexWrap:'wrap',animation:'fadeUp 0.5s ease 0.25s both'}}>
          <button className="g-btn" onClick={()=>navigate('/auth')} style={{display:'flex',alignItems:'center',gap:8,padding:'0.75rem 1.9rem',borderRadius:10,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#080b14',cursor:'pointer',fontSize:'0.92rem',fontWeight:700,boxShadow:'0 4px 18px rgba(245,166,35,0.3)'}}>
            התחל בחינם <ArrowLeft size={15}/>
          </button>
          <button className="g-sec" onClick={()=>navigate('/dashboard')} style={{display:'flex',alignItems:'center',gap:8,padding:'0.75rem 1.9rem',borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.11)',color:'rgba(255,255,255,0.82)',cursor:'pointer',fontSize:'0.92rem',fontWeight:600}}>
            צפה בדמו
          </button>
        </div>
        <div style={{marginTop:'2rem',display:'flex',justifyContent:'center',alignItems:'center',gap:'0.5rem',opacity:0.38,fontSize:'0.76rem',animation:'fadeUp 0.5s ease 0.35s both'}}>
          <Users size={12}/> נתוני שוק בזמן אמת ממקורות מוסדיים
          <span style={{margin:'0 0.4rem'}}>·</span>
          <Star size={12}/> גלילאו 2025
        </div>
      </section>

      {/* === TICKER ROW 2 — reversed === */}
      <div style={{padding:'0.6rem 0',borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)',position:'relative',zIndex:1,background:'rgba(8,11,20,0.4)'}}>
        <TickerRow tickers={ROW2} direction="reverse" prices={prices}/>
      </div>

      {/* === FEATURES === */}
      <section style={{maxWidth:1280,margin:'0 auto',padding:'4.5rem 2rem 2.5rem',position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <h2 style={{fontSize:'1.65rem',fontWeight:700,marginBottom:'0.6rem',letterSpacing:'-0.015em'}}>כלים מקצועיים לכל משקיע</h2>
          <p style={{color:'rgba(255,255,255,0.42)',fontSize:'0.9rem'}}>כל מה שצריך כדי להשקיע בביטחון</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:'1rem'}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat" onClick={()=>setModal(f)} style={{padding:'1.5rem',borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>
              <div style={{width:42,height:42,borderRadius:11,background:f.color+'18',border:`1px solid ${f.color}35`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.9rem'}}>
                <f.icon size={19} color={f.color}/>
              </div>
              <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.4rem'}}>{f.title}</div>
              <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.42)',lineHeight:1.55}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === NEWS FEED === */}
      <section style={{maxWidth:1280,margin:'0 auto',padding:'1rem 2rem 5rem',position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:'1.5rem'}}>
          <Newspaper size={17} color='#f5a623'/>
          <h2 style={{fontSize:'1.25rem',fontWeight:700,margin:0}}>חדשות שוק</h2>
          <div style={{marginRight:'auto',display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#2dd87a',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.35)'}}>מתעדכן בזמן אמת</span>
          </div>
        </div>

        {/* Featured news — with image */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
          {/* Main featured card with image */}
          <div onClick={()=>navigate('/articles')} style={{position:'relative',borderRadius:16,overflow:'hidden',cursor:'pointer',minHeight:260,border:'1px solid rgba(255,255,255,0.07)',transition:'transform .2s,box-shadow .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.6)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
            <img src={STATIC_NEWS[0].img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(8,11,20,0.97) 0%,rgba(8,11,20,0.6) 55%,rgba(8,11,20,0.1) 100%)'}}/>
            <div style={{position:'relative',padding:'1.5rem',height:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.6rem'}}>
                <span style={{fontSize:'0.67rem',fontWeight:700,padding:'0.18rem 0.55rem',borderRadius:100,background:'rgba(245,166,35,0.18)',color:'#f5a623',border:'1px solid rgba(245,166,35,0.3)'}}>{STATIC_NEWS[0].tag}</span>
                <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{STATIC_NEWS[0].time}</span>
              </div>
              <div style={{fontSize:'1.05rem',fontWeight:700,lineHeight:1.45,marginBottom:'0.5rem',color:'#fff'}}>{STATIC_NEWS[0].title}</div>
              <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.55)',lineHeight:1.5}}>{STATIC_NEWS[0].desc}</div>
              <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.3)',marginTop:'0.75rem'}}>{STATIC_NEWS[0].source}</div>
            </div>
          </div>

          {/* Right column — 4 small cards */}
          <div style={{display:'flex',flexDirection:'column',gap:'0.65rem'}}>
            {STATIC_NEWS.slice(1).map((item,i)=>(
              <div key={i} className="news-sm" onClick={()=>navigate('/articles')} style={{padding:'0.85rem 1rem',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:'0.35rem'}}>
                  <span style={{fontSize:'0.64rem',fontWeight:700,padding:'0.15rem 0.5rem',borderRadius:100,background:'rgba(245,166,35,0.1)',color:'#f5a623',border:'1px solid rgba(245,166,35,0.18)'}}>{item.tag}</span>
                  <span style={{fontSize:'0.66rem',color:'rgba(255,255,255,0.3)',marginRight:'auto'}}>{item.time}</span>
                </div>
                <div style={{fontSize:'0.84rem',fontWeight:500,color:'rgba(255,255,255,0.82)',lineHeight:1.45}}>{item.title}</div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.28)',marginTop:'0.3rem'}}>{item.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:'1.25rem'}}>
          <button className="g-sec" onClick={()=>navigate('/articles')} style={{padding:'0.55rem 1.4rem',borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.55)',cursor:'pointer',fontSize:'0.82rem'}}>
            כל החדשות ←
          </button>
        </div>
      </section>

      {/* === CTA === */}
      <section style={{textAlign:'center',padding:'1.5rem 2rem 6rem',position:'relative',zIndex:1}}>
        <div style={{maxWidth:560,margin:'0 auto',padding:'2.75rem',borderRadius:22,background:'linear-gradient(135deg,rgba(245,166,35,0.07),rgba(79,142,247,0.07))',border:'1px solid rgba(245,166,35,0.14)'}}>
          <h2 style={{fontSize:'1.55rem',fontWeight:700,marginBottom:'0.85rem'}}>מוכן להתחיל?</h2>
          <p style={{color:'rgba(255,255,255,0.48)',marginBottom:'1.75rem',lineHeight:1.6,fontSize:'0.9rem'}}>הצטרף למשקיעים שכבר משתמשים בגלילאו לקבלת החלטות מושכלות</p>
          <button className="g-btn" onClick={()=>navigate('/auth')} style={{padding:'0.8rem 2.2rem',borderRadius:10,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#080b14',cursor:'pointer',fontSize:'0.95rem',fontWeight:700,boxShadow:'0 4px 18px rgba(245,166,35,0.3)'}}>
            התחל בחינם ←
          </button>
        </div>
      </section>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)',animation:'fadeIn 0.2s ease'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'rgba(14,18,32,0.99)',border:'1px solid rgba(245,166,35,0.22)',borderRadius:22,padding:'2.5rem 2.25rem',maxWidth:400,width:'90%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.8)',animation:'fadeUp 0.25s ease',position:'relative'}}>
            <button onClick={()=>setModal(null)} style={{position:'absolute',top:14,left:16,background:'none',border:'none',color:'rgba(255,255,255,0.35)',fontSize:'1.2rem',cursor:'pointer',lineHeight:1}}>✕</button>
            <div style={{width:54,height:54,borderRadius:14,background:modal.color+'1a',border:`1px solid ${modal.color}40`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.2rem'}}>
              <modal.icon size={24} color={modal.color}/>
            </div>
            <h3 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'0.5rem',color:'#fff'}}>{modal.title}</h3>
            <p style={{color:'rgba(255,255,255,0.48)',fontSize:'0.86rem',lineHeight:1.65,marginBottom:'1.75rem'}}>
              פונקציה זו זמינה למשתמשים רשומים בלבד.<br/>
              הצטרף בחינם וקבל גישה מיידית לכל הכלים של גלילאו.
            </p>
            <div style={{display:'flex',gap:'0.7rem',justifyContent:'center'}}>
              <button onClick={()=>navigate('/auth')} style={{padding:'0.62rem 1.65rem',borderRadius:9,background:'linear-gradient(135deg,#f5a623,#e8871a)',border:'none',color:'#080b14',cursor:'pointer',fontSize:'0.88rem',fontWeight:700,boxShadow:'0 4px 16px rgba(245,166,35,0.32)',transition:'transform .15s'}}>
                הצטרף חינם ←
              </button>
              <button onClick={()=>setModal(null)} style={{padding:'0.62rem 1.1rem',borderRadius:9,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.65)',cursor:'pointer',fontSize:'0.88rem'}}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}