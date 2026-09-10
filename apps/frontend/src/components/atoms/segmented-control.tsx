import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Horizontal multi-segment selector component with an animated active indicator.
 *
 * Renders an accessible tablist where all options occupy equal width within an inline CSS grid.
 * An absolute background indicator pill slides smoothly across segments using CSS transforms
 * with cubic-bezier easing based on the active selection index.
 *
 * @template T - String literal union representing selectable segment values
 * @param props.options - Ordered array of distinct selectable option strings
 * @param props.value - Currently selected option value
 * @param props.onChange - Callback invoked when a user clicks an option
 * @param props.className - Optional classes to merge into the outer track container
 *
 * @example
 * <SegmentedControl
 *   options={['day', 'week', 'month'] as const}
 *   value={interval}
 *   onChange={setInterval}
 * />
 */
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
