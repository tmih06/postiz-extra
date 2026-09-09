import React from 'react';
import { cn } from '@/lib/utils';

export type StatusPillTone = 'green' | 'orange' | 'red' | 'accent' | 'neutral';

const toneClasses: Record<StatusPillTone, string> = {
  green: 'bg-green-tint text-green',
  orange: 'bg-orange-tint text-orange',
  red: 'bg-red-tint text-red',
  accent: 'bg-accent-tint text-accent-ink',
  neutral: 'bg-inset text-ink-2',
};

const dotColors: Record<StatusPillTone, string> = {
  green: 'bg-green',
  orange: 'bg-orange',
  red: 'bg-red',
  accent: 'bg-accent',
  neutral: 'bg-ink-3',
};

export function StatusPill({
  tone = 'neutral',
  children,
  dot = true,
  className = '',
}: {
  tone?: StatusPillTone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium leading-none shadow-hairline',
        toneClasses[tone],
        className
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', dotColors[tone])} />}
      <span>{children}</span>
    </span>
  );
}
