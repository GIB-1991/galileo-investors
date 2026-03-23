export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';

  // Multiple Alpha Vantage keys - rotate to avoid rate limit
  const AV_KEYS = [
    'T8VBPQ82S0O7VFSQ',
    'demo',
  ];

  // Yahoo chart with multiple user agents to bypass rate limiting
  const UAs = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  ];
  const UA = UAs[Math.floor(Math.random() * UAs.length)];

  // AV time series params
  let avFunc, avInterval, avOutputSize;
  if (r==='1d')      { avFunc='TIME_SERIES_INTRADAY'; avInterval='5min';  avOutputSize='compact'; }
  else if (r==='5d') { avFunc='TIME_SERIES_INTRADAY'; avInterval='60min'; avOutputSize='full'; }
  else if (r==='1mo'){ avFunc='TIME_SERIES_DAILY';    avInterval=null;    avOutputSize='compact'; }
  else if (r==='1y') { avFunc='TIME_SERIES_WEEKLY';   avInterval=null;    avOutputSize='full'; }
  else if (r==='5y') { avFunc='TIME_SERIES_MONTHLY';  avInterval=null;    avOutputSize='full'; }
  else               { avFunc='TIME_SERIES_DAILY';    avInterval=null;    avOutputSize='full'; }

  // Yahoo chart intervals
  const yhInterval = r==='1d'?'5m': r==='5d'?'1h': r==='1y'?'1wk': r==='5y'?'1mo': '1d';

  async function tryYahooChart() {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+yhInterval+'&range='+r+'&includePrePost=false';
    const r2 = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': '*/*', 'Referer':'https://finance.yahoo.com' } });
    if (!r2.ok) throw new Error('Yahoo '+r2.status);
    const d = await r2.json();
    const result = d?.chart?.result?.[0];
    if (!result?.timestamp?.length) throw new Error('No chart data');
    return result;
  }

  async function tryAVChart(key) {
    let url = 'https://www.alphavantage.co/query?apikey='+key+'&function='+avFunc+'&symbol='+sym+'&outputsize='+avOutputSize+'&datatype=json';
    if (avInterval) url += '&interval='+avInterval;
    const r2 = await fetch(url);
    const d = await r2.json();
    if (d['Note'] || d['Information']) throw new Error('AV rate limit');
    const tsKey = Object.keys(d).find(k=>k.startsWith('Time Series'));
    if (!tsKey) throw new Error('No AV data');
    const series = d[tsKey];
    const entries = Object.entries(series).sort((a,b)=>a[0]<b[0]?-1:1);
    const ms = {'1d':86400000,'5d':432000000,'1mo':2592000000,'3mo':7776000000,'1y':31536000000,'5y':157680000000};
    const cutoff = Date.now() - (ms[r]||7776000000);
    const filtered = entries.filter(([d])=>new Date(d).getTime()>=cutoff);
    return {
      timestamp: filtered.map(([d])=>Math.floor(new Date(d).getTime()/1000)),
      closes:    filtered.map(([,v])=>parseFloat(v['4. close'])),
      highs:     filtered.map(([,v])=>parseFloat(v['2. high'])),
      lows:      filtered.map(([,v])=>parseFloat(v['3. low'])),
      opens:     filtered.map(([,v])=>parseFloat(v['1. open'])),
      volumes:   filtered.map(([,v])=>parseFloat(v['5. volume']||0)),
    };
  }

  async function tryAVOverview(key) {
    const [ovR, gqR] = await Promise.all([
      fetch('https://www.alphavantage.co/query?apikey='+key+'&function=OVERVIEW&symbol='+sym).then(r=>r.json()),
      fetch('https://www.alphavantage.co/query?apikey='+key+'&function=GLOBAL_QUOTE&symbol='+sym).then(r=>r.json()),
    ]);
    if (ovR['Note']||ovR['Information']) throw new Error('AV rate limit');
    return { ov: ovR, gq: gqR['Global Quote']||{} };
  }

  try {
    // Try chart: Yahoo first, then AV
    let chartData = null;
    let yahooMeta = {};

    try {
      const yResult = await tryYahooChart();
      yahooMeta = yResult.meta || {};
      const ts = yResult.timestamp || [];
      const q  = yResult.indicators?.quote?.[0] || {};
      chartData = {
        timestamp: ts,
        closes:    q.close || [],
        highs:     q.high  || [],
        lows:      q.low   || [],
        opens:     q.open  || [],
        volumes:   q.volume|| [],
      };
    } catch(e) {
      // Yahoo failed, try AV
      for (const key of AV_KEYS) {
        try { chartData = await tryAVChart(key); break; } catch {}
      }
    }

    // Try fundamentals: AV overview
    let ov = {}, gq = {};
    for (const key of AV_KEYS) {
      try {
        const res = await tryAVOverview(key);
        ov = res.ov; gq = res.gq;
        break;
      } catch {}
    }

    const p = n => { const v=parseFloat(n); return isNaN(v)?undefined:v; };

    const livePrice  = gq['05. price']         ? p(gq['05. price'])    : (chartData?.closes?.slice(-1)[0] || yahooMeta.regularMarketPrice || 0);
    const livePrev   = gq['08. previous close'] ? p(gq['08. previous close']) : (chartData?.closes?.slice(-2)[0] || livePrice);
    const liveChange = gq['09. change']         ? p(gq['09. change'])   : +(livePrice - livePrev).toFixed(4);
    const livePct    = gq['10. change percent'] ? p(gq['10. change percent'].replace('%',''))/100 : (livePrev ? (livePrice-livePrev)/livePrev : 0);

    const meta = {
      symbol:                     sym,
      currency:                   'USD',
      exchangeName:               ov.Exchange || yahooMeta.exchangeName || '',
      fullExchangeName:           ov.Exchange || yahooMeta.fullExchangeName || '',
      longName:                   ov.Name     || yahooMeta.longName || sym,
      shortName:                  ov.Name     || yahooMeta.shortName || sym,
      sector:                     ov.Sector,
      industry:                   ov.Industry,
      country:                    ov.Country,
      website:                    ov.OfficialSite,
      description:                ov.Description,
      regularMarketPrice:         livePrice,
      regularMarketChange:        +liveChange.toFixed(4),
      regularMarketChangePercent: +livePct.toFixed(6),
      regularMarketOpen:          gq['02. open'] ? p(gq['02. open']) : yahooMeta.regularMarketOpen,
      regularMarketDayHigh:       gq['03. high'] ? p(gq['03. high']) : yahooMeta.regularMarketDayHigh,
      regularMarketDayLow:        gq['04. low']  ? p(gq['04. low'])  : yahooMeta.regularMarketDayLow,
      regularMarketVolume:        gq['06. volume'] ? parseInt(gq['06. volume']) : yahooMeta.regularMarketVolume,
      chartPreviousClose:         livePrev,
      fiftyTwoWeekHigh:           p(ov['52WeekHigh'])           || yahooMeta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            p(ov['52WeekLow'])            || yahooMeta.fiftyTwoWeekLow,
      fiftyDayAverage:            p(ov['50DayMovingAverage'])   || yahooMeta.fiftyDayAverage,
      twoHundredDayAverage:       p(ov['200DayMovingAverage'])  || yahooMeta.twoHundredDayAverage,
      marketCap:                  p(ov.MarketCapitalization),
      trailingPE:                 p(ov.TrailingPE),
      forwardPE:                  p(ov.ForwardPE),
      trailingEps:                p(ov.EPS),
      beta:                       p(ov.Beta),
      priceToBook:                p(ov.PriceToBookRatio),
      priceToSales:               p(ov.PriceToSalesRatioTTM),
      sharesOutstanding:          p(ov.SharesOutstanding),
      revenue:                    p(ov.RevenueTTM),
      grossProfit:                p(ov.GrossProfitTTM),
      ebitda:                     p(ov.EBITDA),
      returnOnEquity:             p(ov.ReturnOnEquityTTM),
      returnOnAssets:             p(ov.ReturnOnAssetsTTM),
      revenueGrowth:              p(ov.QuarterlyRevenueGrowthYOY),
      profitMargin:               p(ov.ProfitMargin),
      operatingMargin:            p(ov.OperatingMarginTTM),
      dividendYield:              p(ov.DividendYield),
      dividendRate:               p(ov.DividendPerShare),
      exDividendDate:             ov.ExDividendDate,
      payoutRatio:                p(ov.PayoutRatio),
      enterpriseToRevenue:        p(ov.EVToRevenue),
      enterpriseToEbitda:         p(ov.EVToEBITDA),
      targetMeanPrice:            p(ov.AnalystTargetPrice),
      recommendationKey:          (parseInt(ov.AnalystRatingStrongBuy||0)+parseInt(ov.AnalystRatingBuy||0)) >
                                  (parseInt(ov.AnalystRatingSell||0)+parseInt(ov.AnalystRatingStrongSell||0))
                                  ? 'buy' : 'hold',
      numberOfAnalystOpinions:    [ov.AnalystRatingStrongBuy,ov.AnalystRatingBuy,ov.AnalystRatingHold,ov.AnalystRatingSell,ov.AnalystRatingStrongSell]
                                  .reduce((s,v)=>s+parseInt(v||0),0) || undefined,
    };

    const ts      = chartData?.timestamp || [];
    const closes  = chartData?.closes    || [];
    const highs   = chartData?.highs     || [];
    const lows    = chartData?.lows      || [];
    const opens   = chartData?.opens     || [];
    const volumes = chartData?.volumes   || [];

    res.status(200).json({
      chart: { result: [{
        meta,
        timestamp: ts,
        indicators: {
          quote: [{ open: opens, high: highs, low: lows, close: closes, volume: volumes }],
          adjclose: [{ adjclose: closes }]
        }
      }]}
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}