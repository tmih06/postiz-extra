import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, Send, FileText, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/atoms/status-pill';

/**
 * Props configuring the human-in-the-loop publication approval card.
 */
export interface ApprovalCardProps {
  /** Header title describing the action or batch under review (defaults to `'Approve publication batch'`). */
  title?: string;
  /** Descriptive copy summarizing channel variants, post counts, or payload info. */
  summary?: string;
  /** List of available destination account/channel display labels. */
  channels?: string[];
  /** Human-readable optimal schedule timestamp displayed in helper texts and summary states. */
  suggestedTime?: string;
  /** Callback invoked when the user confirms publication with the chosen timing strategy (`'schedule'`, `'now'`, or `'draft'`). */
  onApprove?: (action: 'schedule' | 'now' | 'draft') => void;
  /** Callback invoked when the user dismisses the approval card. */
  onReject?: () => void;
  /** Optional extra CSS classes applied to the root card container. */
  className?: string;
}

/**
 * Interactive human-in-the-loop review card for AI-generated or queued publication batches.
 *
 * Allows operators to inspect target destination channels, toggle individual platform
 * selections, choose between timing actions (next optimal schedule slot, immediate broadcast,
 * or draft save), and approve or dismiss the batch. Maintains internal review stage state
 * (`'review'`, `'approved'`, or `'rejected'`) and presents feedback banners upon terminal action.
 *
 * @param props Configuration options, initial channels, and approval/rejection event callbacks.
 * @returns An interactive approval panel with destination checkboxes, timing buttons, and confirmation triggers.
 */
export function ApprovalCard({
  title = 'Approve publication batch',
  summary = '3 tailored posts ready to schedule across Twitter/X, LinkedIn, and Threads.',
  channels = ['Twitter / X (@postizapp)', 'LinkedIn (Postiz Official)', 'Threads (@postiz)'],
  suggestedTime = 'Thu, Sep 10 · 14:30 UTC (Optimal engagement slot)',
  onApprove,
  onReject,
  className = '',
}: ApprovalCardProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(channels);
  const [stage, setStage] = useState<'review' | 'approved' | 'rejected'>('review');
  const [selectedTiming, setSelectedTiming] = useState<'schedule' | 'now' | 'draft'>('schedule');

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleConfirm = () => {
    setStage('approved');
    onApprove?.(selectedTiming);
  };

  const handleCancel = () => {
    setStage('rejected');
    onReject?.();
  };

  if (stage === 'approved') {
    return (
      <div
        className={cn(
          'w-full max-w-xl rounded-card border border-green/30 bg-green-tint/40 p-4 shadow-card',
          className
        )}
        style={{ animation: 'fade-up 300ms cubic-bezier(0.23,1,0.32,1) both' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-green text-white">
            <Check className="size-4" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-ink">Publication approved</h4>
            <p className="text-[12px] text-ink-2 mt-0.5">
              Queued {selectedChannels.length} channels for {suggestedTime}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'rejected') {
    return (
      <div
        className={cn(
          'w-full max-w-xl rounded-card border border-line bg-surface p-4 shadow-card opacity-70',
          className
        )}
      >
        <p className="text-[13px] text-ink-2">Publication batch dismissed.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full max-w-xl rounded-card border border-line bg-surface p-4 shadow-card',
        className
      )}
      style={{ animation: 'fade-up 350ms cubic-bezier(0.23,1,0.32,1) both' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
            Human-in-the-loop review
          </span>
          <h3 className="text-[15px] font-bold text-ink mt-0.5">{title}</h3>
          <p className="text-[13px] text-ink-2 mt-1">{summary}</p>
        </div>
        <StatusPill tone="accent" dot={true}>
          Requires approval
        </StatusPill>
      </div>

      <div className="space-y-3 my-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 block mb-1.5">
            Target Destinations ({selectedChannels.length}/{channels.length})
          </label>
          <div className="flex flex-col gap-1.5">
            {channels.map((ch) => {
              const checked = selectedChannels.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    'flex items-center justify-between rounded-control border px-3 py-2 text-left transition-colors',
                    checked
                      ? 'border-line-strong bg-hover/80 text-ink'
                      : 'border-line/60 bg-page/40 text-ink-3'
                  )}
                >
                  <span className="text-[13px] font-medium">{ch}</span>
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                      checked
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-line-strong bg-surface'
                    )}
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 block mb-1.5">
            Publishing Timing
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTiming('schedule')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-control border p-2 text-center transition-all',
                selectedTiming === 'schedule'
                  ? 'border-accent bg-accent-tint/30 text-ink font-semibold'
                  : 'border-line bg-page text-ink-2 hover:bg-hover'
              )}
            >
              <Clock className="size-4 text-accent" />
              <span className="text-[12px]">Next optimal</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTiming('now')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-control border p-2 text-center transition-all',
                selectedTiming === 'now'
                  ? 'border-accent bg-accent-tint/30 text-ink font-semibold'
                  : 'border-line bg-page text-ink-2 hover:bg-hover'
              )}
            >
              <Send className="size-4 text-accent" />
              <span className="text-[12px]">Publish now</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTiming('draft')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-control border p-2 text-center transition-all',
                selectedTiming === 'draft'
                  ? 'border-accent bg-accent-tint/30 text-ink font-semibold'
                  : 'border-line bg-page text-ink-2 hover:bg-hover'
              )}
            >
              <FileText className="size-4 text-accent" />
              <span className="text-[12px]">Save drafts</span>
            </button>
          </div>
          <p className="mt-1.5 text-[11px] font-mono text-ink-3">{suggestedTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line-soft pt-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-control px-3 py-1.5 text-[13px] font-medium text-ink-3 hover:bg-hover hover:text-ink transition-colors"
        >
          Dismiss
        </button>
        <button
          type="button"
          disabled={selectedChannels.length === 0}
          onClick={handleConfirm}
          className="flex items-center gap-1.5 rounded-control bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background shadow-btn hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <span>Confirm & Proceed</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default ApprovalCard;
