import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  logoUrl?: string | null;
}

export function Logo({ variant = 'dark', size = 'md', className = '', logoUrl }: LogoProps) {
  // variant="dark" means on a dark background (white Royal + gold Rides + white TRAVELS)
  // variant="light" means on a light background (navy Royal + gold Rides + navy/slate TRAVELS)
  const isDark = variant === 'dark';

  const royalColor = isDark ? '#FFFFFF' : '#071A35';
  const travelsColor = isDark ? '#CBD5E1' : '#475467';
  const goldColor = '#F5B936';

  const sizes = {
    sm: { height: 32, fontSize: '18px', subSize: '8px', arcStroke: 2.5 },
    md: { height: 42, fontSize: '24px', subSize: '9.5px', arcStroke: 3 },
    lg: { height: 54, fontSize: '30px', subSize: '11px', arcStroke: 3.5 },
  };

  const currentSize = sizes[size];

  if (logoUrl) {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <img
          src={logoUrl}
          alt="RoyalRides Travels"
          style={{ maxHeight: currentSize.height }}
          className="w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Curved luxury aerodynamic arch above the logo */}
      <svg
        viewBox="0 0 160 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[140px] h-3.5 mb-0.5"
      >
        <path
          d="M 10 18 Q 80 -4 150 18"
          stroke={goldColor}
          strokeWidth={currentSize.arcStroke}
          strokeLinecap="round"
        />
        <path
          d="M 40 18 Q 80 6 120 18"
          stroke={goldColor}
          strokeWidth={currentSize.arcStroke * 0.75}
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>

      {/* Main Brand Wordmark */}
      <div className="flex items-baseline font-black tracking-tight leading-none" style={{ fontSize: currentSize.fontSize }}>
        <span style={{ color: royalColor }} className="font-extrabold tracking-tight">
          Royal
        </span>
        <span style={{ color: goldColor }} className="font-extrabold tracking-tight ml-0.5">
          Rides
        </span>
      </div>

      {/* Subtitle: TRAVELS */}
      <span
        style={{ color: travelsColor, fontSize: currentSize.subSize }}
        className="font-bold tracking-[0.28em] uppercase -mt-0.5 text-center w-full pl-[0.28em]"
      >
        TRAVELS
      </span>
    </div>
  );
}
