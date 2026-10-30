/**
 * Nederlandse Snelweg Referentiepunten en Weggeometrieën
 * Bevat geijkte GPS coördinaten en kilometers voor hoofdwegen (A1, A2, A4, A10, A12, etc.)
 * voor nauwkeurige GPS-wegpassing en hectometer-interpolatie [P-2, P-3]
 */

export interface RoadWayPoint {
  road: string;
  km: number;
  lat: number;
  lon: number;
  bearingDeg?: number; // Richting van de hectometrering (oplopend)
}

export const DUTCH_ROAD_WAYPOINTS: RoadWayPoint[] = [
  // --- A2 (Amsterdam Amstel -> Utrecht Oudenrijn -> Den Bosch -> Eindhoven) ---
  { road: 'A2', km: 30.5, lat: 52.3361, lon: 4.9122 }, // Knp Amstel
  { road: 'A2', km: 33.2, lat: 52.3168, lon: 4.9315 },
  { road: 'A2', km: 35.8, lat: 52.2968, lon: 4.9542 }, // Knp Holendrecht
  { road: 'A2', km: 37.9, lat: 52.2801, lon: 4.9665 },
  { road: 'A2', km: 41.2, lat: 52.2530, lon: 4.9782 }, // Abcoude
  { road: 'A2', km: 45.0, lat: 52.2215, lon: 4.9855 },
  { road: 'A2', km: 47.1, lat: 52.2045, lon: 4.9890 }, // Vinkeveen
  { road: 'A2', km: 50.0, lat: 52.1802, lon: 4.9972 },
  { road: 'A2', km: 54.0, lat: 52.1465, lon: 5.0080 }, // Breukelen
  { road: 'A2', km: 57.0, lat: 52.1220, lon: 5.0210 },
  { road: 'A2', km: 59.8, lat: 52.1005, lon: 5.0345 }, // Maarssen
  { road: 'A2', km: 62.5, lat: 52.0805, lon: 5.0495 }, // Leidsche Rijn Tunnel
  { road: 'A2', km: 64.3, lat: 52.0682, lon: 5.0592 },
  { road: 'A2', km: 66.8, lat: 52.0520, lon: 5.0740 }, // Knp Oudenrijn
  { road: 'A2', km: 70.0, lat: 52.0280, lon: 5.0880 },
  { road: 'A2', km: 73.1, lat: 52.0035, lon: 5.0995 }, // Lekbrug
  { road: 'A2', km: 76.5, lat: 51.9770, lon: 5.1140 }, // Knp Everdingen
  { road: 'A2', km: 82.4, lat: 51.9310, lon: 5.1460 },
  { road: 'A2', km: 92.1, lat: 51.8560, lon: 5.2010 }, // Knp Deil

  // --- A10 Ring Amsterdam ---
  { road: 'A10', km: 0.0, lat: 52.4215, lon: 4.8850 },  // Coenplein
  { road: 'A10', km: 6.0, lat: 52.4080, lon: 4.9650 },
  { road: 'A10', km: 12.1, lat: 52.3780, lon: 4.9960 }, // Zeeburgerbrug
  { road: 'A10', km: 13.8, lat: 52.3650, lon: 4.9980 }, // Zeeburgertunnel
  { road: 'A10', km: 16.5, lat: 52.3480, lon: 4.9750 }, // Watergraafsmeer
  { road: 'A10', km: 19.2, lat: 52.3385, lon: 4.9350 },
  { road: 'A10', km: 21.4, lat: 52.3361, lon: 4.9122 }, // Amstel
  { road: 'A10', km: 24.0, lat: 52.3350, lon: 4.8720 },
  { road: 'A10', km: 26.8, lat: 52.3390, lon: 4.8350 }, // De Nieuwe Meer

  // --- A1 (Amsterdam -> Amersfoort) ---
  { road: 'A1', km: 4.5, lat: 52.3480, lon: 4.9750 },  // Watergraafsmeer
  { road: 'A1', km: 7.5, lat: 52.3390, lon: 5.0150 },
  { road: 'A1', km: 9.8, lat: 52.3350, lon: 5.0450 },
  { road: 'A1', km: 16.8, lat: 52.3250, lon: 5.1400 }, // Muiderberg
  { road: 'A1', km: 28.5, lat: 52.2580, lon: 5.2750 }, // Eemnes
  { road: 'A1', km: 44.2, lat: 52.1850, lon: 5.4250 }, // Hoevelaken

  // --- A4 (Amsterdam -> Schiphol -> Den Haag) ---
  { road: 'A4', km: 3.8, lat: 52.3390, lon: 4.8350 },
  { road: 'A4', km: 6.5, lat: 52.3290, lon: 4.7950 },
  { road: 'A4', km: 12.0, lat: 52.3020, lon: 4.7450 }, // Schipholtunnel
  { road: 'A4', km: 21.3, lat: 52.2380, lon: 4.6750 }, // Burgerveen
  { road: 'A4', km: 42.0, lat: 52.1450, lon: 4.5200 }, // Leiden
  { road: 'A4', km: 52.8, lat: 52.0620, lon: 4.3850 }, // Prins Clausplein

  // --- A12 (Den Haag -> Gouda -> Utrecht -> Arnhem) ---
  { road: 'A12', km: 4.8, lat: 52.0620, lon: 4.3850 },
  { road: 'A12', km: 29.5, lat: 52.0250, lon: 4.6850 }, // Gouwe
  { road: 'A12', km: 46.2, lat: 52.0650, lon: 4.9150 }, // Woerden
  { road: 'A12', km: 60.1, lat: 52.0520, lon: 5.0740 }, // Oudenrijn
  { road: 'A12', km: 65.4, lat: 52.0560, lon: 5.1500 }, // Lunetten
];

// Gesimuleerde routes voor de ritsimulator
export interface SimulationRoute {
  id: string;
  name: string;
  road: string;
  carriageway: 'Re' | 'Li';
  startKm: number;
  endKm: number;
  speedKmH: number;
  description: string;
}

export const SIMULATION_ROUTES: SimulationRoute[] = [
  {
    id: 'a2_utrecht',
    name: 'A2: Knooppunt Amstel → Utrecht Oudenrijn (Re)',
    road: 'A2',
    carriageway: 'Re',
    startKm: 32.0,
    endKm: 65.0,
    speedKmH: 100,
    description: 'Amsterdam Zuidoost naar Utrecht. Passeert trajectcontrole, portalen en files bij Breukelen en Maarssen.'
  },
  {
    id: 'a2_amsterdam',
    name: 'A2: Utrecht Oudenrijn → Amsterdam Amstel (Li)',
    road: 'A2',
    carriageway: 'Li',
    startKm: 65.0,
    endKm: 32.0,
    speedKmH: 100,
    description: 'Richting Amsterdam. Aflopende hectometrering op de linkerrijbaan.'
  },
  {
    id: 'a10_ring',
    name: 'A10: Ring Amsterdam Zuid & Oost',
    road: 'A10',
    carriageway: 'Re',
    startKm: 12.0,
    endKm: 26.0,
    speedKmH: 80,
    description: 'Zeeburgertunnel, Amstel, De Nieuwe Meer met 80/100 km/u matrixborden en wisselende snelheden.'
  }
];
