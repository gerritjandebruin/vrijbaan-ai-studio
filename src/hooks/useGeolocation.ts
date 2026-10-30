/**
 * Geolocation & Ritsimulatie Hook
 * Conform specificaties [P-1] t/m [P-7] en de bevestigde ritsimulator-keuze
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MatchedRoadPosition, UserPosition } from '../types/traffic';
import { geoMatcher } from '../services/geoMatcher';
import { trafficDataService } from '../services/trafficDataService';
import { SIMULATION_ROUTES, DUTCH_ROAD_WAYPOINTS } from '../services/roadNetwork';

export function useGeolocation(
  useLocation: boolean,
  simulationRouteId: string = 'none'
) {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [matchedPosition, setMatchedPosition] = useState<MatchedRoadPosition | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  
  // Simulatie parameters
  const [simKm, setSimKm] = useState<number>(33.5);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [simSpeedKmH, setSimSpeedKmH] = useState<number>(100);

  const watchIdRef = useRef<number | null>(null);

  // Check permissie status bij opstarten [S-1]
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionState('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then(res => {
          setPermissionState(res.state as 'prompt' | 'granted' | 'denied');
          res.onchange = () => {
            setPermissionState(res.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {});
    }
  }, []);

  // Handmatige trigger om locatietoestemming aan te vragen [S-1]
  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      pos => {
        setPermissionState('granted');
        handleNewCoords(pos.coords.latitude, pos.coords.longitude, pos.coords.heading, pos.coords.speed, pos.coords.accuracy);
      },
      err => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
        }
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Update wegpositie en snelheden aan de hand van coördinaten [S-6]
  const handleNewCoords = useCallback((
    lat: number,
    lon: number,
    heading: number | null,
    speedMps: number | null,
    accuracy: number
  ) => {
    const userPos: UserPosition = {
      lat,
      lon,
      accuracy,
      speedMps,
      heading,
      timestamp: Date.now()
    };
    setPosition(userPos);

    // [P-2, P-3] Match naar dichtstbijzijnde snelweg en bereken geïnterpoleerde km
    const matched = geoMatcher.matchPosition(lat, lon, heading);

    if (matched) {
      // [O-4] Bord: laagste snelheid op laatste gepasseerde portaal binnen 3 km achter je
      matched.lastPassedPortalSpeed = trafficDataService.getLastPassedPortalSpeed(
        matched.road,
        matched.km,
        matched.carriageway
      );

      // [O-5] Gemeten: snelheid bij dichtstbijzijnde meetpunt binnen 1 km
      matched.currentMeasuredSpeed = trafficDataService.getNearestMeasuredSpeed(
        matched.road,
        matched.km,
        matched.carriageway
      );

      setMatchedPosition({ ...matched });
    } else {
      setMatchedPosition(null);
    }
  }, []);

  // Simulatie klok (wanneer simulatie actief is)
  useEffect(() => {
    if (simulationRouteId === 'none' || !useLocation) return;

    const route = SIMULATION_ROUTES.find(r => r.id === simulationRouteId) || SIMULATION_ROUTES[0];
    geoMatcher.setManualCarriageway(route.carriageway);

    const isAscending = route.startKm < route.endKm;
    let currentKm = simKm;

    const interval = setInterval(() => {
      if (!isSimPlaying) return;

      // km verplaatsing per seconde = speedKmH / 3600
      const deltaKmPerSec = (simSpeedKmH / 3600) * 1.5; // lichte versnelling voor soepele demo
      if (isAscending) {
        currentKm += deltaKmPerSec;
        if (currentKm > Math.max(route.startKm, route.endKm)) {
          currentKm = Math.min(route.startKm, route.endKm); // loop opnieuw
        }
      } else {
        currentKm -= deltaKmPerSec;
        if (currentKm < Math.min(route.startKm, route.endKm)) {
          currentKm = Math.max(route.startKm, route.endKm);
        }
      }

      setSimKm(currentKm);

      // Zoek lat/lon langs waypoints voor deze km
      const waypoints = DUTCH_ROAD_WAYPOINTS
        .filter(w => w.road === route.road)
        .sort((a, b) => a.km - b.km);

      let lat = 52.3361;
      let lon = 4.9122;

      for (let i = 0; i < waypoints.length - 1; i++) {
        if (currentKm >= waypoints[i].km && currentKm <= waypoints[i + 1].km) {
          const ratio = (currentKm - waypoints[i].km) / (waypoints[i + 1].km - waypoints[i].km);
          lat = waypoints[i].lat + ratio * (waypoints[i + 1].lat - waypoints[i].lat);
          lon = waypoints[i].lon + ratio * (waypoints[i + 1].lon - waypoints[i].lon);
          break;
        }
      }

      handleNewCoords(lat, lon, isAscending ? 160 : 340, simSpeedKmH / 3.6, 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationRouteId, useLocation, isSimPlaying, simSpeedKmH, simKm, handleNewCoords]);

  // Echte GPS watchPosition (wanneer geen simulatie actief is) [P-1]
  useEffect(() => {
    if (simulationRouteId !== 'none' || !useLocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        setPermissionState('granted');
        handleNewCoords(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.heading,
          pos.coords.speed,
          pos.coords.accuracy
        );
      },
      err => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // elke 5 seconden [P-1]
        timeout: 10000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [simulationRouteId, useLocation, handleNewCoords]);

  const setManualKm = (km: number) => {
    setSimKm(km);
  };

  const toggleSimPlaying = () => {
    setIsSimPlaying(prev => !prev);
  };

  return {
    position,
    matchedPosition,
    permissionState,
    requestLocation,
    // Simulatie controls
    isSimulating: simulationRouteId !== 'none',
    simKm,
    setManualKm,
    isSimPlaying,
    toggleSimPlaying,
    simSpeedKmH,
    setSimSpeedKmH
  };
}
