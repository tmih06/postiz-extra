import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Text wrapper that applies a continuous horizontal glowing gradient animation.
 *
 * Clips an animated 200%-width linear gradient background to its child text glyphs
 * (`bg-clip-text text-transparent`) to signal active processing, generation, or loading states.
 *
 * @param props.children - Text or inline elements to render with shimmering gradient fill
 * @param props.className - Optional classes to merge into the outer span (e.g. typography sizing)
 *
 * @example
 * <Shimmer className="font-semibold text-sm">Generating caption...</Shimmer>
 */
export function Shimmer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent', className)}
      style={{
        backgroundImage:
          'linear-gradient(90deg, var(--ink-3) 30%, var(--ink) 50%, var(--ink-3) 70%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer-text 1.8s linear infinite',
      }}
    >
      {children}
    </span>
  );
}
