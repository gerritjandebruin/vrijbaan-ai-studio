/**
 * VILD (VerkeersInformatie Locatie Database) & Plaatsnamen per wegvak
 * Bevat knooppunten, afritten, tunnels, bruggen en richtingen per weg.
 * Conform specificatie [G-4], [O-2], [O-3], [O-3a]
 */

import { VILDLandmark } from '../types/traffic';

export const VILD_LANDMARKS: VILDLandmark[] = [
  // --- A2 --- (Amsterdam Amstel -> Utrecht -> Den Bosch -> Eindhoven)
  { id: 'a2-amstel', road: 'A2', km: 30.5, name: 'Amstel', type: 'knooppunt', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-1', road: 'A2', km: 33.2, name: 'Duivendrecht', type: 'afrit', exitNumber: '1', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-holendrecht', road: 'A2', km: 35.8, name: 'Holendrecht', type: 'knooppunt', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-2', road: 'A2', km: 37.9, name: 'AMC / Amsterdam-Zuidoost', type: 'afrit', exitNumber: '2', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-3', road: 'A2', km: 41.2, name: 'Abcoude', type: 'afrit', exitNumber: '3', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-4', road: 'A2', km: 47.1, name: 'Vinkeveen', type: 'afrit', exitNumber: '4', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-5', road: 'A2', km: 54.0, name: 'Breukelen', type: 'afrit', exitNumber: '5', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-6', road: 'A2', km: 59.8, name: 'Maarssen', type: 'afrit', exitNumber: '6', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-leidscherijntunnel', road: 'A2', km: 62.5, name: 'Leidsche Rijntunnel', type: 'tunnel', directionRe: 'Utrecht', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-7', road: 'A2', km: 64.3, name: 'Utrecht-Centrum', type: 'afrit', exitNumber: '7', directionRe: 'Den Bosch', directionLi: 'Amsterdam' },
  { id: 'a2-oudenrijn', road: 'A2', km: 66.8, name: 'Oudenrijn', type: 'knooppunt', directionRe: 'Den Bosch', directionLi: 'Amsterdam' },
  { id: 'a2-afrit-8', road: 'A2', km: 69.5, name: 'Nieuwegein-Noord', type: 'afrit', exitNumber: '8', directionRe: 'Den Bosch', directionLi: 'Amsterdam' },
  { id: 'a2-lekbrug', road: 'A2', km: 73.1, name: 'Jan Blankenbrug (Lekbrug)', type: 'brug', directionRe: 'Den Bosch', directionLi: 'Utrecht' },
  { id: 'a2-everdingen', road: 'A2', km: 76.5, name: 'Everdingen', type: 'knooppunt', directionRe: 'Den Bosch', directionLi: 'Utrecht' },
  { id: 'a2-afrit-11', road: 'A2', km: 82.4, name: 'Culemborg', type: 'afrit', exitNumber: '11', directionRe: 'Den Bosch', directionLi: 'Utrecht' },
  { id: 'a2-deil', road: 'A2', km: 92.1, name: 'Deil', type: 'knooppunt', directionRe: 'Den Bosch', directionLi: 'Utrecht' },
  { id: 'a2-empel', road: 'A2', km: 114.3, name: 'Empel', type: 'knooppunt', directionRe: 'Eindhoven', directionLi: 'Utrecht' },

  // --- A10 --- (Ring Amsterdam)
  { id: 'a10-coenplein', road: 'A10', km: 0.0, name: 'Coenplein', type: 'knooppunt', directionRe: 'Zaandam', directionLi: 'Noord' },
  { id: 'a10-zeeburgerbrug', road: 'A10', km: 12.1, name: 'Zeeburgerbrug', type: 'brug', directionRe: 'Amersfoort', directionLi: 'Zaandam' },
  { id: 'a10-zeeburgertunnel', road: 'A10', km: 13.8, name: 'Zeeburgertunnel', type: 'tunnel', directionRe: 'Utrecht', directionLi: 'Zaandam' },
  { id: 'a10-watergraafsmeer', road: 'A10', km: 16.5, name: 'Watergraafsmeer', type: 'knooppunt', directionRe: 'Utrecht', directionLi: 'Zaanstad' },
  { id: 'a10-afrit-s112', road: 'A10', km: 19.2, name: 'Gooiseweg (s112)', type: 'afrit', exitNumber: 's112', directionRe: 'Den Haag', directionLi: 'Amersfoort' },
  { id: 'a10-amstel', road: 'A10', km: 21.4, name: 'Amstel', type: 'knooppunt', directionRe: 'Den Haag', directionLi: 'Amersfoort' },
  { id: 'a10-de-nieuwe-meer', road: 'A10', km: 26.8, name: 'De Nieuwe Meer', type: 'knooppunt', directionRe: 'Zaanstad', directionLi: 'Utrecht' },

  // --- A1 --- (Amsterdam -> Amersfoort -> Apeldoorn)
  { id: 'a1-watergraafsmeer', road: 'A1', km: 4.5, name: 'Watergraafsmeer', type: 'knooppunt', directionRe: 'Amersfoort', directionLi: 'Amsterdam' },
  { id: 'a1-diemen', road: 'A1', km: 6.2, name: 'Diemen', type: 'knooppunt', directionRe: 'Amersfoort', directionLi: 'Amsterdam' },
  { id: 'a1-afrit-1', road: 'A1', km: 7.5, name: 'Diemen-Noord', type: 'afrit', exitNumber: '1', directionRe: 'Amersfoort', directionLi: 'Amsterdam' },
  { id: 'a1-afrit-2', road: 'A1', km: 9.8, name: 'Diemen', type: 'afrit', exitNumber: '2', directionRe: 'Amersfoort', directionLi: 'Amsterdam' },
  { id: 'a1-muiderberg', road: 'A1', km: 16.8, name: 'Muiderberg', type: 'knooppunt', directionRe: 'Amersfoort', directionLi: 'Amsterdam' },
  { id: 'a1-eemnes', road: 'A1', km: 28.5, name: 'Eemnes', type: 'knooppunt', directionRe: 'Amersfoort', directionLi: 'Amsterdam' },
  { id: 'a1-hoevelaken', road: 'A1', km: 44.2, name: 'Hoevelaken', type: 'knooppunt', directionRe: 'Apeldoorn', directionLi: 'Amsterdam' },

  // --- A4 --- (Amsterdam -> Schiphol -> Den Haag -> Rotterdam)
  { id: 'a4-de-nieuwe-meer', road: 'A4', km: 3.8, name: 'De Nieuwe Meer', type: 'knooppunt', directionRe: 'Den Haag', directionLi: 'Amsterdam' },
  { id: 'a4-badhoevedorp', road: 'A4', km: 6.5, name: 'Badhoevedorp', type: 'knooppunt', directionRe: 'Den Haag', directionLi: 'Amsterdam' },
  { id: 'a4-schipholtunnel', road: 'A4', km: 12.0, name: 'Schipholtunnel', type: 'tunnel', directionRe: 'Den Haag', directionLi: 'Amsterdam' },
  { id: 'a4-burgerveen', road: 'A4', km: 21.3, name: 'Burgerveen', type: 'knooppunt', directionRe: 'Den Haag', directionLi: 'Amsterdam' },
  { id: 'a4-prins-clausplein', road: 'A4', km: 52.8, name: 'Prins Clausplein', type: 'knooppunt', directionRe: 'Rotterdam', directionLi: 'Amsterdam' },
  { id: 'a4-ypenburg', road: 'A4', km: 56.4, name: 'Ypenburg', type: 'knooppunt', directionRe: 'Rotterdam', directionLi: 'Den Haag' },

  // --- A12 --- (Den Haag -> Utrecht -> Arnhem)
  { id: 'a12-prins-clausplein', road: 'A12', km: 4.8, name: 'Prins Clausplein', type: 'knooppunt', directionRe: 'Utrecht', directionLi: 'Den Haag' },
  { id: 'a12-gouwe', road: 'A12', km: 29.5, name: 'Gouwe', type: 'knooppunt', directionRe: 'Utrecht', directionLi: 'Den Haag' },
  { id: 'a12-afrit-14', road: 'A12', km: 46.2, name: 'Woerden', type: 'afrit', exitNumber: '14', directionRe: 'Utrecht', directionLi: 'Den Haag' },
  { id: 'a12-oudenrijn', road: 'A12', km: 60.1, name: 'Oudenrijn', type: 'knooppunt', directionRe: 'Arnhem', directionLi: 'Den Haag' },
  { id: 'a12-lunetten', road: 'A12', km: 65.4, name: 'Lunetten', type: 'knooppunt', directionRe: 'Arnhem', directionLi: 'Den Haag' },

  // --- A27 --- (Almere -> Utrecht -> Breda)
  { id: 'a27-almere', road: 'A27', km: 104.2, name: 'Almere', type: 'knooppunt', directionRe: 'Utrecht', directionLi: 'Almere' },
  { id: 'a27-rijnsweerd', road: 'A27', km: 74.3, name: 'Rijnsweerd', type: 'knooppunt', directionRe: 'Breda', directionLi: 'Almere' },
  { id: 'a27-lunetten', road: 'A27', km: 71.0, name: 'Lunetten', type: 'knooppunt', directionRe: 'Breda', directionLi: 'Almere' },
  { id: 'a27-gorinchem', road: 'A27', km: 38.6, name: 'Gorinchem', type: 'knooppunt', directionRe: 'Breda', directionLi: 'Utrecht' },

  // --- A28 --- (Utrecht -> Amersfoort -> Zwolle)
  { id: 'a28-rijnsweerd', road: 'A28', km: 1.2, name: 'Rijnsweerd', type: 'knooppunt', directionRe: 'Amersfoort', directionLi: 'Utrecht' },
  { id: 'a28-hoevelaken', road: 'A28', km: 22.4, name: 'Hoevelaken', type: 'knooppunt', directionRe: 'Zwolle', directionLi: 'Utrecht' }
];

/**
 * Zoekt de vorige en volgende herkenningspunten (knooppunt/afrit/tunnel/brug)
 * op basis van weg, kilometer en rijbaan.
 * Conform [O-3] en [O-3a].
 */
export function getSurroundingLandmarks(road: string, km: number, carriageway: 'Re' | 'Li' | null): {
  lastLandmark: string;
  nextLandmark: string;
  directionName: string;
} {
  const roadMarks = VILD_LANDMARKS.filter(m => m.road.toUpperCase() === road.toUpperCase());
  if (roadMarks.length === 0) {
    return {
      lastLandmark: 'Onbekende afrit',
      nextLandmark: 'Onbekende afrit',
      directionName: carriageway === 'Re' ? 'rechterrijbaan' : 'linkerrijbaan'
    };
  }

  // Sorteren op kilometer
  const sorted = [...roadMarks].sort((a, b) => a.km - b.km);

  // Rechterrijbaan = oplopende kilometrering [P-4]
  // Linkerrijbaan = aflopende kilometrering
  const isAscending = carriageway !== 'Li';

  let prev: VILDLandmark | undefined;
  let next: VILDLandmark | undefined;

  if (isAscending) {
    prev = [...sorted].filter(m => m.km <= km).pop() || sorted[0];
    next = sorted.find(m => m.km > km) || sorted[sorted.length - 1];
  } else {
    prev = sorted.find(m => m.km >= km) || sorted[sorted.length - 1];
    next = [...sorted].filter(m => m.km < km).pop() || sorted[0];
  }

  const formatMark = (m: VILDLandmark) => {
    if (m.type === 'knooppunt') {
      return `☘ ${m.name}`; // Klaverblad-icoon [O-3a]
    }
    if (m.type === 'afrit' && m.exitNumber) {
      return `afrit ${m.exitNumber} ${m.name}`;
    }
    return `${m.name}`;
  };

  // Richtingnaam bepalen uit dichtstbijzijnde segment
  const nearest = prev || sorted[0];
  let direction = isAscending ? nearest.directionRe : nearest.directionLi;
  if (!direction) {
    direction = carriageway === 'Re' ? 'rechterrijbaan' : (carriageway === 'Li' ? 'linkerrijbaan' : 'onbekend');
  }

  return {
    lastLandmark: formatMark(prev),
    nextLandmark: formatMark(next),
    directionName: direction
  };
}

/**
 * Formatteert een kilometergetal in Nederlandse notatie [D-5]
 * Bijv. 58.3 -> "km 58,3"
 */
export function formatDutchKm(km: number): string {
  return `km ${km.toFixed(1).replace('.', ',')}`;
}

/**
 * Formatteert afstand op de tijdlijn conform [O-10]:
 * - Onder 1 km: in meters afgerond op 50 m (bijv. "350 m", "50 m")
 * - 1 km of meer: in km met één decimaal en komma (bijv. "1,4 km")
 */
export function formatDutchDistance(meters: number): string {
  if (meters <= 25) {
    return 'Hier'; // [O-10]
  }
  if (meters < 1000) {
    const rounded = Math.round(meters / 50) * 50;
    return `${Math.max(50, rounded)} m`;
  }
  const km = (meters / 1000).toFixed(1).replace('.', ',');
  return `${km} km`;
}

/**
 * Formatteert snelheid conform [D-5]
 */
export function formatSpeed(speed: number | null): string {
  if (speed === null || speed === undefined || isNaN(speed)) {
    return '-';
  }
  return `${Math.round(speed)} km/u`;
}

/**
 * Verkeerskleuren conform specificatie [O-9]:
 * - Rood: onder 50 km/u
 * - Oranje: van 50 tot 80 km/u
 * - Groen: vanaf 80 km/u
 * - Grijs: zonder meting
 */
export function getSpeedColor(speed: number | null | undefined): 'red' | 'orange' | 'green' | 'gray' {
  if (speed === null || speed === undefined || isNaN(speed)) {
    return 'gray';
  }
  if (speed < 50) return 'red';
  if (speed < 80) return 'orange';
  return 'green';
}

export function getSpeedColorClass(color: 'red' | 'orange' | 'green' | 'gray'): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (color) {
    case 'red':
      return {
        bg: 'bg-rose-950/80',
        text: 'text-rose-400',
        border: 'border-rose-500/50',
        dot: 'bg-rose-500'
      };
    case 'orange':
      return {
        bg: 'bg-amber-950/80',
        text: 'text-amber-400',
        border: 'border-amber-500/50',
        dot: 'bg-amber-500'
      };
    case 'green':
      return {
        bg: 'bg-emerald-950/80',
        text: 'text-emerald-400',
        border: 'border-emerald-500/50',
        dot: 'bg-emerald-500'
      };
    case 'gray':
    default:
      return {
        bg: 'bg-slate-900',
        text: 'text-slate-400',
        border: 'border-slate-800',
        dot: 'bg-slate-500'
      };
  }
}
