export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=600');

  try {
    const rssRes = await fetch('https://www.investing.com/rss/news.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });

    if (!rssRes.ok) return res.status(200).json({ news: getFallback() });

    const xml = await rssRes.text();
    const items = parseRSS(xml).slice(0, 8);
    if (!items.length) return res.status(200).json({ news: getFallback() });

    // נסה לתרגם אם יש API key עם קרדיט
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let translated = [];
    if (apiKey) {
      try {
        const prompt = items.map((it, i) => i + '. ' + it.title + (it.desc ? ' | ' + it.desc : '')).join('\n');
        const cr = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 1200,
            messages: [{ role: 'user', content: 'תרגם לעברית. JSON בלבד ללא שום טקסט נוסף: [{"t":"כותרת","s":"תקציר קצר"}]\n\n' + prompt }]
          })
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
      titleHe: (translated[i] && translated[i].t) ? translated[i].t : it.title,
      summary: (translated[i] && translated[i].s) ? translated[i].s : '',
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
    const desc = extractCDATA(chunk, 'description').replace(/<[^>]+>/g,'').substring(0,150).trim();
    const pubDate = extract(chunk, '<pubDate>', '</pubDate>');
    if (title && url) items.push({ title: title.trim(), url: url.trim(), desc, pubDate: pubDate.trim() });
  }
  return items;
}

function extractCDATA(str, tag) {
  const r1 = extract(str, '<'+tag+'><![CDATA[', ']]></'+tag+'>');
  if (r1) return r1;
  return extract(str, '<'+tag+'>', '</'+tag+'>');
}

function extract(str, open, close) {
  const s = str.indexOf(open);
  if (s === -1) return '';
  const e = str.indexOf(close, s + open.length);
  if (e === -1) return '';
  return str.substring(s + open.length, e);
}

function extractLink(chunk) {
  const l = extract(chunk, '<link>', '</link>');
  if (l && l.startsWith('http')) return l;
  const m = chunk.match(/href="(https?:[^"]+)"/);
  return m ? m[1] : '';
}

function getFallback() {
  return [
    { id:1, titleHe:'הפד משאיר ריבית יציבה ומאותת על זהירות', summary:'הפדרל ריזרב הותיר את הריבית ללא שינוי.', url:'https://www.reuters.com/markets/', source:'Reuters', pubDate:new Date().toUTCString(), translated:true },
    { id:2, titleHe:'NVIDIA מדווחת על הכנסות שיא ממרכזי נתונים', summary:'הרווחים עברו את תחזיות האנליסטים.', url:'https://www.bloomberg.com/technology/', source:'Bloomberg', pubDate:new Date().toUTCString(), translated:true },
    { id:3, titleHe:'S&P 500 סוגר בשיא חדש על רקע תוצאות חזקות', summary:'המדד עלה על רקע נתוני רבעוניים טובים.', url:'https://www.cnbc.com/markets/', source:'CNBC', pubDate:new Date().toUTCString(), translated:true },
    { id:4, titleHe:'אפל עתידה להשיק תכונות AI חדשות ב-iOS', summary:'שדרוגי AI מקיפים לפלטפורמות הניידות.', url:'https://www.wsj.com/tech/', source:'WSJ', pubDate:new Date().toUTCString(), translated:true },
    { id:5, titleHe:'מחירי הנפט עולים על רקע מתחים גיאופוליטיים', summary:'חוזי הנפט עלו על רקע חששות מאספקה.', url:'https://www.ft.com/markets/', source:'FT', pubDate:new Date().toUTCString(), translated:true },
    { id:6, titleHe:'אמזון מרחיבה תשתית AWS בהשקעה ענקית', summary:'השקעה בתשתיות ענן לעמידה בביקוש AI.', url:'https://techcrunch.com/', source:'TechCrunch', pubDate:new Date().toUTCString(), translated:true },
  ];
}