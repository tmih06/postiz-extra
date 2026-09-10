import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Circular monogram badge rendering an avatar letter or icon node against a colored background.
 *
 * @param props - Monogram child content, optional background color hex/var (default: '#6366f1'), and styling classes.
 * @returns A fixed 16x16 circular badge container.
 */
export function Monogram({
  children,
  color = '#6366f1',
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none text-white',
        className
      )}
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

/**
 * Compact pill-shaped chip representing a workspace entity, social channel, user, or platform.
 *
 * Renders a circular initial/monogram icon alongside the truncated entity name (capped at 120px with ellipsis).
 * If no custom `monogram` node is provided, extracts and uppercases the first letter of `name`.
 *
 * @example
 * ```tsx
 * <EntityChip name="Twitter / X" color="#1DA1F2" />
 * <EntityChip name="Marketing Team" monogram={<UsersIcon className="size-2.5" />} />
 * ```
 *
 * @param props - Entity name, accent color, optional monogram override, and class overrides.
 * @returns An inline pill badge with monogram and truncated text label.
 */
export function EntityChip({
  name,
  color,
  monogram,
  className = '',
}: {
  name: string;
  color?: string;
  monogram?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex items-center gap-1.5 rounded-full bg-field py-0.5 pl-1 pr-2 align-middle shadow-hairline',
        className
      )}
    >
      <Monogram color={color}>{monogram ?? name.charAt(0).toUpperCase()}</Monogram>
      <span className="text-[12px] font-medium text-ink truncate max-w-[120px]">{name}</span>
    </span>
  );
}
