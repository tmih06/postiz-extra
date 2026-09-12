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
  return (
    group.status ||
    primaryPost?.status ||
    group.type ||
    ''
  ).toLowerCase();
}

/**
 * Converts a Date object or ISO timestamp string into a local 'YYYY-MM-DD' calendar key.
 *
 * Uses the local browser timezone rather than UTC string slicing to ensure consistent day grouping
 * and cell highlighting across positive and negative UTC offset regions.
 *
 * @param d - Date object or ISO timestamp string.
 * @returns Formatted date key in local calendar time (e.g. '2026-09-11'), or empty string on invalid date.
 *
 * @example
 * ```ts
 * toLocalDateKey(new Date(2026, 8, 11)) // '2026-09-11'
 * ```
 */
export function toLocalDateKey(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Returns performance analytics metrics structure for a post group.
 *
 * Fulfills Issue #7 requirements by reporting truthful unavailable state (`null` values)
 * rather than fabricating pseudo-random engagement numbers in list and calendar presentations.
 *
 * @param _group - Post group object to query metrics for.
 * @returns Performance analytics object with null metrics representing unavailable remote telemetry.
 */
export function getPostAnalytics(_group: PostGroup): PostAnalyticsMetrics {
  return {
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    clicks: null,
    views: null,
    impressions: null,
    reach: null,
  };
}
/**
 * Formats numeric metrics into compact, human-readable strings (e.g. 1.2K, 3.4M), or '—' if unavailable.
 *
 * Handles null/undefined values and unpublished posts truthfully by returning an em-dash placeholder.
 *
 * @param val - Optional numeric metric value, or null if telemetry is unavailable.
 * @param isPublished - Whether the post is published (returns '—' if false).
 * @returns Formatted metric string or dash indicator.
 *
 * @example
 * ```ts
 * formatMetricNumber(1250, true)  // '1.3K'
 * formatMetricNumber(null, true)  // '—'
 * formatMetricNumber(500, false)  // '—'
 * ```
 */
export function formatMetricNumber(
  val: number | null | undefined,
  isPublished: boolean
): string {
  if (!isPublished || val === null || val === undefined) return '—';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

/**
 * Filters and sorts raw post collection based on status, selected platforms, profile, search query,
 * date, and metrics.
 *
 * @param posts - Complete list of post groups.
 * @param filters - Active filter and sort criteria. An empty platform array means all platforms;
 * multiple selected platforms are OR-matched.
 * @returns Filtered and sorted post groups array.
 */
export function filterAndSortPosts(
  posts: PostGroup[],
  filters: FilterCriteria
): PostGroup[] {
  let list = [...posts];

  if (filters.statusFilter !== 'all') {
    list = list.filter((g) => {
      const raw = normalizePostStatus(g);
      if (filters.statusFilter === 'published')
        return raw === 'published' || raw === 'success';
      if (filters.statusFilter === 'scheduled')
        return raw === 'scheduled' || g.type === 'schedule';
      if (filters.statusFilter === 'draft')
        return raw === 'draft' || g.type === 'draft';
      return true;
    });
  }

  if (filters.platformFilter.length > 0) {
    const platformTargets = new Set(
      filters.platformFilter.map((platform) => platform.toLowerCase())
    );
    list = list.filter((g) =>
      g.posts?.some((p) => {
        const provider = p.integration?.providerIdentifier?.toLowerCase();
        return provider ? platformTargets.has(provider) : false;
      })
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
    const todayStr = toLocalDateKey(new Date());
    list = list.filter((g) => toLocalDateKey(g.date) === todayStr);
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

    if (filters.sortKey === 'date-asc') return timeA - timeB;
    return timeB - timeA;
  });

  return list;
}
