export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range, interval } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';
  const iv  = interval || (r==='1d'?'5m': r==='5d'?'1h': r==='1y'?'1wk': r==='5y'?'1mo': '1d');

  const hdrs = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://finance.yahoo.com',
    'Referer': 'https://finance.yahoo.com',
  };

  try {
    // Fetch chart + v7 quote in parallel
    const [chartRes, quoteRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+iv+'&range='+r+'&includePrePost=false&events=div%2Csplit', { headers: hdrs }).then(r=>r.json()),
      fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols='+sym+'&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,averageDailyVolume3Month,averageDailyVolume10Day,fiftyTwoWeekHigh,fiftyTwoWeekLow,fiftyTwoWeekHighChange,fiftyTwoWeekHighChangePercent,fiftyDayAverage,twoHundredDayAverage,marketCap,trailingPE,forwardPE,priceToBook,trailingEps,epsForward,bookValue,priceToSalesTrailing12Months,beta,dividendYield,dividendRate,trailingAnnualDividendYield,exDividendDate,payoutRatio,earningsTimestamp,shortName,longName,financialCurrency,exchange,fullExchangeName,quoteType,sharesOutstanding,floatShares,shortRatio,enterpriseValue,enterpriseToRevenue,enterpriseToEbitda,52WeekChange,SandP52WeekChange', { headers: hdrs }).then(r=>r.json()).catch(()=>null)
    ]);

    const result = chartRes?.chart?.result?.[0];
    if (!result) return res.status(200).json(chartRes);

    // Merge v7 quote data into chart meta
    const q = quoteRes?.quoteResponse?.result?.[0] || {};

    result.meta = {
      ...result.meta,
      // Price data
      regularMarketChange:        q.regularMarketChange        ?? result.meta.regularMarketChange,
      regularMarketChangePercent: q.regularMarketChangePercent ?? result.meta.regularMarketChangePercent,
      regularMarketOpen:          q.regularMarketOpen          ?? result.meta.regularMarketOpen,
      regularMarketDayHigh:       q.regularMarketDayHigh       ?? result.meta.regularMarketDayHigh,
      regularMarketDayLow:        q.regularMarketDayLow        ?? result.meta.regularMarketDayLow,
      // Averages
      fiftyDayAverage:            q.fiftyDayAverage,
      twoHundredDayAverage:       q.twoHundredDayAverage,
      // Fundamentals
      marketCap:                  q.marketCap,
      trailingPE:                 q.trailingPE,
      forwardPE:                  q.forwardPE,
      priceToBook:                q.priceToBook,
      trailingEps:                q.epsTrailingTwelveMonths ?? q.trailingEps,
      forwardEps:                 q.epsForward,
      bookValue:                  q.bookValue,
      priceToSales:               q.priceToSalesTrailing12Months,
      beta:                       q.beta,
      enterpriseValue:            q.enterpriseValue,
      enterpriseToRevenue:        q.enterpriseToRevenue,
      enterpriseToEbitda:         q.enterpriseToEbitda,
      // Volume
      averageVolume:              q.averageDailyVolume3Month,
      averageVolume10Day:         q.averageDailyVolume10Day,
      sharesOutstanding:          q.sharesOutstanding,
      floatShares:                q.floatShares,
      shortRatio:                 q.shortRatio,
      // Dividend
      dividendYield:              q.dividendYield ?? q.trailingAnnualDividendYield,
      dividendRate:               q.dividendRate,
      exDividendDate:             q.exDividendDate,
      payoutRatio:                q.payoutRatio,
      // Names
      longName:                   q.longName     || result.meta.longName,
      shortName:                  q.shortName    || result.meta.shortName,
      fullExchangeName:           q.fullExchangeName || result.meta.fullExchangeName,
    };

    res.status(200).json(chartRes);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}