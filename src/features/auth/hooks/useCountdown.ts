import { useState, useEffect } from 'react';

export const useCountdown = (initialSeconds: number, shouldPause: boolean = false) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(initialSeconds <= 0);

  // Actualizar seconds cuando initialSeconds cambia
  useEffect(() => {
    setSeconds(initialSeconds);
    setIsExpired(initialSeconds <= 0);
  }, [initialSeconds]);

  // Efecto separado para el countdown que solo depende de shouldPause
  useEffect(() => {
    if (shouldPause) {
      return;
    }

    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [shouldPause]); // Solo depende de shouldPause, no de seconds

  return {
    seconds,
    isExpired,
    formatted: `0${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  };
};
