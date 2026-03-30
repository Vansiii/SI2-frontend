import { useState, useEffect } from 'react';

export const useCountdown = (initialSeconds: number, shouldPause: boolean = false) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(initialSeconds <= 0);

  useEffect(() => {
    // Only set state if necessary (e.g. if initialSeconds changes)
    if (initialSeconds !== seconds && initialSeconds > 0) {
       setSeconds(initialSeconds);
       setIsExpired(false);
    }
  }, [initialSeconds, seconds]);

  useEffect(() => {
    let interval: number;

    if (seconds > 0 && !shouldPause) {
      interval = window.setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (seconds <= 0) {
      setIsExpired(true);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [seconds, shouldPause]);

  return {
    seconds,
    isExpired,
    formatted: `0${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  };
};
