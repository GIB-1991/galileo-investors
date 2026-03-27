export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  const { ticker, range } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const sym = ticker.toUpperCase();
  const r   = range || '3mo';

  // 3 AV keys - rotate automatically
  const AV_KEYS = [
    'T8VBPQ82S0O7VFSQ',
    'RIBVCZG0TI9S4YM1',
    'demo',
  ];

  const yhInterval = r==='1d'?'5m': r==='5d'?'1h': r==='1y'?'1wk': r==='5y'?'1mo': '1d';
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';

  async function getYahooChart() {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval='+yhInterval+'&range='+r;
    const resp = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': '*/*' } });
    if (!resp.ok) return null;
    const d = await resp.json();
    const result = d?.chart?.result?.[0];
    if (!result?.timestamp?.length) return null;
    return result;
  }

  async function getAVFundamentals() {
    let avFunc = 'TIME_SERIES_DAILY', avOutputSize = 'full';
    if (r==='1d')      { avFunc='TIME_SERIES_INTRADAY'; avOutputSize='compact'; }
    else if (r==='5d') { avFunc='TIME_SERIES_INTRADAY'; avOutputSize='full'; }
    else if (r==='1mo'){ avOutputSize='compact'; }
    else if (r==='1y') { avFunc='TIME_SERIES_WEEKLY'; }
    else if (r==='5y') { avFunc='TIME_SERIES_MONTHLY'; }

    for (const key of AV_KEYS) {
      try {
        const [ovResp, gqResp] = await Promise.all([
          fetch('https://www.alphavantage.co/query?apikey='+key+'&function=OVERVIEW&symbol='+sym),
          fetch('https://www.alphavantage.co/query?apikey='+key+'&function=GLOBAL_QUOTE&symbol='+sym),
        ]);
        const ov = await ovResp.json();
        const gqData = await gqResp.json();
        if (ov['Note'] || ov['Information'] || !ov.Symbol) continue;
        return { ov, gq: gqData['Global Quote'] || {} };
      } catch { continue; }
    }
    return { ov: {}, gq: {} };
  }

  async function getAVChart() {
    let avFunc = 'TIME_SERIES_DAILY', avOutputSize = 'full', avInterval = null;
    if (r==='1d')      { avFunc='TIME_SERIES_INTRADAY'; avInterval='5min';  avOutputSize='compact'; }
    else if (r==='5d') { avFunc='TIME_SERIES_INTRADAY'; avInterval='60min'; avOutputSize='full'; }
    else if (r==='1mo'){ avOutputSize='compact'; }
    else if (r==='1y') { avFunc='TIME_SERIES_WEEKLY'; }
    else if (r==='5y') { avFunc='TIME_SERIES_MONTHLY'; }

    for (const key of AV_KEYS) {
      try {
        let url = 'https://www.alphavantage.co/query?apikey='+key+'&function='+avFunc+'&symbol='+sym+'&outputsize='+avOutputSize;
        if (avInterval) url += '&interval='+avInterval;
        const resp = await fetch(url);
        const d = await resp.json();
        if (d['Note'] || d['Information']) continue;
        const tsKey = Object.keys(d).find(k=>k.startsWith('Time Series'));
        if (!tsKey) continue;
        const entries = Object.entries(d[tsKey]).sort((a,b)=>a[0]<b[0]?-1:1);
        const ms = {'1d':86400000,'5d':432000000,'1mo':2592000000,'3mo':7776000000,'1y':31536000000,'5y':157680000000};
        const cutoff = Date.now() - (ms[r]||7776000000);
        const filtered = entries.filter(([d])=>new Date(d).getTime()>=cutoff);
        if (!filtered.length) continue;
        return {
          timestamp: filtered.map(([d])=>Math.floor(new Date(d).getTime()/1000)),
          closes:  filtered.map(([,v])=>parseFloat(v['4. close'])),
          highs:   filtered.map(([,v])=>parseFloat(v['2. high'])),
          lows:    filtered.map(([,v])=>parseFloat(v['3. low'])),
          opens:   filtered.map(([,v])=>parseFloat(v['1. open'])),
          volumes: filtered.map(([,v])=>parseFloat(v['5. volume']||0)),
        };
      } catch { continue; }
    }
    return null;
  }

  try {
    // Run chart + fundamentals in parallel
    const [yahooResult, { ov, gq }, avChart] = await Promise.all([
      getYahooChart(),
      getAVFundamentals(),
      getAVChart(),
    ]);

    const yahooMeta = yahooResult?.meta || {};
    const avData    = avChart || (yahooResult ? {
      timestamp: yahooResult.timestamp,
      closes:  yahooResult.indicators?.quote?.[0]?.close  || [],
      highs:   yahooResult.indicators?.quote?.[0]?.high   || [],
      lows:    yahooResult.indicators?.quote?.[0]?.low    || [],
      opens:   yahooResult.indicators?.quote?.[0]?.open   || [],
      volumes: yahooResult.indicators?.quote?.[0]?.volume || [],
    } : null) || { timestamp:[], closes:[], highs:[], lows:[], opens:[], volumes:[] };

    const p   = n => { const v=parseFloat(n); return isNaN(v)?undefined:v; };
    const lp  = gq['05. price'] ? p(gq['05. price']) : (avData.closes.slice(-1)[0] || yahooMeta.regularMarketPrice || 0);
    const lpc = gq['08. previous close'] ? p(gq['08. previous close']) : (avData.closes.slice(-2)[0] || lp);
    const lch = gq['09. change'] ? p(gq['09. change']) : +(lp-lpc).toFixed(4);
    const lpt = gq['10. change percent'] ? p(gq['10. change percent'].replace('%',''))/100 : (lpc?(lp-lpc)/lpc:0);

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
      regularMarketPrice:         lp,
      regularMarketChange:        +lch.toFixed(4),
      regularMarketChangePercent: +lpt.toFixed(6),
      regularMarketOpen:          gq['02. open'] ? p(gq['02. open']) : (avData.opens.slice(-1)[0] || yahooMeta.regularMarketOpen),
      regularMarketDayHigh:       gq['03. high'] ? p(gq['03. high']) : (avData.highs.slice(-1)[0] || yahooMeta.regularMarketDayHigh),
      regularMarketDayLow:        gq['04. low']  ? p(gq['04. low'])  : (avData.lows.slice(-1)[0]  || yahooMeta.regularMarketDayLow),
      regularMarketVolume:        gq['06. volume'] ? parseInt(gq['06. volume']) : (avData.volumes.slice(-1)[0] || yahooMeta.regularMarketVolume),
      chartPreviousClose:         lpc,
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
      shortPercentFloat:      null, // not in AV free tier
      shortRatio:             null, // not in AV free tier  
      avgVolume30d:           null, // computed post-fetch from chart volumes
      quoteType:                  ov.AssetType==='ETF'?'ETF':ov.AssetType==='MUTUAL FUND'?'MUTUALFUND':'EQUITY',
      revenue:                    p(ov.RevenueTTM),
      grossProfit:                p(ov.GrossProfitTTM),
      ebitda:                     p(ov.EBITDA),
      returnOnEquity:             p(ov.ReturnOnEquityTTM),
      returnOnAssets:             p(ov.ReturnOnAssetsTTM),
      revenueGrowth:              p(ov.QuarterlyRevenueGrowthYOY),
      profitMargin:               p(ov.ProfitMargin),
      operatingMargin:            p(ov.OperatingMarginTTM),
      dividendYield:              p(ov.DividendYield) ?? meta.dividendYield ?? null,
      dividendRate:               p(ov.DividendPerShare) ?? meta.dividendRate ?? null,
      exDividendDate:             ov.ExDividendDate,
      payoutRatio:                p(ov.PayoutRatio),
      enterpriseToRevenue:        p(ov.EVToRevenue),
      enterpriseToEbitda:         p(ov.EVToEBITDA),
      targetMeanPrice:            p(ov.AnalystTargetPrice),
      recommendationKey:          (parseInt(ov.AnalystRatingStrongBuy||0)+parseInt(ov.AnalystRatingBuy||0)) >
                                  (parseInt(ov.AnalystRatingSell||0)+parseInt(ov.AnalystRatingStrongSell||0))
                                  ? 'buy' : parseInt(ov.AnalystRatingStrongSell||0)+parseInt(ov.AnalystRatingSell||0) > 2 ? 'sell' : 'hold',
      numberOfAnalystOpinions:    [ov.AnalystRatingStrongBuy,ov.AnalystRatingBuy,ov.AnalystRatingHold,
                                   ov.AnalystRatingSell,ov.AnalystRatingStrongSell].reduce((s,v)=>s+parseInt(v||0),0)||undefined,
    };

    // Use Yahoo data as primary (always available), with AV meta enrichment
    const yahooResult = yahooData?.chart?.result?.[0];
    if (!yahooResult) { res.status(500).json({ error: 'No chart data' }); return; }
    // Compute avgVolume30d from Yahoo volumes
    const yVols = yahooResult.indicators?.quote?.[0]?.volume || [];
    const last30vols = yVols.filter(v=>v!=null&&v>0).slice(-30);
    if(last30vols.length>0) meta.avgVolume30d = Math.round(last30vols.reduce((a,b)=>a+b,0)/last30vols.length);
    // Merge yahoo result with enriched meta
    res.status(200).json({
      chart: { result: [{ ...yahooResult, meta }] }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}