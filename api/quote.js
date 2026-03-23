export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const AV  = 'T8VBPQ82S0O7VFSQ';

  // Map range to Alpha Vantage function
  const r = range || '3mo';
  let avFunc, avInterval, avOutputSize;
  if (r === '1d') {
    avFunc = 'TIME_SERIES_INTRADAY'; avInterval = '5min'; avOutputSize = 'compact';
  } else if (r === '5d') {
    avFunc = 'TIME_SERIES_INTRADAY'; avInterval = '60min'; avOutputSize = 'full';
  } else if (r === '1mo' || r === '3mo') {
    avFunc = 'TIME_SERIES_DAILY'; avInterval = null; avOutputSize = r==='1mo'?'compact':'full';
  } else {
    avFunc = 'TIME_SERIES_WEEKLY'; avInterval = null; avOutputSize = 'full';
  }

  const base = 'https://www.alphavantage.co/query?apikey='+AV;
  let tsUrl = base+'&function='+avFunc+'&symbol='+sym+'&outputsize='+avOutputSize;
  if (avInterval) tsUrl += '&interval='+avInterval;
  const overviewUrl = base+'&function=OVERVIEW&symbol='+sym;
  const quoteUrl    = base+'&function=GLOBAL_QUOTE&symbol='+sym;

  try {
    const [tsRes, ovRes, qRes] = await Promise.allSettled([
      fetch(tsUrl).then(r=>r.json()),
      fetch(overviewUrl).then(r=>r.json()),
      fetch(quoteUrl).then(r=>r.json()),
    ]);

    const ts  = tsRes.status==='fulfilled'  ? tsRes.value  : {};
    const ov  = ovRes.status==='fulfilled'  ? ovRes.value  : {};
    const gq  = qRes.status==='fulfilled'   ? qRes.value['Global Quote'] || {} : {};

    // Parse time series
    const tsKey = Object.keys(ts).find(k=>k.startsWith('Time Series'));
    const series = tsKey ? ts[tsKey] : {};
    const entries = Object.entries(series).sort((a,b)=>a[0]<b[0]?-1:1);

    // Filter by range
    const now  = Date.now();
    const ms   = { '1d':86400000,'5d':432000000,'1mo':2592000000,'3mo':7776000000,'1y':31536000000,'5y':157680000000 };
    const cutoff = now - (ms[r]||7776000000);
    const filtered = entries.filter(([d])=> new Date(d).getTime() >= cutoff);

    const timestamps = filtered.map(([d])=>Math.floor(new Date(d).getTime()/1000));
    const closes     = filtered.map(([,v])=>parseFloat(v['4. close']));
    const highs      = filtered.map(([,v])=>parseFloat(v['2. high']));
    const lows       = filtered.map(([,v])=>parseFloat(v['3. low']));
    const opens      = filtered.map(([,v])=>parseFloat(v['1. open']));
    const volumes    = filtered.map(([,v])=>parseFloat(v['5. volume']||0));

    const lastClose  = closes[closes.length-1] || 0;
    const prevClose  = closes[closes.length-2] || lastClose;
    const livePrice  = gq['05. price']   ? parseFloat(gq['05. price'])   : lastClose;
    const liveChange = gq['09. change']  ? parseFloat(gq['09. change'])  : livePrice-prevClose;
    const livePct    = gq['10. change percent'] ? parseFloat(gq['10. change percent'])/100 : (prevClose?liveChange/prevClose:0);
    const liveVol    = gq['06. volume']  ? parseInt(gq['06. volume'])     : volumes[volumes.length-1];

    const meta = {
      symbol:                     sym,
      currency:                   'USD',
      exchangeName:               ov.Exchange || '',
      fullExchangeName:           ov.Exchange || '',
      longName:                   ov.Name     || sym,
      shortName:                  ov.Name     || sym,
      sector:                     ov.Sector,
      industry:                   ov.Industry,
      country:                    ov.Country,
      website:                    ov.OfficialSite,
      description:                ov.Description,
      // Live price
      regularMarketPrice:         livePrice,
      regularMarketChange:        +liveChange.toFixed(4),
      regularMarketChangePercent: +livePct.toFixed(6),
      regularMarketOpen:          opens[opens.length-1],
      regularMarketDayHigh:       highs[highs.length-1],
      regularMarketDayLow:        lows[lows.length-1],
      regularMarketVolume:        liveVol,
      chartPreviousClose:         prevClose,
      // 52W
      fiftyTwoWeekHigh:           ov['52WeekHigh']  ? parseFloat(ov['52WeekHigh'])  : undefined,
      fiftyTwoWeekLow:            ov['52WeekLow']   ? parseFloat(ov['52WeekLow'])   : undefined,
      fiftyDayAverage:            ov['50DayMovingAverage']  ? parseFloat(ov['50DayMovingAverage'])  : undefined,
      twoHundredDayAverage:       ov['200DayMovingAverage'] ? parseFloat(ov['200DayMovingAverage']) : undefined,
      // Fundamentals
      marketCap:                  ov.MarketCapitalization   ? parseFloat(ov.MarketCapitalization)   : undefined,
      trailingPE:                 ov.TrailingPE             ? parseFloat(ov.TrailingPE)             : undefined,
      forwardPE:                  ov.ForwardPE              ? parseFloat(ov.ForwardPE)              : undefined,
      trailingEps:                ov.EPS                    ? parseFloat(ov.EPS)                    : undefined,
      beta:                       ov.Beta                   ? parseFloat(ov.Beta)                   : undefined,
      priceToBook:                ov.PriceToBookRatio       ? parseFloat(ov.PriceToBookRatio)       : undefined,
      priceToSales:               ov.PriceToSalesRatioTTM   ? parseFloat(ov.PriceToSalesRatioTTM)   : undefined,
      // Volume
      averageVolume:              parseInt(gq['06. volume']||0) || undefined,
      sharesOutstanding:          ov.SharesOutstanding      ? parseFloat(ov.SharesOutstanding)      : undefined,
      sharesFloat:                ov.SharesFloat            ? parseFloat(ov.SharesFloat)            : undefined,
      // Financials
      revenue:                    ov.RevenueTTM             ? parseFloat(ov.RevenueTTM)             : undefined,
      grossProfit:                ov.GrossProfitTTM         ? parseFloat(ov.GrossProfitTTM)         : undefined,
      ebitda:                     ov.EBITDA                 ? parseFloat(ov.EBITDA)                 : undefined,
      returnOnEquity:             ov.ReturnOnEquityTTM      ? parseFloat(ov.ReturnOnEquityTTM)      : undefined,
      returnOnAssets:             ov.ReturnOnAssetsTTM      ? parseFloat(ov.ReturnOnAssetsTTM)      : undefined,
      revenueGrowth:              ov.QuarterlyRevenueGrowthYOY ? parseFloat(ov.QuarterlyRevenueGrowthYOY) : undefined,
      profitMargin:               ov.ProfitMargin           ? parseFloat(ov.ProfitMargin)           : undefined,
      operatingMargin:            ov.OperatingMarginTTM     ? parseFloat(ov.OperatingMarginTTM)     : undefined,
      // Dividends
      dividendYield:              ov.DividendYield          ? parseFloat(ov.DividendYield)          : undefined,
      dividendRate:               ov.DividendPerShare       ? parseFloat(ov.DividendPerShare)       : undefined,
      exDividendDate:             ov.ExDividendDate,
      // EV
      enterpriseValue:            ov.EVToEBITDA && ov.EBITDA ? parseFloat(ov.EVToEBITDA)*parseFloat(ov.EBITDA) : undefined,
      enterpriseToRevenue:        ov.EVToRevenue            ? parseFloat(ov.EVToRevenue)            : undefined,
      enterpriseToEbitda:         ov.EVToEBITDA             ? parseFloat(ov.EVToEBITDA)             : undefined,
      // Analyst
      targetMeanPrice:            ov.AnalystTargetPrice     ? parseFloat(ov.AnalystTargetPrice)     : undefined,
      recommendationKey:          ov.AnalystRatingStrongBuy||ov.AnalystRatingBuy ? 'buy' : undefined,
      numberOfAnalystOpinions:    ov.AnalystRatingStrongBuy ? parseInt(ov.AnalystRatingStrongBuy) + parseInt(ov.AnalystRatingBuy||0) : undefined,
    };

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