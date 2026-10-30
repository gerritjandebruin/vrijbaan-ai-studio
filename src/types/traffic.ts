/**
 * Vrijbaan Types & Domeinmodellen
 * Gebaseerd op de Vrijbaan-specificatie (Gerrit Jan de Bruin)
 */

export type RoadType = 'A' | 'N';
export type Carriageway = 'Re' | 'Li'; // Rechterrijbaan (oplopend km) of Linkerrijbaan (aflopend km)

export type MatrixSignSymbol = 
  | 'speed_50'
  | 'speed_70'
  | 'speed_80'
  | 'speed_90'
  | 'speed_100'
  | 'red_cross'      // Rood kruis (X)
  | 'merge_left'     // Invoegpijl naar links (↙)
  | 'merge_right'    // Invoegpijl naar rechts (↘)
  | 'end_restriction' // Einde-schijf (witte schijf met diagonale strepen)
  | 'blank';         // Uitgeschakeld / leeg

export interface MatrixSign {
  lane: number;           // Strooknummer (1 = meest links [G-8])
  symbol: MatrixSignSymbol;
  speedValue?: number;    // bijv. 50, 70, 80, 90, 100
  flashers?: boolean;     // eventuele knipperlichten bij waarschuwing
}

export interface MatrixPortal {
  id: string;
  road: string;           // bijv. "A2"
  carriageway: Carriageway;
  km: number;             // bijv. 34.8
  lat: number;
  lon: number;
  signs: MatrixSign[];    // Geordend van strook 1 (links) naar rechts
  endKm?: number;         // Indien opeenvolgende portalen identiek zijn samengevoegd [O-13]
}

export interface MeasurementPoint {
  id: string;
  road: string;
  carriageway: Carriageway;
  km: number;
  lat: number;
  lon: number;
  speedKmH: number | null; // Gewogen gemiddelde over stroken [G-7]
  flowVehiclesPerHour: number;
  timestamp: string;
  error?: boolean;
}

export type LandmarkType = 'knooppunt' | 'afrit' | 'kruising' | 'tunnel' | 'brug';

export interface VILDLandmark {
  id: string;
  road: string;
  km: number;
  name: string;
  type: LandmarkType;
  exitNumber?: string;   // bijv. "1", "2a"
  directionRe?: string;  // Richtingnaam oplopende kilometrering [O-2]
  directionLi?: string;  // Richtingnaam aflopende kilometrering
}

export interface TrafficJam {
  id: string;
  road: string;
  carriageway: Carriageway;
  direction: string;
  startKm: number;
  endKm: number;
  lengthKm: number;
  avgSpeedKmH: number;
  minSpeedKmH: number;
  fromLandmark: string;
  toLandmark: string;
  closedLanesWarning?: string; // [V-5] bijv. "Strook 1 en 2 dicht in of na deze file"
}

export interface LaneClosure {
  id: string;
  road: string;
  carriageway: Carriageway;
  direction: string;
  km: number;
  landmark: string;
  closedLanes: number[]; // bijv. [1, 2]
  signs: MatrixSign[];   // max 4 getoond [V-7]
}

export interface SpeedSegment {
  index: number;
  fromKm: number;
  toKm: number;
  avgSpeed: number | null; // null = grijs
  color: 'red' | 'orange' | 'green' | 'gray';
}

export type TimelineItemType = 
  | 'current_position'
  | 'portal'
  | 'traffic_jam'
  | 'slow_traffic'
  | 'free_road';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  distanceMeters: number; // Afstand tot huidige positie
  km: number;
  endKm?: number;
  portal?: MatrixPortal;
  jam?: TrafficJam;
  description?: string;
  dotColor: 'red' | 'orange' | 'yellow' | 'green' | 'gray'; // [O-17]
  isHere?: boolean; // [O-10] "Hier"
}

export interface UserPosition {
  lat: number;
  lon: number;
  accuracy: number;
  speedMps: number | null;
  heading: number | null;
  timestamp: number;
}

export interface MatchedRoadPosition {
  road: string;           // bijv. "A2"
  roadType: RoadType;     // 'A' of 'N'
  km: number;             // Geïnterpoleerd met 1 decimaal [P-3]
  carriageway: Carriageway | null; // 'Re' of 'Li' of null indien nog niet bekend [O-20]
  distanceToRoadMeters: number;
  directionName: string;  // uit VILD of "rechterrijbaan"/"linkerrijbaan" [O-2]
  lastLandmark: string;   // [O-3]
  nextLandmark: string;   // [O-3]
  lastPassedPortalSpeed: number | null; // [O-4]
  currentMeasuredSpeed: number | null;  // [O-5]
}

export interface AppSettings {
  useLocation: boolean;
  refreshInterval: 'off' | '1m' | '2m' | '5m';
  lookaheadKm: 10 | 20 | 30; // [O-7]
  simulationRoute: 'none' | 'a2_utrecht' | 'a10_ring' | 'a12_denhaag';
  showPositionOnScreen: boolean; // Optie om km-positie op het scherm te tonen
  audioAlerts: boolean; // Subtiele audio- en trilwaarschuwing bij rood kruis of AID-filekop
}

export interface SessionStats {
  bytesDownloaded: number; // in bytes [I-3]
  lastFetchTime: number | null;
  lastSuccessfulFetch: number | null;
  lastFetchFailed: boolean;
  activeMeasurementPointsCount: number;
  activeMatrixSignsCount: number;
}
