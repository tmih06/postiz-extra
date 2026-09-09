import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Loader2, Sparkles } from 'lucide-react';

export type ThinkingRow = {
  primary: string;
  secondary?: string;
  mono?: boolean;
  done?: boolean;
};

export interface ThinkingStateProps {
  label?: string;
  doneLabel?: string;
  rows?: ThinkingRow[];
  durationSeconds?: number;
  initiallyOpen?: boolean;
  onDone?: () => void;
  className?: string;
}

const DEFAULT_ROWS: ThinkingRow[] = [
  { primary: 'Analyzing follower activity by channel', secondary: 'X, LinkedIn, Threads' },
  { primary: 'Scanning top engaging posts for peak cadence' },
  { primary: 'Generating platform-tailored hooks & hashtags', mono: true },
  { primary: 'Calculating queue time slots for highest reach' },
];

export function ThinkingState({
  label = 'Thinking',
  doneLabel = 'Thought for 2.8s',
  rows = DEFAULT_ROWS,
  durationSeconds = 2.8,
  initiallyOpen = true,
  onDone,
  className = '',
}: ThinkingStateProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = +(prev + 0.1).toFixed(1);
        if (next >= durationSeconds) {
          setIsComplete(true);
          onDone?.();
          return durationSeconds;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [durationSeconds, isComplete, onDone]);

  useEffect(() => {
    if (isComplete) {
      setCurrentStep(rows.length);
      return;
    }
    const stepInterval = (durationSeconds * 1000) / rows.length;
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, rows.length));
    }, stepInterval);
    return () => clearInterval(interval);
  }, [durationSeconds, isComplete, rows.length]);

  return (
    <div
      className={cn(
        'w-full max-w-xl rounded-card border border-line bg-surface/80 p-3 shadow-card backdrop-blur-sm',
        className
      )}
      style={{ animation: 'fade-up 350ms cubic-bezier(0.23,1,0.32,1) both' }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-ink">
            {isComplete ? (
              <Sparkles className="size-3 text-accent" />
            ) : (
              <Loader2 className="size-3 animate-spin text-accent" />
            )}
          </span>
          <span className="text-[13px] font-semibold text-ink">
            {isComplete ? doneLabel : label}
          </span>
          {!isComplete && (
            <span className="font-mono text-[11px] tabular-nums text-ink-3">
              {elapsed.toFixed(1)}s
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'size-4 text-ink-3 transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line-soft pt-2.5">
          {rows.map((row, idx) => {
            const stepDone = idx < currentStep;
            const isCurrent = idx === currentStep && !isComplete;

            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-[12px] leading-snug"
                style={{ animation: 'fade-in 200ms ease-out both' }}
              >
                <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full">
                  {stepDone ? (
                    <Check className="size-3 text-green" />
                  ) : isCurrent ? (
                    <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  ) : (
                    <span className="size-1 rounded-full bg-ink-3/40" />
                  )}
                </span>
                <span
                  className={cn(
                    'truncate',
                    row.mono && 'font-mono text-[11.5px]',
                    stepDone
                      ? 'text-ink-2'
                      : isCurrent
                      ? 'font-medium text-ink'
                      : 'text-ink-3'
                  )}
                >
                  {row.primary}
                </span>
                {row.secondary && (
                  <span className="ml-auto shrink-0 text-[11px] font-mono text-ink-3">
                    {row.secondary}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThinkingState;
