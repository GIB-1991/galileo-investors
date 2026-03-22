export default function GalileoLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gl_tube" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8a030"/>
          <stop offset="20%" stopColor="#f5bc55"/>
          <stop offset="55%" stopColor="#c47010"/>
          <stop offset="100%" stopColor="#7a3e06"/>
        </linearGradient>
        <linearGradient id="gl_lens" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#90c0f0"/>
          <stop offset="40%" stopColor="#3a70c0"/>
          <stop offset="100%" stopColor="#0a1a40"/>
        </linearGradient>
        <linearGradient id="gl_metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#aaa"/>
          <stop offset="35%" stopColor="#ddd"/>
          <stop offset="100%" stopColor="#555"/>
        </linearGradient>
        <linearGradient id="gl_wood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a2a08"/>
          <stop offset="45%" stopColor="#7a4a18"/>
          <stop offset="100%" stopColor="#3a2005"/>
        </linearGradient>
      </defs>
      <g transform="translate(10,95)">
        <line x1="38" y1="-4" x2="10" y2="24" stroke="url(#gl_wood)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="-4" x2="40" y2="26" stroke="url(#gl_wood)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="42" y1="-4" x2="70" y2="24" stroke="url(#gl_wood)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 16 Q40 22 62 16" stroke="#5a3010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="40" cy="-4" rx="8" ry="4" fill="url(#gl_metal)"/>
        <rect x="32" y="-9" width="16" height="7" rx="2" fill="#999"/>
        <circle cx="30" cy="-6" r="2.5" fill="url(#gl_metal)"/>
        <circle cx="50" cy="-6" r="2.5" fill="url(#gl_metal)"/>
        <g transform="translate(40,-10) rotate(-22)">
          <rect x="57" y="-8" width="16" height="16" rx="2" fill="#1c1c1c"/>
          <rect x="10" y="-7" width="50" height="14" rx="4" fill="url(#gl_tube)"/>
          <rect x="12" y="-5" width="46" height="5" rx="2" fill="#f8cc70" opacity="0.28"/>
          <rect x="23" y="-8" width="10" height="16" rx="2" fill="url(#gl_metal)"/>
          <line x1="24" y1="-8" x2="24" y2="8" stroke="#999" strokeWidth="0.8"/>
          <line x1="27" y1="-8" x2="27" y2="8" stroke="#999" strokeWidth="0.8"/>
          <line x1="30" y1="-8" x2="30" y2="8" stroke="#999" strokeWidth="0.8"/>
          <ellipse cx="28" cy="11" rx="6" ry="4" fill="url(#gl_metal)"/>
          <rect x="0" y="-5" width="12" height="10" rx="2" fill="#c47010"/>
          <rect x="-10" y="-4" width="12" height="8" rx="3" fill="#333"/>
          <ellipse cx="-10" cy="0" rx="3" ry="4" fill="#1a2a5a"/>
          <ellipse cx="-11" cy="-1" rx="1" ry="1.5" fill="#7ab0e8" opacity="0.5"/>
          <ellipse cx="73" cy="0" rx="4" ry="9" fill="#1a1a1a"/>
          <ellipse cx="73" cy="0" rx="2.5" ry="7" fill="url(#gl_lens)"/>
          <ellipse cx="72" cy="-2" rx="1" ry="2" fill="#fff" opacity="0.4"/>
          <g transform="translate(22,-9)">
            <rect x="0" y="-4" width="26" height="8" rx="3" fill="#1e1e1e"/>
            <ellipse cx="26" cy="0" rx="2.5" ry="4.5" fill="#2a5a9a"/>
            <circle cx="13" cy="-7" r="2" fill="url(#gl_metal)"/>
          </g>
        </g>
      </g>
      <circle cx="18" cy="16" r="1.2" fill="#f5a623" opacity="0.85"/>
      <circle cx="42" cy="8" r="0.9" fill="#fff" opacity="0.7"/>
      <circle cx="68" cy="18" r="1" fill="#f5a623" opacity="0.6"/>
      <circle cx="10" cy="38" r="0.8" fill="#fff" opacity="0.5"/>
      <path d="M25 22 L26.5 26 L30 22 L26.5 18 Z" fill="#f5a623" opacity="0.55" transform="scale(0.5) translate(26,22)"/>
      <g transform="translate(66,22)">
        <line x1="8" y1="2" x2="8" y2="44" stroke="#e05252" strokeWidth="0.8"/>
        <rect x="4" y="10" width="8" height="18" rx="1" fill="#e05252"/>
        <line x1="20" y1="5" x2="20" y2="42" stroke="#2dd87a" strokeWidth="0.8"/>
        <rect x="16" y="12" width="8" height="16" rx="1" fill="#2dd87a"/>
        <line x1="32" y1="2" x2="32" y2="38" stroke="#2dd87a" strokeWidth="0.8"/>
        <rect x="28" y="6" width="8" height="22" rx="1" fill="#2dd87a"/>
        <line x1="44" y1="5" x2="44" y2="36" stroke="#e05252" strokeWidth="0.8"/>
        <rect x="40" y="10" width="8" height="14" rx="1" fill="#e05252"/>
        <polyline points="4,24 16,18 28,10 40,14" fill="none" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.88"/>
        <polygon points="48,6 42,12 46,15" fill="#f5a623" opacity="0.9"/>
      </g>
    </svg>
  )
}