export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();

  const { titles } = req.body;
  if (!titles || !titles.length) return res.status(400).json({ error: 'no titles' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'no key' });

  try {
    const prompt = titles.map((t, i) => i + '. ' + t).join('\n');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: 'תרגם כל שורה לעברית תקינה. JSON בלבד ללא markdown: [{"t":"..."}]\n\n' + prompt }]
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(200).json({ translated: [], error: err.substring(0, 100) });
    }

    const d = await r.json();
    const txt = (d.content && d.content[0] && d.content[0].text) || '[]';
    let translated = [];
    try {
      translated = JSON.parse(txt.replace(/```[a-z]*\n?/g, '').replace(/\n?```/g, '').trim());
    } catch(e) {
      return res.status(200).json({ translated: [], raw: txt.substring(0, 100) });
    }
    return res.status(200).json({ translated });
  } catch(e) {
    return res.status(200).json({ translated: [], error: e.message });
  }
}