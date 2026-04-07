export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  const { titles } = req.body;
  if (!titles || !titles.length) return res.status(400).json({ error: 'no titles' });

  try {
    // Translate each title using Google Translate unofficial API
    const translated = await Promise.all(titles.map(async (title) => {
      try {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=he&dt=t&q=' + encodeURIComponent(title);
        const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!r.ok) return { t: title };
        const data = await r.json();
        // Google returns nested array: [[["translated","original",...],...],...]
        const text = data[0]?.map(s => s[0]).join('') || title;
        return { t: text };
      } catch(e) {
        return { t: title };
      }
    }));
    return res.status(200).json({ translated });
  } catch(e) {
    return res.status(200).json({ translated: [], error: e.message });
  }
}