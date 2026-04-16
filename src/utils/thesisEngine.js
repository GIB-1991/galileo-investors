// ETF major holdings for overlap detection
const ETF_HOLDINGS = {
  SPY: ['AAPL','MSFT','NVDA','AMZN','GOOGL','GOOG','META','TSLA','BRK.B','LLY','JPM','V','UNH','XOM','MA'],
  QQQ: ['AAPL','MSFT','NVDA','AMZN','GOOGL','GOOG','META','TSLA','AVGO','COST','NFLX','ADBE','AMD','INTC','QCOM'],
  VTI: ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','BRK.B','LLY','JPM'],
  IWM: ['SMCI','CHWY','RIVN','LCID','GME','AMC'],
  DIA: ['UNH','GS','HD','MSFT','CAT','SHW','MCD','V','AMGN','AXP'],
}

const ETF_TICKERS = new Set(Object.keys(ETF_HOLDINGS))

// מניות עם אחוז גדול ב-ETF ספציפי (>5%)
const ETF_WEIGHTS = {
  SPY: { AAPL:0.073, MSFT:0.065, NVDA:0.059, AMZN:0.039, GOOGL:0.034, META:0.028 },
  QQQ: { AAPL:0.089, MSFT:0.079, NVDA:0.072, AMZN:0.051, GOOGL:0.050, META:0.040 },
}

// Returns market cap category based on live market cap (from Finviz/Yahoo)
// Mega Cap: >1T | Large Cap: 200B-1T | Small Cap: <200B
function getCategory(mc) {
  if (!mc || mc === 0) return 'ETF'
  if (mc >= 1e12) return 'mega'      // >$1T — max 20% portfolio
  if (mc >= 200e9) return 'large'    // $200B-$1T — max 10%
  return 'small'                     // <$200B — max 5%
}

export function analyzePortfolio(holdingsInput) {
  // Merge duplicate tickers before analysis
  const merged={};
  [...holdingsInput].forEach(h=>{
    if(merged[h.ticker]) merged[h.ticker]={...merged[h.ticker],shares:merged[h.ticker].shares+h.shares};
    else merged[h.ticker]={...h};
  });
  let holdings=Object.values(merged);

  const alerts = []
  if (!holdings?.length) return alerts

  const totalValue = holdings.reduce((s,h) => s + ((h.currentPrice||h.buyPrice||0) * (h.shares||0)), 0)
  if (!totalValue) return alerts

  // Build effective exposures — including ETF overlaps
  const effectiveExposure = {} // ticker -> total exposure fraction

  for (const h of holdings) {
    const val = (h.currentPrice||h.buyPrice||0) * (h.shares||0)
    const w = val / totalValue
    const t = h.ticker.toUpperCase()

    if (ETF_TICKERS.has(t)) {
      // Add ETF weight to each underlying holding
      const weights = ETF_WEIGHTS[t]
      if (weights) {
        for (const [underlying, etfW] of Object.entries(weights)) {
          effectiveExposure[underlying] = (effectiveExposure[underlying]||0) + w * etfW
        }
      }
      // ETFs can be 100% — no limit
    } else {
      effectiveExposure[t] = (effectiveExposure[t]||0) + w
    }
  }

  // Check each direct holding
  for (const h of holdings) {
    const t = h.ticker.toUpperCase()
    if (ETF_TICKERS.has(t)) continue // ETFs have no cap limit

    const val = (h.currentPrice||h.buyPrice||0) * (h.shares||0)
    const directW = val / totalValue
    const totalW = effectiveExposure[t] || directW
    const cat = getCategory(h.marketCap||0)
    const pct = (totalW*100).toFixed(1)

    // Position size alerts
    if (cat==='mega' && totalW > 0.20)
      alerts.push({ type:'warning', ticker:t, message:t+': חשיפה '+pct+'% — Mega Cap חורג ממגבלת 20%' })
    if (cat==='large' && totalW > 0.10)
      alerts.push({ type:'warning', ticker:t, message:t+': חשיפה '+pct+'% — Large Cap חורג ממגבלת 10%' })
    if (cat==='small' && totalW > 0.05)
      alerts.push({ type:'warning', ticker:t, message:t+': חשיפה '+pct+'% — Small Cap חורג ממגבלת 5%' })

    // ETF overlap alert
    if (totalW > directW + 0.01) {
      const overlapPct = ((totalW-directW)*100).toFixed(1)
      alerts.push({ type:'info', ticker:t, message:t+': חשיפה כפולה +'+overlapPct+'% דרך ETF בתיק' })
    }
  }

  return alerts
}

// Called when user clicks "הוסף" — checks single stock before adding
// Returns array of alerts for that stock + projected portfolio
export function checkStockAlerts(stock, existingHoldings, newShares, newBuyPrice) {
  const alerts = []
  const t = (stock.ticker||'').toUpperCase()

  // 1. Short Float > 10%
  if ((stock.shortFloat||0) > 10)
    alerts.push({ type:'danger', message:t+': שורט פלואט '+stock.shortFloat.toFixed(1)+'% — מעל 10%, סיכון גבוה' })

  // 2. Beta > 3
  if ((stock.beta||0) > 3)
    alerts.push({ type:'danger', message:t+': Beta '+stock.beta.toFixed(2)+' — תנודתיות גבוהה מאוד (מעל 3)' })

  // 3. Average daily volume < 250K
  if (stock.avgVolume > 0 && stock.avgVolume < 250000)
    alerts.push({ type:'danger', message:t+': נפח מסחר יומי '+Math.round(stock.avgVolume/1000)+'K — נזילות נמוכה (מינימום 250K)' })

  // 4. Project portfolio weight after addition
  const newVal = newShares * (stock.price||newBuyPrice||0)
  const existingTotal = existingHoldings.reduce((s,h)=>s+((h.currentPrice||h.buyPrice||0)*h.shares),0)
  const projectedTotal = existingTotal + newVal
  if (projectedTotal > 0) {
    const w = newVal / projectedTotal
    const cat = getCategory(stock.marketCap||0)
    const pct = (w*100).toFixed(1)
    if (cat==='mega' && w>0.20)
      alerts.push({ type:'warning', message:t+': משקל צפוי '+pct+'% — Mega Cap יחרוג ממגבלת 20%' })
    if (cat==='large' && w>0.10)
      alerts.push({ type:'warning', message:t+': משקל צפוי '+pct+'% — Large Cap יחרוג ממגבלת 10%' })
    if (cat==='small' && w>0.05)
      alerts.push({ type:'warning', message:t+': משקל צפוי '+pct+'% — Small Cap יחרוג ממגבלת 5%' })
  }

  return alerts
}