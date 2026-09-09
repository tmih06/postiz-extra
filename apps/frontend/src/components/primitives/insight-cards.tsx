import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Eye, Heart, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export type InsightCardData = {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  points: number[];
  icon: 'impressions' | 'engagement' | 'followers' | 'scheduled';
  summary: string;
};

export interface InsightCardsProps {
  cards?: InsightCardData[];
  className?: string;
}

const DEFAULT_CARDS: InsightCardData[] = [
  {
    id: 'impressions',
    label: 'Total Impressions',
    value: '148,290',
    change: '+24.6%',
    isPositive: true,
    points: [28, 35, 32, 45, 52, 60, 58, 75, 84, 92],
    icon: 'impressions',
    summary: 'Strong reach spikes on LinkedIn and X following Thursday video releases.',
  },
  {
    id: 'engagement',
    label: 'Avg Engagement Rate',
    value: '4.82%',
    change: '+1.14%',
    isPositive: true,
    points: [3.1, 3.4, 3.2, 4.0, 3.8, 4.2, 4.5, 4.4, 4.8],
    icon: 'engagement',
    summary: 'Threads conversations and X poll responses driving up interactions.',
  },
  {
    id: 'followers',
    label: 'Net Audience Growth',
    value: '+3,412',
    change: '+18.2%',
    isPositive: true,
    points: [120, 180, 210, 290, 350, 420, 480, 540],
    icon: 'followers',
    summary: 'Cross-platform attribution shows highest conversion from tech carousels.',
  },
  {
    id: 'scheduled',
    label: 'Queue Health',
    value: '18 posts',
    change: 'On schedule',
    isPositive: true,
    points: [12, 14, 15, 12, 16, 18, 18],
    icon: 'scheduled',
    summary: 'Calendar is fully buffered for the next 8 days across all connected brands.',
  },
];

const ICONS = {
  impressions: Eye,
  engagement: Heart,
  followers: Users,
  scheduled: Calendar,
};

function Sparkline({ points, isPositive }: { points: number[]; isPositive: boolean }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 120;
  const height = 36;

  const svgPoints = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? 'var(--green)' : 'var(--red)';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
}

export function InsightCards({
  cards = DEFAULT_CARDS,
  className = '',
}: InsightCardsProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((i) => (i === 0 ? cards.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === cards.length - 1 ? 0 : i + 1));

  const card = cards[activeIdx];
  const Icon = ICONS[card.icon];

  return (
    <div
      className={cn(
        'w-full max-w-xl rounded-card border border-line bg-surface p-4 shadow-card',
        className
      )}
      style={{ animation: 'fade-up 350ms cubic-bezier(0.23,1,0.32,1) both' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          <span>Insights</span>
          <span className="font-mono text-ink-2">{activeIdx + 1}/{cards.length}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            className="flex size-6 items-center justify-center rounded-[6px] border border-line bg-page text-ink-2 hover:bg-hover hover:text-ink transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex size-6 items-center justify-center rounded-[6px] border border-line bg-page text-ink-2 hover:bg-hover hover:text-ink transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex size-7 items-center justify-center rounded-control bg-line/60 text-ink">
              <Icon className="size-4" />
            </div>
            <span className="text-[13px] font-medium text-ink-2">{card.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-ink font-mono">
              {card.value}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                card.isPositive ? 'bg-green-tint text-green' : 'bg-red-tint text-red'
              )}
            >
              {card.isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {card.change}
            </span>
          </div>
        </div>

        <div className="shrink-0 pt-2">
          <Sparkline points={card.points} isPositive={card.isPositive} />
        </div>
      </div>

      <p className="mt-3 border-t border-line-soft pt-2.5 text-[12.5px] leading-relaxed text-ink-2">
        {card.summary}
      </p>
    </div>
  );
}

export default InsightCards;
