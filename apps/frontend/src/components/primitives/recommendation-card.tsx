import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/atoms/status-pill';

/**
 * Data structure representing a single actionable AI recommendation option.
 */
export type RecommendationOption = {
  /** Unique identifier for the recommendation choice. */
  key: string;
  /** Short summary line of the recommendation headline. */
  short: string;
  /** Extended rationale or impact explanation displayed when the item is active. */
  detail: string;
  /** Visual confidence / impact signal strength on a 1-3 scale. */
  signal: 1 | 2 | 3;
  /** Badge label accompanying the tone status pill (e.g. `'High impact'`, `'Recommended'`). */
  label: string;
  /** Semantic tone theme for the status pill indicator. */
  tone?: 'green' | 'orange' | 'red' | 'accent' | 'neutral';
};

const SIGNAL_DOT_KEYS = ['dot-1', 'dot-2', 'dot-3'];

/**
 * Props configuring the interactive `RecommendationCard` container.
 */
export interface RecommendationCardProps {
  /** Header title text for the recommendation card (defaults to `'AI Publishing Recommendations'`). */
  title?: string;
  /** Selectable recommendation choices with impact signals and descriptions. */
  options?: RecommendationOption[];
  /** Callback invoked with the currently selected option when the user clicks 'Apply Recommendation'. */
  onAccept?: (option: RecommendationOption) => void;
  /** Optional extra CSS classes applied to the root card container. */
  className?: string;
}

const DEFAULT_OPTIONS: RecommendationOption[] = [
  {
    key: 'timing',
    short: 'Shift schedule to 14:30 UTC',
    detail: 'Audience activity peaks around 14:30 UTC (+38% projected impressions on X and LinkedIn).',
    signal: 3,
    label: 'High impact',
    tone: 'green',
  },
  {
    key: 'media',
    short: 'Attach 16:9 infographic asset',
    detail: 'Posts with landscape media attachments receive 2.4x higher repost rates.',
    signal: 2,
    label: 'Recommended',
    tone: 'accent',
  },
  {
    key: 'hashtags',
    short: 'Trim hashtags to top 2 relevant tags',
    detail: 'Algorithms currently penalize posts with more than 3 hashtags.',
    signal: 1,
    label: 'Fine-tuning',
    tone: 'orange',
  },
];

/**
 * Card primitive displaying prioritized AI optimization recommendations.
 *
 * Renders a list of actionable optimization recommendations with 1-3 dot signal strength
 * meters, expandable detailed explanations for the selected item, and a single-click
 * confirmation flow. Once accepted, transitions into a persistent success confirmation pill.
 *
 * @param props Configuration options, selectable recommendation items, and acceptance handler.
 * @returns An interactive recommendation selector card.
 */
export function RecommendationCard({
  title = 'AI Publishing Recommendations',
  options = DEFAULT_OPTIONS,
  onAccept,
  className = '',
}: RecommendationCardProps) {
  const [selectedKey, setSelectedKey] = useState(options[0]?.key);
  const [accepted, setAccepted] = useState(false);

  const currentOption = options.find((o) => o.key === selectedKey) || options[0];

  const handleAccept = () => {
    if (currentOption) {
      setAccepted(true);
      onAccept?.(currentOption);
    }
  };

  if (accepted) {
    return (
      <div
        className={cn(
          'w-full max-w-xl rounded-card border border-green/30 bg-green-tint/40 p-3.5 shadow-card',
          className
        )}
      >
        <div className="flex items-center gap-2 text-green">
          <Check className="size-4" />
          <span className="text-[13px] font-semibold">Recommendation applied: {currentOption?.short}</span>
        </div>
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h4 className="text-[14px] font-semibold text-ink">{title}</h4>
        </div>
        {currentOption && (
          <StatusPill tone={currentOption.tone} dot={true}>
            {currentOption.label}
          </StatusPill>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        {options.map((opt) => {
          const isSelected = opt.key === selectedKey;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedKey(opt.key)}
              className={cn(
                'flex items-center justify-between rounded-control border p-2.5 text-left transition-all',
                isSelected
                  ? 'border-line-strong bg-hover/80 text-ink shadow-hairline'
                  : 'border-line/60 bg-page/50 text-ink-2 hover:bg-hover/40'
              )}
            >
              <div>
                <span className="text-[13px] font-medium block">{opt.short}</span>
                {isSelected && (
                  <span className="text-[12px] text-ink-3 mt-1 block leading-normal">
                    {opt.detail}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {SIGNAL_DOT_KEYS.map((dotKey, i) => (
                  <span
                    key={dotKey}
                    className={cn(
                      'size-1.5 rounded-full',
                      i < opt.signal ? 'bg-accent' : 'bg-line-strong'
                    )}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 border-t border-line-soft pt-3">
        <button
          type="button"
          onClick={handleAccept}
          className="flex items-center gap-1.5 rounded-control bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background shadow-btn hover:opacity-90 transition-opacity"
        >
          <span>Apply Recommendation</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default RecommendationCard;
