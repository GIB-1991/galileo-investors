export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range, interval } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';
  const iv  = interval || (r==='1d'?'5m': r==='5d'?'1h': r==='1mo'?'1d': r==='3mo'?'1d': r==='1y'?'1wk': '1mo');
  const UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124';

  try {
    const [chartRes, summaryRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+iv+'&range='+r,
        { headers: { 'User-Agent': UA } }).then(r=>r.json()),
      fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+sym+'?modules=price%2CdefaultKeyStatistics%2CfinancialData%2CsummaryDetail',
        { headers: { 'User-Agent': UA } }).then(r=>r.json()).catch(()=>null)
    ]);

    const result = chartRes?.chart?.result?.[0];
    if (!result) return res.status(200).json(chartRes);

    const s  = summaryRes?.quoteSummary?.result?.[0] || {};
    const p  = s.price || {};
    const ks = s.defaultKeyStatistics || {};
    const fd = s.financialData || {};
    const sd = s.summaryDetail || {};

    result.meta = {
      ...result.meta,
      marketCap:           p.marketCap?.raw,
      trailingPE:          p.trailingPE?.raw,
      forwardPE:           p.forwardPE?.raw,
      priceToBook:         p.priceToBook?.raw,
      regularMarketChange: p.regularMarketChange?.raw,
      regularMarketChangePercent: p.regularMarketChangePercent?.raw,
      regularMarketOpen:   p.regularMarketOpen?.raw,
      averageVolume:       p.averageDailyVolume3Month?.raw,
      averageVolume10Day:  p.averageDailyVolume10Day?.raw,
      longName:            p.longName || result.meta.longName,
      beta:                ks.beta?.raw,
      trailingEps:         ks.trailingEps?.raw,
      forwardEps:          ks.forwardEps?.raw,
      bookValue:           ks.bookValue?.raw,
      priceToSales:        ks.priceToSalesTrailing12Months?.raw,
      enterpriseValue:     ks.enterpriseValue?.raw,
      sharesOutstanding:   ks.sharesOutstanding?.raw,
      floatShares:         ks.floatShares?.raw,
      shortRatio:          ks.shortRatio?.raw,
      revenue:             fd.totalRevenue?.raw,
      grossProfits:        fd.grossProfits?.raw,
      ebitda:              fd.ebitda?.raw,
      debtToEquity:        fd.debtToEquity?.raw,
      returnOnEquity:      fd.returnOnEquity?.raw,
      returnOnAssets:      fd.returnOnAssets?.raw,
      revenueGrowth:       fd.revenueGrowth?.raw,
      earningsGrowth:      fd.earningsGrowth?.raw,
      currentRatio:        fd.currentRatio?.raw,
      targetMeanPrice:     fd.targetMeanPrice?.raw,
      targetHighPrice:     fd.targetHighPrice?.raw,
      targetLowPrice:      fd.targetLowPrice?.raw,
      recommendationKey:   fd.recommendationKey,
      numberOfAnalystOpinions: fd.numberOfAnalystOpinions?.raw,
      dividendYield:       sd.dividendYield?.raw,
      dividendRate:        sd.dividendRate?.raw,
      exDividendDate:      sd.exDividendDate?.fmt,
      payoutRatio:         sd.payoutRatio?.raw,
      fiveYearAvgDividendYield: sd.fiveYearAvgDividendYield?.raw,
    };

    res.status(200).json(chartRes);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}