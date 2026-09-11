import type { PostGroup } from '@/api/types';
import type { PostAnalyticsMetrics, FilterCriteria } from './types';

/**
 * Normalizes the lifecycle status of a post group consistently across all views and dialogs.
 *
 * Checks `group.status`, falls back to child post status (`posts[0]?.status`), and finally
 * checks `group.type` (e.g. 'now', 'schedule', 'draft').
 *
 * @param group - The post group to inspect.
 * @returns Lowercase normalized status string (e.g. 'published', 'scheduled', 'draft', 'failed').
 */
export function normalizePostStatus(group: PostGroup): string {
  const primaryPost = group.posts?.[0];
  return (group.status || primaryPost?.status || group.type || '').toLowerCase();
}

/**
 * Derives stable pseudo-deterministic analytics metrics for published posts.
 *
 * Invariant: Posts with status draft or scheduled return zeroed metrics with non-published indicators,
 * while published posts return consistent, proportional metrics derived from the post identifier.
 *
 * @param group - Post group object to calculate metrics for.
 * @returns Complete 8-metric analytics object.
 */
export function getPostAnalytics(group: PostGroup): PostAnalyticsMetrics {
  const rawStatus = normalizePostStatus(group);
  const isPublished = rawStatus === 'published' || rawStatus === 'success' || group.type === 'now';

  if (!isPublished) {
    return {
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      views: 0,
      impressions: 0,
      reach: 0,
    };
  }

  // Stable pseudo-random seed based on group id for realistic cross-session consistency
  const seedStr = group.group || group.id || 'seed';
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  const likes = 24 + (posHash % 340);
  const comments = Math.floor(likes * (0.08 + ((posHash % 10) / 100)));
  const shares = Math.floor(likes * (0.04 + ((posHash % 6) / 100)));
  const saves = Math.floor(likes * (0.12 + ((posHash % 14) / 100)));
  const clicks = Math.floor(likes * 1.8 + (posHash % 50));
  const views = likes * 8 + (posHash % 800) + 120;
  const impressions = Math.floor(views * 1.35);
  const reach = Math.floor(impressions * 0.88);

  return {
    likes,
    comments,
    shares,
    saves,
    clicks,
    views,
    impressions,
    reach,
  };
}

/**
 * Formats numeric metrics into compact, human-readable strings (e.g. 1.2K, 3.4M).
 *
 * @param val - Numeric metric value.
 * @param isPublished - Whether the post is published (returns '—' if false).
 * @returns Formatted metric string or dash indicator.
 */
export function formatMetricNumber(val: number, isPublished: boolean): string {
  if (!isPublished) return '—';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

/**
 * Filters and sorts raw post collection based on status, platform, profile, search query, date, and metrics.
 *
 * @param posts - Complete list of post groups.
 * @param filters - Active filter and sort criteria.
 * @returns Filtered and sorted post groups array.
 */
export function filterAndSortPosts(posts: PostGroup[], filters: FilterCriteria): PostGroup[] {
  let list = [...posts];

  if (filters.statusFilter !== 'all') {
    list = list.filter((g) => {
      const raw = normalizePostStatus(g);
      if (filters.statusFilter === 'published') return raw === 'published' || raw === 'success';
      if (filters.statusFilter === 'scheduled') return raw === 'scheduled' || g.type === 'schedule';
      if (filters.statusFilter === 'draft') return raw === 'draft' || g.type === 'draft';
      if (filters.statusFilter === 'failed') return raw === 'failed' || raw === 'error';
      return true;
    });
  }

  if (filters.platformFilter !== 'all') {
    const pTarget = filters.platformFilter.toLowerCase();
    list = list.filter((g) =>
      g.posts?.some((p) => p.integration?.providerIdentifier?.toLowerCase() === pTarget)
    );
  }

  if (filters.profileFilter !== 'all') {
    list = list.filter((g) =>
      g.posts?.some((p) => p.integration?.customerId === filters.profileFilter)
    );
  }

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter((g) => {
      const content = g.posts?.[0]?.content?.[0]?.content?.toLowerCase() || '';
      const idStr = (g.group || g.id || '').toLowerCase();
      return content.includes(q) || idStr.includes(q);
    });
  }

  if (filters.dateFilter === 'today') {
    const todayStr = new Date().toISOString().slice(0, 10);
    list = list.filter((g) => g.date.slice(0, 10) === todayStr);
  } else if (filters.dateFilter === 'next7') {
    const now = Date.now();
    const in7 = now + 7 * 24 * 60 * 60 * 1000;
    list = list.filter((g) => {
      const t = new Date(g.date).getTime();
      return t >= now && t <= in7;
    });
  } else if (filters.dateFilter === 'past30') {
    const now = Date.now();
    const past30 = now - 30 * 24 * 60 * 60 * 1000;
    list = list.filter((g) => {
      const t = new Date(g.date).getTime();
      return t >= past30 && t <= now;
    });
  }

  list.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();

    if (filters.sortKey === 'date-desc') return timeB - timeA;
    if (filters.sortKey === 'date-asc') return timeA - timeB;

    const anaA = getPostAnalytics(a);
    const anaB = getPostAnalytics(b);

    if (filters.sortKey === 'likes-desc') return anaB.likes - anaA.likes;
    if (filters.sortKey === 'comments-desc') return anaB.comments - anaA.comments;
    if (filters.sortKey === 'shares-desc') return anaB.shares - anaA.shares;
    if (filters.sortKey === 'saves-desc') return anaB.saves - anaA.saves;
    if (filters.sortKey === 'clicks-desc') return anaB.clicks - anaA.clicks;
    if (filters.sortKey === 'views-desc') return anaB.views - anaA.views;
    if (filters.sortKey === 'impressions-desc') return anaB.impressions - anaA.impressions;
    if (filters.sortKey === 'reach-desc') return anaB.reach - anaA.reach;

    return timeB - timeA;
  });

  return list;
}

/**
 * Generates sample seed posts across different lifecycle states and platforms.
 *
 * @returns Array of 8 sample post groups.
 */
export function createDefaultSeedPosts(): PostGroup[] {
  const baseDate = new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  return [
    {
      id: 'seed-group-1',
      group: 'seed-group-1',
      date: new Date(year, month, 2, 14, 30).toISOString(),
      type: 'now',
      status: 'published',
      posts: [
        {
          id: 'seed-p1',
          content: [
            {
              content: '🚀 Excited to announce our Q3 performance analytics dashboard is live! Check out the real-time engagement breakdowns.',
              image: [{ id: 'img-1', path: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60' }],
            },
          ],
          integration: {
            id: 'int-x',
            name: 'Corporate X',
            providerIdentifier: 'x',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
        {
          id: 'seed-p1-li',
          content: [
            {
              content: '🚀 Excited to announce our Q3 performance analytics dashboard is live!',
            },
          ],
          integration: {
            id: 'int-li',
            name: 'Corporate LinkedIn',
            providerIdentifier: 'linkedin',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-2',
      group: 'seed-group-2',
      date: new Date(year, month, 5, 10, 0).toISOString(),
      type: 'schedule',
      status: 'scheduled',
      posts: [
        {
          id: 'seed-p2',
          content: [
            {
              content: 'Behind the scenes: How our creative team produces 4K short-form videos in under 2 hours. Drop a comment for our workflow guide! 🎬',
              image: [{ id: 'img-2', path: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=60' }],
            },
          ],
          integration: {
            id: 'int-ig',
            name: 'Acme Visuals',
            providerIdentifier: 'instagram',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-3',
      group: 'seed-group-3',
      date: new Date(year, month, 8, 16, 45).toISOString(),
      type: 'schedule',
      status: 'scheduled',
      posts: [
        {
          id: 'seed-p3',
          content: [
            {
              content: '3 non-obvious ways to double your video retention: 1) First 2 seconds hook, 2) Dynamic sound design, 3) Color pacing. Which do you focus on?',
            },
          ],
          integration: {
            id: 'int-yt',
            name: 'Studio Channel',
            providerIdentifier: 'youtube',
            type: 'video',
            disabled: false,
            customer: { id: 'c2', name: 'Beta Studio', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-4',
      group: 'seed-group-4',
      date: new Date(year, month, 12, 11, 15).toISOString(),
      type: 'draft',
      status: 'draft',
      posts: [
        {
          id: 'seed-p4',
          content: [
            {
              content: '[DRAFT] Product update notes: Multi-account destination management and quick platform connection directory.',
            },
          ],
          integration: {
            id: 'int-x',
            name: 'Corporate X',
            providerIdentifier: 'x',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-5',
      group: 'seed-group-5',
      date: new Date(year, month, 15, 9, 30).toISOString(),
      type: 'now',
      status: 'published',
      posts: [
        {
          id: 'seed-p5',
          content: [
            {
              content: 'Community spotlight: Exploring how top creators automate their distribution without losing brand voice.',
              image: [{ id: 'img-5', path: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60' }],
            },
          ],
          integration: {
            id: 'int-tk',
            name: 'Viral TikTok',
            providerIdentifier: 'tiktok',
            type: 'video',
            disabled: false,
            customer: { id: 'c2', name: 'Beta Studio', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-6',
      group: 'seed-group-6',
      date: new Date(year, month, 19, 13, 0).toISOString(),
      type: 'schedule',
      status: 'scheduled',
      posts: [
        {
          id: 'seed-p6',
          content: [
            {
              content: 'Weekly insights: Tuesday at 10am EST continues to be the highest reach window across LinkedIn and X.',
            },
          ],
          integration: {
            id: 'int-li',
            name: 'Corporate LinkedIn',
            providerIdentifier: 'linkedin',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-7',
      group: 'seed-group-7',
      date: new Date(year, month, 24, 15, 0).toISOString(),
      type: 'now',
      status: 'error',
      posts: [
        {
          id: 'seed-p7',
          content: [
            {
              content: 'Special promo broadcast: Early access pass for creators.',
            },
          ],
          integration: {
            id: 'int-fb',
            name: 'Brand Facebook',
            providerIdentifier: 'facebook',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
      ],
    },
    {
      id: 'seed-group-8',
      group: 'seed-group-8',
      date: new Date(year, month, 28, 18, 30).toISOString(),
      type: 'now',
      status: 'published',
      posts: [
        {
          id: 'seed-p8',
          content: [
            {
              content: 'End of month retrospective: 140+ campaigns published, 850k impressions generated across all channels. Thank you for building with us!',
              image: [{ id: 'img-8', path: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60' }],
            },
          ],
          integration: {
            id: 'int-x',
            name: 'Corporate X',
            providerIdentifier: 'x',
            type: 'social',
            disabled: false,
            customer: { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
          },
        },
      ],
    },
  ];
}
