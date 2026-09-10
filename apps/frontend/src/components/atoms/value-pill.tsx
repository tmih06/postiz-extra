import React from 'react';
import { cn } from '@/lib/utils';

/** Supported color variants for inline value pill badges. */
export type ValuePillTone = 'neutral' | 'green' | 'orange' | 'red' | 'accent';

const TONES: Record<ValuePillTone, { cls: string; ring: string }> = {
  neutral: { cls: 'bg-field text-ink-2', ring: 'var(--shadow-hairline)' },
  green: { cls: 'bg-green-tint text-green', ring: '0 0 0 1px color-mix(in oklch, var(--green) 28%, transparent)' },
  orange: { cls: 'bg-orange-tint text-orange', ring: '0 0 0 1px color-mix(in oklch, var(--orange) 28%, transparent)' },
  red: { cls: 'bg-red-tint text-red', ring: '0 0 0 1px color-mix(in oklch, var(--red) 28%, transparent)' },
  accent: { cls: 'bg-accent-tint text-accent-ink', ring: '0 0 0 1px color-mix(in oklch, var(--accent) 28%, transparent)' },
};

/**
 * Compact inline badge for rendering structured values, metrics, or parameter tags.
 *
 * Formats concise data tokens with rounded styling, tone-specific tint backgrounds, and
 * OKLCH color-mixed box-shadow rings to ensure high-contrast boundaries against adjacent content.
 *
 * @param props.children - Content to render inside the pill (e.g., metric value, tag name)
 * @param props.tone - Color variant controlling background, text, and border ring (defaults to `'neutral'`)
 * @param props.className - Optional extra classes to merge onto the container
 *
 * @example
 * <ValuePill tone="accent">v2.4.0</ValuePill>
 * <ValuePill tone="green">+12.5%</ValuePill>
 */
export function ValuePill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: ValuePillTone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex items-center rounded-full px-2 py-0.5 align-middle text-[12px] font-medium',
        t.cls,
        className
      )}
      style={{ boxShadow: t.ring }}
    >
      {children}
    </span>
  );
}
