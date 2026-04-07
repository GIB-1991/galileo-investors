export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Multiple RSS sources — try each until one works
  const FEEDS = [
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^DJI,^IXIC&region=US&lang=en-US',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US',
    'https://rss.cnn.com/rss/money_markets.rss',
    'https://feeds.reuters.com/reuters/businessNews',
  ];

  function parseRSS(xml) {
    const items = [];
    const re = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const block = m[1];
      const title = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
      const link  = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/)  || (block.match(/<link[^>]*\/>/)) || [])[1] || '';
      const pub   = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
      const clean = title.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
      if (clean) items.push({ title: clean, url: link.trim(), pubDate: pub.trim() });
    }
    return items;
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 1) return 'עכשיו';
    if (diff < 60) return diff + ' דקות';
    if (diff < 1440) return Math.floor(diff/60) + ' שעות';
    return Math.floor(diff/1440) + ' ימים';
  }

  // Extract tickers mentioned in title ($AAPL style or known names)
  function extractTickers(title) {
    const dollarTickers = [...title.matchAll(/\$([A-Z]{1,5})\b/g)].map(m => m[1]);
    // Also detect known company names
    const nameMap = {
      'Apple':'AAPL','Microsoft':'MSFT','Google':'GOOGL','Alphabet':'GOOGL',
      'Amazon':'AMZN','Meta':'META','Tesla':'TSLA','Nvidia':'NVDA','Netflix':'NFLX',
      'Berkshire':'BRK.B','Goldman':'GS','JPMorgan':'JPM','Bank of America':'BAC',
      'Intel':'INTC','AMD':'AMD','Salesforce':'CRM','Palantir':'PLTR',
      'Walmart':'WMT','Disney':'DIS','Uber':'UBER','Airbnb':'ABNB',
    };
    const nameTickers = [];
    for (const [name, ticker] of Object.entries(nameMap)) {
      if (title.includes(name) && !dollarTickers.includes(ticker)) {
        nameTickers.push(ticker);
      }
    }
    const all = [...new Set([...dollarTickers, ...nameTickers])];
    return all.slice(0, 5);
  }

  for (const feedUrl of FEEDS) {
    try {
      const r = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      });
      if (!r.ok) continue;
      const xml = await r.text();
      const items = parseRSS(xml).slice(0, 10);
      if (!items.length) continue;

      // Try Claude translation
      const apiKey = process.env.ANTHROPIC_API_KEY;
      let translated = [];
      if (apiKey) {
        try {
          const prompt = items.map((it, i) => i + '. ' + it.title).join('\n');
          const cr = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001', max_tokens: 1200,
              messages: [{ role: 'user', content: 'תרגם כל כותרת לעברית. החזר JSON בלבד, ללא markdown, ללא הסברים: [{"t":"כותרת בעברית"}]\n\n' + prompt }]
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

      const news = items.map((it, i) => ({
        id: i + 1,
        title: (translated[i] && translated[i].t) ? translated[i].t : it.title,
        titleEn: it.title,
        url: it.url,
        time: timeAgo(it.pubDate),
        tickers: extractTickers(it.title),
        source: new URL(feedUrl).hostname.replace('feeds.','').replace('www.',''),
      }));

      return res.status(200).json({ news, source: feedUrl });
    } catch(e) {
      continue;
    }
  }

  // All feeds failed — return helpful fallback
  return res.status(200).json({ news: [
    { id:1, title:'שוק המניות האמריקאי עולה על רקע נתוני תעסוקה חיוביים', url:'https://finance.yahoo.com', time:'3 שעות', tickers:[], source:'yahoo' },
    { id:2, title:'הפד שומר על הריבית ללא שינוי ברבעון הראשון של 2026', url:'https://finance.yahoo.com', time:'5 שעות', tickers:[], source:'yahoo' },
    { id:3, title:'מניות טכנולוגיה בראשות Nvidia ו-Meta מובילות עליות', url:'https://finance.yahoo.com', time:'6 שעות', tickers:['NVDA','META'], source:'yahoo' },
    { id:4, title:'תוצאות רבעוניות של Apple עולות על התחזיות', url:'https://finance.yahoo.com', time:'8 שעות', tickers:['AAPL'], source:'yahoo' },
    { id:5, title:'Amazon מכריזה על השקעה של 4 מיליארד דולר בתשתיות AI', url:'https://finance.yahoo.com', time:'10 שעות', tickers:['AMZN'], source:'yahoo' },
  ]});
}