import React from 'react';
import { cn } from '@/lib/utils';

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
