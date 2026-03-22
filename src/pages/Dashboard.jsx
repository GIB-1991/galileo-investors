import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw, Activity, Moon } from 'lucide-react'

const MARKET_TICKERS = [
  { ticker: 'SPY', displayName: 'S&P 500' },
  { ticker: 'QQQ', displayName: 'Nasdaq 100' },
  { ticker: 'GC=F', displayName: 'Gold' },
  { ticker: 'ILS=X', displayName: 'USD/ILS' },
]

function getMarketStatus() {
  const now = new Date();
  const etParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false
  }).formatToParts(now);
  const weekday = etParts.find(p => p.type === 'weekday')?.value;
  const hour = parseInt(etParts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(etParts.find(p => p.type === 'minute')?.value || '0');
  const total = hour * 60 + minute;
  if (weekday === 'Sat' || weekday === 'Sun') return { open:false, label:'שוק סגור', sub:'סוף שבוע', color:'#f05252' };
  if (total >= 240 && total < 570)  return { open:true,  label:'פרה-מרקט', sub:'04:00–09:30 ET', color:'#fbbf24' };
  if (total >= 570 && total < 960)  return { open:true,  label:'שוק פתוח',  sub:'09:30–16:00 ET', color:'#2dd87a' };
  if (total >= 960 && total < 1200) return { open:true,  label:'אפטר-מרקט', sub:'16:00–20:00 ET', color:'#4f8ef7' };
  return { open:false, label:'שוק סגור', sub:'מחוץ לשעות מסחר', color:'#f05252' };
}

export default function Dashboard({ user }) {
  const [market, setMarket] = useState([])
  const [news, setNews] = useState([])
  const [mktLoading, setMktLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [marketStatus, setMarketStatus] = useState(getMarketStatus())
  const name = user?.email?.split('@')[0] || 'משקיע'

  useEffect(() => {
    const iv = setInterval(() => setMarketStatus(getMarketStatus()), 60000);
    return () => clearInterval(iv);
  }, []);

  const loadMarket = useCallback(async () => {
    setMktLoading(true)
    const results = await Promise.all(MARKET_TICKERS.map(async m => {
      try {
        const res = await fetch('/api/quote?ticker=' + m.ticker)
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        if (!meta) return { ...m, price:0, changePct:0, up:true }
        const price = meta.regularMarketPrice
        const prev = meta.previousClose || meta.chartPreviousClose || price
        const changePct = prev ? ((price - prev) / prev) * 100 : 0
        return { ...m, price, changePct, up: changePct >= 0 }
      } catch { return { ...m, price:0, changePct:0, up:true } }
    }))
    setMarket(results)
    setMktLoading(false)
  }, [])

  const loadNews = useCallback(async () => {
    setNewsLoading(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      const items = data.news || []
      setNews(items)
      setNewsLoading(false)
      // Translate in background — separate request
      if (items.length > 0 && !items[0].translated) {
        setTranslating(true)
        try {
          const tr = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: items.map(n => n.titleHe) })
          })
          if (tr.ok) {
            const td = await tr.json()
            if (td.translated && td.translated.length > 0) {
              setNews(items.map((n, i) => ({
                ...n,
                titleHe: (td.translated[i] && td.translated[i].t) ? td.translated[i].t : n.titleHe,
                summary: (td.translated[i] && td.translated[i].s) ? td.translated[i].s : n.summary,
                translated: !!(td.translated[i] && td.translated[i].t)
              })))
            }
          }
        } catch(e) {}
        setTranslating(false)
      }
    } catch {
      setNewsLoading(false)
    }
  }, [])

  useEffect(() => { loadMarket(); loadNews(); }, [])

  const fmtPrice = p => !p ? 'N/A' : '$' + Number(p).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })

  const timeAgo = (pubDate) => {
    if (!pubDate) return ''
    const diff = Date.now() - new Date(pubDate).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (mins < 60) return 'לפני ' + mins + ' דק\'
    if (hours < 24) return 'לפני ' + hours + ' שעות'
    return 'לפני ' + Math.floor(hours/24) + ' ימים'
  }

  return (
    <div>
      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px'}}>שלום, {name} 👋</h1>
          <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'0.85rem'}}>
            {new Date().toLocaleDateString('he-IL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:marketStatus.open?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.08)',border:'1px solid '+(marketStatus.open?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.2)'),borderRadius:20,padding:'6px 16px'}}>
          {marketStatus.open
            ? <Activity size={12} style={{color:marketStatus.color}}/>
            : <Moon size={12} style={{color:marketStatus.color}}/>}
          <span style={{fontSize:'0.82rem',fontWeight:700,color:marketStatus.color}}>{marketStatus.label}</span>
          <span style={{fontSize:'0.72rem',color:'var(--color-text-muted)',marginRight:4}}>{marketStatus.sub}</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i=>(
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',height:82,opacity:.4}}/>
        )) : market.map(m=>(
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',transition:'border-color 200ms'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'0.75rem',color:'var(--color-text-muted)',marginBottom:6,fontWeight:600}}>{m.displayName}</div>
            <div style={{fontSize:'1.15rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>
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

      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h2 style={{fontSize:'0.95rem',fontWeight:700,margin:0}}>חדשות פיננסיות</h2>
            {translating && <span style={{fontSize:'0.72rem',color:'var(--color-accent)',display:'flex',alignItems:'center',gap:4}}><RefreshCw size={10} style={{animation:'spin 1s linear infinite'}}/>מתרגם לעברית...</span>}
          </div>
          <button onClick={loadNews} disabled={newsLoading} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',display:'flex',alignItems:'center',gap:4,fontSize:'0.75rem',padding:'4px 8px',borderRadius:6,opacity:newsLoading?0.5:1}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted)'}>
            <RefreshCw size={12} style={{animation:newsLoading?'spin 1s linear infinite':'none'}}/>{newsLoading?'טוען...':'עדכן'}
          </button>
        </div>

        {newsLoading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-muted)',fontSize:'0.875rem'}}>
            <RefreshCw size={20} style={{marginBottom:'0.75rem',opacity:.5,animation:'spin 1s linear infinite'}}/>
            <p style={{margin:0}}>טוען חדשות...</p>
          </div>
        ) : (
          <div>
            {news.map((item, i) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{padding:'0.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',cursor:'pointer',transition:'background 150ms',textDecoration:'none',color:'inherit'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{flex:1,direction:'rtl',textAlign:'right'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,justifyContent:'flex-end',flexDirection:'row-reverse'}}>
                    <span style={{fontSize:'0.7rem',fontWeight:600,color:'var(--color-text-muted)',background:'var(--color-bg2)',padding:'2px 8px',borderRadius:8,border:'1px solid var(--color-border)'}}>{item.source}</span>
                    {item.pubDate && <span style={{fontSize:'0.7rem',color:'var(--color-text-muted)'}}>{timeAgo(item.pubDate)}</span>}
                  </div>
                  <p style={{margin:'0 0 4px',fontSize:'0.92rem',fontWeight:600,lineHeight:1.55,color:'var(--color-text-primary)'}}>
                    {item.titleHe}
                  </p>
                  {item.summary && (
                    <p style={{margin:0,fontSize:'0.8rem',color:'var(--color-text-muted)',lineHeight:1.5}}>
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
        הנתונים מוצגים לצורך מידע בלבד · שעות מסחר: ב-ו 16:30–23:00 + פרה/אפטר מרקט
      </p>
    </div>
  )
}