import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw, Activity, Moon } from 'lucide-react'

const MARKET_TICKERS = [
  { ticker: 'SPY', displayName: 'S&P 500' },
  { ticker: 'QQQ', displayName: 'Nasdaq 100' },
  { ticker: 'GC=F', displayName: 'Gold' },
  { ticker: 'ILS=X', displayName: 'USD/ILS' },
]

// Fix: correct market hours check
// US Eastern time zones
function getMarketStatus() {
  const now = new Date();
  // Get EST/EDT offset: EDT = UTC-4 (summer), EST = UTC-5 (winter)
  // Use Intl to get actual ET time
  const etOptions = { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false };
  const etParts = new Intl.DateTimeFormat('en-US', etOptions).formatToParts(now);
  const weekday = etParts.find(p => p.type === 'weekday')?.value;
  const hour = parseInt(etParts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(etParts.find(p => p.type === 'minute')?.value || '0');
  const totalMins = hour * 60 + minute;
  
  // Weekend = always closed
  if (weekday === 'Sat' || weekday === 'Sun') {
    return { open: false, label: 'שוק סגור', sub: 'סוף שבוע', color: '#f05252' };
  }
  
  // Pre-market: 4:00 - 9:30 ET (240 - 570 mins)
  if (totalMins >= 240 && totalMins < 570) {
    return { open: true, label: 'פרה-מרקט', sub: 'Pre-Market פתוח', color: '#fbbf24' };
  }
  // Regular: 9:30 - 16:00 ET (570 - 960 mins)
  if (totalMins >= 570 && totalMins < 960) {
    return { open: true, label: 'שוק פתוח', sub: 'Regular Market', color: '#2dd87a' };
  }
  // After-hours: 16:00 - 20:00 ET (960 - 1200 mins)
  if (totalMins >= 960 && totalMins < 1200) {
    return { open: true, label: 'אפטר-מרקט', sub: 'After-Hours פתוח', color: '#4f8ef7' };
  }
  // Closed
  return { open: false, label: 'שוק סגור', sub: 'מחוץ לשעות מסחר', color: '#f05252' };
}

export default function Dashboard({ user }) {
  const [market, setMarket] = useState([])
  const [news, setNews] = useState([])
  const [mktLoading, setMktLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [marketStatus, setMarketStatus] = useState(getMarketStatus())
  const name = user?.email?.split('@')[0] || 'משקיע'

  // Update market status every minute
  useEffect(() => {
    const interval = setInterval(() => setMarketStatus(getMarketStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMarket = useCallback(async () => {
    setMktLoading(true)
    const results = await Promise.all(
      MARKET_TICKERS.map(async m => {
        try {
          const res = await fetch('/api/quote?ticker=' + m.ticker)
          const data = await res.json()
          const meta = data?.chart?.result?.[0]?.meta
          if (!meta) return { ...m, price: 0, changePct: 0, up: true }
          const price = meta.regularMarketPrice
          const prev = meta.previousClose || meta.chartPreviousClose || price
          const changePct = prev ? ((price - prev) / prev) * 100 : 0
          return { ...m, price, changePct, up: changePct >= 0 }
        } catch { return { ...m, price: 0, changePct: 0, up: true } }
      })
    )
    setMarket(results)
    setMktLoading(false)
  }, [])

  const loadNews = useCallback(async () => {
    setNewsLoading(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data.news || [])
    } catch {
      setNews([])
    }
    setNewsLoading(false)
  }, [])

  useEffect(() => {
    loadMarket()
    loadNews()
  }, [])

  const fmtPrice = (price) => {
    if (!price) return 'N/A'
    return '$' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const timeAgo = (pubDate) => {
    if (!pubDate) return ''
    const diff = Date.now() - new Date(pubDate).getTime()
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return 'לפני ' + mins + ' דק'
    if (hours < 24) return 'לפני ' + hours + ' שעות'
    return 'לפני ' + Math.floor(hours / 24) + ' ימים'
  }

  return (
    <div>
      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px',color:'var(--color-text-primary)'}}>שלום, {name} 👋</h1>
          <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'0.85rem'}}>
            {new Date().toLocaleDateString('he-IL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:marketStatus.open?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.08)',border:'1px solid '+(marketStatus.open?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.2)'),borderRadius:20,padding:'5px 14px',transition:'all 0.3s'}}>
          {marketStatus.open
            ? <Activity size={12} style={{color:marketStatus.color}}/>
            : <Moon size={12} style={{color:marketStatus.color}}/>
          }
          <div>
            <span style={{fontSize:'0.8rem',fontWeight:700,color:marketStatus.color}}>{marketStatus.label}</span>
            <span style={{fontSize:'0.7rem',color:'var(--color-text-muted)',marginRight:6}}>{marketStatus.sub}</span>
          </div>
        </div>
      </div>

      {/* Market cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i=>(
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',height:82,opacity:.4}}/>
        )) : market.map(m=>(
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',transition:'border-color 200ms'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'0.75rem',color:'var(--color-text-muted)',marginBottom:6,fontWeight:600}}>{m.displayName}</div>
            <div style={{fontSize:'1.15rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",color:'var(--color-text-primary)',marginBottom:4}}>
              {fmtPrice(m.price)}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              {m.up ? <TrendingUp size={13} style={{color:'var(--color-success)'}}/> : <TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}
              <span style={{fontSize:'0.8rem',fontWeight:700,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>
                {m.changePct>=0?'+':''}{Number(m.changePct).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* News feed - Hebrew, RTL */}
      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1.1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h2 style={{fontSize:'0.95rem',fontWeight:700,margin:0,color:'var(--color-text-primary)'}}>חדשות פיננסיות</h2>
          <button onClick={loadNews} disabled={newsLoading} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center',gap:4,fontSize:'0.75rem',padding:'4px 8px',borderRadius:6,opacity:newsLoading?0.5:1}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}>
            <RefreshCw size={12} style={{animation:newsLoading?'spin 1s linear infinite':'none'}}/> {newsLoading?'טוען...':'עדכן'}
          </button>
        </div>

        {newsLoading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-muted)',fontSize:'0.875rem'}}>
            <RefreshCw size={20} style={{marginBottom:'0.75rem',opacity:.5}}/>
            <p style={{margin:0}}>טוען חדשות מהרשת...</p>
          </div>
        ) : (
          <div>
            {news.map((item, i) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{padding:'0.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',cursor:'pointer',transition:'background 150ms',textDecoration:'none',color:'inherit'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{flex:1}}>
                  {/* Hebrew title - RTL */}
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontSize:'0.7rem',fontWeight:600,color:'var(--color-text-muted)',background:'var(--color-bg2)',padding:'2px 8px',borderRadius:8,border:'1px solid var(--color-border)'}}>{item.source}</span>
                    {item.pubDate && <span style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{timeAgo(item.pubDate)}</span>}
                  </div>
                  <p style={{margin:'0 0 4px',fontSize:'0.92rem',fontWeight:600,lineHeight:1.55,direction:'rtl',textAlign:'right',color:'var(--color-text-primary)'}}>
                    {item.titleHe}
                  </p>
                  {item.summary && (
                    <p style={{margin:0,fontSize:'0.8rem',color:'var(--color-text-muted)',direction:'rtl',textAlign:'right',lineHeight:1.5}}>
                      {item.summary}
                    </p>
                  )}
                </div>
                <ExternalLink size={13} style={{color:'var(--color-accent)',flexShrink:0,marginTop:6}}/>
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