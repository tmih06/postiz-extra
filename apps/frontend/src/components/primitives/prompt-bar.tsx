import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowUp, AtSign, Command, Paperclip, Calendar, BarChart3, Hash } from 'lucide-react';

export interface PromptBarProps {
  placeholder?: string;
  onSubmit?: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

const QUICK_ACTIONS = [
  { label: 'Weekly plan', prompt: 'Generate a 5-day posting calendar across X and LinkedIn' },
  { label: 'Viral hooks', prompt: 'Give me 5 punchy opening hooks for our product launch' },
  { label: 'Optimize queue', prompt: 'Analyze current scheduled posts and re-order for maximum reach' },
  { label: 'Hashtag audit', prompt: 'Audit hashtag usage across all channels and remove low-performing tags' },
];

export function PromptBar({
  placeholder = 'Ask Postiz AI to plan, draft, or optimize social campaigns…',
  onSubmit,
  disabled = false,
  className = '',
}: PromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || disabled) return;
    onSubmit?.(prompt.trim());
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectQuickAction = (text: string) => {
    setPrompt(text);
    textareaRef.current?.focus();
  };

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => selectQuickAction(action.prompt)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface/80 px-3 py-1 text-[12px] font-medium text-ink-2 hover:bg-hover hover:text-ink transition-colors shadow-hairline"
          >
            <Sparkles className="size-3 text-accent" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-card border border-line bg-surface p-2 shadow-card focus-within:border-line-strong focus-within:shadow-raised transition-all"
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-2 pt-1 text-[14px] text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-50"
        />

        <div className="flex items-center justify-between border-t border-line-soft pt-2 mt-1 px-1">
          <div className="flex items-center gap-1 text-ink-3">
            <button
              type="button"
              onClick={() => setPrompt((p) => p + '@')}
              className="flex items-center gap-1 rounded-control px-2 py-1 text-[12px] font-medium hover:bg-hover hover:text-ink transition-colors"
              title="Tag social channel"
            >
              <AtSign className="size-3.5" />
              <span>Channel</span>
            </button>
            <button
              type="button"
              onClick={() => setPrompt((p) => p + '/schedule ')}
              className="flex items-center gap-1 rounded-control px-2 py-1 text-[12px] font-medium hover:bg-hover hover:text-ink transition-colors"
              title="Schedule command"
            >
              <Calendar className="size-3.5" />
              <span>Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setPrompt((p) => p + '/analytics ')}
              className="flex items-center gap-1 rounded-control px-2 py-1 text-[12px] font-medium hover:bg-hover hover:text-ink transition-colors"
              title="Analytics command"
            >
              <BarChart3 className="size-3.5" />
              <span>Stats</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || disabled}
            className="flex size-7 items-center justify-center rounded-control bg-foreground text-background shadow-btn hover:opacity-90 active:scale-[0.96] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default PromptBar;
