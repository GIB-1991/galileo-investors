export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const sym = (req.query.ticker||'AAPL').toUpperCase();
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  const hdrs = { 'User-Agent': UA, 'Accept': '*/*', 'Accept-Language': 'en-US,en;q=0.9' };
  
  const results = {};
  
  // Test 1: v8 chart with longer range
  try {
    const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+sym+'?interval=1d&range=1y&includePrePost=false', { headers: hdrs });
    const d = await r.json();
    const m = d.chart?.result?.[0]?.meta || {};
    results.v8_chart = { status: r.status, keys: Object.keys(m).join(','), marketCap: m.marketCap };
  } catch(e) { results.v8_chart = { error: e.message }; }
  
  // Test 2: v8 chart with modules param
  try {
    const r = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/'+sym+'?interval=1d&range=3mo&modules=price,financialData,defaultKeyStatistics', { headers: hdrs });
    const d = await r.json();
    const m = d.chart?.result?.[0]?.meta || {};
    results.v8_modules = { status: r.status, marketCap: m.marketCap, pe: m.trailingPE, extra_keys: Object.keys(m).filter(k=>!['currency','symbol','exchangeName','fullExchangeName','instrumentType','firstTradeDate','regularMarketTime','hasPrePostMarketData','gmtoffset','timezone','exchangeTimezoneName','regularMarketPrice','fiftyTwoWeekHigh','fiftyTwoWeekLow','regularMarketDayHigh','regularMarketDayLow','regularMarketVolume','longName','shortName','chartPreviousClose','priceHint','currentTradingPeriod','dataGranularity','range','validRanges','exchange'].includes(k)) };
  } catch(e) { results.v8_modules = { error: e.message }; }
  
  // Test 3: Yahoo Finance Fundamentals via different path
  try {
    const r = await fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+sym+'?formatted=false&lang=en-US&region=US&modules=financialData,defaultKeyStatistics,summaryDetail,price&corsDomain=finance.yahoo.com', { headers: { ...hdrs, 'Referer': 'https://finance.yahoo.com/quote/'+sym } });
    const text = await r.text();
    results.v10_with_cors = { status: r.status, preview: text.substring(0,200) };
  } catch(e) { results.v10_with_cors = { error: e.message }; }
  
  res.status(200).json(results);
}