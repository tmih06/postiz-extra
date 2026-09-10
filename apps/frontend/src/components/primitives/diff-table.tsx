import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, GitCommit } from 'lucide-react';

/**
 * Data structure representing a single comparison field before and after revisions.
 */
export type DiffItem = {
  /** Unique identifier for the diff row. */
  id: string;
  /** Name of the property or content section being modified (e.g. `'Hook Line'`, `'Tags'`). */
  field: string;
  /** Original content prior to proposed modification. */
  original: string;
  /** Revised proposed content. */
  revised: string;
};

/**
 * Props configuring the visual before/after diff table component.
 */
export interface DiffTableProps {
  /** Header title text for the diff card (defaults to `'Proposed Post Improvements'`). */
  title?: string;
  /** List of field differences to compare and toggle. */
  items?: DiffItem[];
  /** Callback triggered when the user applies changes, receiving the array of accepted item IDs. */
  onApply?: (acceptedIds: string[]) => void;
  /** Optional extra CSS classes applied to the root card container. */
  className?: string;
}

const DEFAULT_DIFF_ITEMS: DiffItem[] = [
  {
    id: '1',
    field: 'Hook Line',
    original: 'Hey everyone, check out our new update!',
    revised: 'We just shipped our biggest update of the year. Here is what changes for creators 🧵',
  },
  {
    id: '2',
    field: 'Call-to-Action',
    original: 'Link in bio for more details.',
    revised: 'Read the full launch breakdown in the first reply below 👇',
  },
  {
    id: '3',
    field: 'Tags',
    original: '#marketing #tech #startup #buildinpublic #updates #cool',
    revised: '#buildinpublic #saas',
  },
];

/**
 * Structured comparison card displaying granular before-and-after text improvements.
 *
 * Renders strikethrough red original text vs highlighted green proposed text with
 * per-item toggle buttons (`Included` / `Excluded`). Provides a batch action to apply
 * all currently accepted item IDs.
 *
 * @param props Component options, diff item collection, and apply event handler.
 * @returns A structured difference comparison table with inclusion toggles.
 */
export function DiffTable({
  title = 'Proposed Post Improvements',
  items = DEFAULT_DIFF_ITEMS,
  onApply,
  className = '',
}: DiffTableProps) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>(() =>
    items.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );

  const toggle = (id: string) => {
    setAccepted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = () => {
    const acceptedIds = Object.keys(accepted).filter((k) => accepted[k]);
    onApply?.(acceptedIds);
  };

  return (
    <div
      className={cn(
        'w-full max-w-xl rounded-card border border-line bg-surface p-4 shadow-card',
        className
      )}
      style={{ animation: 'fade-up 350ms cubic-bezier(0.23,1,0.32,1) both' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <GitCommit className="size-4 text-accent" />
        <h4 className="text-[14px] font-semibold text-ink">{title}</h4>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isAccepted = !!accepted[item.id];
          return (
            <div
              key={item.id}
              className={cn(
                'rounded-control border p-2.5 transition-all',
                isAccepted ? 'border-line bg-page/40' : 'border-line/40 bg-page/20 opacity-60'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                  {item.field}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                    isAccepted
                      ? 'bg-green-tint text-green hover:bg-green-tint/80'
                      : 'bg-inset text-ink-3 hover:bg-hover'
                  )}
                >
                  {isAccepted ? (
                    <>
                      <Check className="size-3" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="size-3" />
                      <span>Excluded</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1 text-[12px] font-mono">
                <div className="flex items-start gap-2 text-red-tint/90 bg-red-tint/20 rounded p-1.5">
                  <span className="text-red font-bold">-</span>
                  <span className="text-red line-through select-none">{item.original}</span>
                </div>
                <div className="flex items-start gap-2 text-green-tint/90 bg-green-tint/20 rounded p-1.5">
                  <span className="text-green font-bold">+</span>
                  <span className="text-green font-medium">{item.revised}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 border-t border-line-soft pt-3 mt-3">
        <button
          type="button"
          onClick={handleApply}
          className="rounded-control bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background shadow-btn hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Apply Changes ({Object.values(accepted).filter(Boolean).length}/{items.length})
        </button>
      </div>
    </div>
  );
}

export default DiffTable;
