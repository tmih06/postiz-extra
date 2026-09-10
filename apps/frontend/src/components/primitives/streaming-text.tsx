import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Configuration options for the {@link StreamingText} component.
 */
export interface StreamingTextProps {
  /** Full message text to display incrementally word-by-word. */
  text?: string;
  /** Interval in milliseconds between appending each subsequent word (default: 32ms). */
  speed?: number; // ms per word
  /** Semantic ink color theme applied to the text container. */
  tone?: 'ink' | 'ink-2' | 'accent';
  /** Callback fired once the full text has finished streaming. */
  onDone?: () => void;
  /** Optional CSS class overrides for the container. */
  className?: string;
}

const DEFAULT_POSTIZ_MESSAGE =
  "I've analyzed your connected social channels (Twitter/X, LinkedIn, and Instagram). Based on past publication performance, Thursdays at 14:30 UTC generate 38% higher engagement. I've drafted 3 tailored variants with optimal hashtag distribution and media dimensions ready for your review.";

/**
 * Renders text with a simulated real-time typewriter / token streaming effect.
 *
 * Splits the provided string by whitespace into words and renders them incrementally using a
 * self-advancing `setTimeout` timer loop. Appends a blinking terminal-style caret while actively streaming.
 * When all words have been revealed, streaming stops and `onDone` is invoked once.
 *
 * @example
 * ```tsx
 * <StreamingText
 *   text="Generating scheduled social campaign draft..."
 *   speed={40}
 *   tone="ink"
 *   onDone={() => setGenerationDone(true)}
 * />
 * ```
 *
 * @param props - Component props configuring text payload, speed, tone, and completion callback.
 * @returns An inline text block with incremental word rendering and active streaming caret.
 */
export function StreamingText({
  text = DEFAULT_POSTIZ_MESSAGE,
  speed = 32,
  tone = 'ink',
  onDone,
  className = '',
}: StreamingTextProps) {
  const words = text.split(' ');
  const [n, setN] = useState(0);
  const streaming = n < words.length;

  useEffect(() => {
    if (!streaming) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setN((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [n, streaming, speed, onDone]);

  const toneClass =
    tone === 'ink' ? 'text-ink' : tone === 'ink-2' ? 'text-ink-2' : 'text-accent-ink';

  return (
    <div className={cn('text-[14px] leading-[1.65]', toneClass, className)}>
      {words.slice(0, n).map((word, i) => (
        <span key={i} className="inline">
          {word}{' '}
        </span>
      ))}
      {streaming && <span className="stream-caret is-streaming" />}
    </div>
  );
}

export default StreamingText;
