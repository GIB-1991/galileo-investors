export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).end();
  const decoded = decodeURIComponent(url);
  
  // Pick headers based on domain
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  if (decoded.includes('wikimedia.org') || decoded.includes('wikipedia.org')) {
    headers['Referer'] = 'https://en.wikipedia.org/';
  } else if (decoded.includes('wsj.net') || decoded.includes('wsj.com')) {
    headers['Referer'] = 'https://www.wsj.com/';
    headers['Origin'] = 'https://www.wsj.com';
    headers['sec-fetch-site'] = 'same-site';
    headers['sec-fetch-dest'] = 'image';
    headers['sec-fetch-mode'] = 'no-cors';
  } else if (decoded.includes('cnbc.com')) {
    headers['Referer'] = 'https://www.cnbc.com/';
    headers['Origin'] = 'https://www.cnbc.com';
  }

  try {
    const r = await fetch(decoded, { headers, redirect: 'follow' });
    if (!r.ok) return res.status(r.status).end();
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buf));
  } catch(e) { res.status(500).json({ error: e.message }); }
}