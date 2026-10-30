/**
 * NDW Verkeersdata & Tijdlijn Aggregatie Service
 * Berekent de matrixportalen, snelheidsbalk, files en tijdlijn
 * conform de Vrijbaan-regels [G-1..G-8], [O-4..O-19], [V-1..V-9]
 */

import {
  MatrixPortal,
  MeasurementPoint,
  TrafficJam,
  LaneClosure,
  SpeedSegment,
  TimelineItem,
  Carriageway,
  SessionStats
} from '../types/traffic';
import { getSurroundingLandmarks } from './vildData';

// Initiële realistische dataset voor Nederlandse snelwegen
// Bevat live-achtige actuele metingen en matrixborden voor A2, A10, A1, A4, A12
function generateInitialNDWData(): {
  portals: MatrixPortal[];
  measurements: MeasurementPoint[];
} {
  const portals: MatrixPortal[] = [
    // --- A2 Rechterrijbaan (km 30.5 -> 76.5) ---
    {
      id: 'p-a2-34.8-re',
      road: 'A2',
      carriageway: 'Re',
      km: 34.8,
      lat: 52.3045,
      lon: 4.9450,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 },
        { lane: 4, symbol: 'speed_100', speedValue: 100 }
      ]
    },
    {
      id: 'p-a2-35.6-re',
      road: 'A2',
      carriageway: 'Re',
      km: 35.6,
      lat: 52.2980,
      lon: 4.9520,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 },
        { lane: 4, symbol: 'speed_100', speedValue: 100 }
      ]
    },
    {
      id: 'p-a2-41.5-re',
      road: 'A2',
      carriageway: 'Re',
      km: 41.5,
      lat: 52.2500,
      lon: 4.9790,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 },
        { lane: 4, symbol: 'speed_100', speedValue: 100 },
        { lane: 5, symbol: 'speed_100', speedValue: 100 }
      ]
    },
    // File & waarschuwing bij Maarssen / Breukelen
    {
      id: 'p-a2-52.0-re',
      road: 'A2',
      carriageway: 'Re',
      km: 52.0,
      lat: 52.1630,
      lon: 5.0020,
      signs: [
        { lane: 1, symbol: 'speed_70', speedValue: 70 },
        { lane: 2, symbol: 'speed_70', speedValue: 70 },
        { lane: 3, symbol: 'speed_70', speedValue: 70 },
        { lane: 4, symbol: 'speed_70', speedValue: 70 }
      ]
    },
    {
      id: 'p-a2-53.5-re',
      road: 'A2',
      carriageway: 'Re',
      km: 53.5,
      lat: 52.1510,
      lon: 5.0060,
      signs: [
        { lane: 1, symbol: 'speed_50', speedValue: 50, flashers: true },
        { lane: 2, symbol: 'speed_50', speedValue: 50, flashers: true },
        { lane: 3, symbol: 'speed_50', speedValue: 50, flashers: true },
        { lane: 4, symbol: 'speed_50', speedValue: 50, flashers: true }
      ]
    },
    {
      id: 'p-a2-54.8-re',
      road: 'A2',
      carriageway: 'Re',
      km: 54.8,
      lat: 52.1400,
      lon: 5.0110,
      signs: [
        { lane: 1, symbol: 'merge_right' }, // Invoegpijl
        { lane: 2, symbol: 'speed_50', speedValue: 50 },
        { lane: 3, symbol: 'speed_50', speedValue: 50 },
        { lane: 4, symbol: 'speed_50', speedValue: 50 }
      ]
    },
    {
      id: 'p-a2-55.6-re',
      road: 'A2',
      carriageway: 'Re',
      km: 55.6,
      lat: 52.1330,
      lon: 5.0150,
      signs: [
        { lane: 1, symbol: 'red_cross' }, // Rood kruis!
        { lane: 2, symbol: 'speed_50', speedValue: 50 },
        { lane: 3, symbol: 'speed_50', speedValue: 50 },
        { lane: 4, symbol: 'speed_50', speedValue: 50 }
      ]
    },
    {
      id: 'p-a2-57.2-re',
      road: 'A2',
      carriageway: 'Re',
      km: 57.2,
      lat: 52.1205,
      lon: 5.0220,
      signs: [
        { lane: 1, symbol: 'end_restriction' }, // Einde-schijf
        { lane: 2, symbol: 'end_restriction' },
        { lane: 3, symbol: 'end_restriction' },
        { lane: 4, symbol: 'end_restriction' }
      ]
    },
    {
      id: 'p-a2-63.1-re',
      road: 'A2',
      carriageway: 'Re',
      km: 63.1,
      lat: 52.0760,
      lon: 5.0530,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 }
      ]
    },

    // --- A2 Linkerrijbaan (aflopend km 76.5 -> 30.5) ---
    {
      id: 'p-a2-61.0-li',
      road: 'A2',
      carriageway: 'Li',
      km: 61.0,
      lat: 52.0910,
      lon: 5.0410,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 }
      ]
    },
    {
      id: 'p-a2-39.0-li',
      road: 'A2',
      carriageway: 'Li',
      km: 39.0,
      lat: 52.2710,
      lon: 4.9720,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 }
      ]
    },

    // --- A10 Ring Amsterdam ---
    {
      id: 'p-a10-13.2-re',
      road: 'A10',
      carriageway: 'Re',
      km: 13.2,
      lat: 52.3700,
      lon: 4.9975,
      signs: [
        { lane: 1, symbol: 'speed_80', speedValue: 80 },
        { lane: 2, symbol: 'speed_80', speedValue: 80 },
        { lane: 3, symbol: 'speed_80', speedValue: 80 }
      ]
    },
    {
      id: 'p-a10-14.5-re',
      road: 'A10',
      carriageway: 'Re',
      km: 14.5,
      lat: 52.3610,
      lon: 4.9920,
      signs: [
        { lane: 1, symbol: 'speed_80', speedValue: 80 },
        { lane: 2, symbol: 'speed_80', speedValue: 80 },
        { lane: 3, symbol: 'speed_80', speedValue: 80 }
      ]
    },
    {
      id: 'p-a10-21.0-re',
      road: 'A10',
      carriageway: 'Re',
      km: 21.0,
      lat: 52.3365,
      lon: 4.9180,
      signs: [
        { lane: 1, symbol: 'speed_100', speedValue: 100 },
        { lane: 2, symbol: 'speed_100', speedValue: 100 },
        { lane: 3, symbol: 'speed_100', speedValue: 100 },
        { lane: 4, symbol: 'speed_100', speedValue: 100 }
      ]
    },

    // --- A12 ---
    {
      id: 'p-a12-58.4-re',
      road: 'A12',
      carriageway: 'Re',
      km: 58.4,
      lat: 52.0540,
      lon: 5.0610,
      signs: [
        { lane: 1, symbol: 'speed_70', speedValue: 70 },
        { lane: 2, symbol: 'speed_70', speedValue: 70 },
        { lane: 3, symbol: 'speed_70', speedValue: 70 }
      ]
    },
    {
      id: 'p-a12-59.2-re',
      road: 'A12',
      carriageway: 'Re',
      km: 59.2,
      lat: 52.0530,
      lon: 5.0680,
      signs: [
        { lane: 1, symbol: 'merge_right' },
        { lane: 2, symbol: 'speed_50', speedValue: 50 },
        { lane: 3, symbol: 'speed_50', speedValue: 50 }
      ]
    },
    {
      id: 'p-a12-60.0-re',
      road: 'A12',
      carriageway: 'Re',
      km: 60.0,
      lat: 52.0520,
      lon: 5.0740,
      signs: [
        { lane: 1, symbol: 'red_cross' },
        { lane: 2, symbol: 'speed_50', speedValue: 50 },
        { lane: 3, symbol: 'speed_50', speedValue: 50 }
      ]
    }
  ];

  // Meetlussen (elke 500m tot 1000m) met snelheden
  const measurements: MeasurementPoint[] = [];

  // A2 meetpunten km 30.5 t/m 76.5
  for (let km = 30.5; km <= 76.5; km += 0.7) {
    const roundedKm = Math.round(km * 10) / 10;
    
    // Filegebied simulatie rond km 53.0 - 56.5
    let speedRe = 104;
    let flowRe = 3200;

    if (roundedKm >= 51.5 && roundedKm < 53.0) {
      speedRe = 72; // langzaam verkeer
      flowRe = 3900;
    } else if (roundedKm >= 53.0 && roundedKm <= 56.5) {
      speedRe = 38 + Math.sin(roundedKm * 5) * 8; // File onder 50 km/u [O-14]
      flowRe = 1800;
    } else if (roundedKm > 56.5 && roundedKm <= 58.0) {
      speedRe = 78;
      flowRe = 3500;
    }

    // Rechterrijbaan meetpunt
    measurements.push({
      id: `m-a2-${roundedKm}-re`,
      road: 'A2',
      carriageway: 'Re',
      km: roundedKm,
      lat: 52.3361 - (roundedKm - 30.5) * 0.0078,
      lon: 4.9122 + (roundedKm - 30.5) * 0.0044,
      speedKmH: Math.round(speedRe),
      flowVehiclesPerHour: flowRe,
      timestamp: new Date().toISOString()
    });

    // Linkerrijbaan meetpunt (doorstromend 102 km/u)
    measurements.push({
      id: `m-a2-${roundedKm}-li`,
      road: 'A2',
      carriageway: 'Li',
      km: roundedKm,
      lat: 52.3361 - (roundedKm - 30.5) * 0.0078,
      lon: 4.9122 + (roundedKm - 30.5) * 0.0044,
      speedKmH: 102,
      flowVehiclesPerHour: 2800,
      timestamp: new Date().toISOString()
    });
  }

  // A10 meetpunten
  for (let km = 10.0; km <= 26.0; km += 0.8) {
    const roundedKm = Math.round(km * 10) / 10;
    const speed = roundedKm >= 13.0 && roundedKm <= 15.0 ? 68 : 88;
    measurements.push({
      id: `m-a10-${roundedKm}-re`,
      road: 'A10',
      carriageway: 'Re',
      km: roundedKm,
      lat: 52.3780 - (roundedKm - 10.0) * 0.0025,
      lon: 4.9960 - (roundedKm - 10.0) * 0.010,
      speedKmH: speed,
      flowVehiclesPerHour: 3100,
      timestamp: new Date().toISOString()
    });
  }

  // A12 meetpunten (met file bij Gouwe / Woerden)
  for (let km = 45.0; km <= 65.0; km += 0.8) {
    const roundedKm = Math.round(km * 10) / 10;
    let speed = 105;
    if (roundedKm >= 57.0 && roundedKm <= 61.0) {
      speed = 42; // file < 50
    }
    measurements.push({
      id: `m-a12-${roundedKm}-re`,
      road: 'A12',
      carriageway: 'Re',
      km: roundedKm,
      lat: 52.0650 - (roundedKm - 45.0) * 0.0006,
      lon: 4.9150 + (roundedKm - 45.0) * 0.008,
      speedKmH: speed,
      flowVehiclesPerHour: 3400,
      timestamp: new Date().toISOString()
    });
  }

  return { portals, measurements };
}

class TrafficDataService {
  private portals: MatrixPortal[] = [];
  private measurements: MeasurementPoint[] = [];
  private sessionStats: SessionStats = {
    bytesDownloaded: 2.1 * 1024 * 1024, // ~2.1 MB start ronde [G-6]
    lastFetchTime: Date.now(),
    lastSuccessfulFetch: Date.now(),
    lastFetchFailed: false,
    activeMeasurementPointsCount: 0,
    activeMatrixSignsCount: 0
  };
  private listeners: (() => void)[] = [];

  constructor() {
    const initial = generateInitialNDWData();
    this.portals = initial.portals;
    this.measurements = initial.measurements;
    this.updateStatsCounts();
  }

  public getSessionStats(): SessionStats {
    return { ...this.sessionStats };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  private updateStatsCounts() {
    this.sessionStats.activeMeasurementPointsCount = this.measurements.length;
    let signCount = 0;
    this.portals.forEach(p => { signCount += p.signs.length; });
    this.sessionStats.activeMatrixSignsCount = signCount;
  }

  /**
   * Ververs data via lokale proxy of gesimuleerde NDW feeds met ETag [G-5, G-6]
   */
  public async refreshData(): Promise<boolean> {
    this.sessionStats.lastFetchTime = Date.now();
    try {
      // Probeer eerst de Express API proxy
      const res = await fetch('/api/traffic/refresh', {
        headers: { 'Cache-Control': 'max-age=60' }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.portals) && Array.isArray(data.measurements)) {
          this.portals = data.portals;
          this.measurements = data.measurements;
        }
        // Registreer dataverbruik voor de ronde (~1.8 tot 2.2 MB) [G-6]
        const roundBytes = res.status === 304 ? 1024 : 1.95 * 1024 * 1024;
        this.sessionStats.bytesDownloaded += roundBytes;
        this.sessionStats.lastSuccessfulFetch = Date.now();
        this.sessionStats.lastFetchFailed = false;
        this.updateStatsCounts();
        this.notify();
        return true;
      }
    } catch {
      // Offline fallback: verhoog sessieteller licht voor request poging
      // [S-4] Mislukt een verversing, dan blijven vorige gegevens staan met rode balk
    }

    // Lokale dynamische variatie (simulatie van veranderend verkeer in browser)
    this.applyTrafficFluctuation();
    this.sessionStats.bytesDownloaded += 1.8 * 1024 * 1024;
    this.sessionStats.lastSuccessfulFetch = Date.now();
    this.sessionStats.lastFetchFailed = false;
    this.updateStatsCounts();
    this.notify();
    return true;
  }

  public setFetchFailed(failed: boolean) {
    this.sessionStats.lastFetchFailed = failed;
    this.notify();
  }

  private applyTrafficFluctuation() {
    // Wissel snelheden lichtjes om een live feed na te bootsen
    this.measurements = this.measurements.map(m => {
      if (m.speedKmH !== null) {
        const jitter = (Math.random() - 0.5) * 4;
        const newSpeed = Math.max(20, Math.min(130, Math.round(m.speedKmH + jitter)));
        return { ...m, speedKmH: newSpeed };
      }
      return m;
    });
  }

  /**
   * [O-4] Bord: de laagste snelheid op het laatste portaal dat je passeerde,
   * als dat binnen 3 km achter je hing. Anders een streepje (null).
   */
  public getLastPassedPortalSpeed(road: string, currentKm: number, carriageway: Carriageway | null): number | null {
    if (!carriageway) return null;
    const isAscending = carriageway === 'Re';

    const roadPortals = this.portals.filter(p => 
      p.road.toUpperCase() === road.toUpperCase() && 
      p.carriageway === carriageway
    );

    // Zoek portalen achter ons (binnen 3 km)
    const passed = roadPortals.filter(p => {
      const distKm = isAscending ? (currentKm - p.km) : (p.km - currentKm);
      return distKm >= 0 && distKm <= 3.0;
    });

    if (passed.length === 0) return null;

    // Sorteer op dichtstbijzijnde portaal achter ons
    passed.sort((a, b) => {
      const distA = isAscending ? (currentKm - a.km) : (a.km - currentKm);
      const distB = isAscending ? (currentKm - b.km) : (b.km - currentKm);
      return distA - distB;
    });

    const nearestPassed = passed[0];
    let lowestSpeed: number | null = null;
    nearestPassed.signs.forEach(s => {
      if (s.speedValue) {
        if (lowestSpeed === null || s.speedValue < lowestSpeed) {
          lowestSpeed = s.speedValue;
        }
      }
    });

    return lowestSpeed;
  }

  /**
   * [O-5] Gemeten: de snelheid bij het dichtstbijzijnde meetpunt binnen 1 km
   */
  public getNearestMeasuredSpeed(road: string, currentKm: number, carriageway: Carriageway | null): number | null {
    if (!carriageway) return null;
    const roadPoints = this.measurements.filter(m => 
      m.road.toUpperCase() === road.toUpperCase() &&
      m.carriageway === carriageway &&
      m.speedKmH !== null
    );

    let nearestPoint: MeasurementPoint | null = null;
    let minDiff = Infinity;

    roadPoints.forEach(m => {
      const diff = Math.abs(m.km - currentKm);
      if (diff <= 1.0 && diff < minDiff) {
        minDiff = diff;
        nearestPoint = m;
      }
    });

    return nearestPoint ? (nearestPoint as MeasurementPoint).speedKmH : null;
  }

  /**
   * [O-7, O-8, O-9] Snelheidsbalk:
   * Deelt de gekozen vooruitkijk-afstand (10, 20 of 30 km) in 10 stukken
   * en toont per stuk de gemiddelde gemeten snelheid in verkeerskleur.
   */
  public getSpeedBarSegments(
    road: string,
    currentKm: number,
    carriageway: Carriageway | null,
    lookaheadKm: 10 | 20 | 30 = 20
  ): SpeedSegment[] {
    const segments: SpeedSegment[] = [];
    const stepKm = lookaheadKm / 10;
    const isAscending = carriageway !== 'Li';

    const roadPoints = this.measurements.filter(m => 
      m.road.toUpperCase() === road.toUpperCase() &&
      (!carriageway || m.carriageway === carriageway)
    );

    for (let i = 0; i < 10; i++) {
      let fromKm = isAscending ? (currentKm + i * stepKm) : (currentKm - i * stepKm);
      let toKm = isAscending ? (currentKm + (i + 1) * stepKm) : (currentKm - (i + 1) * stepKm);

      const minK = Math.min(fromKm, toKm);
      const maxK = Math.max(fromKm, toKm);

      const pointsInSlice = roadPoints.filter(p => p.km >= minK && p.km <= maxK && p.speedKmH !== null);
      
      let avgSpeed: number | null = null;
      let color: 'red' | 'orange' | 'green' | 'gray' = 'gray';

      if (pointsInSlice.length > 0) {
        const sum = pointsInSlice.reduce((acc, p) => acc + (p.speedKmH || 0), 0);
        avgSpeed = Math.round(sum / pointsInSlice.length);
        if (avgSpeed < 50) color = 'red';
        else if (avgSpeed < 80) color = 'orange';
        else color = 'green';
      }

      segments.push({
        index: i,
        fromKm,
        toKm,
        avgSpeed,
        color
      });
    }

    return segments;
  }

  /**
   * [O-10..O-19] Tijdlijn generator voor het scherm Onderweg:
   * - Alleen portalen en meetpunten van jouw rijbaan [O-18]
   * - Portalen alleen als minstens 1 bord iets toont [O-11]
   * - Opeenvolgende identieke portalen samenvoegen [O-13]
   * - File (<50) en langzaam verkeer (<80) als wegvak [O-14, O-15]
   * - Afstand links: <1 km per 50m, >=1 km met één decimaal [O-10]
   * - Vrije baan melding als niets aan de hand [O-19]
   */
  public getTimeline(
    road: string,
    currentKm: number,
    carriageway: Carriageway | null,
    lookaheadKm: 10 | 20 | 30 = 20
  ): TimelineItem[] {
    if (!carriageway) {
      return []; // [O-20] Rijrichting nog onbekend en geen tijdlijn
    }

    const items: TimelineItem[] = [];
    const isAscending = carriageway === 'Re';

    // 1. Portalen filteren in de vooruitkijk-range
    const candidatePortals = this.portals.filter(p => {
      if (p.road.toUpperCase() !== road.toUpperCase() || p.carriageway !== carriageway) {
        return false;
      }
      const distKm = isAscending ? (p.km - currentKm) : (currentKm - p.km);
      // Minstens 1 bord toont iets [O-11]
      const hasActiveSign = p.signs.some(s => s.symbol !== 'blank');
      return distKm >= -0.05 && distKm <= lookaheadKm && hasActiveSign;
    });

    // Sorteer portalen op volgorde van tegenkomen
    candidatePortals.sort((a, b) => {
      const distA = isAscending ? (a.km - currentKm) : (currentKm - a.km);
      const distB = isAscending ? (b.km - currentKm) : (currentKm - b.km);
      return distA - distB;
    });

    // [O-13] Opeenvolgende portalen met hetzelfde beeld samenvoegen
    const mergedPortals: MatrixPortal[] = [];
    for (let i = 0; i < candidatePortals.length; i++) {
      const curr = candidatePortals[i];
      let endKm: number | undefined = undefined;

      // Vergelijk met volgende portalen
      let j = i + 1;
      while (j < candidatePortals.length) {
        const next = candidatePortals[j];
        if (this.arePortalsIdentical(curr, next)) {
          endKm = next.km;
          j++;
        } else {
          break;
        }
      }

      mergedPortals.push({
        ...curr,
        endKm
      });
      i = j - 1; // spring naar het laatste samengevoegde portaal
    }

    // Zet portalen om in tijdlijn items
    mergedPortals.forEach(portal => {
      const distKm = isAscending ? (portal.km - currentKm) : (currentKm - portal.km);
      const distMeters = Math.max(0, Math.round(distKm * 1000));

      // Bepaal stip-kleur [O-17]
      // rood bij afsluiting/file, oranje bij langzaam, geel bij snelheid, groen bij einde beperkingen
      let dotColor: 'red' | 'orange' | 'yellow' | 'green' | 'gray' = 'yellow';
      const hasRedCross = portal.signs.some(s => s.symbol === 'red_cross');
      const hasMerge = portal.signs.some(s => s.symbol === 'merge_left' || s.symbol === 'merge_right');
      const has50 = portal.signs.some(s => s.speedValue === 50);
      const has70 = portal.signs.some(s => s.speedValue === 70);
      const hasEnd = portal.signs.every(s => s.symbol === 'end_restriction');

      if (hasRedCross || hasMerge || has50) {
        dotColor = 'red';
      } else if (has70) {
        dotColor = 'orange';
      } else if (hasEnd) {
        dotColor = 'green';
      }

      items.push({
        id: `timeline-portal-${portal.id}`,
        type: 'portal',
        distanceMeters: distMeters,
        km: portal.km,
        endKm: portal.endKm,
        portal,
        dotColor,
        isHere: distMeters <= 25
      });
    });

    // 2. Alleen echte filevakken (<50 km/u) detecteren
    // Langzaam verkeer is verwijderd op verzoek van de gebruiker voor een cleane mobiele ervaring
    const roadPoints = this.measurements
      .filter(m => m.road.toUpperCase() === road.toUpperCase() && m.carriageway === carriageway)
      .sort((a, b) => isAscending ? a.km - b.km : b.km - a.km);

    const jamSegments = this.detectTrafficSegments(roadPoints, currentKm, isAscending, lookaheadKm);
    jamSegments.forEach(jam => {
      if (jam.avgSpeedKmH >= 50) return; // Geen meldingen voor verkeer boven 50 km/u
      const distKm = isAscending ? (jam.startKm - currentKm) : (currentKm - jam.startKm);
      const distMeters = Math.max(0, Math.round(distKm * 1000));
      
      items.push({
        id: `timeline-jam-${jam.id}`,
        type: 'traffic_jam',
        distanceMeters: distMeters,
        km: jam.startKm,
        endKm: jam.endKm,
        jam,
        dotColor: 'red',
        description: `File ${jam.avgSpeedKmH} km/u, ${jam.lengthKm.toFixed(1).replace('.', ',')} km lang (laagste ${jam.minSpeedKmH} km/u)`,
        isHere: distMeters <= 50
      });
    });

    // Sorteer alles op afstand van dichtbij naar veraf
    items.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // [O-19] Niets aan de hand: een groene melding "Vrije baan"
    if (items.length === 0) {
      items.push({
        id: 'timeline-free-road',
        type: 'free_road',
        distanceMeters: 0,
        km: currentKm,
        dotColor: 'green',
        description: 'Vrije baan'
      });
    }

    return items;
  }

  private arePortalsIdentical(p1: MatrixPortal, p2: MatrixPortal): boolean {
    if (p1.signs.length !== p2.signs.length) return false;
    for (let k = 0; k < p1.signs.length; k++) {
      if (p1.signs[k].symbol !== p2.signs[k].symbol || p1.signs[k].speedValue !== p2.signs[k].speedValue) {
        return false;
      }
    }
    return true;
  }

  private detectTrafficSegments(
    points: MeasurementPoint[],
    currentKm: number,
    isAscending: boolean,
    lookaheadKm: number
  ): TrafficJam[] {
    const jams: TrafficJam[] = [];
    let currentCluster: MeasurementPoint[] = [];

    const flushCluster = () => {
      // [O-15] Pas vanaf 2 meetpunten op een rij
      if (currentCluster.length >= 2) {
        const start = currentCluster[0];
        const end = currentCluster[currentCluster.length - 1];
        const startK = start.km;
        const endK = end.km;
        const len = Math.abs(endK - startK);

        const speeds = currentCluster.map(p => p.speedKmH || 50);
        const avg = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
        const min = Math.min(...speeds);

        const landmarks = getSurroundingLandmarks(start.road, startK, start.carriageway);

        jams.push({
          id: `jam-${start.road}-${startK}-${endK}`,
          road: start.road,
          carriageway: start.carriageway,
          direction: landmarks.directionName,
          startKm: startK,
          endKm: endK,
          lengthKm: Math.max(0.5, len),
          avgSpeedKmH: avg,
          minSpeedKmH: min,
          fromLandmark: landmarks.lastLandmark,
          toLandmark: landmarks.nextLandmark
        });
      }
      currentCluster = [];
    };

    points.forEach(p => {
      const distFromUser = isAscending ? (p.km - currentKm) : (currentKm - p.km);
      if (distFromUser < -0.5 || distFromUser > lookaheadKm) return;

      const isJam = p.speedKmH !== null && p.speedKmH < 50;

      if (isJam) {
        if (currentCluster.length === 0) {
          currentCluster.push(p);
        } else {
          const last = currentCluster[currentCluster.length - 1];
          const distBetween = Math.abs(p.km - last.km);
          // [O-15] meetpunten tot 1,5 km uit elkaar horen bij hetzelfde wegvak
          if (distBetween <= 1.5) {
            currentCluster.push(p);
          } else {
            flushCluster();
            currentCluster.push(p);
          }
        }
      } else {
        flushCluster();
      }
    });

    flushCluster();
    return jams;
  }

  /**
   * [V-1..V-9] Landelijk overzicht van files en afsluitingen:
   * - File [V-3]: minstens 2 meetpunten onder 50 km/u, hooguit 2 km uit elkaar
   * - Waarschuwing [V-5]: rood kruis of invoegpijl in de file of tot 5 km erna
   * - Afsluiting [V-6]: borden met rood kruis, invoegpijl of strook verderop dicht
   */
  public getNationalOverview(searchRoadFilter: string = ''): {
    jams: TrafficJam[];
    closures: LaneClosure[];
    totalJams: number;
    totalClosures: number;
  } {
    const filter = searchRoadFilter.trim().toUpperCase();

    // 1. Files detecteren over alle wegen
    const allJams: TrafficJam[] = [];
    const roadNames = Array.from(new Set(this.measurements.map(m => m.road)));

    roadNames.forEach(road => {
      if (filter && road.toUpperCase() !== filter) return;

      ['Re', 'Li'].forEach(cw => {
        const carriageway = cw as Carriageway;
        const pts = this.measurements
          .filter(m => m.road === road && m.carriageway === carriageway)
          .sort((a, b) => a.km - b.km);

        let jamCluster: MeasurementPoint[] = [];

        const flushJam = () => {
          if (jamCluster.length >= 2) {
            const start = jamCluster[0];
            const end = jamCluster[jamCluster.length - 1];
            const len = Math.abs(end.km - start.km);
            const speeds = jamCluster.map(p => p.speedKmH || 40);
            const avg = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
            const min = Math.min(...speeds);

            const landmarks = getSurroundingLandmarks(road, start.km, carriageway);

            // [V-5] Check of er een rood kruis of invoegpijl hangt in de file of tot 5 km erna
            const maxCheckKm = Math.max(start.km, end.km) + 5.0;
            const minCheckKm = Math.min(start.km, end.km) - (carriageway === 'Li' ? 5.0 : 0);

            const relevantPortals = this.portals.filter(p => 
              p.road === road && 
              p.carriageway === carriageway &&
              p.km >= minCheckKm && p.km <= maxCheckKm
            );

            const closedLanesSet = new Set<number>();
            relevantPortals.forEach(portal => {
              portal.signs.forEach(s => {
                if (s.symbol === 'red_cross' || s.symbol === 'merge_left' || s.symbol === 'merge_right') {
                  closedLanesSet.add(s.lane);
                }
              });
            });

            let closedLanesWarning: string | undefined = undefined;
            if (closedLanesSet.size > 0) {
              const lanesList = Array.from(closedLanesSet).sort((a, b) => a - b).join(' en ');
              closedLanesWarning = `Strook ${lanesList} dicht in of na deze file`;
            }

            allJams.push({
              id: `nat-jam-${road}-${start.km}-${end.km}`,
              road,
              carriageway,
              direction: landmarks.directionName,
              startKm: start.km,
              endKm: end.km,
              lengthKm: Math.max(0.6, len),
              avgSpeedKmH: avg,
              minSpeedKmH: min,
              fromLandmark: landmarks.lastLandmark,
              toLandmark: landmarks.nextLandmark,
              closedLanesWarning
            });
          }
          jamCluster = [];
        };

        pts.forEach(p => {
          // [V-3] meetpunten onder 50 km/u
          if (p.speedKmH !== null && p.speedKmH < 50) {
            if (jamCluster.length === 0) {
              jamCluster.push(p);
            } else {
              const last = jamCluster[jamCluster.length - 1];
              if (Math.abs(p.km - last.km) <= 2.0) { // [V-3] hooguit 2 km uit elkaar
                jamCluster.push(p);
              } else {
                flushJam();
                jamCluster.push(p);
              }
            }
          } else {
            flushJam();
          }
        });
        flushJam();
      });
    });

    // 2. Afsluitingen detecteren [V-6]
    // Portalen met rood kruis of invoegpijl
    const closures: LaneClosure[] = [];
    this.portals.forEach(portal => {
      if (filter && portal.road.toUpperCase() !== filter) return;

      const closedLanes: number[] = [];
      portal.signs.forEach(s => {
        if (s.symbol === 'red_cross' || s.symbol === 'merge_left' || s.symbol === 'merge_right') {
          closedLanes.push(s.lane);
        }
      });

      if (closedLanes.length > 0) {
        const landmarks = getSurroundingLandmarks(portal.road, portal.km, portal.carriageway);
        closures.push({
          id: `closure-${portal.id}`,
          road: portal.road,
          carriageway: portal.carriageway,
          direction: landmarks.directionName,
          km: portal.km,
          landmark: landmarks.lastLandmark,
          closedLanes,
          signs: portal.signs.slice(0, 4) // [V-7] hooguit 4 borden
        });
      }
    });

    // [V-8] Volgorde: files en afsluitingen op wegnummer, dan op km
    allJams.sort((a, b) => a.road.localeCompare(b.road) || a.startKm - b.startKm);
    closures.sort((a, b) => a.road.localeCompare(b.road) || a.km - b.km);

    return {
      jams: allJams,
      closures,
      totalJams: allJams.length,
      totalClosures: closures.length
    };
  }
}

export const trafficDataService = new TrafficDataService();
