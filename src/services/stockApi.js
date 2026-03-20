
const PROXY = 'https://corsproxy.io/?url='

export async function getStockQuote(ticker) {
  const t = ticker.toUpperCase().trim()
  try {
    const url = PROXY + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/' + t + '?interval=1d&range=1d')
    const res = await fetch(url)
    const data = await res.json()
    const q = data?.chart?.result?.[0]
    if (!q) return fallback(t)
    const meta = q.meta
    const price = meta.regularMarketPrice || 0
    const prev = meta.previousClose || meta.chartPreviousClose || price
    const change = price - prev
    const changePct = prev ? (change / prev) * 100 : 0
    return {
      ticker: t,
      name: meta.shortName || meta.longName || t,
      sector: meta.sector || getSector(t),
      price, change, changePct,
      marketCap: meta.marketCap || 0,
      beta: meta.beta || null,
      shortFloat: 0,
      sharesFloat: meta.sharesOutstanding || 0,
      volume: meta.regularMarketVolume || 0,
      analystTarget: null,
      peRatio: meta.trailingPE || null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
    }
  } catch(e) {
    return fallback(t)
  }
}

export async function searchTicker(query) {
  if (!query || query.length < 1) return []
  try {
    const url = PROXY + encodeURIComponent('https://query1.finance.yahoo.com/v1/finance/search?q=' + encodeURIComponent(query) + '&lang=en-US&region=US&quotesCount=10&newsCount=0')
    const res = await fetch(url)
    const data = await res.json()
    const quotes = data?.quotes || []
    return quotes
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .slice(0, 8)
      .map(q => ({
        ticker: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        sector: q.sector || '',
        price: q.regularMarketPrice || 0,
        change: q.regularMarketChange || 0,
        changePct: q.regularMarketChangePercent || 0,
        marketCap: q.marketCap || 0,
        beta: null, shortFloat: 0, sharesFloat: 0, volume: 0,
        analystTarget: null, peRatio: null,
      }))
  } catch(e) {
    return []
  }
}

function getSector(ticker) {
  const etfs = ['SPY','QQQ','IWM','DIA','VTI','VOO','GLD','SLV','TLT','HYG']
  return etfs.includes(ticker) ? 'ETF' : ''
}

function fallback(ticker) {
  return { ticker, name: ticker, sector: '', price: 0, change: 0, changePct: 0,
    marketCap: 0, beta: null, shortFloat: 0, sharesFloat: 0, volume: 0,
    analystTarget: null, peRatio: null, fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null }
}

export function formatMarketCap(val) {
  if (!val) return 'N/A'
  if (val >= 1e12) return '$' + (val/1e12).toFixed(2) + 'T'
  if (val >= 1e9) return '$' + (val/1e9).toFixed(1) + 'B'
  if (val >= 1e6) return '$' + (val/1e6).toFixed(0) + 'M'
  return '$' + val
}

export function getMarketCapCategory(mc) {
  if (!mc) return 'ETF'
  if (mc >= 1e12) return 'Mega Cap'
  if (mc >= 200e9) return 'Large Cap'
  if (mc >= 10e9) return 'Mid Cap'
  return 'Small Cap'
}

export function getMockNews() {
  return [
    {id:1,title:'Fed Holds Rates Steady, Signals Cautious Outlook for 2026',source:'Reuters',time:'לפני שעה',category:'מאקרו'},
    {id:2,title:'NVIDIA Reports Record Data Center Revenue',source:'Bloomberg',time:'לפני 2 שעות',category:'טכנולוגיה'},
    {id:3,title:'S&P 500 Closes at New High Amid Strong Earnings',source:'CNBC',time:'לפני 3 שעות',category:'שוק'},
    {id:4,title:'Apple Set to Launch New AI Features in iOS 20',source:'WSJ',time:'לפני 4 שעות',category:'טכנולוגיה'},
    {id:5,title:'Oil Prices Rise as Middle East Tensions Escalate',source:'FT',time:'לפני 5 שעות',category:'סחורות'},
    {id:6,title:'Amazon Expands AWS Infrastructure with $10B Investment',source:'TechCrunch',time:'לפני 6 שעות',category:'טכנולוגיה'},
  ]
}
