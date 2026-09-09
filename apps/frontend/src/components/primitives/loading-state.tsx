import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Shimmer } from '@/components/atoms/shimmer';

export interface LoadingStateProps {
  label?: string;
  variant?: 'Drive' | 'Dots';
  className?: string;
}

const chevronDelays = [
  90, 0, 90,
  180, 90, 180,
  270, 180, 270,
];

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
