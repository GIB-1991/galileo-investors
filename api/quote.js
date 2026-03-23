export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym  = ticker.toUpperCase();
  const r    = range || '3mo';
  const FKEY = 'cvmdb79r01qmk8gig58gcvmdb79r01qmk8gig590';

  // Map range to Finnhub candle resolution
  const resMap  = { '1d':'5', '5d':'60', '1mo':'D', '3mo':'D', '1y':'W', '5y':'M' };
  const resolution = resMap[r] || 'D';

  const now  = Math.floor(Date.now() / 1000);
  const secs = { '1d':86400, '5d':432000, '1mo':2592000, '3mo':7776000, '1y':31536000, '5y':157680000 };
  const from = now - (secs[r] || 7776000);

  try {
    const [candlesRes, quoteRes, profileRes, metricsRes] = await Promise.allSettled([
      fetch('https://finnhub.io/api/v1/stock/candle?symbol='+sym+'&resolution='+resolution+'&from='+from+'&to='+now+'&token='+FKEY).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/quote?symbol='+sym+'&token='+FKEY).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/stock/profile2?symbol='+sym+'&token='+FKEY).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/stock/metric?symbol='+sym+'&metric=all&token='+FKEY).then(r=>r.json()),
    ]);

    const candles = candlesRes.status==='fulfilled' ? candlesRes.value : {};
    const fq      = quoteRes.status==='fulfilled'   ? quoteRes.value   : {};
    const fp      = profileRes.status==='fulfilled' ? profileRes.value : {};
    const fm      = metricsRes.status==='fulfilled' ? metricsRes.value : {};
    const mt      = fm.metric || {};

    // Build chart data from Finnhub candles
    const timestamps = (candles.s === 'ok') ? candles.t || [] : [];
    const closes     = (candles.s === 'ok') ? candles.c || [] : [];
    const highs      = (candles.s === 'ok') ? candles.h || [] : [];
    const lows       = (candles.s === 'ok') ? candles.l || [] : [];
    const volumes    = (candles.s === 'ok') ? candles.v || [] : [];
    const opens      = (candles.s === 'ok') ? candles.o || [] : [];

    const price     = fq.c || 0;
    const prevClose = fq.pc || price;
    const change    = +(price - prevClose).toFixed(4);
    const changePct = prevClose ? +((price - prevClose) / prevClose).toFixed(6) : 0;

    const meta = {
      symbol:                     sym,
      currency:                   fp.currency || 'USD',
      exchangeName:               fp.exchange || '',
      fullExchangeName:           fp.exchange || '',
      longName:                   fp.name     || sym,
      shortName:                  fp.name     || sym,
      logo:                       fp.logo,
      website:                    fp.weburl,
      industry:                   fp.finnhubIndustry,
      country:                    fp.country,
      // Live price
      regularMarketPrice:         price,
      regularMarketChange:        change,
      regularMarketChangePercent: changePct,
      regularMarketOpen:          fq.o,
      regularMarketDayHigh:       fq.h,
      regularMarketDayLow:        fq.l,
      regularMarketVolume:        volumes[volumes.length-1],
      chartPreviousClose:         prevClose,
      // 52W
      fiftyTwoWeekHigh:           mt['52WeekHigh'],
      fiftyTwoWeekLow:            mt['52WeekLow'],
      fiftyDayAverage:            mt['50DayMA'],
      twoHundredDayAverage:       mt['200DayMA'],
      // Fundamentals
      marketCap:                  fp.marketCapitalization ? fp.marketCapitalization*1e6 : undefined,
      trailingPE:                 mt.peBasicExclExtraTTM   || mt.peTTM,
      forwardPE:                  mt.peNormalizedAnnual,
      trailingEps:                mt.epsBasicExclExtraItemsTTM || mt.epsTTM,
      beta:                       mt.beta,
      priceToBook:                mt.pbAnnual    || mt.pbQuarterly,
      priceToSales:               mt.psTTM       || mt.psAnnual,
      // Volume
      averageVolume:              mt.averageVolume,
      sharesOutstanding:          fp.shareOutstanding ? fp.shareOutstanding*1e6 : undefined,
      // Financials
      revenue:                    mt.revenueTTM        ? mt.revenueTTM*1e6 : undefined,
      returnOnEquity:             mt.roeTTM            ? mt.roeTTM/100 : undefined,
      returnOnAssets:             mt.roaTTM            ? mt.roaTTM/100 : undefined,
      revenueGrowth:              mt.revenueGrowthTTMYoy ? mt.revenueGrowthTTMYoy/100 : undefined,
      grossMargin:                mt.grossMarginTTM    ? mt.grossMarginTTM/100 : undefined,
      netMargin:                  mt.netProfitMarginTTM ? mt.netProfitMarginTTM/100 : undefined,
      currentRatio:               mt.currentRatioAnnual || mt.currentRatioQuarterly,
      debtToEquity:               mt.totalDebt_totalEquityAnnual,
      // Dividends
      dividendYield:              mt.dividendYieldIndicatedAnnual ? mt.dividendYieldIndicatedAnnual/100 : undefined,
      dividendRate:               mt.dividendsPerShareAnnual,
      payoutRatio:                mt.payoutRatioAnnual ? mt.payoutRatioAnnual/100 : undefined,
      // EV
      enterpriseValue:            mt.enterpriseValue   ? mt.enterpriseValue*1e6 : undefined,
      enterpriseToRevenue:        mt.evToRevenueTTM,
      enterpriseToEbitda:         mt.evToEbitdaTTM,
      fiftyTwoWeekChange:         mt['52WeekPriceReturnDaily'] ? mt['52WeekPriceReturnDaily']/100 : undefined,
    };

    // Return in Yahoo chart format so Screener.jsx works unchanged
    res.status(200).json({
      chart: {
        result: [{
          meta,
          timestamp: timestamps,
          indicators: {
            quote: [{ open: opens, high: highs, low: lows, close: closes, volume: volumes }],
            adjclose: [{ adjclose: closes }]
          }
        }]
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}