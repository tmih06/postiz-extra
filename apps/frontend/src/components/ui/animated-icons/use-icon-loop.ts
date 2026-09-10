'use client';

import { useEffect, useRef } from 'react';
import { useAnimation } from 'motion/react';

/**
 * Hook to manage icon animations that:
 * 1. Play full cycle on hover over (even brief flicks).
 * 2. Repeatedly loop while hover is maintained.
 * 3. Rest 2 seconds in normal state before playing each subsequent cycle.
 * 4. Gracefully settle to resting state when unhovered.
 */
export function useIconLoop(active: boolean, restMs: number = 2000) {
  const controls = useAnimation();
  const activeRef = useRef(active);
  const runningRef = useRef(false);
  const isMountedRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;

    // If hover ends while resting, cancel rest timer immediately
    if (!active && timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      runningRef.current = false;
    }

    if (active && !runningRef.current) {
      runningRef.current = true;

      const runCycle = () => {
        if (!activeRef.current || !isMountedRef.current) {
          if (isMountedRef.current) {
            controls.start('normal').catch(() => {});
          }
          runningRef.current = false;
          return;
        }

        // 1. Play the full cycle
        controls
          .start('animate')
          .then(() => {
            if (!isMountedRef.current) return;
            return controls.start('normal');
          })
          .then(() => {
            if (!isMountedRef.current) {
              runningRef.current = false;
              return;
            }
            // 2. If still hovered, rest for restMs (2s) before next loop
            if (activeRef.current && restMs > 0) {
              timerRef.current = window.setTimeout(() => {
                timerRef.current = null;
                runCycle();
              }, restMs);
            } else if (activeRef.current) {
              runCycle();
            } else {
              runningRef.current = false;
            }
          })
          .catch(() => {
            runningRef.current = false;
          });
      };

      runCycle();
    }
  }, [active, controls, restMs]);

  return controls;
}
