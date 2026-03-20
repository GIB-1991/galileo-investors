import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw, Activity } from 'lucide-react'
import { getMockNews } from '../services/stockApi.js'

const MARKET_TICKERS = [
  { name: 'S&P 500', ticker: 'SPY', displayName: 'S&P 500' },
  { name: 'Nasdaq 100', ticker: 'QQQ', displayName: 'Nasdaq 100' },
  { name: 'Gold', ticker: 'GLD', displayName: 'Gold' },
  { name: 'USD/ILS', ticker: 'ILS=X', displayName: 'USD/ILS' },
]

const CAT_COLORS={מאקרו:'rgba(79,142,247,0.15)',טכנולוגיה:'rgba(168,85,247,0.15)',שוק:'rgba(45,216,122,0.15)',סחורות:'rgba(245,166,35,0.15)'}
const CAT_TEXT={מאקרו:'#60a5fa',טכנולוגיה:'#c084fc',שוק:'#4ade80',סחורות:'#fbbf24'}

export default function Dashboard({user}){
  const [market, setMarket] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [mktLoading, setMktLoading] = useState(true)
  const name = user?.email?.split('@')[0] || 'משקיע'

  const loadMarket = async () => {
    setMktLoading(true)
    const results = await Promise.all(
      MARKET_TICKERS.map(async m => {
        try {
          const res = await fetch('/api/quote?ticker=' + m.ticker)
          const data = await res.json()
          const meta = data?.chart?.result?.[0]?.meta
          if (!meta) return { ...m, price: 'N/A', change: 0, changePct: 0, up: true }
          const price = meta.regularMarketPrice
          const prev = meta.previousClose || meta.chartPreviousClose || price
          const changePct = prev ? ((price - prev) / prev) * 100 : 0
          return { ...m, price: price?.toFixed(2) || 'N/A', change: price - prev, changePct, up: changePct >= 0 }
        } catch { return { ...m, price: 'N/A', change: 0, changePct: 0, up: true } }
      })
    )
    setMarket(results)
    setMktLoading(false)
  }

  useEffect(() => {
    loadMarket()
    setTimeout(() => { setNews(getMockNews()); setLoading(false) }, 400)
  }, [])

  return (
    <div>
      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px',color:'var(--color-text-primary)'}}>שלום, {name} 👋</h1>
          <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'0.85rem'}}>
            {new Date().toLocaleDateString('he-IL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(45,216,122,0.1)',border:'1px solid rgba(45,216,122,0.25)',borderRadius:20,padding:'5px 14px',fontSize:'0.78rem',color:'var(--color-success)',fontWeight:600}}>
          <Activity size={12}/> שוק פתוח
        </div>
      </div>

      {/* Market cards - real time */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i=>(
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',opacity:.5,height:80}}/>
        )) : market.map(m=>(
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',transition:'border-color 200ms'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'0.75rem',color:'var(--color-text-muted)',marginBottom:6,fontWeight:600}}>{m.displayName}</div>
            <div style={{fontSize:'1.2rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-text-primary)',marginBottom:4}}>
              {m.ticker==='ILS=X' ? m.price : (m.price==='N/A' ? 'N/A' : Number(m.price).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              {m.up?<TrendingUp size={13} style={{color:'var(--color-success)'}}/>:<TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}
              <span style={{fontSize:'0.8rem',fontWeight:700,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>
                {m.changePct>=0?'+':''}{Number(m.changePct).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* News - fix 4: real links */}
      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1.1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h2 style={{fontSize:'0.95rem',fontWeight:700,margin:0,color:'var(--color-text-primary)'}}>חדשות פיננסיות</h2>
          <button onClick={()=>{setLoading(true);setTimeout(()=>setLoading(false),600)}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center',gap:4,fontSize:'0.75rem',padding:'4px 8px',borderRadius:6}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}>
            <RefreshCw size={12}/> עדכן
          </button>
        </div>
        {loading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-muted)',fontSize:'0.875rem'}}>טוען חדשות...</div>
        ) : (
          <div>
            {news.map((item,i)=>(
              <a key={item.id} href={item.url||'#'} target="_blank" rel="noopener noreferrer"
                style={{padding:'0.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',cursor:'pointer',transition:'background 150ms',textDecoration:'none'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                    <span style={{fontSize:'0.7rem',fontWeight:700,background:CAT_COLORS[item.category]||'rgba(255,255,255,0.06)',padding:'2px 8px',borderRadius:10,color:CAT_TEXT[item.category]||'var(--color-text-muted)'}}>
                      {item.category}
                    </span>
                    <span style={{fontSize:'0.7rem',color:'var(--color-text-muted)',fontWeight:500}}>{item.source}</span>
                    <span style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>· {item.time}</span>
                  </div>
                  <p style={{margin:0,fontSize:'0.875rem',fontWeight:500,lineHeight:1.5,direction:'ltr',textAlign:'left',color:'var(--color-text-primary)'}}>{item.title}</p>
                </div>
                <ExternalLink size={13} style={{color:'var(--color-text-muted)',flexShrink:0,marginTop:4}}/>
              </a>
            ))}
          </div>
        )}
      </div>
      <p style={{fontSize:'0.72rem',color:'var(--color-text-muted)',textAlign:'center',marginTop:'1.5rem'}}>
        הנתונים מוצגים לצורך מידע בלבד · שעות מסחר: ראשון–חמישי 16:30–23:00 (שעון ישראל)
      </p>
    </div>
  )
}