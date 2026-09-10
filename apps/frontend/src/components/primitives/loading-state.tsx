import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Shimmer } from '@/components/atoms/shimmer';

/**
 * Props for the {@link LoadingState} inline indicator component.
 */
export interface LoadingStateProps {
  /** Descriptive loading message shown alongside shimmer animation (default: 'Processing publishing workflow'). */
  label?: string;
  /** Visual dot shape variant: 'Dots' (rounded-full) or 'Drive' (rounded-[1px] micro-squares). */
  variant?: 'Drive' | 'Dots';
  /** Optional CSS class overrides for the container. */
  className?: string;
}

const chevronDelays = [
  90, 0, 90,
  180, 90, 180,
  270, 180, 270,
];

/**
 * Inline loading indicator with animated 3x3 pixel matrix, text shimmer, and live elapsed timer.
 *
 * Renders a 3x3 chevron dot matrix with staggered wave animation delays (0ms–270ms) to indicate background
 * activity, accompanied by a shimmering accessible text label and a monospace 0.1s resolution elapsed timer.
 *
 * @example
 * ```tsx
 * <LoadingState label="Scheduling social posts" variant="Dots" />
 * ```
 *
 * @param props - Configuration for label text, pixel variant shape, and style classes.
 * @returns An inline row containing animated dot matrix, shimmer label, and elapsed counter.
 */
export function LoadingState({
  label = 'Processing publishing workflow',
  variant = 'Dots',
  className = '',
}: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((prev) => +(prev + 0.1).toFixed(1)), 100);
    return () => clearInterval(t);
  }, []);

  const isRound = variant === 'Dots';

  return (
    <div className={cn('inline-flex items-center gap-3 py-1', className)}>
      <span aria-hidden className="grid shrink-0 grid-cols-3 gap-[2px]">
        {chevronDelays.map((delay, idx) => (
          <span
            key={idx}
            className={cn(
              'size-[4px] bg-ink',
              isRound ? 'rounded-full' : 'rounded-[1px]'
            )}
            style={{
              animation: `pixel-on 650ms ease-in-out ${delay}ms infinite`,
            }}
          />
        ))}
      </span>

      <Shimmer className="text-[13px] font-medium text-ink-2">
        {label}
      </Shimmer>

      <span className="font-mono text-[11px] tabular-nums text-ink-3">
        {elapsed.toFixed(1)}s
      </span>
    </div>
  );
}

export default LoadingState;
