export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=900');

  try {
    const rssRes = await fetch('https://www.investing.com/rss/news.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    
    if (!rssRes.ok) {
      return res.status(200).json({ news: getFallback() });
    }
    
    const xml = await rssRes.text();
    const items = parseRSS(xml).slice(0, 8);
    
    if (items.length === 0) {
      return res.status(200).json({ news: getFallback() });
    }

    // Translate with Claude if API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let translated = [];

    if (apiKey) {
      const prompt = items.map((it, i) =>
        i + '. ' + it.title + (it.desc ? ' | ' + it.desc : '')
      ).join('\n');

      try {
        const cr = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1200,
            messages: [{
              role: 'user',
              content: 'תרגם לעברית. החזר JSON בלבד ללא שום טקסט נוסף: [{"t":"כותרת","s":"תקציר עד 90 תווים"}]\n\n' + prompt
            }]
          })
        });
        
        if (cr.ok) {
          const cd = await cr.json();
          const txt = (cd.content && cd.content[0] && cd.content[0].text) ? cd.content[0].text : '[]';
          const clean = txt.replace(/```[a-z]*\n?/g,'').replace(/\n?```/g,'').trim();
          try { translated = JSON.parse(clean); } catch(e) { translated = []; }
        }
      } catch(e) {}
    }

    const news = items.map((it, i) => ({
      id: i + 1,
      titleHe: (translated[i] && translated[i].t) ? translated[i].t : it.title,
      summary: (translated[i] && translated[i].s) ? translated[i].s : (it.desc || ''),
      url: it.url,
      pubDate: it.pubDate,
      source: 'Investing.com',
      translated: !!(translated[i] && translated[i].t)
    }));

    res.status(200).json({ news });
  } catch(e) {
    res.status(200).json({ news: getFallback(), error: e.message });
  }
}

function parseRSS(xml) {
  const items = [];
  const parts = xml.split('<item>');
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const title = extract(chunk, '<title>') || extract(chunk, '<title><![CDATA[', ']]>');
    const url = extractLink(chunk);
    const desc = (extract(chunk, '<description>') || extract(chunk, '<description><![CDATA[', ']]>') || '').replace(/<[^>]+>/g,'').substring(0,150);
    const pubDate = extract(chunk, '<pubDate>');
    if (title && url) {
      items.push({ title: title.trim(), url: url.trim(), desc: desc.trim(), pubDate: pubDate ? pubDate.trim() : new Date().toUTCString() });
    }
  }
  return items;
}

function extract(str, open, close) {
  const cl = close || open.replace('<','</');
  const start = str.indexOf(open);
  if (start === -1) return '';
  const end = str.indexOf(cl, start + open.length);
  if (end === -1) return '';
  return str.substring(start + open.length, end);
}

function extractLink(chunk) {
  // <link> in RSS is tricky - try multiple patterns
  const linkTag = extract(chunk, '<link>');
  if (linkTag && linkTag.startsWith('http')) return linkTag;
  // Try atom:link
  const m = chunk.match(/href="(https?:[^"]+)"/);
  if (m) return m[1];
  return '';
}

function getFallback() {
  return [
    { id:1, titleHe:'הפד משאיר ריבית יציבה ומאותת על זהירות ל-2026', summary:'הפדרל ריזרב הותיר את הריבית ללא שינוי.', url:'https://www.reuters.com/markets/', source:'Reuters', pubDate:new Date().toUTCString(), translated:true },
    { id:2, titleHe:'NVIDIA מדווחת על הכנסות שיא ממרכזי נתונים', summary:'הרווחים עברו את תחזיות האנליסטים בזכות ביקוש לשבבי AI.', url:'https://www.bloomberg.com/technology/', source:'Bloomberg', pubDate:new Date().toUTCString(), translated:true },
    { id:3, titleHe:'S&P 500 סוגר בשיא חדש על רקע תוצאות חזקות', summary:'המדד עלה על רקע תוצאות רבעוניות טובות מהצפי.', url:'https://www.cnbc.com/markets/', source:'CNBC', pubDate:new Date().toUTCString(), translated:true },
    { id:4, titleHe:'אפל עתידה להשיק תכונות AI חדשות ב-iOS 20', summary:'שדרוגי AI מקיפים לפלטפורמות הניידות של אפל.', url:'https://www.wsj.com/tech/', source:'WSJ', pubDate:new Date().toUTCString(), translated:true },
    { id:5, titleHe:'מחירי הנפט עולים על רקע מתחים גיאופוליטיים', summary:'חוזי הנפט עלו על רקע חששות מאספקה.', url:'https://www.ft.com/markets/', source:'FT', pubDate:new Date().toUTCString(), translated:true },
    { id:6, titleHe:'אמזון מרחיבה תשתית AWS ב-10 מיליארד דולר', summary:'השקעה ענקית בתשתיות ענן לעמידה בביקוש ה-AI.', url:'https://techcrunch.com/', source:'TechCrunch', pubDate:new Date().toUTCString(), translated:true },
  ];
}