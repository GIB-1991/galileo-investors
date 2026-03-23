export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range, interval } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r = range || '3mo';
  // Auto-select interval based on range
  const iv = interval || (r==='1d'?'5m': r==='5d'?'1h': r==='1mo'?'1d': r==='3mo'?'1d': r==='1y'?'1wk': '1mo');
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120';

  try {
    const [chartRes, summaryRes] = await Promise.all([
      fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+iv+'&range='+r,
        { headers: { 'User-Agent': UA } }
      ).then(r=>r.json()),
      fetch(
        'https://query1.finance.yahoo.com/v10/finance/quoteSummary/'+sym+'?modules=price,defaultKeyStatistics,financialData,summaryDetail',
        { headers: { 'User-Agent': UA } }
      ).then(r=>r.json()).catch(()=>null)
    ]);

    // Merge summary data into chart meta
    const result = chartRes?.chart?.result?.[0];
    if (!result) return res.status(200).json(chartRes);

    const sumResult = summaryRes?.quoteSummary?.result?.[0] || {};
    const price   = sumResult.price || {};
    const keyStats= sumResult.defaultKeyStatistics || {};
    const finData = sumResult.financialData || {};
    const sumDet  = sumResult.summaryDetail || {};

    // Enrich meta with summary data
    result.meta = {
      ...result.meta,
      // From price module
      marketCap:            price.marketCap?.raw,
      marketCapFmt:         price.marketCap?.fmt,
      trailingPE:           price.trailingPE?.raw,
      forwardPE:            price.forwardPE?.raw,
      priceToBook:          price.priceToBook?.raw,
      regularMarketChange:  price.regularMarketChange?.raw,
      regularMarketChangePercent: price.regularMarketChangePercent?.raw,
      regularMarketOpen:    price.regularMarketOpen?.raw,
      averageVolume:        price.averageDailyVolume3Month?.raw,
      averageVolume10Day:   price.averageDailyVolume10Day?.raw,
      longName:             price.longName || result.meta.longName,
      shortName:            price.shortName || result.meta.shortName,
      exchange:             price.exchange || result.meta.exchangeName,
      // From keyStatistics
      beta:                 keyStats.beta?.raw,
      trailingEps:          keyStats.trailingEps?.raw,
      forwardEps:           keyStats.forwardEps?.raw,
      bookValue:            keyStats.bookValue?.raw,
      priceToSales:         keyStats.priceToSalesTrailing12Months?.raw,
      enterpriseValue:      keyStats.enterpriseValue?.raw,
      fiftyTwoWeekChange:   keyStats['52WeekChange']?.raw,
      sharesOutstanding:    keyStats.sharesOutstanding?.raw,
      floatShares:          keyStats.floatShares?.raw,
      shortRatio:           keyStats.shortRatio?.raw,
      // From financialData
      revenue:              finData.totalRevenue?.raw,
      grossProfits:         finData.grossProfits?.raw,
      ebitda:               finData.ebitda?.raw,
      debtToEquity:         finData.debtToEquity?.raw,
      returnOnEquity:       finData.returnOnEquity?.raw,
      returnOnAssets:       finData.returnOnAssets?.raw,
      revenueGrowth:        finData.revenueGrowth?.raw,
      earningsGrowth:       finData.earningsGrowth?.raw,
      currentRatio:         finData.currentRatio?.raw,
      targetMeanPrice:      finData.targetMeanPrice?.raw,
      targetHighPrice:      finData.targetHighPrice?.raw,
      targetLowPrice:       finData.targetLowPrice?.raw,
      recommendationMean:   finData.recommendationMean?.raw,
      recommendationKey:    finData.recommendationKey,
      numberOfAnalystOpinions: finData.numberOfAnalystOpinions?.raw,
      // From summaryDetail
      dividendYield:        sumDet.dividendYield?.raw,
      dividendRate:         sumDet.dividendRate?.raw,
      exDividendDate:       sumDet.exDividendDate?.fmt,
      payoutRatio:          sumDet.payoutRatio?.raw,
      fiveYearAvgDividendYield: sumDet.fiveYearAvgDividendYield?.raw,
      trailingAnnualDividendYield: sumDet.trailingAnnualDividendYield?.raw,
    };

    res.status(200).json(chartRes);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}