/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCountdownReturn {
  secondsLeft: number;
  isActive: boolean;
  isPaused: boolean;
  formattedTime: string;
  start: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

export function useCountdown(
  initialSeconds: number = 30,
  onComplete?: () => void
): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds?: number) => {
      clearTimer();
      const target = seconds !== undefined ? seconds : initialSeconds;
      setSecondsLeft(target);
      setIsActive(true);
      setIsPaused(false);

      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsActive(false);
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer, initialSeconds]
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused || secondsLeft <= 0) return;
    setIsPaused(false);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsActive(false);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, isPaused, secondsLeft]);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsLeft(initialSeconds);
    setIsActive(false);
    setIsPaused(false);
  }, [clearTimer, initialSeconds]);

  const skip = useCallback(() => {
    clearTimer();
    setSecondsLeft(0);
    setIsActive(false);
    setIsPaused(false);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${String(remainder).padStart(2, '0')}`;
  };

  return {
    secondsLeft,
    isActive,
    isPaused,
    formattedTime: formatSeconds(secondsLeft),
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
