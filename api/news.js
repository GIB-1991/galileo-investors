export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const FEEDS = [
    { url: 'https://finance.yahoo.com/news/rssindex', take: 3 },
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC,%5EDJI,%5EIXIC&region=US&lang=en-US', take: 2 },
    { url: 'https://news.google.com/rss/search?q=stock%20market%20when:1d&hl=en-US&gl=US&ceid=US:en', take: 3 },
    { url: 'https://news.google.com/rss/search?q=stocks%20earnings%20when:1d&hl=en-US&gl=US&ceid=US:en', take: 2 },
    { url: 'https://news.google.com/rss/search?q=wall%20street%20when:1d&hl=en-US&gl=US&ceid=US:en', take: 2 },
  ];

  function parseRSS(xml) {
    const items = [];
    const re = /<item\b[\s\S]*?<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const block = m[0];
      const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/);
      const pubMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/);
      let image = '';
      const mc = block.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      if (mc) image = mc[1];
      if (!image) { const mt = block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i); if (mt) image = mt[1]; }
      if (!image) { const en = block.match(/<enclosure[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i); if (en) image = en[1]; }
      if (!image) {
        const desc = block.match(/<description[^>]*>([\s\S]*?)<\/description>/);
        if (desc) { const im = desc[1].match(/<img[^>]+src=["']([^"']+)["']/i); if (im) image = im[1]; }
      }
      if (!image) {
        const cnt = block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/);
        if (cnt) { const im = cnt[1].match(/<img[^>]+src=["']([^"']+)["']/i); if (im) image = im[1]; }
      }
      if (image) image = image.replace(/&amp;/g,'&');
      const title = (titleMatch && titleMatch[1]) || '';
      const link = (linkMatch && linkMatch[1]) || '';
      const pub = (pubMatch && pubMatch[1]) || '';
      const clean = title.trim();
      if (clean) items.push({ title: clean, url: link.trim(), pubDate: pub.trim(), image });
    }
    return items;
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 1) return '\u05e2\u05db\u05e9\u05d9\u05d5';
    if (diff < 60) return diff + ' \u05d3\u05e7\u05d5\u05ea';
    if (diff < 1440) return Math.floor(diff/60) + ' \u05e9\u05e2\u05d5\u05ea';
    return Math.floor(diff/1440) + ' \u05d9\u05de\u05d9\u05dd';
  }

  function sourceLabel(feedUrl) {
    const h = new URL(feedUrl).hostname.replace('feeds.','').replace('www.','');
    if (h.includes('yahoo')) return 'Yahoo Finance';
    if (h.includes('google')) return 'Google News';
    return h;
  }

  function extractTickers(title) {
    const dollarTickers = [...title.matchAll(/\$([A-Z]{1,5})\b/g)].map(m => m[1]);
    const nameMap = {
      'Apple':'AAPL','Microsoft':'MSFT','Google':'GOOGL','Alphabet':'GOOGL',
      'Amazon':'AMZN','Meta':'META','Tesla':'TSLA','Nvidia':'NVDA','Netflix':'NFLX',
      'Berkshire':'BRK.B','Goldman':'GS','JPMorgan':'JPM','Bank of America':'BAC',
      'Intel':'INTC','AMD':'AMD','Salesforce':'CRM','Palantir':'PLTR',
      'Walmart':'WMT','Disney':'DIS','Uber':'UBER','Airbnb':'ABNB',
      'Micron':'MU','Broadcom':'AVGO','Qualcomm':'QCOM','Oracle':'ORCL',
      'Citigroup':'C','Citi':'C','Morgan Stanley':'MS','Wells Fargo':'WFC',
      'PayPal':'PYPL','Shopify':'SHOP','Snowflake':'SNOW','CrowdStrike':'CRWD',
      'Coinbase':'COIN','Block':'SQ','Spotify':'SPOT','Exxon':'XOM',
      'Chevron':'CVX','Boeing':'BA','Caterpillar':'CAT','Visa':'V',
      'Mastercard':'MA','American Express':'AXP','Adobe':'ADBE',
      'Palo Alto':'PANW','ServiceNow':'NOW','Datadog':'DDOG','Cloudflare':'NET',
    };
    const nameTickers = [];
    for (const [name, ticker] of Object.entries(nameMap)) {
      if (title.includes(name) && !dollarTickers.includes(ticker)) nameTickers.push(ticker);
    }
    return [...new Set([...dollarTickers, ...nameTickers])].slice(0, 5);
  }

  const allItems = [];
  for (const feed of FEEDS) {
    try {
      const r = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      });
      if (!r.ok) continue;
      const xml = await r.text();
      const items = parseRSS(xml).slice(0, feed.take);
      if (!items.length) continue;
      for (const it of items) allItems.push({ ...it, feedUrl: feed.url });
    } catch(e) { continue; }
  }

  if (!allItems.length) {
    return res.status(200).json({ news: [
      { id:1, title:'\u05e9\u05d5\u05e7 \u05d4\u05de\u05e0\u05d9\u05d5\u05ea \u05d4\u05d0\u05de\u05e8\u05d9\u05e7\u05d0\u05d9 \u05e2\u05d5\u05dc\u05d4', url:'https://finance.yahoo.com', time:'3 \u05e9\u05e2\u05d5\u05ea', tickers:[], source:'Yahoo Finance', image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
      { id:2, title:'\u05d4\u05e4\u05d3 \u05e9\u05d5\u05de\u05e8 \u05e2\u05dc \u05d4\u05e8\u05d9\u05d1\u05d9\u05ea', url:'https://finance.yahoo.com', time:'5 \u05e9\u05e2\u05d5\u05ea', tickers:[], source:'Yahoo Finance', image:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80' },
    ]});
  }

  const seen = new Set();
  const unique = allItems.filter(it => {
    const key = it.title.slice(0, 50).toLowerCase().replace(/\s+/g,'');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let translated = [];
  if (apiKey) {
    try {
      const prompt = unique.map((it, i) => i + '. ' + it.title).join('\n');
      const cr = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1200,
          messages: [{ role: 'user', content: '\u05ea\u05e8\u05d2\u05dd \u05db\u05dc \u05db\u05d5\u05ea\u05e8\u05ea \u05d7\u05d3\u05e9\u05d5\u05ea \u05e4\u05d9\u05e0\u05e0\u05e1\u05d9\u05ea \u05dc\u05e2\u05d1\u05e8\u05d9\u05ea \u05d8\u05d1\u05e2\u05d9\u05ea \u05d5\u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea. \u05e9\u05de\u05d5\u05e8 \u05e9\u05de\u05d5\u05ea \u05d7\u05d1\u05e8\u05d5\u05ea, \u05d8\u05d9\u05e7\u05e8\u05d9\u05dd \u05d5\u05de\u05d5\u05e0\u05d7\u05d9\u05dd \u05e4\u05d9\u05e0\u05e0\u05e1\u05d9\u05d9\u05dd \u05de\u05e7\u05d5\u05d1\u05dc\u05d9\u05dd. \u05d0\u05dc \u05ea\u05ea\u05e8\u05d2\u05dd \u05de\u05d9\u05dc\u05d5\u05dc\u05d9\u05ea \u2014 \u05e0\u05e1\u05d7 \u05db\u05e4\u05d9 \u05e9\u05e2\u05d9\u05ea\u05d5\u05e0\u05d0\u05d9 \u05db\u05dc\u05db\u05dc\u05d4 \u05d9\u05e9\u05e8\u05d0\u05dc\u05d9 \u05d4\u05d9\u05d4 \u05db\u05d5\u05ea\u05d1. \u05d4\u05d7\u05d6\u05e8 JSON \u05d1\u05dc\u05d1\u05d3, \u05dc\u05dc\u05d0 markdown, \u05dc\u05dc\u05d0 \u05d4\u05e1\u05d1\u05e8\u05d9\u05dd: [{"t":"\u05db\u05d5\u05ea\u05e8\u05ea \u05d1\u05e2\u05d1\u05e8\u05d9\u05ea"}]\n\n' + prompt }]
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (cr.ok) {
        const cd = await cr.json();
        const txt = (cd.content && cd.content[0] && cd.content[0].text) || '[]';
        try { translated = JSON.parse(txt.replace(/```[a-z]*\n?/g,'').replace(/\n?```/g,'').trim()); } catch(e) {}
      }
    } catch(e) {}
  }

  const news = unique.map((it, i) => ({
    id: i + 1,
    title: (translated[i] && translated[i].t) ? translated[i].t : it.title,
    titleEn: it.title,
    url: it.url,
    time: timeAgo(it.pubDate),
    tickers: extractTickers(it.title),
    source: sourceLabel(it.feedUrl),
    image: it.image || '',
  }));

  const needImage = news.slice(0, 5).map((n, idx) => ({ n, idx })).filter(x => !x.n.image);
  if (needImage.length > 0) {
    await Promise.all(needImage.map(async ({ n, idx }) => {
      try {
        const pr = await fetch(n.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(3500)
        });
        if (!pr.ok) return;
        const html = await pr.text();
        const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                 || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
                 || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
        if (og && og[1]) news[idx].image = og[1].replace(/&amp;/g, '&');
      } catch(e) {}
    }));
  }

  return res.status(200).json({ news });
}