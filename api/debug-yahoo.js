// api/debug-yahoo.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const sym = (req.query.ticker || 'AAPL').toUpperCase();
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
  const results = {};
  
  // Test v10
  const r10 = await fetch(
    'https://query1.finance.yahoo.com/v10/finance/quoteSummary/' + sym + '?modules=summaryDetail,defaultKeyStatistics,financialData,assetProfile',
    { headers: { 'User-Agent': UA, 'Accept': 'application/json' } }
  ).catch(e => ({ ok: false, status: 0 }));
  results.v10 = r10.status;
  if (r10.ok) {
    const d10 = await r10.json().catch(() => ({}));
    const qr = d10?.quoteSummary?.result?.[0] || {};
    results.v10_div = qr.summaryDetail?.dividendYield?.raw;
    results.v10_pe = qr.summaryDetail?.trailingPE?.raw;
    results.v10_sector = qr.assetProfile?.sector;
    results.v10_short = qr.defaultKeyStatistics?.shortPercentOfFloat?.raw;
  }
  
  // Test v8 with different params for fundamentals
  const r8q = await fetch(
    'https://query1.finance.yahoo.com/v8/finance/chart/' + sym + '?interval=1d&range=1d&includeTimestamps=true',
    { headers: { 'User-Agent': UA } }
  ).catch(() => ({ ok: false, status: 0 }));
  results.v8 = r8q.status;
  if (r8q.ok) {
    const d8 = await r8q.json().catch(() => ({}));
    const meta = d8?.chart?.result?.[0]?.meta || {};
    results.v8_div = meta.dividendYield;
    results.v8_pe = meta.trailingPE;
    results.v8_sector = meta.sector;
    results.v8_industry = meta.industry;
    results.v8_allkeys = Object.keys(meta).join(',');
  }
  
  return res.status(200).json(results);
}
