import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, BarChart2, PenTool, Image, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { StatusPill } from '@/components/atoms/status-pill';

export type ToolChipStep = {
  id: string;
  icon: 'analytics' | 'composer' | 'media' | 'schedule';
  label: string;
  chip: string;
  status: 'done' | 'running' | 'pending';
  details?: string[];
};

export interface ToolChipsProps {
  steps?: ToolChipStep[];
  header?: string;
  className?: string;
}

const DEFAULT_STEPS: ToolChipStep[] = [
  {
    id: 'analytics',
    icon: 'analytics',
    label: 'Query channel stats',
    chip: 'x_engagement_30d',
    status: 'done',
    details: [
      'Top reach: Thursday 14:00 UTC (avg 4.2k views)',
      'Optimal copy length: 180-220 characters',
    ],
  },
  {
    id: 'composer',
    icon: 'composer',
    label: 'Draft channel variants',
    chip: '3 platforms (X, LinkedIn, Threads)',
    status: 'done',
    details: [
      '+ Variant X: snappy thread hook with 2 tags',
      '+ Variant LinkedIn: professional narrative with link in comments',
      '+ Variant Threads: casual conversational tone',
    ],
  },
  {
    id: 'media',
    icon: 'media',
    label: 'Format media attachments',
    chip: '16:9 banner preview',
    status: 'done',
    details: ['Verified aspect ratio compatibility across target channels'],
  },
  {
    id: 'schedule',
    icon: 'schedule',
    label: 'Prepare queue slot',
    chip: 'Thu, Sep 10 · 14:30 UTC',
    status: 'done',
    details: ['Slot selected using high-engagement audience window'],
  },
];

const ICONS = {
  analytics: BarChart2,
  composer: PenTool,
  media: Image,
  schedule: Calendar,
};

export function ToolChips({
  steps = DEFAULT_STEPS,
  header = '4 agent tool calls',
  className = '',
}: ToolChipsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={cn(
        'w-full max-w-xl rounded-card border border-line bg-surface/90 p-3 shadow-card',
        className
      )}
      style={{ animation: 'fade-up 400ms cubic-bezier(0.23,1,0.32,1) both' }}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          {header}
        </span>
        <span className="text-[11px] font-mono text-ink-3">
          {steps.filter((s) => s.status === 'done').length}/{steps.length} completed
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {steps.map((step) => {
          const IconComponent = ICONS[step.icon];
          const isExpanded = expandedId === step.id;

          return (
            <div
              key={step.id}
              className="rounded-control border border-line/60 bg-page/50 transition-colors hover:bg-hover/60"
            >
              <button
                type="button"
                onClick={() => toggle(step.id)}
                className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IconComponent className="size-3.5 shrink-0 text-ink-2" />
                  <span className="text-[13px] font-medium text-ink truncate">
                    {step.label}
                  </span>
                  <span className="rounded bg-line/60 px-1.5 py-0.5 font-mono text-[11px] text-ink-2 truncate max-w-[180px]">
                    {step.chip}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {step.status === 'done' ? (
                    <StatusPill tone="green" dot={false} className="h-5 px-1.5 text-[11px]">
                      Done
                    </StatusPill>
                  ) : step.status === 'running' ? (
                    <StatusPill tone="accent" dot={false} className="h-5 px-1.5 text-[11px]">
                      <Loader2 className="size-2.5 animate-spin mr-1" />
                      Running
                    </StatusPill>
                  ) : (
                    <StatusPill tone="neutral" dot={false} className="h-5 px-1.5 text-[11px]">
                      Pending
                    </StatusPill>
                  )}
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-ink-3 transition-transform duration-200',
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                </div>
              </button>

              {isExpanded && step.details && (
                <div className="border-t border-line/40 bg-field/30 px-3 py-2 text-[12px] font-mono text-ink-2">
                  {step.details.map((line, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'leading-relaxed',
                        line.startsWith('+') ? 'text-green font-medium' : 'text-ink-2'
                      )}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ToolChips;
