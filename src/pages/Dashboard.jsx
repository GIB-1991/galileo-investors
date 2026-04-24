import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw, Activity, Moon } from 'lucide-react'

const TICKERS = [
  { ticker: 'SPY', name: 'S&P 500' },
  { ticker: 'QQQ', name: 'Nasdaq 100' },
  { ticker: 'GC=F', apiTicker: 'GLD', name: 'Gold' },
  { ticker: 'ILS=X', name: 'USD/ILS' },
]

function getMarketStatus() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false
  }).formatToParts(now)
  const weekday = parts.find(p => p.type === 'weekday').value
  const hour = parseInt(parts.find(p => p.type === 'hour').value)
  const minute = parseInt(parts.find(p => p.type === 'minute').value)
  const total = hour * 60 + minute
  if (weekday === 'Sat' || weekday === 'Sun')
    return { open: false, label: 'שוק סגור', sub: 'סוף שבוע', color: '#f05252' }
  if (total >= 660 && total < 990)
    return { open: true, label: 'פרה-מרקט', sub: '11:00-16:30', color: '#92400e', badgeBg: '#fef3c7' }
  if (total >= 990 && total < 1380)
    return { open: true, label: 'שוק פתוח', sub: '16:30-23:00', color: '#2dd87a' }
  if (total >= 1380 || total < 180)
    return { open: true, label: 'אפטר-מרקט', sub: '23:00-03:00', color: '#4f8ef7' }
  return { open: false, label: 'שוק סגור', sub: 'מחוץ לשעות מסחר', color: '#f05252' }
}


function extractTickers(title) {
  const dollar = [...title.matchAll(/\$([A-Z]{1,5})\b/g)].map(m => m[1]);
  const map = {Apple:'AAPL',Microsoft:'MSFT',Google:'GOOGL',Alphabet:'GOOGL',Amazon:'AMZN',Meta:'META',Tesla:'TSLA',Nvidia:'NVDA',Netflix:'NFLX',Goldman:'GS',JPMorgan:'JPM'};
  const named = [];
  for (const [n,t] of Object.entries(map)) if (title.includes(n) && !dollar.includes(t)) named.push(t);
  return [...new Set([...dollar,...named])].slice(0,5);
}


const TICKER_ROW1 = ['SPY','QQQ','AAPL','MSFT','NVDA','GOOG','AMZN','META','TSLA','BRK-B','JPM','V','WMT','AVGO','LLY']
const TICKER_ROW2 = ['XOM','JNJ','PG','MA','HD','COST','MCD','CSCO','PEP','KO','UNH','CVX','TMO','ABT','CRM']

function DashTickerRow({tickers,direction='normal',prices}){
  const items=[...tickers,...tickers,...tickers]
  return(
    <div style={{overflow:'hidden',width:'100%',maskImage:'linear-gradient(to right,transparent 0%,black 5%,black 95%,transparent 100%)'}}>
      <div style={{display:'flex',gap:'2rem',width:'max-content',animation:`dash${direction==='reverse'?'Rev':'Fwd'} 50s linear infinite`,willChange:'transform'}}>
        {items.map((t,i)=>{
          const d=prices?.[t]; const up=d?d.change>=0:null
          return(
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',fontSize:'0.74rem',fontWeight:600,whiteSpace:'nowrap',padding:'0.22rem 0.7rem',borderRadius:'100px',background:up===null?'rgba(255,255,255,0.04)':up?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)',border:`1px solid ${up===null?'rgba(255,255,255,0.07)':up?'rgba(22,163,74,0.2)':'rgba(220,38,38,0.2)'}`,color:up===null?'rgba(255,255,255,0.45)':up?'#4ade80':'#f87171'}}>
              <span style={{color:'rgba(255,255,255,0.7)',fontWeight:700,letterSpacing:'0.04em'}}>{t}</span>
              {d&&<><span>{d.price}</span><span style={{fontSize:'0.68rem',opacity:0.8}}>{up?'▲':'▼'}{Math.abs(d.change).toFixed(2)}%</span></>}
              {!d&&<span style={{opacity:0.28}}>—</span>}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard({ user }) {
  const [market, setMarket] = useState([])
  const [tickerPrices, setTickerPrices] = useState({})

  useEffect(()=>{
    const base={AAPL:{p:'$213.50',c:1.2},NVDA:{p:'$875.40',c:-1.4},MSFT:{p:'$415.30',c:0.8},TSLA:{p:'$248.90',c:2.3},AMZN:{p:'$185.20',c:1.3},META:{p:'$502.10',c:-0.6},GOOG:{p:'$175.80',c:0.4},SPY:{p:'$527.20',c:0.5},QQQ:{p:'$448.60',c:0.7},'BRK-B':{p:'$410.30',c:-0.2},JPM:{p:'$208.40',c:1.1},V:{p:'$280.50',c:0.9},WMT:{p:'$79.20',c:0.3},AVGO:{p:'$162.80',c:-0.8},LLY:{p:'$890.40',c:1.5},XOM:{p:'$118.30',c:-0.4},JNJ:{p:'$152.60',c:0.6},PG:{p:'$168.40',c:0.2},MA:{p:'$480.20',c:1.0},HD:{p:'$342.80',c:-0.5},COST:{p:'$892.10',c:2.1},MCD:{p:'$295.30',c:0.3},CSCO:{p:'$56.80',c:-0.7},PEP:{p:'$162.40',c:0.4},KO:{p:'$68.90',c:0.1},UNH:{p:'$510.80',c:-1.2},CVX:{p:'$158.30',c:-0.3},TMO:{p:'$528.60',c:0.8},ABT:{p:'$125.40',c:0.5},CRM:{p:'$298.70',c:-0.9}}
    const all=[...TICKER_ROW1,...TICKER_ROW2]
    const init={}
    all.forEach(t=>{if(base[t]) init[t]={price:base[t].p,change:base[t].c}})
    setTickerPrices(init)
    all.slice(0,20).forEach(t=>{
      fetch('/api/quote?ticker='+t).then(r=>r.json()).then(d=>{
        if(d?.price) setTickerPrices(prev=>({...prev,[t]:{price:'$'+d.price.toFixed(2),change:d.changePercent||0}}))
      }).catch(()=>{})
    })
  },[])  // eslint-disable-line
  const [news, setNews] = useState([])
  const [mktLoading, setMktLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [status, setStatus] = useState(getMarketStatus())
  const name = (user && user.email) ? user.email.split('@')[0] : 'משקיע'

  useEffect(() => {
    const iv = setInterval(() => setStatus(getMarketStatus()), 60000)
    return () => clearInterval(iv)
  }, [])

  const loadMarket = useCallback(async () => {
    setMktLoading(true)
    const res = await Promise.all(TICKERS.map(async m => {
      try {
        const r = await fetch('/api/quote?ticker=' + (m.apiTicker||m.ticker) + '&range=1d&_t=' + Math.floor(Date.now()/60000))
        const d = await r.json()
        const meta = d && d.chart && d.chart.result && d.chart.result[0] && d.chart.result[0].meta
        if (!meta) return { ...m, price: 0, pct: 0, up: true }
        const price = meta.regularMarketPrice
        const _chg = meta.regularMarketChange || 0; const _prev = meta.chartPreviousClose || meta.previousClose || (price - _chg); const pct = _prev && _prev !== price ? ((_chg / _prev) * 100) : 0
        return { ...m, price, pct, up: pct >= 0 }
      } catch(e) { return { ...m, price: 0, pct: 0, up: true } }
    }))
    setMarket(res)
    setMktLoading(false)
  }, [])

  const loadNews = useCallback(async () => {
    setNewsLoading(true)
    try {
      const r = await fetch('/api/news')
      const d = await r.json()
      const items = (d && d.news) ? d.news.map(it=>({...it,tickers:it.tickers&&it.tickers.length?it.tickers:extractTickers(it.titleEn||it.title)})) : []
      setNews(items)
      setNewsLoading(false)
      // Translate titles to Hebrew in background
      try {
        const tr = await fetch('/api/translate', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ titles: items.map(it=>it.titleEn||it.title) })
        })
        if (tr.ok) {
          const td = await tr.json()
          if (td.translated && td.translated.length > 0) {
            setNews(items.map((it,i) => ({
              ...it,
              title: (td.translated[i] && td.translated[i].t) ? td.translated[i].t : it.title
            })))
          }
        }
      } catch(e) {}
    } catch(e) { setNewsLoading(false) }
  }, [])

  useEffect(() => { loadMarket(); loadNews() }, [])

  function fmtPrice(p, ticker) {
    if (!p) return 'N/A'
    const num = Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (ticker === 'ILS=X') return '₪' + num
    if (ticker === 'GC=F') { const gldNum = Number(p*10.87).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); return String.fromCharCode(36)+gldNum }
    return num
  }
  function timeAgo(pubDate) {
    if (!pubDate) return ''
    const diff = Date.now() - new Date(pubDate).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (mins < 60) return 'לפני ' + mins + ' דקות'
    if (hours < 24) return 'לפני ' + hours + ' שעות'
    return 'לפני ' + Math.floor(hours / 24) + ' ימים'
  }

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div dir='rtl'>
      <style>{`@keyframes dashFwd{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}@keyframes dashRev{0%{transform:translateX(-33.333%)}100%{transform:translateX(0)}}`}</style>
      <div style={{padding:'0.55rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)',marginBottom:'0.5rem',background:'rgba(0,0,0,0.15)'}}>
        <DashTickerRow tickers={TICKER_ROW1} direction="normal" prices={tickerPrices}/>
      </div>

      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12,direction:'rtl'}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px',textAlign:'right'}}>{'שלום, ' + name + ' 👋'}</h1>
          <p style={{color:'var(--color-text-secondary)',margin:0,fontSize:'.85rem',textAlign:'right'}}>{today}</p>
        </div>
        <div title={'פרה-מרקט: 11:00-16:30 | שוק פתוח: 16:30-23:00 | אפטר-מרקט: 23:00-03:00'} style={{cursor:'help',display:'flex',alignItems:'center',gap:6,background:status.open?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.08)',border:'1px solid '+(status.open?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.2)'),borderRadius:20,padding:'6px 16px'}}>
          {status.open ? <Activity size={12} style={{color:status.color}}/> : <Moon size={12} style={{color:status.color}}/>}
          <span style={{fontSize:'.82rem',fontWeight:700,color:status.color}}>{status.label}</span>
          <span style={{fontSize:'.72rem',color:'var(--color-text-secondary)',marginRight:4}}>{status.sub}</span>
        </div>
      </div>
      <div style={{padding:'0.55rem 0',borderTop:'1px solid rgba(255,255,255,0.05)',marginBottom:'1.5rem',background:'rgba(0,0,0,0.15)'}}>
        <DashTickerRow tickers={TICKER_ROW2} direction="reverse" prices={tickerPrices}/>
      </div>


      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i => (
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',height:82,opacity:.4}}/>)
        ) : market.map(m => (
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'.75rem',color:'var(--color-text-secondary)',marginBottom:6,fontWeight:600,textAlign:'right'}}>{m.name}</div>
            <div style={{fontSize:'1.15rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{fmtPrice(m.price, m.ticker)}</div>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              {m.up ? <TrendingUp size={13} style={{color:'var(--color-success)'}}/> : <TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}
              <span style={{fontSize:'.8rem',fontWeight:700,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>
                {m.pct >= 0 ? '+' : ''}{Math.abs(m.pct)<0.1 ? Number(m.pct).toFixed(3) : Number(m.pct).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between',direction:'rtl'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h2 style={{fontSize:'.95rem',fontWeight:700,margin:0,textAlign:'right'}}>חדשות פיננסיות</h2>
            {translating && <span style={{fontSize:'.72rem',color:'var(--color-accent)',display:'flex',alignItems:'center',gap:4}}><RefreshCw size={10} style={{animation:'spin 1s linear infinite'}}/>מתרגם...</span>}
          </div>
          <button onClick={loadNews} disabled={newsLoading}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',display:'flex',alignItems:'center',gap:4,fontSize:'.75rem',padding:'4px 8px',borderRadius:6,opacity:newsLoading?0.5:1}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-secondary)'}>
            <RefreshCw size={12} style={{animation:newsLoading?'spin 1s linear infinite':'none'}}/>{newsLoading ? 'טוען...' : 'עדכן'}
          </button>
        </div>
        {newsLoading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-secondary)'}}>
            <RefreshCw size={20} style={{marginBottom:'.75rem',opacity:.5,animation:'spin 1s linear infinite'}}/>
            <p style={{margin:0}}>טוען חדשות...</p>
          </div>
        ) : (
          <div>{news.map((item, i) => (
            <a key={item.id} href={item.url} target='_blank' rel='noopener noreferrer'
              style={{padding:'.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',textDecoration:'none',color:'inherit',direction:'rtl'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <ExternalLink size={13} style={{color:'var(--color-accent)',flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,justifyContent:'flex-start',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.7rem',fontWeight:600,color:'var(--color-text-secondary)',background:'var(--color-bg2)',padding:'2px 8px',borderRadius:8,border:'1px solid var(--color-border)'}}>{item.source}</span>
                  {(item.time||item.pubDate) && <span style={{fontSize:'.7rem',color:'var(--color-text-secondary)'}}>{item.time||timeAgo(item.pubDate)}</span>}
                </div>
                <p style={{margin:'0 0 4px',fontSize:'.92rem',fontWeight:600,lineHeight:1.6,color:'var(--color-text-primary)',textAlign:'right'}}>{item.title}</p>
                {item.summary && <p style={{margin:0,fontSize:'.82rem',color:'var(--color-text-secondary)',lineHeight:1.6,textAlign:'right'}}>{item.summary}</p>}
                {item.tickers&&item.tickers.length>0&&<div style={{marginTop:8,textAlign:'right'}}><div style={{fontSize:'.65rem',color:'var(--color-text-secondary)',marginBottom:3,fontWeight:600}}>מניות רלוונטיות</div><div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'flex-end'}}>{item.tickers.map(t=><span key={t} style={{fontSize:'.68rem',fontWeight:700,padding:'2px 7px',borderRadius:5,background:'rgba(79,142,247,0.12)',color:'#4f8ef7',border:'1px solid rgba(79,142,247,0.25)',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',display:'inline-block'}}>{'$'+t}</span>)}</div></div>}
              </div>
            </a>
          ))}</div>
        )}
      </div>
      <p style={{fontSize:'.72rem',color:'var(--color-text-secondary)',textAlign:'center',marginTop:'1.5rem'}}>
        הנתונים מוצגים לצורך מידע בלבד
      </p>
    </div>
  )

  


  return (
    <div dir='rtl'>
      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12,direction:'rtl'}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px',textAlign:'right'}}>{'שלום, ' + name + ' 👋'}</h1>
          <p style={{color:'var(--color-text-secondary)',margin:0,fontSize:'.85rem',textAlign:'right'}}>{today}</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:status.open?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.08)',border:'1px solid '+(status.open?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.2)'),borderRadius:20,padding:'6px 16px'}}>
          {status.open ? <Activity size={12} style={{color:status.color}}/> : <Moon size={12} style={{color:status.color}}/>}
          <span style={{fontSize:'.82rem',fontWeight:700,color:status.color}}>{status.label}</span>
          <span style={{fontSize:'.72rem',color:'var(--color-text-secondary)',marginRight:4}}>{status.sub}</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i => (
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',height:82,opacity:.4}}/>)
        ) : market.map(m => (
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'.75rem',color:'var(--color-text-secondary)',marginBottom:6,fontWeight:600,textAlign:'right'}}>{m.name}</div>
            <div style={{fontSize:'1.15rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{fmtPrice(m.price, m.ticker)}</div>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              {m.up ? <TrendingUp size={13} style={{color:'var(--color-success)'}}/> : <TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}
              <span style={{fontSize:'.8rem',fontWeight:700,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>
                {m.pct >= 0 ? '+' : ''}{Math.abs(m.pct)<0.1 ? Number(m.pct).toFixed(3) : Number(m.pct).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between',direction:'rtl'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h2 style={{fontSize:'.95rem',fontWeight:700,margin:0,textAlign:'right'}}>חדשות פיננסיות</h2>
            {translating && <span style={{fontSize:'.72rem',color:'var(--color-accent)',display:'flex',alignItems:'center',gap:4}}><RefreshCw size={10} style={{animation:'spin 1s linear infinite'}}/>מתרגם...</span>}
          </div>
          <button onClick={loadNews} disabled={newsLoading}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',display:'flex',alignItems:'center',gap:4,fontSize:'.75rem',padding:'4px 8px',borderRadius:6,opacity:newsLoading?0.5:1}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-secondary)'}>
            <RefreshCw size={12} style={{animation:newsLoading?'spin 1s linear infinite':'none'}}/>{newsLoading ? 'טוען...' : 'עדכן'}
          </button>
        </div>
        {newsLoading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-secondary)'}}>
            <RefreshCw size={20} style={{marginBottom:'.75rem',opacity:.5,animation:'spin 1s linear infinite'}}/>
            <p style={{margin:0}}>טוען חדשות...</p>
          </div>
        ) : (
          <div>{news.map((item, i) => (
            <a key={item.id} href={item.url} target='_blank' rel='noopener noreferrer'
              style={{padding:'.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',textDecoration:'none',color:'inherit',direction:'rtl'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <ExternalLink size={13} style={{color:'var(--color-accent)',flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,justifyContent:'flex-start',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.7rem',fontWeight:600,color:'var(--color-text-secondary)',background:'var(--color-bg2)',padding:'2px 8px',borderRadius:8,border:'1px solid var(--color-border)'}}>{item.source}</span>
                  {(item.time||item.pubDate) && <span style={{fontSize:'.7rem',color:'var(--color-text-secondary)'}}>{item.time||timeAgo(item.pubDate)}</span>}
                </div>
                <p style={{margin:'0 0 4px',fontSize:'.92rem',fontWeight:600,lineHeight:1.6,color:'var(--color-text-primary)',textAlign:'right'}}>{item.title}</p>
                {item.summary && <p style={{margin:0,fontSize:'.82rem',color:'var(--color-text-secondary)',lineHeight:1.6,textAlign:'right'}}>{item.summary}</p>}
                {item.tickers&&item.tickers.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:5,direction:'rtl',justifyContent:'flex-end'}}>{item.tickers.map(t=><span key={t} style={{fontSize:'.68rem',fontWeight:700,padding:'2px 7px',borderRadius:5,background:'rgba(79,142,247,0.12)',color:'#4f8ef7',border:'1px solid rgba(79,142,247,0.25)',fontFamily:"'IBM Plex Mono',monospace"}}>{'$'+t}</span>)}</div>}
              </div>
            </a>
          ))}</div>
        )}
      </div>
      <p style={{fontSize:'.72rem',color:'var(--color-text-secondary)',textAlign:'center',marginTop:'1.5rem'}}>
        הנתונים מוצגים לצורך מידע בלבד
      </p>
    </div>
  )
}+d.price.toFixed(2),change:d.changePercent||0}}))
      }).catch(()=>{})
    })
  },[])
  const [news, setNews] = useState([])
  const [mktLoading, setMktLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [status, setStatus] = useState(getMarketStatus())
  const name = (user && user.email) ? user.email.split('@')[0] : 'משקיע'

  useEffect(() => {
    const iv = setInterval(() => setStatus(getMarketStatus()), 60000)
    return () => clearInterval(iv)
  }, [])

  const loadMarket = useCallback(async () => {
    setMktLoading(true)
    const res = await Promise.all(TICKERS.map(async m => {
      try {
        const r = await fetch('/api/quote?ticker=' + (m.apiTicker||m.ticker) + '&range=1d&_t=' + Math.floor(Date.now()/60000))
        const d = await r.json()
        const meta = d && d.chart && d.chart.result && d.chart.result[0] && d.chart.result[0].meta
        if (!meta) return { ...m, price: 0, pct: 0, up: true }
        const price = meta.regularMarketPrice
        const _chg = meta.regularMarketChange || 0; const _prev = meta.chartPreviousClose || meta.previousClose || (price - _chg); const pct = _prev && _prev !== price ? ((_chg / _prev) * 100) : 0
        return { ...m, price, pct, up: pct >= 0 }
      } catch(e) { return { ...m, price: 0, pct: 0, up: true } }
    }))
    setMarket(res)
    setMktLoading(false)
  }, [])

  const loadNews = useCallback(async () => {
    setNewsLoading(true)
    try {
      const r = await fetch('/api/news')
      const d = await r.json()
      const items = (d && d.news) ? d.news.map(it=>({...it,tickers:it.tickers&&it.tickers.length?it.tickers:extractTickers(it.titleEn||it.title)})) : []
      setNews(items)
      setNewsLoading(false)
      // Translate titles to Hebrew in background
      try {
        const tr = await fetch('/api/translate', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ titles: items.map(it=>it.titleEn||it.title) })
        })
        if (tr.ok) {
          const td = await tr.json()
          if (td.translated && td.translated.length > 0) {
            setNews(items.map((it,i) => ({
              ...it,
              title: (td.translated[i] && td.translated[i].t) ? td.translated[i].t : it.title
            })))
          }
        }
      } catch(e) {}
    } catch(e) { setNewsLoading(false) }
  }, [])

  useEffect(() => { loadMarket(); loadNews() }, [])

  function fmtPrice(p, ticker) {
    if (!p) return 'N/A'
    const num = Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (ticker === 'ILS=X') return '₪' + num
    if (ticker === 'GC=F') { const gldNum = Number(p*10.87).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); return String.fromCharCode(36)+gldNum }
    return num
  }
  function timeAgo(pubDate) {
    if (!pubDate) return ''
    const diff = Date.now() - new Date(pubDate).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (mins < 60) return 'לפני ' + mins + ' דקות'
    if (hours < 24) return 'לפני ' + hours + ' שעות'
    return 'לפני ' + Math.floor(hours / 24) + ' ימים'
  }

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div dir='rtl'>
      <style>{`@keyframes dashFwd{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}@keyframes dashRev{0%{transform:translateX(-33.333%)}100%{transform:translateX(0)}}`}</style>
      <div style={{padding:'0.55rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)',marginBottom:'0.5rem',background:'rgba(0,0,0,0.15)'}}>
        <DashTickerRow tickers={TICKER_ROW1} direction="normal" prices={tickerPrices}/>
      </div>

      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12,direction:'rtl'}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px',textAlign:'right'}}>{'שלום, ' + name + ' 👋'}</h1>
          <p style={{color:'var(--color-text-secondary)',margin:0,fontSize:'.85rem',textAlign:'right'}}>{today}</p>
        </div>
        <div title={'פרה-מרקט: 11:00-16:30 | שוק פתוח: 16:30-23:00 | אפטר-מרקט: 23:00-03:00'} style={{cursor:'help',display:'flex',alignItems:'center',gap:6,background:status.open?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.08)',border:'1px solid '+(status.open?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.2)'),borderRadius:20,padding:'6px 16px'}}>
          {status.open ? <Activity size={12} style={{color:status.color}}/> : <Moon size={12} style={{color:status.color}}/>}
          <span style={{fontSize:'.82rem',fontWeight:700,color:status.color}}>{status.label}</span>
          <span style={{fontSize:'.72rem',color:'var(--color-text-secondary)',marginRight:4}}>{status.sub}</span>
        </div>
      </div>
      <div style={{padding:'0.55rem 0',borderTop:'1px solid rgba(255,255,255,0.05)',marginBottom:'1.5rem',background:'rgba(0,0,0,0.15)'}}>
        <DashTickerRow tickers={TICKER_ROW2} direction="reverse" prices={tickerPrices}/>
      </div>


      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i => (
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',height:82,opacity:.4}}/>)
        ) : market.map(m => (
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'.75rem',color:'var(--color-text-secondary)',marginBottom:6,fontWeight:600,textAlign:'right'}}>{m.name}</div>
            <div style={{fontSize:'1.15rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{fmtPrice(m.price, m.ticker)}</div>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              {m.up ? <TrendingUp size={13} style={{color:'var(--color-success)'}}/> : <TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}
              <span style={{fontSize:'.8rem',fontWeight:700,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>
                {m.pct >= 0 ? '+' : ''}{Math.abs(m.pct)<0.1 ? Number(m.pct).toFixed(3) : Number(m.pct).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between',direction:'rtl'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h2 style={{fontSize:'.95rem',fontWeight:700,margin:0,textAlign:'right'}}>חדשות פיננסיות</h2>
            {translating && <span style={{fontSize:'.72rem',color:'var(--color-accent)',display:'flex',alignItems:'center',gap:4}}><RefreshCw size={10} style={{animation:'spin 1s linear infinite'}}/>מתרגם...</span>}
          </div>
          <button onClick={loadNews} disabled={newsLoading}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',display:'flex',alignItems:'center',gap:4,fontSize:'.75rem',padding:'4px 8px',borderRadius:6,opacity:newsLoading?0.5:1}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-secondary)'}>
            <RefreshCw size={12} style={{animation:newsLoading?'spin 1s linear infinite':'none'}}/>{newsLoading ? 'טוען...' : 'עדכן'}
          </button>
        </div>
        {newsLoading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-secondary)'}}>
            <RefreshCw size={20} style={{marginBottom:'.75rem',opacity:.5,animation:'spin 1s linear infinite'}}/>
            <p style={{margin:0}}>טוען חדשות...</p>
          </div>
        ) : (
          <div>{news.map((item, i) => (
            <a key={item.id} href={item.url} target='_blank' rel='noopener noreferrer'
              style={{padding:'.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',textDecoration:'none',color:'inherit',direction:'rtl'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <ExternalLink size={13} style={{color:'var(--color-accent)',flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,justifyContent:'flex-start',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.7rem',fontWeight:600,color:'var(--color-text-secondary)',background:'var(--color-bg2)',padding:'2px 8px',borderRadius:8,border:'1px solid var(--color-border)'}}>{item.source}</span>
                  {(item.time||item.pubDate) && <span style={{fontSize:'.7rem',color:'var(--color-text-secondary)'}}>{item.time||timeAgo(item.pubDate)}</span>}
                </div>
                <p style={{margin:'0 0 4px',fontSize:'.92rem',fontWeight:600,lineHeight:1.6,color:'var(--color-text-primary)',textAlign:'right'}}>{item.title}</p>
                {item.summary && <p style={{margin:0,fontSize:'.82rem',color:'var(--color-text-secondary)',lineHeight:1.6,textAlign:'right'}}>{item.summary}</p>}
                {item.tickers&&item.tickers.length>0&&<div style={{marginTop:8,textAlign:'right'}}><div style={{fontSize:'.65rem',color:'var(--color-text-secondary)',marginBottom:3,fontWeight:600}}>מניות רלוונטיות</div><div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'flex-end'}}>{item.tickers.map(t=><span key={t} style={{fontSize:'.68rem',fontWeight:700,padding:'2px 7px',borderRadius:5,background:'rgba(79,142,247,0.12)',color:'#4f8ef7',border:'1px solid rgba(79,142,247,0.25)',fontFamily:"'IBM Plex Mono',monospace",direction:'ltr',display:'inline-block'}}>{'$'+t}</span>)}</div></div>}
              </div>
            </a>
          ))}</div>
        )}
      </div>
      <p style={{fontSize:'.72rem',color:'var(--color-text-secondary)',textAlign:'center',marginTop:'1.5rem'}}>
        הנתונים מוצגים לצורך מידע בלבד
      </p>
    </div>
  )

  


  return (
    <div dir='rtl'>
      <div style={{marginBottom:'2rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12,direction:'rtl'}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:800,margin:'0 0 4px',textAlign:'right'}}>{'שלום, ' + name + ' 👋'}</h1>
          <p style={{color:'var(--color-text-secondary)',margin:0,fontSize:'.85rem',textAlign:'right'}}>{today}</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:status.open?'rgba(45,216,122,0.1)':'rgba(240,82,82,0.08)',border:'1px solid '+(status.open?'rgba(45,216,122,0.25)':'rgba(240,82,82,0.2)'),borderRadius:20,padding:'6px 16px'}}>
          {status.open ? <Activity size={12} style={{color:status.color}}/> : <Moon size={12} style={{color:status.color}}/>}
          <span style={{fontSize:'.82rem',fontWeight:700,color:status.color}}>{status.label}</span>
          <span style={{fontSize:'.72rem',color:'var(--color-text-secondary)',marginRight:4}}>{status.sub}</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {mktLoading ? [1,2,3,4].map(i => (
          <div key={i} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem',height:82,opacity:.4}}/>)
        ) : market.map(m => (
          <div key={m.ticker} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.1rem 1.25rem'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border)'}>
            <div style={{fontSize:'.75rem',color:'var(--color-text-secondary)',marginBottom:6,fontWeight:600,textAlign:'right'}}>{m.name}</div>
            <div style={{fontSize:'1.15rem',fontWeight:800,direction:'ltr',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{fmtPrice(m.price, m.ticker)}</div>
            <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
              {m.up ? <TrendingUp size={13} style={{color:'var(--color-success)'}}/> : <TrendingDown size={13} style={{color:'var(--color-danger)'}}/>}
              <span style={{fontSize:'.8rem',fontWeight:700,color:m.up?'var(--color-success)':'var(--color-danger)',direction:'ltr',fontFamily:"'IBM Plex Mono',monospace"}}>
                {m.pct >= 0 ? '+' : ''}{Math.abs(m.pct)<0.1 ? Number(m.pct).toFixed(3) : Number(m.pct).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between',direction:'rtl'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h2 style={{fontSize:'.95rem',fontWeight:700,margin:0,textAlign:'right'}}>חדשות פיננסיות</h2>
            {translating && <span style={{fontSize:'.72rem',color:'var(--color-accent)',display:'flex',alignItems:'center',gap:4}}><RefreshCw size={10} style={{animation:'spin 1s linear infinite'}}/>מתרגם...</span>}
          </div>
          <button onClick={loadNews} disabled={newsLoading}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',display:'flex',alignItems:'center',gap:4,fontSize:'.75rem',padding:'4px 8px',borderRadius:6,opacity:newsLoading?0.5:1}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--color-text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-secondary)'}>
            <RefreshCw size={12} style={{animation:newsLoading?'spin 1s linear infinite':'none'}}/>{newsLoading ? 'טוען...' : 'עדכן'}
          </button>
        </div>
        {newsLoading ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--color-text-secondary)'}}>
            <RefreshCw size={20} style={{marginBottom:'.75rem',opacity:.5,animation:'spin 1s linear infinite'}}/>
            <p style={{margin:0}}>טוען חדשות...</p>
          </div>
        ) : (
          <div>{news.map((item, i) => (
            <a key={item.id} href={item.url} target='_blank' rel='noopener noreferrer'
              style={{padding:'.95rem 1.5rem',borderBottom:i<news.length-1?'1px solid var(--color-border)':'none',display:'flex',alignItems:'flex-start',gap:'1rem',textDecoration:'none',color:'inherit',direction:'rtl'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <ExternalLink size={13} style={{color:'var(--color-accent)',flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,justifyContent:'flex-start',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.7rem',fontWeight:600,color:'var(--color-text-secondary)',background:'var(--color-bg2)',padding:'2px 8px',borderRadius:8,border:'1px solid var(--color-border)'}}>{item.source}</span>
                  {(item.time||item.pubDate) && <span style={{fontSize:'.7rem',color:'var(--color-text-secondary)'}}>{item.time||timeAgo(item.pubDate)}</span>}
                </div>
                <p style={{margin:'0 0 4px',fontSize:'.92rem',fontWeight:600,lineHeight:1.6,color:'var(--color-text-primary)',textAlign:'right'}}>{item.title}</p>
                {item.summary && <p style={{margin:0,fontSize:'.82rem',color:'var(--color-text-secondary)',lineHeight:1.6,textAlign:'right'}}>{item.summary}</p>}
                {item.tickers&&item.tickers.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:5,direction:'rtl',justifyContent:'flex-end'}}>{item.tickers.map(t=><span key={t} style={{fontSize:'.68rem',fontWeight:700,padding:'2px 7px',borderRadius:5,background:'rgba(79,142,247,0.12)',color:'#4f8ef7',border:'1px solid rgba(79,142,247,0.25)',fontFamily:"'IBM Plex Mono',monospace"}}>{'$'+t}</span>)}</div>}
              </div>
            </a>
          ))}</div>
        )}
      </div>
      <p style={{fontSize:'.72rem',color:'var(--color-text-secondary)',textAlign:'center',marginTop:'1.5rem'}}>
        הנתונים מוצגים לצורך מידע בלבד
      </p>
    </div>
  )
}