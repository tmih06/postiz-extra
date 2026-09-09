import React from 'react';
import { cn } from '@/lib/utils';

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
