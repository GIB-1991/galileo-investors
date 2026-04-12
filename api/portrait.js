
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PORTRAITS = {
  druckenmiller: null,
  burry: null,
};

async function generatePortrait(name, description) {
  const resp = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create a professional SVG portrait of ${name}. ${description}
Output ONLY a valid SVG (viewBox="0 0 200 200") with:
- Realistic face with skin-colored face shape
- Eyes, eyebrows, nose, mouth
- Hair appropriate for the person
- Simple suit/collar
- Professional appearance
- No text
Return ONLY the SVG code starting with <svg`
    }]
  });
  return resp.content[0].text;
}

export default async function handler(req, res) {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name required' });

  const configs = {
    druckenmiller: {
      fullName: 'Stanley Druckenmiller',
      desc: 'White male, ~70 years old, short silver/white hair, blue eyes, distinguished appearance, slight smile'
    },
    burry: {
      fullName: 'Michael Burry',
      desc: 'White male, ~50 years old, short dark hair, wearing glasses (one eye is glass eye), serious expression'
    }
  };

  const cfg = configs[name.toLowerCase()];
  if (!cfg) return res.status(404).json({ error: 'unknown person' });

  // Cache in memory
  if (PORTRAITS[name.toLowerCase()]) {
    const svg = PORTRAITS[name.toLowerCase()];
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(svg);
  }

  try {
    const svg = await generatePortrait(cfg.fullName, cfg.desc);
    PORTRAITS[name.toLowerCase()] = svg;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}