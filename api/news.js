export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const rssRes = await fetch('https://www.investing.com/rss/news.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
      signal: AbortSignal.timeout(5000)
    });

    if (!rssRes.ok) return res.status(200).json({ news: getFallback() });

    const xml = await rssRes.text();
    const items = parseRSS(xml).slice(0, 8);
    if (!items.length) return res.status(200).json({ news: getFallback() });

    // ניסיון תרגום - ישמש אם יש קרדיט
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let translated = [];
    if (apiKey) {
      try {
        const prompt = items.map((it, i) => i + '. ' + it.title).join('\n');
        const cr = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 800,
            messages: [{ role: 'user', content: 'תרגם לעברית. JSON בלבד: [{"t":"כותרת"}]\n\n' + prompt }]
          }),
          signal: AbortSignal.timeout(8000)
        });
        if (cr.ok) {
          const cd = await cr.json();
          const txt = (cd.content && cd.content[0] && cd.content[0].text) || '[]';
          try { translated = JSON.parse(txt.replace(/```[a-z]*\n?/g,'').replace(/\n?```/g,'').trim()); } catch(e) {}
        }
      } catch(e) {}
    }

    const news = items.map((it, i) => ({
      id: i+1,
      titleHe: (translated[i] && translated[i].t) ? translated[i].t : it.title,
      summary: '',
      url: it.url,
      pubDate: it.pubDate,
      source: 'Investing.com',
      translated: !!(translated[i] && translated[i].t)
    }));

    res.status(200).json({ news });
  } catch(e) {
    res.status(200).json({ news: getFallback() });
  }
}

function parseRSS(xml) {
  const items = [];
  const parts = xml.split('<item>');
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const title = extractCDATA(chunk, 'title');
    const url = extractLink(chunk);
    const pubDate = extract(chunk, '<pubDate>', '</pubDate>');
    if (title && url) items.push({ title: title.trim(), url: url.trim(), pubDate: pubDate.trim() });
  }
  return items;
}

function extractCDATA(str, tag) {
  const r = extract(str, '<'+tag+'><![CDATA[', ']]></'+tag+'>');
  if (r) return r;
  return extract(str, '<'+tag+'>', '</'+tag+'>');
}

function extract(str, open, close) {
  const s = str.indexOf(open);
  if (s === -1) return '';
  const e = str.indexOf(close, s + open.length);
  return e === -1 ? '' : str.substring(s + open.length, e);
}

function extractLink(chunk) {
  const l = extract(chunk, '<link>', '</link>');
  if (l && l.startsWith('http')) return l;
  const m = chunk.match(/href="(https?:[^"]+)"/);
  return m ? m[1] : '';
}

function getFallback() {
  return [
    { id:1, titleHe:'הפד משאיר ריבית יציבה ומאותת על זהירות לשנת 2026', summary:'', url:'https://www.reuters.com/markets/', source:'Reuters', pubDate:new Date().toUTCString() },
    { id:2, titleHe:'NVIDIA מדווחת על הכנסות שיא ממרכזי נתוני AI', summary:'', url:'https://www.bloomberg.com/technology/', source:'Bloomberg', pubDate:new Date().toUTCString() },
    { id:3, titleHe:'מדד S&P 500 סוגר בשיא חדש על רקע תוצאות חזקות', summary:'', url:'https://www.cnbc.com/markets/', source:'CNBC', pubDate:new Date().toUTCString() },
    { id:4, titleHe:'טראמפ מאיים על איראן: מהלכים גיאופוליטיים חדשים', summary:'', url:'https://www.reuters.com/world/', source:'Reuters', pubDate:new Date().toUTCString() },
    { id:5, titleHe:'מחירי הנפט עולים על רקע מתחים במזרח התיכון', summary:'', url:'https://www.ft.com/markets/', source:'FT', pubDate:new Date().toUTCString() },
    { id:6, titleHe:'אמזון מרחיבה תשתית AWS ב-10 מיליארד דולר', summary:'', url:'https://techcrunch.com/', source:'TechCrunch', pubDate:new Date().toUTCString() },
  ];
}