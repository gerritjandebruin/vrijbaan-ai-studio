/**
 * Nederlands Wegschild Component
 * Conform specificatie [O-1]:
 * - Rood met wit voor A-wegen (bijv. A2, A10)
 * - Geel met zwart voor N-wegen (bijv. N201)
 */

import React from 'react';
import { RoadType } from '../types/traffic';

interface RoadShieldProps {
  road: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RoadShield: React.FC<RoadShieldProps> = ({ road, size = 'md', className = '' }) => {
  const roadType: RoadType = road.toUpperCase().startsWith('N') ? 'N' : 'A';
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs font-bold min-w-[32px]',
    md: 'px-2.5 py-1 text-sm font-extrabold min-w-[42px]',
    lg: 'px-3 py-1.5 text-base font-black min-w-[52px]'
  };

  if (roadType === 'A') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-[#c51c13] text-white shadow-sm border border-red-700/60 font-sans tracking-tight text-center ${sizeClasses[size]} ${className}`}
        aria-label={`Rijksweg ${road}`}
      >
        {road.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-[#ffcc00] text-black shadow-sm border border-amber-600/60 font-sans tracking-tight text-center ${sizeClasses[size]} ${className}`}
      aria-label={`Provinciale weg ${road}`}
    >
      {road.toUpperCase()}
    </span>
  );
};
