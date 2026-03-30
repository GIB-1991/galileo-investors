// api/quote.js — Yahoo Finance only
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';

  const intervalMap = { '1d':'5m', '5d':'1h', '1y':'1wk', '5y':'1mo' };
  const yhInterval  = intervalMap[r] || '1d';

  try {
    // Fetch Yahoo chart
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + sym
              + '?interval=' + yhInterval + '&range=' + r;
    const resp = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': '*/*' } });
    if (!resp.ok) return res.status(502).json({ error: 'Yahoo fetch failed: ' + resp.status });

    const data = await resp.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.timestamp?.length) {
      return res.status(500).json({ error: 'No chart data for ' + sym });
    }

    const ym = result.meta || {};
    const quotes = result.indicators?.quote?.[0] || {};
    const closes  = quotes.close  || [];
    const highs   = quotes.high   || [];
    const lows    = quotes.low    || [];
    const opens   = quotes.open   || [];
    const volumes = quotes.volume || [];

    // Price calculations
    const lp  = ym.regularMarketPrice || closes.slice(-1)[0] || 0;
    const lpc = ym.chartPreviousClose || closes.slice(-2)[0] || lp;
    const lch = lp && lpc ? +(lp - lpc).toFixed(4) : 0;
    const lpt = lp && lpc ? +((lp - lpc) / lpc).toFixed(6) : 0;

    // Average volume (last 30 trading days)
    const recentVols = volumes.filter(v => v != null && v > 0).slice(-30);
    const avgVol30d  = recentVols.length
      ? Math.round(recentVols.reduce((a,b)=>a+b,0) / recentVols.length)
      : (ym.regularMarketVolume || 0);

    const meta = {
      symbol:                     sym,
      currency:                   ym.currency || 'USD',
      exchangeName:               ym.exchangeName || '',
      fullExchangeName:           ym.fullExchangeName || '',
      longName:                   ym.longName || ym.shortName || sym,
      shortName:                  ym.shortName || sym,
      sector:                     ym.sector || undefined,
      industry:                   ym.industry || undefined,
      country:                    ym.country || undefined,
      website:                    ym.website || undefined,
      description:                ym.description || undefined,
      regularMarketPrice:         lp,
      regularMarketChange:        lch,
      regularMarketChangePercent: lpt,
      regularMarketOpen:          ym.regularMarketOpen    || opens.slice(-1)[0],
      regularMarketDayHigh:       ym.regularMarketDayHigh || highs.slice(-1)[0],
      regularMarketDayLow:        ym.regularMarketDayLow  || lows.slice(-1)[0],
      regularMarketVolume:        ym.regularMarketVolume  || volumes.slice(-1)[0],
      chartPreviousClose:         lpc,
      fiftyTwoWeekHigh:           ym.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            ym.fiftyTwoWeekLow,
      fiftyDayAverage:            ym.fiftyDayAverage,
      twoHundredDayAverage:       ym.twoHundredDayAverage,
      marketCap:                  ym.marketCap,
      trailingPE:                 ym.trailingPE,
      forwardPE:                  ym.forwardPE,
      trailingEps:                ym.trailingEps,
      beta:                       ym.beta,
      priceToBook:                ym.priceToBook,
      priceToSales:               ym.priceToSales,
      sharesOutstanding:          ym.sharesOutstanding,
      shortPercentFloat:          null,
      shortRatio:                 null,
      avgVolume30d:               avgVol30d,
      quoteType:                  ym.quoteType || 'EQUITY',
      revenue:                    ym.revenue,
      grossProfit:                ym.grossProfit,
      ebitda:                     ym.ebitda,
      returnOnEquity:             ym.returnOnEquity,
      returnOnAssets:             ym.returnOnAssets,
      revenueGrowth:              ym.revenueGrowth,
      profitMargin:               ym.profitMargin,
      operatingMargin:            ym.operatingMargin,
      dividendYield:              ym.dividendYield ?? null,
      dividendRate:               ym.dividendRate  ?? null,
      exDividendDate:             ym.exDividendDate ? new Date(ym.exDividendDate*1000).toISOString().split('T')[0] : undefined,
      enterpriseToRevenue:        ym.enterpriseToRevenue,
      enterpriseToEbitda:         ym.enterpriseToEbitda,
      targetMeanPrice:            ym.targetMeanPrice,
      recommendationKey:          ym.recommendationKey,
      numberOfAnalystOpinions:    ym.numberOfAnalystOpinions,
    };

    return res.status(200).json({
      chart: { result: [{ meta, timestamp: result.timestamp, indicators: result.indicators }] }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
