/**
 * Scherm Onderweg (Startscherm van Vrijbaan)
 * Strakke, afleidingsvrije en cleane mobiele interface.
 */

import React from 'react';
import { MatchedRoadPosition, AppSettings } from '../types/traffic';
import { RoadShield } from '../components/RoadShield';
import { MatrixSign, getAdaptiveSignSize } from '../components/MatrixSign';
import { trafficDataService } from '../services/trafficDataService';
import { alertAudioService } from '../services/alertAudio';
import {
  formatDutchKm,
  formatDutchDistance
} from '../services/vildData';
import { 
  Play, 
  Pause, 
  MapPinOff, 
  CheckCircle2, 
  RotateCcw,
  Navigation
} from 'lucide-react';

interface OnderwegViewProps {
  matchedPosition: MatchedRoadPosition | null;
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  onRequestLocation: () => void;
  // Simulatie parameters
  isSimulating: boolean;
  simKm: number;
  onSimKmChange: (km: number) => void;
  isSimPlaying: boolean;
  onToggleSimPlaying: () => void;
  simSpeedKmH: number;
  onSimSpeedChange: (speed: number) => void;
}

export const OnderwegView: React.FC<OnderwegViewProps> = ({
  matchedPosition,
  settings,
  onSettingsChange,
  permissionState,
  onRequestLocation,
  isSimulating,
  simKm,
  onSimKmChange,
  isSimPlaying,
  onToggleSimPlaying
}) => {
  // Bepaal tijdlijn items altijd bovenaan vóór enige returns (React Hook Rules)
  const timelineItems = React.useMemo(() => {
    if (!matchedPosition) return [];
    return trafficDataService.getTimeline(
      matchedPosition.road,
      matchedPosition.km,
      matchedPosition.carriageway,
      settings.lookaheadKm
    );
  }, [matchedPosition, settings.lookaheadKm]);

  // Subtiele audio- en trilwaarschuwing bij naderen van rood kruis of filekop [Aanbeveling 5]
  React.useEffect(() => {
    if (timelineItems.length > 0) {
      alertAudioService.checkAndTriggerApproachingAlert(timelineItems, settings.audioAlerts);
    }
  }, [timelineItems, settings.audioAlerts]);

  // Als locatie uit staat in instellingen [I-1]
  if (!settings.useLocation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
          <MapPinOff className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Locatie staat uit</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Vrijbaan heeft je positie nodig om te bepalen op welke snelweg, kilometer en rijbaan je rijdt.
        </p>
        <button
          onClick={() => onSettingsChange({ useLocation: true })}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-900/30"
        >
          Locatie aanzetten
        </button>
      </div>
    );
  }

  // Als toestemming geweigerd is [S-1]
  if (permissionState === 'denied') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/50 border border-rose-800/40 flex items-center justify-center mb-4 text-rose-400">
          <MapPinOff className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Locatietoegang geweigerd</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Geef Vrijbaan toestemming voor locatie, of start een ritsimulatie om de app direct te testen.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRequestLocation}
            className="w-full px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-900/30"
          >
            Opnieuw proberen
          </button>
          <button
            onClick={() => onSettingsChange({ simulationRoute: 'a2_utrecht' })}
            className="w-full px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition"
          >
            Start A2 ritsimulatie
          </button>
        </div>
      </div>
    );
  }

  // [P-7] Geen snelweg in de buurt
  if (!matchedPosition) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400">
          <Navigation className="w-8 h-8 animate-pulse text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Geen snelweg in de buurt</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Vrijbaan activeert automatisch zodra je binnen 100 meter van een Nederlandse rijksweg of provinciale weg rijdt.
        </p>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left w-full">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Wil je Vrijbaan nu testen vanaf je bureau?
          </span>
          <button
            onClick={() => onSettingsChange({ simulationRoute: 'a2_utrecht' })}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition text-center shadow-md"
          >
            Start gesimuleerde rit op de A2
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-lg mx-auto px-3.5 pt-2 pb-24 gap-3">
      {/* Subtiele, compacte simulatiebalk indien actief */}
      {isSimulating && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center gap-3 shadow-sm">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-semibold text-blue-400">Simulatie</span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">30</span>
            <input
              type="range"
              min="30"
              max="70"
              step="0.1"
              value={simKm}
              onChange={e => onSimKmChange(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[10px] text-slate-500 font-mono">70</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleSimPlaying}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition"
              title={isSimPlaying ? 'Pauzeren' : 'Starten'}
            >
              {isSimPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onSimKmChange(32.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Herstart rit"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* KOPKAART: Cleane mobiele weergave met bord als authentiek icoon */}
      <div className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <RoadShield road={matchedPosition.road} size="lg" />
            <h1 className="text-xl font-black text-white tracking-tight truncate">
              Richting {matchedPosition.directionName}
            </h1>
          </div>
          <p className="text-xs text-slate-400 truncate">
            tussen {matchedPosition.lastLandmark} en {matchedPosition.nextLandmark}
          </p>

          {/* Positie optioneel via instellingen (standaard verborgen voor maximale rust) */}
          {settings.showPositionOnScreen && (
            <p className="text-xs text-blue-400 font-mono font-semibold mt-1">
              {formatDutchKm(matchedPosition.km)} {matchedPosition.carriageway === 'Re' ? 'Re' : matchedPosition.carriageway === 'Li' ? 'Li' : ''}
            </p>
          )}
        </div>

        {/* Huidige snelheid als authentiek matrixbord-icoon */}
        <div className="shrink-0 flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
            Bord
          </span>
          {matchedPosition.lastPassedPortalSpeed ? (
            <MatrixSign
              sign={{
                lane: 1,
                symbol: `speed_${matchedPosition.lastPassedPortalSpeed}` as any,
                speedValue: matchedPosition.lastPassedPortalSpeed
              }}
              size="md"
            />
          ) : (
            <div className="w-[64px] h-[64px] rounded-lg bg-black border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-xl font-bold">
              —
            </div>
          )}
        </div>
      </div>

      {/* TIJDLĲN: Direct en rustig */}
      <div className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-md flex-1">
        {/* [O-20] Rijrichting nog onbekend */}
        {!matchedPosition.carriageway ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-base font-bold text-slate-200 mb-1">Rijrichting nog onbekend</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Rijd circa 300 meter om automatisch te bepalen of je op de linker- of rechterrijbaan rijdt.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800/80">
            {timelineItems.map(item => {
              // Stip kleuren [O-17]
              const dotClass = 
                item.dotColor === 'red' ? 'bg-rose-500 ring-rose-950' :
                item.dotColor === 'orange' ? 'bg-amber-500 ring-amber-950' :
                item.dotColor === 'yellow' ? 'bg-yellow-400 ring-yellow-950' :
                'bg-emerald-500 ring-emerald-950';

              return (
                <div key={item.id} className="relative flex items-start gap-3.5 transition-all">
                  {/* Gekleurde stip op de lijn [O-17] */}
                  <div
                    className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full ring-4 ${dotClass} z-10`}
                  />

                  {/* Links: Afstand [O-10] */}
                  <div className="w-16 shrink-0 pt-0.5">
                    <span className="text-xs font-black text-slate-200 font-mono block">
                      {formatDutchDistance(item.distanceMeters)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {formatDutchKm(item.km)}
                    </span>
                  </div>

                  {/* Rechts: Matrixportaal of Filemelding */}
                  <div className="flex-1 min-w-0">
                    {/* 1. Portaal met matrixborden: ALTIJD STRIKT IN ÉÉN RIJ & automatisch kleiner bij meerdere stroken */}
                    {item.type === 'portal' && item.portal && (
                      <div>
                        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5 max-w-full">
                          {item.portal.signs.map((sign, sIdx) => (
                            <div key={sIdx} className="shrink-0">
                              <MatrixSign sign={sign} size={getAdaptiveSignSize(item.portal!.signs.length)} />
                            </div>
                          ))}
                        </div>
                        {/* [O-13] Indien opeenvolgende portalen samengevoegd zijn */}
                        {item.endKm && (
                          <div className="text-xs text-slate-400 font-medium mt-1 font-mono">
                            t/m {formatDutchKm(item.endKm)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Filevak (<50 km/u) */}
                    {item.type === 'traffic_jam' && item.jam && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/40 text-slate-100">
                        <p className="text-sm font-bold tracking-tight text-rose-300 mb-0.5">
                          {item.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          tussen {item.jam.fromLandmark} en {item.jam.toLandmark}
                        </p>
                      </div>
                    )}

                    {/* 3. Vrije baan [O-19] */}
                    {item.type === 'free_road' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-sm font-bold block">Vrije baan</span>
                          <span className="text-xs text-emerald-400/80">
                            Geen matrixborden of file vooruit
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
