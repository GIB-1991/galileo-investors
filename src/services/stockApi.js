
// Yahoo Finance via proxy - real-time US stock data
const PROXY = 'https://api.allorigins.win/get?url='

export async function getStockQuote(ticker) {
  const t = ticker.toUpperCase()
  try {
    const url = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${t}?interval=1d&range=1d`)
    const res = await fetch(PROXY + url)
    const data = await res.json()
    const parsed = JSON.parse(data.contents)
    const q = parsed?.chart?.result?.[0]
    if (!q) return fallback(t)
    const meta = q.meta
    const price = meta.regularMarketPrice
    const prev = meta.previousClose || meta.chartPreviousClose
    const change = price - prev
    const changePct = (change / prev) * 100
    return {
      ticker: t,
      name: meta.shortName || meta.symbol,
      sector: meta.sector || getSector(t),
      price: price,
      change: change,
      changePct: changePct,
      marketCap: meta.marketCap || 0,
      beta: meta.beta || 1,
      shortFloat: 0,
      sharesFloat: meta.sharesOutstanding || 0,
      volume: meta.regularMarketVolume || 0,
      analystTarget: meta.targetMeanPrice || null,
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
    const url = encodeURIComponent(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`)
    const res = await fetch(PROXY + url)
    const data = await res.json()
    const parsed = JSON.parse(data.contents)
    const quotes = parsed?.quotes || []
    return quotes
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map(q => ({
        ticker: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        sector: q.sector || getSector(q.symbol),
        price: q.regularMarketPrice || 0,
        change: q.regularMarketChange || 0,
        changePct: q.regularMarketChangePercent || 0,
        marketCap: q.marketCap || 0,
        beta: 1, shortFloat: 0, sharesFloat: 0, volume: 0,
        analystTarget: null, peRatio: null,
      }))
  } catch(e) {
    return []
  }
}

function getSector(ticker) {
  const etfs = ['SPY','QQQ','IWM','DIA','VTI','VOO','GLD','SLV','TLT','HYG']
  return etfs.includes(ticker) ? 'ETF' : 'Unknown'
}

function fallback(ticker) {
  return { ticker, name: ticker, sector: 'Unknown', price: 0, change: 0, changePct: 0,
    marketCap: 0, beta: 1, shortFloat: 0, sharesFloat: 0, volume: 0, analystTarget: null, peRatio: null }
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
