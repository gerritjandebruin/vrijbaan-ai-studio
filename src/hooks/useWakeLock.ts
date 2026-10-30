/**
 * Screen Wake Lock Hook
 * Conform specificatie [O-21]:
 * Het scherm blijft aan zolang Onderweg open is en locatie aan staat.
 */

import { useEffect, useRef, useState } from 'react';

export function useWakeLock(enabled: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setIsLocked(false);
      }
      return;
    }

    const requestWakeLock = async () => {
      try {
        if (!wakeLockRef.current) {
          const sentinel = await navigator.wakeLock.request('screen');
          wakeLockRef.current = sentinel;
          setIsLocked(true);

          sentinel.addEventListener('release', () => {
            wakeLockRef.current = null;
            setIsLocked(false);
          });
        }
      } catch {
        setIsLocked(false);
      }
    };

    requestWakeLock();

    // Opnieuw aanvragen als de gebruiker terugkeert naar de tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setIsLocked(false);
      }
    };
  }, [enabled]);

  return isLocked;
}
