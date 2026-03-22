export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { items } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // Debug info
  const debug = {
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0,20) : 'none',
    itemCount: items?.length || 0
  };

  if (!apiKey || !items?.length) {
    return res.status(200).json({ translated: [], debug });
  }

  const prompt = items.map((it, i) => i + '. ' + it).join('\n');

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
        messages: [{ role: 'user', content: 'תרגם לעברית. JSON בלבד: [{"t":"כותרת","s":"תקציר"}]\n\n' + prompt }]
      })
    });

    const crText = await cr.text();
    debug.anthropicStatus = cr.status;
    debug.anthropicResponse = crText.substring(0, 200);

    if (!cr.ok) {
      return res.status(200).json({ translated: [], debug });
    }

    let cd;
    try { cd = JSON.parse(crText); } catch(e) { return res.status(200).json({ translated: [], debug }); }
    
    const txt = (cd.content && cd.content[0] && cd.content[0].text) || '[]';
    const clean = txt.replace(/```[a-z]*\n?/g,'').replace(/\n?```/g,'').trim();
    let translated = [];
    try { translated = JSON.parse(clean); } catch(e) { debug.parseError = e.message; }
    
    res.status(200).json({ translated, debug });
  } catch(e) {
    res.status(200).json({ translated: [], debug, error: e.message });
  }
}