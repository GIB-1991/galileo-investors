export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range, interval } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';
  const iv  = interval || (r==='1d' ? '5m' : r==='5d' ? '1h' : r==='1y' ? '1wk' : r==='5y' ? '1mo' : '1d');

  const FKEY = 'cvmdb79r01qmk8gig58gcvmdb79r01qmk8gig590';
  const UA   = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122';

  try {
    const [chartRes, fqRes, fpRes, fmRes] = await Promise.allSettled([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+iv+'&range='+r+'&includePrePost=false', { headers: { 'User-Agent': UA } }).then(r=>r.ok ? r.json() : null),
      fetch('https://finnhub.io/api/v1/quote?symbol='+sym+'&token='+FKEY).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/stock/profile2?symbol='+sym+'&token='+FKEY).then(r=>r.json()),
      fetch('https://finnhub.io/api/v1/stock/metric?symbol='+sym+'&metric=all&token='+FKEY).then(r=>r.json()),
    ]);

    const chart = chartRes.value;
    const fq    = fqRes.value    || {};
    const fp    = fpRes.value    || {};
    const fm    = fmRes.value    || {};
    const mt    = fm.metric      || {};

    const yahooMeta = chart?.chart?.result?.[0]?.meta || {};

    const vol10d = mt['10DayAverageTradingVolume'];
    const rev    = mt['revenueTTM'];

    const meta = {
      ...yahooMeta,
      // Live price from Finnhub
      regularMarketPrice:         fq.c  || yahooMeta.regularMarketPrice,
      regularMarketChange:        (fq.c && fq.pc) ? +(fq.c - fq.pc).toFixed(4) : undefined,
      regularMarketChangePercent: (fq.c && fq.pc) ? +((fq.c - fq.pc)/fq.pc).toFixed(6) : undefined,
      regularMarketOpen:          fq.o  || yahooMeta.regularMarketOpen,
      regularMarketDayHigh:       fq.h  || yahooMeta.regularMarketDayHigh,
      regularMarketDayLow:        fq.l  || yahooMeta.regularMarketDayLow,
      chartPreviousClose:         fq.pc || yahooMeta.chartPreviousClose,
      // 52W from Finnhub metrics
      fiftyTwoWeekHigh:           mt['52WeekHigh']  || yahooMeta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            mt['52WeekLow']   || yahooMeta.fiftyTwoWeekLow,
      fiftyDayAverage:            mt['50DayMA']     || yahooMeta.fiftyDayAverage,
      twoHundredDayAverage:       mt['200DayMA']    || yahooMeta.twoHundredDayAverage,
      // Company info
      longName:                   fp.name || yahooMeta.longName,
      industry:                   fp.finnhubIndustry,
      logo:                       fp.logo,
      website:                    fp.weburl,
      country:                    fp.country,
      // Fundamentals
      marketCap:                  fp.marketCapitalization ? fp.marketCapitalization * 1e6 : undefined,
      trailingPE:                 mt.peBasicExclExtraTTM || mt.peTTM,
      forwardPE:                  mt.peNormalizedAnnual,
      trailingEps:                mt.epsBasicExclExtraItemsTTM || mt.epsTTM,
      beta:                       mt.beta,
      priceToBook:                mt.pbAnnual || mt.pbQuarterly,
      priceToSales:               mt.psTTM   || mt.psAnnual,
      // Volume
      averageVolume:              mt.averageVolume,
      averageVolume10Day:         vol10d ? vol10d * 1e6 : undefined,
      sharesOutstanding:          fp.shareOutstanding ? fp.shareOutstanding * 1e6 : undefined,
      // Financials
      revenue:                    rev ? rev * 1e6 : undefined,
      returnOnEquity:             mt.roeTTM   ? mt.roeTTM / 100   : undefined,
      returnOnAssets:             mt.roaTTM   ? mt.roaTTM / 100   : undefined,
      revenueGrowth:              mt.revenueGrowthTTMYoy ? mt.revenueGrowthTTMYoy / 100 : undefined,
      currentRatio:               mt.currentRatioAnnual || mt.currentRatioQuarterly,
      debtToEquity:               mt.totalDebt_totalEquityAnnual,
      grossMargin:                mt.grossMarginTTM ? mt.grossMarginTTM / 100 : undefined,
      netMargin:                  mt.netProfitMarginTTM ? mt.netProfitMarginTTM / 100 : undefined,
      // Dividends
      dividendYield:              mt.dividendYieldIndicatedAnnual ? mt.dividendYieldIndicatedAnnual / 100 : undefined,
      dividendRate:               mt.dividendsPerShareAnnual,
      payoutRatio:                mt.payoutRatioAnnual ? mt.payoutRatioAnnual / 100 : undefined,
      // EV
      enterpriseValue:            mt.enterpriseValue ? mt.enterpriseValue * 1e6 : undefined,
      enterpriseToRevenue:        mt.evToRevenueTTM,
      enterpriseToEbitda:         mt.evToEbitdaTTM,
      // 52W return
      fiftyTwoWeekChange:         mt['52WeekPriceReturnDaily'] ? mt['52WeekPriceReturnDaily'] / 100 : undefined,
    };

    if (chart?.chart?.result?.[0]) {
      chart.chart.result[0].meta = meta;
    }

    res.status(200).json(chart || { chart: { result: [{ meta, timestamp: [], indicators: { quote: [{}] } }] } });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}