export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'GET') {
    // Debug endpoint
    const apiKey = process.env.ANTHROPIC_API_KEY;
    return res.status(200).json({ 
      hasKey: !!apiKey, 
      keyStart: apiKey ? apiKey.substring(0,15) : 'none',
      version: 'v3-debug'
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { items } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !items?.length) return res.status(200).json({ translated: [], hasKey: !!apiKey });

  const prompt = items.map((it, i) => i + '. ' + it).join('\n');
  try {
    const cr = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: 'תרגם לעברית. JSON בלבד: [{"t":"כותרת","s":"תקציר"}]\n\n' + prompt }]
      })
    });
    const crText = await cr.text();
    if (!cr.ok) return res.status(200).json({ translated: [], status: cr.status, err: crText.substring(0,100) });
    const cd = JSON.parse(crText);
    const txt = (cd.content && cd.content[0] && cd.content[0].text) || '[]';
    const clean = txt.replace(/```[a-z]*\n?/g,'').replace(/\n?```/g,'').trim();
    let translated = [];
    try { translated = JSON.parse(clean); } catch(e) {}
    res.status(200).json({ translated });
  } catch(e) {
    res.status(200).json({ translated: [], error: e.message });
  }
}