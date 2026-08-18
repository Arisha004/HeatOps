import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 32,
  showText = false,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`relative inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Subtle Outer Bevel Gradient */}
          <linearGradient id="heatops-shield-bg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="0.5" stopColor="#0F172A" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>

          {/* Thermal Plasma Core Gradient */}
          <linearGradient id="heatops-thermal-core" x1="12" y1="8" x2="28" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.5" stopColor="#EA580C" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>

          {/* Shield Border Gradient */}
          <linearGradient id="heatops-border-glow" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" stopOpacity="0.8" />
            <stop offset="0.4" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="1" stopColor="#334155" stopOpacity="0.6" />
          </linearGradient>

          {/* Radial Core Glow */}
          <radialGradient id="heatops-glow" cx="20" cy="20" r="14" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="20" cy="20" r="15" fill="url(#heatops-glow)" />

        {/* Precision Shield Base (Isometric Hex-Shield) */}
        <path
          d="M20 3.5L34 9.5V20.5C34 28.5 28 34.5 20 37C12 34.5 6 28.5 6 20.5V9.5L20 3.5Z"
          fill="url(#heatops-shield-bg)"
          stroke="url(#heatops-border-glow)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Safety Shield Chamber */}
        <path
          d="M20 7.5L30.5 12V20C30.5 26.2 26 31 20 33.2C14 31 9.5 26.2 9.5 20V12L20 7.5Z"
          fill="#0F172A"
          fillOpacity="0.8"
          stroke="#475569"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* Thermal Waveform / Precision ISO WBGT Sensor Needle */}
        <path
          d="M20 11V21M20 21C21.6569 21 23 22.3431 23 24C23 25.6569 21.6569 27 20 27C18.3431 27 17 25.6569 17 24C17 22.3431 18.3431 21 20 21Z"
          fill="url(#heatops-thermal-core)"
          stroke="#FEF3C7"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Radiant Heat Energy Arc Bands */}
        <path
          d="M14 14.5C15.6 13.2 17.7 12.5 20 12.5C22.3 12.5 24.4 13.2 26 14.5"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M16 17.5C17.1 16.6 18.5 16 20 16C21.5 16 22.9 16.6 24 17.5"
          stroke="#FBBF24"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Central Mercury/Sensor Highlight Spark */}
        <circle cx="20" cy="24" r="1.5" fill="#FFFFFF" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-lg ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Heat<span className="text-orange-500">Ops</span>
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isDark
                  ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}
            >
              ISO 7243
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-tight ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Industrial Thermal Risk Engine
          </span>
        </div>
      )}
    </div>
  );
};
