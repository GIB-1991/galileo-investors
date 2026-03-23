export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const sym = (req.query.ticker||'AAPL').toUpperCase();
  const hdrs = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122',
    'Accept': 'application/json',
    'Referer': 'https://finance.yahoo.com',
  };
  try {
    const r = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols='+sym+'&fields=marketCap,trailingPE,beta,regularMarketChange', { headers: hdrs });
    const status = r.status;
    const text = await r.text();
    res.status(200).json({ status, preview: text.substring(0,500) });
  } catch(e) {
    res.status(200).json({ error: e.message });
  }
}