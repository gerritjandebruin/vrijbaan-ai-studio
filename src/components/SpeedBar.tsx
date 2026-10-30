/**
 * Snelheidsbalk Component
 * Conform specificaties [O-7], [O-8], [O-9]:
 * - Keuze vooruitkijken: 10, 20 of 30 km. Standaard 20 (onthouden in localStorage)
 * - 10 gelijke stukken met gemiddelde gemeten snelheid
 * - Kleuren: rood < 50, oranje 50-80, groen >= 80, grijs zonder meting
 */

import React, { useState } from 'react';
import { SpeedSegment } from '../types/traffic';
import { formatDutchKm, formatSpeed } from '../services/vildData';

interface SpeedBarProps {
  segments: SpeedSegment[];
  lookaheadKm: 10 | 20 | 30;
  onLookaheadChange: (km: 10 | 20 | 30) => void;
}

export const SpeedBar: React.FC<SpeedBarProps> = ({
  segments,
  lookaheadKm,
  onLookaheadChange
}) => {
  const [selectedSegment, setSelectedSegment] = useState<SpeedSegment | null>(null);

  const getSegmentColorClass = (color: 'red' | 'orange' | 'green' | 'gray') => {
    switch (color) {
      case 'red':
        return 'bg-rose-500 hover:bg-rose-400';
      case 'orange':
        return 'bg-amber-500 hover:bg-amber-400';
      case 'green':
        return 'bg-emerald-500 hover:bg-emerald-400';
      case 'gray':
      default:
        return 'bg-slate-800 hover:bg-slate-700';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur-sm">
      {/* Header met titel en 10/20/30 km keuzeknoppen [O-7] */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <span>Vooruitkijken</span>
          <span className="text-slate-500 font-mono">({lookaheadKm} km)</span>
        </div>

        {/* Segmented control voor 10 / 20 / 30 km */}
        <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800/80">
          {([10, 20, 30] as const).map(km => (
            <button
              key={km}
              onClick={() => {
                onLookaheadChange(km);
                setSelectedSegment(null);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                lookaheadKm === km
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* 10-delige snelheidsbalk [O-8, O-9] */}
      <div className="grid grid-cols-10 gap-1 h-5 w-full bg-slate-950 p-1 rounded-lg border border-slate-800/80">
        {segments.map((seg, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedSegment(selectedSegment?.index === idx ? null : seg)}
            className={`h-full rounded-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-400 ${getSegmentColorClass(
              seg.color
            )} ${selectedSegment?.index === idx ? 'ring-2 ring-white scale-105 z-10' : ''}`}
            title={`Deel ${idx + 1}: ${formatSpeed(seg.avgSpeed)} (${formatDutchKm(seg.fromKm)} - ${formatDutchKm(seg.toKm)})`}
          />
        ))}
      </div>

      {/* Schaalverdeling onder de balk */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1.5 px-0.5">
        <span>Hier</span>
        <span>+{(lookaheadKm / 2).toFixed(0)} km</span>
        <span>+{lookaheadKm} km</span>
      </div>

      {/* Detail bij aantikken van een segment */}
      {selectedSegment && (
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono text-slate-400">
            {formatDutchKm(selectedSegment.fromKm)} → {formatDutchKm(selectedSegment.toKm)}
          </span>
          <span className="font-semibold font-mono">
            Gemeten: {formatSpeed(selectedSegment.avgSpeed)}
          </span>
        </div>
      )}
    </div>
  );
};
