
// In-memory cache — survives for the lifetime of the serverless function instance
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in ms

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  
  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';
  const cacheKey = sym + '_' + r;

  // Return cached data if fresh
  if (cache.has(cacheKey)) {
    const { data, ts } = cache.get(cacheKey);
    if (Date.now() - ts < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(data);
    }
  }

  const AV  = 'T8VBPQ82S0O7VFSQ';
  const UAs = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  ];
  const UA = UAs[Math.floor(Date.now()/60000) % UAs.length];

  let avFunc, avInterval, avOutputSize;
  if (r==='1d')      { avFunc='TIME_SERIES_INTRADAY'; avInterval='5min';  avOutputSize='compact'; }
  else if (r==='5d') { avFunc='TIME_SERIES_INTRADAY'; avInterval='60min'; avOutputSize='full'; }
  else if (r==='1mo'){ avFunc='TIME_SERIES_DAILY';    avInterval=null;    avOutputSize='compact'; }
  else if (r==='1y') { avFunc='TIME_SERIES_WEEKLY';   avInterval=null;    avOutputSize='full'; }
  else if (r==='5y') { avFunc='TIME_SERIES_MONTHLY';  avInterval=null;    avOutputSize='full'; }
  else               { avFunc='TIME_SERIES_DAILY';    avInterval=null;    avOutputSize='full'; }

  const yhInt = r==='1d'?'5m': r==='5d'?'1h': r==='1y'?'1wk': r==='5y'?'1mo': '1d';

  async function yahooChart() {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+yhInt+'&range='+r+'&includePrePost=false';
    const resp = await fetch(url, { headers:{'User-Agent':UA,'Accept':'*/*','Referer':'https://finance.yahoo.com'} });
    if (!resp.ok) throw new Error('Yahoo '+resp.status);
    const d = await resp.json();
    const result = d?.chart?.result?.[0];
    if (!result?.timestamp?.length) throw new Error('No data');
    return result;
  }

  async function avChart() {
    let url = 'https://www.alphavantage.co/query?apikey='+AV+'&function='+avFunc+'&symbol='+sym+'&outputsize='+avOutputSize+'&datatype=json';
    if (avInterval) url += '&interval='+avInterval;
    const d = await fetch(url).then(r=>r.json());
    if (d['Note']||d['Information']||d['Error Message']) throw new Error('AV limit/error');
    const tsKey = Object.keys(d).find(k=>k.startsWith('Time Series'));
    if (!tsKey) throw new Error('No AV series');
    const series = d[tsKey];
    const entries = Object.entries(series).sort((a,b)=>a[0]<b[0]?-1:1);
    const ms = {'1d':86400000,'5d':432000000,'1mo':2592000000,'3mo':7776000000,'1y':31536000000,'5y':157680000000};
    const cutoff = Date.now() - (ms[r]||7776000000);
    const filtered = entries.filter(([d])=>new Date(d).getTime()>=cutoff);
    return {
      timestamp: filtered.map(([d])=>Math.floor(new Date(d).getTime()/1000)),
      indicators: { quote: [{ 
        close:  filtered.map(([,v])=>parseFloat(v['4. close'])),
        high:   filtered.map(([,v])=>parseFloat(v['2. high'])),
        low:    filtered.map(([,v])=>parseFloat(v['3. low'])),
        open:   filtered.map(([,v])=>parseFloat(v['1. open'])),
        volume: filtered.map(([,v])=>parseFloat(v['5. volume']||0))
      }]}
    };
  }

  async function avOverview() {
    const [ovR, gqR] = await Promise.all([
      fetch('https://www.alphavantage.co/query?apikey='+AV+'&function=OVERVIEW&symbol='+sym).then(r=>r.json()),
      fetch('https://www.alphavantage.co/query?apikey='+AV+'&function=GLOBAL_QUOTE&symbol='+sym).then(r=>r.json()),
    ]);
    if (ovR['Note']||ovR['Information']) throw new Error('AV limit');
    return { ov: ovR, gq: gqR['Global Quote']||{} };
  }

  try {
    // Run chart + overview in parallel, trying Yahoo first for chart
    const [chartResult, overviewResult] = await Promise.allSettled([
      yahooChart().catch(()=>avChart()),
      avOverview(),
    ]);

    const chartData = chartResult.status==='fulfilled' ? chartResult.value : null;
    const { ov={}, gq={} } = overviewResult.status==='fulfilled' ? overviewResult.value : {};

    const yahooMeta = chartData?.meta || {};
    const q  = chartData?.indicators?.quote?.[0] || {};
    const ts = chartData?.timestamp || [];

    const p = n => { const v=parseFloat(n); return isNaN(v)||v===0?undefined:v; };

    const livePrice  = gq['05. price']          ? p(gq['05. price'])   : (q.close?.slice(-1)[0] || yahooMeta.regularMarketPrice || 0);
    const livePrev   = gq['08. previous close'] ? p(gq['08. previous close']) : (q.close?.slice(-2)[0] || livePrice);
    const liveChange = gq['09. change']         ? p(gq['09. change'])  : (livePrice && livePrev ? +(livePrice-livePrev).toFixed(4) : 0);
    const livePctRaw = gq['10. change percent'] ? gq['10. change percent'].replace('%','') : '0';
    const livePct    = parseFloat(livePctRaw)/100;

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
      regularMarketChange:        liveChange,
      regularMarketChangePercent: livePct,
      regularMarketOpen:          gq['02. open'] ? p(gq['02. open']) : q.open?.slice(-1)[0] || yahooMeta.regularMarketOpen,
      regularMarketDayHigh:       gq['03. high'] ? p(gq['03. high']) : q.high?.slice(-1)[0] || yahooMeta.regularMarketDayHigh,
      regularMarketDayLow:        gq['04. low']  ? p(gq['04. low'])  : q.low?.slice(-1)[0]  || yahooMeta.regularMarketDayLow,
      regularMarketVolume:        gq['06. volume'] ? parseInt(gq['06. volume']) : q.volume?.slice(-1)[0] || yahooMeta.regularMarketVolume,
      chartPreviousClose:         livePrev,
      fiftyTwoWeekHigh:           p(ov['52WeekHigh'])          || yahooMeta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:            p(ov['52WeekLow'])           || yahooMeta.fiftyTwoWeekLow,
      fiftyDayAverage:            p(ov['50DayMovingAverage'])  || yahooMeta.fiftyDayAverage,
      twoHundredDayAverage:       p(ov['200DayMovingAverage']) || yahooMeta.twoHundredDayAverage,
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
      exDividendDate:             ov.ExDividendDate !== 'None' ? ov.ExDividendDate : undefined,
      payoutRatio:                p(ov.PayoutRatio),
      enterpriseToRevenue:        p(ov.EVToRevenue),
      enterpriseToEbitda:         p(ov.EVToEBITDA),
      targetMeanPrice:            p(ov.AnalystTargetPrice),
      recommendationKey:          ov.AnalystRatingStrongBuy||ov.AnalystRatingBuy ? (
        (parseInt(ov.AnalystRatingStrongBuy||0)+parseInt(ov.AnalystRatingBuy||0)) >
        (parseInt(ov.AnalystRatingSell||0)+parseInt(ov.AnalystRatingStrongSell||0)) ? 'buy' : 'hold'
      ) : undefined,
      numberOfAnalystOpinions:    [ov.AnalystRatingStrongBuy,ov.AnalystRatingBuy,ov.AnalystRatingHold,ov.AnalystRatingSell,ov.AnalystRatingStrongSell]
                                  .reduce((s,v)=>s+parseInt(v||0),0) || undefined,
    };

    const response = {
      chart: { result: [{
        meta,
        timestamp: ts,
        indicators: {
          quote: [{ open: q.open||[], high: q.high||[], low: q.low||[], close: q.close||[], volume: q.volume||[] }],
          adjclose: [{ adjclose: q.close||[] }]
        }
      }]}
    };

    // Cache the result
    cache.set(cacheKey, { data: response, ts: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(response);
  } catch(e) {
    // If all fails, return cached stale data
    if (cache.has(cacheKey)) {
      res.setHeader('X-Cache', 'STALE');
      return res.status(200).json(cache.get(cacheKey).data);
    }
    res.status(500).json({ error: e.message });
  }
}