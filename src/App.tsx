/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { OnderwegView } from './views/OnderwegView';
import { OverzichtView } from './views/OverzichtView';
import { InstellingenView } from './views/InstellingenView';
import { useGeolocation } from './hooks/useGeolocation';
import { useWakeLock } from './hooks/useWakeLock';
import { trafficDataService } from './services/trafficDataService';
import { AppSettings, SessionStats } from './types/traffic';
import { WifiOff } from 'lucide-react';

const STORAGE_KEY = 'vrijbaan_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  useLocation: true,
  refreshInterval: '1m',
  lookaheadKm: 20,
  simulationRoute: 'a2_utrecht', // Begint standaard op A2 ritsimulatie zodat gebruiker direct iets ziet!
  showPositionOnScreen: false, // Standaard uit voor een ultra-cleane kopkaart
  audioAlerts: true // Subtiele audio/tril waarschuwing bij naderen van rood kruis of AID-filekop
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('onderweg');

  // Laad instellingen uit localStorage [I-5]
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Bewaar instellingen [I-5]
  const handleSettingsChange = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Geolocation & Ritsimulatie [P-1..P-7]
  const {
    matchedPosition,
    permissionState,
    requestLocation,
    isSimulating,
    simKm,
    setManualKm,
    isSimPlaying,
    toggleSimPlaying,
    simSpeedKmH,
    setSimSpeedKmH
  } = useGeolocation(settings.useLocation, settings.simulationRoute);

  // Screen Wake Lock [O-21]: Scherm blijft aan zolang Onderweg open is en locatie aan staat
  const wakeLockActive = activeTab === 'onderweg' && settings.useLocation;
  useWakeLock(wakeLockActive);

  // Sessie statistieken & verversen
  const [sessionStats, setSessionStats] = useState<SessionStats>(() => 
    trafficDataService.getSessionStats()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Luister naar updates vanuit de data service
  useEffect(() => {
    return trafficDataService.subscribe(() => {
      setSessionStats(trafficDataService.getSessionStats());
    });
  }, []);

  // Verversingsfunctie
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await trafficDataService.refreshData();
    } catch {
      trafficDataService.setFetchFailed(true);
    } finally {
      setIsRefreshing(false);
      setSessionStats(trafficDataService.getSessionStats());
    }
  }, []);

  // [S-2, S-3] Automatisch verversen zolang app in beeld is
  useEffect(() => {
    if (settings.refreshInterval === 'off') return;

    let intervalMs = 60000; // 1m
    if (settings.refreshInterval === '2m') intervalMs = 120000;
    if (settings.refreshInterval === '5m') intervalMs = 300000;

    const timer = setInterval(() => {
      // [S-3] Alleen zolang de app in beeld is
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.refreshInterval, handleRefresh]);

  // Eerste verversing bij openen [S-2]
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-amber-500 selection:text-black">
      {/* Offline waarschuwing banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-black py-1 px-4 text-xs font-bold text-center flex items-center justify-center gap-1.5 z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Geen internetverbinding — offline modus actief</span>
        </div>
      )}

      {/* Kopbalk [K-1, K-2] */}
      <TopBar
        lastUpdated={sessionStats.lastFetchTime}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        fetchFailed={sessionStats.lastFetchFailed}
      />

      {/* Hoofdinhoud per tab [K-3] */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'onderweg' && (
          <OnderwegView
            matchedPosition={matchedPosition}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            permissionState={permissionState}
            onRequestLocation={requestLocation}
            isSimulating={isSimulating}
            simKm={simKm}
            onSimKmChange={setManualKm}
            isSimPlaying={isSimPlaying}
            onToggleSimPlaying={toggleSimPlaying}
            simSpeedKmH={simSpeedKmH}
            onSimSpeedChange={setSimSpeedKmH}
          />
        )}

        {activeTab === 'overzicht' && (
          <OverzichtView />
        )}

        {activeTab === 'instellingen' && (
          <InstellingenView
            settings={settings}
            onSettingsChange={handleSettingsChange}
            sessionStats={sessionStats}
          />
        )}
      </main>

      {/* Onderbalk Navigatie [K-3] */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
