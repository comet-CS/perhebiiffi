import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 320 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.5"/>
      </filter>
    </defs>
    
    {/* Outer Badge Shape */}
    <ellipse cx="160" cy="100" rx="150" ry="90" fill="url(#logoGradient)" stroke="#facc15" strokeWidth="8" filter="url(#shadow)" />
    
    {/* Inner Ring */}
    <ellipse cx="160" cy="100" rx="135" ry="75" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6" />
    
    {/* Starburst effect behind text */}
    <path d="M160 20 L170 50 L200 60 L170 70 L160 100 L150 70 L120 60 L150 50 Z" fill="#facc15" opacity="0.1" transform="scale(2) translate(-80 -50)" />

    {/* Text - PERHE */}
    <text 
      x="160" 
      y="90" 
      textAnchor="middle" 
      fontFamily="Impact, sans-serif" 
      fontSize="72" 
      fill="#facc15"
      stroke="#000"
      strokeWidth="2"
      style={{ textShadow: '4px 4px 0px #000' }}
    >
      PERHE
    </text>

    {/* Text - BIIFFI */}
    <text 
      x="160" 
      y="155" 
      textAnchor="middle" 
      fontFamily="Impact, sans-serif" 
      fontSize="84" 
      fill="#ffffff"
      stroke="#000"
      strokeWidth="2"
      style={{ textShadow: '4px 4px 0px #000' }}
    >
      BIIFFI
    </text>
    
    {/* Decorative Stars */}
    <circle cx="40" cy="100" r="8" fill="#facc15" />
    <circle cx="280" cy="100" r="8" fill="#facc15" />
  </svg>
);

export default Logo;