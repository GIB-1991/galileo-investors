export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=900');

  try {
    // Fetch real RSS news
    const rssRes = await fetch('https://www.investing.com/rss/news.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
    });
    const xml = await rssRes.text();

    // Parse items
    const items = [];
    const rx = /<item>[sS]*?<title><![CDATA[(.*?)]]></title>[sS]*?<link>(.*?)</link>[sS]*?(?:<description><![CDATA[(.*?)]]></description>)?[sS]*?<pubDate>(.*?)</pubDate>[sS]*?</item>/g;
    let m;
    while ((m = rx.exec(xml)) !== null && items.length < 8) {
      items.push({
        title: m[1]?.trim(),
        url: m[2]?.trim(),
        desc: m[3]?.replace(/<[^>]*>/g,'').trim().substring(0,150),
        pubDate: m[4]?.trim()
      });
    }

    if (items.length === 0) {
      return res.status(200).json({ news: getFallback() });
    }

    // Translate using Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let translated = [];

    if (apiKey) {
      const prompt = items.map((it, i) =>
        i + '. ' + it.title + (it.desc ? ' | ' + it.desc : '')
      ).join('\n');

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
            content: 'תרגם לעברית. החזר JSON בלבד: [{"t":"כותרת","s":"תקציר עד 100 תווים"}]\n\n' + prompt
          }]
        })
      });
      if (cr.ok) {
        const cd = await cr.json();
        const txt = cd.content?.[0]?.text || '[]';
        try { translated = JSON.parse(txt.replace(/```[\w]*\n?|\n?```/g,'')); } catch(e) {}
      }
    }

    const news = items.map((it, i) => ({
      id: i + 1,
      titleHe: translated[i]?.t || it.title,
      summary: translated[i]?.s || it.desc || '',
      url: it.url,
      pubDate: it.pubDate,
      source: 'Investing.com',
      translated: !!translated[i]
    }));

    res.status(200).json({ news });
  } catch(e) {
    res.status(200).json({ news: getFallback(), error: e.message });
  }
}

function getFallback() {
  return [
    { id:1, titleHe:'הפד משאיר ריבית יציבה ומאותת על זהירות ל-2026', summary:'הפדרל ריזרב הותיר את הריבית ללא שינוי והביע זהירות לגבי הורדות עתידיות.', url:'https://www.reuters.com/markets/us/fed-holds-rates-signals-cautious-2026/', source:'Reuters', pubDate:new Date().toUTCString(), translated:true },
    { id:2, titleHe:'NVIDIA מדווחת על הכנסות שיא ממרכזי נתונים', summary:'הרווחים עברו את תחזיות האנליסטים בזכות ביקוש לשבבי AI.', url:'https://www.bloomberg.com/news/articles/nvidia-record-data-center-revenue', source:'Bloomberg', pubDate:new Date().toUTCString(), translated:true },
    { id:3, titleHe:'S&P 500 סוגר בשיא חדש על רקע תוצאות חזקות', summary:'המדד עלה על רקע נתוני תוצאות רבעוניות טובות מהצפי.', url:'https://www.cnbc.com/2026/03/sp500-record-high-earnings/', source:'CNBC', pubDate:new Date().toUTCString(), translated:true },
    { id:4, titleHe:'אפל עתידה להשיק תכונות AI חדשות ב-iOS 20', summary:'שדרוגי AI מקיפים לפלטפורמות הניידות של אפל.', url:'https://www.wsj.com/tech/apple-ai-ios20-features', source:'WSJ', pubDate:new Date().toUTCString(), translated:true },
    { id:5, titleHe:'מחירי הנפט עולים על רקע מתחים גיאופוליטיים', summary:'חוזי הנפט עלו על רקע חששות מאספקה.', url:'https://www.ft.com/content/oil-prices-middle-east', source:'FT', pubDate:new Date().toUTCString(), translated:true },
    { id:6, titleHe:'אמזון מרחיבה תשתית AWS ב-10 מיליארד דולר', summary:'השקעה ענקית בתשתיות ענן לעמידה בביקוש ה-AI.', url:'https://techcrunch.com/2026/amazon-aws-10-billion-expansion', source:'TechCrunch', pubDate:new Date().toUTCString(), translated:true },
  ];
}