// api/debug-yahoo.js - test v8 with 3mo range
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const sym = (req.query.ticker || 'AAPL').toUpperCase();
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';

  const r = await fetch(
    'https://query1.finance.yahoo.com/v8/finance/chart/' + sym + '?interval=1d&range=3mo',
    { headers: { 'User-Agent': UA } }
  ).catch(e => ({ ok: false, status: 0, statusText: e.message }));

  if (!r.ok) return res.status(200).json({ status: r.status, error: r.statusText });

  const data = await r.json().catch(() => ({}));
  const meta = data?.chart?.result?.[0]?.meta || {};
  const keys = Object.keys(meta);

  return res.status(200).json({
    status: r.status,
    keyCount: keys.length,
    allKeys: keys.join(','),
    dividendYield: meta.dividendYield,
    trailingPE: meta.trailingPE,
    sector: meta.sector,
    industry: meta.industry,
    marketCap: meta.marketCap,
    shortPercentOfFloat: meta.shortPercentOfFloat,
    recommendationKey: meta.recommendationKey,
    description: meta.description ? meta.description.substring(0,100) : null,
  });
}
