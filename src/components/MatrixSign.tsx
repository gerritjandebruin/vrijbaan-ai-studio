/**
 * Nederlands Matrixbord (MSI) Component
 * Getekend conform de werkelijke Rijkswaterstaat matrixborden boven de snelweg en mxbord.nl [O-11]:
 * - Vier hoek-knipperlichten (flitsers) die synchroon knipperen bij file- en incidentwaarschuwingen
 * - Snelheid in rode ring (50, 70, 80, 90, 100)
 * - Rood kruis (X) voor afgekruiste rijstroken
 * - Invoegpijl (links / rechts)
 * - Einde-schijf (witte cirkel met zwarte diagonale strepen)
 */

import React from 'react';
import { MatrixSign as MatrixSignType } from '../types/traffic';

interface MatrixSignProps {
  sign: MatrixSignType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLaneNumber?: boolean;
}

/**
 * Berekent automatisch de ideale grootte zodat portalen met veel rijstroken
 * altijd perfect in één rij passen op een mobiel scherm.
 */
export function getAdaptiveSignSize(laneCount: number): 'xs' | 'sm' | 'md' {
  if (laneCount >= 5) return 'xs';
  if (laneCount === 4) return 'sm';
  return 'md';
}

export const MatrixSign: React.FC<MatrixSignProps> = ({
  sign,
  size = 'md',
  showLaneNumber = false
}) => {
  const pixelSizes = {
    xs: { w: 38, h: 38, font: 12 },
    sm: { w: 46, h: 46, font: 15 },
    md: { w: 58, h: 58, font: 19 },
    lg: { w: 84, h: 84, font: 28 }
  };

  const dim = pixelSizes[size];

  // Afleiden van getoonde snelheid
  let speedText = '';
  if (sign.speedValue) {
    speedText = sign.speedValue.toString();
  } else if (sign.symbol.startsWith('speed_')) {
    speedText = sign.symbol.replace('speed_', '');
  }

  // AID filebeveiliging (50 km/u, 70 km/u met file) of verdrijfpijl voor opvolgend rood kruis
  const hasFlashers = Boolean(
    sign.flashers ||
    (sign.symbol === 'speed_50') ||
    (sign.speedValue === 50) ||
    (sign.speedValue === 70 && sign.flashers) ||
    (sign.symbol === 'merge_left') ||
    (sign.symbol === 'merge_right')
  );

  return (
    <div className="flex flex-col items-center select-none">
      <div 
        className="relative bg-black rounded-lg border border-slate-700/90 shadow-md flex items-center justify-center overflow-hidden"
        style={{ width: `${dim.w}px`, height: `${dim.h}px` }}
      >
        <svg 
          viewBox="0 0 100 100" 
          width={dim.w} 
          height={dim.h} 
          className="w-full h-full"
        >
          <defs>
            {/* LED raster achtergrond */}
            <pattern id="matrix-led-grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.65" fill="#1e293b" opacity="0.35" />
            </pattern>
          </defs>

          {/* Achtergrond behuizing */}
          <rect width="100" height="100" rx="8" fill="#000000" />
          <rect width="100" height="100" fill="url(#matrix-led-grid)" />

          {/* 
            VIER HOEK-KNIPPERLICHTEN (FLITSERS) 
            Zoals te zien op mxbord.nl en boven de Nederlandse snelweg.
            Bij sign.flashers of 50 km/u knipperen ze synchroon fel oranje/geel.
          */}
          <g>
            {/* Hoek-lamp behuizingen (4 hoeken) */}
            <circle cx="12" cy="12" r="5.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
            <circle cx="88" cy="12" r="5.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
            <circle cx="12" cy="88" r="5.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
            <circle cx="88" cy="88" r="5.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />

            {/* Actieve of rustende lamp lenzen */}
            {hasFlashers ? (
              <>
                {/* Eerst boven aan */}
                <g className="matrix-flasher-top">
                  <circle cx="12" cy="12" r="4.2" fill="#fbbf24" />
                  <circle cx="88" cy="12" r="4.2" fill="#fbbf24" />
                </g>
                {/* Dan beneden aan */}
                <g className="matrix-flasher-bottom">
                  <circle cx="12" cy="88" r="4.2" fill="#fbbf24" />
                  <circle cx="88" cy="88" r="4.2" fill="#fbbf24" />
                </g>
              </>
            ) : (
              <g opacity="0.25">
                <circle cx="12" cy="12" r="3.5" fill="#451a03" />
                <circle cx="88" cy="12" r="3.5" fill="#451a03" />
                <circle cx="12" cy="88" r="3.5" fill="#451a03" />
                <circle cx="88" cy="88" r="3.5" fill="#451a03" />
              </g>
            )}
          </g>

          {/* 1. Snelheidsaanduiding: Rode ring met witte LED-cijfers */}
          {speedText && (
            <g>
              {/* Rode ring */}
              <circle 
                cx="50" 
                cy="50" 
                r="36" 
                fill="none" 
                stroke="#dc2626" 
                strokeWidth="8.5" 
              />
              {/* Cijfers in helder wit */}
              <text
                x="50"
                y={speedText === '100' ? '57' : '59'}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={speedText === '100' ? '28' : '35'}
                fontWeight="900"
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing={speedText === '100' ? '-2' : '0'}
              >
                {speedText}
              </text>
            </g>
          )}

          {/* 2. Rood Kruis (X) voor afgekruiste strook */}
          {sign.symbol === 'red_cross' && (
            <g stroke="#ef4444" strokeWidth="11" strokeLinecap="round">
              <line x1="22" y1="22" x2="78" y2="78" />
              <line x1="78" y1="22" x2="22" y2="78" />
            </g>
          )}

          {/* 3. Invoegpijl naar rechts (↘) */}
          {sign.symbol === 'merge_right' && (
            <g fill="none" stroke="#ffffff" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 32 26 L 68 64" />
              <path d="M 48 66 L 70 66 L 70 44" strokeWidth="8.5" fill="none" />
            </g>
          )}

          {/* 4. Invoegpijl naar links (↙) */}
          {sign.symbol === 'merge_left' && (
            <g fill="none" stroke="#ffffff" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 68 26 L 32 64" />
              <path d="M 52 66 L 30 66 L 30 44" strokeWidth="8.5" fill="none" />
            </g>
          )}

          {/* 5. Einde alle beperkingen (witte schijf met diagonale zwarte strepen) */}
          {sign.symbol === 'end_restriction' && (
            <g>
              <circle cx="50" cy="50" r="36" fill="#f8fafc" />
              <g stroke="#09090b" strokeWidth="3.5">
                <line x1="28" y1="72" x2="72" y2="28" />
                <line x1="33" y1="77" x2="77" y2="33" />
                <line x1="23" y1="67" x2="67" y2="23" />
                <line x1="38" y1="82" x2="82" y2="38" />
              </g>
            </g>
          )}

          {/* 6. Blank / Uitgeschakeld bord */}
          {sign.symbol === 'blank' && (
            <circle cx="50" cy="50" r="1.5" fill="#334155" opacity="0.3" />
          )}
        </svg>
      </div>

      {showLaneNumber && (
        <span className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">
          str {sign.lane}
        </span>
      )}
    </div>
  );
};
