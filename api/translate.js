export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', engine: 'google-translate-free' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { items } = req.body || {};
  if (!items || !items.length) return res.status(400).json({ error: 'No items' });

  try {
    const translated = await Promise.all(
      items.map(async (title) => {
        try {
          const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=he&dt=t&q=' + encodeURIComponent(title);
          const r = await fetch(url);
          const data = await r.json();
          // Google returns [[["translated","original",...],...],...]
          const t = data[0]?.map(x => x[0]).join('') || title;
          return { t, s: '' };
        } catch(e) {
          return { t: title, s: '' };
        }
      })
    );
    res.status(200).json({ translated });
  } catch(e) {
    res.status(200).json({ translated: items.map(t => ({ t, s: '' })), error: e.message });
  }
}