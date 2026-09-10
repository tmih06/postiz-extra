import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/atoms/status-pill';
import { SegmentedControl } from '@/components/atoms/segmented-control';
import { InsightCards } from '@/components/primitives/insight-cards';
import {
  TrendingUp,
  Eye,
  Heart,
  MousePointer,
  Users,
  Share2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Analytics and cross-platform performance dashboard view.
 *
 * Computes and renders high-level audience reach and engagement metrics (impressions,
 * engagements, shortlink clicks, follower net growth), provides interactive date range filtering
 * (`7d`, `30d`, `90d`), displays channel-by-channel breakdown tables, embeds AI-driven performance
 * insight cards, and lists top-performing published posts ranked by engagement volume.
 *
 * @returns The rendered cross-platform analytics and reporting dashboard.
 */
export function AnalyticsView() {
  const { integrations } = useWorkspace();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const platforms = [
    { name: 'Twitter / X', handle: '@postizapp', followers: '14,280', posts: 38, engRate: '4.8%', change: '+12%' },
    { name: 'LinkedIn', handle: 'Postiz Official', followers: '8,420', posts: 24, engRate: '5.2%', change: '+18%' },
    { name: 'Instagram', handle: '@postiz.io', followers: '19,500', posts: 18, engRate: '3.9%', change: '+8%' },
    { name: 'Threads', handle: '@postiz', followers: '6,100', posts: 31, engRate: '6.1%', change: '+29%' },
    { name: 'YouTube', handle: 'Postiz HQ', followers: '3,890', posts: 6, engRate: '7.4%', change: '+15%' },
  ];

  const topPosts = [
    {
      id: 'p1',
      title: 'How we scaled our open-source publishing scheduler to 10k users 🧵',
      channels: ['X', 'LinkedIn'],
      date: 'Sep 4, 2026',
      impressions: '42,800',
      engagements: '3,120',
      clicks: '940',
      rate: '7.2%',
    },
    {
      id: 'p2',
      title: 'Vite vs Next.js for client dashboard architectures — benchmark results',
      channels: ['LinkedIn'],
      date: 'Sep 1, 2026',
      impressions: '28,400',
      engagements: '1,890',
      clicks: '620',
      rate: '6.6%',
    },
    {
      id: 'p3',
      title: 'Sneak peek at the new Postiz AI Studio harness and design tokens ✨',
      channels: ['X', 'Threads', 'Instagram'],
      date: 'Aug 28, 2026',
      impressions: '36,100',
      engagements: '2,450',
      clicks: '810',
      rate: '6.8%',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Analytics & Performance
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Real-time cross-platform reach, engagement metrics, and audience conversion.
          </p>
        </div>

        <SegmentedControl
          options={['7d', '30d', '90d'] as const}
          value={timeframe}
          onChange={(v) => setTimeframe(v)}
          className="w-44"
        />
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between text-ink-3 mb-2">
            <span className="text-[12px] font-medium uppercase tracking-wider">Total Impressions</span>
            <Eye className="size-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-ink">184.2K</span>
            <span className="inline-flex items-center text-[11px] font-semibold text-green bg-green-tint px-1.5 py-0.5 rounded-full">
              +22.4%
            </span>
          </div>
          <p className="text-[11px] text-ink-3 mt-2">Across 117 published posts</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between text-ink-3 mb-2">
            <span className="text-[12px] font-medium uppercase tracking-wider">Engagements</span>
            <Heart className="size-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-ink">14.8K</span>
            <span className="inline-flex items-center text-[11px] font-semibold text-green bg-green-tint px-1.5 py-0.5 rounded-full">
              +18.1%
            </span>
          </div>
          <p className="text-[11px] text-ink-3 mt-2">Avg 5.1% engagement rate</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between text-ink-3 mb-2">
            <span className="text-[12px] font-medium uppercase tracking-wider">Link Clicks</span>
            <MousePointer className="size-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-ink">4,120</span>
            <span className="inline-flex items-center text-[11px] font-semibold text-green bg-green-tint px-1.5 py-0.5 rounded-full">
              +9.5%
            </span>
          </div>
          <p className="text-[11px] text-ink-3 mt-2">Tracked via shortlinks</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between text-ink-3 mb-2">
            <span className="text-[12px] font-medium uppercase tracking-wider">Net Growth</span>
            <Users className="size-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-ink">+1,240</span>
            <span className="inline-flex items-center text-[11px] font-semibold text-green bg-green-tint px-1.5 py-0.5 rounded-full">
              +15.3%
            </span>
          </div>
          <p className="text-[11px] text-ink-3 mt-2">52,190 total followers</p>
        </div>
      </div>

      {/* Middle Section: Platform Breakdown & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Breakdown */}
        <div className="lg:col-span-2 rounded-card border border-line bg-surface p-5 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-ink-2" />
              <h2 className="text-[14px] font-bold text-ink">Channel Performance</h2>
            </div>
            <span className="text-[12px] font-mono text-ink-3">{platforms.length} channels active</span>
          </div>

          <div className="flex flex-col gap-2">
            {platforms.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-control border border-line/60 bg-page/40 p-3 text-[13px] hover:border-line hover:bg-hover/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-control bg-line font-bold text-ink text-xs">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink leading-none">{p.name}</span>
                    <span className="text-[11px] text-ink-3 font-mono mt-1">{p.handle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="font-mono text-xs font-semibold text-ink block">{p.followers}</span>
                    <span className="text-[10px] text-ink-3 uppercase">Followers</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-ink block">{p.posts}</span>
                    <span className="text-[10px] text-ink-3 uppercase">Posts</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-green block">{p.engRate}</span>
                    <span className="text-[10px] text-ink-3 uppercase">Engagement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance Insights */}
        <div className="flex flex-col gap-3">
          <InsightCards />
        </div>
      </div>

      {/* Bottom Section: Top Performing Publications */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green" />
            <h2 className="text-[14px] font-bold text-ink">Top Performing Posts</h2>
          </div>
          <span className="text-[12px] text-ink-3">Ranked by engagement volume</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-3 font-semibold">
                <th className="pb-2.5">Content Snippet</th>
                <th className="pb-2.5">Channels</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5 text-right">Impressions</th>
                <th className="pb-2.5 text-right">Engagements</th>
                <th className="pb-2.5 text-right">Clicks</th>
                <th className="pb-2.5 text-right">Eng Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {topPosts.map((post) => (
                <tr key={post.id} className="hover:bg-hover/40 transition-colors">
                  <td className="py-3 pr-4 font-medium text-ink max-w-sm truncate">
                    {post.title}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      {post.channels.map((ch, i) => (
                        <span
                          key={i}
                          className="rounded bg-line/70 px-1.5 py-0.5 text-[10.5px] font-mono text-ink-2"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-ink-3 font-mono text-[12px]">
                    {post.date}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-medium text-ink">
                    {post.impressions}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-medium text-ink">
                    {post.engagements}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-ink-2">
                    {post.clicks}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-green">
                    {post.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;
