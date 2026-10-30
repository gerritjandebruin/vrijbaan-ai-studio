/**
 * Kopbalk Component
 * Conform specificaties [K-1], [K-2], [S-4]
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  fetchFailed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  fetchFailed
}) => {
  // Bereken leeftijd van data in minuten [K-1, K-2]
  const now = Date.now();
  const ageMinutes = lastUpdated ? Math.floor((now - lastUpdated) / 60000) : null;

  // Formatteer tijdstip (bijv. "14:32")
  const timeString = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  // [K-2] Stip kleur:
  // - groen tot 3 minuten oud
  // - oranje tot 10 minuten
  // - rood daarna
  // - grijs zolang er nog niets is
  let dotColorClass = 'bg-slate-500';
  if (ageMinutes !== null) {
    if (ageMinutes <= 3) {
      dotColorClass = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
    } else if (ageMinutes <= 10) {
      dotColorClass = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    } else {
      dotColorClass = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
    }
  }

  const ageLabel = ageMinutes === null 
    ? 'Geen data'
    : ageMinutes === 0 
      ? `${timeString} · zojuist` 
      : `${timeString} · ${ageMinutes} min`;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Woordmerk */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-white font-sans">
            Vrijbaan
          </span>
        </div>

        {/* Status label & Verversknop [K-1] */}
        <div className="flex items-center gap-2">
          {/* Label met tijd, leeftijd en stip [K-1, K-2] */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className={`w-2 h-2 rounded-full ${dotColorClass}`} />
            <span>{ageLabel}</span>
          </div>

          {/* Verversknop die draait tijdens het laden [K-1] */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Gegevens nu verversen"
            className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* [S-4] Mislukt een verversing, dan een rode balk "Verversen mislukt" */}
      {fetchFailed && (
        <div className="mt-1.5 -mx-4 -mb-2.5 py-1 px-4 bg-rose-950/90 border-t border-rose-800/60 text-rose-300 text-[11px] font-semibold text-center flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>Verversen mislukt — vorige gegevens blijven zichtbaar</span>
        </div>
      )}
    </header>
  );
};
