export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { items } = req.body || {};
  if (!items || !items.length) return res.status(400).json({ error: 'No items' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(200).json({ translated: [] });

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
        messages: [{ role: 'user', content: 'תרגם לעברית. JSON בלבד: [{"t":"כותרת","s":"תקציר 80 תווים"}]\n\n' + prompt }]
      })
    });

    if (!cr.ok) return res.status(200).json({ translated: [] });
    const cd = await cr.json();
    const txt = (cd.content && cd.content[0] && cd.content[0].text) || '[]';
    const clean = txt.replace(/```[a-z]*\n?/g,'').replace(/\n?```/g,'').trim();
    let translated = [];
    try { translated = JSON.parse(clean); } catch(e) {}
    res.status(200).json({ translated });
  } catch(e) {
    res.status(200).json({ translated: [], error: e.message });
  }
}