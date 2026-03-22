export default function GalileoLogo({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gl_b" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4a030"/>
          <stop offset="18%" stopColor="#f0cc70"/>
          <stop offset="45%" stopColor="#c8880a"/>
          <stop offset="100%" stopColor="#6a3a05"/>
        </linearGradient>
        <linearGradient id="gl_r" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0b840"/>
          <stop offset="30%" stopColor="#f8dc88"/>
          <stop offset="100%" stopColor="#8a5808"/>
        </linearGradient>
        <linearGradient id="gl_l" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a3010"/>
          <stop offset="40%" stopColor="#7a4820"/>
          <stop offset="100%" stopColor="#3a1c08"/>
        </linearGradient>
        <linearGradient id="gl_g" x1="5%" y1="5%" x2="95%" y2="95%">
          <stop offset="0%" stopColor="#a8d0f8"/>
          <stop offset="35%" stopColor="#4888d0"/>
          <stop offset="100%" stopColor="#081830"/>
        </linearGradient>
        <linearGradient id="gl_w" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3a2008"/>
          <stop offset="45%" stopColor="#8a5020"/>
          <stop offset="100%" stopColor="#3a2008"/>
        </linearGradient>
      </defs>
      {/* Stars */}
      <circle cx="20" cy="18" r="1.5" fill="#f5a623" opacity="0.8"/>
      <circle cx="38" cy="8" r="1" fill="#fff" opacity="0.6"/>
      <circle cx="12" cy="40" r="1.2" fill="#fff" opacity="0.45"/>
      <circle cx="125" cy="15" r="1.3" fill="#f5a623" opacity="0.6"/>
      <circle cx="148" cy="30" r="1" fill="#fff" opacity="0.5"/>
      <path d="M30 14 L31.5 19 L36 14 L31.5 9 Z" fill="#f5a623" opacity="0.6" transform="scale(0.45) translate(38,14)"/>

      {/* Tripod */}
      <g transform="translate(15,120)">
        <path d="M52,0 Q42,14 28,46" stroke="url(#gl_w)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M55,0 Q56,18 56,50" stroke="url(#gl_w)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M58,0 Q68,14 82,46" stroke="url(#gl_w)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M36,28 Q56,35 76,28" stroke="#4a2808" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <ellipse cx="28" cy="47" rx="6" ry="3" fill="url(#gl_r)"/>
        <ellipse cx="56" cy="51" rx="6" ry="3" fill="url(#gl_r)"/>
        <ellipse cx="82" cy="47" rx="6" ry="3" fill="url(#gl_r)"/>
        {/* Mount */}
        <ellipse cx="55" cy="-2" rx="12" ry="7" fill="url(#gl_b)"/>
        <rect x="45" y="-9" width="20" height="10" rx="3" fill="url(#gl_r)"/>
        <path d="M38,-7 Q55,-16 72,-7" stroke="url(#gl_r)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="37" cy="-3" r="4" fill="url(#gl_r)"/><circle cx="37" cy="-3" r="2.5" fill="#e8c060"/>
        <circle cx="73" cy="-3" r="4" fill="url(#gl_r)"/><circle cx="73" cy="-3" r="2.5" fill="#e8c060"/>

        {/* Main tube assembly, angled */}
        <g transform="translate(55,-10) rotate(-20)">
          {/* Leather tube */}
          <rect x="14" y="-11" width="90" height="22" rx="5" fill="url(#gl_l)"/>
          <rect x="16" y="-9" width="86" height="7" rx="2" fill="#9a6030" opacity="0.35"/>
          {/* Brass rings */}
          <rect x="14" y="-13" width="9" height="26" rx="2" fill="url(#gl_r)"/>
          <rect x="38" y="-13" width="7" height="26" rx="2" fill="url(#gl_r)"/>
          <rect x="68" y="-13" width="7" height="26" rx="2" fill="url(#gl_r)"/>
          <rect x="95" y="-13" width="9" height="26" rx="2" fill="url(#gl_r)"/>
          {/* Draw tube 1 */}
          <rect x="104" y="-9" width="50" height="18" rx="4" fill="#c89820"/>
          <rect x="104" y="-11" width="8" height="22" rx="2" fill="url(#gl_r)"/>
          <rect x="146" y="-11" width="8" height="22" rx="2" fill="url(#gl_r)"/>
          {/* Draw tube 2 */}
          <rect x="154" y="-7" width="34" height="14" rx="3" fill="#b87818"/>
          <rect x="154" y="-9" width="6" height="18" rx="2" fill="url(#gl_r)"/>
          <rect x="180" y="-9" width="6" height="18" rx="2" fill="url(#gl_r)"/>
          {/* Objective lens */}
          <ellipse cx="186" cy="0" rx="7" ry="16" fill="#8a5808"/>
          <ellipse cx="186" cy="0" rx="5" ry="12" fill="url(#gl_r)"/>
          <ellipse cx="186" cy="0" rx="3.5" ry="9" fill="url(#gl_g)"/>
          <ellipse cx="185" cy="-3" rx="1.5" ry="3" fill="#d8f0ff" opacity="0.45"/>
          {/* Eyepiece */}
          <rect x="-16" y="-6" width="18" height="12" rx="4" fill="url(#gl_r)"/>
          <rect x="-16" y="-7" width="6" height="14" rx="2" fill="url(#gl_r)"/>
          <ellipse cx="-16" cy="0" rx="4" ry="6" fill="#0a0a20"/>
          <ellipse cx="-17" cy="-1.5" rx="1.2" ry="2" fill="#6090c8" opacity="0.5"/>
          <ellipse cx="-16" cy="0" rx="4.5" ry="6.5" fill="none" stroke="#4a2808" strokeWidth="1.5"/>
          {/* Focus knob */}
          <circle cx="112" cy="13" r="5" fill="url(#gl_r)"/>
          <circle cx="112" cy="13" r="3" fill="#e8c050"/>
          <line x1="109" y1="13" x2="115" y2="13" stroke="#a07010" strokeWidth="0.8"/>
          <line x1="112" y1="10" x2="112" y2="16" stroke="#a07010" strokeWidth="0.8"/>
          {/* Compass */}
          <circle cx="54" cy="-17" r="7" fill="#c89020"/>
          <circle cx="54" cy="-17" r="5.5" fill="#0a0804"/>
          <polygon points="54,-22 52,-17 56,-17" fill="#e05252"/>
          <polygon points="54,-12 52,-17 56,-17" fill="#f5a623"/>
          <circle cx="54" cy="-17" r="1.2" fill="#c89020"/>
        </g>
      </g>
    </svg>
  )
}