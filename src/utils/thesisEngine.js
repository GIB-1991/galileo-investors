// ETF holdings map — ticker to its major stock weights
const ETF_WEIGHTS = {
  SPY: {AAPL:7.1,MSFT:6.5,NVDA:5.9,AMZN:3.7,META:2.6,GOOGL:2.1,GOOG:1.8,BRK:1.7,TSLA:1.6,UNH:1.3},
  QQQ: {AAPL:8.9,MSFT:8.1,NVDA:7.5,AMZN:5.0,META:3.7,GOOGL:2.7,GOOG:2.6,TSLA:2.1,AVGO:2.0,COST:1.8},
  VTI: {AAPL:6.5,MSFT:6.0,NVDA:5.3,AMZN:3.4,META:2.4,GOOGL:1.9,GOOG:1.6,BRK:1.6,TSLA:1.4,UNH:1.2},
  IWM: {SMID:100},
  DIA: {UNH:9.1,MSFT:6.8,GS:6.5,HD:6.2,MCD:5.8,CAT:5.5,AMGN:5.2,V:4.8,TRV:4.1,AXP:3.9}
}

// Market cap category from Finviz live data (in USD)
// Mega: >1T, Large: >200B, Small: rest
function getCapCategory(marketCapUSD) {
  if (!marketCapUSD || marketCapUSD<=0) return null
  if (marketCapUSD >= 1e12) return 'mega'
  if (marketCapUSD >= 200e9) return 'large'
  return 'small'
}

function getCapLimit(cat) {
  if (cat==='mega') return 20
  if (cat==='large') return 10
  return 5
}

function getCapLabel(cat) {
  if (cat==='mega') return 'Mega Cap (מעל 1T)'
  if (cat==='large') return 'Large Cap (200B-1T)'
  return 'Small Cap (מתחת 200B)'
}

// Check alerts when user picks a stock to add
export function checkStockAlerts(stock, existingHoldings, newShares, newBuyPrice) {
  const alerts = []
  const t = (stock.ticker||'').toUpperCase()

  // --- Finviz-based alerts (fire immediately on selection) ---

  // 1. Short Float > 10%
  if ((stock.shortFloat||0) > 10)
    alerts.push({ type:'danger', message:t+': שורט פלואט '+stock.shortFloat.toFixed(1)+'% — מעל 10%, סיכון גבוה' })

  // 2. Beta > 3
  if ((stock.beta||0) > 3)
    alerts.push({ type:'danger', message:t+': Beta '+stock.beta.toFixed(2)+' — תנודתיות גבוהה מאוד (מעל 3)' })

  // 3. Average daily volume < 250K
  if ((stock.avgVolume||0) > 0 && stock.avgVolume < 250000)
    alerts.push({ type:'danger', message:t+': נפח מסחר יומי '+(stock.avgVolume/1000).toFixed(0)+'K — נזילות נמוכה (מתחת 250K)' })

  // --- Position size alerts (need newShares + newBuyPrice) ---
  if (newShares > 0 && newBuyPrice > 0 && existingHoldings && existingHoldings.length > 0) {
    const totalVal = existingHoldings.reduce((s,h)=>s+(h.currentPrice||h.buyPrice)*h.shares, 0)
    if (totalVal > 0) {
      const addedVal = newShares * newBuyPrice
      // Include existing shares of this ticker
      const existingPos = existingHoldings.find(h=>h.ticker===t)
      const existingVal = existingPos ? (existingPos.currentPrice||existingPos.buyPrice)*existingPos.shares : 0
      const totalExposure = existingVal + addedVal
      const pct = (totalExposure / (totalVal + addedVal)) * 100

      const cat = getCapCategory(stock.marketCap)
      if (cat) {
        const limit = getCapLimit(cat)
        if (pct > limit)
          alerts.push({ type:'danger', message:t+': חשיפה צפויה '+pct.toFixed(1)+'% — חורג ממגבלת '+limit+'% ל'+getCapLabel(cat) })
      }

      // ETF overlap check
      const etfWeights = ETF_WEIGHTS[t]
      if (etfWeights) {
        existingHoldings.forEach(h => {
          const overlap = etfWeights[h.ticker.toUpperCase()]
          if (overlap) {
            alerts.push({ type:'warn', message:'חשיפה כפולה: '+t+' מכיל '+h.ticker+' ב-'+overlap+'% — בדוק חשיפה כוללת' })
          }
        })
      }
      // Check if existing ETF holds this stock
      existingHoldings.forEach(h => {
        const etf = ETF_WEIGHTS[h.ticker.toUpperCase()]
        if (etf && etf[t]) {
          alerts.push({ type:'warn', message:'חשיפה כפולה: '+h.ticker+' כבר מחזיק '+t+' ב-'+etf[t]+'% — בדוק חשיפה כוללת' })
        }
      })
    }
  }

  return alerts
}

// Portfolio-level analysis (shown on main page)
export function analyzePortfolio(holdingsInput) {
  // Merge duplicate tickers
  const merged={}
  ;[...holdingsInput].forEach(h=>{
    if(merged[h.ticker]) merged[h.ticker]={...merged[h.ticker],shares:merged[h.ticker].shares+h.shares}
    else merged[h.ticker]={...h}
  })
  let holdings=Object.values(merged)

  const alerts = []
  const totalVal = holdings.reduce((s,h)=>s+(h.currentPrice||h.buyPrice)*h.shares,0)
  if (totalVal <= 0) return alerts

  holdings.forEach(h => {
    const val = (h.currentPrice||h.buyPrice)*h.shares
    const pct = (val/totalVal)*100
    const cat = getCapCategory(h.marketCap)
    if (cat) {
      const limit = getCapLimit(cat)
      if (pct > limit)
        alerts.push({ type:'danger', message:h.ticker+': חשיפה '+pct.toFixed(1)+'% — חורג ממגבלת '+limit+'% ל'+getCapLabel(cat) })
    }
    // ETF overlap
    const etfWeights = ETF_WEIGHTS[h.ticker.toUpperCase()]
    if (etfWeights) {
      holdings.forEach(other => {
        if (other.ticker===h.ticker) return
        const w = etfWeights[other.ticker.toUpperCase()]
        if (w) {
          const etfPct = (val/totalVal)*100
          const directPct = ((other.currentPrice||other.buyPrice)*other.shares/totalVal)*100
          alerts.push({ type:'warn', message:'חשיפה כפולה: '+h.ticker+' + '+other.ticker+' — סה"כ חשיפה '+(etfPct+directPct).toFixed(1)+'%' })
        }
      })
    }
  })

  return alerts
}
