import { useState, useEffect } from 'react';

/**
 * Hook para countdown timer
 * @param initialSeconds - Segundos iniciales del countdown
 * @param isPaused - Si es true, el timer se pausa
 * @returns { seconds, isExpired, restart, formatTime }
 */
export function useCountdown(initialSeconds: number, isPaused: boolean = false) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setIsExpired(true);
      return;
    }

    // Si está pausado, no hacer nada
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, isPaused]);

  const restart = (newSeconds?: number) => {
    setSeconds(newSeconds || initialSeconds);
    setIsExpired(false);
  };

  // Formatear tiempo como MM:SS
  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return { seconds, isExpired, restart, formatTime };
}
