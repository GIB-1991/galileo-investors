export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });
  try {
    // Use v10/finance/quoteSummary for richer data
    const [chart, summary] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + ticker.toUpperCase() + '?interval=1d&range=1d',
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
      ).then(r => r.json()),
      fetch('https://query1.finance.yahoo.com/v10/finance/quoteSummary/' + ticker.toUpperCase() + '?modules=price,defaultKeyStatistics,financialData,summaryDetail',
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
      ).then(r => r.json()).catch(() => ({}))
    ]);
    
    // Merge summary data into chart meta
    const result = chart?.chart?.result?.[0];
    if (result && summary?.quoteSummary?.result?.[0]) {
      const s = summary.quoteSummary.result[0];
      const price = s.price || {};
      const stats = s.defaultKeyStatistics || {};
      const financial = s.financialData || {};
      const detail = s.summaryDetail || {};
      
      result.meta = {
        ...result.meta,
        beta: stats.beta?.raw || result.meta.beta,
        trailingPE: detail.trailingPE?.raw || result.meta.trailingPE,
        forwardPE: detail.forwardPE?.raw,
        fiftyDayAverage: detail.fiftyDayAverage?.raw,
        twoHundredDayAverage: detail.twoHundredDayAverage?.raw,
        averageVolume: detail.averageVolume?.raw || price.averageVolume?.raw,
        averageVolume10days: detail.averageVolume10days?.raw,
        shortPercentOfFloat: stats.shortPercentOfFloat?.raw,
        floatShares: stats.floatShares?.raw,
        sharesOutstanding: stats.sharesOutstanding?.raw || result.meta.sharesOutstanding,
        targetMeanPrice: financial.targetMeanPrice?.raw,
        currentRatio: financial.currentRatio?.raw,
        sector: price.sector || result.meta.sector,
        industry: price.industry || result.meta.industry,
        longName: price.longName || result.meta.longName,
        shortName: price.shortName || result.meta.shortName,
      };
    }
    
    res.status(200).json(chart);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}