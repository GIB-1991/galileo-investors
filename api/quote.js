// api/quote.js — Yahoo chart + AV OVERVIEW (1 AV call only)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
const AV_KEYS = ['T8VBPQ82S0O7VFSQ', 'RIBVCZG0TI9S4YM1'];

async function getAVOverview(sym) {
  for (const key of AV_KEYS) {
    try {
      const resp = await fetch(
        'https://www.alphavantage.co/query?function=OVERVIEW&symbol=' + sym + '&apikey=' + key,
        { headers: { 'User-Agent': 'galileo' } }
      );
      if (!resp.ok) continue;
      const ov = await resp.json();
      if (ov.Note || ov.Information || !ov.Symbol) continue;
      return ov;
    } catch { continue; }
  }
  return null;
}

// Fetch short float from Finviz
async function getFinvizShort(sym) {
  try {
    const resp = await fetch(
      'https://finviz.com/quote.ashx?t=' + sym,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }
    );
    if (!resp.ok) return null;
    const html = await resp.text();
    const m = html.match(/Short Float<\/a><\/td><td[^>]*><a[^>]*><b>([\d.]+%)<\/b>/);
    if (!m) return null;
    return parseFloat(m[1]);
  } catch { return null; }
}

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
    // Fetch Yahoo chart + AV OVERVIEW in parallel
    const [chartResp, ov, finvizShort] = await Promise.all([
      fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/' + sym +
        '?interval=' + yhInterval + '&range=' + r,
        { headers: { 'User-Agent': UA } }
      ),
      getAVOverview(sym).catch(() => null),
      getFinvizShort(sym).catch(() => null)
    ]);

    if (!chartResp.ok) return res.status(502).json({ error: 'Yahoo fetch failed: ' + chartResp.status });
    const chartData = await chartResp.json();
    const result = chartData?.chart?.result?.[0];
    if (!result || !result.timestamp?.length) {
      return res.status(500).json({ error: 'No chart data for ' + sym });
    }

    const ym     = result.meta || {};
    const quotes = result.indicators?.quote?.[0] || {};
    const closes  = quotes.close  || [];
    const highs   = quotes.high   || [];
    const lows    = quotes.low    || [];
    const opens   = quotes.open   || [];
    const volumes = quotes.volume || [];

    const lp  = ym.regularMarketPrice || closes.slice(-1)[0] || 0;
    const lpc = ym.chartPreviousClose || closes.slice(-2)[0] || lp;
    const lch = isFinite(lp - lpc) ? +(lp - lpc).toFixed(4) : 0;
    const lpt = lp && lpc && isFinite(lp / lpc) ? +((lp - lpc) / lpc).toFixed(6) : 0;

    const recentVols = volumes.filter(v => v > 0).slice(-30);
    const avgVol30d  = recentVols.length
      ? Math.round(recentVols.reduce((a, b) => a + b, 0) / recentVols.length)
      : (ym.regularMarketVolume || 0);

    const p = n => { const v = parseFloat(n); return isNaN(v) ? undefined : v; };

    const meta = {
      symbol:                     sym,
      currency:                   ym.currency || 'USD',
      exchangeName:               (ov?.Exchange)   || ym.exchangeName || '',
      fullExchangeName:           (ov?.Exchange)   || ym.fullExchangeName || '',
      longName:                   (ov?.Name)       || ym.longName || ym.shortName || sym,
      shortName:                  ym.shortName     || ov?.Name || sym,
      sector:                     ov?.Sector,
      industry:                   ov?.Industry,
      country:                    ov?.Country,
      website:                    ov?.OfficialSite,
      description:                ov?.Description,
      regularMarketPrice:         lp,
      regularMarketChange:        lch,
      regularMarketChangePercent: lpt,
      regularMarketOpen:          ym.regularMarketOpen    || opens.slice(-1)[0],
      regularMarketDayHigh:       ym.regularMarketDayHigh || highs.slice(-1)[0],
      regularMarketDayLow:        ym.regularMarketDayLow  || lows.slice(-1)[0],
      regularMarketVolume:        ym.regularMarketVolume  || volumes.slice(-1)[0],
      chartPreviousClose:         lpc,
      fiftyTwoWeekHigh:           p(ov?.['52WeekHigh'])        || ym.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            p(ov?.['52WeekLow'])         || ym.fiftyTwoWeekLow,
      fiftyDayAverage:            p(ov?.['50DayMovingAverage'])|| ym.fiftyDayAverage,
      twoHundredDayAverage:       p(ov?.['200DayMovingAverage'])||ym.twoHundredDayAverage,
      marketCap:                  p(ov?.MarketCapitalization),
      trailingPE:                 p(ov?.TrailingPE),
      forwardPE:                  p(ov?.ForwardPE),
      trailingEps:                p(ov?.EPS),
      beta:                       p(ov?.Beta),
      priceToBook:                p(ov?.PriceToBookRatio),
      priceToSales:               p(ov?.PriceToSalesRatioTTM),
      sharesOutstanding:          p(ov?.SharesOutstanding),
      shortPercentFloat:          finvizShort ?? null,
      shortRatio:                 null,
      avgVolume30d:               avgVol30d,
      quoteType:                  ym.quoteType || 'EQUITY',
      revenue:                    p(ov?.RevenueTTM),
      grossProfit:                p(ov?.GrossProfitTTM),
      ebitda:                     p(ov?.EBITDA),
      returnOnEquity:             p(ov?.ReturnOnEquityTTM),
      returnOnAssets:             p(ov?.ReturnOnAssetsTTM),
      revenueGrowth:              p(ov?.RevenueGrowthYOY),
      profitMargin:               p(ov?.ProfitMargin),
      operatingMargin:            p(ov?.OperatingMarginTTM),
      dividendYield:              p(ov?.DividendYield),
      dividendRate:               p(ov?.DividendPerShare),
      exDividendDate:             ov?.ExDividendDate || undefined,
      enterpriseToRevenue:        p(ov?.EVToRevenue),
      enterpriseToEbitda:         p(ov?.EVToEBITDA),
      targetMeanPrice:            p(ov?.AnalystTargetPrice),
      recommendationKey:          undefined,
      numberOfAnalystOpinions:    p(ov?.AnalystRatingStrongBuy) != null
        ? [ov.AnalystRatingStrongBuy,ov.AnalystRatingBuy,ov.AnalystRatingHold,
           ov.AnalystRatingSell,ov.AnalystRatingStrongSell]
            .reduce((s,v)=>s+parseInt(v||0),0) || undefined
        : undefined,
    };

    return res.status(200).json({
      chart: { result: [{ meta, timestamp: result.timestamp, indicators: result.indicators }] }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
