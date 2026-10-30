/**
 * Scherm Overzicht (Landelijk overzicht van files en afsluitingen)
 * Conform specificaties [V-1] t/m [V-9]
 */

import React, { useState } from 'react';
import { trafficDataService } from '../services/trafficDataService';
import { RoadShield } from '../components/RoadShield';
import { MatrixSign } from '../components/MatrixSign';
import {
  formatDutchKm,
  formatSpeed,
  getSpeedColor,
  getSpeedColorClass
} from '../services/vildData';
import { Search, AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const OverzichtView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const sessionStats = trafficDataService.getSessionStats();

  // [V-1] Het moet het hele nummer zijn (bijv. A2); "A" alleen toont niets
  const effectiveFilter = searchQuery.trim().length >= 2 ? searchQuery.trim() : '';

  const overviewData = trafficDataService.getNationalOverview(effectiveFilter);

  return (
    <div className="flex-1 flex flex-col w-full max-w-xl mx-auto px-4 pt-3 pb-24 gap-4">
      {/* [V-1] Zoekveld voor wegnummer */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter op wegnummer (bijv. A2, A12, A10)..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* [V-2] Twee tellers: aantal files en aantal afsluitingen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Files</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              {overviewData.totalJams}
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500/80" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Afsluitingen</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {overviewData.totalClosures}
            </span>
          </div>
          <ShieldAlert className="w-6 h-6 text-amber-500/80" />
        </div>
      </div>

      {/* Lijst met files [V-4, V-5] */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Actuele Files {effectiveFilter ? `op ${effectiveFilter.toUpperCase()}` : 'in Nederland'}
        </h2>

        {overviewData.jams.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
            {searchQuery && searchQuery.trim().length < 2
              ? 'Typ een volledig wegnummer (bijv. A2 of A10) om te filteren.'
              : 'Geen files gevonden op dit wegvak.'}
          </div>
        ) : (
          overviewData.jams.map(jam => {
            const speedColor = getSpeedColor(jam.avgSpeedKmH);
            const speedClasses = getSpeedColorClass(speedColor);

            return (
              <div
                key={jam.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-slate-100"
              >
                {/* Wegschild + Richting [V-4] */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RoadShield road={jam.road} size="md" />
                    <span className="text-sm font-bold text-white truncate">
                      Richting {jam.direction}
                    </span>
                  </div>

                  {/* Gemiddelde snelheid groot in verkeerskleur [V-4] */}
                  <div className="text-right shrink-0">
                    <span className={`text-xl font-black font-mono tracking-tight ${speedClasses.text}`}>
                      {formatSpeed(jam.avgSpeedKmH)}
                    </span>
                  </div>
                </div>

                {/* "tussen ... en ..." [V-4] */}
                <p className="text-xs text-slate-300 font-medium mb-2">
                  tussen {jam.fromLandmark} en {jam.toLandmark}
                </p>

                {/* Lengte, km-bereik en laagste meting [V-4] */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                  <span>Lengte: {jam.lengthKm.toFixed(1).replace('.', ',')} km</span>
                  <span>{formatDutchKm(jam.startKm)} → {formatDutchKm(jam.endKm)}</span>
                  <span>Laagste: {formatSpeed(jam.minSpeedKmH)}</span>
                </div>

                {/* [V-5] Rode waarschuwing bij rood kruis of invoegpijl */}
                {jam.closedLanesWarning && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{jam.closedLanesWarning}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lijst met afsluitingen [V-6, V-7] */}
      <div className="space-y-3 mt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Rijstrookafsluitingen & Rode Kruisen
        </h2>

        {overviewData.closures.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
            Geen actieve rijstrookafsluitingen aangetroffen.
          </div>
        ) : (
          overviewData.closures.map(closure => (
            <div
              key={closure.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <RoadShield road={closure.road} size="sm" />
                  <span className="text-xs font-bold text-white truncate">
                    Richting {closure.direction}
                  </span>
                </div>
                {/* [V-7] "bij afrit ...", km en strooknummers */}
                <p className="text-xs text-slate-300 mb-1">
                  bij {closure.landmark}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>{formatDutchKm(closure.km)}</span>
                  <span>·</span>
                  <span className="text-rose-400 font-semibold">
                    Strook {closure.closedLanes.join(', ')} dicht
                  </span>
                </div>
              </div>

              {/* [V-7] Rechts de borden zelf (hooguit 4) altijd in één rij */}
              <div className="flex items-center gap-1 shrink-0 flex-nowrap">
                {closure.signs.slice(0, 4).map((s, idx) => (
                  <div key={idx} className="shrink-0">
                    <MatrixSign sign={s} size="sm" showLaneNumber />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* [V-9] Onderaan aantal meetpunten en matrixborden in de laatste gegevens met bron NDW */}
      <footer className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        <p className="font-mono mb-1">
          {sessionStats.activeMeasurementPointsCount} meetpunten · {sessionStats.activeMatrixSignsCount} matrixborden actief
        </p>
        <p>Bron: Nationale Databank Wegverkeersgegevens (NDW opendata.ndw.nu)</p>
      </footer>
    </div>
  );
};
