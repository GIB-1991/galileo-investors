import { getMarketCapCategory } from '../services/stockApi.js'

const ETF_HOLDINGS = {
  QQQ: ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','AVGO','COST','NFLX'],
  SPY: ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','BRK','LLY','JPM'],
}

// Used by Portfolio - takes array of {ticker, shares, buyPrice, currentPrice, marketCap, beta, shortFloat, sharesFloat}
export function analyzePortfolio(holdings) {
  const alerts = []
  if (!holdings || !holdings.length) return alerts

  const totalValue = holdings.reduce((s,h) => s + ((h.currentPrice||h.buyPrice||0) * (h.shares||0)), 0)
  if (!totalValue) return alerts

  for (const h of holdings) {
    const val = (h.currentPrice||h.buyPrice||0) * (h.shares||0)
    const w = val / totalValue
    const cat = getMarketCapCategory(h.marketCap||0)

    if (cat === 'Mega Cap' && w > 0.20)
      alerts.push({ type: 'warning', message: h.ticker + ': משקל ' + (w*100).toFixed(1) + '% — Mega Cap חורג ממגבלת 20%' })
    if (cat === 'Large Cap' && w > 0.10)
      alerts.push({ type: 'warning', message: h.ticker + ': משקל ' + (w*100).toFixed(1) + '% — Large Cap חורג ממגבלת 10%' })
    if (cat === 'Mid Cap' && w > 0.05)
      alerts.push({ type: 'warning', message: h.ticker + ': משקל ' + (w*100).toFixed(1) + '% — Mid Cap חורג ממגבלת 5%' })
    if (cat === 'Small Cap' && w > 0.04)
      alerts.push({ type: 'warning', message: h.ticker + ': משקל ' + (w*100).toFixed(1) + '% — Small Cap חורג ממגבלת 4%' })
    if ((h.shortFloat||0) > 10)
      alerts.push({ type: 'danger', message: h.ticker + ': Short Float ' + h.shortFloat + '% — סיכון גבוה' })
    if ((h.sharesFloat||0) > 0 && h.sharesFloat < 50e6)
      alerts.push({ type: 'danger', message: h.ticker + ': Float נמוך מ-50M מניות — נזילות נמוכה' })
    if ((h.currentPrice||h.buyPrice||0) < 10)
      alerts.push({ type: 'warning', message: h.ticker + ': מחיר מתחת ל-$10 — מניית penny stock' })

    // ETF overlap warning
    const etfKeys = Object.keys(ETF_HOLDINGS)
    for (const etf of etfKeys) {
      const etfHolding = holdings.find(x => x.ticker === etf)
      if (!etfHolding) continue
      const etfW = ((etfHolding.currentPrice||etfHolding.buyPrice||0) * (etfHolding.shares||0)) / totalValue
      if (ETF_HOLDINGS[etf].includes(h.ticker) && etfW + w > 0.20)
        alerts.push({ type: 'warning', message: h.ticker + ' + ' + etf + ': כפילות חשיפה חורגת מ-20%' })
    }
  }

  if (alerts.length === 0)
    alerts.push({ type: 'success', message: '✓ התיק עומד בכל כללי התזה של גלילאו — פיזור תקין' })

  return alerts
}

// Used by Screener - analyze single stock against thesis rules (fix 3)
export function analyzeStockForScreener(stock) {
  const tips = []
  const cat = getMarketCapCategory(stock.marketCap||0)

  // Size category
  const catLabels = { 'Mega Cap': 'מניית ענק (Mega Cap)', 'Large Cap': 'מניה גדולה (Large Cap)', 'Mid Cap': 'מניה בינונית (Mid Cap)', 'Small Cap': 'מניה קטנה (Small Cap)', 'ETF': 'קרן סל (ETF)' }
  const catLimits = { 'Mega Cap': '20%', 'Large Cap': '10%', 'Mid Cap': '5%', 'Small Cap': '4%', 'ETF': '100%' }
  const catColors = { 'Mega Cap': '#2dd87a', 'Large Cap': '#4f8ef7', 'Mid Cap': '#fbbf24', 'Small Cap': '#f05252', 'ETF': '#a855f7' }

  tips.push({
    type: 'info',
    color: catColors[cat] || '#9ca3af',
    message: 'קטגוריה: ' + (catLabels[cat]||cat) + ' — מגבלת משקל מקסימלי בתיק: ' + (catLimits[cat]||'—')
  })

  if (stock.price < 10 && stock.price > 0)
    tips.push({ type: 'warning', color: '#fbbf24', message: 'מחיר מתחת ל-$10 — penny stock, סיכון גבוה לפי תזת גלילאו' })
  if ((stock.shortFloat||0) > 10)
    tips.push({ type: 'danger', color: '#f05252', message: 'Short Float ' + stock.shortFloat + '% — מעל 10%, סיכון לסחיטת שורטיסטים' })
  if ((stock.shortFloat||0) > 20)
    tips.push({ type: 'danger', color: '#f05252', message: 'Short Float גבוה מאוד ' + stock.shortFloat + '% — אינטרס שורט משמעותי' })
  if (stock.beta && stock.beta > 2)
    tips.push({ type: 'warning', color: '#fbbf24', message: 'Beta ' + stock.beta.toFixed(1) + ' — תנודתיות גבוהה מאוד ביחס לשוק' })
  if (stock.beta && stock.beta < 0.5 && stock.beta > 0)
    tips.push({ type: 'info', color: '#4f8ef7', message: 'Beta ' + stock.beta.toFixed(1) + ' — מניה דפנסיבית, פחות תנודתיות מהשוק' })

  const etfMatch = Object.keys(ETF_HOLDINGS).filter(e => ETF_HOLDINGS[e].includes(stock.ticker))
  if (etfMatch.length > 0)
    tips.push({ type: 'warning', color: '#fbbf24', message: 'מניה זו נמצאת ב-' + etfMatch.join(', ') + ' — שים לב לכפילות חשיפה בתיק' })

  return tips
}
