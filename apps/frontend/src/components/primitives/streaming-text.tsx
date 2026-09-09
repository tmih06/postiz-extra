import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface StreamingTextProps {
  text?: string;
  speed?: number; // ms per word
  tone?: 'ink' | 'ink-2' | 'accent';
  onDone?: () => void;
  className?: string;
}

const DEFAULT_POSTIZ_MESSAGE =
  "I've analyzed your connected social channels (Twitter/X, LinkedIn, and Instagram). Based on past publication performance, Thursdays at 14:30 UTC generate 38% higher engagement. I've drafted 3 tailored variants with optimal hashtag distribution and media dimensions ready for your review.";

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
