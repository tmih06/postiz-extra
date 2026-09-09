import React from 'react';
import { cn } from '@/lib/utils';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const index = options.indexOf(value);
  return (
    <div
      className={cn(
        'relative inline-grid h-8 select-none rounded-full bg-line/60 p-0.5 shadow-inset-field',
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      role="tablist"
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 rounded-full bg-surface shadow-hairline transition-transform duration-200"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          left: 2,
          transform: `translateX(${index * 100}%)`,
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      />
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="tab"
          aria-selected={opt === value}
          onClick={() => onChange(opt)}
          className={cn(
            'relative z-10 rounded-full px-3 text-[13px] font-medium transition-colors duration-150 capitalize',
            opt === value ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
