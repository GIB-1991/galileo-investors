export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const AV  = 'T8VBPQ82S0O7VFSQ';
  const r   = range || '3mo';

  // Alpha Vantage time series mapping
  let avFunc, avInterval, avOutputSize;
  if (r === '1d') { avFunc='TIME_SERIES_INTRADAY'; avInterval='5min'; avOutputSize='compact'; }
  else if (r === '5d') { avFunc='TIME_SERIES_INTRADAY'; avInterval='60min'; avOutputSize='full'; }
  else if (r === '1mo') { avFunc='TIME_SERIES_DAILY'; avInterval=null; avOutputSize='compact'; }
  else if (r === '3mo') { avFunc='TIME_SERIES_DAILY'; avInterval=null; avOutputSize='full'; }
  else { avFunc='TIME_SERIES_WEEKLY'; avInterval=null; avOutputSize='full'; }

  const base = 'https://www.alphavantage.co/query?apikey='+AV;
  let tsUrl = base+'&function='+avFunc+'&symbol='+sym+'&outputsize='+avOutputSize;
  if (avInterval) tsUrl += '&interval='+avInterval;

  try {
    const [tsRes, ovRes, qRes] = await Promise.allSettled([
      fetch(tsUrl).then(r=>r.json()),
      fetch(base+'&function=OVERVIEW&symbol='+sym).then(r=>r.json()),
      fetch(base+'&function=GLOBAL_QUOTE&symbol='+sym).then(r=>r.json()),
    ]);

    const ts = tsRes.value || {};
    const ov = ovRes.value || {};
    const gqData = qRes.value || {};
    const gq = gqData['Global Quote'] || {};

    // Debug: log what we got
    const gqKeys = Object.keys(gq);
    
    // Parse time series
    const tsKey = Object.keys(ts).find(k => k.startsWith('Time Series'));
    const series = tsKey ? ts[tsKey] : {};
    const entries = Object.entries(series).sort((a,b)=>a[0]<b[0]?-1:1);

    // Filter by range
    const ms = {'1d':86400000,'5d':432000000,'1mo':2592000000,'3mo':7776000000,'1y':31536000000,'5y':157680000000};
    const cutoff = Date.now() - (ms[r] || 7776000000);
    const filtered = entries.filter(([d]) => new Date(d).getTime() >= cutoff);

    const timestamps = filtered.map(([d]) => Math.floor(new Date(d).getTime()/1000));
    const closes  = filtered.map(([,v]) => parseFloat(v['4. close']));
    const highs   = filtered.map(([,v]) => parseFloat(v['2. high']));
    const lows    = filtered.map(([,v]) => parseFloat(v['3. low']));
    const opens   = filtered.map(([,v]) => parseFloat(v['1. open']));
    const volumes = filtered.map(([,v]) => parseFloat(v['5. volume']||0));

    // Price from GLOBAL_QUOTE (real-time)
    const livePrice  = gq['05. price']            ? parseFloat(gq['05. price'])   : (closes[closes.length-1]||0);
    const liveChange = gq['09. change']            ? parseFloat(gq['09. change'])  : 0;
    const livePctRaw = gq['10. change percent']    ? gq['10. change percent'].replace('%','') : '0';
    const livePct    = parseFloat(livePctRaw) / 100;
    const prevClose  = gq['08. previous close']    ? parseFloat(gq['08. previous close']) : (closes[closes.length-2]||livePrice);
    const liveOpen   = gq['02. open']              ? parseFloat(gq['02. open'])    : opens[opens.length-1];
    const liveHigh   = gq['03. high']              ? parseFloat(gq['03. high'])    : highs[highs.length-1];
    const liveLow    = gq['04. low']               ? parseFloat(gq['04. low'])     : lows[lows.length-1];
    const liveVol    = gq['06. volume']            ? parseInt(gq['06. volume'])     : volumes[volumes.length-1];

    const p = n => n ? parseFloat(n) : undefined;
    const i = n => n ? parseInt(n)   : undefined;

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
      regularMarketOpen:          liveOpen,
      regularMarketDayHigh:       liveHigh,
      regularMarketDayLow:        liveLow,
      regularMarketVolume:        liveVol,
      chartPreviousClose:         prevClose,
      // 52W
      fiftyTwoWeekHigh:     p(ov['52WeekHigh']),
      fiftyTwoWeekLow:      p(ov['52WeekLow']),
      fiftyDayAverage:      p(ov['50DayMovingAverage']),
      twoHundredDayAverage: p(ov['200DayMovingAverage']),
      // Fundamentals
      marketCap:            p(ov.MarketCapitalization),
      trailingPE:           p(ov.TrailingPE),
      forwardPE:            p(ov.ForwardPE),
      trailingEps:          p(ov.EPS),
      beta:                 p(ov.Beta),
      priceToBook:          p(ov.PriceToBookRatio),
      priceToSales:         p(ov.PriceToSalesRatioTTM),
      sharesOutstanding:    p(ov.SharesOutstanding),
      sharesFloat:          p(ov.SharesFloat),
      revenue:              p(ov.RevenueTTM),
      grossProfit:          p(ov.GrossProfitTTM),
      ebitda:               p(ov.EBITDA),
      returnOnEquity:       p(ov.ReturnOnEquityTTM),
      returnOnAssets:       p(ov.ReturnOnAssetsTTM),
      revenueGrowth:        p(ov.QuarterlyRevenueGrowthYOY),
      profitMargin:         p(ov.ProfitMargin),
      operatingMargin:      p(ov.OperatingMarginTTM),
      dividendYield:        p(ov.DividendYield),
      dividendRate:         p(ov.DividendPerShare),
      exDividendDate:       ov.ExDividendDate,
      enterpriseValue:      p(ov.MarketCapitalization) ? p(ov.EVToEBITDA)*p(ov.EBITDA)||undefined : undefined,
      enterpriseToRevenue:  p(ov.EVToRevenue),
      enterpriseToEbitda:   p(ov.EVToEBITDA),
      targetMeanPrice:      p(ov.AnalystTargetPrice),
      recommendationKey:    ov.AnalystRatingStrongBuy||ov.AnalystRatingBuy ? 'buy' : ov.AnalystRatingStrongSell||ov.AnalystRatingSell ? 'sell' : 'hold',
      numberOfAnalystOpinions: ov.AnalystRatingStrongBuy ? (parseInt(ov.AnalystRatingStrongBuy||0)+parseInt(ov.AnalystRatingBuy||0)+parseInt(ov.AnalystRatingHold||0)) : undefined,
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