export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range, interval } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';
  const iv  = interval || (r==='1d'?'5m': r==='5d'?'1h': r==='1y'?'1wk': r==='5y'?'1mo': '1d');

  const FINNHUB = 'cvmdb79r01qmk8gig58gcvmdb79r01qmk8gig590';
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122';
  const yhHdrs = { 'User-Agent': UA, 'Accept': '*/*' };

  // Convert range to Finnhub timestamps
  const now = Math.floor(Date.now()/1000);
  const rangeMap = { '1d': 86400, '5d': 432000, '1mo': 2592000, '3mo': 7776000, '1y': 31536000, '5y': 157680000 };
  const from = now - (rangeMap[r] || 7776000);

  try {
    // Parallel: Yahoo chart + Finnhub quote + Finnhub financials
    const [chartRes, finnhubQuote, finnhubProfile, finnhubMetrics] = await Promise.allSettled([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+iv+'&range='+r+'&includePrePost=false', { headers: yhHdrs }).then(r=>r.ok?r.json():null),
      fetch('https://finnhub.io/api/v1/quote?symbol='+sym+'&token='+FINNHUB).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/stock/profile2?symbol='+sym+'&token='+FINNHUB).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/stock/metric?symbol='+sym+'&metric=all&token='+FINNHUB).then(r=>r.json()),
    ]);

    const chart  = chartRes.status==='fulfilled' ? chartRes.value : null;
    const fq     = finnhubQuote.status==='fulfilled'   ? finnhubQuote.value   : {};
    const fp     = finnhubProfile.status==='fulfilled' ? finnhubProfile.value : {};
    const fm     = finnhubMetrics.status==='fulfilled' ? finnhubMetrics.value : {};
    const metrics= fm.metric || {};

    // Build unified response in Yahoo chart format
    const result = chart?.chart?.result?.[0];
    const yahooMeta = result?.meta || {};

    const meta = {
      // Core price (prefer Finnhub real-time)
      symbol:                     sym,
      regularMarketPrice:         fq.c || yahooMeta.regularMarketPrice,
      regularMarketChange:        fq.c && fq.pc ? fq.c - fq.pc : undefined,
      regularMarketChangePercent: fq.c && fq.pc ? ((fq.c - fq.pc)/fq.pc) : undefined,
      regularMarketOpen:          fq.o,
      regularMarketDayHigh:       fq.h || yahooMeta.regularMarketDayHigh,
      regularMarketDayLow:        fq.l || yahooMeta.regularMarketDayLow,
      regularMarketVolume:        yahooMeta.regularMarketVolume,
      chartPreviousClose:         fq.pc || yahooMeta.chartPreviousClose,
      // 52 week
      fiftyTwoWeekHigh:           metrics['52WeekHigh']       || yahooMeta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            metrics['52WeekLow']        || yahooMeta.fiftyTwoWeekLow,
      // Averages
      fiftyDayAverage:            metrics['50DayMA']          || yahooMeta.fiftyDayAverage,
      twoHundredDayAverage:       metrics['200DayMA']         || yahooMeta.twoHundredDayAverage,
      // Exchange
      exchangeName:               yahooMeta.exchangeName,
      fullExchangeName:           yahooMeta.fullExchangeName,
      currency:                   yahooMeta.currency || fp.currency,
      // Company info
      longName:                   fp.name || yahooMeta.longName || yahooMeta.shortName,
      shortName:                  fp.name || yahooMeta.shortName,
      industry:                   fp.finnhubIndustry,
      sector:                     fp.gics_sector || fp.sector,
      website:                    fp.weburl,
      logo:                       fp.logo,
      country:                    fp.country,
      // Fundamentals from Finnhub
      marketCap:                  fp.marketCapitalization ? fp.marketCapitalization*1e6 : undefined,
      trailingPE:                 metrics.peBasicExclExtraTTM || metrics.peTTM,
      forwardPE:                  metrics.peForward || metrics.peNormalizedAnnual,
      trailingEps:                metrics.epsBasicExclExtraItemsTTM || metrics.epsTTM,
      beta:                       metrics.beta,
      priceToBook:                metrics.pbAnnual || metrics.pbQuarterly,
      priceToSales:               metrics.psTTM || metrics.psAnnual,
      // Volume
      averageVolume:              metrics.averageVolume,
      averageVolume10Day:         metrics.10DayAverageTradingVolume ? metrics['10DayAverageTradingVolume']*1e6 : undefined,
      sharesOutstanding:          fp.shareOutstanding ? fp.shareOutstanding*1e6 : undefined,
      // Financial performance
      revenue:                    metrics.revenueTTM ? metrics.revenueTTM*1e6 : undefined,
      grossProfits:               metrics.grossMarginTTM ? (metrics.revenueTTM||0)*metrics.grossMarginTTM*1e6 : undefined,
      ebitda:                     metrics.ebitdaPerShareTTM ? undefined : undefined,
      returnOnEquity:             metrics.roeTTM ? metrics.roeTTM/100 : undefined,
      returnOnAssets:             metrics.roaTTM ? metrics.roaTTM/100 : undefined,
      revenueGrowth:              metrics.revenueGrowthTTMYoy ? metrics.revenueGrowthTTMYoy/100 : undefined,
      currentRatio:               metrics.currentRatioAnnual || metrics.currentRatioQuarterly,
      debtToEquity:               metrics.totalDebt_totalEquityAnnual || metrics.totalDebt_totalEquityQuarterly,
      // Dividends
      dividendYield:              metrics.dividendYieldIndicatedAnnual ? metrics.dividendYieldIndicatedAnnual/100 : undefined,
      dividendRate:               metrics.dividendsPerShareAnnual,
      payoutRatio:                metrics.payoutRatioAnnual ? metrics.payoutRatioAnnual/100 : undefined,
      // Enterprise value
      enterpriseValue:            metrics.enterpriseValue ? metrics.enterpriseValue*1e6 : undefined,
      enterpriseToRevenue:        metrics.evToRevenueTTM,
      enterpriseToEbitda:         metrics.evToEbitdaTTM,
      // 52W change
      fiftyTwoWeekChange:         metrics['52WeekPriceReturnDaily'] ? metrics['52WeekPriceReturnDaily']/100 : undefined,
      // keep extra chart meta
      ...Object.fromEntries(Object.entries(yahooMeta).filter(([k])=>!['regularMarketPrice','regularMarketDayHigh','regularMarketDayLow','chartPreviousClose','fiftyTwoWeekHigh','fiftyTwoWeekLow'].includes(k)))
    };

    // Return in same chart format
    const response = chart || { chart: { result: [{ meta, timestamp: [], indicators: { quote: [{}] } }] } };
    if (response.chart?.result?.[0]) response.chart.result[0].meta = meta;

    res.status(200).json(response);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}