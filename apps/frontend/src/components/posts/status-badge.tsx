import React from 'react';
import { Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  /** Post publication lifecycle status identifier. */
  status: string;
  /** Optional custom CSS classes. */
  className?: string;
}

/**
 * Renders a compact visual status badge for social post publication states.
 *
 * Feature & Theme Invariants:
 * - Maps lifecycle variants ('published', 'success', 'scheduled', 'draft', 'failed', 'error')
 *   to distinctive status pill colors matching Beautiful UI design tokens.
 * - Displays a contextual Lucide icon (`CheckCircle2`, `Clock`, `FileText`, `AlertCircle`).
 * - Wrapped in `React.memo` to eliminate re-rendering overhead across large post feeds.
 *
 * @param props - Status string and optional className overrides.
 * @returns A styled status badge element with icon and label.
 *
 * @example
 * ```tsx
 * <StatusBadge status="published" />
 * ```
 */
export const StatusBadge = React.memo(function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  const raw = status.toLowerCase();
  const isPublished = raw === 'published' || raw === 'success';
  const isFailed = raw === 'error' || raw === 'failed';
  const isDraft = raw === 'draft';

  const tone = isPublished
    ? 'bg-green-tint text-green border-green/20'
    : isFailed
    ? 'bg-red-tint text-red border-red/20'
    : isDraft
    ? 'bg-inset text-ink-2 border-line'
    : 'bg-[#e0f2fe] text-[#0369a1] dark:bg-[#082f49] dark:text-[#7dd3fc] border-[#bae6fd] dark:border-[#0369a1]';

  const label = isPublished ? 'published' : isFailed ? 'failed' : isDraft ? 'draft' : 'scheduled';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-[11px] font-semibold border capitalize',
        tone,
        className
      )}
    >
      {label === 'scheduled' ? (
        <Clock className="size-3 shrink-0" />
      ) : label === 'published' ? (
        <CheckCircle2 className="size-3 shrink-0" />
      ) : label === 'draft' ? (
        <FileText className="size-3 shrink-0" />
      ) : (
        <AlertCircle className="size-3 shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
});

export default StatusBadge;
