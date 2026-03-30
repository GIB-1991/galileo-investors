// api/quote.js — Yahoo Finance (chart + financialData)
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
    // Fetch chart + quote summary in parallel
    const [chartResp, summaryResp] = await Promise.all([
      fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/' + sym +
        '?interval=' + yhInterval + '&range=' + r,
        { headers: { 'User-Agent': UA, 'Accept': '*/*' } }
      ),
      fetch(
        'https://query1.finance.yahoo.com/v11/finance/quoteSummary/' + sym +
        '?modules=summaryDetail,defaultKeyStatistics,financialData,assetProfile,recommendationTrend',
        { headers: { 'User-Agent': UA, 'Accept': 'application/json' } }
      ).catch(() => null)
    ]);

    if (!chartResp.ok) return res.status(502).json({ error: 'Yahoo chart failed: ' + chartResp.status });

    const chartData = await chartResp.json();
    const result = chartData?.chart?.result?.[0];
    if (!result || !result.timestamp?.length) {
      return res.status(500).json({ error: 'No chart data for ' + sym });
    }

    // Parse quote summary
    let sd = {}, ks = {}, fd = {}, ap = {}, rt = {};
    if (summaryResp?.ok) {
      const summaryData = await summaryResp.json().catch(() => ({}));
      const qr = summaryData?.quoteSummary?.result?.[0] || {};
      sd = qr.summaryDetail || {};
      ks = qr.defaultKeyStatistics || {};
      fd = qr.financialData || {};
      ap = qr.assetProfile || {};
      rt = qr.recommendationTrend?.trend?.[0] || {};
    }

    const ym = result.meta || {};
    const quotes = result.indicators?.quote?.[0] || {};
    const closes  = quotes.close  || [];
    const highs   = quotes.high   || [];
    const lows    = quotes.low    || [];
    const opens   = quotes.open   || [];
    const volumes = quotes.volume || [];

    const lp  = ym.regularMarketPrice || closes.slice(-1)[0] || 0;
    const lpc = ym.chartPreviousClose || closes.slice(-2)[0] || lp;
    const lch = lp && lpc && isFinite(lp - lpc) ? +(lp - lpc).toFixed(4) : 0;
    const lpt = lp && lpc && isFinite(lp / lpc) ? +((lp - lpc) / lpc).toFixed(6) : 0;

    const recentVols = volumes.filter(v => v != null && v > 0).slice(-30);
    const avgVol30d  = recentVols.length
      ? Math.round(recentVols.reduce((a, b) => a + b, 0) / recentVols.length)
      : (ym.regularMarketVolume || 0);

    const n = v => (v?.raw ?? v ?? null);

    const meta = {
      symbol:                     sym,
      currency:                   ym.currency || 'USD',
      exchangeName:               ym.exchangeName || '',
      fullExchangeName:           ym.fullExchangeName || '',
      longName:                   ap.longName || ym.longName || ym.shortName || sym,
      shortName:                  ym.shortName || sym,
      sector:                     ap.sector || undefined,
      industry:                   ap.industry || undefined,
      country:                    ap.country || undefined,
      website:                    ap.website || undefined,
      description:                ap.longBusinessSummary || undefined,
      regularMarketPrice:         lp,
      regularMarketChange:        lch,
      regularMarketChangePercent: lpt,
      regularMarketOpen:          ym.regularMarketOpen    || opens.slice(-1)[0],
      regularMarketDayHigh:       ym.regularMarketDayHigh || highs.slice(-1)[0],
      regularMarketDayLow:        ym.regularMarketDayLow  || lows.slice(-1)[0],
      regularMarketVolume:        ym.regularMarketVolume  || volumes.slice(-1)[0],
      chartPreviousClose:         lpc,
      fiftyTwoWeekHigh:           n(sd.fiftyTwoWeekHigh) || ym.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            n(sd.fiftyTwoWeekLow)  || ym.fiftyTwoWeekLow,
      fiftyDayAverage:            n(ks.fiftyDayAverage)  || ym.fiftyDayAverage,
      twoHundredDayAverage:       n(ks.twoHundredDayAverage) || ym.twoHundredDayAverage,
      marketCap:                  n(sd.marketCap),
      trailingPE:                 n(sd.trailingPE),
      forwardPE:                  n(sd.forwardPE),
      trailingEps:                n(ks.trailingEps),
      beta:                       n(sd.beta),
      priceToBook:                n(ks.priceToBook),
      priceToSales:               n(ks.priceToSalesTrailing12Months),
      sharesOutstanding:          n(ks.sharesOutstanding),
      shortPercentFloat:          n(ks.shortPercentOfFloat) != null
                                    ? parseFloat((n(ks.shortPercentOfFloat) * 100).toFixed(2))
                                    : null,
      shortRatio:                 n(ks.shortRatio),
      avgVolume30d:               avgVol30d,
      quoteType:                  ym.quoteType || 'EQUITY',
      revenue:                    n(fd.totalRevenue),
      grossProfit:                n(fd.grossProfits),
      ebitda:                     n(fd.ebitda),
      returnOnEquity:             n(fd.returnOnEquity),
      returnOnAssets:             n(fd.returnOnAssets),
      revenueGrowth:              n(fd.revenueGrowth),
      profitMargin:               n(fd.profitMargins),
      operatingMargin:            n(fd.operatingMargins),
      dividendYield:              n(sd.dividendYield) ?? n(sd.trailingAnnualDividendYield) ?? null,
      dividendRate:               n(sd.dividendRate)  ?? n(sd.trailingAnnualDividendRate) ?? null,
      exDividendDate:             sd.exDividendDate?.fmt || undefined,
      enterpriseToRevenue:        n(ks.enterpriseToRevenue),
      enterpriseToEbitda:         n(ks.enterpriseToEbitda),
      targetMeanPrice:            n(fd.targetMeanPrice),
      recommendationKey:          fd.recommendationKey || undefined,
      numberOfAnalystOpinions:    n(fd.numberOfAnalystOpinions),
    };

    return res.status(200).json({
      chart: { result: [{ meta, timestamp: result.timestamp, indicators: result.indicators }] }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
