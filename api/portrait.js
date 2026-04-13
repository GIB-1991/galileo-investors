export default function handler(req, res) {
  const { name } = req.query;

  const portraits = {
    druckenmiller: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1a3a5c"/>
  <ellipse cx="100" cy="210" rx="70" ry="40" fill="#2d5a8e"/>
  <rect x="65" y="150" width="70" height="60" rx="5" fill="#1e3f6e"/>
  <rect x="72" y="148" width="56" height="20" rx="3" fill="#2a5280"/>
  <ellipse cx="100" cy="110" rx="45" ry="55" fill="#e8c9a0"/>
  <ellipse cx="100" cy="140" rx="42" ry="25" fill="#e8c9a0"/>
  <rect x="55" y="80" width="90" height="45" rx="45" fill="#d4b58a"/>
  <ellipse cx="100" cy="72" rx="42" ry="38" fill="#e8c9a0"/>
  <path d="M58 72 Q100 48 142 72 Q138 40 100 34 Q62 40 58 72z" fill="#c8c8c8"/>
  <path d="M58 72 Q56 65 60 58" stroke="#b0b0b0" stroke-width="3" fill="none"/>
  <path d="M142 72 Q144 65 140 58" stroke="#b0b0b0" stroke-width="3" fill="none"/>
  <ellipse cx="83" cy="78" rx="8" ry="5" fill="white"/>
  <ellipse cx="117" cy="78" rx="8" ry="5" fill="white"/>
  <ellipse cx="83" cy="78" rx="5" ry="4" fill="#4a6fa5"/>
  <ellipse cx="117" cy="78" rx="5" ry="4" fill="#4a6fa5"/>
  <ellipse cx="83" cy="78" rx="3" ry="3" fill="#1a1a2e"/>
  <ellipse cx="117" cy="78" rx="3" ry="3" fill="#1a1a2e"/>
  <ellipse cx="84" cy="77" rx="1" ry="1" fill="white"/>
  <ellipse cx="118" cy="77" rx="1" ry="1" fill="white"/>
  <path d="M78 73 Q83 71 88 73" stroke="#7a6a50" stroke-width="1.5" fill="none"/>
  <path d="M112 73 Q117 71 122 73" stroke="#7a6a50" stroke-width="1.5" fill="none"/>
  <ellipse cx="100" cy="92" rx="4" ry="5" fill="#d4a080"/>
  <path d="M93 103 Q100 108 107 103" stroke="#c08060" stroke-width="1.5" fill="none"/>
  <path d="M88 68 Q100 64 112 68" stroke="#e0e0e0" stroke-width="2" fill="none"/>
  <path d="M75 84 Q73 90 76 95" stroke="#d4a080" stroke-width="1" fill="none"/>
  <path d="M125 84 Q127 90 124 95" stroke="#d4a080" stroke-width="1" fill="none"/>
</svg>`,
    burry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1c3a2a"/>
  <ellipse cx="100" cy="210" rx="70" ry="40" fill="#2d6b45"/>
  <rect x="65" y="150" width="70" height="60" rx="5" fill="#1e4a30"/>
  <rect x="72" y="148" width="56" height="20" rx="3" fill="#2a5c3a"/>
  <ellipse cx="100" cy="110" rx="45" ry="55" fill="#e8c9a0"/>
  <ellipse cx="100" cy="140" rx="42" ry="25" fill="#e8c9a0"/>
  <rect x="55" y="80" width="90" height="45" rx="45" fill="#d4b58a"/>
  <ellipse cx="100" cy="72" rx="42" ry="38" fill="#e8c9a0"/>
  <path d="M58 72 Q100 50 142 72 Q138 42 100 36 Q62 42 58 72z" fill="#2a1a0a"/>
  <rect x="72" y="73" width="22" height="14" rx="6" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
  <rect x="106" y="73" width="22" height="14" rx="6" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
  <line x1="94" y1="80" x2="106" y2="80" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="72" y1="80" x2="66" y2="79" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="128" y1="80" x2="134" y2="79" stroke="#1a1a1a" stroke-width="2"/>
  <ellipse cx="83" cy="80" rx="7" ry="5" fill="white" opacity="0.9"/>
  <ellipse cx="117" cy="80" rx="7" ry="5" fill="white" opacity="0.9"/>
  <ellipse cx="85" cy="80" rx="4" ry="4" fill="#3a2a1a"/>
  <ellipse cx="117" cy="80" rx="4" ry="4" fill="#5a4a3a" opacity="0.6"/>
  <ellipse cx="83" cy="80" rx="3" ry="3" fill="#0a0a0a"/>
  <ellipse cx="117" cy="80" rx="2" ry="2" fill="#2a1a0a"/>
  <ellipse cx="84" cy="79" rx="1" ry="1" fill="white"/>
  <path d="M78 70 Q83 68 88 70" stroke="#3a2a10" stroke-width="2" fill="none"/>
  <path d="M112 70 Q117 68 122 70" stroke="#3a2a10" stroke-width="2" fill="none"/>
  <ellipse cx="100" cy="93" rx="4" ry="5" fill="#d4a080"/>
  <path d="M93 104 Q100 109 107 104" stroke="#c08060" stroke-width="1.5" fill="none"/>
  <path d="M75 85 Q73 91 76 96" stroke="#d4a080" stroke-width="1" fill="none"/>
  <path d="M125 85 Q127 91 124 96" stroke="#d4a080" stroke-width="1" fill="none"/>
</svg>`
  };

  const svg = portraits[name?.toLowerCase()];
  if (!svg) return res.status(404).json({ error: 'unknown' });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
}