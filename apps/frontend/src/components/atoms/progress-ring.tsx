import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Circular SVG progress meter visualizing fractional completion between 0 and 1.
 *
 * Computes circle circumference $c = 2 \pi r$ (where radius $r = \frac{\text{size} - \text{stroke}}{2}$ using stroke width 2.5px)
 * and updates `strokeDashoffset` to $c \times (1 - \text{clamp}(progress, 0, 1))$ with smooth cubic-bezier easing.
 * Rotates the SVG by -90 degrees so the progress sweep starts at the 12 o'clock top position.
 *
 * @example
 * ```tsx
 * <ProgressRing progress={0.75} tone="green" size={32}>
 *   75%
 * </ProgressRing>
 * ```
 *
 * @param props - Progress value (0..1), color tone variant ('accent' | 'orange' | 'green' | 'red'), diameter in px (default 28), optional center label, and styling classes.
 * @returns An SVG circular progress ring container with optional centered child label.
 */
export function ProgressRing({
  progress,
  tone = 'accent',
  children,
  size = 28,
  className = '',
}: {
  progress: number; // 0..1
  tone?: 'orange' | 'green' | 'red' | 'accent';
  children?: React.ReactNode;
  size?: number;
  className?: string;
}) {
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tones = {
    orange: 'var(--orange)',
    green: 'var(--green)',
    red: 'var(--red)',
    accent: 'var(--accent)',
  };

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tones[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
      </svg>
      {children && (
        <span className="relative text-[11px] font-semibold tabular-nums text-ink">
          {children}
        </span>
      )}
    </span>
  );
}
