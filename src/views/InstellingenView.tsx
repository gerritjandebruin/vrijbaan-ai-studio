/**
 * Scherm Instellingen
 * Conform specificaties [I-1] t/m [I-5]
 */

import React from 'react';
import { AppSettings, SessionStats } from '../types/traffic';
import { SIMULATION_ROUTES } from '../services/roadNetwork';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { alertAudioService } from '../services/alertAudio';
import { 
  Compass, 
  RefreshCw, 
  Database, 
  Info, 
  Car, 
  Check, 
  ExternalLink,
  Volume2
} from 'lucide-react';

interface InstellingenViewProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  sessionStats: SessionStats;
}

export const InstellingenView: React.FC<InstellingenViewProps> = ({
  settings,
  onSettingsChange,
  sessionStats
}) => {
  // Dataverbruik berekening [I-2]
  // 1 min: ca. 120 MB/u [G-6]
  // 2 min: ca. 60 MB/u
  // 5 min: ca. 24 MB/u
  // Uit: 0 MB
  const getHourlyDataUsage = (interval: AppSettings['refreshInterval']) => {
    switch (interval) {
      case '1m':
        return 'ca. 120 MB per uur rijden (standaard)';
      case '2m':
        return 'ca. 60 MB per uur rijden';
      case '5m':
        return 'ca. 24 MB per uur rijden';
      case 'off':
      default:
        return 'Alleen handmatig verversen (0 MB automatisch)';
    }
  };

  const formatSessionMB = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1).replace('.', ',')} MB`;
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-xl mx-auto px-4 pt-3 pb-24 gap-4 text-slate-100">
      <h1 className="text-xl font-bold tracking-tight text-white px-1">
        Instellingen
      </h1>

      {/* [I-1] Gebruik mijn locatie */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">
                Gebruik mijn locatie
              </span>
              <span className="text-xs text-slate-400">
                GPS elke 5 seconden of 25 meter [P-1]
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useLocation}
              onChange={e => onSettingsChange({ useLocation: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Optioneel: Toon kilometrering op het scherm */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-white block">
              Toon kilometrering op scherm
            </span>
            <span className="text-xs text-slate-400">
              Toont hectometerpositie en rijbaan in de kopkaart
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPositionOnScreen}
              onChange={e => onSettingsChange({ showPositionOnScreen: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Aanbeveling 5: Audio & trilwaarschuwing bij acute situatie */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">
                Waarschuwingssignaal
              </span>
              <span className="text-xs text-slate-400">
                Zachte dubbele toon en trilling bij rood kruis of filekop
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.audioAlerts}
              onChange={e => onSettingsChange({ audioAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.audioAlerts && (
          <div className="pt-2 border-t border-slate-800/80 flex justify-end">
            <button
              type="button"
              onClick={() => alertAudioService.playWarningChime()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition"
            >
              Test geluid & trilling
            </button>
          </div>
        )}
      </div>

      {/* [I-2] Automatisch verversen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">
              Automatisch verversen
            </span>
            <span className="text-xs text-slate-400">
              {getHourlyDataUsage(settings.refreshInterval)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {(['off', '1m', '2m', '5m'] as const).map(interval => (
            <button
              key={interval}
              onClick={() => onSettingsChange({ refreshInterval: interval })}
              className={`py-2 px-2 text-xs font-semibold rounded-xl transition ${
                settings.refreshInterval === interval
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {interval === 'off' ? 'Uit' : interval}
            </button>
          ))}
        </div>
      </div>

      {/* Ritsimulatie / Demomodus */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">
              Test- & Ritsimulatie
            </span>
            <span className="text-xs text-slate-400">
              Test de tijdlijn en matrixborden vanaf je bureau
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => onSettingsChange({ simulationRoute: 'none' })}
            className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
              settings.simulationRoute === 'none'
                ? 'bg-blue-950/40 border-blue-600 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div>
              <span className="font-bold block text-sm">Alleen echte GPS-positie</span>
              <span className="text-[11px] text-slate-400">Gebruik de live sensor van dit apparaat</span>
            </div>
            {settings.simulationRoute === 'none' && <Check className="w-4 h-4 text-blue-400" />}
          </button>

          {SIMULATION_ROUTES.map(route => (
            <button
              key={route.id}
              onClick={() => onSettingsChange({ simulationRoute: route.id as any })}
              className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                settings.simulationRoute === route.id
                  ? 'bg-blue-950/40 border-blue-600 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="font-bold block text-sm text-slate-100">{route.name}</span>
                <span className="text-[11px] text-slate-400">{route.description}</span>
              </div>
              {settings.simulationRoute === route.id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* [I-3] Dataverbruik van deze sessie */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">
              Dataverbruik
            </span>
            <span className="text-xs text-slate-400">
              Deze sessie: {formatSessionMB(sessionStats.bytesDownloaded)}
            </span>
          </div>
        </div>

        <span className="text-sm font-black text-slate-200 font-mono">
          {formatSessionMB(sessionStats.bytesDownloaded)}
        </span>
      </div>

      {/* PWA Toevoegen aan startscherm optie */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-white block">
            Vrijbaan Installeren
          </span>
          <span className="text-xs text-slate-400">
            Als PWA op je Android- of iOS startscherm
          </span>
        </div>
        <PWAInstallButton />
      </div>

      {/* [I-4] Blok "Over de gegevens" */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-slate-200 text-sm font-bold">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Over de gegevens</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Vrijbaan gebruikt uitsluitend officiële open data van Rijkswaterstaat en de Nationale Databank Wegverkeersgegevens (NDW).
        </p>

        <ul className="text-xs text-slate-400 space-y-2 pt-1 border-t border-slate-800">
          <li className="flex items-start gap-1.5">
            <span className="text-blue-400 font-bold">•</span>
            <span><strong>Matrixsignaalinformatie [G-1]:</strong> Wat elk matrixbord toont per rijstrook en kilometer.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-400 font-bold">•</span>
            <span><strong>trafficspeed [G-2]:</strong> Gemeten gemiddelde snelheden en intensiteiten per minuut.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-400 font-bold">•</span>
            <span><strong>VILD [G-4]:</strong> Ingebouwde database met knooppunten, afritnummers, bruggen en tunnels.</span>
          </li>
        </ul>

        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Versie 1.0 (okt 2026)</span>
          <a
            href="https://opendata.ndw.nu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>opendata.ndw.nu</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
