// api/debug-yahoo.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const sym = (req.query.ticker || 'AAPL').toUpperCase();
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
  
  const url = 'https://query1.finance.yahoo.com/v11/finance/quoteSummary/' + sym +
    '?modules=summaryDetail,defaultKeyStatistics,financialData,assetProfile';
  
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' }
  }).catch(e => ({ ok: false, status: 0, error: e.message }));
  
  const status = resp.status;
  const body = resp.ok ? await resp.json().catch(e => ({ error: e.message })) : await resp.text().catch(() => 'no body');
  
  return res.status(200).json({ yahooStatus: status, body });
}
