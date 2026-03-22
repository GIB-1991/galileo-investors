export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=900'); // 15 min cache
  
  try {
    // Fetch RSS from Investing.com markets news
    const rssUrl = 'https://www.investing.com/rss/news.rss';
    const rssRes = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const xml = await rssRes.text();
    
    // Parse RSS items
    const items = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const item of itemMatches.slice(0, 8)) {
      const title = (item.match(/<title>(?:<\!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim();
      const link = (item.match(/<link>(.*?)<\/link>/) || [])[1]?.trim();
      const desc = (item.match(/<description>(?:<\!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/) || [])[1]?.trim();
      const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1]?.trim();
      if (title && link) {
        items.push({ title, link, desc: desc?.replace(/<[^>]*>/g,'').substring(0,200), pubDate });
      }
    }
    
    if (items.length === 0) {
      return res.status(200).json({ news: getFallbackNews() });
    }
    
    // Translate with Claude API
    const prompt = items.map((item, i) => 
      i + '. Title: ' + item.title + (item.desc ? ' | Summary: ' + item.desc : '')
    ).join('\n');
    
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: 'תרגם את הכותרות והתקצירים הבאים לעברית. החזר JSON בדיוק בפורמט: [{"title":"כותרת בעברית","summary":"תקציר בעברית עד 120 תווים"}]. רק JSON, ללא טקסט נוסף.\n\n' + prompt
        }]
      })
    });
    
    let translated = [];
    if (claudeRes.ok) {
      const claudeData = await claudeRes.json();
      const text = claudeData.content?.[0]?.text || '[]';
      try {
        translated = JSON.parse(text.replace(/```json|\n```|```/g,'').trim());
      } catch(e) {}
    }
    
    const news = items.map((item, i) => ({
      id: i + 1,
      titleHe: translated[i]?.title || item.title,
      titleEn: item.title,
      summary: translated[i]?.summary || '',
      url: item.link,
      pubDate: item.pubDate,
      source: 'Investing.com'
    }));
    
    res.status(200).json({ news });
  } catch(e) {
    res.status(200).json({ news: getFallbackNews(), error: e.message });
  }
}

function getFallbackNews() {
  return [
    { id:1, titleHe:'הפד משאיר ריבית יציבה ומאותת על זהירות ל-2026', titleEn:'Fed Holds Rates Steady', summary:'הפדרל ריזרב הותיר את הריבית ללא שינוי והביע זהירות לגבי הורדות עתידיות.', url:'https://www.reuters.com/markets/', source:'Reuters', pubDate: new Date().toUTCString() },
    { id:2, titleHe:'NVIDIA מדווחת על הכנסות שיא ממרכזי נתונים', titleEn:'NVIDIA Reports Record Revenue', summary:'הרווחים של NVIDIA עברו את תחזיות האנליסטים בזכות ביקוש חזק לשבבי AI.', url:'https://www.bloomberg.com/technology/', source:'Bloomberg', pubDate: new Date().toUTCString() },
    { id:3, titleHe:'S&P 500 סוגר בשיא חדש על רקע תוצאות חזקות', titleEn:'S&P 500 Closes at New High', summary:'המדד עלה על רקע נתוני תוצאות רבעוניות טובות מהצפי.', url:'https://www.cnbc.com/markets/', source:'CNBC', pubDate: new Date().toUTCString() },
    { id:4, titleHe:'אפל עתידה להשיק תכונות AI חדשות ב-iOS 20', titleEn:'Apple to Launch AI Features in iOS 20', summary:'ענקית הטכנולוגיה מתכננת שדרוגי AI מקיפים לפלטפורמות הניידות שלה.', url:'https://www.wsj.com/tech/', source:'WSJ', pubDate: new Date().toUTCString() },
    { id:5, titleHe:'מחירי הנפט עולים על רקע מתחים גיאופוליטיים', titleEn:'Oil Prices Rise on Geopolitical Tensions', summary:'חוזי הנפט העלו על רקע חששות מאספקה ומתחים באזורים מייצרים.', url:'https://www.ft.com/markets/', source:'FT', pubDate: new Date().toUTCString() },
    { id:6, titleHe:'אמזון מרחיבה תשתית AWS ב-10 מיליארד דולר', titleEn:'Amazon Expands AWS Infrastructure', summary:'השקעה ענקית בתשתיות ענן כדי לעמוד בביקוש הגובר לשירותי AI.', url:'https://techcrunch.com/', source:'TechCrunch', pubDate: new Date().toUTCString() },
  ];
}