/**
 * GPS Wegpassing en Richtingbepaling
 * Conform de specificaties [P-1] t/m [P-7]
 */

import { DUTCH_ROAD_WAYPOINTS, RoadWayPoint } from './roadNetwork';
import { MatchedRoadPosition, Carriageway, RoadType } from '../types/traffic';
import { getSurroundingLandmarks } from './vildData';

// Haversine formule voor afstand in meters tussen twee coördinaten
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Aardstraal in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Berekent de kompasrichting (bearing) in graden (0-360) van punt A naar B
export function calculateBearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// Geschiedenis van recente GPS posities voor de 300m rijrichting-analyse [P-4, P-5, P-6]
interface PositionHistoryItem {
  lat: number;
  lon: number;
  road: string;
  km: number;
  distanceTraveledMeters: number;
  timestamp: number;
}

class GeoMatcherEngine {
  private history: PositionHistoryItem[] = [];
  private lastRoad: string | null = null;
  private currentCarriageway: Carriageway | null = null;

  /**
   * Projecteert een GPS punt op de dichtstbijzijnde snelweglijn binnen 100 meter [P-2, P-3]
   */
  public matchPosition(
    lat: number,
    lon: number,
    phoneHeading: number | null = null
  ): MatchedRoadPosition | null {
    let closestRoad: string | null = null;
    let closestDist = Infinity;
    let interpolatedKm = 0;
    let segmentBearing = 0;

    // Groepeer waypoints per weg
    const roads = Array.from(new Set(DUTCH_ROAD_WAYPOINTS.map(w => w.road)));

    for (const roadName of roads) {
      const waypoints = DUTCH_ROAD_WAYPOINTS
        .filter(w => w.road === roadName)
        .sort((a, b) => a.km - b.km);

      for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = waypoints[i];
        const p2 = waypoints[i + 1];

        // Lijnsegment tussen p1 en p2
        // We berekenen de projectie van (lat, lon) op segment (p1 -> p2)
        const dx = (p2.lon - p1.lon) * Math.cos((p1.lat + p2.lat) * Math.PI / 360);
        const dy = p2.lat - p1.lat;
        const segmentLengthSq = dx * dx + dy * dy;

        let t = 0;
        if (segmentLengthSq > 0) {
          const px = (lon - p1.lon) * Math.cos((p1.lat + p2.lat) * Math.PI / 360);
          const py = lat - p1.lat;
          t = Math.max(0, Math.min(1, (px * dx + py * dy) / segmentLengthSq));
        }

        const projLat = p1.lat + t * (p2.lat - p1.lat);
        const projLon = p1.lon + t * (p2.lon - p1.lon);
        const dist = calculateDistanceMeters(lat, lon, projLat, projLon);

        if (dist < closestDist) {
          closestDist = dist;
          closestRoad = roadName;
          interpolatedKm = p1.km + t * (p2.km - p1.km); // [P-3]
          segmentBearing = calculateBearingDeg(p1.lat, p1.lon, p2.lat, p2.lon);
        }
      }
    }

    // [P-7] Ben je verder dan 100 m van elke weglijn, dan meldt de app "Geen snelweg in de buurt"
    if (!closestRoad || closestDist > 100) {
      return null;
    }

    // [P-6] Wissel je van weg, dan begint de richtingbepaling opnieuw
    if (this.lastRoad && this.lastRoad !== closestRoad) {
      this.history = [];
      this.currentCarriageway = null;
    }
    this.lastRoad = closestRoad;

    // Update positiegeschiedenis voor 300m hectometrering tracking [P-4, P-5]
    this.updateTracking(lat, lon, closestRoad, interpolatedKm, phoneHeading, segmentBearing);

    const roadType: RoadType = closestRoad.startsWith('A') ? 'A' : 'N';
    const landmarks = getSurroundingLandmarks(closestRoad, interpolatedKm, this.currentCarriageway);

    return {
      road: closestRoad,
      roadType,
      km: Math.round(interpolatedKm * 10) / 10,
      carriageway: this.currentCarriageway,
      distanceToRoadMeters: Math.round(closestDist),
      directionName: landmarks.directionName,
      lastLandmark: landmarks.lastLandmark,
      nextLandmark: landmarks.nextLandmark,
      lastPassedPortalSpeed: null, // Wordt gevuld door TrafficService
      currentMeasuredSpeed: null   // Wordt gevuld door TrafficService
    };
  }

  /**
   * Bepaalt rijrichting (Rechterrijbaan vs Linkerrijbaan) conform [P-4, P-5]
   * - Loopt de hectometrering 300m op -> Rechterrijbaan ('Re')
   * - Loopt die 300m af -> Linkerrijbaan ('Li')
   * - Tot die 300m gereden is -> kompasrichting van de telefoon
   * - Sta je stil -> laatste richting blijft staan
   */
  private updateTracking(
    lat: number,
    lon: number,
    road: string,
    km: number,
    phoneHeading: number | null,
    segmentBearing: number
  ) {
    const now = Date.now();
    let distanceSinceLast = 0;

    if (this.history.length > 0) {
      const prev = this.history[this.history.length - 1];
      distanceSinceLast = calculateDistanceMeters(prev.lat, prev.lon, lat, lon);
    }

    this.history.push({
      lat,
      lon,
      road,
      km,
      distanceTraveledMeters: distanceSinceLast,
      timestamp: now
    });

    // Beperk geschiedenis tot de afgelopen 60 seconden of 1000m
    if (this.history.length > 30) {
      this.history.shift();
    }

    // Bereken totale afgelegde afstand in geschiedenis
    let totalDist = 0;
    for (let i = 1; i < this.history.length; i++) {
      totalDist += this.history[i].distanceTraveledMeters;
    }

    // [P-4] Hebben we minstens 300 meter gereden?
    if (totalDist >= 300 && this.history.length >= 3) {
      const oldest = this.history[0];
      const newest = this.history[this.history.length - 1];
      const deltaKm = newest.km - oldest.km;

      if (deltaKm > 0.15) {
        this.currentCarriageway = 'Re'; // Oplopend = Rechterrijbaan
      } else if (deltaKm < -0.15) {
        this.currentCarriageway = 'Li'; // Aflopend = Linkerrijbaan
      }
    } else if (this.currentCarriageway === null && phoneHeading !== null) {
      // [P-5] Tot je die 300m gereden hebt, geldt de kompasrichting van de telefoon
      // Hoekverschil tussen kompas en de richting van oplopende hectometrering
      const angleDiff = Math.abs((phoneHeading - segmentBearing + 540) % 360 - 180);
      if (angleDiff < 80) {
        this.currentCarriageway = 'Re';
      } else if (angleDiff > 100) {
        this.currentCarriageway = 'Li';
      }
    }
  }

  public reset() {
    this.history = [];
    this.lastRoad = null;
    this.currentCarriageway = null;
  }

  public setManualCarriageway(carriageway: Carriageway) {
    this.currentCarriageway = carriageway;
  }
}

export const geoMatcher = new GeoMatcherEngine();
